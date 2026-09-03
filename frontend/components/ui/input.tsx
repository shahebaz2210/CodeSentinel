import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && <div className="absolute left-3 text-[#757780] pointer-events-none">{icon}</div>}
        <input
          type={type}
          className={cn(
            'flex h-9 w-full rounded-lg border border-white/[0.08] bg-[#12151a]/80 backdrop-blur-md px-3 py-1.5 text-xs font-mono text-[#f1f5f9] placeholder:text-[#757780] transition-all focus:border-[#3b82f6]/60 focus:bg-[#181d24] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] disabled:cursor-not-allowed disabled:opacity-50',
            icon && 'pl-9',
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = 'Input';
