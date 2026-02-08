# Agent Integration Guide

This document provides comprehensive information for AI coding agents working with the Sovereign RAG Stack.

## Project Overview

**Stack**: Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui  
**Auth**: Custom JWT (email allowlist + shared password)  
**Storage**: Vercel KV (documents, audit logs, user data)  
**Rate Limiting**: Upstash Redis  
**Models**: Multi-provider (Ollama, Anthropic, OpenAI)  
**RAG**: Semantic search with Ollama embeddings

## Architecture

### Authentication Flow

```typescript
// JWT-based session management
1. User submits credentials to /api/login
2. Verify email in allowlist (AUTH_ALLOWED_EMAILS)
3. Check shared password (AUTH_PASSWORD)
4. Create JWT with 7-day expiry
5. Set httpOnly cookie: flipadonga_session
6. Middleware validates JWT on protected routes
```

**Key Files**:
- `lib/auth.ts`: JWT creation, verification, lockout logic
- `app/api/login/route.ts`: Login endpoint with rate limiting
- `middleware.ts`: Route protection

### Settings Management

```typescript
// Client-side: localStorage
{
  selectedModel: string,
  ollamaEndpoint?: string,
  anthropicApiKey?: string,
  openaiApiKey?: string
}

// Server-side: Environment variables (fallback)
OLLAMA_ENDPOINT=http://localhost:11434
ANTHROPIC_API_KEY=sk-...
OPENAI_API_KEY=sk-...
```

**Priority**: Settings from request → localStorage → environment variables

**Key Files**:
- `lib/settings.ts`: localStorage get/set functions
- `components/chat/chat-input.tsx`: Retrieves settings on send
- `app/api/chat/route.ts`: Accepts settings in request body

### Multi-Model Orchestration

**Three Modes**:

1. **Chat** (default): Single model response
2. **Workers**: Parallel execution with multiple models, synthesized result
3. **Ralph**: Iterative refinement loop (1-10 iterations)

```typescript
// Example: Workers mode
{
  mode: 'workers',
  model: 'ollama/qwen2.5-coder', // Main model
  workerModels: ['ollama/llama3.3', 'anthropic/claude-3.5-sonnet'],
  message: 'Compare these approaches'
}

// Example: Ralph mode
{
  mode: 'ralph',
  model: 'ollama/qwen2.5-coder',
  ralphIterations: 5,
  message: 'Refine this code'
}
```

**Key Files**:
- `lib/llm-providers.ts`: Provider abstraction, orchestration
- `components/chat/advanced-settings.tsx`: Mode selection UI
- `app/(chat)/chat/page.tsx`: State management

### RAG System

**Document Processing**:

```typescript
1. Upload file → /api/documents (POST)
2. Extract text content
3. Generate embedding via Ollama (nomic-embed-text)
4. Store in Vercel KV with metadata
5. Add to documents:all set
```

**Semantic Search**:

```typescript
1. User sends message with ragEnabled: true
2. Generate query embedding
3. Retrieve all documents from KV
4. Calculate cosine similarity
5. Return top 3 results
6. Inject as context to LLM
7. Include sources in response
```

**Key Files**:
- `lib/documents.ts`: Upload, search, CRUD operations
- `app/api/documents/route.ts`: REST endpoints
- `app/api/chat/route.ts`: RAG integration in chat
- `components/chat/document-upload.tsx`: Upload UI

### Security Features

**Rate Limiting**:
- 5 login attempts per 15 minutes per IP
- Upstash Redis sliding window
- Graceful fallback if unavailable

**Account Lockout**:
- 5 failed attempts → 15-minute lockout
- Tracked in Vercel KV: `failed_login:{email}`
- Auto-reset on successful login

**Audit Logging**:
- All login attempts logged to KV
- 7-day retention
- Format: `audit:login:{timestamp}`

**Key Files**:
- `lib/rate-limit.ts`: Upstash rate limiter
- `lib/auth.ts`: Lockout + audit functions
- `app/api/login/route.ts`: Integrated checks

