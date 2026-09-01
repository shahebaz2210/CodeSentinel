"""
Seed script to ingest OWASP Top 10 and CWE datasets into pgvector knowledge base.

Run with: python -m backend.scripts.seed_knowledge
"""

import asyncio
import json
from pathlib import Path
import sys

# Ensure root is in sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from backend.app.core.database import async_session_factory
from backend.app.core.logging import get_logger, setup_logging
from backend.app.services.intelligence import IntelligenceService

setup_logging("INFO")
logger = get_logger("seed_knowledge")


async def seed_knowledge_base():
    logger.info("starting_knowledge_seeding")

    knowledge_dir = root_dir / "knowledge"
    owasp_file = knowledge_dir / "owasp" / "owasp_top10.json"
    cwe_file = knowledge_dir / "cwe" / "cwe_top25.json"

    async with async_session_factory() as session:
        service = IntelligenceService(session)

        # 1. Seed OWASP Top 10
        if owasp_file.exists():
            with open(owasp_file, "r", encoding="utf-8") as f:
                owasp_data = json.load(f)

            for item in owasp_data:
                await service.ingest_document(
                    source_type="OWASP",
                    external_id=item["external_id"],
                    title=item["title"],
                    content=item["content"],
                    url=item.get("url"),
                    metadata={"cwe_ids": item.get("cwe_ids", [])},
                )
            logger.info("owasp_documents_ingested", count=len(owasp_data))

        # 2. Seed CWE Top 25
        if cwe_file.exists():
            with open(cwe_file, "r", encoding="utf-8") as f:
                cwe_data = json.load(f)

            for item in cwe_data:
                full_content = f"{item['description']}\n\nMitigation Guidance:\n{item['mitigation']}"
                await service.ingest_document(
                    source_type="CWE",
                    external_id=item["external_id"],
                    title=item["title"],
                    content=full_content,
                    url=f"https://cwe.mitre.org/data/definitions/{item['external_id'].replace('CWE-', '')}.html",
                )
            logger.info("cwe_documents_ingested", count=len(cwe_data))

        await session.commit()
        logger.info("knowledge_seeding_completed_successfully")


if __name__ == "__main__":
    asyncio.run(seed_knowledge_base())
