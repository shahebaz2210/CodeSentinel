"""Unit and regression tests for scanner adapters and normalizers."""

from __future__ import annotations

import pytest
from backend.app.scanners.fingerprint import generate_finding_fingerprint
from backend.app.scanners.gitleaks import GitleaksScanner, redact_secret_evidence
from backend.app.scanners.normalizer import FindingNormalizer
from backend.app.scanners.semgrep import SemgrepScanner


def test_gitleaks_secret_redaction():
    """Verify secrets are redacted and never leaked in plaintext."""
    secret = "ghp_1234567890abcdefghijklmnopqrstuvwxyz"
    raw_evidence = f"const apiKey = '{secret}';"
    redacted = redact_secret_evidence(raw_evidence, secret)
    
    assert secret not in redacted
    assert "ghp...yz" in redacted or "[REDACTED" in redacted


def test_gitleaks_normalization():
    """Verify raw Gitleaks JSON reports normalize into standard Finding schema."""
    scanner = GitleaksScanner()
    raw_report = {
        "results": [
            {
                "Description": "GitHub Personal Access Token",
                "RuleID": "github-pat",
                "File": "config/auth.ts",
                "StartLine": 12,
                "EndLine": 12,
                "StartColumn": 5,
                "EndColumn": 45,
                "Match": "ghp_secrettokenvalue123456789",
                "Secret": "ghp_secrettokenvalue123456789",
                "Entropy": 3.8,
            }
        ]
    }
    
    findings = scanner.normalize(raw_report)
    assert len(findings) == 1
    f = findings[0]
    assert "Secret Detected" in f["title"]
    assert f["severity"] == "CRITICAL"
    assert f["category"] == "SECRET"
    assert f["cwe_id"] == "CWE-798"
    assert f["file_path"] == "config/auth.ts"
    assert f["scanner"] == "gitleaks"
    assert "ghp_secrettokenvalue123456789" not in f["evidence"]


def test_semgrep_normalization():
    """Verify Semgrep JSON outputs map correctly to standard finding fields."""
    scanner = SemgrepScanner()
    raw_report = {
        "results": [
            {
                "check_id": "rules.python.security.sql-injection",
                "path": "app/db.py",
                "start": {"line": 45, "col": 10},
                "end": {"line": 45, "col": 60},
                "extra": {
                    "message": "Possible SQL injection detected in raw query string",
                    "severity": "ERROR",
                    "lines": "cursor.execute(f'SELECT * FROM users WHERE id = {user_id}')",
                    "metadata": {
                        "cwe": "CWE-89: SQL Injection",
                        "owasp": "A03:2021-Injection",
                    },
                },
            }
        ]
    }
    
    findings = scanner.normalize(raw_report)
    assert len(findings) == 1
    f = findings[0]
    assert f["severity"] == "CRITICAL"  # ERROR severity maps to CRITICAL
    assert f["cwe_id"] == "CWE-89"
    assert f["owasp_category"] == "A03:2021-Injection"
    assert f["file_path"] == "app/db.py"
    assert f["start_line"] == 45


def test_finding_normalizer_deduplication():
    """Verify FindingNormalizer correctly deduplicates identical findings."""
    raw_findings = [
        {
            "title": "Hardcoded Token",
            "scanner": "gitleaks",
            "scanner_rule": "github-pat",
            "file_path": "backend/auth.py",
            "start_line": 10,
            "severity": "CRITICAL",
            "confidence": "HIGH",
            "category": "SECRET",
            "evidence": "TOKEN = 'ghp_xxx'",
        },
        {
            "title": "Hardcoded Token",
            "scanner": "gitleaks",
            "scanner_rule": "github-pat",
            "file_path": "backend/auth.py",
            "start_line": 10,
            "severity": "CRITICAL",
            "confidence": "HIGH",
            "category": "SECRET",
            "evidence": "TOKEN = 'ghp_xxx'",
        },
    ]

    deduped = FindingNormalizer.process_and_deduplicate("repo-123", raw_findings)
    assert len(deduped) == 1
    assert "stable_fingerprint" in deduped[0]
    assert len(deduped[0]["stable_fingerprint"]) == 64
