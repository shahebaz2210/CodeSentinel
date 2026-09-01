'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FolderGit2,
  RefreshCw,
  Search,
  Play,
  ExternalLink,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { RiskScore } from '@/components/ui/risk-score';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/lib/api';
import { Repository } from '@/types/api';
import { formatDate } from '@/lib/utils';

export default function RepositoriesPage() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadRepos = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.repositories.list();
      setRepos(list);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch repositories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRepos();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.repositories.sync('default-org');
      await loadRepos();
    } catch (e: any) {
      alert(`Sync failed: ${e.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleTriggerScan = async (repoId: string) => {
    setTriggeringId(repoId);
    try {
      const scan = await api.repositories.triggerScan(repoId);
      window.location.href = `/scans/${scan.id}`;
    } catch (e: any) {
      alert(`Scan initiation failed: ${e.message}`);
      setTriggeringId(null);
    }
  };

  const filteredRepos = repos.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.owner.toLowerCase().includes(search.toLowerCase()) ||
      (r.language && r.language.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-text-primary">Connected Repositories</h1>
            <p className="text-xs text-text-muted mt-0.5">
              Select a repository to configure scanning policies and inspect code security
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSync}
              loading={syncing}
              className="gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync GitHub</span>
            </Button>
          </div>
        </div>

        {error && <ErrorState message={error} onRetry={loadRepos} />}

        {/* Filter / Search Bar */}
        <div className="flex items-center gap-3">
          <div className="max-w-xs w-full">
            <Input
              placeholder="Search repository or language..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="text-xs font-mono text-text-muted ml-auto">
            Showing {filteredRepos.length} of {repos.length} repositories
          </div>
        </div>

        {/* Repository Table */}
        <div className="rounded-lg bg-surface border border-border overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<FolderGit2 className="w-8 h-8" />}
                title="No repositories found"
                description={
                  search
                    ? 'No repositories match your search filter.'
                    : 'Connect your GitHub account or click "Sync GitHub" to discover repositories.'
                }
                actionLabel={search ? undefined : 'Sync GitHub'}
                onAction={search ? undefined : handleSync}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Repository</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Open Issues</TableHead>
                  <TableHead>Policy Gate</TableHead>
                  <TableHead>Last Scan</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRepos.map((repo) => (
                  <TableRow key={repo.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FolderGit2 className="w-4 h-4 text-accent flex-shrink-0" />
                        <div className="flex flex-col">
                          <Link
                            href={`/repositories/${repo.id}`}
                            className="font-mono text-xs font-semibold text-text-primary hover:text-accent hover:underline"
                          >
                            {repo.owner}/{repo.name}
                          </Link>
                          <span className="text-[10px] text-text-muted font-mono">{repo.visibility}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {repo.language ? (
                        <div className="flex flex-wrap gap-1">
                          {repo.language.split(',').map((lang) => (
                            <span
                              key={lang.trim()}
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface-elevated border border-border text-text-secondary"
                            >
                              {lang.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-text-muted">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <RiskScore score={repo.last_risk_score} size="sm" showLabel={false} />
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {repo.open_findings_count > 0 ? (
                        <span className="text-severity-critical font-bold">{repo.open_findings_count}</span>
                      ) : (
                        <span className="text-text-muted">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={repo.policy_status || 'PASS'} />
                    </TableCell>
                    <TableCell className="text-xs text-text-muted font-mono">
                      {formatDate(repo.last_scan_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          variant="primary"
                          size="sm"
                          className="gap-1 text-xs"
                          loading={triggeringId === repo.id}
                          onClick={() => handleTriggerScan(repo.id)}
                        >
                          <Play className="w-3 h-3" />
                          <span>Scan</span>
                        </Button>
                        <Link href={`/repositories/${repo.id}`}>
                          <Button variant="outline" size="sm" className="text-xs">
                            Overview
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </AppShell>
  );
}
