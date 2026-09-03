"""Pull Request Auto-Scanner & Webhook Management Service."""

from __future__ import annotations

import urllib.parse
from typing import Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.config import settings
from backend.app.core.logging import get_logger
from backend.app.models.github_connection import GitHubConnection
from backend.app.models.repository import Repository
from backend.app.models.scan import Scan
from backend.app.services.github import GitHubService
from backend.app.services.github_oauth import GitHubOAuthService
from backend.app.services.scan import ScanService

logger = get_logger("pr_scanner")


class PRScannerService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.scan_service = ScanService(db)

    def get_public_webhook_url(self) -> Optional[str]:
        """Derive public webhook receiver URL from configuration or active tunnels."""
        # 1. Check explicit redirect URI if it contains a public tunnel/domain
        if settings.github_redirect_uri:
            parsed = urllib.parse.urlparse(settings.github_redirect_uri)
            if parsed.scheme in ["http", "https"] and parsed.netloc and "localhost" not in parsed.netloc and "127.0.0.1" not in parsed.netloc:
                return f"{parsed.scheme}://{parsed.netloc}/api/v1/webhooks/github"

        # 2. Check app base URL
        if settings.app_base_url:
            parsed = urllib.parse.urlparse(settings.app_base_url)
            if parsed.scheme in ["http", "https"] and parsed.netloc and "localhost" not in parsed.netloc and "127.0.0.1" not in parsed.netloc:
                return f"{parsed.scheme}://{parsed.netloc}/api/v1/webhooks/github"

        return None

    async def get_github_client(self) -> Optional[GitHubService]:
        """Fetch active GitHub token and return GitHubService."""
        gh_oauth = GitHubOAuthService(self.db)
        stmt = select(GitHubConnection).order_by(GitHubConnection.created_at.desc())
        res = await self.db.execute(stmt)
        conn = res.scalars().first()
        if not conn:
            return None

        token = await gh_oauth.get_decrypted_token(conn.user_id)
        if not token:
            return None

        return GitHubService(token)

    async def scan_all_connected_repos_prs(
        self, organization_id: Optional[str] = None
    ) -> Dict[str, any]:
        """
        Poll GitHub API for open PRs on all connected user repositories.
        Automatically triggers a PR scan for any open PR with unscanned commit SHAs.
        """
        gh = await self.get_github_client()
        if not gh:
            logger.info("pr_scanner_skipped_no_github_connection")
            return {
                "status": "skipped",
                "message": "GitHub account is not connected. Connect via OAuth first.",
                "repos_checked": 0,
                "detected_prs": 0,
                "triggered_scans": 0,
            }

        # Fetch connected repositories
        stmt = select(Repository).where(Repository.provider == "github")
        if organization_id:
            stmt = stmt.where(Repository.organization_id == organization_id)
        stmt = stmt.order_by(Repository.name.asc())
        res = await self.db.execute(stmt)
        repos = res.scalars().all()

        # Look up connection to filter user's own repos
        conn_stmt = select(GitHubConnection).order_by(GitHubConnection.created_at.desc())
        conn_res = await self.db.execute(conn_stmt)
        conn = conn_res.scalars().first()
        current_username = conn.provider_username if conn else None

        # Filter repositories to scan: user's repos or repos with valid owner
        target_repos = [
            r for r in repos
            if r.owner and r.name and r.owner != "acme-fintech"
            and (not current_username or r.owner == current_username)
        ]

        repos_checked = len(target_repos)
        detected_prs = 0
        triggered_scans = 0
        scanned_details = []

        import asyncio

        async def _fetch_repo_prs(r: Repository):
            try:
                # Tight 6-second timeout per repo
                return r, await asyncio.wait_for(
                    gh.list_pull_requests(r.owner, r.name, state="open"),
                    timeout=6.0,
                )
            except Exception as e:
                logger.debug("repo_pr_check_error", repo=r.full_name, error=str(e))
                return r, []

        # Query all repositories concurrently for ultra-fast response
        fetch_results = await asyncio.gather(*[_fetch_repo_prs(r) for r in target_repos])

        for repo, open_prs in fetch_results:
            if not open_prs:
                continue

            for pr in open_prs:
                detected_prs += 1
                pr_num = pr.get("number")
                pr_title = pr.get("title", f"Pull Request #{pr_num}")
                head_data = pr.get("head", {})
                head_sha = head_data.get("sha")
                head_ref = head_data.get("ref")

                if not head_sha or not pr_num:
                    continue

                # Check if this exact commit for this PR was already scanned
                scan_stmt = select(Scan).where(
                    Scan.repository_id == repo.id,
                    Scan.pr_number == pr_num,
                    Scan.commit_sha == head_sha,
                ).limit(1)
                scan_res = await self.db.execute(scan_stmt)
                existing_scan = scan_res.scalars().first()

                if existing_scan:
                    continue  # Already scanned this commit

                # Check if an active scan is already queued or running on this repository
                active_stmt = select(Scan).where(
                    Scan.repository_id == repo.id,
                    Scan.status.in_(["QUEUED", "RUNNING"]),
                ).limit(1)
                active_res = await self.db.execute(active_stmt)
                if active_res.scalars().first():
                    logger.info("scan_already_in_progress_skipping", repo=repo.full_name, pr_number=pr_num)
                    continue

                # Trigger scan for this PR commit
                try:
                    scan_title = f"GitHub PR #{pr_num}: {pr_title}"[:100]
                    new_scan = await self.scan_service.trigger_scan(
                        repository_id=repo.id,
                        scan_type="PR",
                        branch=head_ref,
                        commit_sha=head_sha,
                        pr_number=pr_num,
                        triggered_by=scan_title,
                    )
                    triggered_scans += 1
                    scanned_details.append({
                        "repository": repo.full_name,
                        "pr_number": pr_num,
                        "title": pr_title,
                        "branch": head_ref,
                        "commit_sha": head_sha[:7],
                        "scan_id": new_scan.id,
                    })
                    logger.info("auto_triggered_pr_scan", repo=repo.full_name, pr=pr_num, scan_id=new_scan.id)
                except Exception as e:
                    logger.error("error_triggering_pr_scan", repo=repo.full_name, pr=pr_num, error=str(e))

        return {
            "status": "completed",
            "repos_checked": repos_checked,
            "detected_prs": detected_prs,
            "triggered_scans": triggered_scans,
            "scans": scanned_details,
        }

    async def setup_webhooks_for_connected_repos(
        self, organization_id: Optional[str] = None
    ) -> Dict[str, any]:
        """Auto-configure GitHub webhooks on all connected user repositories."""
        gh = await self.get_github_client()
        if not gh:
            return {"status": "error", "message": "GitHub connection not found"}

        public_url = self.get_public_webhook_url()
        if not public_url:
            return {
                "status": "warning",
                "message": "No public domain detected (currently on localhost). Webhooks require a public URL or ngrok tunnel.",
                "configured": 0,
            }

        stmt = select(Repository).where(Repository.provider == "github")
        if organization_id:
            stmt = stmt.where(Repository.organization_id == organization_id)
        res = await self.db.execute(stmt)
        repos = res.scalars().all()

        configured = 0
        failed = 0
        repo_results = []

        for repo in repos:
            if not repo.owner or not repo.name or repo.owner == "acme-fintech":
                continue

            try:
                hook_res = await gh.create_or_update_webhook(
                    owner=repo.owner,
                    repo=repo.name,
                    target_url=public_url,
                    secret=settings.github_webhook_secret,
                )
                configured += 1
                repo_results.append({"repo": repo.full_name, "status": "active", "hook": hook_res.get("id")})
            except Exception as e:
                failed += 1
                repo_results.append({"repo": repo.full_name, "status": "failed", "error": str(e)})

        return {
            "status": "success",
            "webhook_url": public_url,
            "configured": configured,
            "failed": failed,
            "results": repo_results,
        }

    async def get_webhook_status(self) -> Dict[str, any]:
        """Return summary of webhook connectivity and public URL status."""
        public_url = self.get_public_webhook_url()
        gh = await self.get_github_client()

        # Count total repos
        stmt = select(Repository).where(Repository.provider == "github")
        res = await self.db.execute(stmt)
        repos = [r for r in res.scalars().all() if r.owner != "acme-fintech"]

        return {
            "github_connected": gh is not None,
            "public_url": public_url,
            "is_public_ready": public_url is not None,
            "webhook_secret_configured": bool(settings.github_webhook_secret),
            "connected_repos_count": len(repos),
        }
