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
      <div className="space-y-6">
        {/* Navigation / Back link */}
        <Link
          href="/findings"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Findings</span>
        </Link>

        {error && <ErrorState message={error} onRetry={loadFinding} />}

        {loading || !finding ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        ) : (
          <>
            {/* Top Investigation Header Banner */}
            <div className="p-6 rounded-lg bg-surface border border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <SeverityBadge severity={finding.severity} size="md" />
                  <StatusBadge status={finding.status} />
                  <span className="text-xs font-mono text-text-muted">
                    ID: {finding.id.substring(0, 8)}
                  </span>
                </div>
                <h1 className="text-xl font-bold tracking-tight text-text-primary">
                  {finding.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-text-muted">
                  <span className="text-text-secondary">
                    {finding.repository_name || 'repository'} / {finding.file_path}:{finding.start_line}
                  </span>
                  <span>•</span>
                  <span>Scanner: <span className="text-text-primary">{finding.scanner}</span> ({finding.scanner_rule})</span>
                  <span>•</span>
                  <span>CWE: <span className="text-text-primary">{finding.cwe_id || 'N/A'}</span></span>
                </div>
              </div>

              {/* Status Action & Risk Score */}
              <div className="flex items-center gap-4">
                <RiskScore score={finding.risk_score} size="md" />
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-mono text-text-muted">Triage Status</label>
                  <select
                    value={finding.status}
                    disabled={statusUpdating}
                    onChange={(e) => handleStatusChange(e.target.value as FindingStatus)}
                    className="h-9 px-3 text-xs font-mono bg-surface-elevated border border-border rounded-md text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_REVIEW">IN_REVIEW</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="ACCEPTED_RISK">ACCEPTED_RISK</option>
                    <option value="FALSE_POSITIVE">FALSE_POSITIVE</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Split-Pane Investigation View (Source Code | Security Intelligence & AI Analysis) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Pane: Source Code Viewer */}
              <div className="rounded-lg bg-surface border border-border flex flex-col h-full overflow-hidden">
                <div className="px-4 py-3 bg-surface-elevated border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-text-secondary truncate">
                    <FileCode className="w-4 h-4 text-accent" />
                    <span className="truncate">{finding.file_path}</span>
                    <span className="text-text-muted">:{finding.start_line}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyCode}
                    className="h-7 px-2 text-xs text-text-muted gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </Button>
                </div>

                {/* Code Window */}
                <div className="p-4 bg-[#07090c] font-mono text-xs overflow-x-auto flex-1 leading-relaxed text-text-secondary space-y-1">
                  <div className="text-[11px] text-text-muted uppercase tracking-wider mb-2 font-semibold">
                    Code Evidence & Context
                  </div>
                  <pre className="text-text-primary whitespace-pre-wrap">
                    {finding.evidence || 'Source code preview unavailable.'}
                  </pre>
                </div>

                {/* Location metadata footer */}
                <div className="px-4 py-2 bg-surface-elevated/40 border-t border-border text-xs font-mono text-text-muted flex items-center justify-between">
                  <span>Line Range: {finding.start_line} - {finding.end_line || finding.start_line}</span>
                  <span>Confidence: <span className="text-text-primary">{finding.confidence}</span></span>
                </div>
              </div>

              {/* Right Pane: Context-Aware Security Intelligence & AI Assessment */}
              <div className="rounded-lg bg-surface border border-border p-6 space-y-5 flex flex-col h-full">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <BrainCircuit className="w-4 h-4 text-accent" />
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
                    Context-Aware Security Analysis
                  </span>
                </div>

                {/* What was detected */}
                <div className="space-y-1">
                  <span className="text-xs font-mono font-semibold uppercase text-accent">
                    1. What Was Detected
                  </span>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {finding.ai_assessment?.summary || finding.description || 'Static analysis detected a potential security flaw violating secure coding policies.'}
                  </p>
                </div>

                {/* Why it matters */}
                <div className="space-y-1">
                  <span className="text-xs font-mono font-semibold uppercase text-accent">
                    2. Why It Matters
                  </span>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {finding.ai_assessment?.explanation || 'Security vulnerabilities in this category can permit untrusted actors to manipulate logic, bypass authentication, or access unauthorized data.'}
                  </p>
                </div>

                {/* Potential Impact */}
                <div className="space-y-1">
                  <span className="text-xs font-mono font-semibold uppercase text-severity-critical">
                    3. Worst-Case Impact
                  </span>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {finding.ai_assessment?.impact || 'Potential unauthorized data access, privilege escalation, or sensitive credential leakage.'}
                  </p>
                </div>

                {/* Remediation Guide */}
                <div className="space-y-2 p-3.5 rounded-lg bg-surface-elevated border border-border">
                  <span className="text-xs font-mono font-semibold uppercase text-status-pass flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 4. Actionable Remediation
                  </span>
                  <pre className="text-xs font-mono text-text-primary whitespace-pre-wrap bg-[#07090c] p-3 rounded border border-border">
                    {finding.ai_assessment?.remediation || finding.remediation || 'Apply input sanitization and use parameterized APIs.'}
                  </pre>
                </div>

                {/* Security References (OWASP / CWE) */}
                <div className="space-y-1.5 pt-2 border-t border-border mt-auto">
                  <span className="text-[11px] font-mono text-text-muted uppercase">
                    Authoritative Security References
                  </span>
                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                    {finding.cwe_id && (
                      <a
                        href={`https://cwe.mitre.org/data/definitions/${finding.cwe_id.replace('CWE-', '')}.html`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-elevated border border-border text-accent hover:underline"
                      >
                        <span>{finding.cwe_id}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {finding.owasp_category && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded bg-surface-elevated border border-border text-text-secondary">
                        {finding.owasp_category}
                      </span>
                    )}
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
