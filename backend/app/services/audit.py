"""Audit Log Service."""

from __future__ import annotations

import json
from typing import List, Optional
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.audit_log import AuditLog
from backend.app.models.user import User
from backend.app.schemas.audit import AuditLogResponse


class AuditService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_logs(
        self, organization_id: Optional[str] = None, limit: int = 100
    ) -> List[AuditLogResponse]:
        stmt = (
            select(AuditLog, User.name, User.email)
            .outerjoin(User, User.id == AuditLog.actor_id)
        )
        if organization_id:
            stmt = stmt.where(AuditLog.organization_id == organization_id)
        stmt = stmt.order_by(desc(AuditLog.created_at)).limit(limit)

        res = await self.db.execute(stmt)
        rows = res.all()

        responses = []
        for log, user_name, user_email in rows:
            meta = None
            if log.metadata_json:
                try:
                    meta = json.loads(log.metadata_json)
                except Exception:
                    pass

            responses.append(
                AuditLogResponse(
                    id=log.id,
                    organization_id=log.organization_id,
                    actor_id=log.actor_id,
                    actor_name=user_name or "System",
                    actor_email=user_email,
                    action=log.action,
                    resource_type=log.resource_type,
                    resource_id=log.resource_id,
                    metadata=meta,
                    created_at=log.created_at,
                )
            )
        return responses
