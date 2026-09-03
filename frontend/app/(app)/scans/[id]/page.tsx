'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Activity,
  CheckCircle2,
  AlertOctagon,
  Clock,
  FileCode,
  ArrowLeft,
  XCircle,
  Play,
  RotateCcw,
  ShieldCheck,
  RotateCw,
  GitCommit,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { SeverityBadge } from '@/components/ui/severity-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { RiskScore } from '@/components/ui/risk-score';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { api } from '@/lib/api';
import { Finding, Scan, ScanStage } from '@/types/api';
import { formatDate, formatDuration, truncateHash } from '@/lib/utils';

export default function ScanProgressPage() {
  const params = useParams();
  const scanId = params.id as string;

  const [scan, setScan] = useState<Scan | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadScanData = async () => {
    try {
      const scanData = await api.scans.get(scanId);
      setScan(scanData);
      if (scanData.status === 'COMPLETED' || scanData.status === 'PARTIAL_FAILURE' || scanData.status === 'FAILED') {
        const findingsData = await api.scans.getFindings(scanId);
        setFindings(findingsData || []);
      }
      setError(null);
    } catch (e: any) {
      if (!scan) {
        setError(e.message || 'Failed to fetch scan progress.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 1-second fast polling while scan is actively RUNNING or QUEUED
  useEffect(() => {
    loadScanData();
    if (scan && scan.status !== 'RUNNING' && scan.status !== 'QUEUED') {
      return;
    }
    const interval = setInterval(() => {
      if (scan?.status === 'RUNNING' || scan?.status === 'QUEUED' || !scan) {
        loadScanData();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [scanId, scan?.status]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.scans.cancel(scanId);
      await loadScanData();
    } catch (e: any) {
      alert(`Cancel failed: ${e.message}`);
    } finally {
      setCancelling(false);
    }
  };

  const defaultStages = [
    { name: 'PREPARING', label: '1. Preparing Workspace' },
    { name: 'FETCHING', label: '2. Fetching Code' },
    { name: 'INVENTORY', label: '3. File Inventory' },
    { name: 'SEMGREP', label: '4. Semgrep AST Scan' },
    { name: 'GITLEAKS', label: '5. Gitleaks Secrets' },
    { name: 'NORMALIZATION', label: '6. Normalization' },
    { name: 'CONTEXT', label: '7. Code Context' },
    { name: 'INTELLIGENCE', label: '8. Security RAG' },
    { name: 'AI', label: '9. Gemini AI Analysis' },
    { name: 'RISK', label: '10. Risk Evaluation' },
    { name: 'POLICY', label: '11. Policy Gate' },
    { name: 'PERSIST', label: '12. Persisting Data' },
  ];

  const isRunning = scan?.status === 'RUNNING' || scan?.status === 'QUEUED';
  const isFailed = scan?.status === 'FAILED' || scan?.policy_result === 'FAIL';

  return (
    <AppShell>
      <div className="space-y-6 font-sans text-[#f1f5f9]">
        {/* Back Link */}
        <Link
          href="/scans"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#757780] hover:text-[#3b82f6] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Scan History</span>
        </Link>

        {error && <ErrorState message={error} onRetry={loadScanData} />}

        {loading || !scan ? (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full bg-[#181d24]/50 rounded-xl" />
            <Skeleton className="h-96 w-full bg-[#181d24]/50 rounded-xl" />
          </div>
        ) : (
          <>
            {/* Header Card (High Glassmorphism with Top-Right Glow) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden hover:border-white/[0.22] transition-all">
              {/* Ambient Glow in Top-Right Corner */}
              <div className="absolute -top-16 -right-16 w-[360px] h-[360px] bg-gradient-to-bl from-[#38bdf8]/20 via-[#3b82f6]/10 to-transparent blur-[75px] pointer-events-none" />

              <div className="relative z-10 space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-sm font-bold text-[#38bdf8]">
                    SCAN #{scan.id.substring(0, 8)}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] border border-white/[0.08] text-white font-bold">
                    {scan.type}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                    isFailed
                      ? 'bg-[#ef4444]/15 border border-[#ef4444]/35 text-[#ef4444]'
                      : isRunning
                      ? 'bg-[#38bdf8]/15 border border-[#38bdf8]/35 text-[#60a5fa]'
                      : 'bg-[#22c55e]/15 border border-[#22c55e]/35 text-[#22c55e]'
                  }`}>
                    {scan.status}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  12-Stage Security Pipeline Execution
                </h1>

                <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-[#757780]">
                  <div className="flex items-center gap-1 text-[#38bdf8]">
                    <GitCommit className="w-3.5 h-3.5" />
                    <span>{scan.commit_sha ? truncateHash(scan.commit_sha) : 'main'}</span>
                  </div>
                  <span>•</span>
                  <span>Duration: {isRunning ? 'Running live...' : formatDuration(scan.duration_ms)}</span>
                  <span>•</span>
                  <span>Triggered {formatDate(scan.created_at)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="relative z-10 flex items-center gap-3">
                {isRunning && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleCancel}
                    loading={cancelling}
                    className="gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Scan</span>
                  </Button>
                )}
                <Link href="/findings">
                  <Button variant="secondary" size="sm">
                    View All Findings
                  </Button>
                </Link>
              </div>
            </div>

            {/* 12-Stage Pipeline Visual Grid (High Glassmorphism with Bottom-Left Glow) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8)] space-y-4 relative overflow-hidden">
              {/* Ambient Glow in Bottom-Left Corner */}
              <div className="absolute -bottom-16 -left-16 w-[340px] h-[340px] bg-gradient-to-tr from-[#8b5cf6]/20 via-[#6366f1]/10 to-transparent blur-[75px] pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#38bdf8]" />
                    <span>Pipeline Execution Stages</span>
                  </h3>
                  {isRunning && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#38bdf8] animate-pulse">
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Executing stages...</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
                  {defaultStages.map((stg, i) => {
                    const isDone = !isRunning || i < 6;
                    const isCurrent = isRunning && i === 6;

                    return (
                      <div
                        key={stg.name}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isCurrent
                            ? 'bg-[#38bdf8]/15 border-[#38bdf8]/50 shadow-[0_0_16px_rgba(56,189,248,0.25)]'
                            : isDone
                            ? 'bg-white/[0.03] border-white/[0.08]'
                            : 'bg-white/[0.01] border-white/[0.03] opacity-40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-semibold text-white">
                            {stg.label}
                          </span>
                          {isCurrent ? (
                            <RotateCw className="w-3.5 h-3.5 text-[#38bdf8] animate-spin" />
                          ) : isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-[#757780]" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Findings Discovered During This Scan (Bottom-Right Glow) */}
            <div className="rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8)] overflow-hidden space-y-0 relative">
              <div className="absolute -bottom-16 -right-16 w-[340px] h-[340px] bg-gradient-to-tl from-[#10b981]/20 via-[#06b6d4]/10 to-transparent blur-[75px] pointer-events-none" />

              <div className="relative z-10">
                <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
                  <span className="text-sm font-bold text-white tracking-tight">
                    Findings Discovered in This Execution ({findings.length})
                  </span>
                  <span className="font-mono text-xs text-[#757780]">
                    {scan.total_findings > 0 ? `${scan.total_findings} Total Issues` : 'Clean Baseline'}
                  </span>
                </div>

                {findings.length === 0 ? (
                  <div className="py-12 text-center text-xs font-mono text-[#757780]">
                    {isRunning ? 'Analyzing code files...' : 'No vulnerabilities detected in this scan execution.'}
                  </div>
                ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-[10px] font-mono uppercase tracking-wider text-[#757780] bg-white/[0.02]">
                      <th className="px-6 py-3 font-semibold">Title</th>
                      <th className="px-6 py-3 font-semibold">Severity</th>
                      <th className="px-6 py-3 font-semibold">File Path</th>
                      <th className="px-6 py-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {findings.map((f) => (
                      <tr key={f.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-3.5 font-bold text-white">
                          <Link href={`/findings/${f.id}`} className="hover:text-[#3b82f6] transition-colors">
                            {f.title}
                          </Link>
                        </td>
                        <td className="px-6 py-3.5">
                          <SeverityBadge severity={f.severity} size="sm" />
                        </td>
                        <td className="px-6 py-3.5 font-mono text-[#94a3b8] text-[11px]">
                          {f.file_path}:{f.start_line}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <Link href={`/findings/${f.id}`}>
                            <button className="px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-white font-mono text-[11px] transition-colors">
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
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
