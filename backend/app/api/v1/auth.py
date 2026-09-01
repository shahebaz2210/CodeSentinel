"""Authentication API routes."""

from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Depends, Query, Response
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.config import settings
from backend.app.core.database import get_db
from backend.app.core.deps import get_current_user, get_current_user_optional
from backend.app.models.user import User
from backend.app.schemas.auth import (
    AuthStatus,
    GitHubOAuthUrlResponse,
)
from backend.app.schemas.common import SuccessResponse
from backend.app.schemas.user import UserMeResponse
from backend.app.services.auth import AuthService
from backend.app.services.github_oauth import GitHubOAuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/status", response_model=AuthStatus)
async def get_auth_status(
    user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
) -> AuthStatus:
    """Check current authentication status."""
    if not user:
        return AuthStatus(authenticated=False)

    gh_oauth = GitHubOAuthService(db)
    token = await gh_oauth.get_decrypted_token(user.id)
    return AuthStatus(
        authenticated=True,
        user_id=user.id,
        email=user.email,
        name=user.name,
        avatar_url=user.avatar_url,
        github_connected=token is not None,
    )


@router.get("/me", response_model=UserMeResponse)
async def get_current_user_profile(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserMeResponse:
    """Get full profile with organizations and GitHub connection status."""
    auth_service = AuthService(db)
    return await auth_service.get_user_me_data(user)


@router.get("/github/url", response_model=GitHubOAuthUrlResponse)
async def get_github_auth_url(
    state: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
) -> GitHubOAuthUrlResponse:
    """Get the GitHub OAuth authorization URL."""
    gh_oauth = GitHubOAuthService(db)
    url, state_token = gh_oauth.build_authorization_url(state)
    return GitHubOAuthUrlResponse(url=url, state=state_token)


@router.get("/github")
async def redirect_to_github(
    state: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
) -> RedirectResponse:
    """Direct redirect to GitHub OAuth authorization page."""
    gh_oauth = GitHubOAuthService(db)
    url, _ = gh_oauth.build_authorization_url(state)
    return RedirectResponse(url=url, status_code=302)


@router.get("/github/callback")
async def github_oauth_callback(
    code: str = Query(...),
    state: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
) -> RedirectResponse:
    """Handle GitHub OAuth callback, create/sync user, and set httpOnly session cookie."""
    gh_oauth = GitHubOAuthService(db)
    auth_service = AuthService(db)

    # 1. Exchange code for access token
    access_token = await gh_oauth.exchange_code_for_token(code)

    # 2. Fetch GitHub user profile
    gh_user = await gh_oauth.fetch_github_user(access_token)

    # 3. Create or update user
    name = gh_user.get("name") or gh_user.get("login") or "GitHub User"
    email = gh_user["primary_email"]
    avatar_url = gh_user.get("avatar_url")
    user = await auth_service.get_or_create_user(email=email, name=name, avatar_url=avatar_url)

    # 4. Store encrypted GitHub connection
    await gh_oauth.store_github_connection(user, gh_user, access_token)

    # 5. Generate session token
    session_token = auth_service.generate_session_token(user)

    # 6. Redirect to frontend with secure session cookie and token param for cross-origin local testing
    redirect_url = f"{settings.frontend_url}/dashboard?token={session_token}"
    response = RedirectResponse(url=redirect_url, status_code=302)
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=settings.jwt_expiration_hours * 3600,
        path="/",
    )
    return response


@router.post("/logout", response_model=SuccessResponse)
async def logout(response: Response) -> SuccessResponse:
    """Clear session cookie and log out."""
    response.delete_cookie(key="session_token", path="/")
    return SuccessResponse(success=True, message="Logged out successfully.")
