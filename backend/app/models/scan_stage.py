"""Scan stage model — tracks individual pipeline stages."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from backend.app.models.base import BaseModel


class ScanStage(BaseModel):
    __tablename__ = "scan_stages"

    scan_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True
    )
    stage: Mapped[str] = mapped_column(
        String(30), nullable=False
    )  # PREPARING, FETCHING, INVENTORY, SEMGREP, GITLEAKS, NORMALIZATION, CONTEXT, INTELLIGENCE, AI, RISK, POLICY, PERSIST
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="PENDING"
    )  # PENDING, RUNNING, COMPLETED, FAILED, SKIPPED
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    item_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
