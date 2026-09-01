"""GitHub Webhook Service with HMAC verification and idempotency."""

from __future__ import annotations

import json
from typing import Optional, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.config import settings
from backend.app.core.errors import AppError, ErrorCode
from backend.app.core.logging import get_logger
from backend.app.core.security import verify_webhook_signature
from backend.app.models.audit_log import AuditLog
from backend.app.models.repository import Repository
from backend.app.schemas.webhook import WebhookDeliveryResponse
from backend.app.services.scan import ScanService

logger = get_logger("webhook_service")


class WebhookService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.scan_service = ScanService(db)

    async def process_github_event(
        self,
        raw_body: bytes,
        signature: Optional[str],
        event_type: str,
        delivery_id: Optional[str],
    ) -> WebhookDeliveryResponse:
        """Verify HMAC, validate event, and trigger PR scan."""
        # 1. Verify HMAC signature if secret is configured
        if settings.github_webhook_secret:
            if not signature:
                raise AppError(ErrorCode.WEBHOOK_SIGNATURE_INVALID, "Missing X-Hub-Signature-256 header", 401)
            valid = verify_webhook_signature(raw_body, signature, settings.github_webhook_secret)
            if not valid:
                logger.warning("invalid_webhook_signature", delivery_id=delivery_id)
                raise AppError(ErrorCode.WEBHOOK_SIGNATURE_INVALID, "Invalid webhook HMAC signature", 401)

        # 2. Check delivery idempotency
        if delivery_id:
            dup_stmt = select(AuditLog).where(
                AuditLog.action == "GITHUB_WEBHOOK_RECEIVED",
                AuditLog.resource_id == delivery_id,
            )
            dup_res = await self.db.execute(dup_stmt)
            if dup_res.scalar_one_or_none():
                return WebhookDeliveryResponse(status="ignored", message="Duplicate webhook delivery ID")

        # 3. Parse JSON payload
        try:
            payload = json.loads(raw_body.decode("utf-8"))
        except Exception:
            raise AppError(ErrorCode.INVALID_INPUT, "Invalid JSON payload")

        # Record audit log
        audit = AuditLog(
            action="GITHUB_WEBHOOK_RECEIVED",
            resource_type="webhook",
            resource_id=delivery_id or "unknown",
            metadata_json=json.dumps({"event": event_type, "action": payload.get("action")}),
        )
        self.db.add(audit)
        await self.db.flush()

        # 4. Handle PR events
        if event_type == "pull_request":
            pr_action = payload.get("action")
            if pr_action in ["opened", "synchronize", "reopened"]:
                repo_data = payload.get("repository", {})
                provider_repo_id = str(repo_data.get("id"))

                # Find registered repository
                repo_stmt = select(Repository).where(Repository.provider_repo_id == provider_repo_id)
                repo_res = await self.db.execute(repo_stmt)
                repo = repo_res.scalar_one_or_none()

                if repo:
                    pr_info = payload.get("pull_request", {})
                    pr_num = pr_info.get("number")
                    head_sha = pr_info.get("head", {}).get("sha")
                    head_ref = pr_info.get("head", {}).get("ref")

                    scan_resp = await self.scan_service.trigger_scan(
                        repository_id=repo.id,
                        scan_type="PR",
                        branch=head_ref,
                        commit_sha=head_sha,
                        pr_number=pr_num,
                        triggered_by=f"GitHub PR #{pr_num}",
                    )
                    return WebhookDeliveryResponse(
                        status="success",
                        message=f"Triggered PR scan for #{pr_num}",
                        scan_id=scan_resp.id,
                    )

        return WebhookDeliveryResponse(status="ignored", message=f"Event {event_type} ignored")
