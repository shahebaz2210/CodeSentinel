"""Repository API routes."""

from __future__ import annotations

from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.database import get_db
from backend.app.core.deps import get_current_user
from backend.app.models.user import User
from backend.app.schemas.common import SuccessResponse
from backend.app.schemas.finding import FindingResponse
from backend.app.schemas.repository import RepositoryResponse, RepositorySyncRequest
from backend.app.schemas.scan import ScanResponse
from backend.app.services.repository import RepositoryService
from backend.app.services.scan import ScanService
from backend.app.services.finding import FindingService

router = APIRouter(prefix="/repositories", tags=["repositories"])


@router.get("", response_model=List[RepositoryResponse])
async def list_repositories(
    organization_id: Optional[str] = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[RepositoryResponse]:
    """List all repositories for the organization."""
    repo_service = RepositoryService(db)
    return await repo_service.list_repositories(organization_id)


@router.get("/{repo_id}", response_model=RepositoryResponse)
async def get_repository(
    repo_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> RepositoryResponse:
    """Get single repository by ID with live metrics."""
    repo_service = RepositoryService(db)
    repo = await repo_service.get_repository(repo_id)
    repos = await repo_service.list_repositories()
    for r in repos:
        if r.id == repo.id:
            return r
    return RepositoryResponse.model_validate(repo)


@router.post("/sync", response_model=SuccessResponse)
async def sync_github_repositories(
    req: RepositorySyncRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SuccessResponse:
    """Sync repositories from connected GitHub account."""
    repo_service = RepositoryService(db)
    synced = await repo_service.sync_github_repositories(user, req.organization_id)
    return SuccessResponse(success=True, message=f"Successfully synced {len(synced)} repositories.")


@router.get("/{repo_id}/scans", response_model=List[ScanResponse])
async def get_repository_scans(
    repo_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[ScanResponse]:
    """Get scan history for a repository."""
    scan_service = ScanService(db)
    return await scan_service.get_repository_scans(repo_id)


@router.get("/{repo_id}/findings", response_model=List[FindingResponse])
async def get_repository_findings(
    repo_id: str,
    status: Optional[str] = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[FindingResponse]:
    """Get all findings for a repository."""
    finding_service = FindingService(db)
    return await finding_service.get_repository_findings(repo_id, status=status)


@router.post("/{repo_id}/scan", response_model=ScanResponse)
async def trigger_repository_scan(
    repo_id: str,
    branch: Optional[str] = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ScanResponse:
    """Trigger a new asynchronous full security scan on a repository."""
    scan_service = ScanService(db)
    return await scan_service.trigger_scan(
        repository_id=repo_id,
        scan_type="FULL",
        branch=branch,
        triggered_by=user.name or user.email,
    )
