"""Finding Service — CRUD, filtering, pagination, status changes."""

from __future__ import annotations

from typing import List, Optional
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.errors import NotFoundError
from backend.app.models.audit_log import AuditLog
from backend.app.models.finding import Finding
from backend.app.models.finding_occurrence import FindingOccurrence
from backend.app.models.repository import Repository
from backend.app.models.scan import Scan
from backend.app.models.user import User
from backend.app.schemas.common import PaginatedResponse, PaginationMeta
from backend.app.schemas.finding import FindingDetailResponse, FindingResponse, FindingStatusUpdate
from backend.app.schemas.policy import ExceptionCreate
from backend.app.services.ai_assessment import AIAssessmentService
from backend.app.services.exception import ExceptionService


class FindingService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_finding_by_id(self, finding_id: str) -> Finding:
        stmt = select(Finding).where(Finding.id == finding_id)
        res = await self.db.execute(stmt)
        finding = res.scalar_one_or_none()
        if not finding:
            raise NotFoundError("Finding")
        return finding

    async def get_finding_detail(self, finding_id: str) -> FindingDetailResponse:
        finding = await self.get_finding_by_id(finding_id)

        # Get scan and repo info
        scan_stmt = select(Scan, Repository.name).join(Repository, Repository.id == Scan.repository_id).where(Scan.id == finding.scan_id)
        scan_res = await self.db.execute(scan_stmt)
        scan_row = scan_res.first()
        repo_name = scan_row[1] if scan_row else "repository"
        commit_sha = scan_row[0].commit_sha if scan_row else None

        # Get AI assessment
        ai_service = AIAssessmentService(self.db)
        ai_assessment = await ai_service.get_by_finding_id(finding_id)

        # Occurrence count
        occ_stmt = select(func.count(FindingOccurrence.id)).where(FindingOccurrence.finding_fingerprint == finding.stable_fingerprint)
        occ_res = await self.db.execute(occ_stmt)
        occ_count = occ_res.scalar() or 1

        finding_resp = FindingResponse.model_validate(finding)
        return FindingDetailResponse(
            **finding_resp.model_dump(),
            ai_assessment=ai_assessment,
            repository_name=repo_name,
            commit_sha=commit_sha,
            history_count=occ_count,
        )

    async def list_findings(
        self,
        organization_id: Optional[str] = None,
        repository_id: Optional[str] = None,
        scan_id: Optional[str] = None,
        severity: Optional[str] = None,
        status: Optional[str] = None,
        scanner: Optional[str] = None,
        cwe_id: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 25,
    ) -> PaginatedResponse[FindingResponse]:
        stmt = select(Finding).join(Scan, Scan.id == Finding.scan_id).join(Repository, Repository.id == Scan.repository_id)

        if organization_id:
            stmt = stmt.where(Repository.organization_id == organization_id)
        if repository_id:
            stmt = stmt.where(Repository.id == repository_id)
        if scan_id:
            stmt = stmt.where(Finding.scan_id == scan_id)
        if severity:
            stmt = stmt.where(Finding.severity == severity.upper())
        if status:
            stmt = stmt.where(Finding.status == status.upper())
        if scanner:
            stmt = stmt.where(Finding.scanner == scanner.lower())
        if cwe_id:
            stmt = stmt.where(Finding.cwe_id == cwe_id)
        if search:
            s_term = f"%{search}%"
            stmt = stmt.where(
                (Finding.title.ilike(s_term)) | (Finding.file_path.ilike(s_term)) | (Finding.description.ilike(s_term))
            )

        # Count total
        count_stmt = select(func.count()).select_from(stmt.subquery())
        count_res = await self.db.execute(count_stmt)
        total = count_res.scalar() or 0

        # Pagination and order
        stmt = stmt.order_by(
            # Sort by severity priority: CRITICAL, HIGH, MEDIUM, LOW, INFO
            desc(Finding.severity == "CRITICAL"),
            desc(Finding.severity == "HIGH"),
            desc(Finding.severity == "MEDIUM"),
            desc(Finding.created_at),
        ).offset((page - 1) * limit).limit(limit)

        result = await self.db.execute(stmt)
        findings = result.scalars().all()

        items = [FindingResponse.model_validate(f) for f in findings]
        return PaginatedResponse(
            items=items,
            pagination=PaginationMeta(
                page=page,
                limit=limit,
                total=total,
                has_next=(page * limit) < total,
            ),
        )

    async def update_status(
        self, finding_id: str, update: FindingStatusUpdate, user: User
    ) -> FindingResponse:
        finding = await self.get_finding_by_id(finding_id)
        prev_status = finding.status
        finding.status = update.status.value

        # If ACCEPTED_RISK, create an exception record
        if update.status.value == "ACCEPTED_RISK":
            # Get repository organization
            scan_stmt = select(Repository.organization_id).join(Scan, Scan.repository_id == Repository.id).where(Scan.id == finding.scan_id)
            scan_res = await self.db.execute(scan_stmt)
            org_id = scan_res.scalar_one_or_none() or "default-org"

            exc_service = ExceptionService(self.db)
            await exc_service.create_exception(
                organization_id=org_id,
                user_id=user.id,
                data=ExceptionCreate(
                    finding_fingerprint=finding.stable_fingerprint,
                    reason=update.reason or "Risk accepted by team lead",
                    expires_at=update.expires_at,
                ),
            )

        # Audit log entry
        audit = AuditLog(
            actor_id=user.id,
            action="FINDING_STATUS_CHANGED",
            resource_type="finding",
            resource_id=finding.id,
            metadata_json=f'{{"from": "{prev_status}", "to": "{update.status.value}", "reason": "{update.reason or ""}"}}',
        )
        self.db.add(audit)
        await self.db.flush()

        return FindingResponse.model_validate(finding)

    async def get_repository_findings(
        self, repository_id: str, status: Optional[str] = None
    ) -> List[FindingResponse]:
        stmt = (
            select(Finding)
            .join(Scan, Scan.id == Finding.scan_id)
            .where(Scan.repository_id == repository_id)
        )
        if status:
            stmt = stmt.where(Finding.status == status.upper())
        stmt = stmt.order_by(desc(Finding.created_at))

        res = await self.db.execute(stmt)
        records = res.scalars().all()
        return [FindingResponse.model_validate(f) for f in records]
