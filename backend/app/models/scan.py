"""Scan model."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from backend.app.models.base import BaseModel


class Scan(BaseModel):
    __tablename__ = "scans"

    repository_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("repositories.id", ondelete="CASCADE"), nullable=False, index=True
    )
    type: Mapped[str] = mapped_column(
        String(20), nullable=False, default="FULL"
    )  # FULL, PR
    status: Mapped[str] = mapped_column(
        String(30), nullable=False, default="QUEUED", index=True
    )  # QUEUED, RUNNING, PARTIAL_FAILURE, COMPLETED, FAILED, CANCELLED
    commit_sha: Mapped[str | None] = mapped_column(String(40), nullable=True)
    branch: Mapped[str | None] = mapped_column(String(255), nullable=True)
    pr_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    triggered_by: Mapped[str | None] = mapped_column(String(100), nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    duration_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    files_analyzed: Mapped[int | None] = mapped_column(Integer, nullable=True)
    risk_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    policy_result: Mapped[str | None] = mapped_column(
        String(20), nullable=True
    )  # PASS, WARN, FAIL
    error_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
