"""Pull Request scanning and webhook configuration endpoints."""

from __future__ import annotations

from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.database import get_db
from backend.app.core.deps import get_current_user
from backend.app.models.user import User
from backend.app.services.pr_scanner import PRScannerService

router = APIRouter(prefix="/pull-requests", tags=["pull-requests"])


@router.post("/sync")
async def sync_and_scan_pull_requests(
    organization_id: Optional[str] = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Check all connected GitHub repositories for open pull requests and
    automatically trigger security scans for any new PRs or updated commits.
    """
    scanner = PRScannerService(db)
    result = await scanner.scan_all_connected_repos_prs(organization_id)
    return result


@router.post("/webhooks/setup")
async def setup_github_webhooks(
    organization_id: Optional[str] = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Automatically register CodeSentinel webhooks on all connected user repositories in GitHub.
    """
    scanner = PRScannerService(db)
    result = await scanner.setup_webhooks_for_connected_repos(organization_id)
    return result


@router.get("/webhooks/status")
async def get_webhook_status(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Check public webhook reachability and configuration status.
    """
    scanner = PRScannerService(db)
    return await scanner.get_webhook_status()
