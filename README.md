# CodeSentinel 🛡️

[![License](https://img.shields.io/badge/License-Proprietary-blue.svg)](LICENSE)
[![Python Version](https://img.shields.io/badge/Python-3.11%2B-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109%2B-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.1-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Supported-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![AI Provider](https://img.shields.io/badge/AI-Gemini%202.0%20Flash-8E75B2?logo=google&logoColor=white)](https://aistudio.google.com/)

> **Context-Aware AI-Powered Security Intelligence Platform for Modern DevSecOps**

CodeSentinel bridges the gap between static analysis tools and intelligent remediation. By combining deterministic security scanners (Semgrep & Gitleaks) with repository context, Security Intelligence Retrieval-Augmented Generation (RAG via `pgvector`), dynamic risk scoring, policy enforcement, and Google Gemini AI assistance, CodeSentinel empowers engineering teams to detect, prioritize, and automatically fix vulnerabilities before they reach production.

---

## 📋 Table of Contents

- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
  - [1. Clone & Environment Configuration](#1-clone--environment-configuration)
  - [2. Start Infrastructure Services](#2-start-infrastructure-services)
  - [3. Backend Setup & Migrations](#3-backend-setup--migrations)
  - [4. Seed Security Knowledge Base (RAG)](#4-seed-security-knowledge-base-rag)
  - [5. Launch Background Scanner Worker](#5-launch-background-scanner-worker)
  - [6. Launch Backend API Server](#6-launch-backend-api-server)
  - [7. Launch Frontend Application](#7-launch-frontend-application)
- [GitHub OAuth & Webhooks Setup](#-github-oauth--webhooks-setup)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Security & Compliance](#-security--compliance)
- [License](#-license)

---

## ✨ Key Features

- **🔍 Multi-Engine SAST & Secret Detection**: Integrated execution of **Semgrep** (code patterns) and **Gitleaks** (hardcoded credentials, API keys, tokens) in isolated scanning jobs.
- **🤖 AI Remediation Pipeline**: Uses **Google Gemini 2.0 Flash** to provide context-aware patch recommendations, precise code fixes, and step-by-step remediation advice.
- **🧠 Security Knowledge RAG Engine**: Vector store backed by **PostgreSQL (`pgvector`)** indexed with OWASP Top 10, CWE definitions, and CVE databases (`text-embedding-004`).
- **⚖️ Dynamic Risk Scoring & Policy Gates**: Custom security policies evaluating risk scores, severity thresholds, and compliance rules to fail PR checks automatically when standards aren't met.
- **🐙 Native GitHub PR Integration**: Automated scanning on Pull Requests, posting inline comments, review feedback, and status check annotations.
- **📊 Real-Time Executive Dashboard**: High-level visual metrics on repository posture, vulnerability distributions, mean-time-to-remediate (MTTR), and scan history.
- **🛡️ Enterprise Audit Logging & RBAC**: Full immutable audit log tracing user actions, scan executions, policy changes, and OAuth sessions.

---

## 🏗️ System Architecture

```
                       ┌─────────────────────────────────────────┐
                       │   Next.js 14 Web Frontend (App Router)  │
                       └───────────────────┬─────────────────────┘
                                           │ HTTPS / REST API
                                           ▼
                       ┌─────────────────────────────────────────┐
                       │          FastAPI Backend Engine         │
                       └──────────┬───────────────────┬──────────┘
                                  │                   │
                     ┌────────────▼───────┐   ┌───────▼───────────┐
                     │ PostgreSQL (Vector)│   │  Redis Job Queue  │
                     └────────────────────┘   └───────┬───────────┘
                                                      │
                                                      ▼
                                              ┌───────────────┐
                                              │   RQ Worker   │
                                              └───────┬───────┘
                                                      │
                   ┌──────────────────────────────────┴──────────────────────────────────┐
                   │                                                                     │
                   ▼                                                                     ▼
     ┌───────────────────────────┐                                         ┌───────────────────────────┐
     │  Semgrep + Gitleaks Scan  │                                         │   Gemini 2.0 AI Engine    │
     └─────────────┬─────────────┘                                         └─────────────┬─────────────┘
                   │                                                                     │
                   └──────────────────► Normalize & RAG Lookup ◄─────────────────────────┘
                                                  │
                                                  ▼
                                      ┌───────────────────────┐
                                      │ GitHub Webhook & Check│
                                      └───────────────────────┘
```

---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | [Next.js 14](https://nextjs.org/) (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons |
| **Backend** | [FastAPI](https://fastapi.tiangolo.com/), Python 3.11+, Pydantic v2, SQLAlchemy 2.0, Alembic |
| **Databases** | PostgreSQL 16 with `pgvector` extension, Redis 7 (RQ Queue) |
| **AI / RAG** | Google Gemini 2.0 Flash (`gemini-2.0-flash`), Google Embeddings (`text-embedding-004`), `pgvector` |
| **Scanners** | Semgrep (SAST), Gitleaks (Secret Scanner) |
| **Authentication** | GitHub OAuth 2.0, JWT Tokens, Passlib/Bcrypt |
| **DevOps & Containerization** | Docker, Docker Compose |

---

## ⚙️ Prerequisites

Before installing CodeSentinel, ensure you have the following installed locally:

- [Docker & Docker Compose](https://www.docker.com/products/docker-desktop/)
- [Python 3.11+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)
- **Semgrep CLI**: Install via `pip install semgrep` or `brew install semgrep`
- **Gitleaks CLI**: Install via `brew install gitleaks` or download from [Gitleaks Releases](https://github.com/gitleaks/gitleaks/releases)
- **Google Gemini API Key**: Obtain a free API key from [Google AI Studio](https://aistudio.google.com/apikey)
- **GitHub OAuth App**: Registered developer app on GitHub (see instructions below)

---

## 🚀 Getting Started

### 1. Clone & Environment Configuration

Clone the repository and prepare your environment variables:

```bash
git clone https://github.com/shahebaz2210/CodeSentinel.git
cd CodeSentinel
cp .env.example .env
```

Open `.env` and fill in your credential values:

```env
# Application Secrets
APP_SECRET_KEY=generate_a_random_64_character_string
JWT_SECRET_KEY=generate_another_random_64_character_string
ENCRYPTION_KEY=generate_a_32_byte_base64_encoded_key

# AI Provider
GEMINI_API_KEY=your_gemini_api_key_here

# GitHub OAuth Credentials
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 2. Start Infrastructure Services

Spin up PostgreSQL (with `pgvector`) and Redis containers:

```bash
docker compose up -d
```

### 3. Backend Setup & Migrations

Set up the Python virtual environment, install backend dependencies, and run database migrations:

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run Alembic database migrations
alembic upgrade head
```

### 4. Seed Security Knowledge Base (RAG)

Populate `pgvector` with standard OWASP, CWE, and CVE security knowledge documents:

```bash
python -m backend.scripts.seed_knowledge
```

### 5. Launch Background Scanner Worker

In a separate terminal (with `venv` activated), start the RQ worker process:

```bash
python -m backend.app.workers.worker_main
```

### 6. Launch Backend API Server

In another terminal (with `venv` activated), start the FastAPI web server:

```bash
uvicorn backend.app.main:app --reload --port 8000
```

Access the interactive API documentation at: `http://localhost:8000/docs`

### 7. Launch Frontend Application

In a new terminal, navigate to the `frontend` directory, install dependencies, and run the development server:

```bash
cd frontend
npm install
npm run dev
```

Open your browser and navigate to **`http://localhost:3000`**.

---

## 🐙 GitHub OAuth & Webhooks Setup

To connect CodeSentinel with your GitHub repositories:

1. Navigate to **[GitHub Developer Settings](https://github.com/settings/developers)** -> **OAuth Apps**.
2. Click **New OAuth App**.
3. Fill in the required fields:
   - **Application Name**: `CodeSentinel Dev`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:8000/api/v1/auth/github/callback`
4. Register application and click **Generate a new client secret**.
5. Copy the **Client ID** and **Client Secret** into your `.env` file under `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.

---

## 📁 Project Structure

```
CodeSentinel/
├── backend/                  # FastAPI Application Core
│   ├── app/
│   │   ├── ai/               # Gemini LLM integration & RAG vector pipeline
│   │   ├── api/v1/           # Versioned API routes (Auth, Scans, Findings, Policies, Webhooks)
│   │   ├── core/             # Configuration, Database engine, Security helpers
│   │   ├── models/           # SQLAlchemy DB Schemas & Entities
│   │   ├── scanners/         # Semgrep & Gitleaks integration adapters
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── services/         # Business logic services
│   │   ├── utils/            # Shared helper functions
│   │   └── workers/          # Background worker job definitions
│   ├── migrations/           # Alembic database migration scripts
│   └── tests/                # Unit and integration test suite
├── frontend/                 # Next.js 14 Web Application
│   ├── app/                  # App Router pages & layouts
│   ├── components/           # UI components (Dashboard, Findings, Policies)
│   ├── lib/                  # API client & utility functions
│   └── public/               # Static assets & icons
├── knowledge/                # Pre-seeded OWASP, CWE, and security intelligence datasets
├── docker-compose.yml        # Infrastructure container orchestrations
├── CodeSentinel_Complete_Build_Spec.md # Complete architectural build specification
└── .env.example              # Template environment variables file
```

---

## 📡 API Reference

CodeSentinel exposes a fully documented OpenAPI REST interface. Key endpoint modules include:

| Category | Endpoint | Description |
| :--- | :--- | :--- |
| **Authentication** | `GET /api/v1/auth/github/login` | Initiate GitHub OAuth authorization flow |
| **Scans** | `POST /api/v1/scans/` | Trigger manual security scan on a repository |
| **Findings** | `GET /api/v1/findings/` | Query normalized scan findings with filter support |
| **AI Remediation** | `POST /api/v1/intelligence/remediate` | Generate Gemini AI fixes for specific findings |
| **Policies** | `GET /api/v1/policies/` | Manage project security policies and compliance rules |
| **Webhooks** | `POST /api/v1/webhooks/github` | Handle incoming GitHub PR and push events |
| **Dashboard** | `GET /api/v1/dashboard/stats` | Fetch aggregate risk metrics and posture summaries |
| **Audit Logs** | `GET /api/v1/audit/logs` | Fetch system audit trails |

---

## 🧪 Testing & Quality Assurance

Run the automated backend test suite using `pytest`:

```bash
# Run backend tests
cd backend
pytest tests/ -v
```

Run frontend linting check:

```bash
cd frontend
npm run lint
```

---

## 🛡️ Security & Compliance

CodeSentinel takes security seriously:
- **Zero Token Persistence**: Encrypted storage for sensitive secrets.
- **Isolated Scanning Sandbox**: Scanners operate on temporary, short-lived directory clones.
- **Role-Based Access Control**: Strict multi-tenant isolation across organizations and repositories.

---

## 📄 License

This repository is proprietary software. All rights reserved. See `LICENSE` for details.

