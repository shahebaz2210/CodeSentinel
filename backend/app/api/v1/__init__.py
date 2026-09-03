"""
API v1 Router — aggregates all v1 route modules.
"""

from __future__ import annotations

from fastapi import APIRouter

from backend.app.api.v1.health import router as health_router
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.repositories import router as repositories_router
from backend.app.api.v1.scans import router as scans_router
from backend.app.api.v1.findings import router as findings_router
from backend.app.api.v1.policies import router as policies_router
from backend.app.api.v1.intelligence import router as intelligence_router
from backend.app.api.v1.dashboard import router as dashboard_router
from backend.app.api.v1.webhooks import router as webhooks_router
from backend.app.api.v1.audit import router as audit_router
from backend.app.api.v1.pull_requests import router as pull_requests_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(health_router, tags=["health"])
api_v1_router.include_router(auth_router)
api_v1_router.include_router(repositories_router)
api_v1_router.include_router(scans_router)
api_v1_router.include_router(findings_router)
api_v1_router.include_router(policies_router)
api_v1_router.include_router(intelligence_router)
api_v1_router.include_router(dashboard_router)
api_v1_router.include_router(webhooks_router)
api_v1_router.include_router(audit_router)
api_v1_router.include_router(pull_requests_router)
