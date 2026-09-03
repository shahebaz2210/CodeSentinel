"""GitHub Webhook and PR event schemas."""

from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field


class WebhookSender(BaseModel):
    login: str
    id: int
    avatar_url: Optional[str] = None


class WebhookRepository(BaseModel):
    id: int
    name: str
    full_name: str
    private: bool
    owner: WebhookSender
    default_branch: str = "main"


class WebhookPullRequest(BaseModel):
    id: int
    number: int
    title: str
    state: str
    head_sha: str = Field(alias="head", default="")
    base_ref: str = Field(alias="base", default="main")


class PREvent(BaseModel):
    action: str  # opened, synchronize, reopened, closed
    number: int
    pull_request: Optional[dict] = None
    repository: WebhookRepository
    sender: WebhookSender


class WebhookDeliveryResponse(BaseModel):
    status: str
    message: str
    scan_id: Optional[str] = None
