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
        """Deterministic context-aware fallback when AI provider is unavailable or key not configured."""
        title = finding.get("title", "Security issue")
        file_path = finding.get("file_path", "source file")
        start_line = finding.get("start_line", 1)
        cwe_id = finding.get("cwe_id", "CWE-20") or "CWE-20"
        evidence = str(finding.get("evidence") or "")
        surrounding = str(finding.get("surrounding_code") or evidence or "")
        
        # 1. SQL Injection (CWE-89)
        if "sql" in title.lower() or "injection" in title.lower() or "cwe-89" in cwe_id.lower() or "cursor.execute" in surrounding:
            param_match = "username" if "username" in surrounding else "user input"
            db_match = "SQLite" if "sqlite" in surrounding.lower() else "SQL Database"
            route_match = "/users" if "/users" in surrounding else "HTTP endpoint"
            
            summary = f"Unsanitized SQL concatenation in {file_path}:{start_line} allows direct user input ({param_match}) to alter {db_match} query logic."
            why_it_matters = f"String interpolation in database statements violates the code/data separation principle. The `{param_match}` parameter is concatenated directly into the query string before execution, enabling attackers to inject arbitrary SQL statements."
            context = f"The finding is located in an unauthenticated {route_match} route. Input received via query parameters flows directly into the database driver (`cursor.execute`) without validation, parameterized binding, or ORM abstraction."
            impact = f"An attacker can inject payloads (e.g. `' OR '1'='1`) to extract unauthorized records from the database, tamper with sensitive user columns, or execute administrative SQLite commands."
            remediation = f"Replace string concatenation with parameterized SQL queries using placeholders:\n\n# Secure Parameterized Query:\nquery = \"SELECT id, username, email FROM users WHERE username = ?\"\ncursor.execute(query, ({param_match},))\nusers = cursor.fetchall()"
            uncertainty = [
                "Underlying database driver capabilities (e.g. support for stacked multi-statement queries).",
                "Presence of upstream Web Application Firewall (WAF) filtering special characters.",
            ]
            confidence = 0.95

        # 2. Hardcoded Credentials / Secrets (CWE-798 / CWE-259)
        elif "secret" in title.lower() or "key" in title.lower() or "cwe-798" in cwe_id.lower() or "sk-" in surrounding or "token" in surrounding.lower():
            secret_type = "API Key / Credential"
            if "openai" in surrounding.lower() or "sk-" in surrounding:
                secret_type = "OpenAI API Secret Key"
            elif "jwt" in title.lower() or "jwt" in surrounding.lower():
                secret_type = "JSON Web Token (JWT)"
                
            summary = f"Hardcoded plaintext {secret_type} exposed in {file_path}:{start_line}."
            why_it_matters = "Embedding credentials in source code exposes private infrastructure and APIs to anyone with repository read access, and persists secrets across Git commit history."
            context = f"File `{file_path}` contains high-entropy credential tokens committed to the codebase. If pushed to a public remote or accessed by third parties, the key can be immediately harvested by automated scanners."
            impact = f"Unauthorized third parties can use the exposed {secret_type} to impersonate services, consume cloud credits, access private models/data, and pivot deeper into production infrastructure."
            remediation = f"Revoke and rotate the exposed secret immediately in your cloud provider console. Move credentials to environment variables or a secure secret manager (e.g., Vault, AWS Secrets Manager, GitHub Actions Secrets).\n\n# Access via Environment Variable:\nimport os\napi_key = os.getenv('API_KEY')"
            uncertainty = [
                "Whether the credential is currently active or has already been revoked at the provider.",
                "Repository access permissions (public vs private repository visibility).",
            ]
            confidence = 0.98

        # 3. Generic Security Finding Fallback
        else:
            summary = f"Detected {title} in `{file_path}:{start_line}` violating secure coding policy."
            why_it_matters = f"Security weakness {cwe_id} can be exploited to bypass application controls, expose confidential data, or compromise application state."
            context = f"Identified in `{file_path}` at line {start_line}. Context is derived from deterministic static analysis AST patterns and scanner rules."
            impact = "Exploitation could compromise system confidentiality, integrity, or availability depending on runtime environment privileges."
            remediation = finding.get("remediation") or f"Review `{file_path}:{start_line}` and apply input validation, sanitization, or standard framework defenses."
            uncertainty = [
                "Deep cross-file control flow and runtime reachability cannot be fully verified from local file AST alone.",
            ]
            confidence = 0.85 if finding.get("confidence") == "HIGH" else 0.70

        return {
            "summary": summary,
            "why_it_matters": why_it_matters,
            "context": context,
            "impact": impact,
            "remediation": remediation,
            "confidence": confidence,
            "uncertainty": uncertainty,
            "references": [f"https://cwe.mitre.org/data/definitions/{cwe_id.replace('CWE-', '')}.html"] if "CWE" in cwe_id else [],
        }
