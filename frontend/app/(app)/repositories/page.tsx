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
  GitBranch,
  Clock,
  ChevronRight,
  Github,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { RiskScore } from '@/components/ui/risk-score';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
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

  const [authExpired, setAuthExpired] = useState(false);

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
    setAuthExpired(false);
    try {
      await api.repositories.sync('default-org');
      await loadRepos();
    } catch (e: any) {
      if (e.message?.includes('401') || e.message?.includes('Bad credentials')) {
        setAuthExpired(true);
      } else {
        alert(`Sync failed: ${e.message}`);
      }
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
      <div className="space-y-6 font-sans text-[#f1f5f9]">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/15 border border-[#3b82f6]/30 flex items-center justify-center text-[#3b82f6]">
                <FolderGit2 className="w-4 h-4" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Connected Repositories</h1>
            </div>
            <p className="text-xs text-[#94a3b8] mt-1">
              Select a repository to inspect code security baseline, branch policies, and vulnerability findings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSync}
              loading={syncing}
              className="gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>Sync GitHub</span>
            </Button>
          </div>
        </div>

        {/* Auth Expired Banner */}
        {authExpired && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Your GitHub OAuth access token has expired. Please re-authenticate to sync your repositories and pull requests.</span>
            </div>
            <a
              href="http://localhost:8000/api/v1/auth/github"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-colors shrink-0"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Reconnect GitHub</span>
            </a>
          </div>
        )}

        {error && <ErrorState message={error} onRetry={loadRepos} />}

        {/* Filter / Search Bar with Top-Right Glow */}
        <div className="p-4 rounded-2xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] flex flex-wrap items-center justify-between gap-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_16px_40px_rgba(0,0,0,0.8)] relative overflow-hidden">
          {/* Ambient Glow in Top-Right Corner */}
          <div className="absolute -top-12 -right-12 w-[260px] h-[260px] bg-gradient-to-bl from-[#38bdf8]/20 via-[#3b82f6]/10 to-transparent blur-[60px] pointer-events-none" />

          <div className="relative z-10 max-w-xs w-full">
            <Input
              placeholder="Search repositories or languages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4 text-[#757780]" />}
            />
          </div>

          <div className="relative z-10 text-xs font-mono text-[#757780] flex items-center gap-2">
            <span>Showing <strong className="text-white">{filteredRepos.length}</strong> of {repos.length} repositories</span>
          </div>
        </div>

        {/* Repositories Table / Grid with Bottom-Left Glow */}
        <div className="rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8)] hover:border-white/[0.22] transition-all overflow-hidden relative">
          {/* Ambient Glow in Bottom-Left Corner */}
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-gradient-to-tr from-[#10b981]/20 via-[#06b6d4]/10 to-transparent blur-[85px] pointer-events-none" />

          <div className="relative z-10">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-[#181d24]/50 rounded-lg" />
              ))}
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="py-16 px-6 text-center space-y-3">
              <FolderGit2 className="w-10 h-10 text-[#757780] mx-auto opacity-50" />
              <p className="text-sm font-semibold text-white">No repositories found</p>
              <p className="text-xs text-[#757780] max-w-sm mx-auto">
                {search ? `No repositories matching "${search}"` : 'Sync your GitHub account to import repositories and run security scans.'}
              </p>
              {!search && (
                <Button variant="primary" size="sm" onClick={handleSync} loading={syncing} className="mt-2">
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  <span>Sync GitHub Now</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[10px] font-mono uppercase tracking-wider text-[#757780] bg-white/[0.02]">
                    <th className="px-6 py-3.5 font-semibold">Repository</th>
                    <th className="px-6 py-3.5 font-semibold">Default Branch</th>
                    <th className="px-6 py-3.5 font-semibold">Language</th>
                    <th className="px-6 py-3.5 font-semibold">Last Scanned</th>
                    <th className="px-6 py-3.5 font-semibold">Status</th>
                    <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredRepos.map((repo) => {
                    const isTriggering = triggeringId === repo.id;
                    return (
                      <tr key={repo.id} className="hover:bg-white/[0.02] transition-colors group">
                        {/* Name & Owner */}
                        <td className="px-6 py-4">
                          <Link
                            href={`/repositories/${repo.id}`}
                            className="flex items-center gap-2.5 font-medium text-white hover:text-[#3b82f6] transition-colors"
                          >
                            <FolderGit2 className="w-4 h-4 text-[#757780] group-hover:text-[#3b82f6] transition-colors" />
                            <div>
                              <span className="font-bold">{repo.name}</span>
                              <span className="text-[#757780] text-[11px] block font-mono">{repo.owner}</span>
                            </div>
                          </Link>
                        </td>

                        {/* Branch */}
                        <td className="px-6 py-4 font-mono text-[#94a3b8]">
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] text-[11px]">
                            <GitBranch className="w-3 h-3 text-[#757780]" />
                            <span>{repo.default_branch || 'main'}</span>
                          </div>
                        </td>

                        {/* Language */}
                        <td className="px-6 py-4 font-mono text-[#94a3b8]">
                          <span className="px-2 py-0.5 rounded text-[11px] bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[#60a5fa] font-medium">
                            {repo.language || 'Multi-language'}
                          </span>
                        </td>

                        {/* Last Scanned */}
                        <td className="px-6 py-4 text-[#757780] font-mono text-[11px]">
                          {repo.last_scan_at ? formatDate(repo.last_scan_at) : 'Never'}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                            <span>MONITORED</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTriggerScan(repo.id)}
                              loading={isTriggering}
                              className="gap-1.5 text-xs text-[#3b82f6] hover:text-white hover:border-[#3b82f6]/40"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Scan</span>
                            </Button>
                            <Link href={`/repositories/${repo.id}`}>
                              <button className="p-1.5 rounded-lg text-[#757780] hover:text-white hover:bg-white/[0.06] transition-colors">
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
