'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertOctagon,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Shield,
  FileCode,
  AlertTriangle,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SeverityBadge } from '@/components/ui/severity-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { RiskScore } from '@/components/ui/risk-score';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { api } from '@/lib/api';
import { Finding, FindingStatus, Severity } from '@/types/api';
import { formatDate } from '@/lib/utils';

export default function FindingsPage() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 25;

  // Filter state
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [scannerFilter, setScannerFilter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const loadFindings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.findings.list({
        page,
        limit,
        search: search || undefined,
        severity: severityFilter || undefined,
        status: statusFilter || undefined,
        scanner: scannerFilter || undefined,
      });
      setFindings(res.items);
      setTotal(res.pagination.total);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch findings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFindings();
  }, [page, severityFilter, statusFilter, scannerFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadFindings();
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <AppShell>
      <div className="space-y-6 font-sans text-[#f1f5f9]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#ef4444]/15 border border-[#ef4444]/30 flex items-center justify-center text-[#ef4444] shadow-[0_0_16px_rgba(239,68,68,0.2)]">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Security Findings</h1>
            </div>
            <p className="text-xs text-[#94a3b8] mt-1">
              Prioritized vulnerability triage with AST scanner evidence, reachability analysis, and AI contextual assessments.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-[#757780]">
            <span className="px-3 py-1.5 rounded-lg bg-[#12151a]/75 backdrop-blur-xl border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <strong className="text-[#3b82f6]">{total}</strong> total vulnerabilities tracked
            </span>
          </div>
        </div>

        {error && <ErrorState message={error} onRetry={loadFindings} />}

        {/* Filter Toolbar (High Glassmorphism with Top-Left Glow) */}
        <div className="p-4 rounded-2xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] flex flex-wrap items-center justify-between gap-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_16px_40px_rgba(0,0,0,0.8)] relative overflow-hidden">
          {/* Ambient Glow in Top-Left Corner */}
          <div className="absolute -top-12 -left-12 w-[260px] h-[260px] bg-gradient-to-br from-[#ef4444]/20 via-[#f97316]/10 to-transparent blur-[60px] pointer-events-none" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 w-full">
            {/* Search form */}
            <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[220px] max-w-sm">
              <Input
                placeholder="Search title, file path, CWE..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search className="w-4 h-4 text-[#757780]" />}
              />
            </form>

            {/* Select Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
              {/* Severity Filter */}
              <select
                value={severityFilter}
                onChange={(e) => {
                  setSeverityFilter(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter by Severity"
                className="h-9 px-3 rounded-lg bg-black/60 border border-white/[0.1] text-[#f1f5f9] outline-none focus:border-[#3b82f6] cursor-pointer hover:border-white/[0.2] transition-colors"
              >
                <option value="">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter by Status"
                className="h-9 px-3 rounded-lg bg-black/60 border border-white/[0.1] text-[#f1f5f9] outline-none focus:border-[#3b82f6] cursor-pointer hover:border-white/[0.2] transition-colors"
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="RESOLVED">Resolved</option>
                <option value="FALSE_POSITIVE">False Positive</option>
                <option value="ACCEPTED_RISK">Accepted Risk</option>
              </select>

              {/* Scanner Filter */}
              <select
                value={scannerFilter}
                onChange={(e) => {
                  setScannerFilter(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter by Scanner"
                className="h-9 px-3 rounded-lg bg-black/60 border border-white/[0.1] text-[#f1f5f9] outline-none focus:border-[#3b82f6] cursor-pointer hover:border-white/[0.2] transition-colors"
              >
                <option value="">All Scanners</option>
                <option value="semgrep">Semgrep AST</option>
                <option value="gitleaks">Gitleaks Secrets</option>
              </select>

              {(search || severityFilter || statusFilter || scannerFilter) && (
                <button
                  onClick={() => {
                    setSearch('');
                    setSeverityFilter('');
                    setStatusFilter('');
                    setScannerFilter('');
                    setPage(1);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#94a3b8] hover:text-white border border-white/[0.08] transition-colors"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Findings Table with Bottom-Right Glow */}
        <div className="rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8)] hover:border-white/[0.22] transition-all overflow-hidden relative">
          {/* Ambient Glow in Bottom-Right Corner */}
          <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-gradient-to-tl from-[#8b5cf6]/20 via-[#3b82f6]/10 to-transparent blur-[85px] pointer-events-none" />

          <div className="relative z-10">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-[#181d24]/50 rounded-lg" />
              ))}
            </div>
          ) : findings.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Shield className="w-10 h-10 text-[#22c55e] mx-auto opacity-60" />
              <p className="text-sm font-semibold text-white">No vulnerabilities found</p>
              <p className="text-xs text-[#757780]">
                All monitored repositories and pull requests match active security policies.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[10px] font-mono uppercase tracking-wider text-[#757780] bg-white/[0.02]">
                    <th className="px-6 py-3.5 font-semibold">Vulnerability Title</th>
                    <th className="px-6 py-3.5 font-semibold">Severity</th>
                    <th className="px-6 py-3.5 font-semibold">Location</th>
                    <th className="px-6 py-3.5 font-semibold">Scanner</th>
                    <th className="px-6 py-3.5 font-semibold">Status</th>
                    <th className="px-6 py-3.5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {findings.map((f) => (
                    <tr key={f.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Title & CWE */}
                      <td className="px-6 py-4">
                        <Link
                          href={`/findings/${f.id}`}
                          className="font-bold text-white hover:text-[#3b82f6] transition-colors block"
                        >
                          {f.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5 font-mono text-[11px] text-[#757780]">
                          <span>{f.cwe_id || 'CWE-Unknown'}</span>
                          <span>•</span>
                          <span>{formatDate(f.created_at)}</span>
                        </div>
                      </td>

                      {/* Severity */}
                      <td className="px-6 py-4">
                        <SeverityBadge severity={f.severity} size="sm" />
                      </td>

                      {/* File Path & Line */}
                      <td className="px-6 py-4 font-mono text-[#94a3b8] text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <FileCode className="w-3.5 h-3.5 text-[#757780]" />
                          <span className="truncate max-w-xs">{f.file_path}:{f.start_line}</span>
                        </div>
                      </td>

                      {/* Scanner */}
                      <td className="px-6 py-4 font-mono text-[#757780]">
                        <span className="px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06]">
                          {f.scanner}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusBadge status={f.status} />
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <Link href={`/findings/${f.id}`}>
                          <button className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-[#3b82f6] text-[#94a3b8] hover:text-white text-xs font-mono font-medium transition-all shadow-sm">
                            Inspect →
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="px-6 py-3.5 border-t border-white/[0.06] flex items-center justify-between font-mono text-xs text-[#757780] bg-white/[0.01]">
              <span>
                Page <strong className="text-white">{page}</strong> of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-white/[0.08] hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-white/[0.08] hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
