'use client';

import React, { useState } from 'react';
import { Shield, Github, ArrowRight, Lock, CheckCircle2, Sparkles, Terminal, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGitHubLogin = async () => {
    setLoading(true);
    try {
      const res = await api.auth.getGitHubUrl();
      if (res && res.url) {
        window.location.href = res.url;
      } else {
        window.location.href = 'http://localhost:8000/api/v1/auth/github';
      }
    } catch {
      window.location.href = 'http://localhost:8000/api/v1/auth/github';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-[#f1f5f9] px-4 relative overflow-hidden font-sans selection:bg-[#3b82f6]/30">
      {/* Background Ambient Glow Gradients */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#3b82f6]/20 via-[#1d4ed8]/10 to-transparent blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[650px] h-[650px] rounded-full bg-gradient-to-tl from-[#10b981]/15 via-[#059669]/10 to-transparent blur-[150px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
      </div>

      {/* Floating High Glassmorphism Card */}
      <div className="w-full max-w-md rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] p-8 sm:p-10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8)] space-y-6 relative z-10 transition-all hover:border-white/[0.22] overflow-hidden">
        {/* Ambient Glow in Top-Right Corner */}
        <div className="absolute -top-16 -right-16 w-[320px] h-[320px] bg-gradient-to-bl from-[#3b82f6]/25 via-[#6366f1]/15 to-transparent blur-[75px] pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Brand Icon & Heading with New 4-Petal Geometric Logo */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.12] flex items-center justify-center text-white shadow-[0_0_24px_rgba(255,255,255,0.15)]">
              <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none">
                <path d="M16 4C16 4 10 4 10 10C10 16 16 16 16 16C16 16 16 10 16 4Z" fill="white" />
                <path d="M28 16C28 16 28 10 22 10C16 10 16 16 16 16C16 16 22 16 28 16Z" fill="white" />
                <path d="M16 28C16 28 22 28 22 22C22 16 16 16 16 16C16 16 16 22 16 28Z" fill="white" />
                <path d="M4 16C4 16 4 22 10 22C16 22 16 16 16 16C16 16 10 16 4 16Z" fill="white" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">CodeSentinel</h1>
              <p className="text-xs text-[#8b949e] mt-1 font-mono tracking-wide">Context-Aware Security Intelligence</p>
            </div>
          </div>

          {/* Value Callout Card */}
          <div className="p-4 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08] space-y-2 text-xs text-[#94a3b8] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Lock className="w-4 h-4 text-[#38bdf8]" />
              <span>Developer-First Security Gate</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#8b949e]">
              Connect your repository to run AST and Secrets scans, receive contextual AI assessments, and enforce PR policies before merging.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-1">
            <Button
              variant="primary"
              size="lg"
              className="w-full justify-center gap-2 text-sm font-semibold"
              onClick={handleGitHubLogin}
              loading={loading}
            >
              <Github className="w-4 h-4" />
              <span>Continue with GitHub</span>
              <ArrowRight className="w-4 h-4 ml-1 opacity-80" />
            </Button>

            <Button
              variant="secondary"
              size="lg"
              className="w-full justify-center gap-2 text-sm"
              onClick={() => { window.location.href = '/dashboard'; }}
            >
              <Activity className="w-4 h-4 text-[#38bdf8]" />
              <span>Enter Platform (Instant Access)</span>
            </Button>

            <p className="text-[11px] text-center text-[#757780] font-medium">
              Connect via GitHub OAuth for live repo sync, or enter directly for full platform access.
            </p>
          </div>

          {/* Key Features Monospace Tags */}
          <div className="border-t border-white/[0.08] pt-4 space-y-2 text-xs font-mono text-[#94a3b8]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
              <span>Deterministic Semgrep & Gitleaks detection</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>OWASP & CWE Security RAG reasoning</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#a78bfa]" />
              <span>Automated Pull Request security checks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
