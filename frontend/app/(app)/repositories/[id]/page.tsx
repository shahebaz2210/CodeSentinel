'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  FolderGit2,
  Play,
  ArrowLeft,
  GitBranch,
  Shield,
  Activity,
  AlertOctagon,
  FileCode,
  CheckCircle2,
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
import { Finding, Repository, Scan } from '@/types/api';
import { formatDate, formatDuration, truncateHash } from '@/lib/utils';

export default function RepositoryDetailPage() {
  const params = useParams();
  const repoId = params.id as string;

  const [repo, setRepo] = useState<Repository | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'findings' | 'scans'>('overview');
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [repoData, scansData, findingsData] = await Promise.all([
        api.repositories.get(repoId),
        api.repositories.getScans(repoId),
        api.repositories.getFindings(repoId),
      ]);
      setRepo(repoData);
      setScans(scansData);
      setFindings(findingsData);
    } catch (e: any) {
      setError(e.message || 'Failed to load repository.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (repoId) loadData();
  }, [repoId]);

  const handleTriggerScan = async () => {
    setScanning(true);
    try {
      const scan = await api.repositories.triggerScan(repoId);
      window.location.href = `/scans/${scan.id}`;
    } catch (e: any) {
      alert(`Scan trigger error: ${e.message}`);
      setScanning(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Back Link */}
        <Link
          href="/repositories"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Repositories</span>
        </Link>

        {error && <ErrorState message={error} onRetry={loadData} />}

        {loading || !repo ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <>
            {/* Repository Header Panel */}
            <div className="p-6 rounded-lg bg-surface border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-accent" />
                  <h1 className="text-xl font-bold font-mono text-text-primary">
                    {repo.owner}/{repo.name}
                  </h1>
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-surface-elevated border border-border text-text-muted uppercase">
                    {repo.visibility}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-text-muted">
                  <span className="flex items-center gap-1">
                    <GitBranch className="w-3.5 h-3.5" /> {repo.default_branch}
                  </span>
                  <span>Language: {repo.language || 'Unknown'}</span>
                  <span>Last Scan: {formatDate(repo.last_scan_at)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <RiskScore score={repo.last_risk_score} size="md" />
                <Button
                  variant="primary"
                  size="md"
                  className="gap-2 font-semibold"
                  loading={scanning}
                  onClick={handleTriggerScan}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Scan Repository</span>
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 border-b border-border text-xs font-mono">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('findings')}
                className={`px-4 py-2 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'findings'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                <span>Findings</span>
                <span className="px-1.5 py-0.2 rounded-full bg-surface-elevated text-[10px]">
                  {findings.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('scans')}
                className={`px-4 py-2 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'scans'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                <span>Scans</span>
                <span className="px-1.5 py-0.2 rounded-full bg-surface-elevated text-[10px]">
                  {scans.length}
                </span>
              </button>
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-surface border border-border">
                    <span className="text-xs font-mono text-text-muted uppercase">Open Critical Findings</span>
                    <p className="text-2xl font-bold font-mono text-severity-critical mt-2">
                      {findings.filter((f) => f.severity === 'CRITICAL' && f.status === 'OPEN').length}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-surface border border-border">
                    <span className="text-xs font-mono text-text-muted uppercase">Total Open Vulnerabilities</span>
                    <p className="text-2xl font-bold font-mono text-severity-high mt-2">
                      {findings.filter((f) => f.status === 'OPEN').length}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-surface border border-border">
                    <span className="text-xs font-mono text-text-muted uppercase">Policy Decision</span>
                    <div className="mt-2">
                      <StatusBadge status={repo.policy_status || 'PASS'} />
                    </div>
                  </div>
                </div>

                {/* Latest Scan Summary */}
                <div className="p-4 rounded-lg bg-surface border border-border space-y-3">
                  <span className="text-xs font-mono font-semibold uppercase text-text-primary">
                    Latest Scan Summary
                  </span>
                  {scans.length === 0 ? (
                    <p className="text-xs text-text-muted py-4">No scans run yet on this repository.</p>
                  ) : (
                    <div className="flex items-center justify-between p-3 rounded bg-surface-elevated text-xs font-mono">
                      <div>
                        <span className="font-semibold text-text-primary">Scan {scans[0].id.substring(0, 8)}</span>
                        <p className="text-text-muted text-[11px] mt-0.5">
                          {formatDate(scans[0].completed_at || scans[0].created_at)} • {formatDuration(scans[0].duration_ms)}
                        </p>
                      </div>
                      <Link href={`/scans/${scans[0].id}`}>
                        <Button variant="outline" size="sm">
                          Inspect Pipeline
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Findings */}
            {activeTab === 'findings' && (
              <div className="rounded-lg bg-surface border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Severity</TableHead>
                      <TableHead>Finding Title</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Scanner</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {findings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-xs text-text-muted">
                          No findings detected in this repository.
                        </TableCell>
                      </TableRow>
                    ) : (
                      findings.map((f) => (
                        <TableRow key={f.id}>
                          <TableCell>
                            <SeverityBadge severity={f.severity} size="sm" />
                          </TableCell>
                          <TableCell className="font-medium text-xs text-text-primary">
                            <Link href={`/findings/${f.id}`} className="hover:text-accent hover:underline">
                              {f.title}
                            </Link>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-text-muted truncate max-w-xs">
                            {f.file_path}:{f.start_line}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-text-secondary">{f.scanner}</TableCell>
                          <TableCell>
                            <RiskScore score={f.risk_score} size="sm" showLabel={false} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={f.status} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Tab: Scans */}
            {activeTab === 'scans' && (
              <div className="rounded-lg bg-surface border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Scan ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Commit</TableHead>
                      <TableHead>Findings</TableHead>
                      <TableHead>Policy</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Executed At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scans.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-xs text-text-muted">
                          No scan history recorded yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      scans.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-mono text-xs font-semibold">
                            <Link href={`/scans/${s.id}`} className="hover:text-accent hover:underline">
                              {s.id.substring(0, 8)}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-surface-elevated border border-border">
                              {s.type}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-text-muted">
                            {s.commit_sha ? truncateHash(s.commit_sha) : '-'}
                          </TableCell>
                          <TableCell className="font-mono text-xs font-bold">{s.total_findings}</TableCell>
                          <TableCell>
                            <StatusBadge status={s.policy_result || 'PASS'} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={s.status} />
                          </TableCell>
                          <TableCell className="font-mono text-xs text-text-muted">
                            {formatDate(s.completed_at || s.created_at)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
