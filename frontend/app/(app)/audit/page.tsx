'use client';

import React, { useEffect, useState } from 'react';
import { History, Shield, User, Clock } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-primary">Security Audit Log</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Immutable chronological record of administrative and security events across the organization
          </p>
        </div>

        <div className="rounded-lg bg-surface border border-border overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource Type</TableHead>
                  <TableHead>Resource ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-xs text-text-muted">
                      No audit events recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs text-text-muted whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-text-primary font-medium">
                        {log.actor_name || 'System'}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-surface-elevated border border-border text-accent font-semibold">
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-text-secondary">
                        {log.resource_type}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-text-muted">
                        {log.resource_id ? log.resource_id.substring(0, 8) : '-'}
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
