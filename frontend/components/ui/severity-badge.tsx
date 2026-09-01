import React from 'react';
import { Severity } from '@/types/api';
import { cn } from '@/lib/utils';

interface SeverityBadgeProps {
  severity: Severity | string;
  className?: string;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  className,
  size = 'md',
}) => {
  const sev = (severity || 'INFO').toUpperCase();

  const styles: Record<string, string> = {
    CRITICAL: 'bg-severity-critical/15 text-severity-critical border-severity-critical/30',
    HIGH: 'bg-severity-high/15 text-severity-high border-severity-high/30',
    MEDIUM: 'bg-severity-medium/15 text-severity-medium border-severity-medium/30',
    LOW: 'bg-severity-low/15 text-severity-low border-severity-low/30',
    INFO: 'bg-severity-info/15 text-severity-info border-severity-info/30',
  };

  const currentStyle = styles[sev] || styles.INFO;
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={cn(
        'inline-flex items-center font-mono font-semibold uppercase tracking-wider rounded border',
        sizeClasses,
        currentStyle,
        className
      )}
      aria-label={`Severity: ${sev}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {sev}
    </span>
  );
};
