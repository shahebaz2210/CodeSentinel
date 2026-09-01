'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, ShieldAlert, CheckCircle2 } from 'lucide-react';
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
      <div className="space-y-6 max-w-4xl">
        <Link
          href="/policies"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Policies</span>
        </Link>

        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-primary">Policy Builder</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Configure automated security gating rules for all connected repositories
          </p>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Configuration Column */}
          <div className="lg:col-span-2 space-y-5 p-6 rounded-lg bg-surface border border-border">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold uppercase text-text-primary">Policy Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Production Release Gate"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold uppercase text-text-primary">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full text-xs font-mono p-3 rounded-md bg-surface-elevated border border-border text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {/* Threshold Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold uppercase text-text-primary">Severity Threshold</label>
                <select
                  value={severityThreshold}
                  onChange={(e) => setSeverityThreshold(e.target.value)}
                  className="w-full h-9 px-3 text-xs font-mono bg-surface-elevated border border-border rounded-md text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="CRITICAL">Block on Critical</option>
                  <option value="HIGH">Block on High or Critical</option>
                  <option value="MEDIUM">Block on Medium, High, Critical</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold uppercase text-text-primary">Confidence Threshold</label>
                <select
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(e.target.value)}
                  className="w-full h-9 px-3 text-xs font-mono bg-surface-elevated border border-border rounded-md text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="HIGH">High Confidence Only</option>
                  <option value="MEDIUM">Medium & High Confidence</option>
                  <option value="LOW">All Detections (Include Low)</option>
                </select>
              </div>
            </div>

            {/* Checkbox Gates */}
            <div className="space-y-3 pt-4 border-t border-border">
              <label className="flex items-center gap-2.5 text-xs text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={blockSecrets}
                  onChange={(e) => setBlockSecrets(e.target.checked)}
                  className="rounded bg-surface-elevated border-border text-accent focus:ring-accent"
                />
                <span>Always block PRs on detected hardcoded API keys & secrets (Gitleaks)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={blockCritical}
                  onChange={(e) => setBlockCritical(e.target.checked)}
                  className="rounded bg-surface-elevated border-border text-accent focus:ring-accent"
                />
                <span>Block pull requests on Critical CWE vulnerabilities (Semgrep)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowExceptions}
                  onChange={(e) => setAllowExceptions(e.target.checked)}
                  className="rounded bg-surface-elevated border-border text-accent focus:ring-accent"
                />
                <span>Allow approved exceptions with mandatory expiration timestamp</span>
              </label>
            </div>

            <div className="pt-4 border-t border-border">
              <Button type="submit" variant="primary" loading={saving} className="w-full gap-2 font-semibold">
                <Save className="w-4 h-4" />
                <span>Save Security Policy</span>
              </Button>
            </div>
          </div>

          {/* Live Preview Column */}
          <div className="p-6 rounded-lg bg-surface border border-border space-y-4 h-fit">
            <span className="text-xs font-mono font-semibold uppercase text-text-primary">
              Live Policy Preview
            </span>
            <div className="space-y-3 text-xs font-mono text-text-secondary">
              <div className="flex justify-between py-1.5 border-b border-border">
                <span>Scope:</span>
                <span className="text-text-primary font-bold">All Repositories</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span>Hardcoded Secrets:</span>
                <span className={blockSecrets ? 'text-severity-critical font-bold' : 'text-text-muted'}>
                  {blockSecrets ? 'BLOCK' : 'ALLOW'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span>Critical Flaws:</span>
                <span className={blockCritical ? 'text-severity-critical font-bold' : 'text-text-muted'}>
                  {blockCritical ? 'BLOCK' : 'ALLOW'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span>Threshold:</span>
                <span className="text-accent font-bold">{severityThreshold}</span>
              </div>
            </div>

            <div className="p-3 rounded bg-surface-elevated text-[11px] text-text-muted font-mono leading-relaxed">
              When evaluated against PRs, findings matching or exceeding these thresholds will set the GitHub Security Check to <span className="text-severity-critical font-bold">FAIL</span>.
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
