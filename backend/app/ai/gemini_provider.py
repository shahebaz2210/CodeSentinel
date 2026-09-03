"""Gemini LLM Provider implementation."""

from __future__ import annotations

from typing import Any, Dict, List
import google.generativeai as genai

from backend.app.ai.prompts import ANALYSIS_PROMPT_TEMPLATE, SYSTEM_INSTRUCTION
from backend.app.ai.provider_base import LLMProvider
from backend.app.ai.response_validator import ResponseValidator
from backend.app.core.config import settings
from backend.app.core.logging import get_logger

logger = get_logger("gemini_provider")


class GeminiProvider(LLMProvider):
    name = "gemini"

    def __init__(self):
        if settings.gemini_api_key:
            genai.configure(api_key=settings.gemini_api_key)

    async def generate_security_assessment(
        self,
        finding: Dict[str, Any],
        repository_context: Dict[str, Any],
        retrieved_knowledge: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Call Gemini model to analyze finding with structured response."""
        if not settings.gemini_api_key:
            logger.info("gemini_api_key_missing_fallback")
            return self._fallback_assessment(finding)

        knowledge_summary = "\n".join([
            f"- [{k.get('external_id')}] {k.get('title')}: {k.get('content')[:200]}..."
            for k in retrieved_knowledge
        ]) if retrieved_knowledge else "No specific external knowledge retrieved."

        prompt = ANALYSIS_PROMPT_TEMPLATE.format(
            title=finding.get("title", "Security Finding"),
            scanner=finding.get("scanner", "scanner"),
            scanner_rule=finding.get("scanner_rule", "rule"),
            file_path=finding.get("file_path", ""),
            start_line=finding.get("start_line", 1),
            end_line=finding.get("end_line", 1),
            cwe_id=finding.get("cwe_id", "CWE-Unknown"),
            owasp_category=finding.get("owasp_category", "N/A"),
            evidence=finding.get("evidence", ""),
            surrounding_code=repository_context.get("surrounding_code", "Code not available."),
            retrieved_knowledge=knowledge_summary,
        )

        try:
            target_model = settings.gemini_model or "gemini-2.5-flash"
            try:
                model = genai.GenerativeModel(
                    model_name=target_model,
                    system_instruction=SYSTEM_INSTRUCTION,
                )
                response = await model.generate_content_async(prompt)
            except Exception:
                # Fallback to gemini-flash-latest
                model = genai.GenerativeModel(
                    model_name="gemini-flash-latest",
                    system_instruction=SYSTEM_INSTRUCTION,
                )
                response = await model.generate_content_async(prompt)

            parsed = ResponseValidator.clean_and_parse(response.text)
            if parsed:
                return parsed
            return self._fallback_assessment(finding)
        except Exception as e:
            logger.error("gemini_generation_error", error=str(e))
            return self._fallback_assessment(finding)

    def _fallback_assessment(self, finding: Dict[str, Any]) -> Dict[str, Any]:
        """Deterministic fallback when AI provider is unavailable or key not configured."""
        title = finding.get("title", "Security issue")
        remediation = finding.get("remediation", "Review and fix vulnerable line.")
        cwe_id = finding.get("cwe_id", "CWE-20")

        return {
            "summary": f"Detected potential {title} in {finding.get('file_path')}:{finding.get('start_line')}.",
            "why_it_matters": "Security weaknesses can be exploited to bypass authentication, expose data, or compromise application state.",
            "context": "Context derived from deterministic scanner rule and line location.",
            "impact": "Exploitation could compromise confidentiality, integrity, or availability depending on execution privileges.",
            "remediation": remediation,
            "confidence": 0.85 if finding.get("confidence") == "HIGH" else 0.65,
            "uncertainty": ["Deep cross-file reachability analysis requires full runtime testing."],
            "references": [f"https://cwe.mitre.org/data/definitions/{cwe_id.replace('CWE-', '')}.html"] if "CWE" in cwe_id else [],
        }
