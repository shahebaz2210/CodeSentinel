import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#090b0e',
        primary: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
          light: '#60a5fa',
          muted: 'rgba(59, 130, 246, 0.12)',
        },
        surface: {
          DEFAULT: '#12151a',
          elevated: '#181d24',
          hover: '#1f252f',
          glass: 'rgba(18, 21, 26, 0.75)',
        },
        tertiary: {
          DEFAULT: '#d16900',
          hover: '#b45309',
          light: '#f97316',
          muted: 'rgba(209, 105, 0, 0.14)',
        },
        neutral: {
          DEFAULT: '#757780',
          light: '#94a3b8',
          dark: '#475569',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          subtle: 'rgba(255, 255, 255, 0.04)',
          focus: '#3b82f6',
          glass: 'rgba(255, 255, 255, 0.12)',
        },
        text: {
          primary: '#f1f5f9',
          secondary: '#94a3b8',
          muted: '#757780',
        },
        accent: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
          muted: 'rgba(59, 130, 246, 0.12)',
        },
        severity: {
          critical: '#ef4444',
          high: '#f97316',
          medium: '#eab308',
          low: '#3b82f6',
          info: '#757780',
        },
        status: {
          pass: '#22c55e',
          warn: '#d16900',
          fail: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        panel: '0 4px 24px -2px rgba(0, 0, 0, 0.5)',
        glass: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.12), 0 12px 36px -4px rgba(0, 0, 0, 0.55)',
        glow: '0 0 20px rgba(59, 130, 246, 0.25)',
        'glow-amber': '0 0 20px rgba(209, 105, 0, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
