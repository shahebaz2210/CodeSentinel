import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseUtcDate(dateString?: string): Date | null {
  if (!dateString) return null;
  let normalized = dateString.trim();
  // If no timezone indicator (no 'Z' and no '+/-HH:MM'), treat it as UTC
  if (!normalized.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(normalized)) {
    normalized += 'Z';
  }
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? null : d;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'Never';
  const d = parseUtcDate(dateString);
  if (!d) return dateString;

  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();

  const timeStr = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);

  if (isToday) {
    return `Today, ${timeStr}`;
  }

  const dateStr = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(d);

  return `${dateStr}, ${timeStr}`;
}

export function formatTimeAgo(dateString?: string): string {
  if (!dateString) return '';
  const d = parseUtcDate(dateString);
  if (!d) return '';

  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - d.getTime()) / 1000));

  if (diffSec < 45) return 'just now';
  if (diffSec < 90) return '1 min ago';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mins ago`;
  if (diffSec < 7200) return '1 hour ago';
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
  if (diffSec < 172800) return 'yesterday';
  return `${Math.floor(diffSec / 86400)} days ago`;
}

export function formatDuration(durationMs?: number): string {
  if (!durationMs && durationMs !== 0) return '-';
  if (durationMs < 1000) return `${durationMs}ms`;
  const seconds = (durationMs / 1000).toFixed(1);
  return `${seconds}s`;
}

export function truncateHash(hash?: string, length = 7): string {
  if (!hash) return '';
  return hash.substring(0, length);
}
