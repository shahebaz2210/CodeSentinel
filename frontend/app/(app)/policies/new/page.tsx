'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, ShieldAlert, CheckCircle2, Scale, Lock, Sparkles } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

export default function PolicyBuilderPage() {
  const router = useRouter();
  const [name, setName] = useState('Standard Production Security Gate');
  const [description, setDescription] = useState('Enforces blocking of exposed secrets and Critical/High CVEs.');
  const [blockCritical, setBlockCritical] = useState(true);
  const [blockSecrets, setBlockSecrets] = useState(true);
  const [severityThreshold, setSeverityThreshold] = useState('HIGH');
  const [confidenceThreshold, setConfidenceThreshold] = useState('MEDIUM');
  const [allowExceptions, setAllowExceptions] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.policies.create({
        organization_id: 'default-org',
        name,
        description,
        enabled: true,
        configuration: {
          block_critical: blockCritical,
          block_high_with_high_confidence: true,
          block_secrets: blockSecrets,
          severity_threshold: severityThreshold,
          confidence_threshold: confidenceThreshold,
          allow_approved_exceptions: allowExceptions,
          require_exception_expiry: true,
          max_exception_days: 90,
          scope_repositories: [],
        },
      });
      router.push('/policies');
    } catch (err: any) {
      alert(`Failed to save policy: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl font-sans text-[#f1f5f9]">
        {/* Back Link */}
        <Link
          href="/policies"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#757780] hover:text-[#3b82f6] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Policies</span>
        </Link>

        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/15 border border-[#3b82f6]/30 flex items-center justify-center text-[#3b82f6]">
              <Scale className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Policy Builder</h1>
          </div>
          <p className="text-xs text-[#94a3b8] mt-1">
            Configure automated merge blocking rules and confidence thresholds for connected repositories.
          </p>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Configuration Column (7 cols) - Top-Left Glow */}
          <div className="lg:col-span-7 space-y-5 p-6 sm:p-8 rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8)] relative overflow-hidden hover:border-white/[0.22] transition-all">
            {/* Ambient Glow in Top-Left Corner */}
            <div className="absolute -top-16 -left-16 w-[360px] h-[360px] bg-gradient-to-br from-[#38bdf8]/20 via-[#3b82f6]/10 to-transparent blur-[75px] pointer-events-none" />

            <div className="relative z-10 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold uppercase text-white">Policy Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Production Release Gate"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold uppercase text-white">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full text-xs font-mono p-3 rounded-xl bg-black/60 border border-white/[0.1] text-white focus:outline-none focus:border-[#3b82f6] transition-colors"
                />
              </div>

              {/* Threshold Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold uppercase text-[#94a3b8]">Severity Threshold</label>
                  <select
                    value={severityThreshold}
                    onChange={(e) => setSeverityThreshold(e.target.value)}
                    className="w-full h-10 px-3 text-xs font-mono bg-black/60 border border-white/[0.1] rounded-xl text-white outline-none focus:border-[#3b82f6] cursor-pointer"
                  >
                    <option value="CRITICAL">Critical Only</option>
                    <option value="HIGH">High and Above</option>
                    <option value="MEDIUM">Medium and Above</option>
                    <option value="LOW">Low and Above</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold uppercase text-[#94a3b8]">Confidence Threshold</label>
                  <select
                    value={confidenceThreshold}
                    onChange={(e) => setConfidenceThreshold(e.target.value)}
                    className="w-full h-10 px-3 text-xs font-mono bg-black/60 border border-white/[0.1] rounded-xl text-white outline-none focus:border-[#3b82f6] cursor-pointer"
                  >
                    <option value="HIGH">High (90%+ only)</option>
                    <option value="MEDIUM">Medium (70%+)</option>
                    <option value="LOW">Low (All detections)</option>
                  </select>
                </div>
              </div>

              {/* Toggle Switches */}
              <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                <label className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] cursor-pointer hover:bg-white/[0.04] transition-colors">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">Block on Critical Vulnerabilities</span>
                    <span className="text-[11px] text-[#757780]">Prevent PR merges if any Critical severity vulnerability is open.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={blockCritical}
                    onChange={(e) => setBlockCritical(e.target.checked)}
                    className="w-4 h-4 rounded text-[#38bdf8] focus:ring-0 cursor-pointer accent-[#3b82f6]"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] cursor-pointer hover:bg-white/[0.04] transition-colors">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">Block on Exposed Secrets (Gitleaks)</span>
                    <span className="text-[11px] text-[#757780]">Always block merges on detected API keys, passwords, and tokens.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={blockSecrets}
                    onChange={(e) => setBlockSecrets(e.target.checked)}
                    className="w-4 h-4 rounded text-[#38bdf8] focus:ring-0 cursor-pointer accent-[#3b82f6]"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] cursor-pointer hover:bg-white/[0.04] transition-colors">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">Allow Approved Exceptions</span>
                    <span className="text-[11px] text-[#757780]">Allow security admins to bypass gate with auditable justification.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowExceptions}
                    onChange={(e) => setAllowExceptions(e.target.checked)}
                    className="w-4 h-4 rounded text-[#38bdf8] focus:ring-0 cursor-pointer accent-[#3b82f6]"
                  />
                </label>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" size="md" loading={saving} className="w-full justify-center gap-2 font-semibold">
                  <Save className="w-4 h-4" />
                  <span>Save and Activate Policy</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Policy Preview (5 cols) - Bottom-Right Glow */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 sm:p-8 rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8)] space-y-4 relative overflow-hidden hover:border-white/[0.22] transition-all">
              {/* Ambient Glow in Bottom-Right Corner */}
              <div className="absolute -bottom-16 -right-16 w-[340px] h-[340px] bg-gradient-to-tl from-[#8b5cf6]/20 via-[#a855f7]/10 to-transparent blur-[75px] pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-[#a78bfa]" />
                  <span>Active Policy Preview</span>
                </div>

                <div className="space-y-3 font-mono text-xs text-[#94a3b8]">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1">
                    <span className="text-[#757780] text-[10px] uppercase block">Rule Identifier</span>
                    <span className="text-white font-bold text-sm">{name || 'Unnamed Policy'}</span>
                  </div>

                  <div className="space-y-2.5 pt-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#757780]">Severity Gate:</span>
                      <span className="text-[#38bdf8] font-bold">{severityThreshold}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#757780]">Block Critical:</span>
                      <span className={blockCritical ? 'text-[#ef4444] font-bold' : 'text-[#757780]'}>
                        {blockCritical ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#757780]">Block Secrets:</span>
                      <span className={blockSecrets ? 'text-[#ef4444] font-bold' : 'text-[#757780]'}>
                        {blockSecrets ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#757780]">Confidence Gate:</span>
                      <span className="text-[#22c55e] font-bold">{confidenceThreshold}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