## API Endpoints

### Authentication

**POST /api/login**
```json
// Request
{
  "email": "user@buenatura.org",
  "password": "shared-secret"
}

// Response (200)
{ "ok": true }
// Sets cookie: flipadonga_session

// Response (429 - Rate Limited)
{
  "error": "Too many login attempts",
  "retryAfter": 900
}

// Response (423 - Locked)
{ "error": "Account temporarily locked" }
```

**GET /api/user/profile**
```json
// Response (200)
{
  "email": "user@buenatura.org",
  "createdAt": "2026-02-08T20:00:00Z",
  "sessionExpiry": "2026-02-15T20:00:00Z"
}
```

### Chat

**POST /api/chat**
```json
// Request
{
  "message": "What is this project?",
  "model": "ollama/qwen2.5-coder",
  "mode": "chat", // or "workers" or "ralph"
  "workerModels": [], // For workers mode
  "ralphIterations": 3, // For ralph mode
  "ragEnabled": true,
  "settings": {
    "ollamaEndpointOverride": "http://localhost:11434",
    "apiKeysPresent": {
      "anthropic": false,
      "openai": false
    }
  }
}

// Response (200)
{
  "answer": "This is a sovereign RAG stack...",
  "model": "ollama/qwen2.5-coder",
  "usage": { "promptTokens": 100, "completionTokens": 50 },
  "sources": [
    {
      "docId": "doc:1234:README.md",
      "filename": "README.md",
      "snippet": "The Sovereign RAG Stack is..."
    }
  ]
}
```

### Documents

**POST /api/documents**
```bash
curl -X POST /api/documents \
  -F "file=@document.txt" \
  -F "ollamaEndpoint=http://localhost:11434"

# Response
{ "id": "doc:1234567890:document.txt" }
```

**GET /api/documents?q={query}**
```json
// Search
{
  "results": [
    {
      "document": {
        "id": "doc:123:file.txt",
        "filename": "file.txt",
        "content": "...",
        "metadata": { "size": 1024, "type": "text/plain" }
      },
      "score": 0.87
    }
  ]
}

// List all (no query param)
{
  "documents": [
    { "id": "doc:123", "filename": "file.txt", ... }
  ]
}
```

**DELETE /api/documents?id={docId}**
```json
{ "success": true }
```

## Environment Variables

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

## File Structure

```
app/
  (auth)/
    login/page.tsx              # Login page
  (chat)/
    chat/page.tsx               # Main chat interface
    settings/page.tsx           # Settings page
  api/
    chat/route.ts               # Chat endpoint (multi-model + RAG)
    documents/route.ts          # Document CRUD
    login/route.ts              # Authentication
    user/profile/route.ts       # User profile
  layout.tsx
  globals.css

components/
  chat/
    advanced-settings.tsx       # Mode selector, workers, ralph
    chat-error.tsx              # Error boundary with retry
    chat-header.tsx             # Header with new chat button
    chat-input.tsx              # Input with settings injection
    chat-messages.tsx           # Message list display
    document-upload.tsx         # Drag-drop file upload
    sidebar.tsx                 # Model selector, skills link
  ui/                           # shadcn/ui components

lib/
  auth.ts                       # JWT, lockout, audit logging
  documents.ts                  # Document store, embeddings, search
  llm-providers.ts              # Multi-provider abstraction
  rate-limit.ts                 # Upstash rate limiter
  settings.ts                   # localStorage management
  utils.ts                      # cn() helper

middleware.ts                   # Route protection
```

## Coding Principles

### Carbon Fiber Principle
Maximum strength with minimum weight. Every line must justify its existence.

```typescript
// Good: Concise, single responsibility
export function getSettings(): AppSettings {
  if (typeof window === 'undefined') return { selectedModel: 'ollama/qwen2.5-coder' };
  const stored = localStorage.getItem(SETTINGS_KEY);
  return stored ? JSON.parse(stored) : { selectedModel: 'ollama/qwen2.5-coder' };
}

// Bad: Over-engineered
export class SettingsManager {
  private cache: Map<string, any>;
  constructor() { this.cache = new Map(); }
  // ... 50 more lines
}
```

