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
  Clock,
  ChevronRight,
  RotateCw,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { SeverityBadge } from '@/components/ui/severity-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { RiskScore } from '@/components/ui/risk-score';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
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

  // Metrics calculation
  const criticalCount = findings.filter((f) => f.severity === 'CRITICAL').length;
  const highCount = findings.filter((f) => f.severity === 'HIGH').length;
  const openCount = findings.filter((f) => f.status === 'OPEN').length;

  return (
    <AppShell>
      <div className="space-y-6 font-sans text-[#f1f5f9]">
        {/* Back Link */}
        <Link
          href="/repositories"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#757780] hover:text-[#3b82f6] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Repositories</span>
        </Link>

        {error && <ErrorState message={error} onRetry={loadData} />}

        {loading || !repo ? (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full bg-[#181d24]/50 rounded-xl" />
            <Skeleton className="h-80 w-full bg-[#181d24]/50 rounded-xl" />
          </div>
        ) : (
          <>
            {/* Repository Header Panel (High Glassmorphism with Top-Right Glow) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden hover:border-white/[0.22] transition-all">
              {/* Ambient Glow in Top-Right Corner */}
              <div className="absolute -top-16 -right-16 w-[360px] h-[360px] bg-gradient-to-bl from-[#38bdf8]/20 via-[#3b82f6]/10 to-transparent blur-[75px] pointer-events-none" />

              <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.1] flex items-center justify-center text-white shadow-[0_0_16px_rgba(59,130,246,0.25)]">
                    <FolderGit2 className="w-5 h-5 text-[#38bdf8]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{repo.name}</h1>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e]">
                        MONITORED
                      </span>
                    </div>
                    <span className="text-xs font-mono text-[#757780]">{repo.owner} • {repo.full_name}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs text-[#94a3b8]">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                    <GitBranch className="w-3.5 h-3.5 text-[#757780]" />
                    <span>{repo.default_branch || 'main'}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[#60a5fa]">
                    <span>{repo.language || 'Multi-language'}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08] text-[#757780]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Last scan: {repo.last_scan_at ? formatDate(repo.last_scan_at) : 'Never'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="relative z-10 flex items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleTriggerScan}
                  loading={scanning}
                  className="gap-2 font-semibold"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Trigger Security Scan</span>
                </Button>
              </div>
            </div>

            {/* Quick KPI Stat Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Critical Findings (Top-Left Glow) */}
              <div className="p-6 rounded-2xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_20px_50px_rgba(0,0,0,0.8)] flex items-center justify-between relative overflow-hidden hover:border-white/[0.22] transition-all">
                <div className="absolute -top-12 -left-12 w-[220px] h-[220px] bg-gradient-to-br from-[#ef4444]/20 via-[#f97316]/10 to-transparent blur-[55px] pointer-events-none" />
                <div className="relative z-10">
                  <span className="text-[11px] font-mono uppercase text-[#757780]">Critical Findings</span>
                  <div className="text-3xl font-bold font-mono text-[#ef4444] mt-1">{criticalCount}</div>
                </div>
                <div className="relative z-10 w-9 h-9 rounded-xl bg-[#ef4444]/15 border border-[#ef4444]/30 flex items-center justify-center text-[#ef4444]">
                  <AlertOctagon className="w-5 h-5" />
                </div>
              </div>

              {/* Card 2: High Severity (Bottom-Right Glow) */}
              <div className="p-6 rounded-2xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_20px_50px_rgba(0,0,0,0.8)] flex items-center justify-between relative overflow-hidden hover:border-white/[0.22] transition-all">
                <div className="absolute -bottom-12 -right-12 w-[220px] h-[220px] bg-gradient-to-tl from-[#f97316]/20 via-[#ea580c]/10 to-transparent blur-[55px] pointer-events-none" />
                <div className="relative z-10">
                  <span className="text-[11px] font-mono uppercase text-[#757780]">High Severity</span>
                  <div className="text-3xl font-bold font-mono text-[#f97316] mt-1">{highCount}</div>
                </div>
                <div className="relative z-10 w-9 h-9 rounded-xl bg-[#f97316]/15 border border-[#f97316]/30 flex items-center justify-center text-[#f97316]">
                  <Shield className="w-5 h-5" />
                </div>
              </div>

              {/* Card 3: Scans Executed (Top-Right Glow) */}
              <div className="p-6 rounded-2xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_20px_50px_rgba(0,0,0,0.8)] flex items-center justify-between relative overflow-hidden hover:border-white/[0.22] transition-all">
                <div className="absolute -top-12 -right-12 w-[220px] h-[220px] bg-gradient-to-bl from-[#38bdf8]/20 via-[#3b82f6]/10 to-transparent blur-[55px] pointer-events-none" />
                <div className="relative z-10">
                  <span className="text-[11px] font-mono uppercase text-[#757780]">Scans Executed</span>
                  <div className="text-3xl font-bold font-mono text-white mt-1">{scans.length}</div>
                </div>
                <div className="relative z-10 w-9 h-9 rounded-xl bg-[#3b82f6]/15 border border-[#3b82f6]/30 flex items-center justify-center text-[#3b82f6]">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-white/[0.08] pb-1 font-mono text-xs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  activeTab === 'overview'
                    ? 'bg-[#3b82f6] text-white shadow-[0_0_16px_rgba(59,130,246,0.35)]'
                    : 'text-[#94a3b8] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Overview & Context
              </button>
              <button
                onClick={() => setActiveTab('findings')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  activeTab === 'findings'
                    ? 'bg-[#3b82f6] text-white shadow-[0_0_16px_rgba(59,130,246,0.35)]'
                    : 'text-[#94a3b8] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Findings ({findings.length})
              </button>
              <button
                onClick={() => setActiveTab('scans')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  activeTab === 'scans'
                    ? 'bg-[#3b82f6] text-white shadow-[0_0_16px_rgba(59,130,246,0.35)]'
                    : 'text-[#94a3b8] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Scan History ({scans.length})
              </button>
            </div>

            {/* Tab Content Panels */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="p-6 sm:p-8 rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8)] space-y-4 relative overflow-hidden">
                  <div className="absolute -bottom-16 -right-16 w-[340px] h-[340px] bg-gradient-to-tl from-[#10b981]/20 via-[#06b6d4]/10 to-transparent blur-[75px] pointer-events-none" />

                  <div className="relative z-10 space-y-4">
                    <h3 className="text-base font-bold text-white tracking-tight">Repository Context & Baseline</h3>
                    <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
                      CodeSentinel performs continuous AST analysis and secrets detection across all branches of <strong className="text-white">{repo.name}</strong>. Vulnerabilities detected during pull request checks are evaluated against active merge policies.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-1.5 font-mono text-xs">
                        <span className="text-[#757780] text-[11px] uppercase">Monitored Scanners</span>
                        <div className="flex items-center gap-2 text-white">
                          <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08]">Semgrep AST</span>
                          <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08]">Gitleaks Secrets</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-1.5 font-mono text-xs">
                        <span className="text-[#757780] text-[11px] uppercase">Active Policy Gate</span>
                        <div className="flex items-center gap-2 text-white">
                          <span className="px-2.5 py-1 rounded-lg bg-[#3b82f6]/15 border border-[#3b82f6]/30 text-[#60a5fa] font-bold">
                            Standard Production Gate
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'findings' && (
              <div className="rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8)] overflow-hidden relative">
                {findings.length === 0 ? (
                  <div className="py-12 text-center text-xs font-mono text-[#757780]">
                    No security vulnerabilities recorded for this repository.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-[10px] font-mono uppercase tracking-wider text-[#757780] bg-white/[0.02]">
                        <th className="px-6 py-3.5 font-semibold">Finding</th>
                        <th className="px-6 py-3.5 font-semibold">Severity</th>
                        <th className="px-6 py-3.5 font-semibold">Location</th>
                        <th className="px-6 py-3.5 font-semibold">Scanner</th>
                        <th className="px-6 py-3.5 font-semibold">Status</th>
                        <th className="px-6 py-3.5 font-semibold text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {findings.map((f) => (
                        <tr key={f.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <Link href={`/findings/${f.id}`} className="font-bold text-white hover:text-[#3b82f6] transition-colors block">
                              {f.title}
                            </Link>
                            <span className="text-[#757780] text-[11px] font-mono">{f.cwe_id || 'CWE-Generic'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <SeverityBadge severity={f.severity} size="sm" />
                          </td>
                          <td className="px-6 py-4 font-mono text-[#94a3b8] text-[11px]">
                            {f.file_path}:{f.start_line}
                          </td>
                          <td className="px-6 py-4 font-mono text-[#757780]">
                            {f.scanner}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={f.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link href={`/findings/${f.id}`}>
                              <button className="px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-white text-[11px] font-mono transition-colors">
                                Inspect →
                              </button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'scans' && (
              <div className="rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8)] overflow-hidden relative">
                {scans.length === 0 ? (
                  <div className="py-12 text-center text-xs font-mono text-[#757780]">
                    No scan runs recorded yet for this repository.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-[10px] font-mono uppercase tracking-wider text-[#757780] bg-white/[0.02]">
                        <th className="px-6 py-3.5 font-semibold">Scan ID</th>
                        <th className="px-6 py-3.5 font-semibold">Commit</th>
                        <th className="px-6 py-3.5 font-semibold">Findings</th>
                        <th className="px-6 py-3.5 font-semibold">Duration</th>
                        <th className="px-6 py-3.5 font-semibold">Status</th>
                        <th className="px-6 py-3.5 font-semibold text-right">View Pipeline</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {scans.map((s) => (
                        <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-[#3b82f6]">
                            <Link href={`/scans/${s.id}`} className="hover:underline">
                              {s.id.substring(0, 8)}
                            </Link>
                          </td>
                          <td className="px-6 py-4 font-mono text-[#94a3b8]">
                            {s.commit_sha ? truncateHash(s.commit_sha) : 'main'}
                          </td>
                          <td className="px-6 py-4 font-mono font-bold">
                            {s.total_findings > 0 ? (
                              <span className="text-[#ef4444]">{s.total_findings} ISSUES</span>
                            ) : (
                              <span className="text-[#22c55e]">CLEAN</span>
                            )}
                          </td>
                          <td className="px-6 py-4 font-mono text-[#757780]">
                            {formatDuration(s.duration_ms)}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={s.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link href={`/scans/${s.id}`}>
                              <button className="px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-white text-[11px] font-mono transition-colors">
                                Pipeline →
                              </button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
