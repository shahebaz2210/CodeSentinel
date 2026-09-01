"""Common API response schemas."""

from __future__ import annotations

from typing import Generic, List, Optional, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")


class PaginationMeta(BaseModel):
    page: int = 1
    limit: int = 25
    total: int = 0
    has_next: bool = False


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T] = Field(default_factory=list)
    pagination: PaginationMeta


class ErrorDetail(BaseModel):
    code: str
    message: str
    request_id: Optional[str] = None
    details: Optional[dict] = None


class ErrorResponse(BaseModel):
    error: ErrorDetail


class SuccessResponse(BaseModel):
    success: bool = True
    message: Optional[str] = None
