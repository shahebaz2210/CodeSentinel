"""Gitleaks Scanner Adapter — Secrets Detection with Redaction."""

from __future__ import annotations

import asyncio
import json
import shutil
import tempfile
from pathlib import Path
from typing import Any, Dict, List

from backend.app.core.logging import get_logger
from backend.app.scanners.base import Scanner, find_scanner_binary

logger = get_logger("gitleaks_scanner")


def redact_secret_evidence(raw_evidence: str, match: str) -> str:
    """Never expose plaintext secrets in evidence or storage."""
    if not match:
        return "[REDACTED SECRET]"
    redacted_match = match[:3] + "..." + match[-2:] if len(match) > 6 else "[REDACTED]"
    if match in raw_evidence:
        return raw_evidence.replace(match, redacted_match)
    return f"Line contains detected secret: {redacted_match}"


class GitleaksScanner(Scanner):
    name = "gitleaks"
    version = "8.18.0"

    async def scan(self, workspace_path: Path, config: Dict[str, Any]) -> Dict[str, Any]:
        """Execute gitleaks CLI asynchronously."""
        gitleaks_bin = find_scanner_binary("gitleaks")
        if not gitleaks_bin:
            logger.warning("gitleaks_binary_not_found", msg="Gitleaks not on system PATH; scanner skipped")
            return {"results": [], "errors": [{"message": "Gitleaks CLI not found"}]}

        with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as report_file:
            report_path = report_file.name

        cmd = [
            gitleaks_bin,
            "detect",
            f"--source={str(workspace_path)}",
            f"--report-path={report_path}",
            "--report-format=json",
            "--no-git",
        ]

        try:
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=str(workspace_path),
            )
            stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=300)

            # Gitleaks exits with code 1 if leaks are found, 0 if clean
            report_file_path = Path(report_path)
            if report_file_path.exists() and report_file_path.stat().st_size > 0:
                with open(report_file_path, "r", encoding="utf-8") as f:
                    try:
                        leaks = json.load(f)
                        return {"results": leaks, "errors": []}
                    except json.JSONDecodeError:
                        return {"results": [], "errors": [{"message": "Malformed Gitleaks JSON"}]}
            return {"results": [], "errors": []}
        except asyncio.TimeoutError:
            logger.error("gitleaks_timeout", path=str(workspace_path))
            return {"results": [], "errors": [{"message": "Gitleaks scan timed out"}]}
        except Exception as e:
            logger.error("gitleaks_execution_error", error=str(e))
            return {"results": [], "errors": [{"message": str(e)}]}
        finally:
            try:
                Path(report_path).unlink(missing_ok=True)
            except Exception:
                pass

    def normalize(self, raw_result: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Normalize Gitleaks results with REDACTED secrets."""
        findings = []
        raw_findings = raw_result.get("results", [])

        for rf in raw_findings:
            rule_id = rf.get("RuleID", "generic-secret")
            description = rf.get("Description", f"Hardcoded credential or token detected ({rule_id})")
            secret_match = rf.get("Secret", "")
            file_path = rf.get("File", "")
            start_line = rf.get("StartLine", 1)
            end_line = rf.get("EndLine", start_line)

            # Masked evidence for UI / storage
            masked_evidence = redact_secret_evidence(
                rf.get("Match", f"Secret detected on line {start_line}"),
                secret_match
            )

            findings.append({
                "title": f"Secret Detected: {rule_id.replace('-', ' ').title()}",
                "description": description,
                "category": "SECRET",
                "severity": "CRITICAL",
                "confidence": "HIGH",
                "scanner": "gitleaks",
                "scanner_rule": rule_id,
                "cwe_id": "CWE-798",  # Use of Hard-coded Credentials
                "owasp_category": "A07:2021-Identification and Authentication Failures",
                "file_path": file_path,
                "start_line": start_line,
                "end_line": end_line,
                "start_column": rf.get("StartColumn", 1),
                "end_column": rf.get("EndColumn", 1),
                "evidence": masked_evidence,
                "remediation": "1. Revoke and rotate the exposed credential immediately.\n2. Remove the secret from source code and commit history.\n3. Migrate to environment variables or a Secret Manager (AWS Secrets Manager, HashiCorp Vault).",
                "metadata": {
                    "rule_id": rule_id,
                    "entropy": rf.get("Entropy"),
                    "fingerprint": rf.get("Fingerprint"),
                },
            })

        return findings
