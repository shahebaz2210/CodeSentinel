"""Integration tests for FastAPI REST API endpoints using async HTTP client."""

from __future__ import annotations

import httpx
import pytest

from backend.app.main import app


@pytest.fixture
async def async_client():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.mark.asyncio
async def test_health_endpoint(async_client: httpx.AsyncClient):
    """Verify system health endpoint responds with 200 OK."""
    response = await async_client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded", "ok"]
    assert "services" in data


@pytest.mark.asyncio
async def test_github_webhook_info(async_client: httpx.AsyncClient):
    """Verify GitHub webhook receiver GET info endpoint."""
    response = await async_client.get("/api/v1/webhooks/github")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "active"
    assert "/api/v1/webhooks/github" in data["endpoint"]


@pytest.mark.asyncio
async def test_dashboard_summary_endpoint(async_client: httpx.AsyncClient):
    """Verify dashboard summary structure and metric fields."""
    response = await async_client.get("/api/v1/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    
    assert "total_repositories" in data
    assert "total_open_findings" in data
    assert "severity_distribution" in data
    assert "scans_today_count" in data
    assert "recent_scans" in data
    assert isinstance(data["recent_scans"], list)


@pytest.mark.asyncio
async def test_repositories_list_endpoint(async_client: httpx.AsyncClient):
    """Verify repository list endpoint returns valid array."""
    response = await async_client.get("/api/v1/repositories")
    assert response.status_code == 200
    repos = response.json()
    assert isinstance(repos, list)


@pytest.mark.asyncio
async def test_findings_list_endpoint(async_client: httpx.AsyncClient):
    """Verify findings list endpoint with pagination."""
    response = await async_client.get("/api/v1/findings?page=1&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "pagination" in data
    assert isinstance(data["items"], list)
    assert data["pagination"]["page"] == 1


@pytest.mark.asyncio
async def test_scans_list_endpoint(async_client: httpx.AsyncClient):
    """Verify scans history list endpoint."""
    response = await async_client.get("/api/v1/scans?page=1&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data


@pytest.mark.asyncio
async def test_policies_list_endpoint(async_client: httpx.AsyncClient):
    """Verify policies listing endpoint."""
    response = await async_client.get("/api/v1/policies")
    assert response.status_code == 200
    policies = response.json()
    assert isinstance(policies, list)
