# Sovereign RAG Stack

> Hybrid local/cloud AI infrastructure with full data sovereignty. Run locally on Windows OR access via web on flipadonga.com when traveling.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com)

## Overview

Sovereign RAG Stack runs in two modes with automatic synchronization:

1. **Local Mode** (Home/Office) - Full sovereignty, Windows native, Claude Desktop integration
2. **Web Mode** (Travel) - Vercel-hosted at flipadonga.com, authenticated access, cloud-synced state

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  HYBRID ARCHITECTURE                            │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┐    ┌─────────────────────────────┐
│   LOCAL MODE (Windows PC)    │    │   WEB MODE (flipadonga.com) │
│                              │    │                             │
│  ┌────────────────────────┐  │    │  ┌───────────────────────┐ │
│  │ Claude Desktop         │  │    │  │ Next.js Web App       │ │
│  │ + MCP Server           │  │    │  │ (Vercel)              │ │
│  └───────────┬────────────┘  │    │  └──────────┬────────────┘ │
│              │               │    │             │              │
│  ┌───────────▼────────────┐  │    │  ┌──────────▼───────────┐ │
│  │ Local RAG Server       │  │    │  │ Next.js API Routes   │ │
│  │ (Python/FastAPI)       │  │    │  │ (Serverless)         │ │
│  └───────────┬────────────┘  │    │  └──────────┬───────────┘ │
│              │               │    │             │              │
│  ┌───────────▼────────────┐  │    │  ┌──────────▼───────────┐ │
│  │ LanceDB (Local)        │  │    │  │ Vercel Postgres      │ │
│  │ C:\BUENATURA\vectors   │  │    │  │ (Metadata + Refs)    │ │
│  └───────────┬────────────┘  │    │  └──────────┬───────────┘ │
│              │               │    │             │              │
│  ┌───────────▼────────────┐  │    │  ┌──────────▼───────────┐ │
│  │ mem0 Memory            │  │    │  │ Vercel Blob Storage  │ │
│  │ (Local Persistence)    │  │    │  │ (Vector Cache)       │ │
│  └────────────────────────┘  │    │  └──────────────────────┘ │
└──────────────────────────────┘    └─────────────────────────────┘
              │                                     │
              │        ┌────────────────┐          │
              └────────► GitHub Repo    ◄──────────┘
                       │ Auto Sync      │
                       │ State Bridge   │
                       └────────────────┘
