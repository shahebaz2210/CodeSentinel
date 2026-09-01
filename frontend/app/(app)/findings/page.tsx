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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-text-primary">Security Findings</h1>
            <p className="text-xs text-text-muted mt-0.5">
              Prioritized vulnerability triage with scanner evidence and context reasoning
            </p>
          </div>
          <div className="text-xs font-mono text-text-muted">
            <span className="font-bold text-text-primary">{total}</span> total vulnerabilities tracked
          </div>
        </div>

        {error && <ErrorState message={error} onRetry={loadFindings} />}

        {/* Filter Toolbar */}
        <div className="p-3 rounded-lg bg-surface border border-border flex flex-wrap items-center gap-3">
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px] max-w-sm">
            <Input
              placeholder="Search title, file path, rule..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </form>

          {/* Severity Dropdown */}
          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 px-3 text-xs font-mono bg-surface-elevated border border-border rounded-md text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 px-3 text-xs font-mono bg-surface-elevated border border-border rounded-md text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="RESOLVED">Resolved</option>
            <option value="ACCEPTED_RISK">Accepted Risk</option>
            <option value="FALSE_POSITIVE">False Positive</option>
          </select>

          {/* Scanner Dropdown */}
          <select
            value={scannerFilter}
            onChange={(e) => {
              setScannerFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 px-3 text-xs font-mono bg-surface-elevated border border-border rounded-md text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="">All Scanners</option>
            <option value="semgrep">Semgrep</option>
            <option value="gitleaks">Gitleaks</option>
          </select>

          {(severityFilter || statusFilter || scannerFilter || search) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSeverityFilter('');
                setStatusFilter('');
                setScannerFilter('');
                setSearch('');
                setPage(1);
              }}
              className="text-xs text-text-muted hover:text-text-primary"
            >
              Reset Filters
            </Button>
          )}
        </div>

        {/* Findings Table */}
        <div className="rounded-lg bg-surface border border-border overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : findings.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<AlertOctagon className="w-8 h-8" />}
                title="No findings match your criteria"
                description="Try broadening your severity or status filters, or scan a connected repository."
              />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Severity</TableHead>
                    <TableHead>Finding</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>CWE / Category</TableHead>
                    <TableHead>Scanner</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>First Seen</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {findings.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>
                        <SeverityBadge severity={f.severity} size="sm" />
                      </TableCell>
                      <TableCell className="max-w-md font-medium text-xs text-text-primary">
                        <Link href={`/findings/${f.id}`} className="hover:text-accent hover:underline block truncate">
                          {f.title}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-text-muted truncate max-w-xs">
                        {f.file_path}:{f.start_line}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-text-secondary">
                        {f.cwe_id || f.category}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-text-muted">{f.scanner}</TableCell>
                      <TableCell>
                        <RiskScore score={f.risk_score} size="sm" showLabel={false} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={f.status} />
                      </TableCell>
                      <TableCell className="text-xs text-text-muted font-mono whitespace-nowrap">
                        {formatDate(f.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/findings/${f.id}`}>
                          <Button variant="outline" size="sm" className="text-xs">
                            Investigate
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Footer */}
              <div className="px-4 py-3 bg-surface-elevated/40 border-t border-border flex items-center justify-between text-xs font-mono text-text-muted">
                <span>
                  Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="h-7 px-2 text-xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="h-7 px-2 text-xs"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
