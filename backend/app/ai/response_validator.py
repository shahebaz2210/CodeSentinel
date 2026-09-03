"""Structured AI response validator."""

from __future__ import annotations

import json
from typing import Any, Dict, Optional


class ResponseValidator:
    REQUIRED_KEYS = ["summary", "why_it_matters", "impact", "remediation", "confidence"]

    @classmethod
    def clean_and_parse(cls, raw_text: str) -> Optional[Dict[str, Any]]:
        """Clean markdown fences and parse structured JSON."""
        cleaned = raw_text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        try:
            data = json.loads(cleaned)
            if not isinstance(data, dict):
                return None

            # Validate required keys
            for k in cls.REQUIRED_KEYS:
                if k not in data:
                    data[k] = "N/A"

            # Clamp confidence to [0.0, 1.0]
            try:
                conf = float(data.get("confidence", 0.8))
                data["confidence"] = max(0.0, min(1.0, conf))
            except Exception:
                data["confidence"] = 0.8

            if not isinstance(data.get("uncertainty"), list):
                data["uncertainty"] = []

            if not isinstance(data.get("references"), list):
                data["references"] = []

            return data
        except Exception:
            return None
