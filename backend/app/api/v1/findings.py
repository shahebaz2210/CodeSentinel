"""Finding API routes."""

from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.database import get_db
from backend.app.core.deps import get_current_user
from backend.app.models.user import User
from backend.app.schemas.common import PaginatedResponse
from backend.app.schemas.finding import FindingDetailResponse, FindingResponse, FindingStatusUpdate
from backend.app.services.finding import FindingService

router = APIRouter(prefix="/findings", tags=["findings"])


@router.get("", response_model=PaginatedResponse[FindingResponse])
async def list_findings(
    organization_id: Optional[str] = Query(None),
    repository_id: Optional[str] = Query(None),
    scan_id: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    scanner: Optional[str] = Query(None),
    cwe_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[FindingResponse]:
    """List paginated security findings with multi-facet filters and search."""
    service = FindingService(db)
    return await service.list_findings(
        organization_id=organization_id,
        repository_id=repository_id,
        scan_id=scan_id,
        severity=severity,
        status=status,
        scanner=scanner,
        cwe_id=cwe_id,
        search=search,
        page=page,
        limit=limit,
    )


@router.get("/{finding_id}", response_model=FindingDetailResponse)
async def get_finding_detail(
    finding_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> FindingDetailResponse:
    """Get complete finding investigation view with AI analysis and repository context."""
    service = FindingService(db)
    return await service.get_finding_detail(finding_id)


@router.patch("/{finding_id}/status", response_model=FindingResponse)
async def update_finding_status(
    finding_id: str,
    payload: FindingStatusUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> FindingResponse:
    """Update finding status (e.g. mark IN_REVIEW, FALSE_POSITIVE, ACCEPTED_RISK, RESOLVED)."""
    service = FindingService(db)
    return await service.update_status(finding_id, payload, user)
