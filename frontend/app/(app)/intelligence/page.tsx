'use client';

import React, { useEffect, useState } from 'react';
import { BrainCircuit, Search, ExternalLink, ShieldCheck, BookOpen, Layers, Sparkles } from 'lucide-react';
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
      <div className="space-y-6 font-sans text-[#f1f5f9]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/15 border border-[#3b82f6]/30 flex items-center justify-center text-[#3b82f6] shadow-[0_0_16px_rgba(59,130,246,0.2)]">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Security Intelligence Knowledge Corpus</h1>
            </div>
            <p className="text-xs text-[#94a3b8] mt-1">
              Curated OWASP Top 10, CWE definitions, and CVE threat intelligence grounding CodeSentinel AI assessments.
            </p>
          </div>
        </div>

        {/* Filter Bar (High Glassmorphism with Top-Right Glow) */}
        <div className="p-4 rounded-2xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] flex flex-wrap items-center justify-between gap-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_16px_40px_rgba(0,0,0,0.8)] relative overflow-hidden">
          {/* Ambient Glow in Top-Right Corner */}
          <div className="absolute -top-12 -right-12 w-[260px] h-[260px] bg-gradient-to-bl from-[#38bdf8]/20 via-[#3b82f6]/10 to-transparent blur-[60px] pointer-events-none" />

          <div className="relative z-10 max-w-xs w-full">
            <Input
              placeholder="Search CWE, OWASP rules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4 text-[#757780]" />}
            />
          </div>

          <div className="relative z-10 flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => setSelectedSource('')}
              className={`px-3.5 py-1.5 rounded-lg border transition-all ${
                selectedSource === ''
                  ? 'bg-[#3b82f6] text-white border-[#3b82f6] shadow-[0_0_12px_rgba(59,130,246,0.3)] font-bold'
                  : 'bg-black/60 border-white/[0.1] text-[#94a3b8] hover:text-white'
              }`}
            >
              All Sources
            </button>
            <button
              onClick={() => setSelectedSource('OWASP')}
              className={`px-3.5 py-1.5 rounded-lg border transition-all ${
                selectedSource === 'OWASP'
                  ? 'bg-[#3b82f6] text-white border-[#3b82f6] shadow-[0_0_12px_rgba(59,130,246,0.3)] font-bold'
                  : 'bg-black/60 border-white/[0.1] text-[#94a3b8] hover:text-white'
              }`}
            >
              OWASP Top 10
            </button>
            <button
              onClick={() => setSelectedSource('CWE')}
              className={`px-3.5 py-1.5 rounded-lg border transition-all ${
                selectedSource === 'CWE'
                  ? 'bg-[#3b82f6] text-white border-[#3b82f6] shadow-[0_0_12px_rgba(59,130,246,0.3)] font-bold'
                  : 'bg-black/60 border-white/[0.1] text-[#94a3b8] hover:text-white'
              }`}
            >
              CWE Top 25
            </button>
          </div>
        </div>

        {/* Knowledge Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full bg-[#181d24]/50 rounded-3xl" />
            ))}
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-12 rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] text-center space-y-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_20px_50px_rgba(0,0,0,0.8)]">
            <BookOpen className="w-10 h-10 text-[#757780] mx-auto opacity-50" />
            <p className="text-sm font-semibold text-white">No knowledge documents found</p>
            <p className="text-xs text-[#757780]">
              Try adjusting your search query or switching source categories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredDocs.map((doc, idx) => {
              const glowDirections = [
                'absolute -top-16 -left-16 w-[320px] h-[320px] bg-gradient-to-br from-[#3b82f6]/20 via-[#6366f1]/10 to-transparent blur-[70px] pointer-events-none',
                'absolute -bottom-16 -right-16 w-[320px] h-[320px] bg-gradient-to-tl from-[#10b981]/20 via-[#06b6d4]/10 to-transparent blur-[70px] pointer-events-none',
                'absolute -top-16 -right-16 w-[320px] h-[320px] bg-gradient-to-bl from-[#8b5cf6]/20 via-[#a855f7]/10 to-transparent blur-[70px] pointer-events-none',
                'absolute -bottom-16 -left-16 w-[320px] h-[320px] bg-gradient-to-tr from-[#f59e0b]/20 via-[#d97706]/10 to-transparent blur-[70px] pointer-events-none',
              ];
              const selectedGlow = glowDirections[idx % glowDirections.length];

              return (
                <div
                  key={doc.id}
                  className="p-6 sm:p-8 rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8)] space-y-4 flex flex-col justify-between hover:border-white/[0.22] transition-all group relative overflow-hidden"
                >
                  {/* Multi-Directional Ambient Mesh */}
                  <div className={selectedGlow} />

                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-lg bg-[#3b82f6]/15 border border-[#3b82f6]/30 text-[#60a5fa]">
                        {doc.external_id}
                      </span>
                      <span className="text-[11px] font-mono text-[#757780]">{doc.source_type}</span>
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-white group-hover:text-[#38bdf8] transition-colors">
                      {doc.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed line-clamp-3">
                      {doc.content}
                    </p>
                  </div>

                  <div className="relative z-10 pt-3 border-t border-white/[0.06] flex items-center justify-between font-mono text-[11px] text-[#757780]">
                    <span>Vector Embedding: Verified</span>
                    <span className="text-[#38bdf8] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      <span>Inspect Rule</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
