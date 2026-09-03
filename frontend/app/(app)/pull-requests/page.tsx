'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  GitPullRequest,
  ShieldCheck,
  ShieldAlert,
  AlertOctagon,
  CheckCircle2,
  Clock,
  GitCommit,
  GitBranch,
  RefreshCw,
  Zap,
  Globe,
  Radio,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { ScanListItem } from '@/types/api';
import { formatDate } from '@/lib/utils';

export default function PullRequestsPage() {
  const [prScans, setPrScans] = useState<ScanListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [settingUpWebhooks, setSettingUpWebhooks] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [webhookStatus, setWebhookStatus] = useState<{
    github_connected: boolean;
    public_url: string | null;
    is_public_ready: boolean;
    connected_repos_count: number;
  } | null>(null);

  const loadPrScans = async () => {
    try {
      const res: any = await api.scans.list({ type: 'PR' });
      const items = Array.isArray(res) ? res : res?.items || [];
      setPrScans(items);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  const loadWebhookStatus = async () => {
    try {
      const status = await api.pullRequests.getWebhookStatus();
      setWebhookStatus(status);
    } catch {
      // silently handle
    }
  };

  useEffect(() => {
    loadPrScans();
    loadWebhookStatus();
    // Poll for scan updates every 10 seconds
    const interval = setInterval(loadPrScans, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSyncPRs = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await api.pullRequests.sync();
      if (res.triggered_scans > 0) {
        setSyncMessage(`Found ${res.detected_prs} open PRs across connected repos. Triggered ${res.triggered_scans} new scan(s)!`);
      } else if (res.detected_prs > 0) {
        setSyncMessage(`All ${res.detected_prs} open pull requests are up-to-date with latest commits scanned.`);
      } else {
        setSyncMessage(`Checked ${res.repos_checked} connected repositories. No open pull requests found.`);
      }
      await loadPrScans();
      await loadWebhookStatus();
    } catch (e: any) {
      setSyncMessage(`Sync failed: ${e.message || 'Unknown error'}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleSetupWebhooks = async () => {
    setSettingUpWebhooks(true);
    setSyncMessage(null);
    try {
      const res = await api.pullRequests.setupWebhooks();
      if (res.status === 'success') {
        setSyncMessage(`Webhooks configured successfully on ${res.configured} connected repositories!`);
      } else {
        setSyncMessage(res.message || 'Webhooks setup completed with warnings.');
      }
      await loadWebhookStatus();
    } catch (e: any) {
      setSyncMessage(`Webhook setup failed: ${e.message || 'Unknown error'}`);
    } finally {
      setSettingUpWebhooks(false);
    }
  };

  const formatPRTitle = (pr: ScanListItem) => {
    if (pr.triggered_by && pr.triggered_by.includes(':')) {
      const parts = pr.triggered_by.split(':');
      if (parts.length >= 2) {
        return parts.slice(1).join(':').trim();
      }
    }
    if (pr.branch) {
      return `PR on branch ${pr.branch}`;
    }
    return `PR #${pr.pr_number || 1} Security Evaluation`;
  };

  return (
    <AppShell>
      <div className="space-y-6 font-sans text-[#f1f5f9]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/15 border border-[#3b82f6]/30 flex items-center justify-center text-[#3b82f6] shadow-[0_0_16px_rgba(59,130,246,0.2)]">
                <GitPullRequest className="w-4 h-4" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Pull Request Security Gates</h1>
            </div>
            <p className="text-xs text-[#94a3b8] mt-1">
              Automated CI/CD security gate evaluations enforcing merge policies and blocking vulnerable pull requests.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSetupWebhooks}
              loading={settingUpWebhooks}
              className="gap-2 text-xs border-white/[0.12] hover:bg-white/[0.05]"
            >
              <Zap className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>Auto-Setup Webhooks</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleSyncPRs}
              loading={syncing}
              className="gap-2 text-xs shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>Sync & Scan PRs</span>
            </Button>
          </div>
        </div>

        {/* Sync / Notification Banner */}
        {syncMessage && (
          <div className="p-3.5 rounded-2xl bg-[#3b82f6]/10 border border-[#3b82f6]/30 text-xs text-[#93c5fd] flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#38bdf8] shrink-0" />
              <span>{syncMessage}</span>
            </div>
            <button
              onClick={() => setSyncMessage(null)}
              className="text-[#93c5fd]/70 hover:text-white text-xs px-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Webhook & Auto-Poller Status Card */}
        <div className="p-4 rounded-2xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] flex flex-wrap items-center justify-between gap-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_12px_32px_rgba(0,0,0,0.6)] relative overflow-hidden">
          <div className="flex items-center gap-3">
            {webhookStatus?.is_public_ready ? (
              <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-ping" />
            ) : (
              <div className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] animate-pulse" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">
                  {webhookStatus?.is_public_ready ? 'GitHub Webhooks Active' : 'Background Auto-Scanner Active'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.08] text-[#94a3b8]">
                  {webhookStatus?.connected_repos_count || 0} Repos Connected
                </span>
              </div>
              <p className="text-[11px] text-[#94a3b8] mt-0.5">
                {webhookStatus?.is_public_ready
                  ? `Live URL: ${webhookStatus.public_url} — Pull requests trigger scans instantaneously.`
                  : 'Automatic poller checks connected user repositories every 60s for newly opened pull requests.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#64748b]">
              Auto-Scan: <span className="text-[#10b981] font-semibold">Enabled</span>
            </span>
          </div>
        </div>

        {/* PR Scan Cards */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-44 w-full bg-[#181d24]/50 rounded-3xl" />
            <Skeleton className="h-44 w-full bg-[#181d24]/50 rounded-3xl" />
          </div>
        ) : prScans.length === 0 ? (
          <div className="p-12 rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] text-center space-y-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_20px_50px_rgba(0,0,0,0.8)]">
            <GitPullRequest className="w-12 h-12 text-[#757780] mx-auto opacity-50" />
            <div className="space-y-1">
              <p className="text-base font-semibold text-white">No Pull Request scans recorded yet</p>
              <p className="text-xs text-[#94a3b8] max-w-md mx-auto">
                Open a Pull Request on any connected GitHub repository, or click below to query GitHub for open PRs right now.
              </p>
            </div>
            <div className="pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSyncPRs}
                loading={syncing}
                className="gap-2 text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>Check GitHub for Open PRs</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {prScans.map((pr) => {
              const isRunning = pr.status === 'RUNNING' || pr.status === 'QUEUED';
              const isFail = pr.policy_result === 'FAIL' || pr.status === 'FAILED';
              const title = formatPRTitle(pr);

              return (
                <div
                  key={pr.id}
                  className={`p-6 sm:p-8 rounded-3xl bg-black/75 backdrop-blur-2xl border transition-all relative overflow-hidden ${
                    isRunning
                      ? 'border-[#38bdf8]/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8),0_0_30px_rgba(56,189,248,0.15)]'
                      : isFail
                      ? 'border-[#ef4444]/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8),0_0_30px_rgba(239,68,68,0.15)] hover:border-[#ef4444]/60'
                      : 'border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8)] hover:border-white/[0.22]'
                  }`}
                >
                  {/* Ambient Light Glow */}
                  {isRunning ? (
                    <div className="absolute -top-20 -right-20 w-[380px] h-[380px] bg-gradient-to-bl from-[#38bdf8]/25 via-[#3b82f6]/15 to-transparent blur-[85px] pointer-events-none" />
                  ) : isFail ? (
                    <div className="absolute -top-20 -right-20 w-[380px] h-[380px] bg-gradient-to-bl from-[#ef4444]/25 via-[#f97316]/15 to-transparent blur-[85px] pointer-events-none" />
                  ) : (
                    <div className="absolute -top-20 -left-20 w-[380px] h-[380px] bg-gradient-to-br from-[#10b981]/25 via-[#06b6d4]/15 to-transparent blur-[85px] pointer-events-none" />
                  )}

                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2 max-w-2xl">
                        <div className="flex items-center gap-2.5">
                          <GitPullRequest className="w-4 h-4 text-[#757780]" />
                          <span className="font-mono text-xs font-bold text-white">
                            {pr.repository_name || 'Repository'} #{pr.pr_number || 1}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              isRunning
                                ? 'bg-[#38bdf8]/15 border border-[#38bdf8]/35 text-[#38bdf8] animate-pulse'
                                : isFail
                                ? 'bg-[#ef4444]/15 border border-[#ef4444]/35 text-[#ef4444]'
                                : 'bg-[#22c55e]/15 border border-[#22c55e]/35 text-[#22c55e]'
                            }`}
                          >
                            {isRunning ? 'SCANNING...' : isFail ? 'MERGE BLOCKED' : 'GATE PASSED'}
                          </span>
                        </div>

                        <h2 className="text-base sm:text-lg font-bold text-white">
                          PR #{pr.pr_number || 1}: {title}
                        </h2>

                        <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[#757780]">
                          <div className="inline-flex items-center gap-1 text-[#94a3b8]">
                            <GitBranch className="w-3.5 h-3.5" />
                            <span>{pr.branch || 'main'}</span>
                          </div>
                          <span>•</span>
                          <div className="inline-flex items-center gap-1 text-[#38bdf8]">
                            <GitCommit className="w-3.5 h-3.5" />
                            <span>{pr.commit_sha?.substring(0, 7) || 'latest'}</span>
                          </div>
                          <span>•</span>
                          <span>{formatDate(pr.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <Link href={`/scans/${pr.id}`}>
                          <Button variant="secondary" size="sm" className="text-xs">
                            View Pipeline
                          </Button>
                        </Link>
                        <Link href={`/findings?repoId=${pr.repository_id}`}>
                          <Button
                            variant={isRunning ? 'secondary' : isFail ? 'danger' : 'primary'}
                            size="sm"
                            className="text-xs font-semibold"
                          >
                            Inspect Findings
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Summary & Gating Decision Breakdown */}
                    <div className="mt-5 pt-4 border-t border-white/[0.06] text-xs font-mono">
                      <div className="text-[11px] text-[#757780] uppercase mb-2 font-semibold tracking-wider">
                        Security Gate Decision & Policy Check:
                      </div>
                      {isRunning ? (
                        <div className="p-3.5 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/25 flex items-center gap-2 text-[#38bdf8]">
                          <Clock className="w-4 h-4 shrink-0 animate-spin" />
                          <span>Code security scanners analyzing AST, secrets, and SAST rules...</span>
                        </div>
                      ) : isFail ? (
                        <div className="p-3.5 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/25 flex items-center justify-between gap-2 text-[#ef4444]">
                          <div className="flex items-center gap-2">
                            <AlertOctagon className="w-4 h-4 shrink-0" />
                            <span>
                              Blocked by Security Policy: {pr.critical_count} critical, {pr.high_count} high finding(s) detected.
                            </span>
                          </div>
                          <span className="font-bold text-xs">Risk: {pr.risk_score ? pr.risk_score.toFixed(1) : '8.5'}/10</span>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/25 flex items-center justify-between gap-2 text-[#22c55e]">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>All security policy checks passed. No merge-blocking vulnerabilities detected.</span>
                          </div>
                          <span className="font-bold text-xs text-[#22c55e]">Risk: {pr.risk_score ? pr.risk_score.toFixed(1) : '0.0'}/10</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
