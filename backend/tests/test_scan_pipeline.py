"""Tests for Scan Pipeline stages, context extraction, and risk assessment."""

from __future__ import annotations

import tempfile
from pathlib import Path
import pytest

from backend.app.ai.context_builder import ContextBuilder
from backend.app.services.risk import RiskEngine


def test_context_builder_surrounding_code():
    """Verify ContextBuilder extracts line numbers and marker correctly."""
    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_path = Path(tmpdir)
        test_file = tmp_path / "vulnerable.py"
        test_file.write_text(
            "\n".join([f"line_{i} = {i}" for i in range(1, 30)]),
            encoding="utf-8"
        )

        snippet = ContextBuilder.extract_surrounding_code(
            workspace_path=tmp_path,
            file_path="vulnerable.py",
            start_line=15,
            window=3,
        )

        assert ">>   15 | line_15 = 15" in snippet
        assert "     12 | line_12 = 12" in snippet
        assert "     18 | line_18 = 18" in snippet


def test_risk_engine_public_repo_multiplier():
    """Verify public repositories receive appropriate risk score adjustments."""
    finding = {
        "severity": "HIGH",
        "confidence": "HIGH",
        "category": "INJECTION",
    }
    
    private_risk = RiskEngine.calculate_risk(finding, repo_context={"visibility": "private"})
    public_risk = RiskEngine.calculate_risk(finding, repo_context={"visibility": "public"})
    
    assert public_risk.score >= private_risk.score


def test_risk_engine_secret_multiplier():
    """Verify hardcoded secrets are assigned maximum risk severity."""
    finding = {
        "severity": "CRITICAL",
        "confidence": "HIGH",
        "category": "SECRET",
    }
    
    risk = RiskEngine.calculate_risk(finding, repo_context={"visibility": "public"})
    assert risk.score >= 9.0
    assert risk.level == "CRITICAL"
