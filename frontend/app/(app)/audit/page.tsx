'use client';

import React, { useEffect, useState } from 'react';
import { History, Shield, User, Clock } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { AuditLog } from '@/types/api';
import { formatDate } from '@/lib/utils';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.audit.list().then((list) => {
      setLogs(list);
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
                <History className="w-4 h-4" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Security Audit Log</h1>
            </div>
            <p className="text-xs text-[#94a3b8] mt-1">
              Immutable chronological record of administrative and automated security events across the organization.
            </p>
          </div>
        </div>

        {/* Audit Log Table (High Glassmorphism with Bottom-Left Glow) */}
        <div className="rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8)] hover:border-white/[0.22] transition-all overflow-hidden relative">
          {/* Ambient Glow in Bottom-Left Corner */}
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-gradient-to-tr from-[#3b82f6]/20 via-[#6366f1]/10 to-transparent blur-[85px] pointer-events-none" />

          <div className="relative z-10">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-[#181d24]/50 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[10px] font-mono uppercase tracking-wider text-[#757780] bg-white/[0.02]">
                    <th className="px-6 py-3.5 font-semibold">Timestamp</th>
                    <th className="px-6 py-3.5 font-semibold">Actor</th>
                    <th className="px-6 py-3.5 font-semibold">Action</th>
                    <th className="px-6 py-3.5 font-semibold">Resource Type</th>
                    <th className="px-6 py-3.5 font-semibold text-right">Resource ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-xs font-mono text-[#757780]">
                        No audit events recorded yet.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-mono text-[#94a3b8] whitespace-nowrap text-[11px]">
                          {formatDate(log.created_at)}
                        </td>
                        <td className="px-6 py-4 font-mono text-white font-semibold">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-[#3b82f6]" />
                            <span>{log.actor_name || 'System / Service Account'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-[#3b82f6]/15 border border-[#3b82f6]/30 text-[#60a5fa] font-bold">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-[#94a3b8]">
                          {log.resource_type}
                        </td>
                        <td className="px-6 py-4 font-mono text-[#757780] text-right">
                          {log.resource_id ? log.resource_id.substring(0, 8) : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
