"""
CodeSentinel FastAPI Application.

Main entry point. Wires middleware, exception handlers, and routers.
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException

from backend.app.api.v1 import api_v1_router
from backend.app.core.config import settings
from backend.app.core.database import init_db
from backend.app.core.errors import AppError, app_error_handler, http_exception_handler, unhandled_exception_handler
from backend.app.core.logging import setup_logging
from backend.app.core.middleware import setup_middleware


@asynccontextmanager
async def lifespan(app: FastAPI):  # type: ignore[type-arg]
    """Application startup/shutdown lifecycle."""
    setup_logging("DEBUG" if settings.app_debug else "INFO")
    try:
        await init_db()
    except Exception:
        pass  # DB may not be available yet during frontend-only dev
    yield


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

    @app.get("/healthz", tags=["health"])
    @app.get("/health", tags=["health"])
    async def root_health():
        return {"status": "ok", "app": settings.app_name}

    return app


app = create_app()
