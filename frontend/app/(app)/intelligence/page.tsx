'use client';

import React, { useEffect, useState } from 'react';
import { BrainCircuit, Search, ExternalLink, ShieldCheck, BookOpen } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { SecurityDocument } from '@/types/api';

export default function IntelligencePage() {
  const [documents, setDocuments] = useState<SecurityDocument[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.intelligence.listDocuments(selectedSource || undefined).then((docs) => {
      setDocuments(docs);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selectedSource]);

  const filteredDocs = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.external_id.toLowerCase().includes(search.toLowerCase()) ||
      d.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-primary">Security Intelligence Knowledge Corpus</h1>
          <p className="text-xs text-text-muted mt-0.5">
            OWASP Top 10, CWE definitions, and CVE threat intelligence grounding CodeSentinel AI assessments
          </p>
        </div>

        {/* Filter Bar */}
        <div className="p-3 rounded-lg bg-surface border border-border flex flex-wrap items-center gap-3">
          <div className="max-w-xs w-full">
            <Input
              placeholder="Search CWE, OWASP rules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono">
            <button
              onClick={() => setSelectedSource('')}
              className={`px-3 py-1.5 rounded-md border transition-colors ${
                selectedSource === ''
                  ? 'bg-accent/15 border-accent/40 text-accent font-bold'
                  : 'bg-surface-elevated border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              All Sources
            </button>
            <button
              onClick={() => setSelectedSource('OWASP')}
              className={`px-3 py-1.5 rounded-md border transition-colors ${
                selectedSource === 'OWASP'
                  ? 'bg-accent/15 border-accent/40 text-accent font-bold'
                  : 'bg-surface-elevated border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              OWASP Top 10
            </button>
            <button
              onClick={() => setSelectedSource('CWE')}
              className={`px-3 py-1.5 rounded-md border transition-colors ${
                selectedSource === 'CWE'
                  ? 'bg-accent/15 border-accent/40 text-accent font-bold'
                  : 'bg-surface-elevated border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              CWE Top 25
            </button>
          </div>
        </div>

        {/* Knowledge Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-44 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocs.map((doc) => (
              <div key={doc.id} className="p-5 rounded-lg bg-surface border border-border space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-surface-elevated border border-border text-accent">
                      {doc.external_id}
                    </span>
                    <span className="text-[10px] font-mono text-text-muted uppercase">
                      {doc.source_type}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-text-primary">{doc.title}</h3>
                  <p className="text-xs text-text-secondary line-clamp-4 leading-relaxed font-sans">
                    {doc.content}
                  </p>
                </div>

                {doc.url && (
                  <div className="pt-2 border-t border-border/60">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-accent hover:underline"
                    >
                      <span>Official Documentation</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
