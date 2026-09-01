"""LLM Provider abstract base class."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Dict, List


class LLMProvider(ABC):
    name: str

    @abstractmethod
    async def generate_security_assessment(
        self,
        finding: Dict[str, Any],
        repository_context: Dict[str, Any],
        retrieved_knowledge: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Generate structured security assessment with prompt injection defense."""
        pass
