"""Policy API routes."""

from __future__ import annotations

from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.database import get_db
from backend.app.core.deps import get_current_user
from backend.app.models.user import User
from backend.app.schemas.policy import ExceptionCreate, ExceptionResponse, PolicyCreate, PolicyResponse
from backend.app.services.exception import ExceptionService
from backend.app.services.policy import PolicyEngine

router = APIRouter(prefix="/policies", tags=["policies"])


@router.get("", response_model=List[PolicyResponse])
async def list_policies(
    organization_id: Optional[str] = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[PolicyResponse]:
    """List all policies for the organization."""
    engine = PolicyEngine(db)
    # Default org ID fallback
    org_id = organization_id or "default-org"
    return await engine.list_policies(org_id)


@router.post("", response_model=PolicyResponse)
async def create_policy(
    payload: PolicyCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PolicyResponse:
    """Create a new security policy."""
    engine = PolicyEngine(db)
    return await engine.create_policy(payload)


@router.get("/exceptions", response_model=List[ExceptionResponse])
async def list_exceptions(
    organization_id: Optional[str] = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[ExceptionResponse]:
    """List active security exceptions."""
    exc_service = ExceptionService(db)
    org_id = organization_id or "default-org"
    return await exc_service.list_exceptions(org_id)


@router.post("/exceptions", response_model=ExceptionResponse)
async def create_exception(
    payload: ExceptionCreate,
    organization_id: Optional[str] = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ExceptionResponse:
    """Create a temporary accepted risk security exception."""
    exc_service = ExceptionService(db)
    org_id = organization_id or "default-org"
    exc = await exc_service.create_exception(org_id, user.id, payload)
    return ExceptionResponse.model_validate(exc)
