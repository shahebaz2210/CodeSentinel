"""Context builder — extracts bounded code snippets around findings."""

from __future__ import annotations

from pathlib import Path
from typing import Optional


class ContextBuilder:
    @staticmethod
    def extract_surrounding_code(
        workspace_path: Optional[Path], file_path: str, start_line: int, window: int = 15
    ) -> str:
        """Extract lines before and after vulnerable line with line numbers."""
        if not workspace_path:
            return ""

        full_file_path = workspace_path / file_path.lstrip("/\\")
        if not full_file_path.exists() or not full_file_path.is_file():
            return ""

        try:
            with open(full_file_path, "r", encoding="utf-8", errors="replace") as f:
                lines = f.readlines()

            total = len(lines)
            start_idx = max(0, start_line - window - 1)
            end_idx = min(total, start_line + window)

            snippet_lines = []
            for i in range(start_idx, end_idx):
                line_num = i + 1
                prefix = ">> " if line_num == start_line else "   "
                snippet_lines.append(f"{prefix}{line_num:4d} | {lines[i].rstrip()}")

            return "\n".join(snippet_lines)
        except Exception:
            return ""
