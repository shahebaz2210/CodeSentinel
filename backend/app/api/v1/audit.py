"""Audit Log API routes."""

from __future__ import annotations

from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.database import get_db
from backend.app.core.deps import get_current_user
from backend.app.models.user import User
from backend.app.schemas.audit import AuditLogResponse
from backend.app.services.audit import AuditService

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("/logs", response_model=List[AuditLogResponse])
async def list_audit_logs(
    organization_id: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[AuditLogResponse]:
    """Retrieve security audit log history."""
    service = AuditService(db)
    return await service.list_logs(organization_id=organization_id, limit=limit)
