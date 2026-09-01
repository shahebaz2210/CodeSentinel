"""
Database engine and session management.

Uses SQLAlchemy 2.0 async with asyncpg driver.
"""

from __future__ import annotations

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from backend.app.core.config import settings


is_sqlite = settings.database_url.startswith("sqlite")

engine_kwargs = {"echo": settings.database_echo}
if not is_sqlite:
    engine_kwargs.update({
        "pool_size": 20,
        "max_overflow": 10,
        "pool_pre_ping": True,
    })
else:
    engine_kwargs.update({
        "connect_args": {"timeout": 30.0},
    })

engine = create_async_engine(
    settings.database_url,
    **engine_kwargs,
)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """SQLAlchemy declarative base for all models."""
    pass


async def get_db() -> AsyncSession:  # type: ignore[misc]
    """FastAPI dependency: yields an async database session."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Initialize database — create tables and pgvector extension if PostgreSQL."""
    # Import all models so metadata is populated
    import backend.app.models  # noqa: F401
    from sqlalchemy import text

    async with engine.begin() as conn:
        if not is_sqlite:
            try:
                await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            except Exception:
                pass
        else:
            await conn.execute(text("PRAGMA journal_mode=WAL;"))
            await conn.execute(text("PRAGMA busy_timeout=15000;"))
        await conn.run_sync(Base.metadata.create_all)
