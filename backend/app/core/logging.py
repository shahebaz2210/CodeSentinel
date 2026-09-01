"""
Structured logging configuration.

Uses structlog for machine-readable, context-rich log output.
Never log: tokens, credentials, raw secrets, unnecessary source code.
"""

from __future__ import annotations

import logging
import sys
import uuid

import structlog


def setup_logging(log_level: str = "INFO") -> None:
    """Configure structured logging for the application."""
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.dev.ConsoleRenderer() if log_level == "DEBUG" else structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(
            getattr(logging, log_level.upper(), logging.INFO)
        ),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(file=sys.stdout),
        cache_logger_on_first_use=True,
    )

    # Suppress noisy libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)


def get_logger(name: str = "codesentinel") -> structlog.BoundLogger:
    """Get a structured logger instance."""
    return structlog.get_logger(name)


def generate_request_id() -> str:
    """Generate a unique request ID for tracing."""
    return f"req_{uuid.uuid4().hex[:16]}"
