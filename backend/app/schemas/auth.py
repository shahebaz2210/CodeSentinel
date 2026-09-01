"""Authentication schemas."""

from __future__ import annotations

from typing import Optional
from pydantic import BaseModel


class TokenPayload(BaseModel):
    sub: str  # user_id
    email: Optional[str] = None
    exp: Optional[int] = None
    iat: Optional[int] = None


class AuthStatus(BaseModel):
    authenticated: bool
    user_id: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    github_connected: bool = False


class GitHubOAuthUrlResponse(BaseModel):
    url: str
    state: str


class GitHubCallbackRequest(BaseModel):
    code: str
    state: Optional[str] = None
