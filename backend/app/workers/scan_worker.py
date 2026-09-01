"""RQ Worker job entry point."""

from __future__ import annotations

import asyncio
from backend.app.core.database import async_session_factory
from backend.app.core.logging import get_logger, setup_logging
from backend.app.workers.scan_pipeline import ScanPipeline

logger = get_logger("scan_worker")


def run_scan_job(scan_id: str) -> None:
    """Synchronous entry point called by RQ worker thread."""
    setup_logging()
    logger.info("scan_job_started", scan_id=scan_id)

    async def _async_runner():
        async with async_session_factory() as session:
            pipeline = ScanPipeline(session, scan_id)
            await pipeline.run()

    asyncio.run(_async_runner())
    logger.info("scan_job_finished", scan_id=scan_id)
