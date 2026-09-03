"""GitHub API Service for repository and PR interactions."""

from __future__ import annotations

from typing import List, Optional
import httpx

from backend.app.core.errors import AppError, ErrorCode


class GitHubService:
    BASE_URL = "https://api.github.com"

    def __init__(self, access_token: str):
        self.access_token = access_token
        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "CodeSentinel-Security-Platform",
        }

    async def list_repositories(self, per_page: int = 100) -> List[dict]:
        """Fetch all repositories accessible to the authenticated user."""
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.get(
                f"{self.BASE_URL}/user/repos",
                headers=self.headers,
                params={"per_page": per_page, "sort": "updated", "affiliation": "owner,collaborator,organization_member"},
            )
            if resp.status_code != 200:
                raise AppError(ErrorCode.GITHUB_API_ERROR, f"GitHub error: {resp.text}")
            return resp.json()

    async def get_repository(self, owner: str, repo: str) -> dict:
        """Fetch repository details."""
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                f"{self.BASE_URL}/repos/{owner}/{repo}",
                headers=self.headers,
            )
            if resp.status_code == 404:
                raise AppError(ErrorCode.REPOSITORY_NOT_FOUND, f"Repository {owner}/{repo} not found on GitHub")
            if resp.status_code != 200:
                raise AppError(ErrorCode.GITHUB_API_ERROR, f"GitHub error: {resp.text}")
            return resp.json()

    async def get_pull_request(self, owner: str, repo: str, pr_number: int) -> dict:
        """Fetch PR metadata."""
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                f"{self.BASE_URL}/repos/{owner}/{repo}/pulls/{pr_number}",
                headers=self.headers,
            )
            if resp.status_code != 200:
                raise AppError(ErrorCode.GITHUB_API_ERROR, f"Failed to fetch PR #{pr_number}")
            return resp.json()

    async def get_pull_request_files(self, owner: str, repo: str, pr_number: int) -> List[dict]:
        """Fetch changed files in a pull request."""
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                f"{self.BASE_URL}/repos/{owner}/{repo}/pulls/{pr_number}/files",
                headers=self.headers,
                params={"per_page": 100},
            )
            if resp.status_code != 200:
                raise AppError(ErrorCode.GITHUB_API_ERROR, f"Failed to fetch PR files for #{pr_number}")
            return resp.json()

    async def get_commit(self, owner: str, repo: str, sha: str) -> dict:
        """Fetch commit details."""
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                f"{self.BASE_URL}/repos/{owner}/{repo}/commits/{sha}",
                headers=self.headers,
            )
            if resp.status_code != 200:
                raise AppError(ErrorCode.GITHUB_API_ERROR, f"Failed to fetch commit {sha}")
            return resp.json()

    async def list_pull_requests(self, owner: str, repo: str, state: str = "open", per_page: int = 30) -> List[dict]:
        """Fetch pull requests for a repository."""
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.get(
                f"{self.BASE_URL}/repos/{owner}/{repo}/pulls",
                headers=self.headers,
                params={"state": state, "per_page": per_page, "sort": "updated", "direction": "desc"},
            )
            if resp.status_code == 404:
                return []
            if resp.status_code != 200:
                raise AppError(ErrorCode.GITHUB_API_ERROR, f"Failed to list PRs for {owner}/{repo}: {resp.text}")
            return resp.json()

    async def list_webhooks(self, owner: str, repo: str) -> List[dict]:
        """List webhooks configured on a repository."""
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                f"{self.BASE_URL}/repos/{owner}/{repo}/hooks",
                headers=self.headers,
            )
            if resp.status_code in [403, 404]:
                return []
            if resp.status_code != 200:
                raise AppError(ErrorCode.GITHUB_API_ERROR, f"Failed to list hooks for {owner}/{repo}: {resp.text}")
            return resp.json()

    async def create_or_update_webhook(
        self,
        owner: str,
        repo: str,
        target_url: str,
        secret: str = "",
        events: Optional[List[str]] = None,
    ) -> dict:
        """Ensure CodeSentinel webhook is installed and active on the repository."""
        desired_events = events or ["pull_request", "push", "check_run", "check_suite"]
        existing_hooks = await self.list_webhooks(owner, repo)

        target_base = target_url.split("?")[0].rstrip("/")
        matching_hook = None
        for hook in existing_hooks:
            hook_url = hook.get("config", {}).get("url", "").rstrip("/")
            # Match by endpoint path or host
            if "/api/v1/webhooks/github" in hook_url:
                matching_hook = hook
                break

        async with httpx.AsyncClient(timeout=15.0) as client:
            hook_data = {
                "name": "web",
                "active": True,
                "events": desired_events,
                "config": {
                    "url": target_url,
                    "content_type": "json",
                    "insecure_ssl": "0",
                    **({"secret": secret} if secret else {}),
                },
            }

            if matching_hook:
                hook_id = matching_hook["id"]
                current_url = matching_hook.get("config", {}).get("url", "").rstrip("/")
                if current_url == target_base and matching_hook.get("active", False):
                    return matching_hook

                resp = await client.patch(
                    f"{self.BASE_URL}/repos/{owner}/{repo}/hooks/{hook_id}",
                    headers=self.headers,
                    json=hook_data,
                )
                if resp.status_code in [200, 201]:
                    return resp.json()
                # If patch failed due to 404, fall through to creation

            resp = await client.post(
                f"{self.BASE_URL}/repos/{owner}/{repo}/hooks",
                headers=self.headers,
                json=hook_data,
            )
            if resp.status_code in [200, 201]:
                return resp.json()
            elif resp.status_code == 422:
                # Webhook already exists or validation error
                err_json = resp.json()
                return {"status": "exists", "details": err_json}
            else:
                raise AppError(
                    ErrorCode.GITHUB_API_ERROR,
                    f"Failed to register webhook on {owner}/{repo}: {resp.text}"
                )

    async def create_commit_status(
        self,
        owner: str,
        repo: str,
        sha: str,
        state: str,
        description: str,
        target_url: str = "",
        context: str = "CodeSentinel/Security-Gate",
    ) -> dict:
        """Create or update a commit status check on GitHub (state: pending, success, error, failure)."""
        async with httpx.AsyncClient(timeout=15.0) as client:
            payload = {
                "state": state,
                "description": description[:140],
                "context": context,
            }
            if target_url:
                payload["target_url"] = target_url

            resp = await client.post(
                f"{self.BASE_URL}/repos/{owner}/{repo}/statuses/{sha}",
                headers=self.headers,
                json=payload,
            )
            if resp.status_code in [200, 201]:
                return resp.json()
            return {"status": resp.status_code, "error": resp.text}

    async def post_pr_comment(self, owner: str, repo: str, pr_number: int, body: str) -> dict:
        """Post a security audit comment on a GitHub Pull Request."""
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{self.BASE_URL}/repos/{owner}/{repo}/issues/{pr_number}/comments",
                headers=self.headers,
                json={"body": body},
            )
            if resp.status_code in [200, 201]:
                return resp.json()
            return {"status": resp.status_code, "error": resp.text}

    async def submit_pr_review(
        self, owner: str, repo: str, pr_number: int, event: str, body: str
    ) -> dict:
        """Submit a PR review (event: APPROVE, REQUEST_CHANGES, COMMENT)."""
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{self.BASE_URL}/repos/{owner}/{repo}/pulls/{pr_number}/reviews",
                headers=self.headers,
                json={"event": event, "body": body},
            )
            if resp.status_code in [200, 201]:
                return resp.json()
            return {"status": resp.status_code, "error": resp.text}


