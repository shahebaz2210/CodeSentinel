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
import { Finding, Scan, ScanStage } from '@/types/api';
import { formatDate, formatDuration } from '@/lib/utils';

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
      if (scanData.status === 'COMPLETED' || scanData.status === 'PARTIAL_FAILURE') {
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

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Back Link */}
        <Link
          href="/scans"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Scans</span>
        </Link>

        {error && !scan && <ErrorState message={error} onRetry={loadScanData} />}

        {loading && !scan ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        ) : scan ? (
          <>
            {/* Header Banner */}
            <div className="p-6 rounded-lg bg-surface border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <Activity className={`w-5 h-5 ${scan.status === 'RUNNING' ? 'text-accent animate-pulse' : 'text-text-secondary'}`} />
                  <h1 className="text-xl font-bold font-mono text-text-primary">
                    Scan {scan.id.substring(0, 8)}
                  </h1>
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-surface-elevated border border-border">
                    {scan.type}
                  </span>
                  <StatusBadge status={scan.status} />
                  {scan.status === 'RUNNING' && (
                    <span className="flex items-center gap-1.5 text-[11px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/30 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                      Live Pipeline Active
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-text-muted">
                  Triggered by <span className="text-text-secondary">{scan.triggered_by || 'DevSecOps'}</span> • Started {formatDate(scan.started_at || scan.created_at)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {scan.status === 'COMPLETED' && (
                  <>
                    <RiskScore score={scan.risk_score} size="md" />
                    <StatusBadge status={scan.policy_result || 'PASS'} />
                  </>
                )}
                {(scan.status === 'RUNNING' || scan.status === 'QUEUED') && (
                  <Button
                    variant="danger"
                    size="sm"
                    loading={cancelling}
                    onClick={handleCancel}
                  >
                    Cancel Scan
                  </Button>
                )}
              </div>
            </div>

            {/* Live Pipeline Execution Stages (12 Stages) */}
            <div className="p-6 rounded-lg bg-surface border border-border space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold uppercase text-text-primary">
                    Analysis Pipeline Stages
                  </span>
                  {scan.status === 'RUNNING' && (
                    <span className="text-[10px] font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20">
                      Executing in real-time
                    </span>
                  )}
                </div>
                <span className="text-xs font-mono text-text-muted">
                  Duration: {formatDuration(scan.duration_ms)} • Files Analyzed: {scan.files_analyzed || 0}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {defaultStages.map((stageItem) => {
                  const stageRecord = scan.stages?.find((s) => s.stage === stageItem.name);
                  const isCompleted = stageRecord?.status === 'COMPLETED';
                  const isRunning = stageRecord?.status === 'RUNNING';
                  const isFailed = stageRecord?.status === 'FAILED';
                  const isSkipped = stageRecord?.status === 'SKIPPED';
                  const isPending = !stageRecord || stageRecord.status === 'PENDING';

                  return (
                    <div
                      key={stageItem.name}
                      className={`p-3.5 rounded-lg border text-xs font-mono flex items-center justify-between transition-all ${
                        isRunning
                          ? 'bg-accent/15 border-accent text-accent ring-2 ring-accent/50 shadow-glow animate-pulse'
                          : isCompleted
                          ? 'bg-surface-elevated border-border text-text-primary'
                          : isFailed
                          ? 'bg-severity-critical/15 border-severity-critical text-severity-critical'
                          : isSkipped
                          ? 'bg-surface border-border/60 text-text-muted opacity-60'
                          : 'bg-surface/50 border-border/40 text-text-muted opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isCompleted && <CheckCircle2 className="w-4 h-4 text-status-pass shrink-0" />}
                        {isRunning && (
                          <span className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin shrink-0" />
                        )}
                        {isFailed && <XCircle className="w-4 h-4 text-severity-critical shrink-0" />}
                        {isSkipped && <span className="w-3.5 h-3.5 rounded-full border border-dashed border-text-muted shrink-0" />}
                        {isPending && <span className="w-3.5 h-3.5 rounded-full border border-border shrink-0" />}
                        <span className="font-semibold truncate">{stageItem.label}</span>
                      </div>

                      <div className="shrink-0 ml-2">
                        {isRunning && (
                          <span className="text-[10px] font-bold text-accent bg-accent/20 px-1.5 py-0.5 rounded">
                            RUNNING
                          </span>
                        )}
                        {isCompleted && stageRecord?.item_count !== undefined && stageRecord.item_count !== null && (
                          <span className="text-[10px] text-text-muted bg-surface px-1.5 py-0.5 rounded border border-border">
                            {stageRecord.item_count} items
                          </span>
                        )}
                        {isSkipped && (
                          <span className="text-[10px] text-text-muted">
                            SKIPPED
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Discovered Findings Table */}
            {scan.status === 'COMPLETED' && (
              <div className="p-6 rounded-lg bg-surface border border-border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold uppercase text-text-primary">
                    Discovered Findings ({findings.length})
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-severity-critical font-bold">{scan.critical_count} Critical</span>
                    <span className="text-xs font-mono text-text-muted">•</span>
                    <span className="text-xs font-mono text-severity-high font-bold">{scan.high_count} High</span>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Severity</TableHead>
                      <TableHead>Finding Title</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Scanner Rule</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {findings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-xs text-status-pass font-mono">
                          ✓ No policy violations or vulnerabilities detected by Semgrep and Gitleaks.
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
                          <TableCell className="font-mono text-xs text-text-secondary">
                            {f.scanner_rule || f.scanner}
                          </TableCell>
                          <TableCell>
                            <RiskScore score={f.risk_score} size="sm" showLabel={false} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={f.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href={`/findings/${f.id}`}>
                              <Button variant="outline" size="sm" className="text-xs">
                                Investigate
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
