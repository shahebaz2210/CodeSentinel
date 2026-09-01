"""Finding occurrence model — tracks same logical issue across scans."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from backend.app.models.base import BaseModel


class FindingOccurrence(BaseModel):
    __tablename__ = "finding_occurrences"

    finding_fingerprint: Mapped[str] = mapped_column(
        String(64), nullable=False, index=True
    )
    scan_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True
    )
    file_path: Mapped[str] = mapped_column(String(1000), nullable=False)
    line: Mapped[int] = mapped_column(Integer, nullable=False)
    commit_sha: Mapped[str | None] = mapped_column(String(40), nullable=True)
    observed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
