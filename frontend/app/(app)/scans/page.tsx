'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, Play, ArrowUpRight, GitCommit, FolderGit2, CheckCircle2, XCircle, RotateCw } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { RiskScore } from '@/components/ui/risk-score';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { Scan } from '@/types/api';
import { formatDate, formatDuration, truncateHash } from '@/lib/utils';

export default function ScansHistoryPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load dashboard summary recent scans as history
    api.dashboard.getSummary().then((data) => {
      setScans(data.recent_scans || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6 font-sans text-[#f1f5f9]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/15 border border-[#3b82f6]/30 flex items-center justify-center text-[#3b82f6] shadow-[0_0_16px_rgba(59,130,246,0.2)]">
                <Activity className="w-4 h-4" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Scan History & Telemetry</h1>
            </div>
            <p className="text-xs text-[#94a3b8] mt-1">
              Auditable execution log of repository baseline scans and pull request policy gate checks.
            </p>
          </div>

          <Link href="/repositories">
            <Button variant="primary" size="sm" className="gap-1.5 font-semibold">
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>New Scan</span>
            </Button>
          </Link>
        </div>

        {/* Scan Table (High Glassmorphism with Top-Right Glow) */}
        <div className="rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8)] hover:border-white/[0.22] transition-all overflow-hidden relative">
          {/* Ambient Glow in Top-Right Corner */}
          <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-gradient-to-bl from-[#38bdf8]/20 via-[#3b82f6]/10 to-transparent blur-[85px] pointer-events-none" />

          <div className="relative z-10">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-[#181d24]/50 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[10px] font-mono uppercase tracking-wider text-[#757780] bg-white/[0.02]">
                    <th className="px-6 py-3.5 font-semibold">Scan ID</th>
                    <th className="px-6 py-3.5 font-semibold">Type</th>
                    <th className="px-6 py-3.5 font-semibold">Triggered By</th>
                    <th className="px-6 py-3.5 font-semibold">Commit</th>
                    <th className="px-6 py-3.5 font-semibold">Findings</th>
                    <th className="px-6 py-3.5 font-semibold">Status</th>
                    <th className="px-6 py-3.5 font-semibold">Duration</th>
                    <th className="px-6 py-3.5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {scans.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-xs font-mono text-[#757780]">
                        No security scans recorded yet. Trigger a scan from Connected Repositories.
                      </td>
                    </tr>
                  ) : (
                    scans.map((s) => {
                      const isFailed = s.status === 'FAILED' || s.policy_result === 'FAIL';
                      const isRunning = s.status === 'RUNNING' || s.status === 'QUEUED';

                      return (
                        <tr key={s.id} className="hover:bg-white/[0.02] transition-colors group">
                          {/* Scan ID */}
                          <td className="px-6 py-4 font-mono font-bold text-[#3b82f6]">
                            <Link href={`/scans/${s.id}`} className="hover:underline flex items-center gap-1.5">
                              <span>{s.id.substring(0, 8)}</span>
                            </Link>
                          </td>

                          {/* Type */}
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/[0.04] border border-white/[0.08] text-white font-bold">
                              {s.type}
                            </span>
                          </td>

                          {/* Triggered By */}
                          <td className="px-6 py-4 font-mono text-xs text-[#94a3b8]">
                            {s.triggered_by || 'DevSecOps'}
                          </td>

                          {/* Commit */}
                          <td className="px-6 py-4 font-mono text-xs text-[#757780]">
                            <div className="flex items-center gap-1.5 text-[#3b82f6]">
                              <GitCommit className="w-3.5 h-3.5" />
                              <span>{s.commit_sha ? truncateHash(s.commit_sha) : 'main'}</span>
                            </div>
                          </td>

                          {/* Findings */}
                          <td className="px-6 py-4 font-mono text-xs font-bold">
                            {s.total_findings > 0 ? (
                              <span className="text-[#ef4444]">{s.total_findings} Issues</span>
                            ) : (
                              <span className="text-[#22c55e]">0 Clean</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            {isFailed ? (
                              <span className="inline-flex items-center gap-1 text-[#ef4444] font-semibold">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Failed</span>
                              </span>
                            ) : isRunning ? (
                              <span className="inline-flex items-center gap-1 text-[#38bdf8] font-semibold">
                                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Running</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[#22c55e] font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Passed</span>
                              </span>
                            )}
                          </td>

                          {/* Duration */}
                          <td className="px-6 py-4 font-mono text-[#757780]">
                            {isRunning ? '--' : formatDuration(s.duration_ms)}
                          </td>

                          {/* Action */}
                          <td className="px-6 py-4 text-right">
                            <Link href={`/scans/${s.id}`}>
                              <button className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-[#3b82f6] text-[#94a3b8] hover:text-white text-xs font-mono font-medium transition-all">
                                Inspect →
                              </button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
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
