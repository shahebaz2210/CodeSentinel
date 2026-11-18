# Graph Report - new aicp  (2026-10-09)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 955 nodes · 2798 edges · 51 communities (27 shown, 24 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 292 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2d1f0563`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- types/api.ts
- BaseModel
- ScanService
- main.py
- package.json
- v1/intelligence.py
- security.py
- services/webhook.py
- gitleaks.py
- policies.py
- PRScannerService
- v1/auth.py
- schemas/__init__.py
- GitHubOAuthService
- FindingService
- asyncio
- RiskEngine
- ExceptionService
- GitHubService
- AppError
- compilerOptions
- GeminiProvider
- User
- generate_finding_fingerprint
- typing
- schemas/dashboard.py
- redis.py
- .normalize
- WebhookService
- errors.py
- provider_base.py
- schemas/finding.py
- .extract_surrounding_code
- Settings
- next.config.js
- sqlite3
- codesentinel-backend

## God Nodes (most connected - your core abstractions)
1. `BaseModel` - 77 edges
2. `User` - 63 edges
3. `AppError` - 36 edges
4. `ScanService` - 36 edges
5. `FindingService` - 31 edges
6. `Button` - 31 edges
7. `react` - 31 edges
8. `AppShell()` - 30 edges
9. `ScanPipeline` - 29 edges
10. `GitHubOAuthService` - 27 edges

## Surprising Connections (you probably didn't know these)
- `FindingService` --uses--> `ContextBuilder`  [INFERRED]
  backend/app/services/finding.py → backend/app/ai/context_builder.py
- `test_context_builder_surrounding_code()` --uses--> `ContextBuilder`  [INFERRED]
  backend/tests/test_scan_pipeline.py → backend/app/ai/context_builder.py
- `AuditService` --uses--> `AuditLog`  [INFERRED]
  backend/app/services/audit.py → backend/app/models/audit_log.py
- `AuthService` --uses--> `AuditLog`  [INFERRED]
  backend/app/services/auth.py → backend/app/models/audit_log.py
- `FindingService` --uses--> `AuditLog`  [INFERRED]
  backend/app/services/finding.py → backend/app/models/audit_log.py

## Import Cycles
- None detected.

## Communities (51 total, 24 thin omitted)

### Community 0 - "types/api.ts"
Cohesion: 0.07
Nodes (81): AuditLogPage(), DashboardPage(), FindingDetailPage(), FindingsPage(), IntelligencePage(), PolicyBuilderPage(), PoliciesPage(), PullRequestsPage() (+73 more)

### Community 1 - "BaseModel"
Cohesion: 0.06
Nodes (29): ContextBuilder, Base, AIAssessment, AuditLog, BaseModel, generate_uuid(), TimestampMixin, utcnow() (+21 more)

### Community 2 - "ScanService"
Cohesion: 0.06
Nodes (27): logout(), get_repository(), get_repository_findings(), get_repository_scans(), list_repositories(), sync_github_repositories(), trigger_repository_scan(), cancel_scan() (+19 more)

### Community 3 - "main.py"
Cohesion: 0.06
Nodes (14): init_db(), app_error_handler(), http_exception_handler(), unhandled_exception_handler(), generate_request_id(), setup_logging(), RequestIdMiddleware, SecurityHeadersMiddleware (+6 more)

### Community 4 - "package.json"
Cohesion: 0.05
Nodes (35): dependencies, clsx, lucide-react, next, react, react-dom, tailwind-merge, devDependencies (+27 more)

### Community 5 - "v1/intelligence.py"
Cohesion: 0.10
Nodes (9): list_security_documents(), search_security_intelligence(), IntelligenceSearchRequest, IntelligenceSearchResponse, SecurityChunkResponse, SecurityDocumentResponse, EmbeddingService, IntelligenceService (+1 more)

### Community 6 - "security.py"
Cohesion: 0.10
Nodes (11): create_jwt_token(), decode_jwt_token(), decrypt_value(), encrypt_value(), generate_secret(), _get_fernet(), verify_webhook_signature(), test_jwt_encode_decode() (+3 more)

### Community 8 - "gitleaks.py"
Cohesion: 0.12
Nodes (5): find_scanner_binary(), Scanner, GitleaksScanner, SemgrepScanner, test_semgrep_normalization()

### Community 9 - "policies.py"
Cohesion: 0.15
Nodes (10): create_policy(), list_policies(), PolicyBase, PolicyConfig, PolicyCreate, PolicyEvaluationResult, PolicyResponse, PolicyResultEnum (+2 more)

### Community 10 - "PRScannerService"
Cohesion: 0.13
Nodes (5): get_webhook_status(), setup_github_webhooks(), sync_and_scan_pull_requests(), PRScannerService, _bg_sync_prs()

