"""Finding model — normalized security findings from all scanners."""

from __future__ import annotations

from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from backend.app.models.base import BaseModel


class Finding(BaseModel):
    __tablename__ = "findings"

    scan_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True
    )
    stable_fingerprint: Mapped[str] = mapped_column(
        String(64), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(
        String(50), nullable=False, default="GENERAL"
    )  # INJECTION, XSS, SECRET, CRYPTO, AUTH, CONFIG, etc.
    severity: Mapped[str] = mapped_column(
        String(20), nullable=False, index=True
    )  # CRITICAL, HIGH, MEDIUM, LOW, INFO
    confidence: Mapped[str] = mapped_column(
        String(20), nullable=False, default="MEDIUM"
    )  # HIGH, MEDIUM, LOW
    risk_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    scanner: Mapped[str] = mapped_column(
        String(30), nullable=False, index=True
    )  # semgrep, gitleaks
    scanner_rule: Mapped[str | None] = mapped_column(String(255), nullable=True)
    cwe_id: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)
    cve_id: Mapped[str | None] = mapped_column(String(30), nullable=True)
    owasp_category: Mapped[str | None] = mapped_column(String(30), nullable=True)
    status: Mapped[str] = mapped_column(
        String(30), nullable=False, default="OPEN", index=True
    )  # OPEN, IN_REVIEW, RESOLVED, FALSE_POSITIVE, ACCEPTED_RISK, IGNORED
    file_path: Mapped[str] = mapped_column(String(1000), nullable=False)
    start_line: Mapped[int] = mapped_column(Integer, nullable=False)
    end_line: Mapped[int | None] = mapped_column(Integer, nullable=True)
    start_column: Mapped[int | None] = mapped_column(Integer, nullable=True)
    end_column: Mapped[int | None] = mapped_column(Integer, nullable=True)
    evidence: Mapped[str | None] = mapped_column(Text, nullable=True)
    remediation: Mapped[str | None] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[str | None] = mapped_column(Text, nullable=True)
