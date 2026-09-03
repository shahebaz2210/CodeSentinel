'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  LayoutDashboard,
  FolderGit2,
  AlertOctagon,
  GitPullRequest,
  Activity,
  FileCheck2,
  BrainCircuit,
  Sliders,
  History,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const mainNav: NavItem[] = [
    { label: 'Overview', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Repositories', href: '/repositories', icon: <FolderGit2 className="w-4 h-4" /> },
    { label: 'Findings', href: '/findings', icon: <AlertOctagon className="w-4 h-4" /> },
    { label: 'Pull Requests', href: '/pull-requests', icon: <GitPullRequest className="w-4 h-4" /> },
    { label: 'Scans', href: '/scans', icon: <Activity className="w-4 h-4" /> },
  ];

  const governanceNav: NavItem[] = [
    { label: 'Policies', href: '/policies', icon: <FileCheck2 className="w-4 h-4" /> },
    { label: 'Intelligence', href: '/intelligence', icon: <BrainCircuit className="w-4 h-4" /> },
  ];

  const configNav: NavItem[] = [
    { label: 'Audit Log', href: '/audit', icon: <History className="w-4 h-4" /> },
    { label: 'Settings', href: '/settings', icon: <Sliders className="w-4 h-4" /> },
  ];

  const renderNavGroup = (items: NavItem[]) => (
    <div className="space-y-0.5">
      {items.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all duration-150',
              isActive
                ? 'bg-[#1c2128] text-white font-semibold border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                : 'text-[#8b949e] hover:text-white hover:bg-white/[0.04]'
            )}
          >
            <div className="flex items-center gap-2.5">
              <span className={cn(isActive ? 'text-[#38bdf8]' : 'text-[#8b949e]')}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
            {item.badge !== undefined && (
              <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full bg-severity-critical/20 text-severity-critical">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <aside className="w-60 bg-black/90 backdrop-blur-2xl border-r border-white/[0.08] flex flex-col justify-between h-screen sticky top-0 select-none z-30 shadow-[inset_-1px_0_0_0_rgba(255,255,255,0.06),8px_0_32px_rgba(0,0,0,0.6)]">
      {/* Brand Header with New 4-Petal Geometric Logo */}
      <div>
        <div className="h-16 px-4 flex items-center gap-2.5 border-b border-white/[0.08]">
          <div className="w-6 h-6 flex items-center justify-center">
            <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none">
              <path d="M16 4C16 4 10 4 10 10C10 16 16 16 16 16C16 16 16 10 16 4Z" fill="white" />
              <path d="M28 16C28 16 28 10 22 10C16 10 16 16 16 16C16 16 22 16 28 16Z" fill="white" />
              <path d="M16 28C16 28 22 28 22 22C22 16 16 16 16 16C16 16 16 22 16 28Z" fill="white" />
              <path d="M4 16C4 16 4 22 10 22C16 22 16 16 16 16C16 16 10 16 4 16Z" fill="white" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-white">CodeSentinel</span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-3 space-y-4">
          {renderNavGroup(mainNav)}

          <div className="space-y-1.5 pt-1">
            <span className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#6e7681]">
              Governance
            </span>
            {renderNavGroup(governanceNav)}
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#6e7681]">
              Configuration
            </span>
            {renderNavGroup(configNav)}
          </div>
        </nav>
      </div>

      {/* User / Workspace Footer */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center justify-between p-2 rounded-md bg-surface-elevated/60">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-7 h-7 rounded-full bg-border flex items-center justify-center text-xs font-mono font-bold text-text-primary border border-border">
              CS
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-medium text-text-primary truncate">Security Lead</span>
              <span className="text-[10px] font-mono text-text-muted truncate">lead@codesentinel.io</span>
            </div>
          </div>
          <button
            onClick={() => {
              fetch('/api/v1/auth/logout', { method: 'POST' }).then(() => {
                window.location.href = '/login';
              });
            }}
            title="Log out"
            className="p-1.5 rounded hover:bg-surface-hover text-text-muted hover:text-severity-critical transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
