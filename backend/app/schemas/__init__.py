"""Pydantic schemas registry."""

from backend.app.schemas.common import (
    ErrorDetail,
    ErrorResponse,
    PaginatedResponse,
    PaginationMeta,
    SuccessResponse,
)
from backend.app.schemas.user import (
    OrganizationResponse,
    UserCreate,
    UserMeResponse,
    UserResponse,
)
from backend.app.schemas.auth import (
    AuthStatus,
    GitHubCallbackRequest,
    GitHubOAuthUrlResponse,
    TokenPayload,
)
from backend.app.schemas.repository import (
    RepositoryCreate,
    RepositoryResponse,
    RepositorySyncRequest,
)
from backend.app.schemas.scan import (
    ScanCreate,
    ScanResponse,
    ScanStageResponse,
    ScanStatus,
    ScanType,
    StageName,
)
from backend.app.schemas.finding import (
    AIAssessmentResponse,
    Confidence,
    FindingDetailResponse,
    FindingResponse,
    FindingStatus,
    FindingStatusUpdate,
    Severity,
)
from backend.app.schemas.policy import (
    ExceptionCreate,
    ExceptionResponse,
    PolicyConfig,
    PolicyCreate,
    PolicyEvaluationResult,
    PolicyResponse,
    PolicyResultEnum,
    PolicyUpdate,
)
from backend.app.schemas.dashboard import (
    DashboardSummary,
    RepoRiskRank,
    RiskTrendPoint,
    SeverityDistribution,
)
from backend.app.schemas.intelligence import (
    IntelligenceSearchRequest,
    IntelligenceSearchResponse,
    SecurityChunkResponse,
    SecurityDocumentResponse,
)
from backend.app.schemas.audit import AuditLogResponse
from backend.app.schemas.webhook import PREvent, WebhookDeliveryResponse
from backend.app.schemas.risk import RiskBreakdown, RiskDimension, RiskScore

__all__ = [
    "ErrorDetail",
    "ErrorResponse",
    "PaginatedResponse",
    "PaginationMeta",
    "SuccessResponse",
    "UserCreate",
    "UserResponse",
    "OrganizationResponse",
    "UserMeResponse",
    "TokenPayload",
    "AuthStatus",
    "GitHubOAuthUrlResponse",
    "GitHubCallbackRequest",
    "RepositoryCreate",
    "RepositoryResponse",
    "RepositorySyncRequest",
    "ScanCreate",
    "ScanResponse",
    "ScanStageResponse",
    "ScanStatus",
    "ScanType",
    "StageName",
    "Severity",
    "Confidence",
    "FindingStatus",
    "FindingResponse",
    "FindingDetailResponse",
    "FindingStatusUpdate",
    "AIAssessmentResponse",
    "PolicyConfig",
    "PolicyCreate",
    "PolicyUpdate",
    "PolicyResponse",
    "PolicyEvaluationResult",
    "PolicyResultEnum",
    "ExceptionCreate",
    "ExceptionResponse",
    "DashboardSummary",
    "SeverityDistribution",
    "RiskTrendPoint",
    "RepoRiskRank",
    "SecurityDocumentResponse",
    "SecurityChunkResponse",
    "IntelligenceSearchRequest",
    "IntelligenceSearchResponse",
    "AuditLogResponse",
    "PREvent",
    "WebhookDeliveryResponse",
    "RiskDimension",
    "RiskBreakdown",
    "RiskScore",
]
