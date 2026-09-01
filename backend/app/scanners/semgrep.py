"""Semgrep Scanner Adapter."""

from __future__ import annotations

import asyncio
import json
import shutil
from pathlib import Path
from typing import Any, Dict, List

from backend.app.core.logging import get_logger
from backend.app.scanners.base import Scanner, find_scanner_binary

logger = get_logger("semgrep_scanner")


class SemgrepScanner(Scanner):
    name = "semgrep"
    version = "1.0.0"

    async def scan(self, workspace_path: Path, config: Dict[str, Any]) -> Dict[str, Any]:
        """Execute semgrep CLI asynchronously with json output."""
        semgrep_bin = find_scanner_binary("semgrep")
        if not semgrep_bin:
            logger.warning("semgrep_binary_not_found", msg="Semgrep not found on system PATH; using built-in AST analyzer fallback")
            return {"results": [], "errors": [{"message": "Semgrep CLI not found"}]}

        rules_config = config.get("rules", "auto")
        cmd = [
            semgrep_bin,
            "scan",
            f"--config={rules_config}",
            "--json",
            "--quiet",
            "--no-git-ignore",
            str(workspace_path),
        ]

        try:
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=str(workspace_path),
            )
            stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=300)

            if stdout:
                try:
                    return json.loads(stdout.decode("utf-8", errors="replace"))
                except json.JSONDecodeError:
                    return {"results": [], "errors": [{"message": "Invalid JSON output from Semgrep"}]}
            return {"results": [], "errors": []}
        except asyncio.TimeoutError:
            logger.error("semgrep_timeout", path=str(workspace_path))
            return {"results": [], "errors": [{"message": "Semgrep scan timed out after 300s"}]}
        except Exception as e:
            logger.error("semgrep_execution_error", error=str(e))
            return {"results": [], "errors": [{"message": str(e)}]}

    def normalize(self, raw_result: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Normalize raw Semgrep output to CodeSentinel findings format."""
        findings = []
        raw_findings = raw_result.get("results", [])

        for rf in raw_findings:
            check_id = rf.get("check_id", "semgrep.rule")
            extra = rf.get("extra", {})
            message = extra.get("message", rf.get("message", "Security issue detected"))
            metadata = extra.get("metadata", {})

            # Severity mapping: ERROR -> CRITICAL/HIGH, WARNING -> MEDIUM, INFO -> LOW
            raw_sev = str(extra.get("severity", "WARNING")).upper()
            if raw_sev == "ERROR":
                severity = "HIGH"
            elif raw_sev == "WARNING":
                severity = "MEDIUM"
            elif raw_sev == "INFO":
                severity = "LOW"
            else:
                severity = "MEDIUM"

            # CWE and OWASP mappings from metadata
            cwe_list = metadata.get("cwe", [])
            cwe_id = None
            if isinstance(cwe_list, list) and cwe_list:
                cwe_id = str(cwe_list[0]).split(":")[0].strip()
            elif isinstance(cwe_list, str):
                cwe_id = cwe_list.split(":")[0].strip()

            owasp_list = metadata.get("owasp", [])
            owasp_cat = None
            if isinstance(owasp_list, list) and owasp_list:
                owasp_cat = str(owasp_list[0])
            elif isinstance(owasp_list, str):
                owasp_cat = owasp_list

            category = metadata.get("category", "SECURITY").upper()
            if "sql" in check_id.lower() or "injection" in check_id.lower():
                category = "INJECTION"
                severity = "CRITICAL" if raw_sev == "ERROR" else "HIGH"
            elif "xss" in check_id.lower():
                category = "XSS"
            elif "crypto" in check_id.lower():
                category = "CRYPTOGRAPHY"
            elif "auth" in check_id.lower() or "jwt" in check_id.lower():
                category = "AUTHENTICATION"

            confidence = str(metadata.get("confidence", "MEDIUM")).upper()
            if confidence not in ["HIGH", "MEDIUM", "LOW"]:
                confidence = "MEDIUM"

            lines = extra.get("lines", "")
            start = rf.get("start", {})
            end = rf.get("end", {})

            findings.append({
                "title": f"Semgrep: {check_id.split('.')[-1].replace('-', ' ').title()}",
                "description": message,
                "category": category,
                "severity": severity,
                "confidence": confidence,
                "scanner": "semgrep",
                "scanner_rule": check_id,
                "cwe_id": cwe_id or "CWE-20",
                "owasp_category": owasp_cat,
                "file_path": rf.get("path", ""),
                "start_line": start.get("line", 1),
                "end_line": end.get("line", start.get("line", 1)),
                "start_column": start.get("col", 1),
                "end_column": end.get("col", 1),
                "evidence": lines or message,
                "remediation": metadata.get("fix", "Review vulnerable line and apply input sanitization / secure API."),
                "metadata": metadata,
            })

        return findings
