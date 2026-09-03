'use client';

import React, { useState } from 'react';
import { Sliders, Github, Key, Shield, User, Copy, Check, Sparkles, Server, Zap } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const webhookUrl = 'http://localhost:8000/api/v1/webhooks/github';

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl font-sans text-[#f1f5f9]">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/15 border border-[#3b82f6]/30 flex items-center justify-center text-[#3b82f6] shadow-[0_0_16px_rgba(59,130,246,0.2)]">
              <Sliders className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Settings & Integrations</h1>
          </div>
          <p className="text-xs text-[#94a3b8] mt-1">
            Configure authentication providers, GitHub webhooks, and AI engine model parameters.
          </p>
        </div>

        <div className="space-y-6">
          {/* GitHub Integration Panel (High Glassmorphism with Top-Right Glow) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8)] space-y-4 relative overflow-hidden hover:border-white/[0.22] transition-all">
            {/* Ambient Glow in Top-Right Corner */}
            <div className="absolute -top-16 -right-16 w-[340px] h-[340px] bg-gradient-to-bl from-[#38bdf8]/20 via-[#3b82f6]/10 to-transparent blur-[75px] pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.1] flex items-center justify-center text-white">
                  <Github className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-white">GitHub Integration & Webhook</h2>
              </div>

              <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
                CodeSentinel receives <code className="text-[#38bdf8] bg-[#38bdf8]/10 px-1.5 py-0.5 rounded font-mono">pull_request</code> and <code className="text-[#38bdf8] bg-[#38bdf8]/10 px-1.5 py-0.5 rounded font-mono">push</code> webhook events to automatically trigger pipeline scans and report check runs.
              </p>

              <div className="space-y-2 pt-1">
                <label className="text-xs font-mono font-semibold uppercase text-[#757780]">
                  Payload Webhook URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={webhookUrl}
                    className="w-full h-10 px-3.5 text-xs font-mono bg-black/60 border border-white/[0.1] rounded-xl text-white outline-none focus:border-[#3b82f6]"
                  />
                  <Button variant="secondary" size="sm" onClick={handleCopyWebhook} className="gap-1.5 text-xs whitespace-nowrap h-10 px-4">
                    {copiedWebhook ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Copy className="w-3.5 h-3.5 text-[#757780]" />}
                    <span>{copiedWebhook ? 'Copied' : 'Copy URL'}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Provider Config Panel (High Glassmorphism with Bottom-Left Glow) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8)] space-y-4 relative overflow-hidden hover:border-white/[0.22] transition-all">
            {/* Ambient Glow in Bottom-Left Corner */}
            <div className="absolute -bottom-16 -left-16 w-[340px] h-[340px] bg-gradient-to-tr from-[#8b5cf6]/20 via-[#6366f1]/10 to-transparent blur-[75px] pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.1] flex items-center justify-center text-[#a78bfa]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-white">AI Reasoning Engine</h2>
              </div>

              <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
                CodeSentinel utilizes Google Gemini 2.0 Flash to synthesize scanner findings with surrounding source context.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#757780] uppercase">Configured Model</label>
                  <input
                    type="text"
                    readOnly
                    value="gemini-2.0-flash"
                    className="w-full h-10 px-3.5 text-xs font-mono bg-black/60 border border-white/[0.1] rounded-xl text-white font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#757780] uppercase">Embedding Model</label>
                  <input
                    type="text"
                    readOnly
                    value="text-embedding-004"
                    className="w-full h-10 px-3.5 text-xs font-mono bg-black/60 border border-white/[0.1] rounded-xl text-white font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
