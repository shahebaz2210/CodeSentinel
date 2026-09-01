"""FastAPI Dependency Injection."""

from __future__ import annotations

from typing import Optional
from fastapi import Cookie, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.database import get_db
from backend.app.core.errors import AuthenticationError
from backend.app.core.security import decode_jwt_token
from backend.app.models.user import User
from backend.app.services.auth import AuthService


from sqlalchemy import select
from backend.app.core.config import settings


async def get_current_user_optional(
    session_token: Optional[str] = Cookie(None, alias="session_token"),
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """Retrieve authenticated user if valid JWT present in cookie or bearer header."""
    token: Optional[str] = session_token
    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization[7:].strip()

    if token:
        payload = decode_jwt_token(token)
        if payload and "sub" in payload:
            auth_service = AuthService(db)
            user = await auth_service.get_user_by_id(payload["sub"])
            if user:
                return user

    # In local development / debug mode, fallback to connected GitHub user or seeded user
    if settings.app_debug:
        from backend.app.models.github_connection import GitHubConnection
        conn_stmt = select(GitHubConnection).order_by(GitHubConnection.created_at.desc())
        conn_res = await db.execute(conn_stmt)
        conn = conn_res.scalars().first()
        if conn:
            user_stmt = select(User).where(User.id == conn.user_id)
            user_res = await db.execute(user_stmt)
            connected_user = user_res.scalar_one_or_none()
            if connected_user:
                return connected_user

        result = await db.execute(select(User).order_by(User.created_at.asc()))
        dev_user = result.scalars().first()
        if dev_user:
            return dev_user

    return None


async def get_current_user(
    user: Optional[User] = Depends(get_current_user_optional),
) -> User:
    """Enforce authentication on protected endpoints."""
    if not user:
        raise AuthenticationError("Authentication is required to access this resource.")
    return user
