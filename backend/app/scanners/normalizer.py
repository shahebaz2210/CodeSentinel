"""Finding normalizer — aggregates and deduplicates scanner outputs."""

from __future__ import annotations

from typing import Any, Dict, List
from backend.app.scanners.fingerprint import generate_finding_fingerprint


class FindingNormalizer:
    @staticmethod
    def process_and_deduplicate(
        repository_id: str,
        scanner_findings: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Assign stable fingerprints and merge overlapping findings across scanners.
        """
        dedup_map: Dict[str, Dict[str, Any]] = {}

        for f in scanner_findings:
            fp = generate_finding_fingerprint(
                repository_id=repository_id,
                scanner=f["scanner"],
                scanner_rule=f.get("scanner_rule", ""),
                file_path=f["file_path"],
                finding_title=f["title"],
            )
            f["stable_fingerprint"] = fp

            if fp in dedup_map:
                # Merge secondary scanner metadata if same issue found by two tools
                existing = dedup_map[fp]
                existing_scanners = existing.get("scanner_list", [existing["scanner"]])
                if f["scanner"] not in existing_scanners:
                    existing_scanners.append(f["scanner"])
                    existing["scanner_list"] = existing_scanners
            else:
                f["scanner_list"] = [f["scanner"]]
                dedup_map[fp] = f

        return list(dedup_map.values())
