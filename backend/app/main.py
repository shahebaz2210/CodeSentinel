"""
CodeSentinel FastAPI Application.

Main entry point. Wires middleware, exception handlers, and routers.
"""

from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException

from backend.app.api.v1 import api_v1_router
from backend.app.core.config import settings
from backend.app.core.database import async_session_factory, init_db
from backend.app.core.errors import AppError, app_error_handler, http_exception_handler, unhandled_exception_handler
from backend.app.core.logging import get_logger, setup_logging
from backend.app.core.middleware import setup_middleware
from backend.app.services.pr_scanner import PRScannerService

logger = get_logger("app_main")


async def _pr_polling_worker():
    """Periodic worker that checks open pull requests on connected repositories."""
    # Brief initial pause on startup to let server bind and initialize
    await asyncio.sleep(5)
    while True:
        try:
            async with async_session_factory() as session:
                scanner = PRScannerService(session)
                result = await scanner.scan_all_connected_repos_prs()
                if result.get("triggered_scans", 0) > 0:
                    logger.info("pr_poller_triggered_scans", count=result["triggered_scans"])
        except Exception as e:
            logger.debug("pr_polling_worker_cycle_error", error=str(e))

        # Check every 60 seconds
        await asyncio.sleep(60)


@asynccontextmanager
async def lifespan(app: FastAPI):  # type: ignore[type-arg]
    """Application startup/shutdown lifecycle."""
    setup_logging("DEBUG" if settings.app_debug else "INFO")
    try:
        await init_db()
    except Exception:
        pass  # DB may not be available yet during frontend-only dev

    # Start background PR auto-scanner task (only in non-test mode)
    poll_task = None
    if settings.app_env != "test":
        poll_task = asyncio.create_task(_pr_polling_worker())
    try:
        yield
    finally:
        if poll_task:
            poll_task.cancel()
            try:
                await poll_task
            except (asyncio.CancelledError, Exception):
                pass


def create_app() -> FastAPI:
    """Application factory."""
    app = FastAPI(
        title=settings.app_name,
        description="Context-Aware Security Intelligence Platform",
        version="0.1.0",
        docs_url="/api/docs" if settings.app_debug else None,
        redoc_url="/api/redoc" if settings.app_debug else None,
        lifespan=lifespan,
    )

    # Exception handlers
    app.add_exception_handler(AppError, app_error_handler)  # type: ignore[arg-type]
    app.add_exception_handler(HTTPException, http_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(Exception, unhandled_exception_handler)  # type: ignore[arg-type]

    # Middleware
    setup_middleware(app)

    # Routers
    app.include_router(api_v1_router)

    @app.get("/", tags=["root"])
    async def root():
        return {
            "name": settings.app_name,
            "status": "online",
            "version": "0.1.0",
            "webhook_endpoint": "/api/v1/webhooks/github",
        }

    @app.get("/healthz", tags=["health"])
    @app.get("/health", tags=["health"])
    async def root_health():
        return {"status": "ok", "app": settings.app_name}

    return app


app = create_app()
