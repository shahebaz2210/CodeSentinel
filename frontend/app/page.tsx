'use client';

import React from 'react';
import Link from 'next/link';
import {
  Shield,
  ArrowRight,
  Github,
  CheckCircle2,
  AlertOctagon,
  FileCode,
  Activity,
  GitPullRequest,
  Lock,
  BrainCircuit,
  Terminal,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SeverityBadge } from '@/components/ui/severity-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { RiskScore } from '@/components/ui/risk-score';

export default function LandingPage() {
  const workflowSteps = [
    { title: 'CODE', desc: 'Pull requests & commits' },
    { title: 'DETECTION', desc: 'Semgrep AST & Gitleaks' },
    { title: 'CONTEXT', desc: 'Function & import reachability' },
    { title: 'INTELLIGENCE', desc: 'OWASP & CWE RAG' },
    { title: 'RISK', desc: 'Multi-dimensional 0-100 score' },
    { title: 'POLICY', desc: 'Automated CI/CD PR check' },
    { title: 'FIX', desc: 'Actionable developer remediation' },
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-accent/30 selection:text-white">
      {/* Navigation Header */}
      <header className="h-16 border-b border-border/80 bg-surface/50 backdrop-blur sticky top-0 z-50 px-6">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-text-primary">CodeSentinel</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-elevated border border-border text-text-muted">
              DEVSECOPS
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-xs font-mono text-text-secondary hover:text-text-primary">
              Live Console
            </Link>
            <Link href="/login">
              <Button variant="primary" size="sm" className="gap-1.5 text-xs font-semibold">
                <Github className="w-3.5 h-3.5" />
                <span>Connect GitHub</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-mono">
          <Shield className="w-3.5 h-3.5" />
          <span>Deterministic AST Detection + Security Intelligence RAG</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-text-primary">
          Context-aware security for every pull request.
        </h1>

        <p className="text-base text-text-secondary max-w-2xl mx-auto leading-relaxed">
          CodeSentinel combines deterministic security scanners, repository context, and security intelligence to help teams detect, prioritize, and fix vulnerabilities before they reach production.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/login">
            <Button variant="primary" size="lg" className="gap-2 text-sm font-semibold">
              <Github className="w-4 h-4" />
              <span>Connect GitHub</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="secondary" size="lg" className="text-sm">
              Explore Live Console
            </Button>
          </Link>
        </div>
      </section>

      {/* Visual Pipeline Section: CODE -> DETECTION -> CONTEXT -> INTELLIGENCE -> RISK -> POLICY -> FIX */}
      <section className="py-12 border-y border-border/70 bg-surface/30 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-mono uppercase tracking-widest text-text-muted">The Security Pipeline</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {workflowSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-surface border border-border flex flex-col justify-between space-y-2 hover:border-accent/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-accent font-bold">0{idx + 1}</span>
                  <ArrowRight className="w-3 h-3 text-text-muted" />
                </div>
                <div>
                  <h3 className="text-xs font-mono font-bold text-text-primary">{step.title}</h3>
                  <p className="text-[11px] text-text-muted mt-1 leading-snug">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Realistic Product UI Previews */}
      <section className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-text-primary">Decision-Ready Security Intelligence</h2>
          <p className="text-xs text-text-muted max-w-xl mx-auto">
            Engineered for developers and security architects. No noise, no false AI hallucinations.
          </p>
        </div>

        {/* Product Preview Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: PR Security Check */}
          <div className="p-6 rounded-xl bg-surface border border-border space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-accent" />
                <span className="text-xs font-mono font-bold text-text-primary">PR #184 Security Check</span>
              </div>
              <StatusBadge status="FAIL" />
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded bg-severity-critical/10 border border-severity-critical/30 space-y-1 text-severity-critical">
                <div className="flex items-center justify-between font-bold">
                  <span>CRITICAL: Hardcoded API Secret Detected</span>
                  <RiskScore score={95} size="sm" showLabel={false} />
                </div>
                <p className="text-[11px] opacity-90">config/stripe.py:42 — Stripe Live Secret Key exposed in diff</p>
              </div>

              <div className="p-3 rounded bg-severity-high/10 border border-severity-high/30 space-y-1 text-severity-high">
                <div className="flex items-center justify-between font-bold">
                  <span>HIGH: SQL Injection via Dynamic F-String</span>
                  <RiskScore score={88} size="sm" showLabel={false} />
                </div>
                <p className="text-[11px] opacity-90">src/api/orders.py:81 — Raw string formatting in execute()</p>
              </div>
            </div>
          </div>

          {/* Card 2: Split-Pane Investigation & Remediation */}
          <div className="p-6 rounded-xl bg-surface border border-border space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-accent" />
                <span className="text-xs font-mono font-bold text-text-primary">OWASP / CWE RAG Reasoning</span>
              </div>
              <span className="text-[10px] font-mono text-accent">CONFIDENCE: 95%</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded bg-surface-elevated border border-border space-y-1">
                <span className="text-[10px] font-mono uppercase text-accent font-bold">What Was Detected</span>
                <p className="text-text-secondary leading-relaxed">
                  CWE-89: Direct interpolation of user parameter into SQL query bypassing ORM parameterization.
                </p>
              </div>

              <div className="p-3 rounded bg-surface-elevated border border-border space-y-1">
                <span className="text-[10px] font-mono uppercase text-status-pass font-bold">Exact Remediation Fix</span>
                <pre className="text-text-primary bg-[#07090c] p-2 rounded border border-border font-mono text-[11px]">
                  {`# Secure Parameterized Query\ncursor.execute("SELECT * FROM orders WHERE id = %s", (order_id,))`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-surface/40 text-center text-xs font-mono text-text-muted">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" />
            <span className="text-text-primary font-bold">CodeSentinel Platform</span>
          </div>
          <span>Context-Aware Security Intelligence for Modern DevSecOps</span>
        </div>
      </footer>
    </div>
  );
}
