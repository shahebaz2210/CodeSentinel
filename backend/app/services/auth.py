"""Authentication Service."""

from __future__ import annotations

from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.security import create_jwt_token
from backend.app.models.user import User
from backend.app.models.organization import Organization
from backend.app.models.organization_member import OrganizationMember
from backend.app.models.github_connection import GitHubConnection
from backend.app.models.audit_log import AuditLog
from backend.app.schemas.user import OrganizationResponse, UserMeResponse, UserResponse


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        stmt = select(User).where(User.id == user_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_user_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_or_create_user(
        self, email: str, name: str, avatar_url: Optional[str] = None
    ) -> User:
        user = await self.get_user_by_email(email)
        if user:
            user.name = name
            if avatar_url:
                user.avatar_url = avatar_url
            await self.db.flush()
            return user

        user = User(email=email, name=name, avatar_url=avatar_url)
        self.db.add(user)
        await self.db.flush()

        # Create default personal organization
        slug = f"{email.split('@')[0].lower()}-org"
        org = Organization(name=f"{name}'s Org", slug=slug)
        self.db.add(org)
        await self.db.flush()

        member = OrganizationMember(
            organization_id=org.id,
            user_id=user.id,
            role="OWNER"
        )
        self.db.add(member)

        # Log audit event
        audit = AuditLog(
            organization_id=org.id,
            actor_id=user.id,
            action="USER_SIGNUP",
            resource_type="user",
            resource_id=user.id,
        )
        self.db.add(audit)
        await self.db.flush()

        return user

    async def get_user_me_data(self, user: User) -> UserMeResponse:
        # Get memberships and organizations
        stmt = (
            select(Organization, OrganizationMember.role)
            .join(OrganizationMember, OrganizationMember.organization_id == Organization.id)
            .where(OrganizationMember.user_id == user.id)
        )
        result = await self.db.execute(stmt)
        rows = result.all()

        org_responses = [
            OrganizationResponse(
                id=org.id,
                name=org.name,
                slug=org.slug,
                created_at=org.created_at,
                role=role,
            )
            for org, role in rows
        ]

        # Check GitHub connection
        gh_stmt = select(GitHubConnection).where(GitHubConnection.user_id == user.id)
        gh_res = await self.db.execute(gh_stmt)
        gh_conn = gh_res.scalar_one_or_none()

        return UserMeResponse(
            user=UserResponse.model_validate(user),
            organizations=org_responses,
            github_connected=gh_conn is not None,
            github_username=gh_conn.provider_username if gh_conn else None,
        )

    def generate_session_token(self, user: User) -> str:
        payload = {
            "sub": user.id,
            "email": user.email,
            "name": user.name,
        }
        return create_jwt_token(payload)
