"""Scan and ScanStage schemas."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class ScanType(str, Enum):
    FULL = "FULL"
    PR = "PR"


class ScanStatus(str, Enum):
    QUEUED = "QUEUED"
    RUNNING = "RUNNING"
    PARTIAL_FAILURE = "PARTIAL_FAILURE"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class StageName(str, Enum):
    QUEUED = "QUEUED"
    PREPARING = "PREPARING"
    FETCHING = "FETCHING"
    INVENTORY = "INVENTORY"
    SEMGREP = "SEMGREP"
    GITLEAKS = "GITLEAKS"
    NORMALIZATION = "NORMALIZATION"
    CONTEXT = "CONTEXT"
    INTELLIGENCE = "INTELLIGENCE"
    AI = "AI"
    RISK = "RISK"
    POLICY = "POLICY"
    PERSIST = "PERSIST"
    COMPLETED = "COMPLETED"


class ScanCreate(BaseModel):
    repository_id: str
    type: ScanType = ScanType.FULL
    branch: Optional[str] = None
    commit_sha: Optional[str] = None
    pr_number: Optional[int] = None


class ScanStageResponse(BaseModel):
    id: str
    stage: str
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    item_count: Optional[int] = None
    error_message: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ScanResponse(BaseModel):
    id: str
    repository_id: str
    repository_name: Optional[str] = None
    type: str
    status: str
    commit_sha: Optional[str] = None
    branch: Optional[str] = None
    pr_number: Optional[int] = None
    triggered_by: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_ms: Optional[int] = None
    files_analyzed: Optional[int] = None
    risk_score: Optional[float] = None
    policy_result: Optional[str] = None
    error_summary: Optional[str] = None
    created_at: datetime
    stages: Optional[List[ScanStageResponse]] = None
    # Finding summary counts
    critical_count: int = 0
    high_count: int = 0
    medium_count: int = 0
    low_count: int = 0
    secret_count: int = 0
    total_findings: int = 0

    model_config = ConfigDict(from_attributes=True)
