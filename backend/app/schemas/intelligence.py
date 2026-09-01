"""Security Intelligence / Knowledge schemas."""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class SecurityDocumentResponse(BaseModel):
    id: str
    source_type: str  # OWASP, CWE, CVE, GUIDE
    external_id: str
    title: str
    url: Optional[str] = None
    version: Optional[str] = None
    content: str
    metadata_json: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class SecurityChunkResponse(BaseModel):
    id: str
    document_id: str
    chunk_index: int
    content: str
    similarity_score: Optional[float] = None
    source_type: Optional[str] = None
    external_id: Optional[str] = None
    title: Optional[str] = None

    class Config:
        from_attributes = True


class IntelligenceSearchRequest(BaseModel):
    query: str
    source_type: Optional[str] = None
    limit: int = 5


class IntelligenceSearchResponse(BaseModel):
    results: List[SecurityChunkResponse] = Field(default_factory=list)
    total_found: int = 0
