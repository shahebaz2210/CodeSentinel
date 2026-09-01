"""Security document model — stores OWASP, CWE, CVE knowledge."""

from __future__ import annotations

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from backend.app.models.base import BaseModel


class SecurityDocument(BaseModel):
    __tablename__ = "security_documents"

    source_type: Mapped[str] = mapped_column(
        String(30), nullable=False, index=True
    )  # OWASP, CWE, CVE, GUIDE
    external_id: Mapped[str] = mapped_column(
        String(50), nullable=False, unique=True, index=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    version: Mapped[str | None] = mapped_column(String(20), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    metadata_json: Mapped[str | None] = mapped_column(Text, nullable=True)