### YAGNI Principle
Start simple. Add complexity only when you have concrete requirements.

```typescript
// Good: Implements what's needed
const results = await searchDocuments(query, 3, endpoint);

// Bad: Speculative features
const results = await searchDocuments(query, 3, endpoint, {
  filters: [],
  sorting: 'relevance',
  pagination: { page: 1, perPage: 10 },
  caching: true,
  // ... features nobody asked for
});
```

### AI-First Development
Code should be instantly understandable by both humans and AI.

```typescript
// Good: Clear function name, obvious purpose
async function recordFailedLogin(email: string, ip: string): Promise<void>

// Bad: Cryptic, requires context
async function rfl(e: string, i: string): Promise<void>
```

### Uncle Bob's Clean Code
Functions read like well-written prose. Each does one thing well.

```typescript
// Good: Single responsibility
async function uploadDocument(file: File, endpoint: string) {
  const content = await file.text();
  const embedding = await generateEmbedding(content, endpoint);
  const document = createDocument(file, content, embedding);
  await saveToKV(document);
  return { id: document.id };
}

// Bad: God function
async function handleEverything() {
  // 200 lines of mixed concerns
}
```

## Skills Integration

For browsing and installing agent skills:
- **Skills Search**: [https://skills.sh/vercel-labs/skills](https://skills.sh/vercel-labs/skills)
- **Installation**: POST to `/api/skills/install` (placeholder, to be implemented)

## Development Workflow

1. **Local Development**
   ```bash
   npm install
   npm run dev
   # Starts on http://localhost:3000
   ```

2. **Ollama Setup** (for embeddings + local models)
   ```bash
   ollama pull nomic-embed-text
   ollama pull qwen2.5-coder
   ollama pull llama3.3
   ```

3. **Testing RAG**
   - Upload documents via UI or API
   - Enable RAG toggle in advanced settings
   - Ask questions about uploaded content

4. **Testing Multi-Model**
   - Expand "Advanced" panel
   - Select "Workers" mode
   - Choose 2-3 worker models
   - Compare parallel responses

## Common Patterns

### Error Handling
```typescript
try {
  const result = await riskyOperation();
  return NextResponse.json(result);
} catch (error) {
  console.error('[Context] Error:', error);
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'Operation failed' },
    { status: 500 }
  );
}
```

### KV Operations
```typescript
// Store with expiry
await kv.set(key, value, { ex: 3600 }); // 1 hour

// Set operations
await kv.sadd('documents:all', docId);
const all = await kv.smembers('documents:all');

// Atomic counter
await kv.incr('failed_login:user@example.com');
```

### Provider Abstraction
```typescript
const provider = createProvider(model, config);
const response = await provider.generate(messages);
// Works with ollama/*, anthropic/*, openai/*
```

## Future Enhancements

**Phase 5: Per-User Persistence** (not yet implemented)
- Sync settings to KV per user
- Chat history persistence
- Document ownership and permissions
- User-specific RAG context

**Potential Additions**:
- Streaming responses
- Document chunking for large files
- Vector database upgrade (Pinecone, Weaviate)
- Multi-tenant isolation
- Usage analytics

## Troubleshooting

**Issue**: "Failed to connect to model"  
**Solution**: Check Ollama is running, verify endpoint in settings

**Issue**: Rate limit errors  
**Solution**: Wait 15 minutes or clear Redis key manually

**Issue**: Documents not found in search  
**Solution**: Verify embeddings were generated, check KV contains documents:all set

**Issue**: Auth not working  
**Solution**: Verify AUTH_SECRET is set, check email is in AUTH_ALLOWED_EMAILS

## Contact

For questions or contributions, contact the BUENATURA team.
