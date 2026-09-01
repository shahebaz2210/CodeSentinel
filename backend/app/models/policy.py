"""Policy model."""

from __future__ import annotations

from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from backend.app.models.base import BaseModel


class Policy(BaseModel):
    __tablename__ = "policies"

    organization_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    configuration_json: Mapped[str] = mapped_column(
        Text, nullable=False, default="{}"
    )  # JSON: severity_threshold, confidence_threshold, block_secrets, allow_exceptions, require_expiry
