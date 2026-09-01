'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  GitPullRequest,
  AlertOctagon,
  FolderGit2,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Play,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { SeverityBadge } from '@/components/ui/severity-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { RiskScore } from '@/components/ui/risk-score';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/lib/api';
import { DashboardSummary } from '@/types/api';
import { formatDate, formatDuration, truncateHash } from '@/lib/utils';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await api.dashboard.getSummary();
      setData(summary);
    } catch (e: any) {
      setError(e.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-text-primary">Security Posture Overview</h1>
            <p className="text-xs text-text-muted mt-0.5">
              Live telemetry and risk prioritization across connected repositories
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/repositories">
              <Button variant="secondary" size="sm" className="gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-text-muted" />
                <span>Repositories</span>
              </Button>
            </Link>
            <Link href="/findings">
              <Button variant="primary" size="sm" className="gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>All Findings</span>
              </Button>
            </Link>
          </div>
        </div>

        {error && <ErrorState message={error} onRetry={loadData} />}

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        ) : data ? (
          <>
            {/* Top Compact KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Posture Card */}
              <div className="p-4 rounded-lg bg-surface border border-border flex flex-col justify-between">
                <div className="flex items-center justify-between text-text-muted text-xs font-mono">
                  <span>POSTURE</span>
                  <ShieldCheck className="w-4 h-4 text-accent" />
                </div>
                <div className="my-1">
                  <span className="text-2xl font-bold font-mono tracking-tight text-accent">
                    {data.overall_security_posture}
                  </span>
                </div>
                <span className="text-[10px] text-text-muted font-mono">Deterministic Gate</span>
              </div>

              {/* Critical Findings */}
              <div className="p-4 rounded-lg bg-surface border border-border flex flex-col justify-between">
                <div className="flex items-center justify-between text-text-muted text-xs font-mono">
                  <span>CRITICAL</span>
                  <AlertOctagon className="w-4 h-4 text-severity-critical" />
                </div>
                <div className="my-1">
                  <span className="text-2xl font-bold font-mono tracking-tight text-severity-critical">
                    {data.critical_findings_count}
                  </span>
                </div>
                <span className="text-[10px] text-text-muted font-mono">Blockers Requiring Fix</span>
              </div>

              {/* High Risk Findings */}
              <div className="p-4 rounded-lg bg-surface border border-border flex flex-col justify-between">
                <div className="flex items-center justify-between text-text-muted text-xs font-mono">
                  <span>HIGH RISK</span>
                  <TrendingUp className="w-4 h-4 text-severity-high" />
                </div>
                <div className="my-1">
                  <span className="text-2xl font-bold font-mono tracking-tight text-severity-high">
                    {data.high_findings_count}
                  </span>
                </div>
                <span className="text-[10px] text-text-muted font-mono">High Priority Alerts</span>
              </div>

              {/* PR Gate Pass/Fail */}
              <div className="p-4 rounded-lg bg-surface border border-border flex flex-col justify-between">
                <div className="flex items-center justify-between text-text-muted text-xs font-mono">
                  <span>PR GATES</span>
                  <GitPullRequest className="w-4 h-4 text-text-muted" />
                </div>
                <div className="my-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-status-pass">{data.pr_gates_passed}</span>
                  <span className="text-xs font-mono text-text-muted">/</span>
                  <span className="text-xl font-bold font-mono text-status-fail">{data.pr_gates_failed}</span>
                </div>
                <span className="text-[10px] text-text-muted font-mono">Pass / Blocked Ratio</span>
              </div>

              {/* Active Scans */}
              <div className="p-4 rounded-lg bg-surface border border-border flex flex-col justify-between col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between text-text-muted text-xs font-mono">
                  <span>ACTIVE SCANS</span>
                  <Activity className="w-4 h-4 text-accent animate-pulse" />
                </div>
                <div className="my-1">
                  <span className="text-2xl font-bold font-mono tracking-tight text-text-primary">
                    {data.active_scans_count}
                  </span>
                </div>
                <span className="text-[10px] text-text-muted font-mono">Worker Queue Status</span>
              </div>
            </div>

            {/* Severity Distribution & Risk Trend Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Severity Breakdown Bar */}
              <div className="p-4 rounded-lg bg-surface border border-border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold uppercase text-text-primary">
                    Severity Distribution
                  </span>
                  <span className="text-xs font-mono text-text-muted">{data.total_open_findings} Total</span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-severity-critical flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-severity-critical" /> Critical
                    </span>
                    <span className="font-bold">{data.severity_distribution.critical}</span>
                  </div>
                  <div className="w-full bg-surface-elevated h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-severity-critical h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (data.severity_distribution.critical / Math.max(1, data.total_open_findings)) * 100)}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-1">
                    <span className="text-severity-high flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-severity-high" /> High
                    </span>
                    <span className="font-bold">{data.severity_distribution.high}</span>
                  </div>
                  <div className="w-full bg-surface-elevated h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-severity-high h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (data.severity_distribution.high / Math.max(1, data.total_open_findings)) * 100)}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-1">
                    <span className="text-severity-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-severity-medium" /> Medium
                    </span>
                    <span className="font-bold">{data.severity_distribution.medium}</span>
                  </div>
                  <div className="w-full bg-surface-elevated h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-severity-medium h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (data.severity_distribution.medium / Math.max(1, data.total_open_findings)) * 100)}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-1">
                    <span className="text-severity-low flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-severity-low" /> Low
                    </span>
                    <span className="font-bold">{data.severity_distribution.low}</span>
                  </div>
                  <div className="w-full bg-surface-elevated h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-severity-low h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (data.severity_distribution.low / Math.max(1, data.total_open_findings)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Repositories Risk Ranking */}
              <div className="lg:col-span-2 p-4 rounded-lg bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold uppercase text-text-primary">
                    Repository Security Ranking
                  </span>
                  <Link href="/repositories" className="text-xs text-accent hover:underline flex items-center gap-1">
                    <span>View all {data.total_repositories}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Repository</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Policy Status</TableHead>
                      <TableHead>Last Scan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.top_risky_repositories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-xs text-text-muted">
                          No repositories scanned yet. Connect GitHub to run scans.
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.top_risky_repositories.map((repo) => (
                        <TableRow key={repo.id}>
                          <TableCell className="font-medium font-mono text-xs text-text-primary">
                            <Link href={`/repositories/${repo.id}`} className="hover:text-accent hover:underline">
                              {repo.owner}/{repo.name}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <RiskScore score={repo.risk_score} size="sm" showLabel={false} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={repo.policy_status || 'PASS'} />
                          </TableCell>
                          <TableCell className="text-xs text-text-muted font-mono">
                            {formatDate(repo.last_scanned)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Recent Scans Table & Activity Feed */}
            <div className="p-4 rounded-lg bg-surface border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase text-text-primary">Recent Scans</span>
                <Link href="/scans" className="text-xs text-accent hover:underline flex items-center gap-1">
                  <span>View Scan History</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scan ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Commit</TableHead>
                    <TableHead>Findings</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Policy</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recent_scans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-xs text-text-muted">
                        No recent scans found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.recent_scans.map((scan) => (
                      <TableRow key={scan.id}>
                        <TableCell className="font-mono text-xs font-semibold text-text-primary">
                          <Link href={`/scans/${scan.id}`} className="hover:text-accent hover:underline">
                            {scan.id.substring(0, 8)}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-surface-elevated border border-border text-text-secondary">
                            {scan.type}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-text-muted">
                          {scan.commit_sha ? truncateHash(scan.commit_sha) : '-'}
                        </TableCell>
                        <TableCell className="text-xs font-mono font-bold">
                          <span className={scan.total_findings > 0 ? 'text-severity-high' : 'text-status-pass'}>
                            {scan.total_findings}
                          </span>
                        </TableCell>
                        <TableCell>
                          <RiskScore score={scan.risk_score} size="sm" showLabel={false} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={scan.policy_result || 'PASS'} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={scan.status} />
                        </TableCell>
                        <TableCell className="text-xs text-text-muted font-mono">
                          {formatDuration(scan.duration_ms)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/scans/${scan.id}`}>
                            <Button variant="outline" size="sm">
                              Inspect
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
