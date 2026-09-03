"""Scan Lifecycle and Management Service."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional
from rq import Queue
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.config import settings
from backend.app.core.errors import AppError, ErrorCode, NotFoundError
from backend.app.core.redis import get_redis_connection
from backend.app.models.finding import Finding
from backend.app.models.repository import Repository
from backend.app.models.scan import Scan
from backend.app.models.scan_stage import ScanStage
from backend.app.schemas.scan import ScanResponse, ScanStageResponse


class ScanService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_scan_by_id(self, scan_id: str) -> Scan:
        stmt = select(Scan).where(Scan.id == scan_id)
        res = await self.db.execute(stmt)
        scan = res.scalar_one_or_none()
        if not scan:
            raise NotFoundError("Scan")
        return scan

    async def get_scan_with_details(self, scan_id: str) -> ScanResponse:
        scan = await self.get_scan_by_id(scan_id)

        # Get stages
        stage_stmt = select(ScanStage).where(ScanStage.scan_id == scan_id).order_by(ScanStage.created_at.asc())
        stage_res = await self.db.execute(stage_stmt)
        stages = [ScanStageResponse.model_validate(s) for s in stage_res.scalars().all()]

        # Get finding counts by severity
        fc_stmt = (
            select(
                func.count(func.nullif(Finding.severity != "CRITICAL", True)).label("critical"),
                func.count(func.nullif(Finding.severity != "HIGH", True)).label("high"),
                func.count(func.nullif(Finding.severity != "MEDIUM", True)).label("medium"),
                func.count(func.nullif(Finding.severity != "LOW", True)).label("low"),
                func.count(func.nullif(Finding.category != "SECRET", True)).label("secret"),
                func.count(Finding.id).label("total"),
            )
            .where(Finding.scan_id == scan_id)
        )
        fc_res = await self.db.execute(fc_stmt)
        fc = fc_res.first()

        resp = ScanResponse.model_validate(scan)
        resp.stages = stages

        # Fetch repository name
        repo_res = await self.db.execute(select(Repository.name).where(Repository.id == scan.repository_id))
        resp.repository_name = repo_res.scalar_one_or_none()

        if fc:
            resp.critical_count = fc.critical or 0
            resp.high_count = fc.high or 0
            resp.medium_count = fc.medium or 0
            resp.low_count = fc.low or 0
            resp.secret_count = fc.secret or 0
            resp.total_findings = fc.total or 0

        return resp

    async def trigger_scan(
        self,
        repository_id: str,
        scan_type: str = "FULL",
        branch: Optional[str] = None,
        commit_sha: Optional[str] = None,
        pr_number: Optional[int] = None,
        triggered_by: Optional[str] = None,
    ) -> ScanResponse:
        """Create new scan in QUEUED state and enqueue into Redis."""
        # Verify repository exists
        repo_stmt = select(Repository).where(Repository.id == repository_id)
        repo_res = await self.db.execute(repo_stmt)
        repo = repo_res.scalar_one_or_none()
        if not repo:
            raise NotFoundError("Repository")

        # Check for concurrent active scan
        active_stmt = select(Scan).where(
            Scan.repository_id == repository_id,
            Scan.status.in_(["QUEUED", "RUNNING"])
        )
        active_res = await self.db.execute(active_stmt)
        if active_res.scalar_one_or_none():
            raise AppError(ErrorCode.SCAN_ALREADY_RUNNING, "A scan is already queued or running on this repository.")

        target_branch = branch or repo.default_branch
        scan = Scan(
            repository_id=repository_id,
            type=scan_type,
            status="QUEUED",
            branch=target_branch,
            commit_sha=commit_sha,
            pr_number=pr_number,
            triggered_by=triggered_by or "User",
        )
        self.db.add(scan)
        await self.db.commit()

        # Enqueue in Redis Queue or run async in-process task immediately
        enqueued_redis = False
        try:
            redis_conn = get_redis_connection()
            if redis_conn:
                q = Queue(settings.worker_queue_name, connection=redis_conn)
                q.enqueue("backend.app.workers.scan_worker.run_scan_job", scan.id)
                enqueued_redis = True
        except Exception:
            enqueued_redis = False

        if not enqueued_redis:
            import asyncio
            asyncio.create_task(run_scan_pipeline_background(scan.id))

        return await self.get_scan_with_details(scan.id)

    async def cancel_scan(self, scan_id: str) -> ScanResponse:
        scan = await self.get_scan_by_id(scan_id)
        if scan.status in ["COMPLETED", "FAILED", "CANCELLED"]:
            raise AppError(ErrorCode.INVALID_INPUT, f"Cannot cancel scan in {scan.status} state.")

        scan.status = "CANCELLED"
        scan.completed_at = datetime.now(timezone.utc)
        await self.db.flush()
        return await self.get_scan_with_details(scan.id)

    async def get_repository_scans(self, repository_id: str) -> List[ScanResponse]:
        stmt = select(Scan).where(Scan.repository_id == repository_id).order_by(desc(Scan.created_at))
        res = await self.db.execute(stmt)
        scans = res.scalars().all()

        responses = []
        for s in scans:
            resp = await self.get_scan_with_details(s.id)
            responses.append(resp)
        return responses

    async def list_scans(
        self,
        repository_id: Optional[str] = None,
        scan_type: Optional[str] = None,
        status: Optional[str] = None,
        page: int = 1,
        limit: int = 50,
    ) -> dict:
        stmt = select(Scan).order_by(desc(Scan.created_at))
        if repository_id:
            stmt = stmt.where(Scan.repository_id == repository_id)
        if scan_type:
            stmt = stmt.where(Scan.type == scan_type)
        if status:
            stmt = stmt.where(Scan.status == status)

        # Count total
        count_stmt = select(func.count(Scan.id))
        if repository_id:
            count_stmt = count_stmt.where(Scan.repository_id == repository_id)
        if scan_type:
            count_stmt = count_stmt.where(Scan.type == scan_type)
        if status:
            count_stmt = count_stmt.where(Scan.status == status)
        total_res = await self.db.execute(count_stmt)
        total = total_res.scalar() or 0

        # Pagination
        offset = (page - 1) * limit
        stmt = stmt.offset(offset).limit(limit)
        res = await self.db.execute(stmt)
        scans = res.scalars().all()

        items = []
        for s in scans:
            resp = await self.get_scan_with_details(s.id)
            items.append(resp)

        return {
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit if limit > 0 else 1,
        }


async def run_scan_pipeline_background(scan_id: str) -> None:
    """Execute scan pipeline in background session."""
    from backend.app.core.database import async_session_factory
    from backend.app.workers.scan_pipeline import ScanPipeline
    try:
        async with async_session_factory() as session:
            pipeline = ScanPipeline(session, scan_id)
            await pipeline.run()
    except Exception:
        import traceback
        traceback.print_exc()

