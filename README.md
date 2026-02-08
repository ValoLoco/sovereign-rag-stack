# Sovereign RAG Stack

> Production-ready web interface for a sovereign RAG stack with multi-model orchestration, semantic search, and full user data persistence.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com)

## Overview

A complete, production-ready RAG application built with Next.js 15, featuring:

- **Multi-Model Orchestration**: Single model, parallel workers, or iterative refinement (Ralph)
- **Semantic Search RAG**: Document embeddings with Ollama, stored in Vercel KV
- **Advanced Security**: Rate limiting, account lockout, audit logging
- **User Persistence**: Settings, chat history, and document ownership per user
- **Agent-Ready**: Comprehensive documentation for AI coding agents

## Features

### Authentication & Security
- ✅ JWT sessions with 7-day expiry
- ✅ Email allowlist + shared password
- ✅ Rate limiting (5 attempts per 15min per IP)
- ✅ Account lockout after 5 failed attempts
- ✅ Audit logging with 7-day retention
- ✅ IP tracking and monitoring

### AI Capabilities
- ✅ Multi-provider support (Ollama, Anthropic, OpenAI)
- ✅ Three orchestration modes:
  - **Chat**: Single model response
  - **Workers**: Parallel multi-model execution
  - **Ralph**: Iterative refinement loop
- ✅ RAG with semantic document search
- ✅ Ollama embeddings (`nomic-embed-text`)
- ✅ Source attribution in responses

### User Experience
- ✅ Settings sync to cloud (Vercel KV)
- ✅ Chat history persistence
- ✅ Document ownership and privacy
- ✅ Cross-device continuity
- ✅ Drag-and-drop file upload
- ✅ Error boundaries with retry
- ✅ Advanced settings panel

### Developer Experience
- ✅ Comprehensive agent documentation ([AGENTS.md](./AGENTS.md))
- ✅ Clean API contracts
- ✅ Carbon Fiber code principles
- ✅ Skills integration ready
- ✅ Full TypeScript types

## Architecture

```text
Client (Browser)
  ↓
Next.js 15 App Router (Vercel)
  ├── Authentication
  │   ├── JWT sessions (7-day expiry)
  │   ├── Rate limiting (Upstash Redis)
  │   └── Account lockout (Vercel KV)
  ├── Multi-Model Chat
  │   ├── Ollama (local models)
  │   ├── Anthropic (Claude)
  │   └── OpenAI (GPT-4)
  ├── RAG System
  │   ├── Document storage (Vercel KV)
  │   ├── Embeddings (Ollama)
  │   └── Semantic search (cosine similarity)
  └── User Data
      ├── Settings persistence
      ├── Chat history
      └── Document ownership
```

## Project Structure

```text
sovereign-rag-stack/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx              # Login interface
│   ├── (chat)/
│   │   ├── chat/page.tsx               # Main chat with history
│   │   └── settings/page.tsx           # User settings
│   ├── api/
│   │   ├── chat/route.ts               # Multi-model + RAG endpoint
│   │   ├── documents/route.ts          # Document CRUD + ownership
│   │   ├── login/route.ts              # Auth with rate limiting
│   │   ├── skills/install/route.ts     # Skills integration
│   │   └── user/
│   │       ├── profile/route.ts        # User profile
│   │       ├── settings/route.ts       # Settings sync
│   │       └── chats/route.ts          # Chat history CRUD
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── chat/
│   │   ├── advanced-settings.tsx       # Mode selector (chat/workers/ralph)
│   │   ├── chat-error.tsx              # Error boundary
│   │   ├── chat-header.tsx             # Header with actions
│   │   ├── chat-input.tsx              # Input with settings injection
│   │   ├── chat-messages.tsx           # Message display
│   │   ├── document-upload.tsx         # Drag-drop upload
│   │   └── sidebar.tsx                 # Model selector + skills
│   └── ui/                             # shadcn/ui components
├── lib/
│   ├── auth.ts                         # JWT, lockout, audit
│   ├── documents.ts                    # RAG document store
│   ├── llm-providers.ts                # Multi-provider abstraction
│   ├── rate-limit.ts                   # Upstash rate limiter
│   ├── settings.ts                     # localStorage management
│   ├── user-data.ts                    # User persistence layer
│   └── utils.ts                        # Utilities
├── docs/                               # Original design docs
├── middleware.ts                       # Route protection
├── AGENTS.md                           # Agent integration guide
├── package.json
└── README.md
```

## Quick Start

### 1. Installation

```bash
git clone https://github.com/ValoLoco/sovereign-rag-stack.git
cd sovereign-rag-stack
npm install
```

### 2. Environment Setup

Create `.env.local` with:

```bash
# Authentication
AUTH_SECRET=your-jwt-secret-min-32-chars
AUTH_PASSWORD=shared-password
AUTH_ALLOWED_EMAILS=user1@buenatura.org,user2@buenatura.org

# LLM Providers
OLLAMA_ENDPOINT=http://localhost:11434
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Vercel KV (document storage)
KV_URL=redis://...
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### 3. Ollama Setup (for local models + embeddings)

```bash
# Install Ollama from https://ollama.ai

# Pull required models
ollama pull nomic-embed-text  # For embeddings
ollama pull qwen2.5-coder     # For chat
ollama pull llama3.3          # Optional: for workers
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with an allowed email.

## API Endpoints

