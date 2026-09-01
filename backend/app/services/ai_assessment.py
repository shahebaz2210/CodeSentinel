"""AI Assessment Service."""

from __future__ import annotations

import json
from typing import Any, Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.ai.gemini_provider import GeminiProvider
from backend.app.core.config import settings
from backend.app.models.ai_assessment import AIAssessment
from backend.app.models.finding import Finding
from backend.app.schemas.finding import AIAssessmentResponse


class AIAssessmentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.provider = GeminiProvider()

    async def generate_and_save_assessment(
        self,
        finding_id: str,
        finding_dict: Dict[str, Any],
        repo_context: Dict[str, Any],
        retrieved_knowledge: List[Dict[str, Any]],
    ) -> AIAssessment:
        """Run AI reasoning pipeline and persist structured assessment."""
        assessment_data = await self.provider.generate_security_assessment(
            finding=finding_dict,
            repository_context=repo_context,
            retrieved_knowledge=retrieved_knowledge,
        )

        assessment = AIAssessment(
            finding_id=finding_id,
            model=settings.gemini_model,
            prompt_version="v1",
            summary=assessment_data.get("summary"),
            explanation=assessment_data.get("why_it_matters"),
            impact=assessment_data.get("impact"),
            remediation=assessment_data.get("remediation"),
            confidence=assessment_data.get("confidence", 0.8),
            uncertainty=json.dumps(assessment_data.get("uncertainty", [])),
            retrieved_sources=json.dumps(retrieved_knowledge),
        )
        self.db.add(assessment)
        await self.db.flush()
        return assessment

    async def get_by_finding_id(self, finding_id: str) -> Optional[AIAssessmentResponse]:
        stmt = select(AIAssessment).where(AIAssessment.finding_id == finding_id)
        res = await self.db.execute(stmt)
        record = res.scalar_one_or_none()
        if not record:
            return None

        uncertainty_list = []
        if record.uncertainty:
            try:
                uncertainty_list = json.loads(record.uncertainty)
            except Exception:
                pass

        sources_list = []
        if record.retrieved_sources:
            try:
                sources_list = json.loads(record.retrieved_sources)
            except Exception:
                pass

        return AIAssessmentResponse(
            id=record.id,
            finding_id=record.finding_id,
            model=record.model,
            prompt_version=record.prompt_version,
            summary=record.summary,
            explanation=record.explanation,
            impact=record.impact,
            remediation=record.remediation,
            confidence=record.confidence,
            uncertainty=uncertainty_list,
            retrieved_sources=sources_list,
            created_at=record.created_at,
        )