```

## Features

### Dual Mode Operation

- **Switch seamlessly** between local and web modes
- **Automatic state sync** via GitHub as single source of truth
- **Unified memory layer** accessible from both environments
- **Session continuity** across mode switches

### Local Mode

- Claude Desktop integration via MCP
- Full data sovereignty (C:\BUENATURA)
- No cloud dependencies except GitHub sync
- Local embedding generation
- Maximum performance

### Web Mode

- Next.js app at flipadonga.com
- Clerk authentication (user management)
- Vercel Postgres for metadata
- Vercel Blob for vector cache
- Works on any device

### Auto-Sync System

- GitHub Actions sync every 15 minutes
- Local daemon monitors changes
- Conflict resolution with timestamp priority
- Delta sync (only changed files)

## Quick Start

### 1. Local Setup

```powershell
git clone https://github.com/ValoLoco/sovereign-rag-stack.git
cd sovereign-rag-stack
.\scripts\install-local.ps1
```

### 2. Web Deployment

```bash
vercel link
vercel env pull .env.local
npm run deploy
```

### 3. Configure Sync

Edit `.env`:

```bash
GITHUB_TOKEN=your_personal_access_token
GITHUB_REPO=ValoLoco/sovereign-rag-stack
SYNC_INTERVAL=900  # 15 minutes
```

Start sync daemon:

```powershell
python scripts/sync-daemon.py
```

## Project Structure

```
sovereign-rag-stack/
├── app/                          # Next.js web application
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── chat/
│   │   ├── documents/
│   │   └── memories/
│   ├── api/                      # Serverless API routes
│   │   ├── rag/
│   │   ├── memories/
│   │   └── sync/
│   └── layout.tsx
├── components/                   # React components
│   ├── ui/
│   ├── chat/
│   └── documents/
├── lib/
│   ├── auth.ts                   # Clerk integration
│   ├── db.ts                     # Vercel Postgres
│   ├── rag.ts                    # RAG logic
│   └── sync.ts                   # GitHub sync
├── local/                        # Local mode components
│   ├── mcp_server.py             # MCP server for Claude
│   ├── rag_server.py             # FastAPI RAG server
│   └── requirements.txt
├── scripts/
│   ├── install-local.ps1         # Local setup
│   ├── sync-daemon.py            # Auto-sync daemon
│   └── migrate-data.py           # Data migration
├── sync/
│   ├── .github/
│   │   └── workflows/
│   │       └── auto-sync.yml     # GitHub Actions
│   └── sync-config.json
├── shared/                       # Shared state directory
│   ├── memories/                 # Synced via Git
│   ├── documents/                # Synced via Git
│   └── state.json                # Sync metadata
├── docs/
│   ├── local-setup.md
│   ├── web-deployment.md
│   ├── sync-architecture.md
│   └── authentication.md
├── middleware.ts                 # Next.js auth middleware
├── next.config.js
└── package.json
```

## Authentication

Web mode uses [Clerk](https://clerk.com) for authentication[web:24]:

- Email/password signup
- OAuth (Google, GitHub)
- Magic links
- Multi-factor auth

Only registered users (you + invited users) can access flipadonga.com.

## Sync Architecture

GitHub repository acts as state bridge between local and web modes:

### What Gets Synced

- Document metadata
- Memory snapshots
- Conversation history
- User preferences
- Vector indices (compressed)

### Sync Strategy

1. **Local to GitHub**: Daemon commits changes every 15 min
2. **GitHub to Web**: Vercel webhook triggers on push
3. **Web to GitHub**: API routes commit via GitHub API
4. **GitHub to Local**: Daemon pulls changes

### Conflict Resolution

- Timestamp-based priority
- Last-write-wins for preferences
- Merge strategy for documents
- Manual resolution UI for conflicts

## Documentation

- [Local Setup Guide](docs/local-setup.md)
- [Web Deployment](docs/web-deployment.md)
- [Sync Architecture](docs/sync-architecture.md)
- [Authentication](docs/authentication.md)
- [API Reference](docs/api-reference.md)
- [Troubleshooting](docs/troubleshooting.md)

## Environment Variables

### Local Mode

```bash
ANTHROPIC_API_KEY=sk-...
GITHUB_TOKEN=ghp_...
GITHUB_REPO=ValoLoco/sovereign-rag-stack
LOCAL_DATA_DIR=C:\BUENATURA
```

### Web Mode (Vercel)

```bash
CLERK_SECRET_KEY=sk_...
POSTGRES_URL=postgres://...
BLOB_READ_WRITE_TOKEN=vercel_blob_...
GITHUB_TOKEN=ghp_...
ANTHROPIC_API_KEY=sk-...
```

## Deployment

### Vercel Setup

1. **Connect GitHub repo**

```bash
vercel link
```

2. **Configure custom domain**

```bash
vercel domains add flipadonga.com
```

3. **Set environment variables**

```bash
vercel env add CLERK_SECRET_KEY
vercel env add POSTGRES_URL
vercel env add ANTHROPIC_API_KEY
```

4. **Deploy**

```bash
vercel --prod
```

### Local Daemon

Runs as Windows service:

```powershell
python scripts/sync-daemon.py install
python scripts/sync-daemon.py start
```

## Usage Examples

### Local Mode with Claude Desktop

1. Open Claude Desktop
2. Use MCP tools: `ingest_document`, `search_memories`
3. Changes auto-sync to GitHub
4. Available in web mode after sync

### Web Mode on flipadonga.com

1. Login at flipadonga.com
2. Upload documents via web UI
3. Chat with RAG system
4. Changes sync to GitHub
5. Available locally after daemon pull

### Switching Modes

No configuration needed. Sync happens automatically:

- Work locally → Changes pushed to GitHub → Available on web
- Work on web → Changes committed → Daemon pulls → Available locally

## Tech Stack

### Frontend

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui components

### Backend

- Next.js API Routes (Vercel Serverless)
- FastAPI (Local Python server)
- Vercel Postgres
- Vercel Blob Storage

### Authentication

- Clerk (web mode)
- Windows authentication (local mode)

### AI/ML

- mem0 (memory layer)
- LanceDB (local vectors)
- sentence-transformers (embeddings)
- Claude API (LLM)

### DevOps

- GitHub Actions (sync automation)
- Vercel (hosting + serverless)
- PowerShell (Windows automation)

## Security

- **Web**: Clerk auth + Vercel security
- **Local**: Windows ACLs + encrypted storage
- **Sync**: GitHub encrypted transport
- **API**: JWT tokens + rate limiting

## Roadmap

- [x] Local mode with MCP
- [x] Web mode with Next.js
- [x] GitHub sync system
- [ ] Clerk authentication
- [ ] Real-time sync (WebSockets)
- [ ] Mobile app (React Native)
- [ ] Multi-user collaboration
- [ ] E2E encryption

## Contributing

Personal sovereignty stack. Fork for your own use.

## License

MIT License - See [LICENSE](LICENSE)

---

**Built for freedom. Runs anywhere. Syncs everywhere.**

BUENATURA Holdings · 2026
