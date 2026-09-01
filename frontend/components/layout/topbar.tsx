'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell, ShieldCheck, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopbarProps {
  onOpenSearch?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenSearch }) => {
  const pathname = usePathname();

  // Generate dynamic breadcrumb
  const segments = pathname?.split('/').filter(Boolean) || ['dashboard'];
  const breadcrumbText = segments.map((s) => s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' '));

  return (
    <header className="h-14 bg-surface/80 backdrop-blur border-b border-border px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1.5 text-xs font-mono">
        <span className="text-text-muted">CodeSentinel</span>
        {breadcrumbText.map((item, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3 h-3 text-text-muted" />
            <span className={idx === breadcrumbText.length - 1 ? 'text-text-primary font-semibold' : 'text-text-muted'}>
              {item}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Search Shortcut */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-surface-elevated border border-border text-xs text-text-muted hover:border-text-secondary transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search findings, repos, rules...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-surface rounded border border-border text-text-muted">
            ⌘K
          </kbd>
        </button>

        {/* System Health Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-accent/10 border border-accent/20 text-accent text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>SCANNERS ONLINE</span>
        </div>

        {/* Notifications Icon */}
        <button
          className="relative p-2 rounded-md hover:bg-surface-elevated text-text-secondary hover:text-text-primary transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-severity-critical" />
        </button>
      </div>
    </header>
  );
};
