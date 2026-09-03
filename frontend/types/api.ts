export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW';
export type FindingStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'FALSE_POSITIVE' | 'ACCEPTED_RISK' | 'IGNORED';
export type ScanType = 'FULL' | 'PR';
export type ScanStatus = 'QUEUED' | 'RUNNING' | 'PARTIAL_FAILURE' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type PolicyResult = 'PASS' | 'WARN' | 'FAIL';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  role?: string;
  created_at: string;
}

export interface UserMe {
  user: User;
  organizations: Organization[];
  github_connected: boolean;
  github_username?: string;
}

export interface Repository {
  id: string;
  organization_id: string;
  provider: string;
  provider_repo_id: string;
  owner: string;
  name: string;
  full_name: string;
  default_branch: string;
  visibility: string;
  language?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  last_scan_at?: string;
  last_scan_status?: string;
  last_risk_score?: number;
  open_findings_count: number;
  critical_findings_count: number;
  policy_status?: PolicyResult;
}

export interface ScanStage {
  id: string;
  stage: string;
  status: string;
  started_at?: string;
  completed_at?: string;
  item_count?: number;
  error_message?: string;
}

export interface Scan {
  id: string;
  repository_id: string;
  repository_name?: string;
  type: ScanType;
  status: ScanStatus;
  commit_sha?: string;
  branch?: string;
  pr_number?: number;
  triggered_by?: string;
  started_at?: string;
  completed_at?: string;
  duration_ms?: number;
  files_analyzed?: number;
  risk_score?: number;
  policy_result?: PolicyResult;
  error_summary?: string;
  created_at: string;
  stages?: ScanStage[];
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  secret_count: number;
  total_findings: number;
}

export type ScanListItem = Scan;

export interface AIAssessment {
  id: string;
  finding_id: string;
  model: string;
  prompt_version: string;
  summary?: string;
  explanation?: string;
  impact?: string;
  remediation?: string;
  confidence?: number;
  uncertainty?: string[];
  retrieved_sources?: any[];
  created_at: string;
}

export interface Finding {
  id: string;
  scan_id: string;
  stable_fingerprint: string;
  title: string;
  description?: string;
  category: string;
  severity: Severity;
  confidence: Confidence;
  risk_score?: number;
  scanner: string;
  scanner_rule?: string;
  cwe_id?: string;
  cve_id?: string;
  owasp_category?: string;
  status: FindingStatus;
  file_path: string;
  start_line: number;
  end_line?: number;
  start_column?: number;
  end_column?: number;
  evidence?: string;
  remediation?: string;
  created_at: string;
  updated_at: string;
}

export interface FindingDetail extends Finding {
  ai_assessment?: AIAssessment;
  repository_name?: string;
  commit_sha?: string;
  source_snippet?: string;
  history_count: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_next: boolean;
  };
}

export interface PolicyConfig {
  block_critical: boolean;
  block_high_with_high_confidence: boolean;
  block_secrets: boolean;
  severity_threshold: string;
  confidence_threshold: string;
  allow_approved_exceptions: boolean;
  require_exception_expiry: boolean;
  max_exception_days: number;
  scope_repositories: string[];
}

export interface Policy {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  enabled: boolean;
  configuration: PolicyConfig;
  created_at: string;
  updated_at: string;
  affected_repositories_count: number;
}

export interface DashboardSummary {
  overall_security_posture: string;
  average_risk_score: number;
  total_repositories: number;
  scanned_repositories: number;
  critical_findings_count: number;
  high_findings_count: number;
  total_open_findings: number;
  active_scans_count: number;
  scans_today_count?: number;
  pr_gates_passed: number;
  pr_gates_failed: number;
  severity_distribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  risk_trend: {
    date: string;
    average_risk_score: number;
    scans_count: number;
  }[];
  top_risky_repositories: {
    id: string;
    name: string;
    owner: string;
    risk_score: number;
    critical_count: number;
    high_count: number;
    open_findings: number;
    policy_status?: PolicyResult;
    last_scanned?: string;
  }[];
  recent_scans: Scan[];
  recent_findings: Finding[];
}

export interface SecurityDocument {
  id: string;
  source_type: string;
  external_id: string;
  title: string;
  url?: string;
  version?: string;
  content: string;
  metadata?: any;
  created_at: string;
}

export interface AuditLog {
  id: string;
  organization_id?: string;
  actor_id?: string;
  actor_name?: string;
  actor_email?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata?: any;
  created_at: string;
}
