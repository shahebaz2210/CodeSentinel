import {
  AuditLog,
  DashboardSummary,
  Finding,
  FindingDetail,
  FindingStatus,
  PaginatedResponse,
  Policy,
  Repository,
  Scan,
  SecurityDocument,
  UserMe,
} from '@/types/api';

const API_BASE = '/api/v1';

async function fetcher<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    let errorMsg = 'An unexpected error occurred';
    try {
      const errJson = await res.json();
      errorMsg = errJson.error?.message || errJson.detail || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  auth: {
    getMe: () => fetcher<UserMe>('/auth/me'),
    getStatus: () => fetcher<{ authenticated: boolean; github_connected: boolean }>('/auth/status'),
    getGitHubUrl: () => fetcher<{ url: string; state: string }>('/auth/github/url'),
    logout: () => fetcher<{ success: boolean }>('/auth/logout', { method: 'POST' }),
  },
  dashboard: {
    getSummary: () => fetcher<DashboardSummary>('/dashboard/summary'),
  },
  repositories: {
    list: (orgId?: string) => fetcher<Repository[]>(orgId ? `/repositories?organization_id=${orgId}` : '/repositories'),
    get: (id: string) => fetcher<Repository>(`/repositories/${id}`),
    sync: (organization_id: string) =>
      fetcher<{ success: boolean; message: string }>('/repositories/sync', {
        method: 'POST',
        body: JSON.stringify({ organization_id }),
      }),
    triggerScan: (repoId: string, branch?: string) =>
      fetcher<Scan>(`/repositories/${repoId}/scan${branch ? `?branch=${branch}` : ''}`, { method: 'POST' }),
    getScans: (repoId: string) => fetcher<Scan[]>(`/repositories/${repoId}/scans`),
    getFindings: (repoId: string, status?: string) =>
      fetcher<Finding[]>(`/repositories/${repoId}/findings${status ? `?status=${status}` : ''}`),
  },
  scans: {
    list: (params?: { page?: number; limit?: number; repository_id?: string; type?: string; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set('page', params.page.toString());
      if (params?.limit) q.set('limit', params.limit.toString());
      if (params?.repository_id) q.set('repository_id', params.repository_id);
      if (params?.type) q.set('scan_type', params.type);
      if (params?.status) q.set('status', params.status);
      const queryStr = q.toString();
      return fetcher<PaginatedResponse<Scan>>(queryStr ? `/scans?${queryStr}` : '/scans');
    },
    get: (id: string) => fetcher<Scan>(`/scans/${id}`),
    getFindings: (id: string) => fetcher<Finding[]>(`/scans/${id}/findings`),
    cancel: (id: string) => fetcher<Scan>(`/scans/${id}/cancel`, { method: 'POST' }),
  },
  findings: {
    list: (params: {
      page?: number;
      limit?: number;
      severity?: string;
      status?: string;
      scanner?: string;
      cwe_id?: string;
      search?: string;
      repoId?: string;
    }) => {
      const q = new URLSearchParams();
      if (params.page) q.set('page', params.page.toString());
      if (params.limit) q.set('limit', params.limit.toString());
      if (params.severity) q.set('severity', params.severity);
      if (params.status) q.set('status', params.status);
      if (params.scanner) q.set('scanner', params.scanner);
      if (params.cwe_id) q.set('cwe_id', params.cwe_id);
      if (params.search) q.set('search', params.search);
      if (params.repoId) q.set('repository_id', params.repoId);
      return fetcher<PaginatedResponse<Finding>>(`/findings?${q.toString()}`);
    },
    get: (id: string) => fetcher<FindingDetail>(`/findings/${id}`),
    updateStatus: (id: string, status: FindingStatus, reason?: string, expiresAt?: string) =>
      fetcher<Finding>(`/findings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason, expires_at: expiresAt }),
      }),
  },
  policies: {
    list: (orgId?: string) => fetcher<Policy[]>(orgId ? `/policies?organization_id=${orgId}` : '/policies'),
    create: (data: any) => fetcher<Policy>('/policies', { method: 'POST', body: JSON.stringify(data) }),
  },
  intelligence: {
    listDocuments: (source?: string) =>
      fetcher<SecurityDocument[]>(source ? `/intelligence/documents?source_type=${source}` : '/intelligence/documents'),
    search: (query: string) => fetcher<{ results: any[] }>('/intelligence/search', {
      method: 'POST',
      body: JSON.stringify({ query, limit: 5 }),
    }),
  },
  audit: {
    list: () => fetcher<AuditLog[]>('/audit/logs'),
  },
};
