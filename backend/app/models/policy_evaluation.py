"""Policy evaluation model — records scan-level policy decisions."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from backend.app.models.base import BaseModel, utcnow


class PolicyEvaluation(BaseModel):
    __tablename__ = "policy_evaluations"

    scan_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True
    )
    policy_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("policies.id", ondelete="CASCADE"), nullable=False
    )
    result: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # PASS, WARN, FAIL
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON array of reasons
    evaluated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )
