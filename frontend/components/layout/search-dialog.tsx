'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, FolderGit2, AlertOctagon, BrainCircuit, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

export const SearchDialog: React.FC<SearchDialogProps> = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const router = useRouter();

  if (!open) return null;

  const quickLinks = [
    { label: 'All Security Findings', href: '/findings', type: 'finding', icon: <AlertOctagon className="w-4 h-4 text-severity-high" /> },
    { label: 'Connected Repositories', href: '/repositories', type: 'repo', icon: <FolderGit2 className="w-4 h-4 text-accent" /> },
    { label: 'OWASP Top 10 Corpus', href: '/intelligence', type: 'intelligence', icon: <BrainCircuit className="w-4 h-4 text-blue-400" /> },
    { label: 'Security Policies & Gates', href: '/policies', type: 'policy', icon: <ChevronRight className="w-4 h-4 text-text-muted" /> },
  ];

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl bg-surface border border-border rounded-lg shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-border gap-3">
          <Search className="w-5 h-5 text-text-muted" />
          <input
            autoFocus
            type="text"
            placeholder="Search findings, repositories, rules, CWEs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-elevated text-text-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results / Suggestions */}
        <div className="p-3 max-h-80 overflow-y-auto space-y-1">
          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-text-muted">
            Quick Navigation
          </div>
          {quickLinks.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(item.href)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              <span className="text-[10px] font-mono text-text-muted uppercase">{item.type}</span>
            </button>
          ))}
        </div>

        <div className="px-4 py-2 bg-surface-elevated/40 border-t border-border flex items-center justify-between text-[11px] text-text-muted font-mono">
          <span>Press ESC to close</span>
          <span>Navigation Shortcuts</span>
        </div>
      </div>
    </div>
  );
};
