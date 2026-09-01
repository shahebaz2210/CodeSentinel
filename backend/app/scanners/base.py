from __future__ import annotations

import os
import shutil
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any, Dict, List


def find_scanner_binary(binary_name: str) -> str | None:
    """Find binary on PATH or standard Python Scripts directories."""
    found = shutil.which(binary_name)
    if found:
        return found

    # Check Windows AppData Python Scripts
    appdata = os.environ.get("APPDATA")
    if appdata:
        for py_ver in ["Python313", "Python312", "Python311", "Python310"]:
            candidate = Path(appdata) / "Python" / py_ver / "Scripts" / f"{binary_name}.exe"
            if candidate.exists():
                return str(candidate)

    # Check local virtualenv / scripts
    local_candidate = Path(sys_executable_dir := Path(os.path.dirname(__import__("sys").executable))) / f"{binary_name}.exe"
    if local_candidate.exists():
        return str(local_candidate)

    return None


class Scanner(ABC):
    name: str
    version: str

    @abstractmethod
    async def scan(self, workspace_path: Path, config: Dict[str, Any]) -> Dict[str, Any]:
        """Execute scanner against workspace path and return raw output."""
        pass

    @abstractmethod
    def normalize(self, raw_result: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Transform scanner raw output into normalized finding dicts."""
        pass
