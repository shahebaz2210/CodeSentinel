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
