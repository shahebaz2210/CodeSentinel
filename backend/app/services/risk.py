"""
Risk Engine.

Transparent, explainable risk score calculation using 6 dimensions:
1. Severity (Base scanner severity)
2. Confidence (Scanner and AI certainty)
3. Exploitability (Ease of weaponization / remote reachability)
4. Exposure (Public visibility / external API endpoint exposure)
5. Repository Context (Production criticality, sensitive directory)
6. Business Impact (Data breach, financial, regulatory, RCE)
"""

from __future__ import annotations

from typing import Any, Dict
from backend.app.schemas.risk import RiskBreakdown, RiskDimension, RiskScore


class RiskEngine:
    VERSION = "v1.0"

    # Dimension Weights (sum to 1.0)
    WEIGHTS = {
        "severity": 0.30,
        "confidence": 0.15,
        "exploitability": 0.20,
        "exposure": 0.15,
        "context": 0.10,
        "business_impact": 0.10,
    }

    @classmethod
    def calculate_risk(
        cls,
        finding: Dict[str, Any],
        ai_assessment: Dict[str, Any] | None = None,
        repo_context: Dict[str, Any] | None = None,
    ) -> RiskScore:
        """Calculate normalized 0-100 risk score and dimension breakdown."""
        # 1. Severity Score (0.0 - 1.0)
        sev = str(finding.get("severity", "MEDIUM")).upper()
        if sev == "CRITICAL":
            sev_score = 1.0
        elif sev == "HIGH":
            sev_score = 0.8
        elif sev == "MEDIUM":
            sev_score = 0.5
        elif sev == "LOW":
            sev_score = 0.25
        else:
            sev_score = 0.1

        # 2. Confidence Score (0.0 - 1.0)
        conf = str(finding.get("confidence", "MEDIUM")).upper()
        if conf == "HIGH":
            conf_score = 0.95
        elif conf == "MEDIUM":
            conf_score = 0.70
        else:
            conf_score = 0.40

        # Adjust confidence with AI if available
        if ai_assessment and "confidence" in ai_assessment:
            ai_conf = float(ai_assessment["confidence"])
            conf_score = (conf_score + ai_conf) / 2.0

        # 3. Exploitability Score (0.0 - 1.0)
        category = str(finding.get("category", "GENERAL")).upper()
        if category in ["SECRET", "INJECTION", "RCE"]:
            exploit_score = 0.95
        elif category in ["XSS", "AUTHENTICATION"]:
            exploit_score = 0.75
        elif category in ["CRYPTOGRAPHY", "CONFIG"]:
            exploit_score = 0.55
        else:
            exploit_score = 0.40

        # 4. Exposure Score (0.0 - 1.0)
        file_path = str(finding.get("file_path", "")).lower()
        if any(term in file_path for term in ["api", "route", "controller", "endpoint", "public", "handler", "view"]):
            exposure_score = 0.90
        elif any(term in file_path for term in ["test", "fixture", "mock", "spec", "example", "doc"]):
            exposure_score = 0.20
        else:
            exposure_score = 0.60

        # 5. Repository Context Score (0.0 - 1.0)
        visibility = str(repo_context.get("visibility", "private")).lower() if repo_context else "private"
        context_score = 0.85 if visibility == "public" else 0.65

        # 6. Business Impact Score (0.0 - 1.0)
        if category == "SECRET" or sev == "CRITICAL":
            business_impact_score = 0.95
        elif sev == "HIGH":
            business_impact_score = 0.80
        elif sev == "MEDIUM":
            business_impact_score = 0.50
        else:
            business_impact_score = 0.20

        # Weighted Composite Score
        composite = (
            (sev_score * cls.WEIGHTS["severity"])
            + (conf_score * cls.WEIGHTS["confidence"])
            + (exploit_score * cls.WEIGHTS["exploitability"])
            + (exposure_score * cls.WEIGHTS["exposure"])
            + (context_score * cls.WEIGHTS["context"])
            + (business_impact_score * cls.WEIGHTS["business_impact"])
        )

        final_score = round(composite * 100.0, 1)

        # Determine level label
        if final_score >= 80.0:
            level = "CRITICAL"
        elif final_score >= 60.0:
            level = "HIGH"
        elif final_score >= 40.0:
            level = "MEDIUM"
        elif final_score >= 20.0:
            level = "LOW"
        else:
            level = "MINIMAL"

        dimensions = [
            RiskDimension(name="Severity", weight=cls.WEIGHTS["severity"], score=round(sev_score, 2), description="Intrinsic severity from security scanner rules"),
            RiskDimension(name="Confidence", weight=cls.WEIGHTS["confidence"], score=round(conf_score, 2), description="Certainty of detection without false positives"),
            RiskDimension(name="Exploitability", weight=cls.WEIGHTS["exploitability"], score=round(exploit_score, 2), description="Practical ease of malicious weaponization"),
            RiskDimension(name="Exposure", weight=cls.WEIGHTS["exposure"], score=round(exposure_score, 2), description="Accessibility via public API, web route or untrusted entry point"),
            RiskDimension(name="Repository Context", weight=cls.WEIGHTS["context"], score=round(context_score, 2), description="Production sensitivity and repository visibility"),
            RiskDimension(name="Business Impact", weight=cls.WEIGHTS["business_impact"], score=round(business_impact_score, 2), description="Potential impact on data integrity, finances, or compliance"),
        ]

        breakdown = RiskBreakdown(
            severity_score=round(sev_score, 2),
            confidence_score=round(conf_score, 2),
            exploitability_score=round(exploit_score, 2),
            exposure_score=round(exposure_score, 2),
            context_score=round(context_score, 2),
            business_impact_score=round(business_impact_score, 2),
            dimensions=dimensions,
        )

        explanation = (
            f"Risk score {final_score}/100 ({level}) evaluated based on {sev} severity with {conf} confidence, "
            f"in an exposed location ({file_path or 'unknown'}) with {category} attack surface."
        )

        return RiskScore(
            score=final_score,
            level=level,
            version=cls.VERSION,
            breakdown=breakdown,
            explanation=explanation,
        )
