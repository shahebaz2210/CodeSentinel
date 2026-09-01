"""Embedding Service using Gemini / fallback local hashing."""

from __future__ import annotations

import json
from typing import List, Optional
import google.generativeai as genai

from backend.app.core.config import settings
from backend.app.core.logging import get_logger

logger = get_logger("embeddings_service")


class EmbeddingService:
    def __init__(self):
        if settings.gemini_api_key:
            genai.configure(api_key=settings.gemini_api_key)

    async def generate_embedding(self, text: str) -> Optional[List[float]]:
        """Generate embedding vector using Gemini text-embedding-004."""
        if not settings.gemini_api_key:
            return None

        try:
            result = genai.embed_content(
                model=f"models/{settings.gemini_embedding_model}",
                content=text,
                task_type="retrieval_document",
            )
            return result.get("embedding", [])
        except Exception as e:
            logger.warning("gemini_embedding_failed", error=str(e))
            return None

    def serialize_embedding(self, vector: Optional[List[float]]) -> Optional[str]:
        if not vector:
            return None
        return json.dumps(vector)

    def deserialize_embedding(self, text: Optional[str]) -> Optional[List[float]]:
        if not text:
            return None
        try:
            return json.loads(text)
        except Exception:
            return None
