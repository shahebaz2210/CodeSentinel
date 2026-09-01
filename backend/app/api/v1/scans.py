"""Scan API routes."""

from __future__ import annotations

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.database import get_db
from backend.app.core.deps import get_current_user
from backend.app.models.user import User
from backend.app.schemas.finding import FindingResponse
from backend.app.schemas.scan import ScanCreate, ScanResponse, ScanStageResponse
from backend.app.services.finding import FindingService
from backend.app.services.scan import ScanService

router = APIRouter(prefix="/scans", tags=["scans"])


@router.get("", response_model=dict)
async def list_scans(
    repository_id: Optional[str] = None,
    type: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """List scans with optional filters."""
    scan_service = ScanService(db)
    return await scan_service.list_scans(
        repository_id=repository_id,
        scan_type=type,
        status=status,
        page=page,
        limit=limit,
    )


@router.post("", response_model=ScanResponse)
async def create_scan(
    payload: ScanCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ScanResponse:
    """Trigger a new scan."""
    scan_service = ScanService(db)
    return await scan_service.trigger_scan(
        repository_id=payload.repository_id,
        scan_type=payload.type.value,
        branch=payload.branch,
        commit_sha=payload.commit_sha,
        pr_number=payload.pr_number,
        triggered_by=user.name or user.email,
    )


@router.get("/{scan_id}", response_model=ScanResponse)
async def get_scan(
    scan_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ScanResponse:
    """Get scan status and progress."""
    scan_service = ScanService(db)
    return await scan_service.get_scan_with_details(scan_id)


@router.get("/{scan_id}/stages", response_model=List[ScanStageResponse])
async def get_scan_stages(
    scan_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[ScanStageResponse]:
    """Get all stages of a scan."""
    scan = await ScanService(db).get_scan_with_details(scan_id)
    return scan.stages or []


@router.get("/{scan_id}/findings", response_model=List[FindingResponse])
async def get_scan_findings(
    scan_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[FindingResponse]:
    """Get all findings discovered by a specific scan."""
    paginated = await FindingService(db).list_findings(scan_id=scan_id, limit=200)
    return paginated.items


@router.post("/{scan_id}/cancel", response_model=ScanResponse)
async def cancel_scan(
    scan_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ScanResponse:
    """Cancel a running or queued scan."""
    scan_service = ScanService(db)
    return await scan_service.cancel_scan(scan_id)
