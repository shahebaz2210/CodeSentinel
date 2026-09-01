"""GitHub connection model — stores encrypted OAuth tokens."""

from __future__ import annotations

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from backend.app.models.base import BaseModel


class GitHubConnection(BaseModel):
    __tablename__ = "github_connections"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    provider: Mapped[str] = mapped_column(String(20), nullable=False, default="github")
    provider_user_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    provider_username: Mapped[str] = mapped_column(String(255), nullable=False)
    encrypted_access_token: Mapped[str] = mapped_column(Text, nullable=False)
    scopes: Mapped[str | None] = mapped_column(String(500), nullable=True)
