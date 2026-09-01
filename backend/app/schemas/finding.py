"""Finding and AI Assessment schemas."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel


class Severity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFO = "INFO"


class Confidence(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class FindingStatus(str, Enum):
    OPEN = "OPEN"
    IN_REVIEW = "IN_REVIEW"
    RESOLVED = "RESOLVED"
    FALSE_POSITIVE = "FALSE_POSITIVE"
    ACCEPTED_RISK = "ACCEPTED_RISK"
    IGNORED = "IGNORED"


class AIAssessmentResponse(BaseModel):
    id: str
    finding_id: str
    model: str
    prompt_version: str
    summary: Optional[str] = None
    explanation: Optional[str] = None
    impact: Optional[str] = None
    remediation: Optional[str] = None
    confidence: Optional[float] = None
    uncertainty: Optional[List[str]] = None
    retrieved_sources: Optional[List[dict]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class FindingResponse(BaseModel):
    id: str
    scan_id: str
    stable_fingerprint: str
    title: str
    description: Optional[str] = None
    category: str
    severity: str
    confidence: str
    risk_score: Optional[float] = None
    scanner: str
    scanner_rule: Optional[str] = None
    cwe_id: Optional[str] = None
    cve_id: Optional[str] = None
    owasp_category: Optional[str] = None
    status: str
    file_path: str
    start_line: int
    end_line: Optional[int] = None
    start_column: Optional[int] = None
    end_column: Optional[int] = None
    evidence: Optional[str] = None
    remediation: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FindingDetailResponse(FindingResponse):
    ai_assessment: Optional[AIAssessmentResponse] = None
    repository_name: Optional[str] = None
    commit_sha: Optional[str] = None
    source_snippet: Optional[str] = None
    history_count: int = 1


class FindingStatusUpdate(BaseModel):
    status: FindingStatus
    reason: Optional[str] = None
    expires_at: Optional[datetime] = None  # for ACCEPTED_RISK
