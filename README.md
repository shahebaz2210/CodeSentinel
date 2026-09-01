# CodeSentinel

**Context-Aware Security Intelligence Platform for Modern DevSecOps**

CodeSentinel combines deterministic security scanners with repository context, security intelligence (RAG), AI-assisted analysis, risk scoring, and policy enforcement to help teams detect, prioritize, and fix vulnerabilities before they reach production.

## Architecture

```
Frontend (Next.js 14 + TypeScript + Tailwind CSS)
    ↕
Backend API (FastAPI + Pydantic + SQLAlchemy)
    ↕
PostgreSQL (pgvector) + Redis (Queue)
    ↕
Worker (RQ) → Semgrep + Gitleaks → Normalize → RAG → AI → Risk → Policy
    ↕
GitHub (OAuth + Webhooks + Checks)
```

## Prerequisites

- **Docker & Docker Compose** (for PostgreSQL + Redis)
- **Python 3.11+**
- **Node.js 18+**
- **Semgrep** (`pip install semgrep` or `brew install semgrep`)
- **Gitleaks** (`brew install gitleaks` or download from GitHub releases)
- **GitHub OAuth App** (create at https://github.com/settings/developers)
- **Gemini API Key** (free at https://aistudio.google.com/apikey)

## Quick Start

### 1. Start Infrastructure

```bash
docker compose up -d
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your values:
# - GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET
# - GEMINI_API_KEY
# - APP_SECRET_KEY (random 64 chars)
# - JWT_SECRET_KEY (random 64 chars)
# - ENCRYPTION_KEY (32-byte base64)
```

### 3. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
alembic upgrade head
```

### 4. Seed Security Knowledge

```bash
python -m backend.scripts.seed_knowledge
```

### 5. Start Backend

```bash
uvicorn backend.app.main:app --reload --port 8000
```

### 6. Start Worker

```bash
python -m backend.app.workers.worker_main
```

### 7. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 8. Open CodeSentinel

```
http://localhost:3000
```

## GitHub OAuth Setup

1. Go to https://github.com/settings/developers
2. Create "New OAuth App"
3. Set Homepage URL: `http://localhost:3000`
4. Set Callback URL: `http://localhost:8000/api/v1/auth/github/callback`
5. Copy Client ID and Client Secret to `.env`

## Environment Variables

See [`.env.example`](.env.example) for all variables.

## Project Structure

```
codesentinel/
├── frontend/          # Next.js 14 (App Router)
├── backend/           # FastAPI + SQLAlchemy
│   ├── app/
│   │   ├── api/v1/    # Versioned API routes
│   │   ├── core/      # Config, security, database
│   │   ├── models/    # SQLAlchemy models (16 tables)
│   │   ├── schemas/   # Pydantic schemas
│   │   ├── services/  # Business logic
│   │   ├── scanners/  # Semgrep + Gitleaks adapters
│   │   ├── ai/        # Gemini LLM + RAG pipeline
│   │   └── workers/   # RQ background jobs
│   ├── migrations/    # Alembic
│   └── tests/
├── knowledge/         # OWASP, CWE, CVE data
├── docker-compose.yml
└── .env.example
```

## License

Proprietary — All rights reserved.
