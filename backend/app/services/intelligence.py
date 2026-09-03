"""Security Intelligence / RAG Service."""

from __future__ import annotations

import json
from typing import Any, Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.security_chunk import SecurityChunk
from backend.app.models.security_document import SecurityDocument
from backend.app.schemas.intelligence import SecurityDocumentResponse
from backend.app.services.embeddings import EmbeddingService


class IntelligenceService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.embedding_service = EmbeddingService()

    def chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """Split text into overlapping character chunks."""
        chunks = []
        start = 0
        text_len = len(text)

        while start < text_len:
            end = min(start + chunk_size, text_len)
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            if end == text_len:
                break
            start += chunk_size - overlap

        return chunks

    async def ingest_document(
        self, source_type: str, external_id: str, title: str, content: str, url: Optional[str] = None, metadata: Optional[dict] = None
    ) -> SecurityDocument:
        """Ingest document, chunk it, generate embeddings, and save chunks."""
        stmt = select(SecurityDocument).where(SecurityDocument.external_id == external_id)
        res = await self.db.execute(stmt)
        doc = res.scalar_one_or_none()

        meta_json = json.dumps(metadata) if metadata else None
        if not doc:
            doc = SecurityDocument(
                source_type=source_type,
                external_id=external_id,
                title=title,
                url=url,
                content=content,
                metadata_json=meta_json,
            )
            self.db.add(doc)
            await self.db.flush()

        # Chunk and embed
        chunks = self.chunk_text(content)
        for i, chunk_text in enumerate(chunks):
            embedding = await self.embedding_service.generate_embedding(chunk_text)
            embedding_str = self.embedding_service.serialize_embedding(embedding)

            chunk = SecurityChunk(
                document_id=doc.id,
                chunk_index=i,
                content=chunk_text,
                embedding_text=embedding_str,
                metadata_json=meta_json,
            )
            self.db.add(chunk)

        await self.db.flush()
        return doc

    async def retrieve_relevant_knowledge(
        self, query: str, cwe_id: Optional[str] = None, owasp_category: Optional[str] = None, top_k: int = 4
    ) -> List[Dict[str, Any]]:
        """
        Retrieve relevant security chunks using keyword and semantic search.
        """
        stmt = (
            select(SecurityChunk, SecurityDocument)
            .join(SecurityDocument, SecurityChunk.document_id == SecurityDocument.id)
        )
        res = await self.db.execute(stmt)
        rows = res.all()

        results = []
        q_lower = query.lower()
        cwe_lower = cwe_id.lower() if cwe_id else ""
        owasp_lower = owasp_category.lower() if owasp_category else ""

        for chunk, doc in rows:
            content_lower = chunk.content.lower()
            title_lower = doc.title.lower()
            doc_ext_lower = doc.external_id.lower()

            score = 0.0
            if cwe_lower and (cwe_lower in doc_ext_lower or cwe_lower in content_lower):
                score += 10.0
            if owasp_lower and (owasp_lower in doc_ext_lower or owasp_lower in content_lower):
                score += 8.0
            if any(term in content_lower for term in q_lower.split() if len(term) > 3):
                score += 5.0
            if any(term in title_lower for term in q_lower.split() if len(term) > 3):
                score += 6.0

            if score > 0:
                results.append({
                    "id": chunk.id,
                    "document_id": doc.id,
                    "source_type": doc.source_type,
                    "external_id": doc.external_id,
                    "title": doc.title,
                    "content": chunk.content,
                    "url": doc.url,
                    "score": score,
                })

        # Sort by relevance score desc
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

    async def list_documents(self, source_type: Optional[str] = None) -> List[SecurityDocumentResponse]:
        stmt = select(SecurityDocument)
        if source_type:
            stmt = stmt.where(SecurityDocument.source_type == source_type)
        stmt = stmt.order_by(SecurityDocument.external_id.asc())
        res = await self.db.execute(stmt)
        docs = res.scalars().all()
        return [SecurityDocumentResponse.model_validate(d) for d in docs]
