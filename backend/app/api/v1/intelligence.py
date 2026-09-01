"""Security Intelligence API routes."""

from __future__ import annotations

from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.database import get_db
from backend.app.core.deps import get_current_user
from backend.app.models.user import User
from backend.app.schemas.intelligence import (
    IntelligenceSearchRequest,
    IntelligenceSearchResponse,
    SecurityChunkResponse,
    SecurityDocumentResponse,
)
from backend.app.services.intelligence import IntelligenceService

router = APIRouter(prefix="/intelligence", tags=["intelligence"])


@router.get("/documents", response_model=List[SecurityDocumentResponse])
async def list_security_documents(
    source_type: Optional[str] = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[SecurityDocumentResponse]:
    """List ingested security knowledge documents (OWASP, CWE, CVE)."""
    service = IntelligenceService(db)
    return await service.list_documents(source_type=source_type)


@router.post("/search", response_model=IntelligenceSearchResponse)
async def search_security_intelligence(
    payload: IntelligenceSearchRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> IntelligenceSearchResponse:
    """Perform RAG vector & keyword search over ingested security corpus."""
    service = IntelligenceService(db)
    chunks = await service.retrieve_relevant_knowledge(
        query=payload.query,
        top_k=payload.limit,
    )
    items = [
        SecurityChunkResponse(
            id=c["id"],
            document_id=c["document_id"],
            chunk_index=0,
            content=c["content"],
            similarity_score=c.get("score"),
            source_type=c.get("source_type"),
            external_id=c.get("external_id"),
            title=c.get("title"),
        )
        for c in chunks
    ]
    return IntelligenceSearchResponse(results=items, total_found=len(items))
