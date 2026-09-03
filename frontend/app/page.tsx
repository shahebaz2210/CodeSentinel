'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  ArrowRight,
  Github,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  Activity,
  GitPullRequest,
  Lock,
  BrainCircuit,
  Terminal,
  Zap,
  FolderGit2,
  Scan,
  Network,
  Scale,
  UserCheck,
  Check,
  Copy,
  Play,
  RotateCw,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const [activePillar, setActivePillar] = useState<'repo' | 'scanners' | 'context' | 'risk' | 'policy' | 'developer'>('repo');
  const [copiedLog, setCopiedLog] = useState(false);
  const [simulatingScan, setSimulatingScan] = useState(false);
  const [activeLogLines, setActiveLogLines] = useState<number>(7);
  const [appliedFix, setAppliedFix] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);
  const [activeHeroTab, setActiveHeroTab] = useState<'scan' | 'pr' | 'ai'>('scan');
  const [heroPrFixed, setHeroPrFixed] = useState(false);

  // One-time typing transition for hero headline after landing
  const [heroTypedText, setHeroTypedText] = useState('');
  const [heroTypingComplete, setHeroTypingComplete] = useState(false);

  useEffect(() => {
    const fullText = 'Secure your software supply chain today.';
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setHeroTypedText(fullText.substring(0, i));
      if (i >= fullText.length) {
        clearInterval(interval);
        setHeroTypingComplete(true);
      }
    }, 38);

    return () => clearInterval(interval);
  }, []);

  // Typewriter animation state for the highlighted "How it works" button in navbar
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fullText = 'How it works';
    const typingSpeed = isDeleting ? 40 : 80;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setTypedText(fullText.substring(0, typedText.length + 1));
        if (typedText.length + 1 === fullText.length) {
          setTimeout(() => setIsDeleting(true), 2500); // Hold full text
        }
      } else {
        setTypedText(fullText.substring(0, typedText.length - 1));
        if (typedText.length === 1) {
          setIsDeleting(false);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [typedText, isDeleting]);

  // Pillar definitions matching the screenshot
  const pillars = [
    { id: 'repo', label: 'REPO', icon: FolderGit2, desc: 'Full repo baseline analysis & dependency mapping' },
    { id: 'scanners', label: 'SCANNERS', icon: Scan, desc: 'Semgrep AST & Gitleaks deterministic scanners' },
    { id: 'context', label: 'CONTEXT', icon: Network, desc: 'Reachability & execution path analysis' },
    { id: 'risk', label: 'RISK', icon: AlertTriangle, desc: 'Multi-dimensional 0-100 contextual risk score' },
    { id: 'policy', label: 'POLICY', icon: Scale, desc: 'CI/CD merge-blocking enforcement rules' },
    { id: 'developer', label: 'DEVELOPER', icon: UserCheck, desc: 'Actionable 1-click developer remediation' },
  ] as const;

  // Telemetry logs for REPO SCAN preview
  const telemetryLogs = [
    { text: 'Initializing scan for target/repo-main...', time: '0.02s', type: 'info' },
    { text: 'Analyzing 4,281 files across repository...', time: '1.45s', type: 'info' },
    { text: 'Building dependency graph (npm, pip, maven)...', time: '0.83s', type: 'info' },
    { text: 'Analyzing AST for structural patterns & dataflow...', time: '2.11s', type: 'info' },
    { text: 'High severity finding: Hardcoded AWS Key in src/config.ts', time: '0.12s', type: 'high' },
    { text: 'Medium severity finding: Outdated Express version', time: '0.04s', type: 'medium' },
    { text: 'Scan complete. 2 issues found.', time: '4.57s total', type: 'success' },
  ];

  // Simulation handler for the scan terminal
  const handleReRunScan = () => {
    if (simulatingScan) return;
    setSimulatingScan(true);
    setActiveLogLines(1);
    const interval = setInterval(() => {
      setActiveLogLines((prev) => {
        if (prev >= 7) {
          clearInterval(interval);
          setSimulatingScan(false);
          return 7;
        }
        return prev + 1;
      });
    }, 450);
  };

  const handleCopyLogs = () => {
    const text = telemetryLogs.map((l) => `${l.text} (${l.time})`).join('\n');
    navigator.clipboard?.writeText(text);
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-[#f1f5f9] selection:bg-[#22c55e]/30 selection:text-white font-sans antialiased overflow-x-hidden relative">
      {/* ------------------------------------------------------------- */}
      {/* GLOBAL AMBIENT GLOWING BACKGROUND GRADIENTS (HIGH GLASSMORPHISM) */}
      {/* ------------------------------------------------------------- */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Top-Left Vibrant Emerald / Mint Ambient Glow */}
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-[#10b981]/25 via-[#059669]/15 to-transparent blur-[130px]" />
        
        {/* Top-Right Cyber Blue / Royal Indigo Ambient Glow */}
        <div className="absolute -top-28 -right-28 w-[800px] h-[800px] rounded-full bg-gradient-to-bl from-[#3b82f6]/30 via-[#6366f1]/20 to-[#8b5cf6]/15 blur-[140px]" />
        
        {/* Mid Section Cyan & Emerald Cyber Radial Mesh */}
        <div className="absolute top-[32%] -left-20 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#06b6d4]/15 via-[#10b981]/10 to-transparent blur-[140px]" />
        <div className="absolute top-[48%] -right-20 w-[650px] h-[650px] rounded-full bg-gradient-to-bl from-[#6366f1]/20 via-[#3b82f6]/15 to-transparent blur-[140px]" />
        
        {/* Bottom Trust & Footer Violet / Purple Orb */}
        <div className="absolute bottom-10 left-1/4 w-[900px] h-[750px] rounded-full bg-gradient-to-tr from-[#8b5cf6]/15 via-[#3b82f6]/15 to-[#10b981]/10 blur-[160px]" />

        {/* Global High-Contrast Cyber Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. FLOATING PILL NAVBAR WITH NEW LOGO (HIGH GLASSMORPHISM)    */}
      {/* ------------------------------------------------------------- */}
      <header className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto h-14 rounded-full bg-black/80 backdrop-blur-2xl border border-white/[0.1] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_8px_32px_rgba(0,0,0,0.7)] px-4 sm:px-6 flex items-center justify-between">
          {/* Brand Logo with 4-Petal Geometric Shape */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-5 h-5 flex items-center justify-center">
              <svg viewBox="0 0 32 32" className="w-5 h-5 group-hover:scale-105 transition-transform" fill="none">
                {/* 4 organic geometric petals */}
                <path d="M16 4C16 4 10 4 10 10C10 16 16 16 16 16C16 16 16 10 16 4Z" fill="white" />
                <path d="M28 16C28 16 28 10 22 10C16 10 16 16 16 16C16 16 22 16 28 16Z" fill="white" />
                <path d="M16 28C16 28 22 28 22 22C22 16 16 16 16 16C16 16 16 22 16 28Z" fill="white" />
                <path d="M4 16C4 16 4 22 10 22C16 22 16 16 16 16C16 16 10 16 4 16Z" fill="white" />
              </svg>
            </div>
            <span className="font-bold text-sm tracking-tight text-white group-hover:text-[#38bdf8] transition-colors">
              CodeSentinel
            </span>
          </Link>

          {/* Centered Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-[#94a3b8]">
            <a href="#features" className="hover:text-white transition-colors">Product</a>
            <Link href="/intelligence" className="hover:text-white transition-colors">Docs</Link>
            <a href="#trust" className="hover:text-white transition-colors">Pricing</a>
            <Link
              href="/how-it-works"
              className="hover:text-white transition-colors flex items-center cursor-pointer text-[#94a3b8]"
            >
              <span>{typedText || 'How it works'}</span>
              <span className="inline-block w-1 h-3 ml-0.5 bg-[#94a3b8] animate-pulse" />
            </Link>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/login"
              className="text-xs font-medium text-[#94a3b8] hover:text-white transition-colors px-2 py-1 hidden sm:inline-block"
            >
              Sign in
            </Link>
            <Link href="/login">
              <button
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1e293b]/70 hover:bg-[#334155]/80 text-white border border-white/[0.12] hover:border-white/[0.25] text-xs font-medium backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_16px_rgba(0,0,0,0.3)] transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] cursor-pointer"
              >
                <Github className="w-3.5 h-3.5 text-[#cbd5e1]" />
                <span>Continue with GitHub</span>
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. HERO SECTION: FULL-VIEWPORT HEROIC CONTENT WITH 1-TIME TYPING */}
      {/* ------------------------------------------------------------- */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-6 max-w-7xl mx-auto overflow-hidden">
        {/* Subtle Cyber Shield Vector Graphic Overlay */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[700px] h-[700px] pointer-events-none select-none -z-10 flex items-center justify-center opacity-35">
          <svg viewBox="0 0 500 500" className="w-full h-full stroke-[#22c55e]/25" fill="none" strokeWidth="1.2">
            <path d="M 250,40 L 420,110 L 420,260 C 420,360 250,460 250,460 C 250,460 80,360 80,260 L 80,110 Z" className="stroke-[#22c55e]/30" />
            <path d="M 250,75 L 390,135 L 390,255 C 390,335 250,420 250,420 C 250,420 110,335 110,255 L 110,135 Z" strokeDasharray="6 6" className="stroke-white/10" />
          </svg>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center w-full my-auto">
          {/* Left Column: Left-Aligned Heroic Text */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/30 text-xs font-mono font-bold text-[#22c55e]">
              <ShieldCheck className="w-4 h-4" />
              <span>INSTANT ONBOARDING</span>
            </div>

            {/* Pure Solid White Headline with One-Time Typing Transition */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] text-white">
              <span>{heroTypedText || 'S'}</span>
              {!heroTypingComplete && (
                <span className="inline-block w-2 h-7 sm:h-9 ml-1 bg-[#22c55e] animate-pulse align-middle" />
              )}
            </h1>

            <p className="text-sm md:text-base text-[#94a3b8] leading-relaxed">
              Connect your GitHub repository in 60 seconds and run your first deterministic context-aware AST and Secrets scan.
            </p>

            {/* Feature Checkmarks */}
            <div className="space-y-3 pt-1 text-xs sm:text-sm font-mono text-[#cbd5e1]">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                <span>1-Click GitHub App setup with read-only permissions</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                <span>RAM-only ephemeral analysis with zero code retention</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                <span>Automated PR blocking with Gemini AI exploitability verdicts</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-4">
              <Link href="/login">
                <button
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold text-xs shadow-[0_0_24px_rgba(34,197,94,0.4)] hover:shadow-[0_0_36px_rgba(34,197,94,0.6)] transition-all cursor-pointer"
                >
                  <Github className="w-4 h-4 stroke-[2.5]" />
                  <span>Start Free with GitHub</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </Link>
              <Link href="/dashboard">
                <button
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.12] hover:border-white/[0.25] text-xs font-semibold backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>Explore Live Console</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Right Column: CodeSentinel CI/CD Engine Console (Deeply Interactive) */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8)] relative overflow-hidden transition-all hover:border-white/[0.22] space-y-5">
              {/* Ambient Radial Glow in Top-Right Corner */}
              <div className="absolute -top-24 -right-24 w-[420px] h-[420px] bg-gradient-to-bl from-[#3b82f6]/25 via-[#6366f1]/15 to-transparent blur-[90px] pointer-events-none" />

              <div className="relative z-10 space-y-5">
                {/* Header with Interactive Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
                  <div className="flex items-center gap-2 font-mono text-xs text-white">
                    <Terminal className="w-4 h-4 text-[#38bdf8]" />
                    <span className="font-bold">CodeSentinel CI/CD Engine</span>
                  </div>

                {/* Interactive Mode Tabs with Header-Matched Grey Glassmorphism */}
                <div className="flex items-center gap-1.5 p-1 rounded-lg bg-black/40 border border-white/[0.08] font-mono text-xs">
                  <button
                    onClick={() => setActiveHeroTab('scan')}
                    className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                      activeHeroTab === 'scan'
                        ? 'bg-[#1e293b]/90 text-white font-medium border border-white/[0.16] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_12px_rgba(0,0,0,0.4)]'
                        : 'text-[#94a3b8] hover:text-white border border-transparent hover:bg-white/[0.04]'
                    }`}
                  >
                    AST & Secrets
                  </button>
                  <button
                    onClick={() => setActiveHeroTab('pr')}
                    className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                      activeHeroTab === 'pr'
                        ? 'bg-[#1e293b]/90 text-white font-medium border border-white/[0.16] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_12px_rgba(0,0,0,0.4)]'
                        : 'text-[#94a3b8] hover:text-white border border-transparent hover:bg-white/[0.04]'
                    }`}
                  >
                    PR Gate #184
                  </button>
                  <button
                    onClick={() => setActiveHeroTab('ai')}
                    className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                      activeHeroTab === 'ai'
                        ? 'bg-[#1e293b]/90 text-white font-medium border border-white/[0.16] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_12px_rgba(0,0,0,0.4)]'
                        : 'text-[#94a3b8] hover:text-white border border-transparent hover:bg-white/[0.04]'
                    }`}
                  >
                    Gemini AI
                  </button>
                </div>
              </div>

              {/* 3 Core Project Metric Badges */}
              <div className="grid grid-cols-3 gap-3 font-mono text-center text-xs">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <span className="text-[10px] text-[#757780] block uppercase">SCAN ENGINE</span>
                  <span className="font-bold text-[#34d399]">Semgrep AST</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <span className="text-[10px] text-[#757780] block uppercase">AI REASONING</span>
                  <span className="font-bold text-[#60a5fa]">Gemini 2.0</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <span className="text-[10px] text-[#757780] block uppercase">SECRETS RULES</span>
                  <span className="font-bold text-[#a78bfa]">150+ Formats</span>
                </div>
              </div>

              {/* Dynamic Interactive Tab Content */}
              {activeHeroTab === 'scan' && (
                <div className="rounded-xl bg-black/60 border border-white/[0.08] p-4 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-[#757780] text-[11px] pb-1 border-b border-white/[0.06]">
                    <span>Target: target/repo-main (4,281 files)</span>
                    <span className="text-[#38bdf8] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
                      <span>Live Telemetry</span>
                    </span>
                  </div>
                  <div className="text-[#60a5fa]">[0.02s] Semgrep AST: Ingested AST abstract syntax tree</div>
                  <div className="text-[#34d399]">[1.15s] Gitleaks: 82 regex & Shannon entropy rules checked</div>
                  <div className="text-[#fbbf24] font-bold">
                    ! FINDING [CWE-798]: Hardcoded Stripe live secret in src/config/stripe.ts:18
                  </div>
                  <div className="text-[#ef4444] font-bold pt-1 border-t border-white/[0.06]">
                    🛡️ CI/CD Gating: Merge Blocked by Production Security Policy
                  </div>
                </div>
              )}

              {activeHeroTab === 'pr' && (
                <div className="rounded-xl bg-black/60 border border-white/[0.08] p-4 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-[#757780] text-[11px] pb-1 border-b border-white/[0.06]">
                    <span>PR #184: Add payment webhook handler</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      heroPrFixed
                        ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30'
                        : 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30'
                    }`}>
                      {heroPrFixed ? '✓ GATE PASSED' : '🚫 MERGE BLOCKED'}
                    </span>
                  </div>

                  <div className="space-y-1.5 leading-relaxed pt-1">
                    {!heroPrFixed ? (
                      <>
                        <div className="bg-[#ef4444]/15 text-[#fca5a5] px-2 py-1 rounded">
                          - const STRIPE_KEY = &quot;sk_live_51N2xY7KL90jXyz843Q&quot;; // Hardcoded secret
                        </div>
                        <div className="text-[#64748b] px-2 py-0.5 text-[11px]">
                          + (CodeSentinel Policy: Exposed live secret key blocks merge)
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-[#22c55e]/15 text-[#86efac] px-2 py-1 rounded">
                          + const STRIPE_KEY = process.env.STRIPE_SECRET_KEY; // Environment variable
                        </div>
                        <div className="text-[#22c55e] px-2 py-0.5 text-[11px]">
                          ✓ Verified: Environment variable extraction resolved CWE-798.
                        </div>
                      </>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setHeroPrFixed(!heroPrFixed)}
                      className="px-3 py-1 rounded bg-[#3b82f6]/20 hover:bg-[#3b82f6]/30 text-[#60a5fa] border border-[#3b82f6]/40 text-xs font-bold transition-all"
                    >
                      {heroPrFixed ? 'Undo Fix' : '⚡ 1-Click Apply AI Fix'}
                    </button>
                  </div>
                </div>
              )}

              {activeHeroTab === 'ai' && (
                <div className="rounded-xl bg-black/60 border border-white/[0.08] p-4 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-[#757780] text-[11px] pb-1 border-b border-white/[0.06]">
                    <span>Gemini 2.0 Flash Security RAG Synthesis</span>
                    <span className="text-[#a78bfa] font-bold">98% High Confidence</span>
                  </div>
                  <div className="text-[#c084fc] font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Reachability Verdict: PUBLIC ENTRY POINT DETECTED</span>
                  </div>
                  <p className="text-[#94a3b8] text-[11px] leading-relaxed">
                    Function <code className="text-[#38bdf8]">handleStripeWebhook(req)</code> is mapped directly to unauthenticated public route <code className="text-[#38bdf8]">POST /api/webhooks</code>.
                  </p>
                  <div className="text-[#ef4444] font-bold text-[11px] pt-1 border-t border-white/[0.06]">
                    Exploitability: CRITICAL • Blast Radius: HIGH (Production API Keys)
                  </div>
                </div>
              )}

              {/* Quickstart Command Snippet with 1-Click Copy */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.08] flex items-center justify-between font-mono text-xs text-[#cbd5e1]">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-[#10b981] font-bold">$</span>
                  <span className="truncate">npx @codesentinel/cli scan --all-repositories</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText('npx @codesentinel/cli scan --all-repositories');
                    setCopiedCli(true);
                    setTimeout(() => setCopiedCli(false), 2000);
                  }}
                  className="p-1.5 rounded-md hover:bg-white/[0.06] text-[#757780] hover:text-white transition-colors shrink-0 ml-2"
                  title="Copy command"
                >
                  {copiedCli ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. 6-PILLAR HORIZONTAL NAVIGATION BAR (GLASSMORPHIC STRIP)    */}
      {/* ------------------------------------------------------------- */}
      <section id="how-it-works" className="border-y border-white/[0.08] bg-black/90 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-3 sm:grid-cols-6 divide-x divide-white/[0.06] border-x border-white/[0.06]">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              const isActive = activePillar === pillar.id;
              return (
                <button
                  key={pillar.id}
                  onClick={() => setActivePillar(pillar.id)}
                  className={`py-6 px-4 flex flex-col items-center justify-center gap-3 transition-all relative group text-center ${
                    isActive
                      ? 'bg-gradient-to-b from-white/[0.08] to-transparent text-white backdrop-blur-xl'
                      : 'hover:bg-white/[0.03] text-[#8192a6] hover:text-white'
                  }`}
                >
                  {/* Active highlight top bar with neon glow */}
                  {isActive && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#22c55e] shadow-[0_0_12px_#22c55e]" />
                  )}

                  <div
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center backdrop-blur-md transition-all ${
                      isActive
                        ? 'border-[#22c55e]/60 bg-[#22c55e]/15 text-[#22c55e] shadow-[0_0_14px_rgba(34,197,94,0.3)]'
                        : 'border-white/[0.08] bg-white/[0.02] text-[#64748b] group-hover:border-white/[0.18] group-hover:text-[#94a3b8]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <span className="font-mono text-xs font-bold tracking-wider">
                    {pillar.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. DEEP DIVE FEATURE SHOWCASES (FROSTED GLASS PANELS)         */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 px-6 max-w-7xl mx-auto space-y-24">
        {/* ROW 1: REPO SCAN Deep Dive */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Copy & Checklist */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-4 h-[1px] bg-[#22c55e]"></span>
              <span className="text-xs font-mono font-bold tracking-widest text-[#94a3b8] uppercase">
                Repo Scan
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
              Comprehensive baseline analysis.
            </h2>

            <p className="text-sm text-[#94a3b8] leading-relaxed">
              We ingest your entire repository to map dependencies, configurations, and hardcoded secrets before a single PR is opened. This establishes the structural context needed to evaluate future changes.
            </p>

            <ul className="space-y-3 pt-2 text-sm text-[#cbd5e1]">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
                <span>Dependency graph resolution</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
                <span>Secrets entropy scanning</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
                <span>IaC configuration drift detection</span>
              </li>
            </ul>
          </div>

          {/* Right: Realistic Terminal Scan Window with High Glassmorphism */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8)] relative overflow-hidden transition-all hover:border-white/[0.22]">
              {/* Ambient Radial Glow in Top-Left Corner */}
              <div className="absolute -top-24 -left-24 w-[420px] h-[420px] bg-gradient-to-br from-[#10b981]/25 via-[#06b6d4]/15 to-transparent blur-[90px] pointer-events-none" />

              <div className="relative z-10">
                {/* Terminal Top Bar */}
                <div className="h-11 px-4 bg-white/[0.03] backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/80 shadow-[0_0_6px_rgba(239,68,68,0.4)]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#eab308]/80 shadow-[0_0_6px_rgba(234,179,8,0.4)]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]/80 shadow-[0_0_6px_rgba(34,197,94,0.4)]" />
                  <span className="ml-2 font-mono text-[11px] text-[#8b949e]">
                    target/repo-main — telemetry
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReRunScan}
                    disabled={simulatingScan}
                    className="p-1.5 text-[#8b949e] hover:text-[#22c55e] hover:bg-white/[0.06] transition-colors rounded-md"
                    title="Re-run telemetry simulation"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${simulatingScan ? 'animate-spin text-[#22c55e]' : ''}`} />
                  </button>
                  <button
                    onClick={handleCopyLogs}
                    className="p-1.5 text-[#8b949e] hover:text-white hover:bg-white/[0.06] transition-colors rounded-md"
                    title="Copy output"
                  >
                    {copiedLog ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Terminal Logs Content */}
              <div className="p-6 font-mono text-xs space-y-3.5 bg-black/40 backdrop-blur-md">
                {telemetryLogs.slice(0, activeLogLines).map((log, i) => (
                  <div
                    key={i}
                    className={`flex items-baseline justify-between gap-4 transition-opacity duration-300 ${
                      log.type === 'high'
                        ? 'text-[#f97316]'
                        : log.type === 'medium'
                        ? 'text-[#eab308]'
                        : log.type === 'success'
                        ? 'text-[#22c55e] font-semibold pt-2 border-t border-white/[0.08]'
                        : 'text-[#94a3b8]'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {log.type === 'high' && <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-pulse flex-shrink-0" />}
                      {log.type === 'medium' && <span className="w-1.5 h-1.5 rounded-full bg-[#eab308] flex-shrink-0" />}
                      {log.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e] flex-shrink-0" />}
                      <span className="truncate">{log.text}</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#6e7681] flex-shrink-0 text-right">
                      {log.time}
                    </span>
                  </div>
                ))}

                {simulatingScan && (
                  <div className="flex items-center gap-2 text-[11px] text-[#22c55e] animate-pulse">
                    <span className="inline-block w-1.5 h-3 bg-[#22c55e]" />
                    <span>Executing deterministic AST analysis passes...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* ROW 2: PR REVIEW Deep Dive with High Glassmorphism */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Pixel-Perfect GitHub PR Security Bot Comment Card */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8)] relative overflow-hidden transition-all hover:border-white/[0.22]">
              {/* Ambient Radial Glow in Bottom-Right Corner */}
              <div className="absolute -bottom-24 -right-24 w-[420px] h-[420px] bg-gradient-to-tl from-[#ef4444]/20 via-[#f97316]/15 to-transparent blur-[90px] pointer-events-none" />

              <div className="relative z-10">
                {/* GitHub Review Header */}
                <div className="px-5 py-3.5 bg-white/[0.03] backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded bg-[#22c55e]/20 border border-[#22c55e]/40 flex items-center justify-center text-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.3)]">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">codesentinel-bot</span>
                    <span className="text-[10px] font-mono text-[#8b949e]">commented on PR #184</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#ef4444]/20 border border-[#ef4444]/40 text-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.25)]">
                  POLICY: BLOCKED
                </span>
              </div>

              {/* Finding Details */}
              <div className="p-6 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ef4444]/20 border border-[#ef4444]/40 text-[#ef4444]">
                        CRITICAL
                      </span>
                      <span className="text-xs font-mono text-[#94a3b8]">CWE-89: SQL Injection</span>
                    </div>
                    <p className="text-sm font-semibold text-white">
                      Raw string interpolation in database query without parameterization
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-[#8b949e]">Risk Score</span>
                    <div className="text-base font-mono font-bold text-[#ef4444]">92/100</div>
                  </div>
                </div>

                {/* File Path & Reachability Vector */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <div className="px-2.5 py-1 rounded-lg bg-white/[0.04] backdrop-blur-md border border-white/[0.08] text-[#cbd5e1] flex items-center gap-1.5">
                    <FileCode2 className="w-3.5 h-3.5 text-[#8b949e]" />
                    <span>src/api/orders.py:81</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-[#22c55e]/10 backdrop-blur-md border border-[#22c55e]/30 text-[#22c55e] flex items-center gap-1.5 shadow-[0_0_10px_rgba(34,197,94,0.15)]">
                    <Zap className="w-3 h-3" />
                    <span>Reachable from public endpoint: POST /api/orders</span>
                  </div>
                </div>

                {/* Diff Comparison Box with Glassmorphism */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono text-[#8b949e] flex items-center justify-between">
                    <span>SUGGESTED REMEDIATION DIFF</span>
                    <span className="text-[#22c55e] text-[10px] font-semibold">OWASP TOP 10 (A03:2021)</span>
                  </div>
                  <div className="rounded-xl bg-black/50 backdrop-blur-md border border-white/[0.08] font-mono text-[11px] overflow-x-auto p-3.5 space-y-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                    <div className="text-[#ef4444] bg-[#ef4444]/15 rounded-md px-3 py-1.5 flex items-center gap-2 border border-[#ef4444]/20">
                      <span className="select-none text-[#ef4444]/70 font-bold">-</span>
                      <code>cursor.execute(f"SELECT * FROM orders WHERE id = &#123;order_id&#125;")</code>
                    </div>
                    <div className="text-[#22c55e] bg-[#22c55e]/15 rounded-md px-3 py-1.5 flex items-center gap-2 border border-[#22c55e]/20">
                      <span className="select-none text-[#22c55e]/70 font-bold">+</span>
                      <code>cursor.execute("SELECT * FROM orders WHERE id = %s", (order_id,))</code>
                    </div>
                  </div>
                </div>

                {/* Developer Remediation Action Bar */}
                <div className="pt-2 flex items-center justify-between border-t border-white/[0.08]">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setAppliedFix(true)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.3)] ${
                        appliedFix
                          ? 'bg-[#22c55e] text-black font-bold shadow-[0_0_16px_rgba(34,197,94,0.5)]'
                          : 'bg-[#22c55e]/20 text-[#22c55e] hover:bg-[#22c55e]/30 border border-[#22c55e]/40 hover:shadow-[0_0_16px_rgba(34,197,94,0.3)]'
                      }`}
                    >
                      {appliedFix ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Commit Pushed to Branch</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Apply 1-Click Fix</span>
                        </>
                      )}
                    </button>
                    <Link href="/intelligence">
                      <button className="px-3 py-1.5 rounded-lg text-xs text-[#8b949e] hover:text-white hover:bg-white/[0.04] transition-colors">
                        Explain Vulnerability
                      </button>
                    </Link>
                  </div>
                  <span className="text-[10px] font-mono text-[#8b949e]">Confidence: 95%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Right: Copy & Enforcement Box */}
          <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
            <div className="flex items-center gap-2">
              <span className="w-4 h-[1px] bg-[#22c55e]"></span>
              <span className="text-xs font-mono font-bold tracking-widest text-[#94a3b8] uppercase">
                PR Review
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
              Actionable feedback, in context.
            </h2>

            <p className="text-sm text-[#94a3b8] leading-relaxed">
              Findings are pushed directly to the PR as comments. We don't just point out the flaw, we show the execution path and suggest the specific code change required to fix it, referencing your internal secure coding guidelines.
            </p>

            {/* Block PRs on Critical Glassmorphic Card with Bottom-Left Glow */}
            <div className="p-6 rounded-2xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_16px_40px_rgba(0,0,0,0.7)] relative overflow-hidden flex items-start gap-4 hover:border-white/[0.22] transition-all">
              {/* Ambient Radial Glow in Bottom-Left Corner */}
              <div className="absolute -bottom-16 -left-16 w-[280px] h-[280px] bg-gradient-to-tr from-[#22c55e]/20 to-transparent blur-[70px] pointer-events-none" />

              <div className="relative z-10 flex items-start gap-4 w-full">
                <div className="w-10 h-10 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e] flex-shrink-0 mt-0.5 shadow-[0_0_12px_rgba(34,197,94,0.2)]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Block PRs on Critical</h4>
                  <p className="text-xs text-[#94a3b8] leading-relaxed">
                    Automated enforcement via GitHub Checks preventing merge until security sign-off.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. ENTERPRISE GRADE TRUST SECTION (3 FROSTED GLASS CARDS)     */}
      {/* ------------------------------------------------------------- */}
      <section id="trust" className="py-24 px-6 border-t border-white/[0.08] bg-black/50 backdrop-blur-xl relative overflow-hidden">
        {/* Local Ambient Glow Mesh behind Trust Cards */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[950px] h-[400px] bg-gradient-to-r from-[#22c55e]/18 via-[#38bdf8]/18 to-[#a855f7]/18 blur-[130px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          {/* Section Heading */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
              Enterprise Grade Trust
            </h2>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              Built for organizations where security is a prerequisite, not an afterthought.
            </p>
          </div>

          {/* 3 Trust Glassmorphic Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: SOC 2 (Top-Left Glow) */}
            <div className="p-8 rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden hover:border-[#22c55e]/50 hover:shadow-[0_0_36px_rgba(34,197,94,0.25)] transition-all flex flex-col justify-between group">
              {/* Ambient Radial Glow in Top-Left Corner */}
              <div className="absolute -top-16 -left-16 w-[300px] h-[300px] bg-gradient-to-br from-[#22c55e]/25 via-[#10b981]/15 to-transparent blur-[75px] pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="w-11 h-11 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e] group-hover:scale-105 transition-transform shadow-[0_0_16px_rgba(34,197,94,0.3)]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">SOC 2 Type II Compliant</h3>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  Our infrastructure and processes are independently audited to ensure the highest standards of security, availability, and confidentiality.
                </p>
              </div>
              <div className="relative z-10 pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-[#8b949e]">
                <span>Status: Verified</span>
                <span className="text-[#22c55e] font-semibold">Annual Audit</span>
              </div>
            </div>

            {/* Card 2: Zero Retention (Center-Bottom Glow) */}
            <div className="p-8 rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden hover:border-[#38bdf8]/50 hover:shadow-[0_0_36px_rgba(56,189,248,0.25)] transition-all flex flex-col justify-between group">
              {/* Ambient Radial Glow in Center-Bottom */}
              <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[320px] h-[320px] bg-gradient-to-t from-[#38bdf8]/25 via-[#60a5fa]/15 to-transparent blur-[75px] pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="w-11 h-11 rounded-xl bg-[#38bdf8]/15 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] group-hover:scale-105 transition-transform shadow-[0_0_16px_rgba(56,189,248,0.3)]">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Zero Source Retention</h3>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  We analyze your code in ephemeral environments. No source code is ever stored on our servers after the scan is complete.
                </p>
              </div>
              <div className="relative z-10 pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-[#8b949e]">
                <span>Execution: Ephemeral</span>
                <span className="text-[#38bdf8] font-semibold">RAM-Only</span>
              </div>
            </div>

            {/* Card 3: Granular RBAC (Top-Right Glow) */}
            <div className="p-8 rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden hover:border-[#a855f7]/50 hover:shadow-[0_0_36px_rgba(168,85,247,0.25)] transition-all flex flex-col justify-between group">
              {/* Ambient Radial Glow in Top-Right Corner */}
              <div className="absolute -top-16 -right-16 w-[300px] h-[300px] bg-gradient-to-bl from-[#a855f7]/25 via-[#8b5cf6]/15 to-transparent blur-[75px] pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="w-11 h-11 rounded-xl bg-[#a855f7]/15 border border-[#a855f7]/30 flex items-center justify-center text-[#a855f7] group-hover:scale-105 transition-transform shadow-[0_0_16px_rgba(168,85,247,0.3)]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Granular RBAC</h3>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  Integrate with your existing SAML/SSO provider to maintain strict, role-based access control over security policies and findings.
                </p>
              </div>
              <div className="relative z-10 pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-[#8b949e]">
                <span>Auth: SAML 2.0 / OIDC</span>
                <span className="text-[#a855f7] font-semibold">Okta & Azure AD</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. CALL TO ACTION SECTION (RICH 2-COLUMN GLASSMORPHISM)       */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8)] relative overflow-hidden transition-all hover:border-white/[0.2]">
          {/* Subtle Ambient Radial Glow inside Banner */}
          <div className="absolute -right-20 -bottom-20 w-[500px] h-[500px] bg-gradient-to-tr from-[#10b981]/15 via-[#3b82f6]/15 to-[#8b5cf6]/10 blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Column (5 cols) */}
            <div className="lg:col-span-5 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/30 text-xs font-mono font-bold text-[#22c55e]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>INSTANT ONBOARDING</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Secure your software supply chain today.
              </h2>

              <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
                Connect your GitHub repository in 60 seconds and run your first deterministic context-aware AST and Secrets scan.
              </p>

              <div className="space-y-2.5 pt-2 text-xs font-mono text-[#cbd5e1]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                  <span>1-Click GitHub App setup with read-only permissions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                  <span>RAM-only ephemeral analysis with zero code retention</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                  <span>Automated PR blocking with Gemini AI exploitability verdicts</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-3">
                <Link href="/login">
                  <button
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold text-xs shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] transition-all cursor-pointer"
                  >
                    <Github className="w-4 h-4 stroke-[2.5]" />
                    <span>Start Free with GitHub</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </Link>
                <Link href="/dashboard">
                  <button
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.12] hover:border-white/[0.25] text-xs font-semibold backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span>Explore Live Console</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Right Column Visualizer (7 cols) */}
            <div className="lg:col-span-7">
              <div className="p-6 rounded-2xl bg-[#0a0d13]/80 backdrop-blur-xl border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_40px_rgba(0,0,0,0.6)] space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2 font-mono text-xs text-white">
                    <Terminal className="w-4 h-4 text-[#38bdf8]" />
                    <span className="font-bold">CodeSentinel CI/CD Engine</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#22c55e]">
                    READY FOR DEPLOYMENT
                  </span>
                </div>

                {/* 3 Metric Badges */}
                <div className="grid grid-cols-3 gap-3 font-mono text-center text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                    <span className="text-[10px] text-[#757780] block">SCAN SPEED</span>
                    <span className="font-bold text-[#34d399]">&lt; 4.5s Total</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                    <span className="text-[10px] text-[#757780] block">AI ENGINE</span>
                    <span className="font-bold text-[#60a5fa]">Gemini 2.0</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                    <span className="text-[10px] text-[#757780] block">FALSE POSITIVES</span>
                    <span className="font-bold text-[#a78bfa]">&lt; 1% Noise</span>
                  </div>
                </div>

                {/* Quickstart Command Snippet */}
                <div className="p-3.5 rounded-xl bg-black/60 border border-white/[0.08] flex items-center justify-between font-mono text-xs text-[#cbd5e1]">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[#10b981]">$</span>
                    <span className="truncate">npx @codesentinel/cli scan --all-repositories</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText('npx @codesentinel/cli scan --all-repositories');
                      setCopiedCli(true);
                      setTimeout(() => setCopiedCli(false), 2000);
                    }}
                    className="p-1.5 rounded-md hover:bg-white/[0.06] text-[#757780] hover:text-white transition-colors shrink-0 ml-2"
                    title="Copy command"
                  >
                    {copiedCli ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 7. FOOTER (HIGH GLASSMORPHISM)                                */}
      {/* ------------------------------------------------------------- */}
      <footer className="border-t border-white/[0.08] bg-black/95 backdrop-blur-2xl py-10 px-6 text-xs text-[#8b949e]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Left: Brand with New 4-Petal Geometric Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 flex items-center justify-center">
              <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none">
                <path d="M16 4C16 4 10 4 10 10C10 16 16 16 16 16C16 16 16 10 16 4Z" fill="white" />
                <path d="M28 16C28 16 28 10 22 10C16 10 16 16 16 16C16 16 22 16 28 16Z" fill="white" />
                <path d="M16 28C16 28 22 28 22 22C22 16 16 16 16 16C16 16 22 16 28 16Z" fill="white" />
                <path d="M4 16C4 16 4 22 10 22C16 22 16 16 16 16C16 16 10 16 4 16Z" fill="white" />
              </svg>
            </div>
            <span className="font-bold text-white tracking-tight text-sm">CodeSentinel</span>
          </div>

          {/* Middle: Links */}
          <div className="flex items-center gap-6 font-medium">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Status</Link>
          </div>

          {/* Right: Copyright */}
          <div>
            <span>&copy; {new Date().getFullYear()} CodeSentinel Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
