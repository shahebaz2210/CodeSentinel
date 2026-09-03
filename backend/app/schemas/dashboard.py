"""Dashboard and Analytics schemas."""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

from backend.app.schemas.finding import FindingResponse
from backend.app.schemas.scan import ScanResponse


class RiskTrendPoint(BaseModel):
    date: str  # YYYY-MM-DD
    average_risk_score: float
    scans_count: int


class SeverityDistribution(BaseModel):
    critical: int = 0
    high: int = 0
    medium: int = 0
    low: int = 0
    info: int = 0


class RepoRiskRank(BaseModel):
    id: str
    name: str
    owner: str
    risk_score: float
    critical_count: int
    high_count: int
    open_findings: int
    policy_status: Optional[str] = None
    last_scanned: Optional[datetime] = None


class DashboardSummary(BaseModel):
    overall_security_posture: str = "GOOD"  # EXCELLENT, GOOD, FAIR, POOR, CRITICAL
    average_risk_score: float = 0.0
    total_repositories: int = 0
    scanned_repositories: int = 0
    critical_findings_count: int = 0
    high_findings_count: int = 0
    total_open_findings: int = 0
    active_scans_count: int = 0
    scans_today_count: int = 0
    pr_gates_passed: int = 0
    pr_gates_failed: int = 0
    severity_distribution: SeverityDistribution = Field(default_factory=SeverityDistribution)
    risk_trend: List[RiskTrendPoint] = Field(default_factory=list)
    top_risky_repositories: List[RepoRiskRank] = Field(default_factory=list)
    recent_scans: List[ScanResponse] = Field(default_factory=list)
    recent_findings: List[FindingResponse] = Field(default_factory=list)
