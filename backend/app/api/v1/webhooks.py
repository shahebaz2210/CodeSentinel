"""Webhook API routes."""

from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.database import get_db
from backend.app.schemas.webhook import WebhookDeliveryResponse
from backend.app.services.webhook import WebhookService

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/github", response_model=WebhookDeliveryResponse)
async def github_webhook_receiver(
    request: Request,
    x_hub_signature_256: Optional[str] = Header(None),
    x_github_event: str = Header("ping"),
    x_github_delivery: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
) -> WebhookDeliveryResponse:
    """Receive and process GitHub webhook notifications with HMAC verification."""
    raw_body = await request.body()
    service = WebhookService(db)
    return await service.process_github_event(
        raw_body=raw_body,
        signature=x_hub_signature_256,
        event_type=x_github_event,
        delivery_id=x_github_delivery,
    )
