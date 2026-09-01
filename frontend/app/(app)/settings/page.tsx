'use client';

import React, { useState } from 'react';
import { Sliders, Github, Key, Shield, User, Copy, Check } from 'lucide-react';
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
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-primary">Settings & Integrations</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Configure authentication providers, GitHub webhooks, and AI engine parameters
          </p>
        </div>

        <div className="space-y-6">
          {/* GitHub Integration Panel */}
          <div className="p-6 rounded-lg bg-surface border border-border space-y-4">
            <div className="flex items-center gap-2.5">
              <Github className="w-5 h-5 text-accent" />
              <h2 className="text-sm font-bold text-text-primary">GitHub Integration & Webhook</h2>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              CodeSentinel receives <code className="text-accent">pull_request</code> and <code className="text-accent">push</code> events to automatically trigger scans and report check runs.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold uppercase text-text-primary">
                Payload Webhook URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="w-full h-9 px-3 text-xs font-mono bg-surface-elevated border border-border rounded-md text-text-muted"
                />
                <Button variant="secondary" size="sm" onClick={handleCopyWebhook} className="gap-1 text-xs">
                  {copiedWebhook ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedWebhook ? 'Copied' : 'Copy'}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* AI Provider Config */}
          <div className="p-6 rounded-lg bg-surface border border-border space-y-4">
            <div className="flex items-center gap-2.5">
              <Key className="w-5 h-5 text-accent" />
              <h2 className="text-sm font-bold text-text-primary">AI Reasoning Engine</h2>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              CodeSentinel utilizes Google Gemini 2.0 Flash to synthesize scanner findings with surrounding source context.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-text-muted uppercase">Configured Model</label>
                <input
                  type="text"
                  readOnly
                  value="gemini-2.0-flash"
                  className="w-full h-9 px-3 text-xs font-mono bg-surface-elevated border border-border rounded-md text-text-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-text-muted uppercase">Embedding Model</label>
                <input
                  type="text"
                  readOnly
                  value="text-embedding-004"
                  className="w-full h-9 px-3 text-xs font-mono bg-surface-elevated border border-border rounded-md text-text-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
