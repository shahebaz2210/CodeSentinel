"""
CodeSentinel Worker Process.

Starts an RQ worker listening on Redis queue for async scan jobs.
Run with: python -m backend.app.workers.worker_main
"""

import sys
from redis import Redis
from rq import Worker, Queue, Connection

from backend.app.core.config import settings
from backend.app.core.logging import get_logger, setup_logging

setup_logging("DEBUG" if settings.app_debug else "INFO")
logger = get_logger("worker_main")


def main():
    redis_conn = Redis.from_url(settings.redis_url)
    listen = [settings.worker_queue_name]

    logger.info("starting_codesentinel_worker", queues=listen, redis=settings.redis_url)

    with Connection(redis_conn):
        worker = Worker(map(Queue, listen))
        worker.work()


if __name__ == "__main__":
    main()
