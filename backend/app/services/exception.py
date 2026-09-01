"""Security Exception Service."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.exception import Exception_
from backend.app.schemas.policy import ExceptionCreate, ExceptionResponse


class ExceptionService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_active_exception(
        self, organization_id: str, finding_fingerprint: str
    ) -> Optional[Exception_]:
        """Check if an approved and non-expired exception exists for the fingerprint."""
        now = datetime.now(timezone.utc)
        stmt = (
            select(Exception_)
            .where(
                Exception_.organization_id == organization_id,
                Exception_.finding_fingerprint == finding_fingerprint,
                Exception_.status == "ACTIVE",
            )
        )
        res = await self.db.execute(stmt)
        record = res.scalar_one_or_none()

        if record and record.expires_at and record.expires_at < now:
            record.status = "EXPIRED"
            await self.db.flush()
            return None

        return record

    async def create_exception(
        self, organization_id: str, user_id: str, data: ExceptionCreate
    ) -> Exception_:
        exc = Exception_(
            organization_id=organization_id,
            finding_fingerprint=data.finding_fingerprint,
            reason=data.reason,
            created_by=user_id,
            approved_by=user_id,  # Auto-approved for org admin/security
            expires_at=data.expires_at,
            status="ACTIVE",
        )
        self.db.add(exc)
        await self.db.flush()
        return exc

    async def list_exceptions(self, organization_id: str) -> List[ExceptionResponse]:
        stmt = select(Exception_).where(Exception_.organization_id == organization_id).order_by(Exception_.created_at.desc())
        res = await self.db.execute(stmt)
        records = res.scalars().all()
        return [ExceptionResponse.model_validate(e) for e in records]
