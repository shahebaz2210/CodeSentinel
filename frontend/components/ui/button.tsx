import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'inverted' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed rounded-lg select-none';

    const variants = {
      primary:
        'bg-[#3b82f6] text-white hover:bg-[#2563eb] active:scale-[0.98] font-semibold shadow-[0_0_16px_rgba(59,130,246,0.35)] hover:shadow-[0_0_24px_rgba(59,130,246,0.5)] border border-[#60a5fa]/40',
      secondary:
        'bg-[#181d24]/90 text-[#f1f5f9] hover:bg-[#222933] border border-white/[0.08] hover:border-white/[0.16] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md',
      tertiary:
        'bg-[#d16900] text-white hover:bg-[#b45309] active:scale-[0.98] font-semibold shadow-[0_0_16px_rgba(209,105,0,0.35)] border border-[#f97316]/40',
      inverted:
        'bg-white text-[#090b0e] hover:bg-slate-100 font-semibold shadow-md',
      outline:
        'bg-white/[0.03] text-[#f1f5f9] hover:bg-white/[0.07] border border-white/[0.12] hover:border-white/[0.22] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
      danger:
        'bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30 hover:bg-[#ef4444]/25 shadow-[0_0_12px_rgba(239,68,68,0.2)]',
      ghost:
        'bg-transparent text-[#94a3b8] hover:text-white hover:bg-white/[0.06]',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-9 px-4 text-sm gap-2',
      lg: 'h-11 px-6 text-base gap-2.5',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
