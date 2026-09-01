'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, Play, ArrowUpRight } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { RiskScore } from '@/components/ui/risk-score';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/lib/api';
import { Scan } from '@/types/api';
import { formatDate, formatDuration, truncateHash } from '@/lib/utils';

export default function ScansHistoryPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load dashboard summary recent scans as broad history
    api.dashboard.getSummary().then((data) => {
      setScans(data.recent_scans || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-text-primary">Scan History & Telemetry</h1>
            <p className="text-xs text-text-muted mt-0.5">
              Auditable execution log of repository and pull request scans
            </p>
          </div>
          <Link href="/repositories">
            <Button variant="primary" size="sm" className="gap-1.5">
              <Play className="w-3.5 h-3.5" />
              <span>New Scan</span>
            </Button>
          </Link>
        </div>

        <div className="rounded-lg bg-surface border border-border overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scan ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Triggered By</TableHead>
                  <TableHead>Commit</TableHead>
                  <TableHead>Findings</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Policy Gate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-xs text-text-muted">
                      No security scans recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  scans.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs font-semibold">
                        <Link href={`/scans/${s.id}`} className="hover:text-accent hover:underline">
                          {s.id.substring(0, 8)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-surface-elevated border border-border">
                          {s.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-text-secondary">{s.triggered_by || 'DevSecOps'}</TableCell>
                      <TableCell className="font-mono text-xs text-text-muted">
                        {s.commit_sha ? truncateHash(s.commit_sha) : '-'}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold">
                        <span className={s.total_findings > 0 ? 'text-severity-high' : 'text-status-pass'}>
                          {s.total_findings}
                        </span>
                      </TableCell>
                      <TableCell>
                        <RiskScore score={s.risk_score} size="sm" showLabel={false} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={s.policy_result || 'PASS'} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={s.status} />
                      </TableCell>
                      <TableCell className="font-mono text-xs text-text-muted">
                        {formatDuration(s.duration_ms)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/scans/${s.id}`}>
                          <Button variant="outline" size="sm" className="text-xs">
                            Inspect
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </AppShell>
  );
}
