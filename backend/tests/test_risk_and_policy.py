"""Unit tests for Risk Engine, Policy Engine, and Finding Normalizer."""

from backend.app.scanners.fingerprint import generate_finding_fingerprint
from backend.app.scanners.normalizer import FindingNormalizer
from backend.app.services.risk import RiskEngine


def test_fingerprint_stability():
    fp1 = generate_finding_fingerprint(
        repository_id="repo_1",
        scanner="semgrep",
        scanner_rule="python.sql-injection",
        file_path="src/api/orders.py",
        finding_title="SQL Injection",
    )
    # Different line, same location/rule
    fp2 = generate_finding_fingerprint(
        repository_id="repo_1",
        scanner="semgrep",
        scanner_rule="python.sql-injection",
        file_path="src/api/orders.py",
        finding_title="SQL Injection",
    )
    assert fp1 == fp2
    assert len(fp1) == 64  # SHA-256 hex string


def test_finding_normalizer_deduplication():
    findings = [
        {
            "scanner": "semgrep",
            "scanner_rule": "python.sql-injection",
            "file_path": "src/api/orders.py",
            "title": "SQL Injection",
            "severity": "CRITICAL",
        },
        {
            "scanner": "gitleaks",
            "scanner_rule": "generic-secret",
            "file_path": "config/keys.py",
            "title": "Hardcoded Key",
            "severity": "HIGH",
        },
        # Duplicate of first finding
        {
            "scanner": "semgrep",
            "scanner_rule": "python.sql-injection",
            "file_path": "src/api/orders.py",
            "title": "SQL Injection",
            "severity": "CRITICAL",
        },
    ]

    deduped = FindingNormalizer.process_and_deduplicate("repo_1", findings)
    assert len(deduped) == 2


def test_risk_calculation_critical_finding():
    finding = {
        "severity": "CRITICAL",
        "confidence": "HIGH",
        "category": "INJECTION",
        "file_path": "src/api/payment_controller.py",
    }
    ai_assessment = {"confidence": 0.95}
    repo_context = {"visibility": "public"}

    risk = RiskEngine.calculate_risk(finding, ai_assessment, repo_context)
    assert risk.score >= 80.0
    assert risk.level == "CRITICAL"
    assert len(risk.breakdown.dimensions) == 6


def test_risk_calculation_low_finding():
    finding = {
        "severity": "LOW",
        "confidence": "LOW",
        "category": "CONFIG",
        "file_path": "docs/example.md",
    }
    risk = RiskEngine.calculate_risk(finding)
    assert risk.score < 40.0
    assert risk.level in ["LOW", "MINIMAL"]