### Authentication
```bash
POST /api/login              # Login with email + password
GET  /api/user/profile       # Get user profile
```

### Chat
```bash
POST /api/chat               # Send message (supports RAG, workers, ralph)
```

### Documents
```bash
POST   /api/documents        # Upload document
GET    /api/documents?q=...  # Search documents
GET    /api/documents        # List user's documents
DELETE /api/documents?id=... # Delete document
```

### User Data
```bash
GET    /api/user/settings    # Get user settings
POST   /api/user/settings    # Save user settings
GET    /api/user/chats       # List chat history
POST   /api/user/chats       # Create new chat
PUT    /api/user/chats       # Update chat
DELETE /api/user/chats?id=...# Delete chat
```

### Skills
```bash
POST /api/skills/install     # Install agent skill (placeholder)
GET  /api/skills/install     # Skills API info
```

Full API documentation with request/response examples in [AGENTS.md](./AGENTS.md).

## Usage Examples

### Basic Chat

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Explain quantum computing',
    model: 'ollama/qwen2.5-coder',
    mode: 'chat'
  })
});
```

### RAG with Documents

```typescript
// 1. Upload document
const formData = new FormData();
formData.append('file', file);
await fetch('/api/documents', {
  method: 'POST',
  body: formData
});

// 2. Ask question with RAG
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'What does the document say about X?',
    model: 'ollama/qwen2.5-coder',
    ragEnabled: true
  })
});
```

### Workers Mode (Parallel Multi-Model)

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Compare Python and JavaScript',
    model: 'ollama/qwen2.5-coder',
    mode: 'workers',
    workerModels: ['ollama/llama3.3', 'anthropic/claude-3.5-sonnet']
  })
});
```

### Ralph Mode (Iterative Refinement)

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Refine this code structure',
    model: 'ollama/qwen2.5-coder',
    mode: 'ralph',
    ralphIterations: 5
  })
});
```

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Import repository in Vercel dashboard
   - Configure environment variables (same as `.env.local`)

3. **Create Vercel KV Database**
   - Go to Storage → Create → KV
   - Copy credentials to environment variables

4. **Create Upstash Redis**
   - Sign up at [upstash.com](https://upstash.com)
   - Create Redis database
   - Copy credentials to environment variables

5. **Deploy**
   ```bash
   vercel --prod
   ```

### Environment Variables in Vercel

Add all variables from `.env.local` to:
**Settings → Environment Variables**

Make sure to add them for:
- Production
- Preview
- Development

## Development Workflow

### Adding New Features

1. **Follow Carbon Fiber Principle**: Maximum strength, minimum weight
2. **Follow YAGNI**: Don't build for imaginary future needs
3. **AI-First Code**: Clear names, single responsibility
4. **Uncle Bob's Clean Code**: Functions read like prose

See [AGENTS.md](./AGENTS.md) for detailed coding principles.

### Testing

```bash
# Run locally
npm run dev

# Test authentication
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@buenatura.org","password":"your-password"}'

# Test RAG
curl -X POST http://localhost:3000/api/documents \
  -F "file=@document.txt"

curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What does the document say?","ragEnabled":true}'
```

## Configuration

### Supported Models

**Ollama** (local)
- `ollama/qwen2.5-coder`
- `ollama/llama3.3`
- Any model from [ollama.ai/library](https://ollama.ai/library)

**Anthropic**
- `anthropic/claude-3.5-sonnet`
- `anthropic/claude-3-opus`

**OpenAI**
- `openai/gpt-4`
- `openai/gpt-4-turbo`

### File Upload Limits

- Max file size: 5MB
- Supported types: `.txt`, `.md`, `.json`, `.csv`, `.py`, `.js`, `.ts`
- Text extraction only (no OCR yet)

### Rate Limits

- Login: 5 attempts per 15 minutes per IP
- Account lockout: 5 failed attempts = 15-minute lockout
- Audit logs: 7-day retention

## Troubleshooting

### "Failed to connect to model"
**Solution**: Check Ollama is running (`ollama serve`), verify endpoint in settings

### Rate limit errors
**Solution**: Wait 15 minutes or clear Redis key manually

### Documents not found in search
**Solution**: Verify embeddings were generated, check KV contains `documents:all` set

### Auth not working
**Solution**: Verify `AUTH_SECRET` is set, check email is in `AUTH_ALLOWED_EMAILS`

## Documentation

- [AGENTS.md](./AGENTS.md) - Complete guide for AI coding agents
- [docs/QUICKSTART.md](./docs/QUICKSTART.md) - Original design overview
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Deployment strategies

## Roadmap

### Implemented ✅
- Phase 1: Core functionality (settings, multi-model modes)
- Phase 2: RAG MVP (embeddings, search)
- Phase 3: Production hardening (rate limiting, lockout)
- Phase 4: Agent integration (docs, skills API)
- Phase 5: User persistence (settings, chat history, ownership)

### Future Enhancements
- Streaming responses
- Document chunking for large files
- Vector database upgrade (Pinecone, Weaviate)
- Usage analytics
- Team collaboration features

## Contributing

Contributions welcome. Please:
1. Follow the coding principles in [AGENTS.md](./AGENTS.md)
2. Write clear commit messages
3. Test locally before submitting PR

## License

MIT License - see [LICENSE](LICENSE)

---

**Built for sovereignty. Runs anywhere. Ready for agents.**

Developed by [BUENATURA](https://buenatura.org)
