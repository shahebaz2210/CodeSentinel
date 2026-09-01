'use client';

import React, { useState } from 'react';
import { Shield, Github, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      {/* Container Card */}
      <div className="w-full max-w-md bg-surface border border-border rounded-xl p-8 shadow-2xl space-y-6">
        {/* Brand Icon */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">CodeSentinel</h1>
            <p className="text-xs text-text-muted mt-1 font-mono">Context-Aware Security Intelligence</p>
          </div>
        </div>

        {/* Value Callout */}
        <div className="p-4 rounded-lg bg-surface-elevated/70 border border-border space-y-2 text-xs text-text-secondary">
          <div className="flex items-center gap-2 text-text-primary font-medium">
            <Lock className="w-3.5 h-3.5 text-accent" />
            <span>Developer-First Security Gate</span>
          </div>
          <p className="text-[11px] leading-relaxed text-text-muted">
            Connect your repository to run AST and Secrets scans, receive contextual AI assessments, and enforce PR policies before merging.
          </p>
        </div>

        {/* Primary CTA Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full justify-center gap-2 text-sm"
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
            <Shield className="w-4 h-4 text-accent" />
            <span>Enter Platform (Instant Access)</span>
          </Button>

          <p className="text-[11px] text-center text-text-muted">
            Connect via GitHub OAuth for live repo sync, or enter directly for full platform access.
          </p>
        </div>

        {/* Key Features Bullet List */}
        <div className="border-t border-border pt-4 space-y-2 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
            <span>Deterministic Semgrep & Gitleaks detection</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
            <span>OWASP & CWE Security RAG reasoning</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
            <span>Automated Pull Request security checks</span>
          </div>
        </div>
      </div>
    </div>
  );
}
