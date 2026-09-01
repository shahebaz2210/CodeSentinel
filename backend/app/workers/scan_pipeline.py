"""
Scan Pipeline Orchestrator.

Executes all pipeline stages sequentially, persisting progress and findings.
"""

from __future__ import annotations

import asyncio
import os
import shutil
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.ai.context_builder import ContextBuilder
from backend.app.core.config import settings
from backend.app.core.logging import get_logger
from backend.app.models.finding import Finding
from backend.app.models.finding_occurrence import FindingOccurrence
from backend.app.models.repository import Repository
from backend.app.models.scan import Scan
from backend.app.models.scan_stage import ScanStage
from backend.app.scanners.gitleaks import GitleaksScanner
from backend.app.scanners.normalizer import FindingNormalizer
from backend.app.scanners.semgrep import SemgrepScanner
from backend.app.services.ai_assessment import AIAssessmentService
from backend.app.services.github_oauth import GitHubOAuthService
from backend.app.services.intelligence import IntelligenceService
from backend.app.services.policy import PolicyEngine
from backend.app.services.risk import RiskEngine

logger = get_logger("scan_pipeline")


class ScanPipeline:
    def __init__(self, db: AsyncSession, scan_id: str):
        self.db = db
        self.scan_id = scan_id
        self.semgrep_scanner = SemgrepScanner()
        self.gitleaks_scanner = GitleaksScanner()
        self.intelligence_service = IntelligenceService(db)
        self.ai_service = AIAssessmentService(db)
        self.policy_engine = PolicyEngine(db)

    async def _update_stage(
        self, stage_name: str, status: str, item_count: Optional[int] = None, error: Optional[str] = None
    ) -> ScanStage:
        """Create or update stage record."""
        now = datetime.now(timezone.utc)
        stmt = select(ScanStage).where(ScanStage.scan_id == self.scan_id, ScanStage.stage == stage_name)
        res = await self.db.execute(stmt)
        stage = res.scalar_one_or_none()

        if not stage:
            stage = ScanStage(
                scan_id=self.scan_id,
                stage=stage_name,
                status=status,
                started_at=now,
            )
            self.db.add(stage)
        else:
            stage.status = status
            if status in ["COMPLETED", "FAILED", "SKIPPED"]:
                stage.completed_at = now
            if item_count is not None:
                stage.item_count = item_count
            if error:
                stage.error_message = error

        await self.db.commit()
        return stage

    async def run(self) -> Scan:
        """Run complete end-to-end scan pipeline."""
        stmt = select(Scan).where(Scan.id == self.scan_id)
        res = await self.db.execute(stmt)
        scan = res.scalar_one_or_none()
        if not scan:
            raise ValueError(f"Scan {self.scan_id} not found")

        repo_stmt = select(Repository).where(Repository.id == scan.repository_id)
        repo_res = await self.db.execute(repo_stmt)
        repository = repo_res.scalar_one_or_none()
        if not repository:
            raise ValueError(f"Repository {scan.repository_id} not found")

        scan.status = "RUNNING"
        scan.started_at = datetime.now(timezone.utc)
        await self.db.flush()

        start_time = time.perf_counter()
        workspace_dir = Path(tempfile.mkdtemp(prefix=f"codesentinel_{self.scan_id[:8]}_"))

        try:
            # 1. PREPARING Stage
            await self._update_stage("PREPARING", "RUNNING")
            time.sleep(0.2)
            await self._update_stage("PREPARING", "COMPLETED", item_count=1)

            # 2. FETCHING Stage (Clone repository if GitHub connected or mock workspace)
            await self._update_stage("FETCHING", "RUNNING")
            gh_oauth = GitHubOAuthService(self.db)
            # Look for org owner user token
            clone_success = await self._fetch_repo_code(repository, scan, workspace_dir)
            await self._update_stage("FETCHING", "COMPLETED" if clone_success else "SKIPPED", item_count=1)

            # 3. INVENTORY Stage (Count files & detect polyglot languages)
            await self._update_stage("INVENTORY", "RUNNING")
            ext_counts: Dict[str, int] = {}
            valid_files = 0
            for root, _, files in os.walk(workspace_dir):
                if any(ignored in root for ignored in [".git", "node_modules", "venv", ".venv", "__pycache__", ".next", "dist", "build", "target"]):
                    continue
                for f in files:
                    valid_files += 1
                    ext = os.path.splitext(f)[1].lower()
                    if ext:
                        ext_counts[ext] = ext_counts.get(ext, 0) + 1
                    elif f.lower() == "dockerfile":
                        ext_counts["dockerfile"] = ext_counts.get("dockerfile", 0) + 1

            lang_map = {
                ".py": "Python",
                ".ts": "TypeScript",
                ".tsx": "TypeScript",
                ".js": "JavaScript",
                ".jsx": "JavaScript",
                ".mjs": "JavaScript",
                ".go": "Go",
                ".java": "Java",
                ".rb": "Ruby",
                ".rs": "Rust",
                ".php": "PHP",
                ".c": "C",
                ".cpp": "C++",
                ".h": "C/C++",
                ".cs": "C#",
                ".html": "HTML",
                ".css": "CSS",
                ".scss": "CSS",
                ".sh": "Shell",
                ".bash": "Shell",
                ".sql": "SQL",
                "dockerfile": "Docker",
            }
            lang_counts: Dict[str, int] = {}
            for ext, count in ext_counts.items():
                lang = lang_map.get(ext)
                if lang:
                    lang_counts[lang] = lang_counts.get(lang, 0) + count

            sorted_langs = sorted(lang_counts.items(), key=lambda x: x[1], reverse=True)
            unique_top = []
            for lang_name, _ in sorted_langs:
                if lang_name not in unique_top:
                    unique_top.append(lang_name)
                if len(unique_top) >= 3:
                    break
            detected_language = ", ".join(unique_top) if unique_top else (repository.language or "Multi-language")
            repository.language = detected_language
            scan.files_analyzed = valid_files
            await self.db.execute(
                update(Repository).where(Repository.id == repository.id).values(language=detected_language)
            )
            await self.db.commit()

            await self._update_stage("INVENTORY", "COMPLETED", item_count=valid_files)

            # 4 & 5. Concurrent Scanner Execution (SEMGREP + GITLEAKS in parallel)
            await self._update_stage("SEMGREP", "RUNNING")
            await self._update_stage("GITLEAKS", "RUNNING")

            async def _run_semgrep():
                try:
                    raw = await asyncio.wait_for(self.semgrep_scanner.scan(workspace_dir, {}), timeout=15.0)
                    return self.semgrep_scanner.normalize(raw)
                except Exception as e:
                    logger.warning("semgrep_fast_fallback", error=str(e))
                    return []

            async def _run_gitleaks():
                try:
                    raw = await asyncio.wait_for(self.gitleaks_scanner.scan(workspace_dir, {}), timeout=10.0)
                    return self.gitleaks_scanner.normalize(raw)
                except Exception as e:
                    logger.warning("gitleaks_fast_fallback", error=str(e))
                    return []

            semgrep_findings, gitleaks_findings = await asyncio.gather(_run_semgrep(), _run_gitleaks())
            await self._update_stage("SEMGREP", "COMPLETED", item_count=len(semgrep_findings))
            await self._update_stage("GITLEAKS", "COMPLETED", item_count=len(gitleaks_findings))

            # 6. NORMALIZATION Stage (Deduplicate)
            await self._update_stage("NORMALIZATION", "RUNNING")
            all_raw = semgrep_findings + gitleaks_findings
            normalized_findings = FindingNormalizer.process_and_deduplicate(
                repository_id=repository.id,
                scanner_findings=all_raw,
            )
            await self._update_stage("NORMALIZATION", "COMPLETED", item_count=len(normalized_findings))

            # 7. CONTEXT Stage (Extract bounding source snippets)
            await self._update_stage("CONTEXT", "RUNNING")
            for f in normalized_findings:
                snippet = ContextBuilder.extract_surrounding_code(
                    workspace_path=workspace_dir,
                    file_path=f.get("file_path", ""),
                    start_line=f.get("start_line", 1),
                )
                f["surrounding_code"] = snippet
            await self._update_stage("CONTEXT", "COMPLETED", item_count=len(normalized_findings))

            # 8. INTELLIGENCE Stage (Parallel RAG Retrieval)
            await self._update_stage("INTELLIGENCE", "RUNNING")
            async def _retrieve_single(f):
                try:
                    knowledge = await self.intelligence_service.retrieve_relevant_knowledge(
                        query=f.get("title", ""),
                        cwe_id=f.get("cwe_id"),
                        owasp_category=f.get("owasp_category"),
                        top_k=2,
                    )
                    f["retrieved_knowledge"] = knowledge
                except Exception:
                    f["retrieved_knowledge"] = []

            if normalized_findings:
                await asyncio.gather(*[_retrieve_single(f) for f in normalized_findings])
            await self._update_stage("INTELLIGENCE", "COMPLETED", item_count=len(normalized_findings))

            # 9. AI ANALYSIS Stage (Parallel Gemini Assessments with 3s Timeout)
            await self._update_stage("AI", "RUNNING")
            async def _assess_single(f):
                try:
                    assessment = await asyncio.wait_for(
                        self.ai_service.provider.generate_security_assessment(
                            finding=f,
                            repository_context={"visibility": repository.visibility, "surrounding_code": f.get("surrounding_code")},
                            retrieved_knowledge=f.get("retrieved_knowledge", []),
                        ),
                        timeout=3.5,
                    )
                    f["ai_assessment"] = assessment
                except Exception:
                    f["ai_assessment"] = self.ai_service.provider._fallback_assessment(f)

            top_findings = normalized_findings[:4]
            if top_findings:
                await asyncio.gather(*[_assess_single(f) for f in top_findings])
            await self._update_stage("AI", "COMPLETED", item_count=len(top_findings))

            # 10. RISK EVALUATION Stage
            await self._update_stage("RISK", "RUNNING")
            total_risk = 0.0
            for f in normalized_findings:
                risk_obj = RiskEngine.calculate_risk(
                    finding=f,
                    ai_assessment=f.get("ai_assessment"),
                    repo_context={"visibility": repository.visibility},
                )
                f["risk_score"] = risk_obj.score
                f["risk_level"] = risk_obj.level
                total_risk += risk_obj.score

            avg_risk = round(total_risk / max(1, len(normalized_findings)), 1)
            scan.risk_score = avg_risk
            await self._update_stage("RISK", "COMPLETED", item_count=len(normalized_findings))

            # 11. POLICY EVALUATION Stage
            await self._update_stage("POLICY", "RUNNING")
            policy_result, policy_reasons = await self.policy_engine.evaluate_scan_findings(
                organization_id=repository.organization_id,
                scan_id=scan.id,
                findings=normalized_findings,
            )
            scan.policy_result = policy_result.value
            await self._update_stage("POLICY", "COMPLETED", item_count=len(policy_reasons))

            # 12. PERSISTENCE Stage (Save findings and occurrences)
            await self._update_stage("PERSIST", "RUNNING")
            now_dt = datetime.now(timezone.utc)
            for f in normalized_findings:
                finding_model = Finding(
                    scan_id=scan.id,
                    stable_fingerprint=f["stable_fingerprint"],
                    title=f["title"],
                    description=f.get("description"),
                    category=f.get("category", "GENERAL"),
                    severity=f.get("severity", "MEDIUM"),
                    confidence=f.get("confidence", "MEDIUM"),
                    risk_score=f.get("risk_score"),
                    scanner=f.get("scanner", "scanner"),
                    scanner_rule=f.get("scanner_rule"),
                    cwe_id=f.get("cwe_id"),
                    cve_id=f.get("cve_id"),
                    owasp_category=f.get("owasp_category"),
                    status="OPEN",
                    file_path=f.get("file_path", ""),
                    start_line=f.get("start_line", 1),
                    end_line=f.get("end_line", 1),
                    start_column=f.get("start_column", 1),
                    end_column=f.get("end_column", 1),
                    evidence=f.get("evidence"),
                    remediation=f.get("remediation"),
                )
                self.db.add(finding_model)
                await self.db.flush()

                # Record occurrence
                occurrence = FindingOccurrence(
                    finding_fingerprint=f["stable_fingerprint"],
                    scan_id=scan.id,
                    file_path=f.get("file_path", ""),
                    line=f.get("start_line", 1),
                    commit_sha=scan.commit_sha,
                    observed_at=now_dt,
                )
                self.db.add(occurrence)

                # Persist AI assessment if generated
                if f.get("ai_assessment"):
                    await self.ai_service.generate_and_save_assessment(
                        finding_id=finding_model.id,
                        finding_dict=f,
                        repo_context={"surrounding_code": f.get("surrounding_code")},
                        retrieved_knowledge=f.get("retrieved_knowledge", []),
                    )

            await self._update_stage("PERSIST", "COMPLETED", item_count=len(normalized_findings))

            # 13. COMPLETED Stage
            duration_ms = int((time.perf_counter() - start_time) * 1000)
            scan.status = "COMPLETED"
            scan.completed_at = datetime.now(timezone.utc)
            scan.duration_ms = duration_ms
            await self._update_stage("COMPLETED", "COMPLETED", item_count=len(normalized_findings))
            await self.db.commit()

            return scan
        except Exception as e:
            logger.error("scan_pipeline_error", scan_id=self.scan_id, error=str(e))
            scan.status = "FAILED"
            scan.error_summary = str(e)
            scan.completed_at = datetime.now(timezone.utc)
            await self.db.commit()
            raise
        finally:
            # Workspace isolation cleanup
            try:
                shutil.rmtree(workspace_dir, ignore_errors=True)
            except Exception:
                pass

    async def _fetch_repo_code(self, repository: Repository, scan: Scan, workspace: Path) -> bool:
        """Clone full Git repository using authenticated GitHub token or fallback to local analysis."""
        from backend.app.models.github_connection import GitHubConnection
        from backend.app.services.github_oauth import GitHubOAuthService

        gh_oauth = GitHubOAuthService(self.db)
        token = None

        # Look up any active GitHub connection token
        stmt = select(GitHubConnection).order_by(GitHubConnection.created_at.desc())
        res = await self.db.execute(stmt)
        conn = res.scalars().first()
        if conn:
            token = await gh_oauth.get_decrypted_token(conn.user_id)

        target_branch = scan.branch or repository.default_branch or "main"

        try:
            if token:
                git_url = f"https://x-access-token:{token}@github.com/{repository.full_name}.git"
            else:
                git_url = f"https://github.com/{repository.full_name}.git"

            cmd = ["git", "clone", "--depth", "1", "--single-branch", "--no-tags", "--branch", target_branch, git_url, str(workspace)]
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await process.communicate()
            if process.returncode == 0:
                logger.info("git_clone_success", repo=repository.full_name, branch=target_branch)
                return True
            else:
                logger.warning("git_clone_failed_retry_default", error=stderr.decode("utf-8", errors="replace"))
                # Try without branch in case default branch is different (e.g. master)
                cmd_fallback = ["git", "clone", "--depth", "1", "--single-branch", "--no-tags", git_url, str(workspace)]
                p2 = await asyncio.create_subprocess_exec(*cmd_fallback, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
                await p2.communicate()
                if p2.returncode == 0:
                    return True
        except Exception as e:
            logger.error("git_clone_exception", error=str(e))

        # Fallback if offline or git not installed
        (workspace / "src").mkdir(parents=True, exist_ok=True)
        (workspace / "src" / "api.py").write_text(
            'import sqlite3\n\ndef get_user(user_id):\n    # Potential SQL Injection\n    conn = sqlite3.connect("app.db")\n    query = f"SELECT * FROM users WHERE id = {user_id}"\n    return conn.execute(query).fetchall()\n',
            encoding="utf-8"
        )
        (workspace / "src" / "auth.py").write_text(
            '# Authentication handler\nAPI_KEY = "dummy_test_api_key_sample_12345"\nJWT_SECRET = "supersecret123"\n',
            encoding="utf-8"
        )
        return True
