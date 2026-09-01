"""Deterministic Policy Evaluation Engine."""

from __future__ import annotations

import json
from typing import Any, Dict, List, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.policy import Policy
from backend.app.models.policy_evaluation import PolicyEvaluation
from backend.app.schemas.policy import PolicyConfig, PolicyCreate, PolicyEvaluationResult, PolicyResponse, PolicyResultEnum, PolicyUpdate
from backend.app.services.exception import ExceptionService


class PolicyEngine:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.exception_service = ExceptionService(db)

    async def get_or_create_default_policy(self, organization_id: str) -> Policy:
        """Fetch default org policy or create one if none exists."""
        stmt = select(Policy).where(Policy.organization_id == organization_id, Policy.enabled == True).order_by(Policy.created_at.desc())
        res = await self.db.execute(stmt)
        policy = res.scalars().first()

        if not policy:
            default_config = PolicyConfig(
                block_critical=True,
                block_high_with_high_confidence=True,
                block_secrets=True,
                severity_threshold="HIGH",
                confidence_threshold="MEDIUM",
                allow_approved_exceptions=True,
            )
            policy = Policy(
                organization_id=organization_id,
                name="Default Production Security Policy",
                description="Strict gate blocking Critical issues, exposed secrets, and High severity findings.",
                enabled=True,
                configuration_json=default_config.model_dump_json(),
            )
            self.db.add(policy)
            await self.db.flush()

        return policy

    async def evaluate_scan_findings(
        self, organization_id: str, scan_id: str, findings: List[Dict[str, Any]]
    ) -> Tuple[PolicyResultEnum, List[str]]:
        """
        Evaluate normalized findings against active organization policies.
        Returns overall Result (PASS, WARN, FAIL) and human-readable reasons.
        """
        policy = await self.get_or_create_default_policy(organization_id)
        config_dict = json.loads(policy.configuration_json)
        config = PolicyConfig(**config_dict)

        reasons = []
        is_failed = False
        is_warned = False

        for f in findings:
            fp = f.get("stable_fingerprint", "")
            sev = str(f.get("severity", "MEDIUM")).upper()
            conf = str(f.get("confidence", "MEDIUM")).upper()
            cat = str(f.get("category", "")).upper()
            title = f.get("title", "Finding")
            loc = f"{f.get('file_path')}:{f.get('start_line')}"

            # Check if active exception exists
            if config.allow_approved_exceptions:
                active_exc = await self.exception_service.get_active_exception(organization_id, fp)
                if active_exc:
                    continue  # Exempted from policy failure

            # 1. Check Secrets Rule
            if config.block_secrets and cat == "SECRET":
                is_failed = True
                reasons.append(f"Hardcoded secret detected in {loc} ({title}).")
                continue

            # 2. Check Critical Rule
            if config.block_critical and sev == "CRITICAL":
                is_failed = True
                reasons.append(f"Critical severity finding: {title} in {loc}.")
                continue

            # 3. Check High with High Confidence Rule
            if config.block_high_with_high_confidence and sev == "HIGH" and conf == "HIGH":
                is_failed = True
                reasons.append(f"High-confidence High finding: {title} in {loc}.")
                continue

            # 4. Warnings for Medium findings
            if sev == "MEDIUM":
                is_warned = True
                reasons.append(f"Medium finding detected: {title} in {loc}.")

        if is_failed:
            overall_result = PolicyResultEnum.FAIL
        elif is_warned:
            overall_result = PolicyResultEnum.WARN
        else:
            overall_result = PolicyResultEnum.PASS
            reasons.append("All security scanner gates passed with no policy violations.")

        # Persist policy evaluation record
        evaluation = PolicyEvaluation(
            scan_id=scan_id,
            policy_id=policy.id,
            result=overall_result.value,
            reason=json.dumps(reasons),
        )
        self.db.add(evaluation)
        await self.db.flush()

        return overall_result, reasons

    async def _resolve_organization_id(self, organization_id: str | None) -> str:
        """Resolve organization ID to a valid database organization."""
        from backend.app.models.organization import Organization
        if organization_id and organization_id != "default-org":
            stmt = select(Organization).where(Organization.id == organization_id)
            res = await self.db.execute(stmt)
            if res.scalar_one_or_none():
                return organization_id

        # Fallback to the first available organization
        stmt = select(Organization).order_by(Organization.created_at.asc())
        res = await self.db.execute(stmt)
        org = res.scalars().first()
        if org:
            return org.id

        # If no org exists, create one
        new_org = Organization(name="Default Organization", slug="default-org")
        self.db.add(new_org)
        await self.db.flush()
        return new_org.id

    async def list_policies(self, organization_id: str | None = None) -> List[PolicyResponse]:
        resolved_org_id = await self._resolve_organization_id(organization_id)
        stmt = select(Policy).where(Policy.organization_id == resolved_org_id).order_by(Policy.created_at.desc())
        res = await self.db.execute(stmt)
        records = res.scalars().all()

        # If no policies for this org, also check for any global policies
        if not records:
            stmt = select(Policy).order_by(Policy.created_at.desc())
            res = await self.db.execute(stmt)
            records = res.scalars().all()

        responses = []
        for p in records:
            cfg = PolicyConfig(**json.loads(p.configuration_json))
            responses.append(
                PolicyResponse(
                    id=p.id,
                    organization_id=p.organization_id,
                    name=p.name,
                    description=p.description,
                    enabled=p.enabled,
                    configuration=cfg,
                    created_at=p.created_at,
                    updated_at=p.updated_at,
                    affected_repositories_count=len(cfg.scope_repositories) if cfg.scope_repositories else 0,
                )
            )
        return responses

    async def create_policy(self, data: PolicyCreate) -> PolicyResponse:
        resolved_org_id = await self._resolve_organization_id(data.organization_id)
        policy = Policy(
            organization_id=resolved_org_id,
            name=data.name,
            description=data.description,
            enabled=data.enabled,
            configuration_json=data.configuration.model_dump_json(),
        )
        self.db.add(policy)
        await self.db.flush()

        return PolicyResponse(
            id=policy.id,
            organization_id=policy.organization_id,
            name=policy.name,
            description=policy.description,
            enabled=policy.enabled,
            configuration=data.configuration,
            created_at=policy.created_at,
            updated_at=policy.updated_at,
        )
