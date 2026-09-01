"""
Redis connection management.
"""

from __future__ import annotations

import redis

from backend.app.core.config import settings


def get_redis_connection() -> redis.Redis:
    """Return a synchronous Redis connection (used by RQ worker)."""
    return redis.Redis.from_url(settings.redis_url, decode_responses=True)


def get_redis_raw() -> redis.Redis:
    """Return a Redis connection without decode (for binary data)."""
    return redis.Redis.from_url(settings.redis_url, decode_responses=False)


def check_redis_health() -> bool:
    """Check if Redis is reachable."""
    try:
        conn = get_redis_connection()
        return conn.ping()
    except Exception:
        return False
