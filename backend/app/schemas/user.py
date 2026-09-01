"""User and Organization schemas."""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    name: str
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserResponse(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrganizationResponse(BaseModel):
    id: str
    name: str
    slug: str
    created_at: datetime
    role: Optional[str] = "DEVELOPER"

    class Config:
        from_attributes = True


class UserMeResponse(BaseModel):
    user: UserResponse
    organizations: List[OrganizationResponse] = []
    github_connected: bool = False
    github_username: Optional[str] = None
