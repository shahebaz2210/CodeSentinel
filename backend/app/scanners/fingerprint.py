"""
Finding fingerprint generator.

Generates stable hash identifying logical security findings across line movements and minor refactors.
"""

from __future__ import annotations

import hashlib
from typing import Optional


def generate_finding_fingerprint(
    repository_id: str,
    scanner: str,
    scanner_rule: str,
    file_path: str,
    finding_title: Optional[str] = None,
    snippet_hash: Optional[str] = None,
) -> str:
    """
    Generate SHA-256 stable fingerprint.
    Does NOT depend on line number so line shifts won't create false duplicate findings.
    """
    normalized_path = file_path.replace("\\", "/").strip().lstrip("/")
    rule = (scanner_rule or "").strip()
    title = (finding_title or "").strip()

    raw = f"{repository_id}|{scanner.lower()}|{rule}|{normalized_path}|{title}"
    if snippet_hash:
        raw += f"|{snippet_hash}"

    return hashlib.sha256(raw.encode("utf-8")).hexdigest()
