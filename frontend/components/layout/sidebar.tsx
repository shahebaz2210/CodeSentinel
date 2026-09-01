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

  const navItems: NavItem[] = [
    { label: 'Overview', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Repositories', href: '/repositories', icon: <FolderGit2 className="w-4 h-4" /> },
    { label: 'Findings', href: '/findings', icon: <AlertOctagon className="w-4 h-4" /> },
    { label: 'Pull Requests', href: '/pull-requests', icon: <GitPullRequest className="w-4 h-4" /> },
    { label: 'Scans', href: '/scans', icon: <Activity className="w-4 h-4" /> },
    { label: 'Policies', href: '/policies', icon: <FileCheck2 className="w-4 h-4" /> },
    { label: 'Intelligence', href: '/intelligence', icon: <BrainCircuit className="w-4 h-4" /> },
    { label: 'Audit Log', href: '/audit', icon: <History className="w-4 h-4" /> },
    { label: 'Settings', href: '/settings', icon: <Sliders className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-60 bg-surface border-r border-border flex flex-col justify-between h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div>
        <div className="h-14 px-4 flex items-center gap-2.5 border-b border-border">
          <div className="w-7 h-7 rounded-md bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
            <Shield className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-text-primary">CodeSentinel</span>
            <span className="text-[10px] font-mono text-text-muted tracking-wider">DEVSECOPS V1.0</span>
          </div>
        </div>

        {/* Workspace Selector */}
        <div className="p-3">
          <div className="px-3 py-2 rounded-md bg-surface-elevated border border-border flex items-center justify-between hover:border-text-muted transition-colors cursor-pointer">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-text-primary truncate">Production Core</span>
              <span className="text-[10px] font-mono text-text-muted">acme-corp</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
          </div>
        </div>

        {/* Navigation links */}
        <nav className="px-2 py-1 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-all duration-150',
                  isActive
                    ? 'bg-surface-elevated text-accent font-semibold border-l-2 border-accent shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className={cn(isActive ? 'text-accent' : 'text-text-muted')}>{item.icon}</span>
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
