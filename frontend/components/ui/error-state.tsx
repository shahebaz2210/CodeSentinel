import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Failed to load security data from API.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-severity-critical/30 rounded-lg bg-severity-critical/5">
      <AlertTriangle className="w-8 h-8 text-severity-critical mb-3" />
      <h4 className="text-sm font-semibold text-text-primary mb-1">Service Error</h4>
      <p className="text-xs text-text-secondary max-w-md mb-4">{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry}>
          Retry Request
        </Button>
      )}
    </div>
  );
};
