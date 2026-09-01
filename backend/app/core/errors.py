"""
Application error codes and exception handlers.

Stable error codes for frontend/API consumers.
Never expose stack traces in production responses.
"""

from __future__ import annotations

from enum import Enum
from typing import Any

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse


class ErrorCode(str, Enum):
    """Stable application error codes."""
    AUTH_REQUIRED = "AUTH_REQUIRED"
    FORBIDDEN = "FORBIDDEN"
    GITHUB_NOT_CONNECTED = "GITHUB_NOT_CONNECTED"
    GITHUB_AUTH_FAILED = "GITHUB_AUTH_FAILED"
    GITHUB_API_ERROR = "GITHUB_API_ERROR"
    REPOSITORY_NOT_FOUND = "REPOSITORY_NOT_FOUND"
    SCAN_NOT_FOUND = "SCAN_NOT_FOUND"
    SCAN_ALREADY_RUNNING = "SCAN_ALREADY_RUNNING"
    SCAN_FAILED = "SCAN_FAILED"
    SCANNER_FAILED = "SCANNER_FAILED"
    AI_PROVIDER_FAILED = "AI_PROVIDER_FAILED"
    RAG_UNAVAILABLE = "RAG_UNAVAILABLE"
    POLICY_EVALUATION_FAILED = "POLICY_EVALUATION_FAILED"
    WEBHOOK_SIGNATURE_INVALID = "WEBHOOK_SIGNATURE_INVALID"
    WEBHOOK_DUPLICATE = "WEBHOOK_DUPLICATE"
    INVALID_INPUT = "INVALID_INPUT"
    RATE_LIMITED = "RATE_LIMITED"
    NOT_FOUND = "NOT_FOUND"
    INTERNAL_ERROR = "INTERNAL_ERROR"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
    FINDING_NOT_FOUND = "FINDING_NOT_FOUND"
    POLICY_NOT_FOUND = "POLICY_NOT_FOUND"


class AppError(Exception):
    """Base application error with structured error code."""

    def __init__(
        self,
        code: ErrorCode,
        message: str,
        status_code: int = 400,
        details: dict[str, Any] | None = None,
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(message)


class AuthenticationError(AppError):
    def __init__(self, message: str = "Authentication required."):
        super().__init__(ErrorCode.AUTH_REQUIRED, message, 401)


class ForbiddenError(AppError):
    def __init__(self, message: str = "Access denied."):
        super().__init__(ErrorCode.FORBIDDEN, message, 403)


class NotFoundError(AppError):
    def __init__(self, resource: str = "Resource", message: str | None = None):
        msg = message or f"{resource} not found."
        super().__init__(ErrorCode.NOT_FOUND, msg, 404)


class ConflictError(AppError):
    def __init__(self, message: str = "Conflict."):
        super().__init__(ErrorCode.SCAN_ALREADY_RUNNING, message, 409)


class RateLimitError(AppError):
    def __init__(self, message: str = "Rate limit exceeded."):
        super().__init__(ErrorCode.RATE_LIMITED, message, 429)


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    """Handle AppError exceptions — return structured error JSON."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code.value,
                "message": exc.message,
                "details": exc.details,
            }
        },
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle FastAPI HTTPException — normalize to our error format."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": "HTTP_ERROR",
                "message": exc.detail if isinstance(exc.detail, str) else str(exc.detail),
            }
        },
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all handler — never expose stack traces in production."""
    from backend.app.core.logging import get_logger
    logger = get_logger("error_handler")
    logger.error("unhandled_exception", error=str(exc), path=request.url.path)
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": ErrorCode.INTERNAL_ERROR.value,
                "message": "An internal error occurred.",
            }
        },
    )
