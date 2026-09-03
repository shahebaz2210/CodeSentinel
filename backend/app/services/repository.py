"""Repository Management Service."""

from __future__ import annotations

from typing import List, Optional
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.errors import AppError, ErrorCode, NotFoundError
from backend.app.models.finding import Finding
from backend.app.models.repository import Repository
from backend.app.models.scan import Scan
from backend.app.models.user import User
from backend.app.schemas.repository import RepositoryResponse
from backend.app.services.github import GitHubService
from backend.app.services.github_oauth import GitHubOAuthService


class RepositoryService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_repository(self, repo_id: str) -> Repository:
        stmt = select(Repository).where(Repository.id == repo_id)
        result = await self.db.execute(stmt)
        repo = result.scalar_one_or_none()
        if not repo:
            raise NotFoundError("Repository")
        return repo

    async def list_repositories(self, organization_id: Optional[str] = None) -> List[RepositoryResponse]:
        stmt = select(Repository)
        if organization_id:
            stmt = stmt.where(Repository.organization_id == organization_id)
        stmt = stmt.order_by(Repository.name.asc())
        result = await self.db.execute(stmt)
        repos = result.scalars().all()

        responses = []
        for repo in repos:
            # Aggregate last scan and open findings
            last_scan_stmt = (
                select(Scan)
                .where(Scan.repository_id == repo.id)
                .order_by(Scan.created_at.desc())
                .limit(1)
            )
            last_scan_res = await self.db.execute(last_scan_stmt)
            last_scan = last_scan_res.scalar_one_or_none()

            findings_count_stmt = (
                select(
                    func.count(Finding.id).label("total"),
                    func.count(func.nullif(Finding.severity != "CRITICAL", True)).label("critical")
                )
                .join(Scan, Scan.id == Finding.scan_id)
                .where(Scan.repository_id == repo.id, Finding.status == "OPEN")
            )
            fc_res = await self.db.execute(findings_count_stmt)
            fc_row = fc_res.first()
            total_open = fc_row.total if fc_row else 0
            critical_open = fc_row.critical if fc_row else 0

            resp = RepositoryResponse(
                id=repo.id,
                organization_id=repo.organization_id,
                provider=repo.provider,
                provider_repo_id=repo.provider_repo_id,
                owner=repo.owner,
                name=repo.name,
                full_name=repo.full_name,
                default_branch=repo.default_branch,
                visibility=repo.visibility,
                language=repo.language,
                description=repo.description,
                created_at=repo.created_at,
                updated_at=repo.updated_at,
                last_scan_at=last_scan.completed_at or last_scan.created_at if last_scan else None,
                last_scan_status=last_scan.status if last_scan else None,
                last_risk_score=last_scan.risk_score if last_scan else None,
                open_findings_count=total_open,
                critical_findings_count=critical_open,
                policy_status=last_scan.policy_result if last_scan else None,
            )
            responses.append(resp)

        return responses

    async def sync_github_repositories(self, user: User, organization_id: str) -> List[Repository]:
        """Fetch repos from GitHub and sync into local database for the organization."""
        from backend.app.models.github_connection import GitHubConnection
        gh_oauth = GitHubOAuthService(self.db)
        token = await gh_oauth.get_decrypted_token(user.id)
        if not token:
            # Fallback to any active connection in the database
            stmt = select(GitHubConnection).order_by(GitHubConnection.created_at.desc())
            res = await self.db.execute(stmt)
            active_conn = res.scalars().first()
            if active_conn:
                token = await gh_oauth.get_decrypted_token(active_conn.user_id)

        if not token:
            raise AppError(ErrorCode.GITHUB_NOT_CONNECTED, "GitHub is not connected for this user. Please log in with GitHub first.")

        gh_service = GitHubService(token)
        gh_repos = await gh_service.list_repositories()

        synced = []
        for gr in gh_repos:
            provider_repo_id = str(gr["id"])
            stmt = select(Repository).where(Repository.provider_repo_id == provider_repo_id)
            res = await self.db.execute(stmt)
            existing = res.scalar_one_or_none()

            owner_login = gr["owner"]["login"]
            repo_name = gr["name"]
            full_name = gr["full_name"]
            default_branch = gr.get("default_branch", "main")
            visibility = "private" if gr.get("private") else "public"
            language = gr.get("language")
            description = gr.get("description")

            if existing:
                existing.owner = owner_login
                existing.name = repo_name
                existing.full_name = full_name
                existing.default_branch = default_branch
                existing.visibility = visibility
                existing.language = language
                existing.description = description
                synced.append(existing)
            else:
                new_repo = Repository(
                    organization_id=organization_id,
                    provider="github",
                    provider_repo_id=provider_repo_id,
                    owner=owner_login,
                    name=repo_name,
                    full_name=full_name,
                    default_branch=default_branch,
                    visibility=visibility,
                    language=language,
                    description=description,
                )
                self.db.add(new_repo)
                synced.append(new_repo)

        await self.db.commit()

        # Trigger background PR check and webhook setup for newly synced repos
        import asyncio
        from backend.app.core.database import async_session_factory
        from backend.app.services.pr_scanner import PRScannerService

        async def _bg_sync_prs():
            try:
                async with async_session_factory() as bg_db:
                    pr_service = PRScannerService(bg_db)
                    await pr_service.scan_all_connected_repos_prs(organization_id)
            except Exception:
                pass

        asyncio.create_task(_bg_sync_prs())
        return synced
