"""Repository model."""

from __future__ import annotations

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from backend.app.models.base import BaseModel


class Repository(BaseModel):
    __tablename__ = "repositories"

    organization_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    provider: Mapped[str] = mapped_column(String(20), nullable=False, default="github")
    provider_repo_id: Mapped[str] = mapped_column(
        String(100), nullable=False, unique=True, index=True
    )
    owner: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    default_branch: Mapped[str] = mapped_column(String(255), nullable=False, default="main")
    visibility: Mapped[str] = mapped_column(String(20), nullable=False, default="private")
    language: Mapped[str | None] = mapped_column(String(100), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    configuration: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON config
