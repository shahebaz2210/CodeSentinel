"""Repository schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class RepositoryBase(BaseModel):
    owner: str
    name: str
    full_name: str
    default_branch: str = "main"
    visibility: str = "private"
    language: Optional[str] = None
    description: Optional[str] = None


class RepositoryCreate(RepositoryBase):
    organization_id: str
    provider: str = "github"
    provider_repo_id: str


class RepositoryResponse(RepositoryBase):
    id: str
    organization_id: str
    provider: str
    provider_repo_id: str
    created_at: datetime
    updated_at: datetime
    # Aggregated security stats
    last_scan_at: Optional[datetime] = None
    last_scan_status: Optional[str] = None
    last_risk_score: Optional[float] = None
    open_findings_count: int = 0
    critical_findings_count: int = 0
    policy_status: Optional[str] = None

    class Config:
        from_attributes = True


class RepositorySyncRequest(BaseModel):
    organization_id: str
