'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Github,
  ArrowRight,
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
  GitBranch,
  GitCommit,
  Clock,
  Radio,
  Sliders,
  CheckCheck,
  ArrowDown,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [copiedToken, setCopiedToken] = useState(false);
  const [simulatedPRFixed, setSimulatedPRFixed] = useState(false);
  const [scanStepRunning, setScanStepRunning] = useState(false);
  const [scanProgress, setScanProgress] = useState(100);

  // Typewriter animation state for the navbar link
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fullText = 'How it works';
    const typingSpeed = isDeleting ? 40 : 80;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setTypedText(fullText.substring(0, typedText.length + 1));
        if (typedText.length + 1 === fullText.length) {
          setTimeout(() => setIsDeleting(true), 2500);
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

  const handleCopySample = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleSimulateScan = () => {
    if (scanStepRunning) return;
    setScanStepRunning(true);
    setScanProgress(15);
    const intv = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(intv);
          setScanStepRunning(false);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  const steps = [
    {
      step: 1,
      title: 'Connect with GitHub & Authorize',
      subtitle: 'OAuth 2.0 Integration & Secure Webhook Handshake',
      badge: 'Step 01',
      badgeColor: 'from-[#3b82f6]/20 to-[#60a5fa]/10 text-[#60a5fa] border-[#3b82f6]/30',
      icon: Github,
    },
    {
      step: 2,
      title: 'Sync Repositories & Map Baselines',
      subtitle: 'Automated Dependency Graphs & AST Inventory',
      badge: 'Step 02',
      badgeColor: 'from-[#10b981]/20 to-[#34d399]/10 text-[#34d399] border-[#10b981]/30',
      icon: FolderGit2,
    },
    {
      step: 3,
      title: 'Deterministic Code & Secrets Scanners',
      subtitle: 'Semgrep AST Engine & Gitleaks Regex/Entropy Detection',
      badge: 'Step 03',
      badgeColor: 'from-[#f59e0b]/20 to-[#fbbf24]/10 text-[#fbbf24] border-[#f59e0b]/30',
      icon: Scan,
    },
    {
      step: 4,
      title: 'Gemini AI Context & Reachability Analysis',
      subtitle: 'RAG Knowledge Synthesis & Exploitability Vectoring',
      badge: 'Step 04',
      badgeColor: 'from-[#8b5cf6]/20 to-[#c084fc]/10 text-[#c084fc] border-[#8b5cf6]/30',
      icon: BrainCircuit,
    },
    {
      step: 5,
      title: 'Automated Pull Request Security Gates',
      subtitle: 'GitHub Check Runs, Inline Diff Comments & Merge Blocking',
      badge: 'Step 05',
      badgeColor: 'from-[#ef4444]/20 to-[#f87171]/10 text-[#f87171] border-[#ef4444]/30',
      icon: GitPullRequest,
    },
    {
      step: 6,
      title: 'Continuous Governance & 1-Click Fixes',
      subtitle: 'Automated Remediation Diffs & Immutable Audit Trails',
      badge: 'Step 06',
      badgeColor: 'from-[#06b6d4]/20 to-[#38bdf8]/10 text-[#38bdf8] border-[#06b6d4]/30',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-[#f1f5f9] font-sans antialiased overflow-x-hidden relative selection:bg-[#3b82f6]/30">
      {/* ------------------------------------------------------------- */}
      {/* GLOBAL AMBIENT GLOWING BACKGROUND GRADIENTS (GLASSMORPHISM)  */}
      {/* ------------------------------------------------------------- */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-[#10b981]/25 via-[#059669]/15 to-transparent blur-[140px]" />
        <div className="absolute -top-28 -right-28 w-[800px] h-[800px] rounded-full bg-gradient-to-bl from-[#3b82f6]/30 via-[#6366f1]/20 to-[#8b5cf6]/15 blur-[150px]" />
        <div className="absolute top-[40%] -left-20 w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-[#06b6d4]/15 via-[#3b82f6]/15 to-transparent blur-[140px]" />
        <div className="absolute top-[65%] -right-20 w-[700px] h-[700px] rounded-full bg-gradient-to-bl from-[#d16900]/15 via-[#f97316]/10 to-transparent blur-[150px]" />
        <div className="absolute bottom-10 left-1/4 w-[900px] h-[750px] rounded-full bg-gradient-to-tr from-[#8b5cf6]/15 via-[#3b82f6]/15 to-[#10b981]/10 blur-[160px]" />
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
                <path d="M16 28C16 28 22 28 22 22C22 16 16 16 16 16C16 16 22 16 28 16Z" fill="white" />
                <path d="M4 16C4 16 4 22 10 22C16 22 16 16 16 16C16 16 10 16 4 16Z" fill="white" />
              </svg>
            </div>
            <span className="font-bold text-sm tracking-tight text-white group-hover:text-[#38bdf8] transition-colors">
              CodeSentinel
            </span>
          </Link>

          {/* Centered Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-[#94a3b8]">
            <Link href="/#features" className="hover:text-white transition-colors">Product</Link>
            <Link href="/intelligence" className="hover:text-white transition-colors">Docs</Link>
            <Link href="/#trust" className="hover:text-white transition-colors">Pricing</Link>
            <span className="text-[#38bdf8] font-bold flex items-center gap-1">
              <span>{typedText || 'How it works'}</span>
              <span className="inline-block w-1 h-3 bg-[#38bdf8] animate-pulse" />
            </span>
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
      {/* 2. HERO INTRO HEADER                                          */}
      {/* ------------------------------------------------------------- */}
      <section className="pt-28 pb-12 px-6 max-w-5xl mx-auto text-center space-y-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] backdrop-blur-xl border border-white/[0.12] text-xs font-mono text-[#94a3b8] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_20px_rgba(0,0,0,0.3)]">
          <span className="w-2 h-2 rounded-full bg-[#3b82f6] animate-pulse shadow-[0_0_8px_#3b82f6]"></span>
          <span className="text-[#f1f5f9] font-medium">End-to-End Security Lifecycle</span>
          <span className="text-[#64748b]">•</span>
          <span className="text-[#60a5fa]">6 Core Stages</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          How <span className="bg-gradient-to-r from-[#38bdf8] via-[#818cf8] to-[#34d399] bg-clip-text text-transparent">CodeSentinel</span> Works
        </h1>

        <p className="text-sm sm:text-base text-[#94a3b8] max-w-2xl mx-auto leading-relaxed">
          From the instant you connect your GitHub repository to continuous AST code scanning, Gemini AI contextual risk synthesis, and automated PR merge blocking.
        </p>

        {/* Step Navigation Pill Strip */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
          {steps.map((s) => (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-2 border ${
                activeStep === s.step
                  ? 'bg-[#181d24] text-white border-[#3b82f6]/60 shadow-[0_0_16px_rgba(59,130,246,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] font-bold'
                  : 'bg-white/[0.02] text-[#757780] border-white/[0.06] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${activeStep === s.step ? 'bg-[#3b82f6]' : 'bg-[#757780]'}`} />
              <span>{s.badge}: {s.title.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. STEP-BY-STEP INTERACTIVE WORKFLOW DEEP DIVE                 */}
      {/* ------------------------------------------------------------- */}
      <section className="px-6 max-w-6xl mx-auto pb-24 space-y-16">

        {/* ============================================================= */}
        {/* STAGE 1: CONNECT WITH GITHUB & AUTHORIZE                      */}
        {/* ============================================================= */}
        <div
          id="step-1"
          onClick={() => setActiveStep(1)}
          className={`p-8 rounded-3xl bg-black/75 backdrop-blur-2xl border transition-all relative overflow-hidden ${
            activeStep === 1
              ? 'border-[#3b82f6]/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8),0_0_30px_rgba(59,130,246,0.2)]'
              : 'border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_20px_50px_rgba(0,0,0,0.8)] hover:border-white/[0.22]'
          }`}
        >
          {/* Ambient Glow in Top-Left Corner */}
          <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-gradient-to-br from-[#38bdf8]/25 via-[#3b82f6]/15 to-transparent blur-[85px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Narrative (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/30 text-xs font-mono font-bold text-[#60a5fa]">
                <Github className="w-3.5 h-3.5" />
                <span>STEP 01: AUTHORIZATION & SETUP</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                1-Click GitHub OAuth & Webhook Handshake
              </h2>

              <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
                Connect your organization with zero manual SSH configuration. CodeSentinel requests read-only repository access and registers encrypted webhook endpoints to listen for real-time pull request and push events.
              </p>

              <div className="space-y-2.5 pt-2 text-xs font-mono text-[#cbd5e1]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                  <span>Scoped Read-Only Repository & PR access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                  <span>HMAC-SHA256 Webhook signature validation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                  <span>Automated GitHub App installation token rotation</span>
                </div>
              </div>
            </div>

            {/* Right Visualizer: Interactive OAuth Card (7 cols) */}
            <div className="lg:col-span-7">
              <div className="p-6 rounded-2xl bg-[#0a0d13]/80 backdrop-blur-xl border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_40px_rgba(0,0,0,0.6)] space-y-5">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white">
                      <Github className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">Authorize CodeSentinel Security</span>
                      <span className="text-[11px] font-mono text-[#757780]">github.com/login/oauth/authorize</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#22c55e]">
                    VERIFIED APP
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs text-[#94a3b8]">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                    <span>Organization Webhook:</span>
                    <span className="text-[#38bdf8] font-bold">http://api.codesentinel.io/v1/webhooks</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                    <span>Requested Permissions:</span>
                    <span className="text-[#a78bfa] font-bold">Checks: Write, Contents: Read, Pulls: Read</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Link href="/login">
                    <Button variant="primary" size="sm" className="gap-2">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Authorize with GitHub</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================= */}
        {/* STAGE 2: SYNC REPOSITORIES & MAP BASELINES                   */}
        {/* ============================================================= */}
        <div
          id="step-2"
          onClick={() => setActiveStep(2)}
          className={`p-8 rounded-3xl bg-black/75 backdrop-blur-2xl border transition-all relative overflow-hidden ${
            activeStep === 2
              ? 'border-[#10b981]/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.2)]'
              : 'border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_20px_50px_rgba(0,0,0,0.8)] hover:border-white/[0.22]'
          }`}
        >
          {/* Ambient Glow in Top-Right Corner */}
          <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-gradient-to-bl from-[#10b981]/25 via-[#059669]/15 to-transparent blur-[85px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Narrative (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#10b981]/10 border border-[#10b981]/30 text-xs font-mono font-bold text-[#34d399]">
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>STEP 02: REPOSITORY BASELINE</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Repository Inventory & Call Graph Mapping
              </h2>

              <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
                CodeSentinel pulls the default branch (`main` / `master`) to build an AST index of functions, framework entry points, public API routes, and third-party manifests (`package.json`, `requirements.txt`, `pom.xml`).
              </p>

              <div className="space-y-2.5 pt-2 text-xs font-mono text-[#cbd5e1]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
                  <span>Automatic language detection (TypeScript, Python, Go, Java)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
                  <span>Deep Software Bill of Materials (SBOM) generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
                  <span>Public route exposure boundary classification</span>
                </div>
              </div>
            </div>

            {/* Right Visualizer: Repository Sync Tree (7 cols) */}
            <div className="lg:col-span-7">
              <div className="p-6 rounded-2xl bg-[#0a0d13]/80 backdrop-blur-xl border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_40px_rgba(0,0,0,0.6)] space-y-4">
                <div className="flex items-center justify-between font-mono text-xs border-b border-white/[0.08] pb-3 text-[#757780]">
                  <span>Connected Repositories (Auto-Sync)</span>
                  <span className="text-[#10b981] flex items-center gap-1">
                    <RotateCw className="w-3 h-3 animate-spin" />
                    <span>Real-time Telemetry</span>
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between font-mono text-xs">
                    <div className="flex items-center gap-3">
                      <FolderGit2 className="w-4 h-4 text-[#38bdf8]" />
                      <span className="font-bold text-white">auth-service</span>
                      <span className="px-2 py-0.5 text-[10px] rounded bg-[#3b82f6]/10 text-[#60a5fa] border border-[#3b82f6]/20">TypeScript</span>
                    </div>
                    <span className="text-[#22c55e] font-bold">100% Synced (1,482 files)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between font-mono text-xs">
                    <div className="flex items-center gap-3">
                      <FolderGit2 className="w-4 h-4 text-[#f59e0b]" />
                      <span className="font-bold text-white">billing-worker</span>
                      <span className="px-2 py-0.5 text-[10px] rounded bg-[#f59e0b]/10 text-[#fbbf24] border border-[#f59e0b]/20">Python</span>
                    </div>
                    <span className="text-[#22c55e] font-bold">100% Synced (842 files)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between font-mono text-xs">
                    <div className="flex items-center gap-3">
                      <FolderGit2 className="w-4 h-4 text-[#a855f7]" />
                      <span className="font-bold text-white">core-gateway</span>
                      <span className="px-2 py-0.5 text-[10px] rounded bg-[#a855f7]/10 text-[#c084fc] border border-[#a855f7]/20">Go / Rust</span>
                    </div>
                    <span className="text-[#22c55e] font-bold">100% Synced (3,210 files)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================= */}
        {/* STAGE 3: DETERMINISTIC SCANNERS (AST + GITLEAKS)              */}
        {/* ============================================================= */}
        <div
          id="step-3"
          onClick={() => setActiveStep(3)}
          className={`p-8 rounded-3xl bg-black/75 backdrop-blur-2xl border transition-all relative overflow-hidden ${
            activeStep === 3
              ? 'border-[#f59e0b]/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.2)]'
              : 'border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_20px_50px_rgba(0,0,0,0.8)] hover:border-white/[0.22]'
          }`}
        >
          {/* Ambient Glow in Bottom-Left Corner */}
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-gradient-to-tr from-[#f59e0b]/25 via-[#d97706]/15 to-transparent blur-[85px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Narrative (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-xs font-mono font-bold text-[#fbbf24]">
                <Scan className="w-3.5 h-3.5" />
                <span>STEP 03: DETERMINISTIC SCANNERS</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Semgrep AST Engine & Gitleaks Secrets Entropy
              </h2>

              <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
                CodeSentinel executes high-throughput AST pattern matching alongside Shannon-entropy regex rules to capture SQLi, XSS, SSRF, and exposed API keys across 150+ token formats (AWS, Stripe, GitHub, OpenAI).
              </p>

              <div className="space-y-2.5 pt-2 text-xs font-mono text-[#cbd5e1]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#f59e0b] shrink-0" />
                  <span>Sub-second AST code traversal without cloud latency</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#f59e0b] shrink-0" />
                  <span>Historical commit and branch entropy analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#f59e0b] shrink-0" />
                  <span>Automated finding fingerprint deduplication</span>
                </div>
              </div>
            </div>

            {/* Right Visualizer: Scanner Terminal with simulation trigger (7 cols) */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl bg-[#0b0f17]/90 backdrop-blur-xl border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_40px_rgba(0,0,0,0.6)] overflow-hidden">
                <div className="h-10 px-4 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                    <span className="ml-2 font-mono text-[11px] text-[#757780]">scanner_pipeline.log</span>
                  </div>
                  <button
                    onClick={handleSimulateScan}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-[#fbbf24] font-mono text-[11px] transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{scanStepRunning ? 'Scanning...' : 'Test Run Scan'}</span>
                  </button>
                </div>

                <div className="p-5 font-mono text-xs space-y-2.5 bg-black/40">
                  <div className="text-[#60a5fa]">[1/3] SEMGREP AST: Analyzing 4,281 files across AST patterns...</div>
                  <div className="text-[#34d399]">[2/3] GITLEAKS: Checked 82 regex rules & high-entropy strings...</div>
                  <div className="text-[#fbbf24] font-bold">
                    ! FINDING [CWE-798]: Hardcoded Live Secret Key found in src/config/stripe.py:18
                  </div>
                  <div className="text-[#f87171] font-bold">
                    ! FINDING [CWE-89]: Unsanitized SQL Query interpolation in src/db/users.py:44
                  </div>
                  <div className="text-[#22c55e] pt-2 border-t border-white/[0.08]">
                    ✓ Normalization Complete. 2 RAW findings passed to Gemini AI Reasoning.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================= */}
        {/* STAGE 4: GEMINI AI CONTEXT & REACHABILITY ANALYSIS            */}
        {/* ============================================================= */}
        <div
          id="step-4"
          onClick={() => setActiveStep(4)}
          className={`p-8 rounded-3xl bg-black/75 backdrop-blur-2xl border transition-all relative overflow-hidden ${
            activeStep === 4
              ? 'border-[#8b5cf6]/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8),0_0_30px_rgba(139,92,246,0.2)]'
              : 'border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_20px_50px_rgba(0,0,0,0.8)] hover:border-white/[0.22]'
          }`}
        >
          {/* Ambient Glow in Bottom-Right Corner */}
          <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-gradient-to-tl from-[#a855f7]/25 via-[#8b5cf6]/15 to-transparent blur-[85px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Narrative (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-xs font-mono font-bold text-[#c084fc]">
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>STEP 04: AI CONTEXT & REACHABILITY</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Gemini 2.0 Flash Security RAG Reasoning
              </h2>

              <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
                Raw scanners produce noisy false positives. CodeSentinel passes the surrounding AST code graph and OWASP/CWE embeddings to Gemini 2.0 Flash to calculate true exploitability and blast radius.
              </p>

              <div className="space-y-2.5 pt-2 text-xs font-mono text-[#cbd5e1]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#c084fc] shrink-0" />
                  <span>Public vs. internal VPC network exposure verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#c084fc] shrink-0" />
                  <span>Middleware authentication and input sanitizer validation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#c084fc] shrink-0" />
                  <span>Confidence scoring (0-100%) with uncertainty bounds</span>
                </div>
              </div>
            </div>

            {/* Right Visualizer: AI Reasoning Evaluation Card (7 cols) */}
            <div className="lg:col-span-7">
              <div className="p-6 rounded-2xl bg-gradient-to-b from-[#12151a]/90 to-[#181d24]/90 backdrop-blur-2xl border border-[#8b5cf6]/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_16px_40px_rgba(0,0,0,0.5)] space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-[#c084fc]" />
                    <span>Gemini Exploitability Synthesis</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 text-[#c084fc]">
                    RAG EMBEDDED
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-2 text-xs font-mono">
                  <div className="text-[#a78bfa] font-bold flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Reachability Verdict: PUBLIC ENTRY POINT DETECTED</span>
                  </div>
                  <p className="text-[#cbd5e1] leading-relaxed text-[11px]">
                    Function <code className="text-[#38bdf8]">getUserDetails(req)</code> is mapped directly to public endpoint <code className="text-[#38bdf8]">POST /api/v1/auth/user</code> with no parameterized sanitization middleware.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[#757780] block text-[10px]">RISK SCORE</span>
                    <span className="text-xl font-bold text-[#ef4444]">9.4 / 10.0</span>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[#757780] block text-[10px]">AI CONFIDENCE</span>
                    <span className="text-xl font-bold text-[#22c55e]">98% HIGH</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================= */}
        {/* STAGE 5: PULL REQUEST SCANS & MERGE GATES                     */}
        {/* ============================================================= */}
        <div
          id="step-5"
          onClick={() => setActiveStep(5)}
          className={`p-8 rounded-3xl bg-black/75 backdrop-blur-2xl border transition-all relative overflow-hidden ${
            activeStep === 5
              ? 'border-[#ef4444]/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8),0_0_30px_rgba(239,68,68,0.2)]'
              : 'border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_20px_50px_rgba(0,0,0,0.8)] hover:border-white/[0.22]'
          }`}
        >
          {/* Ambient Glow in Top-Right Corner */}
          <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-gradient-to-bl from-[#f43f5e]/25 via-[#ef4444]/15 to-transparent blur-[85px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Narrative (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/30 text-xs font-mono font-bold text-[#f87171]">
                <GitPullRequest className="w-3.5 h-3.5" />
                <span>STEP 05: PR GATES & CHECK RUNS</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Automated Pull Request Checks & Merge Blocking
              </h2>

              <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
                When developers open a pull request, CodeSentinel automatically reviews the exact unified diff. If policy-blocking CVEs or secrets are found, CodeSentinel posts GitHub Check status annotations and prevents merge.
              </p>

              <div className="space-y-2.5 pt-2 text-xs font-mono text-[#cbd5e1]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#ef4444] shrink-0" />
                  <span>Native GitHub Check Runs with detailed failure logs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#ef4444] shrink-0" />
                  <span>Inline line-by-line review comments with fix diffs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#ef4444] shrink-0" />
                  <span>Configurable policy thresholds (Critical vs. High vs. Secrets)</span>
                </div>
              </div>
            </div>

            {/* Right Visualizer: Interactive PR Review Card with Fix Toggle (7 cols) */}
            <div className="lg:col-span-7">
              <div className="p-6 rounded-2xl bg-[#0a0d13]/80 backdrop-blur-xl border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_40px_rgba(0,0,0,0.6)] space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 font-mono text-xs">
                  <div className="flex items-center gap-2 text-white">
                    <GitPullRequest className="w-4 h-4 text-[#f87171]" />
                    <span className="font-bold">PR #184: Add payment webhook handler</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    simulatedPRFixed
                      ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30'
                      : 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30'
                  }`}>
                    {simulatedPRFixed ? 'MERGE CHECKS PASSED' : 'MERGE BLOCKED'}
                  </span>
                </div>

                {/* Diff View Box */}
                <div className="rounded-xl bg-black/60 border border-white/[0.08] overflow-hidden font-mono text-xs">
                  <div className="px-3.5 py-2 bg-white/[0.03] border-b border-white/[0.06] text-[#757780] text-[11px] flex justify-between">
                    <span>src/config/stripe.ts:18</span>
                    <button
                      onClick={() => setSimulatedPRFixed(!simulatedPRFixed)}
                      className="text-[#38bdf8] hover:underline"
                    >
                      {simulatedPRFixed ? 'Undo Fix' : '⚡ 1-Click Apply AI Fix'}
                    </button>
                  </div>

                  <div className="p-4 space-y-1.5 leading-relaxed">
                    {!simulatedPRFixed ? (
                      <>
                        <div className="bg-[#ef4444]/15 text-[#fca5a5] px-2 py-1 rounded">
                          - const STRIPE_KEY = &quot;sk_live_51N2xY7KL90jXyz843Q&quot;; // Hardcoded secret
                        </div>
                        <div className="text-[#64748b] px-2 py-0.5">
                          + (CodeSentinel Policy: Exposed live secret key blocks merge)
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-[#22c55e]/15 text-[#86efac] px-2 py-1 rounded">
                          + const STRIPE_KEY = process.env.STRIPE_SECRET_KEY; // Loaded from secrets manager
                        </div>
                        <div className="text-[#22c55e] px-2 py-0.5 text-[11px]">
                          ✓ Verified: Environment variable extraction resolved CWE-798.
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================= */}
        {/* STAGE 6: GOVERNANCE & 1-CLICK REMEDIATION                     */}
        {/* ============================================================= */}
        <div
          id="step-6"
          onClick={() => setActiveStep(6)}
          className={`p-8 rounded-3xl bg-black/75 backdrop-blur-2xl border transition-all relative overflow-hidden ${
            activeStep === 6
              ? 'border-[#06b6d4]/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8),0_0_30px_rgba(6,182,212,0.2)]'
              : 'border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_20px_50px_rgba(0,0,0,0.8)] hover:border-white/[0.22]'
          }`}
        >
          {/* Ambient Glow in Bottom-Left Corner */}
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-gradient-to-tr from-[#06b6d4]/25 via-[#3b82f6]/15 to-transparent blur-[85px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Narrative (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#06b6d4]/10 border border-[#06b6d4]/30 text-xs font-mono font-bold text-[#38bdf8]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>STEP 06: GOVERNANCE & METRICS</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Continuous Governance & Organizational Risk Trajectory
              </h2>

              <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
                Security leads get executive visibility with live 30-Day Risk Trend telemetry, real-time repository filters, policy exception approvals, and immutable audit logs.
              </p>

              <div className="space-y-2.5 pt-2 text-xs font-mono text-[#cbd5e1]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#38bdf8] shrink-0" />
                  <span>Real-time Risk Score trending (0.0 to 10.0 scale)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#38bdf8] shrink-0" />
                  <span>Immutable audit logging of triage & policy changes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#38bdf8] shrink-0" />
                  <span>Automated pull request velocity without developer friction</span>
                </div>
              </div>
            </div>

            {/* Right Visualizer: Dashboard Telemetry Preview (7 cols) */}
            <div className="lg:col-span-7">
              <div className="p-6 rounded-2xl bg-[#0a0d13]/80 backdrop-blur-xl border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_40px_rgba(0,0,0,0.6)] space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <span className="text-xs font-mono font-bold text-white">Live Organization Metrics</span>
                  <Link href="/dashboard">
                    <span className="text-xs font-mono text-[#38bdf8] hover:underline flex items-center gap-1">
                      <span>Open Dashboard</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-3 font-mono text-center">
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[10px] text-[#757780] block">ORG RISK</span>
                    <span className="text-xl font-bold text-[#22c55e]">2.4 / 10</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[10px] text-[#757780] block">PR GATES</span>
                    <span className="text-xl font-bold text-white">99.4% PASS</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[10px] text-[#757780] block">TELEMETRY</span>
                    <span className="text-xl font-bold text-[#38bdf8]">5s SYNC</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. CALL TO ACTION SECTION (MATCHING OTHER GLASSMORPHIC DIVS)  */}
      {/* ------------------------------------------------------------- */}
      <section className="px-6 max-w-6xl mx-auto pb-24">
        <div className="p-8 sm:p-12 rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_24px_64px_rgba(0,0,0,0.8)] relative overflow-hidden transition-all hover:border-white/[0.22]">
          {/* Subtle Ambient Radial Glow inside Banner */}
          <div className="absolute -right-20 -bottom-20 w-[500px] h-[500px] bg-gradient-to-tr from-[#10b981]/15 via-[#3b82f6]/15 to-[#8b5cf6]/10 blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Narrative (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/30 text-xs font-mono font-bold text-[#22c55e]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>INSTANT ONBOARDING (60 SECONDS)</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Ready to secure your pull requests with zero friction?
              </h2>

              <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
                Connect your organization and run your first deterministic AST and Secrets scan in less than a minute. No agents to install, no cloud source retention.
              </p>

              <div className="space-y-2.5 pt-2 text-xs font-mono text-[#cbd5e1]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                  <span>1-Click GitHub App setup with read-only permissions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                  <span>Ephemeral RAM-only execution with zero code retention</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                  <span>Automated PR blocking with Gemini AI exploitability verdicts</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-3">
                <Link href="/login">
                  <Button variant="primary" size="md" className="gap-2 font-semibold">
                    <Github className="w-4 h-4" />
                    <span>Connect GitHub Organization</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="secondary" size="md" className="gap-2">
                    <Activity className="w-4 h-4 text-[#38bdf8]" />
                    <span>Explore Live Dashboard</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Visualizer: Interactive Quickstart Console (7 cols) */}
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
                    onClick={() => handleCopySample('npx @codesentinel/cli scan --all-repositories')}
                    className="p-1.5 rounded-md hover:bg-white/[0.06] text-[#757780] hover:text-white transition-colors shrink-0 ml-2"
                    title="Copy command"
                  >
                    {copiedToken ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
