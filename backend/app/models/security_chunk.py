"""Security chunk model — stores embedded chunks for RAG vector search."""

from __future__ import annotations

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from backend.app.models.base import BaseModel

# Note: pgvector column will use raw SQL in migration if pgvector extension unavailable at import time


class SecurityChunk(BaseModel):
    __tablename__ = "security_chunks"

    document_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("security_documents.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    embedding_text: Mapped[str | None] = mapped_column(Text, nullable=True)  # Serialized embedding for portability
    metadata_json: Mapped[str | None] = mapped_column(Text, nullable=True)
