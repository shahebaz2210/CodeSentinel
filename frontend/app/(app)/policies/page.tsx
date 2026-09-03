'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileCheck2, Plus, Shield, CheckCircle2, AlertTriangle, Scale, Lock } from 'lucide-react';
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
      <div className="space-y-6 font-sans text-[#f1f5f9]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/15 border border-[#3b82f6]/30 flex items-center justify-center text-[#3b82f6] shadow-[0_0_16px_rgba(59,130,246,0.2)]">
                <Scale className="w-4 h-4" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Security Policies & Merge Gates</h1>
            </div>
            <p className="text-xs text-[#94a3b8] mt-1">
              Deterministic threshold policies enforced on pull requests and repository branches to prevent security regressions.
            </p>
          </div>

          <Link href="/policies/new">
            <Button variant="primary" size="sm" className="gap-1.5 font-semibold">
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Policy</span>
            </Button>
          </Link>
        </div>

        {/* Policies List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full bg-[#181d24]/50 rounded-3xl" />
            ))}
          </div>
        ) : policies.length === 0 ? (
          <div className="p-12 rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] text-center space-y-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_20px_50px_rgba(0,0,0,0.8)]">
            <Scale className="w-10 h-10 text-[#757780] mx-auto opacity-50" />
            <p className="text-sm font-semibold text-white">No policies created yet</p>
            <p className="text-xs text-[#757780] max-w-sm mx-auto">
              Create a security policy to enforce automatic merge blocking on pull requests.
            </p>
            <Link href="/policies/new">
              <Button variant="primary" size="sm" className="mt-2 font-semibold">
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>Create First Policy</span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {policies.map((p, idx) => (
              <div
                key={p.id}
                className="p-6 sm:p-8 rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8)] space-y-4 hover:border-white/[0.22] transition-all relative overflow-hidden"
              >
                {/* Varied Ambient Light Mesh */}
                {idx % 2 === 0 ? (
                  <div className="absolute -top-16 -right-16 w-[340px] h-[340px] bg-gradient-to-bl from-[#38bdf8]/20 via-[#3b82f6]/10 to-transparent blur-[75px] pointer-events-none" />
                ) : (
                  <div className="absolute -bottom-16 -left-16 w-[340px] h-[340px] bg-gradient-to-tr from-[#10b981]/20 via-[#059669]/10 to-transparent blur-[75px] pointer-events-none" />
                )}

                <div className="relative z-10 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.1] flex items-center justify-center text-white">
                        <FileCheck2 className="w-5 h-5 text-[#38bdf8]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h2 className="text-base sm:text-lg font-bold text-white">{p.name}</h2>
                          <span className={`px-2 py-0.5 text-[10px] font-mono rounded font-bold ${
                            p.enabled
                              ? 'bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#22c55e]'
                              : 'bg-white/[0.04] border border-white/[0.08] text-[#757780]'
                          }`}>
                            {p.enabled ? 'ACTIVE GATE' : 'DISABLED'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-mono text-[#757780]">Updated {formatDate(p.updated_at)}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
                    {p.description || 'Global security policy enforcing automated threshold gates.'}
                  </p>

                  {/* Configuration summary tags */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-white/[0.06] text-xs font-mono text-[#94a3b8]">
                    <div className="px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                      Block Critical: <strong className="text-white">{p.configuration.block_critical ? 'YES' : 'NO'}</strong>
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                      Block Secrets: <strong className="text-white">{p.configuration.block_secrets ? 'YES' : 'NO'}</strong>
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                      Threshold: <strong className="text-[#38bdf8]">{p.configuration.severity_threshold}</strong>
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                      Exceptions: <strong className="text-white">{p.configuration.allow_approved_exceptions ? 'ALLOWED' : 'DISABLED'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
