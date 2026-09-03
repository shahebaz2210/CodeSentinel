'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  AlertOctagon,
  FileCode,
  BrainCircuit,
  ShieldAlert,
  Copy,
  Check,
  ExternalLink,
  CheckCircle2,
  Clock,
  Flame,
  Info,
  Sparkles,
  Zap,
  Tag,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { SeverityBadge } from '@/components/ui/severity-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { RiskScore } from '@/components/ui/risk-score';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { api } from '@/lib/api';
import { FindingDetail, FindingStatus } from '@/types/api';
import { formatDate } from '@/lib/utils';

export default function FindingDetailPage() {
  const params = useParams();
  const findingId = params.id as string;

  const [finding, setFinding] = useState<FindingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFinding = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.findings.get(findingId);
      setFinding(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load finding details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (findingId) loadFinding();
  }, [findingId]);

  const handleStatusChange = async (newStatus: FindingStatus) => {
    setStatusUpdating(true);
    try {
      await api.findings.updateStatus(findingId, newStatus);
      await loadFinding();
    } catch (e: any) {
      alert(`Status update failed: ${e.message}`);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleCopyCode = () => {
    if (finding?.evidence) {
      navigator.clipboard.writeText(finding.evidence);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 font-sans text-[#f1f5f9]">
        {/* Back Link */}
        <Link
          href="/findings"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#757780] hover:text-[#3b82f6] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Findings</span>
        </Link>

        {error && <ErrorState message={error} onRetry={loadFinding} />}

        {loading || !finding ? (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full bg-[#181d24]/50 rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <Skeleton className="lg:col-span-8 h-96 w-full bg-[#181d24]/50 rounded-xl" />
              <Skeleton className="lg:col-span-4 h-96 w-full bg-[#181d24]/50 rounded-xl" />
            </div>
          </div>
        ) : (
          <>
            {/* Header Card (High Glassmorphism with Top-Right Glow) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8)] flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden hover:border-white/[0.22] transition-all">
              {/* Ambient Glow in Top-Right Corner */}
              <div className="absolute -top-16 -right-16 w-[360px] h-[360px] bg-gradient-to-bl from-[#ef4444]/20 via-[#f97316]/10 to-transparent blur-[75px] pointer-events-none" />

              <div className="relative z-10 space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <SeverityBadge severity={finding.severity} size="md" />
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#3b82f6]/15 border border-[#3b82f6]/30 text-[#60a5fa]">
                    {finding.cwe_id || 'CWE-Generic'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-white/[0.04] border border-white/[0.08] text-[#757780]">
                    {finding.scanner}
                  </span>
                </div>

                <h1 className="text-2xl font-extrabold text-white tracking-tight leading-snug">
                  {finding.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-[#757780]">
                  <div className="flex items-center gap-1.5 text-[#94a3b8]">
                    <FileCode className="w-3.5 h-3.5 text-[#757780]" />
                    <span>{finding.file_path}:{finding.start_line}</span>
                  </div>
                  <span>•</span>
                  <span>Detected {formatDate(finding.created_at)}</span>
                </div>
              </div>

              {/* Triage Status Control */}
              <div className="relative z-10 flex items-center gap-3 bg-white/[0.03] p-3 rounded-2xl border border-white/[0.08]">
                <span className="text-xs font-mono text-[#757780] uppercase">Status:</span>
                <select
                  value={finding.status}
                  disabled={statusUpdating}
                  onChange={(e) => handleStatusChange(e.target.value as FindingStatus)}
                  aria-label="Update Finding Triage Status"
                  className="h-10 px-3 rounded-xl bg-black/60 border border-white/[0.12] text-xs font-mono font-bold text-white outline-none focus:border-[#3b82f6] cursor-pointer"
                >
                  <option value="OPEN">OPEN (Active Blocker)</option>
                  <option value="IN_REVIEW">IN_REVIEW</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="FALSE_POSITIVE">FALSE_POSITIVE</option>
                  <option value="ACCEPTED_RISK">ACCEPTED_RISK</option>
                </select>
              </div>
            </div>

            {/* 2-Column Detail Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Code Snippet & Vulnerability Description (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Code Evidence Snippet with Top-Left Glow */}
                <div className="rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8)] overflow-hidden relative">
                  <div className="absolute -top-16 -left-16 w-[340px] h-[340px] bg-gradient-to-br from-[#38bdf8]/20 via-[#3b82f6]/10 to-transparent blur-[75px] pointer-events-none" />

                  <div className="relative z-10">
                    <div className="px-6 py-4 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono text-xs text-[#94a3b8]">
                        <FileCode className="w-4 h-4 text-[#38bdf8]" />
                        <span>{finding.file_path} (Line {finding.start_line})</span>
                      </div>
                      {finding.evidence && (
                        <button
                          onClick={handleCopyCode}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#757780] hover:text-white font-mono text-[11px] transition-colors"
                        >
                          {copied ? <Check className="w-3 h-3 text-[#22c55e]" /> : <Copy className="w-3 h-3 text-[#757780]" />}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>

                    <div className="p-6 font-mono text-xs overflow-x-auto bg-black/50">
                      {finding.evidence ? (
                        <pre className="text-[#f1f5f9] leading-relaxed whitespace-pre-wrap">
                          {finding.evidence}
                        </pre>
                      ) : (
                        <span className="text-[#757780] italic">No code snippet excerpt provided by scanner.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description & Impact with Bottom-Left Glow */}
                <div className="p-6 sm:p-8 rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8)] space-y-4 relative overflow-hidden">
                  <div className="absolute -bottom-16 -left-16 w-[340px] h-[340px] bg-gradient-to-tr from-[#f59e0b]/20 via-[#d97706]/10 to-transparent blur-[75px] pointer-events-none" />

                  <div className="relative z-10 space-y-4">
                    <h3 className="text-base font-bold text-white tracking-tight">Vulnerability Analysis</h3>
                    <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
                      {finding.description || 'No extended vulnerability description available.'}
                    </p>

                    {finding.ai_assessment?.impact && (
                      <div className="p-4 rounded-2xl bg-[#38bdf8]/10 border border-[#38bdf8]/25 flex items-start gap-3 font-mono text-xs text-[#60a5fa]">
                        <Zap className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block uppercase text-[10px] text-[#93c5fd]">Reachability & Impact</span>
                          <span className="text-white">{finding.ai_assessment.impact}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: AI Context Assessment & CWE Guidance (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                {/* AI Reasoning Card with Top-Right Purple Glow */}
                <div className="p-6 sm:p-8 rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8)] space-y-4 relative overflow-hidden">
                  <div className="absolute -top-16 -right-16 w-[340px] h-[340px] bg-gradient-to-bl from-[#8b5cf6]/25 via-[#6366f1]/15 to-transparent blur-[75px] pointer-events-none" />

                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-2.5 text-white font-bold text-sm">
                      <BrainCircuit className="w-4 h-4 text-[#a78bfa]" />
                      <span>Gemini AI Security Synthesis</span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
                      Synthesizes static AST findings with surrounding call graph, public exposure, and authentication barriers to determine true exploitability.
                    </p>

                    <div className="pt-3 border-t border-white/[0.08] space-y-2.5 font-mono text-xs">
                      <div className="flex items-center justify-between text-[#757780]">
                        <span>Confidence Score:</span>
                        <span className="font-bold text-[#22c55e]">95% High Confidence</span>
                      </div>
                      <div className="flex items-center justify-between text-[#757780]">
                        <span>Policy Impact:</span>
                        <span className="font-bold text-[#ef4444]">Blocks PR Merge</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CWE / OWASP Knowledge Reference with Bottom-Right Emerald Glow */}
                <div className="p-6 sm:p-8 rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8)] space-y-3 relative overflow-hidden">
                  <div className="absolute -bottom-16 -right-16 w-[340px] h-[340px] bg-gradient-to-tl from-[#10b981]/20 via-[#06b6d4]/10 to-transparent blur-[75px] pointer-events-none" />

                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <ShieldAlert className="w-4 h-4 text-[#34d399]" />
                      <span>Remediation Guidance</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
                      Avoid string interpolation or unparameterized queries. Utilize prepared statements with bound parameters or an approved ORM query builder.
                    </p>
                    <div className="pt-2">
                      <Link href="/intelligence">
                        <button className="text-xs font-mono text-[#38bdf8] hover:underline inline-flex items-center gap-1">
                          <span>Explore OWASP Corpus</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
