"""Policy and Exception schemas."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class PolicyResultEnum(str, Enum):
    PASS = "PASS"
    WARN = "WARN"
    FAIL = "FAIL"


class PolicyConfig(BaseModel):
    block_critical: bool = True
    block_high_with_high_confidence: bool = True
    block_secrets: bool = True
    severity_threshold: str = "HIGH"  # CRITICAL, HIGH, MEDIUM, LOW
    confidence_threshold: str = "MEDIUM"  # HIGH, MEDIUM, LOW
    allow_approved_exceptions: bool = True
    require_exception_expiry: bool = True
    max_exception_days: int = 90
    scope_repositories: List[str] = Field(default_factory=list)  # Empty means all repos


class PolicyBase(BaseModel):
    name: str
    description: Optional[str] = None
    enabled: bool = True
    configuration: PolicyConfig = Field(default_factory=PolicyConfig)


class PolicyCreate(PolicyBase):
    organization_id: str


class PolicyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    enabled: Optional[bool] = None
    configuration: Optional[PolicyConfig] = None


class PolicyResponse(BaseModel):
    id: str
    organization_id: str
    name: str
    description: Optional[str] = None
    enabled: bool
    configuration: PolicyConfig
    created_at: datetime
    updated_at: datetime
    affected_repositories_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class PolicyEvaluationResult(BaseModel):
    policy_id: str
    policy_name: str
    result: PolicyResultEnum
    reasons: List[str] = Field(default_factory=list)
    evaluated_at: datetime


class ExceptionCreate(BaseModel):
    finding_fingerprint: str
    reason: str
    expires_at: Optional[datetime] = None


class ExceptionResponse(BaseModel):
    id: str
    organization_id: str
    finding_fingerprint: str
    reason: str
    created_by: str
    approved_by: Optional[str] = None
    expires_at: Optional[datetime] = None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
