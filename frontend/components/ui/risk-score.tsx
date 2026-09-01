import React from 'react';
import { cn } from '@/lib/utils';

interface RiskScoreProps {
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const RiskScore: React.FC<RiskScoreProps> = ({
  score = 0,
  size = 'md',
  showLabel = true,
}) => {
  const rounded = Math.round(score);

  const getColor = (s: number) => {
    if (s >= 80) return 'text-severity-critical border-severity-critical/40 bg-severity-critical/10';
    if (s >= 60) return 'text-severity-high border-severity-high/40 bg-severity-high/10';
    if (s >= 40) return 'text-severity-medium border-severity-medium/40 bg-severity-medium/10';
    if (s >= 20) return 'text-severity-low border-severity-low/40 bg-severity-low/10';
    return 'text-accent border-accent/40 bg-accent/10';
  };

  const colorClass = getColor(rounded);

  const sizes = {
    sm: 'w-7 h-7 text-xs font-mono font-bold',
    md: 'w-9 h-9 text-sm font-mono font-bold',
    lg: 'w-14 h-14 text-xl font-mono font-extrabold',
  };

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className={cn(
          'flex items-center justify-center rounded-md border',
          sizes[size],
          colorClass
        )}
      >
        {rounded}
      </div>
      {showLabel && size !== 'sm' && (
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-mono tracking-wider text-text-muted">Risk Score</span>
          <span className="text-xs font-medium text-text-secondary">
            {rounded >= 80 ? 'Critical Risk' : rounded >= 60 ? 'High Risk' : rounded >= 40 ? 'Moderate' : 'Low Risk'}
          </span>
        </div>
      )}
    </div>
  );
};
