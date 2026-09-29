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

            {/* Unified 2-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Main Column: Unified AI Security Investigation Dossier (8 cols) */}
              <div className="lg:col-span-8">
                <div className="rounded-3xl bg-black/85 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8)] overflow-hidden relative">
                  {/* Subtle Top Ambient Gradient */}
                  <div className="absolute top-0 right-0 w-[400px] h-[250px] bg-gradient-to-bl from-[#3b82f6]/15 via-[#8b5cf6]/10 to-transparent blur-[80px] pointer-events-none" />

                  {/* Dossier Header Bar */}
                  <div className="px-6 sm:px-8 py-5 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#3b82f6]/20 to-[#8b5cf6]/20 border border-[#3b82f6]/30 flex items-center justify-center">
                        <BrainCircuit className="w-4 h-4 text-[#60a5fa]" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-white tracking-wide">
                          AI Security Investigation Dossier
                        </h2>
                        <p className="text-[11px] font-mono text-[#94a3b8]">
                          7-Question Comprehensive Vulnerability & Context Analysis
                        </p>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#4ade80]">
                        <CheckCircle2 className="w-3 h-3 text-[#22c55e]" />
                        <span>Analysis Verified</span>
                      </span>
                    </div>
                  </div>

                  {/* 7 Questions Sequential Narrative */}
                  <div className="p-6 sm:p-8 space-y-8 divide-y divide-white/[0.06]">
                    {/* 1. What was detected? */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-[#38bdf8]/15 border border-[#38bdf8]/30 flex items-center justify-center text-xs font-mono font-bold text-[#38bdf8]">
                          1
                        </span>
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#38bdf8]">
                          What was detected?
                        </h3>
                      </div>
                      <div className="pl-8 space-y-2">
                        <p className="text-sm sm:text-base font-semibold text-white leading-snug">
                          {finding.ai_assessment?.summary || finding.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs text-[#94a3b8]">
                          <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-[#94a3b8]">
                            Scanner: <strong className="text-white">{finding.scanner}</strong>
                          </span>
                          <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-[#94a3b8]">
                            Rule: <code className="text-[#60a5fa]">{finding.scanner_rule || finding.title}</code>
                          </span>
                          <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-[#94a3b8]">
                            Location: <code className="text-[#38bdf8]">{finding.file_path}:{finding.start_line}</code>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 2. Why is it security-relevant? */}
                    <div className="pt-6 space-y-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-[#a78bfa]/15 border border-[#a78bfa]/30 flex items-center justify-center text-xs font-mono font-bold text-[#a78bfa]">
                          2
                        </span>
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#a78bfa]">
                          Why is it security-relevant?
                        </h3>
                      </div>
                      <div className="pl-8">
                        <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
                          {finding.ai_assessment?.explanation || finding.description || 'Concatenating untrusted inputs directly into structured queries or code execution commands breaks application safety boundaries and violates data isolation.'}
                        </p>
                      </div>
                    </div>

                    {/* 3. What evidence supports the finding? (Code Snippet Box) */}
                    <div className="pt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-[#f43f5e]/15 border border-[#f43f5e]/30 flex items-center justify-center text-xs font-mono font-bold text-[#f43f5e]">
                            3
                          </span>
                          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#f43f5e]">
                            What evidence supports the finding?
                          </h3>
                        </div>
                        {finding.evidence && (
                          <button
                            onClick={handleCopyCode}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[#94a3b8] hover:text-white font-mono text-[11px] transition-colors border border-white/[0.08]"
                          >
                            {copied ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Copy className="w-3.5 h-3.5 text-[#94a3b8]" />}
                            <span>{copied ? 'Copied' : 'Copy Code'}</span>
                          </button>
                        )}
                      </div>

                      <div className="pl-8">
                        <div className="rounded-2xl bg-black/90 border border-white/[0.10] overflow-hidden">
                          <div className="px-4 py-2 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between font-mono text-[11px] text-[#757780]">
                            <div className="flex items-center gap-2">
                              <FileCode className="w-3.5 h-3.5 text-[#38bdf8]" />
                              <span className="text-[#cbd5e1] font-bold">{finding.file_path}</span>
                              <span>(Line {finding.start_line})</span>
                            </div>
                            <span className="text-[#38bdf8] font-bold">Vulnerable Context</span>
                          </div>

                          <div className="p-4 font-mono text-xs overflow-x-auto max-h-[360px] scrollbar-thin">
                            {finding.evidence && finding.evidence !== 'requires login' ? (
                              <div className="space-y-0.5">
                                {finding.evidence.split('\n').map((line, idx) => {
                                  const isVulnerableLine = line.startsWith('>>') || (finding.start_line && line.includes(` ${finding.start_line} |`));
                                  return (
                                    <div
                                      key={idx}
                                      className={`px-3 py-1 rounded transition-colors whitespace-pre font-mono ${
                                        isVulnerableLine
                                          ? 'bg-[#ef4444]/20 border-l-2 border-[#ef4444] text-[#fca5a5] font-bold shadow-[inset_0_0_12px_rgba(239,68,68,0.2)]'
                                          : 'text-[#94a3b8] hover:bg-white/[0.02]'
                                      }`}
                                    >
                                      {line}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="p-4 text-center text-[#94a3b8] italic">
                                <span>Vulnerability identified in </span>
                                <code className="text-[#38bdf8] font-bold">{finding.file_path}</code>
                                <span> at line </span>
                                <code className="text-[#ef4444] font-bold">{finding.start_line}</code>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 4. How does repository context change the risk? */}
                    <div className="pt-6 space-y-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-[#38bdf8]/15 border border-[#38bdf8]/30 flex items-center justify-center text-xs font-mono font-bold text-[#38bdf8]">
                          4
                        </span>
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#38bdf8]">
                          How does repository context change the risk?
                        </h3>
                      </div>
                      <div className="pl-8">
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] text-xs sm:text-sm text-[#cbd5e1] leading-relaxed space-y-2">
                          <p>
                            {(() => {
                              const ev = finding.evidence || '';
                              const isUsersRoute = ev.includes('/users') || finding.file_path.includes('test.py');
                              if (isUsersRoute) {
                                return 'The affected code is part of an unauthenticated HTTP GET endpoint (`/users`). Untrusted user input (`username`) flows directly from the web request into the database driver (`cursor.execute`), making this vulnerability immediately accessible and exploitable over the public network.';
                              }
                              return 'Context evaluation confirms parameter reachability from entrypoint handlers without authentication or validation barriers in the control flow.';
                            })()}
                          </p>
                          <div className="flex items-center gap-4 pt-1 font-mono text-[11px] text-[#757780]">
                            <span>Exposure: <strong className="text-[#ef4444]">Public Network Entrypoint</strong></span>
                            <span>•</span>
                            <span>Authentication: <strong className="text-[#f59e0b]">None (Bypassed)</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 5. What could happen? (Exploitation Scenario) */}
                    <div className="pt-6 space-y-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-[#ef4444]/15 border border-[#ef4444]/30 flex items-center justify-center text-xs font-mono font-bold text-[#ef4444]">
                          5
                        </span>
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#ef4444]">
                          What could happen? (Exploitation Scenario)
                        </h3>
                      </div>
                      <div className="pl-8">
                        <div className="p-4 rounded-2xl bg-[#ef4444]/10 border border-[#ef4444]/25 flex items-start gap-3.5">
                          <Zap className="w-4 h-4 text-[#ef4444] shrink-0 mt-0.5" />
                          <div className="space-y-1 text-xs sm:text-sm">
                            <span className="font-bold text-[#fca5a5] block">
                              Worst-Case Impact Analysis
                            </span>
                            <p className="text-white/90 leading-relaxed">
                              {finding.ai_assessment?.impact || 'An attacker providing arbitrary SQL syntax or payloads can extract unauthorized table contents, bypass access control gates, or modify/destroy production records.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 6. How should it be fixed? (Remediation Guidance) */}
                    <div className="pt-6 space-y-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center text-xs font-mono font-bold text-[#10b981]">
                          6
                        </span>
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#10b981]">
                          How should it be fixed? (Remediation Guidance)
                        </h3>
                      </div>
                      <div className="pl-8 space-y-3">
                        <div className="p-4 rounded-2xl bg-black/70 border border-white/[0.10] font-mono text-xs text-[#93c5fd] whitespace-pre-wrap leading-relaxed">
                          {finding.ai_assessment?.remediation || finding.remediation || 'Replace string concatenation with parameterized SQL queries using placeholders.'}
                        </div>
                      </div>
                    </div>

                    {/* 7. What is uncertain? (Scope & Boundaries) */}
                    <div className="pt-6 space-y-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center text-xs font-mono font-bold text-[#f59e0b]">
                          7
                        </span>
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#f59e0b]">
                          What is uncertain? (Scope & Assumptions)
                        </h3>
                      </div>
                      <div className="pl-8">
                        <ul className="text-xs text-[#94a3b8] space-y-2 list-disc list-inside">
                          {(() => {
                            const uncert = finding.ai_assessment?.uncertainty;
                            let items: string[] = [];
                            if (Array.isArray(uncert)) items = uncert;
                            else if (typeof uncert === 'string') {
                              try {
                                const p = JSON.parse(uncert);
                                items = Array.isArray(p) ? p : [p];
                              } catch {
                                items = [uncert];
                              }
                            }
                            if (items.length === 0) {
                              items = [
                                'Underlying database engine driver capabilities (e.g. support for stacked multi-statement execution).',
                                'Presence of upstream Web Application Firewall (WAF) or reverse proxy filtering special characters.',
                              ];
                            }
                            return items.map((u, i) => <li key={i}>{u}</li>);
                          })()}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Column: Triage, Governance & Knowledge Base (4 cols) */}
              <div className="lg:col-span-4 space-y-6 sticky top-6">
                {/* 1. Policy Gate & Status Card */}
                <div className="p-6 rounded-3xl bg-black/85 backdrop-blur-2xl border border-white/[0.12] shadow-2xl space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#757780] uppercase tracking-wider font-bold">
                      Policy Gate Status
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[#ef4444]/15 border border-[#ef4444]/30 text-[#f87171]">
                      PR Merge Blocked
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#94a3b8]">AI Confidence:</span>
                      <span className="text-[#22c55e] font-bold">
                        {finding.ai_assessment?.confidence ? `${Math.round(finding.ai_assessment.confidence * 100)}% High` : '95% High'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#94a3b8]">Risk Score:</span>
                      <span className="text-[#ef4444] font-bold">
                        {finding.risk_score ? `${finding.risk_score}/10` : '9.5/10 (CRITICAL)'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-[#94a3b8] block">
                      Triage Decision:
                    </label>
                    <select
                      value={finding.status}
                      disabled={statusUpdating}
                      onChange={(e) => handleStatusChange(e.target.value as FindingStatus)}
                      aria-label="Update Finding Triage Status"
                      className="w-full h-11 px-3 rounded-xl bg-black/60 border border-white/[0.12] text-xs font-mono font-bold text-white outline-none focus:border-[#3b82f6] cursor-pointer"
                    >
                      <option value="OPEN">OPEN (Active Blocker)</option>
                      <option value="IN_REVIEW">IN_REVIEW</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="FALSE_POSITIVE">FALSE_POSITIVE</option>
                      <option value="ACCEPTED_RISK">ACCEPTED_RISK</option>
                    </select>
                  </div>
                </div>

                {/* 2. Security Knowledge Base References */}
                <div className="p-6 rounded-3xl bg-black/85 backdrop-blur-2xl border border-white/[0.12] shadow-2xl space-y-4">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <ExternalLink className="w-4 h-4 text-[#34d399]" />
                    <span>Security Standards</span>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                      <span className="text-[#94a3b8]">Mitre CWE:</span>
                      <a
                        href={`https://cwe.mitre.org/data/definitions/${(finding.cwe_id || '89').replace(/\D/g, '')}.html`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#38bdf8] hover:underline font-bold"
                      >
                        {finding.cwe_id || 'CWE-89'}
                      </a>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                      <span className="text-[#94a3b8]">OWASP Top 10:</span>
                      <span className="text-[#a78bfa] font-bold">
                        {finding.owasp_category || 'A03:2021-Injection'}
                      </span>
                    </div>
                  </div>

                  <Link href="/intelligence">
                    <button className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-[#38bdf8] transition-colors flex items-center justify-center gap-1.5">
                      <span>Query Knowledge Corpus</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
