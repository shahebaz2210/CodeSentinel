"""GitHub OAuth Service."""

from __future__ import annotations

import urllib.parse
from typing import Optional, Tuple
import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.config import settings
from backend.app.core.errors import AppError, ErrorCode
from backend.app.core.security import decrypt_value, encrypt_value, generate_secret
from backend.app.models.github_connection import GitHubConnection
from backend.app.models.user import User


class GitHubOAuthService:
    GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize"
    GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
    GITHUB_USER_URL = "https://api.github.com/user"
    GITHUB_EMAILS_URL = "https://api.github.com/user/emails"

    def __init__(self, db: AsyncSession):
        self.db = db

    def build_authorization_url(self, state: Optional[str] = None) -> Tuple[str, str]:
        """Generate GitHub OAuth URL with state param."""
        state_token = state or generate_secret(16)
        params = {
            "client_id": settings.github_client_id,
            "redirect_uri": settings.github_redirect_uri,
            "scope": "read:user user:email repo read:org",
            "state": state_token,
        }
        url = f"{self.GITHUB_AUTH_URL}?{urllib.parse.urlencode(params)}"
        return url, state_token

    async def exchange_code_for_token(self, code: str) -> str:
        """Exchange temporary code for GitHub access token."""
        async with httpx.AsyncClient(timeout=15.0) as client:
            headers = {"Accept": "application/json"}
            data = {
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": code,
                "redirect_uri": settings.github_redirect_uri,
            }
            resp = await client.post(self.GITHUB_TOKEN_URL, headers=headers, data=data)
            if resp.status_code != 200:
                raise AppError(
                    ErrorCode.GITHUB_AUTH_FAILED,
                    f"Failed to exchange code with GitHub: {resp.text}"
                )
            result = resp.json()
            if "error" in result:
                raise AppError(
                    ErrorCode.GITHUB_AUTH_FAILED,
                    f"GitHub error: {result.get('error_description', result['error'])}"
                )
            access_token = result.get("access_token")
            if not access_token:
                raise AppError(ErrorCode.GITHUB_AUTH_FAILED, "No access token in GitHub response")
            return access_token

    async def fetch_github_user(self, access_token: str) -> dict:
        """Fetch authenticated GitHub user profile & primary email."""
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "CodeSentinel-Security-Platform",
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(self.GITHUB_USER_URL, headers=headers)
            if resp.status_code != 200:
                raise AppError(ErrorCode.GITHUB_API_ERROR, "Failed to fetch GitHub profile")
            user_data = resp.json()

            email = user_data.get("email")
            if not email:
                email_resp = await client.get(self.GITHUB_EMAILS_URL, headers=headers)
                if email_resp.status_code == 200:
                    emails = email_resp.json()
                    for e in emails:
                        if e.get("primary") and e.get("verified"):
                            email = e.get("email")
                            break
                    if not email and emails:
                        email = emails[0].get("email")

            if not email:
                email = f"{user_data.get('login')}@users.noreply.github.com"

            user_data["primary_email"] = email
            return user_data

    async def store_github_connection(
        self, user: User, gh_user: dict, access_token: str
    ) -> GitHubConnection:
        """Save or update encrypted GitHub connection."""
        stmt = select(GitHubConnection).where(GitHubConnection.user_id == user.id)
        result = await self.db.execute(stmt)
        conn = result.scalar_one_or_none()

        encrypted_token = encrypt_value(access_token)
        provider_user_id = str(gh_user["id"])
        provider_username = gh_user.get("login", "")

        if conn:
            conn.provider_user_id = provider_user_id
            conn.provider_username = provider_username
            conn.encrypted_access_token = encrypted_token
        else:
            conn = GitHubConnection(
                user_id=user.id,
                provider="github",
                provider_user_id=provider_user_id,
                provider_username=provider_username,
                encrypted_access_token=encrypted_token,
                scopes="read:user,user:email,repo,read:org",
            )
            self.db.add(conn)

        await self.db.flush()
        return conn

    async def get_decrypted_token(self, user_id: str) -> Optional[str]:
        """Retrieve and decrypt GitHub access token for a user."""
        stmt = select(GitHubConnection).where(GitHubConnection.user_id == user_id)
        result = await self.db.execute(stmt)
        conn = result.scalar_one_or_none()
        if not conn:
            return None
        return decrypt_value(conn.encrypted_access_token)
