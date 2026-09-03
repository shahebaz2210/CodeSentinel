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

  // Friendly route title mapping
  const routeLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    repositories: 'Repositories',
    findings: 'Findings',
    'pull-requests': 'Pull Requests',
    scans: 'Scans',
    policies: 'Policies',
    new: 'New Policy',
    intelligence: 'Threat Intelligence',
    audit: 'Audit Log',
    settings: 'Settings & Integrations',
    'how-it-works': 'Documentation',
  };

  const segments = pathname?.split('/').filter(Boolean) || ['dashboard'];

  return (
    <header className="h-16 bg-black/85 backdrop-blur-2xl border-b border-white/[0.08] px-6 flex items-center justify-between sticky top-0 z-20 shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.06),0_8px_24px_rgba(0,0,0,0.4)]">
      {/* Dynamic Clickable Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium">
        <Link
          href="/dashboard"
          className="text-[#8b949e] hover:text-white transition-colors flex items-center gap-1.5"
        >
          <span>Security</span>
        </Link>

        {segments.map((segment, index) => {
          const href = '/' + segments.slice(0, index + 1).join('/');
          const isLast = index === segments.length - 1;

          // Format segment text: look up in map, or format UUID / generic text
          let label = routeLabels[segment.toLowerCase()];
          if (!label) {
            if (segment.length > 15 || /^[0-9a-fA-F-]+$/.test(segment)) {
              label = 'Details';
            } else {
              label = segment
                .split('-')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');
            }
          }

          return (
            <React.Fragment key={href}>
              <ChevronRight className="w-3.5 h-3.5 text-[#484f58] shrink-0" />
              {isLast ? (
                <span className="text-white font-semibold truncate max-w-[220px]" aria-current="page">
                  {label}
                </span>
              ) : (
                <Link
                  href={href}
                  className="text-[#8b949e] hover:text-white transition-colors truncate max-w-[160px]"
                >
                  {label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Global Actions */}
      <div className="flex items-center gap-4">
        {/* Quick Search Bar matching screenshot */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-[#161b22]/70 backdrop-blur-md border border-white/[0.08] hover:border-white/[0.18] text-xs text-[#8b949e] hover:text-white transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] w-60 justify-between"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#8b949e]" />
            <span>Search findings...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#21262d] rounded border border-white/[0.08] text-[#8b949e]">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Icon */}
        <button
          className="relative p-2 rounded-lg hover:bg-white/[0.06] text-[#8b949e] hover:text-white transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ef4444] shadow-[0_0_6px_#ef4444]" />
        </button>

        {/* User Profile Block matching screenshot */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-white/[0.08]">
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-white leading-tight">Devin SecOps</span>
            <span className="text-[10px] font-mono text-[#8b949e]">Admin</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3b82f6] to-[#8b5cf6] p-[1.5px] flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-[#161b22] flex items-center justify-center text-[11px] font-bold text-white overflow-hidden">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">DS</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
