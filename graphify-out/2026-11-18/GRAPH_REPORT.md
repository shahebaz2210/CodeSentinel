# Graph Report - new aicp  (2026-11-17)

## Corpus Check
- 149 files · ~79,921 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: .example 1, (none) 1, .ini 1)

## Summary
- 1234 nodes · 3081 edges · 77 communities (44 shown, 33 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 294 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2d1f0563`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- types/api.ts
- BaseModel
- ScanService
- Repository
- package.json
- services/dashboard.py
- security.py
- main.py
- gitleaks.py
- PolicyEngine
- PRScannerService
- typing
- schemas/__init__.py
- GitHubOAuthService
- services/finding.py
- asyncio
- RiskEngine
- CodeSentinel_Complete_Build_Spec.md
- ScanPipeline
- AppError
- compilerOptions
- gemini_provider.py
- User
- test_risk_and_policy.py
- v1/audit.py
- CodeSentinel 🛡️
- redis.py
- GitleaksScanner
- test_scan_pipeline.py
- 13. DATABASE MODEL
- v1/intelligence.py
- schemas/finding.py
- services/repository.py
- Settings
- next.config.js
- sqlite3
- codesentinel-backend
- 4. TARGET USERS / ACTORS
- 3.2 What makes CodeSentinel different
- 19. THREATS AND MITIGATIONS
- test_scanners.py
- 15. API DESIGN
- 61. USE CASES
- 58. TESTING STRATEGY
- 67. CLAUDE IMPLEMENTATION WORKFLOW
- 44. UI STATES
- 1. PRODUCT IDENTITY
- get_webhook_status
- 76. PRODUCT QUALITY CHECKLIST
- 7. COMPLETE PRODUCT FEATURE SET
- github_webhook_info
- 17. GITHUB INTEGRATION
- 62. STATE MACHINES
- 0. BUILD DIRECTIVE FOR CLAUDE AI
- 10. SYSTEM ARCHITECTURE
- 11. ARCHITECTURAL COMPONENTS
- 18. SECURITY ARCHITECTURE
- 25. VISUAL SYSTEM
- 29. REQUIRED SCREENS
- 6.1 New user journey
- CodeSentinel — Complete Build Specification
- logout

## God Nodes (most connected - your core abstractions)
1. `BaseModel` - 77 edges
2. `User` - 63 edges
3. `AppError` - 36 edges
4. `ScanService` - 36 edges
5. `FindingService` - 31 edges
6. `Button` - 31 edges
7. `react` - 31 edges
8. `ScanPipeline` - 30 edges
9. `AppShell()` - 30 edges
10. `GitHubOAuthService` - 28 edges

## Surprising Connections (you probably didn't know these)
- `FindingService` --uses--> `ContextBuilder`  [INFERRED]
  backend/app/services/finding.py → backend/app/ai/context_builder.py
- `ScanPipeline` --uses--> `ContextBuilder`  [INFERRED]
  backend/app/workers/scan_pipeline.py → backend/app/ai/context_builder.py
- `AIAssessmentService` --uses--> `GeminiProvider`  [INFERRED]
  backend/app/services/ai_assessment.py → backend/app/ai/gemini_provider.py
- `list_audit_logs()` --uses--> `User`  [INFERRED]
  backend/app/api/v1/audit.py → backend/app/models/user.py
- `get_auth_status()` --uses--> `User`  [INFERRED]
  backend/app/api/v1/auth.py → backend/app/models/user.py

## Import Cycles
- None detected.

## Communities (77 total, 33 thin omitted)

### Community 0 - "types/api.ts"
Cohesion: 0.07
Nodes (81): AuditLogPage(), DashboardPage(), FindingDetailPage(), FindingsPage(), IntelligencePage(), PolicyBuilderPage(), PoliciesPage(), PullRequestsPage() (+73 more)

### Community 1 - "BaseModel"
Cohesion: 0.06
Nodes (27): Base, init_db(), AIAssessment, BaseModel, generate_uuid(), TimestampMixin, utcnow(), Finding (+19 more)

### Community 2 - "ScanService"
Cohesion: 0.12
Nodes (11): get_repository_scans(), trigger_repository_scan(), cancel_scan(), create_scan(), get_scan(), get_scan_stages(), list_scans(), Scan (+3 more)

### Community 3 - "Repository"
Cohesion: 0.17
Nodes (4): github_webhook_receiver(), Repository, WebhookDeliveryResponse, WebhookService

### Community 4 - "package.json"
Cohesion: 0.05
Nodes (35): dependencies, clsx, lucide-react, next, react, react-dom, tailwind-merge, devDependencies (+27 more)

### Community 5 - "services/dashboard.py"
Cohesion: 0.30
Nodes (6): get_dashboard_summary(), DashboardSummary, RepoRiskRank, RiskTrendPoint, SeverityDistribution, DashboardService

### Community 6 - "security.py"
Cohesion: 0.11
Nodes (11): create_jwt_token(), decode_jwt_token(), decrypt_value(), encrypt_value(), generate_secret(), _get_fernet(), verify_webhook_signature(), test_jwt_encode_decode() (+3 more)

### Community 7 - "main.py"
Cohesion: 0.05
Nodes (13): app_error_handler(), http_exception_handler(), unhandled_exception_handler(), generate_request_id(), get_logger(), setup_logging(), RequestIdMiddleware, SecurityHeadersMiddleware (+5 more)

### Community 9 - "PolicyEngine"
Cohesion: 0.08
Nodes (16): create_exception(), create_policy(), list_exceptions(), list_policies(), Exception_, ExceptionCreate, ExceptionResponse, PolicyBase (+8 more)

### Community 10 - "PRScannerService"
Cohesion: 0.17
Nodes (3): _pr_polling_worker(), PRScannerService, _bg_sync_prs()

### Community 12 - "schemas/__init__.py"
Cohesion: 0.14
Nodes (14): AuthStatus, GitHubCallbackRequest, GitHubOAuthUrlResponse, TokenPayload, ErrorDetail, ErrorResponse, SuccessResponse, RepositoryBase (+6 more)

### Community 13 - "GitHubOAuthService"
Cohesion: 0.14
Nodes (5): get_auth_status(), get_github_auth_url(), github_oauth_callback(), redirect_to_github(), GitHubOAuthService

### Community 14 - "services/finding.py"
Cohesion: 0.16
Nodes (12): get_finding_detail(), list_findings(), update_finding_status(), get_repository_findings(), get_scan_findings(), AuditLog, PaginatedResponse, PaginationMeta (+4 more)

### Community 15 - "asyncio"
Cohesion: 0.15
Nodes (8): async_client(), test_dashboard_summary_endpoint(), test_findings_list_endpoint(), test_github_webhook_info(), test_health_endpoint(), test_policies_list_endpoint(), test_repositories_list_endpoint(), test_scans_list_endpoint()

### Community 16 - "RiskEngine"
Cohesion: 0.23
Nodes (8): RiskBreakdown, RiskDimension, RiskScore, RiskEngine, test_risk_calculation_critical_finding(), test_risk_calculation_low_finding(), test_risk_engine_public_repo_multiplier(), test_risk_engine_secret_multiplier()

### Community 17 - "CodeSentinel_Complete_Build_Spec.md"
Cohesion: 0.02
Nodes (132): 11.2 Backend, 11.3 Worker, 11.4 Queue, 11.5 Scanner abstraction, 12. RECOMMENDED PROJECT STRUCTURE, 14. DATABASE RULES, 16. API CONTRACT RULES, 20. SCAN ISOLATION (+124 more)

### Community 18 - "ScanPipeline"
Cohesion: 0.08
Nodes (4): GitHubService, run_scan_pipeline_background(), ScanPipeline, _async_runner()

### Community 19 - "AppError"
Cohesion: 0.11
Nodes (6): AppError, AuthenticationError, ConflictError, ErrorCode, ForbiddenError, RateLimitError

### Community 20 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 21 - "gemini_provider.py"
Cohesion: 0.09
Nodes (3): GeminiProvider, LLMProvider, ResponseValidator

### Community 22 - "User"
Cohesion: 0.17
Nodes (9): get_current_user_profile(), get_current_user_optional(), User, OrganizationResponse, UserBase, UserCreate, UserMeResponse, UserResponse (+1 more)

### Community 23 - "test_risk_and_policy.py"
Cohesion: 0.19
Nodes (5): generate_finding_fingerprint(), FindingNormalizer, test_finding_normalizer_deduplication(), test_fingerprint_stability(), test_finding_normalizer_deduplication()

### Community 24 - "v1/audit.py"
Cohesion: 0.27
Nodes (3): list_audit_logs(), AuditLogResponse, AuditService

### Community 25 - "CodeSentinel 🛡️"
Cohesion: 0.09
Nodes (22): 1. Clone & Environment Configuration, 1. GitHub OAuth App Setup (Required for Login), 2. GitHub Webhook Setup (Required for Automated PR Scans), 2. Start Infrastructure Services, 3. Backend Setup & Migrations, 4. Seed Security Knowledge Base (RAG), 5. Launch Background Scanner Worker, 6. Launch Backend API Server (+14 more)

### Community 26 - "redis.py"
Cohesion: 0.21
Nodes (4): health_check(), check_redis_health(), get_redis_connection(), get_redis_raw()

### Community 29 - "13. DATABASE MODEL"
Cohesion: 0.12
Nodes (17): 13.10 ai_assessments, 13.11 security_documents, 13.12 security_chunks, 13.13 policies, 13.14 policy_evaluations, 13.15 exceptions, 13.16 audit_logs, 13.1 users (+9 more)

### Community 30 - "v1/intelligence.py"
Cohesion: 0.21
Nodes (6): list_security_documents(), search_security_intelligence(), IntelligenceSearchRequest, IntelligenceSearchResponse, SecurityChunkResponse, SecurityDocumentResponse

### Community 31 - "schemas/finding.py"
Cohesion: 0.29
Nodes (5): AIAssessmentResponse, ConfidenceLevel, FindingStatus, SeverityLevel, AIAssessmentService

### Community 32 - "services/repository.py"
Cohesion: 0.14
Nodes (7): get_repository(), list_repositories(), sync_github_repositories(), NotFoundError, GitHubConnection, RepositoryResponse, RepositoryService

### Community 51 - "4. TARGET USERS / ACTORS"
Cohesion: 0.18
Nodes (11): 4.1 Developer, 4.2 Security Engineer, 4.3 Engineering Lead, 4.4 Platform / DevOps Engineer, 4.5 Organization Admin, 4.6 External actors, 4. TARGET USERS / ACTORS, GitHub (+3 more)

### Community 52 - "3.2 What makes CodeSentinel different"
Cohesion: 0.20
Nodes (10): 3.1 Solution pipeline, 3.2 What makes CodeSentinel different, 3. PROPOSED SOLUTION, AI reasoning, Context, Deterministic detection, Developer workflow, Policy (+2 more)

### Community 53 - "19. THREATS AND MITIGATIONS"
Cohesion: 0.22
Nodes (9): 19. THREATS AND MITIGATIONS, Authorization bypass, Malicious repository, Prompt injection, SQL injection, SSRF, Token theft, Webhook spoofing (+1 more)

### Community 54 - "test_scanners.py"
Cohesion: 0.17
Nodes (4): redact_secret_evidence(), SemgrepScanner, test_gitleaks_secret_redaction(), test_semgrep_normalization()

### Community 55 - "15. API DESIGN"
Cohesion: 0.25
Nodes (8): 15. API DESIGN, Auth, Dashboard, Findings, Policies, Repositories, Scans, Webhook

### Community 56 - "61. USE CASES"
Cohesion: 0.25
Nodes (8): 61. USE CASES, UC-001 — Connect GitHub, UC-002 — Run full repository scan, UC-003 — Scan pull request, UC-004 — Investigate finding, UC-005 — Configure policy, UC-006 — Compare scans, UC-007 — Accept temporary risk

### Community 57 - "58. TESTING STRATEGY"
Cohesion: 0.29
Nodes (7): 58. TESTING STRATEGY, AI tests, API tests, E2E, RAG tests, Scanner tests, Unit tests

### Community 58 - "67. CLAUDE IMPLEMENTATION WORKFLOW"
Cohesion: 0.29
Nodes (7): 67. CLAUDE IMPLEMENTATION WORKFLOW, Step 1, Step 2, Step 3, Step 4, Step 5, Step 6

### Community 59 - "44. UI STATES"
Cohesion: 0.33
Nodes (6): 44. UI STATES, Empty, Error, Loading, Partial, Success

### Community 60 - "1. PRODUCT IDENTITY"
Cohesion: 0.40
Nodes (5): 1.1 Name, 1.2 Product description, 1.3 One-line value proposition, 1.4 Product positioning, 1. PRODUCT IDENTITY

### Community 61 - "get_webhook_status"
Cohesion: 0.27
Nodes (3): get_webhook_status(), setup_github_webhooks(), sync_and_scan_pull_requests()

### Community 62 - "76. PRODUCT QUALITY CHECKLIST"
Cohesion: 0.50
Nodes (4): 76. PRODUCT QUALITY CHECKLIST, AI, Functionality, UX

### Community 63 - "7. COMPLETE PRODUCT FEATURE SET"
Cohesion: 0.50
Nodes (4): 7. COMPLETE PRODUCT FEATURE SET, P0 — Essential, P1 — Important, P2 — Future

### Community 65 - "17. GITHUB INTEGRATION"
Cohesion: 0.67
Nodes (3): 17.1 OAuth, 17.2 Webhooks, 17. GITHUB INTEGRATION

### Community 66 - "62. STATE MACHINES"
Cohesion: 0.67
Nodes (3): 62. STATE MACHINES, Finding, Scan

## Knowledge Gaps
- **8 isolated node(s):** `codesentinel-backend`, `react-dom`, `@types/node`, `@types/react`, `@types/react-dom` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 621 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User` to `services/repository.py`, `BaseModel`, `ScanService`, `services/dashboard.py`, `PolicyEngine`, `typing`, `GitHubOAuthService`, `services/finding.py`, `v1/audit.py`, `get_webhook_status`, `v1/intelligence.py`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Are the 35 inferred relationships involving `User` (e.g. with `list_audit_logs()` and `get_auth_status()`) actually correct?**
  _`User` has 35 INFERRED edges - model-reasoned connections that need verification._
- **What connects `codesentinel-backend`, `react-dom`, `@types/node` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `types/api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07392109386127332 - nodes in this community are weakly interconnected._
- **Why does `GitHubOAuthService` connect `GitHubOAuthService` to `services/repository.py`, `BaseModel`, `Repository`, `PRScannerService`, `typing`, `ScanPipeline`, `AppError`, `User`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppError` (e.g. with `create_app()` and `GitHubService`) actually correct?**
  _`AppError` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Should `BaseModel` be split into smaller, more focused modules?**
  _Cohesion score 0.055333473595623815 - nodes in this community are weakly interconnected._