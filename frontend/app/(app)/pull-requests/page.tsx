'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { GitPullRequest, ShieldCheck, ShieldAlert, AlertOctagon, CheckCircle2, ArrowRight, Clock } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { SeverityBadge } from '@/components/ui/severity-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { ScanListItem } from '@/types/api';
import { formatDate } from '@/lib/utils';

export default function PullRequestsPage() {
  const [prScans, setPrScans] = useState<ScanListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.scans.list({ type: 'PR' }).then((res: any) => {
      const items = Array.isArray(res) ? res : res?.items || [];
      setPrScans(items);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-primary">Pull Request Security Gates</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Automated CI/CD security evaluations blocking high-risk vulnerabilities before merge
          </p>
        </div>

        {/* PR Cards */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-44 w-full" />
          </div>
        ) : prScans.length === 0 ? (
          <div className="p-8 rounded-lg bg-surface border border-border text-center text-xs text-text-muted font-mono">
            No active PR scans found. Webhooks trigger scans automatically on pull request events.
          </div>
        ) : (
          <div className="space-y-4">
            {prScans.map((pr) => {
              const isFail = pr.policy_result === 'FAIL';
              return (
                <div
                  key={pr.id}
                  className={`p-6 rounded-lg bg-surface border transition-all ${
                    isFail ? 'border-severity-critical/40 bg-severity-critical/[0.02]' : 'border-border'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <GitPullRequest className="w-4 h-4 text-text-muted" />
                        <span className="font-mono text-xs font-semibold text-text-muted">
                          {pr.repository_name || 'payments-service'} #{pr.pr_number || 184}
                        </span>
                        <StatusBadge status={pr.policy_result || (isFail ? 'FAIL' : 'PASS')} />
                      </div>
                      <h2 className="text-base font-bold text-text-primary">
                        PR #{pr.pr_number || 184}: Add payment webhook signature verification callback
                      </h2>
                      <p className="text-xs font-mono text-text-muted">
                        Branch: <span className="text-text-secondary">{pr.branch || 'feature/stripe-webhook-handler'}</span> • Commit: {pr.commit_sha?.substring(0, 7) || 'a7f89b1'} • {formatDate(pr.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/scans/${pr.id}`}>
                        <Button variant="secondary" size="sm">
                          View 13-Stage Pipeline
                        </Button>
                      </Link>
                      <Link href="/findings">
                        <Button variant={isFail ? 'danger' : 'primary'} size="sm">
                          Inspect Findings
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Summary & Gating Decision Breakdown */}
                  <div className="mt-4 pt-3 border-t border-border/60 text-xs font-mono">
                    <div className="text-[11px] text-text-muted uppercase mb-2 font-semibold">
                      Security Gate Decision & Blockers:
                    </div>
                    <ul className="space-y-1.5">
                      {isFail ? (
                        <>
                          <li className="flex items-center gap-1.5 text-severity-critical">
                            <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                            <span>Blocked by Policy: Hardcoded Stripe Live Secret Key (CWE-798) in src/config/stripe.py</span>
                          </li>
                          <li className="flex items-center gap-1.5 text-severity-critical">
                            <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                            <span>Blocked by Policy: Critical SQL Injection vulnerability (CWE-89) in src/services/order_service.py</span>
                          </li>
                        </>
                      ) : (
                        <li className="flex items-center gap-1.5 text-status-pass">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>All security policy gates passed. Safe to merge.</span>
                        </li>
                      )}
                    </ul>

                    <div className="flex flex-wrap items-center gap-3 mt-3 pt-2 border-t border-border/40 text-[11px] text-text-muted">
                      <span>Total Findings: <strong className="text-text-primary">{pr.total_findings || 3}</strong></span>
                      <span>•</span>
                      <span>Critical: <strong className="text-severity-critical">{pr.critical_count || 2}</strong></span>
                      <span>•</span>
                      <span>Risk Score: <strong className="text-severity-critical">{pr.risk_score || 92.0}/100</strong></span>
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
