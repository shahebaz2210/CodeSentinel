'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileCheck2, Plus, Shield, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { Policy } from '@/types/api';
import { formatDate } from '@/lib/utils';

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.policies.list().then((list) => {
      setPolicies(list);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-text-primary">Security Policies & Gates</h1>
            <p className="text-xs text-text-muted mt-0.5">
              Deterministic threshold policies enforced on pull requests and repository branches
            </p>
          </div>
          <Link href="/policies/new">
            <Button variant="primary" size="sm" className="gap-1.5 font-semibold">
              <Plus className="w-3.5 h-3.5" />
              <span>Create Policy</span>
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : policies.length === 0 ? (
          <div className="p-8 rounded-lg bg-surface border border-border text-center text-xs text-text-muted font-mono">
            No policies created yet. Click "Create Policy" to enforce rules.
          </div>
        ) : (
          <div className="space-y-4">
            {policies.map((p) => (
              <div key={p.id} className="p-6 rounded-lg bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileCheck2 className="w-5 h-5 text-accent" />
                    <h2 className="text-base font-bold text-text-primary">{p.name}</h2>
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-accent/10 border border-accent/20 text-accent font-semibold">
                      {p.enabled ? 'ACTIVE GATE' : 'DISABLED'}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-text-muted">Updated {formatDate(p.updated_at)}</span>
                </div>

                <p className="text-xs text-text-secondary">{p.description || 'Global security policy.'}</p>

                {/* Configuration summary tags */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60 text-xs font-mono text-text-muted">
                  <span className="px-2.5 py-1 rounded bg-surface-elevated border border-border">
                    Block Critical: <span className="text-text-primary font-bold">{p.configuration.block_critical ? 'YES' : 'NO'}</span>
                  </span>
                  <span className="px-2.5 py-1 rounded bg-surface-elevated border border-border">
                    Block Secrets: <span className="text-text-primary font-bold">{p.configuration.block_secrets ? 'YES' : 'NO'}</span>
                  </span>
                  <span className="px-2.5 py-1 rounded bg-surface-elevated border border-border">
                    Threshold: <span className="text-text-primary font-bold">{p.configuration.severity_threshold}</span>
                  </span>
                  <span className="px-2.5 py-1 rounded bg-surface-elevated border border-border">
                    Exceptions: <span className="text-text-primary font-bold">{p.configuration.allow_approved_exceptions ? 'ALLOWED' : 'DISABLED'}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
