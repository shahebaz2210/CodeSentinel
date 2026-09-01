import React from 'react';
import { FindingStatus, PolicyResult, ScanStatus } from '@/types/api';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: FindingStatus | ScanStatus | PolicyResult | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const s = (status || 'UNKNOWN').toUpperCase();

  const styles: Record<string, { bg: string; text: string; border: string }> = {
    // Policy & Scan
    PASS: { bg: 'bg-status-pass/10', text: 'text-status-pass', border: 'border-status-pass/30' },
    COMPLETED: { bg: 'bg-status-pass/10', text: 'text-status-pass', border: 'border-status-pass/30' },
    WARN: { bg: 'bg-status-warn/10', text: 'text-status-warn', border: 'border-status-warn/30' },
    RUNNING: { bg: 'bg-accent/10', text: 'text-accent', border: 'border-accent/30' },
    QUEUED: { bg: 'bg-surface-elevated', text: 'text-text-secondary', border: 'border-border' },
    FAIL: { bg: 'bg-status-fail/10', text: 'text-status-fail', border: 'border-status-fail/30' },
    FAILED: { bg: 'bg-status-fail/10', text: 'text-status-fail', border: 'border-status-fail/30' },
    CANCELLED: { bg: 'bg-surface-elevated', text: 'text-text-muted', border: 'border-border' },

    // Finding
    OPEN: { bg: 'bg-severity-high/10', text: 'text-severity-high', border: 'border-severity-high/30' },
    IN_REVIEW: { bg: 'bg-severity-medium/10', text: 'text-severity-medium', border: 'border-severity-medium/30' },
    RESOLVED: { bg: 'bg-status-pass/10', text: 'text-status-pass', border: 'border-status-pass/30' },
    FALSE_POSITIVE: { bg: 'bg-surface-elevated', text: 'text-text-muted', border: 'border-border' },
    ACCEPTED_RISK: { bg: 'bg-severity-medium/15', text: 'text-amber-400', border: 'border-amber-500/30' },
    IGNORED: { bg: 'bg-surface-elevated', text: 'text-text-muted', border: 'border-border' },
  };

  const current = styles[s] || { bg: 'bg-surface-elevated', text: 'text-text-secondary', border: 'border-border' };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-mono font-medium rounded border',
        current.bg,
        current.text,
        current.border,
        className
      )}
    >
      {s === 'RUNNING' && <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse mr-1.5" />}
      {s}
    </span>
  );
};
