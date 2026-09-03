"""Risk Engine schemas."""

from __future__ import annotations

from typing import List
from pydantic import BaseModel, Field


class RiskDimension(BaseModel):
    name: str
    weight: float
    score: float
    description: str


class RiskBreakdown(BaseModel):
    severity_score: float  # 0.0 - 1.0
    confidence_score: float  # 0.0 - 1.0
    exploitability_score: float  # 0.0 - 1.0
    exposure_score: float  # 0.0 - 1.0
    context_score: float  # 0.0 - 1.0
    business_impact_score: float  # 0.0 - 1.0
    dimensions: List[RiskDimension] = Field(default_factory=list)


class RiskScore(BaseModel):
    score: float  # 0.0 - 100.0
    level: str  # CRITICAL (80-100), HIGH (60-79), MEDIUM (40-59), LOW (20-39), MINIMAL (0-19)
    version: str = "v1.0"
    breakdown: RiskBreakdown
    explanation: str
