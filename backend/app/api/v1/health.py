"""
Health check endpoint.
"""

from __future__ import annotations

from fastapi import APIRouter

from backend.app.core.redis import check_redis_health

router = APIRouter()


@router.get("/health")
async def health_check() -> dict:
    """Return service health status."""
    redis_ok = check_redis_health()
    db_ok = True  # Will be enhanced after DB models are wired

    status = "healthy" if (redis_ok and db_ok) else "degraded"
    return {
        "status": status,
        "services": {
            "api": True,
            "database": db_ok,
            "redis": redis_ok,
        },
    }