### Community 11 - "v1/auth.py"
Cohesion: 0.17
Nodes (4): github_webhook_info(), get_db(), get_current_user(), AuthenticationError

### Community 12 - "schemas/__init__.py"
Cohesion: 0.13
Nodes (13): AuthStatus, GitHubCallbackRequest, GitHubOAuthUrlResponse, TokenPayload, ErrorDetail, ErrorResponse, UserBase, UserCreate (+5 more)

### Community 13 - "GitHubOAuthService"
Cohesion: 0.13
Nodes (5): get_auth_status(), get_github_auth_url(), github_oauth_callback(), redirect_to_github(), GitHubOAuthService

### Community 14 - "FindingService"
Cohesion: 0.20
Nodes (9): get_finding_detail(), list_findings(), update_finding_status(), PaginatedResponse, PaginationMeta, FindingDetailResponse, FindingResponse, FindingStatusUpdate (+1 more)

### Community 15 - "asyncio"
Cohesion: 0.15
Nodes (8): async_client(), test_dashboard_summary_endpoint(), test_findings_list_endpoint(), test_github_webhook_info(), test_health_endpoint(), test_policies_list_endpoint(), test_repositories_list_endpoint(), test_scans_list_endpoint()

### Community 16 - "RiskEngine"
Cohesion: 0.17
Nodes (8): RiskBreakdown, RiskDimension, RiskScore, RiskEngine, test_risk_calculation_critical_finding(), test_risk_calculation_low_finding(), test_risk_engine_public_repo_multiplier(), test_risk_engine_secret_multiplier()

### Community 17 - "ExceptionService"
Cohesion: 0.15
Nodes (6): create_exception(), list_exceptions(), Exception_, ExceptionCreate, ExceptionResponse, ExceptionService

### Community 19 - "AppError"
Cohesion: 0.12
Nodes (4): AppError, ConflictError, ForbiddenError, RateLimitError

### Community 20 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 22 - "User"
Cohesion: 0.25
Nodes (6): get_current_user_profile(), get_current_user_optional(), User, OrganizationResponse, UserMeResponse, AuthService

### Community 23 - "generate_finding_fingerprint"
Cohesion: 0.18
Nodes (5): generate_finding_fingerprint(), FindingNormalizer, test_finding_normalizer_deduplication(), test_fingerprint_stability(), test_finding_normalizer_deduplication()

### Community 24 - "typing"
Cohesion: 0.26
Nodes (3): list_audit_logs(), AuditLogResponse, AuditService

### Community 25 - "schemas/dashboard.py"
Cohesion: 0.24
Nodes (6): get_dashboard_summary(), DashboardSummary, RepoRiskRank, RiskTrendPoint, SeverityDistribution, DashboardService

### Community 26 - "redis.py"
Cohesion: 0.20
Nodes (4): health_check(), check_redis_health(), get_redis_connection(), get_redis_raw()

### Community 27 - ".normalize"
Cohesion: 0.17
Nodes (3): redact_secret_evidence(), test_gitleaks_normalization(), test_gitleaks_secret_redaction()

### Community 28 - "WebhookService"
Cohesion: 0.31
Nodes (3): github_webhook_receiver(), WebhookDeliveryResponse, WebhookService

### Community 31 - "schemas/finding.py"
Cohesion: 0.52
Nodes (3): ConfidenceLevel, FindingStatus, SeverityLevel

## Knowledge Gaps
- **8 isolated node(s):** `autoprefixer`, `postcss`, `react-dom`, `@types/node`, `@types/react` (+3 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 373 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User` to `BaseModel`, `ScanService`, `v1/intelligence.py`, `security.py`, `policies.py`, `PRScannerService`, `v1/auth.py`, `GitHubOAuthService`, `FindingService`, `ExceptionService`, `GitHubService`, `typing`, `schemas/dashboard.py`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Are the 35 inferred relationships involving `User` (e.g. with `list_audit_logs()` and `get_auth_status()`) actually correct?**
  _`User` has 35 INFERRED edges - model-reasoned connections that need verification._
- **What connects `autoprefixer`, `postcss`, `react-dom` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `types/api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07392109386127332 - nodes in this community are weakly interconnected._
- **Why does `BaseModel` connect `BaseModel` to `ScanService`, `v1/intelligence.py`, `policies.py`, `schemas/__init__.py`, `FindingService`, `RiskEngine`, `ExceptionService`, `User`, `typing`, `schemas/dashboard.py`, `WebhookService`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppError` (e.g. with `create_app()` and `GitHubService`) actually correct?**
  _`AppError` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Should `BaseModel` be split into smaller, more focused modules?**
  _Cohesion score 0.06289308176100629 - nodes in this community are weakly interconnected._