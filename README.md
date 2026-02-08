# Sovereign RAG Stack

> Current state. Production ready web interface for a sovereign RAG stack. Future ready for hybrid local + cloud once the Python backend and sync layer are wired in.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com)

## What exists today

This repository currently ships a **focused** Next.js 15 app:

- Login at `/login` with a simple email allowlist + shared password
- Protected chat interface at `/chat`
- Clean, Perplexity style UI with file upload, model toggles, and connector switches
- Deployed on Vercel with your custom domain managed via Squarespace DNS

The local Python RAG server, mem0 memory layer, LanceDB store, and GitHub sync daemon described in the original design are **not yet wired up** in this repo. They remain part of the architecture vision and roadmap.

## Architecture snapshot

Current production deployment is intentionally lean:

```text
Client (browser)
  → Next.js App Router (Vercel)
      • /login        – public route
      • /chat         – protected route
      • /api/login    – issues JWT session cookie
      • /api/logout   – clears session cookie
  → Stateless serverless functions
  → Auth via signed HttpOnly cookie
```

The RAG pipeline is mocked for now. The chat UI is ready to be plugged into a local or remote RAG backend when you decide on the final engine.

## Project structure (current)

```text
sovereign-rag-stack/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx        # Login screen
│   ├── (chat)/
│   │   └── chat/
│   │       └── page.tsx        # Main chat UI
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts        # Mock chat endpoint
│   │   ├── login/
│   │   │   └── route.ts        # Email + password login
│   │   └── logout/
│   │       └── route.ts        # Session clear
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── auth/
│   │   └── login-form.tsx      # Calls /api/login
│   ├── chat/
│   │   ├── chat-header.tsx
│   │   ├── chat-input.tsx
│   │   ├── chat-messages.tsx
│   │   └── sidebar.tsx
│   └── ui/                     # Tailwind + shadcn style primitives
├── lib/
│   ├── auth.ts                 # JWT session helpers
│   ├── rag.ts                  # Placeholder for future RAG bridge
│   └── utils.ts                # UI utilities
├── public/
├── docs/                       # Original design and deployment notes
│   ├── QUICKSTART.md
│   ├── FRONTEND.md
│   ├── DEPLOYMENT.md
│   └── ...
├── middleware.ts               # Protects non public routes
├── next.config.js
├── package.json
└── tailwind.config.ts
```

Anything mentioning FastAPI, mem0, LanceDB, GitHub sync daemons, or Clerk lives in the `docs/` folder as **design material**, not as a guarantee of what the current codebase implements.

## Auth model

The web app uses a small custom auth layer instead of a SaaS provider:

- Email allowlist: only `vk.buenatura@gmail.com` and `ag.buenatura@gmail.com` are accepted
- Shared password: set via environment variable, the same for both users
- JWT based session stored in an HttpOnly, Secure cookie
- Middleware gate that redirects unauthenticated users back to `/login`

### Environment variables (auth)

Configure these in Vercel and in your local `.env.local`:

```bash
AUTH_ALLOWED_EMAILS=vk.buenatura@gmail.com,ag.buenatura@gmail.com
AUTH_PASSWORD=your-strong-shared-password
AUTH_SECRET=long-random-secret-for-signing
```

- `AUTH_ALLOWED_EMAILS` is a comma separated list of lowercase emails
- `AUTH_PASSWORD` is the one password that both of you know
- `AUTH_SECRET` is a long random value used to sign JWTs

## Running locally

```bash
npm install
npm run dev
```

Make sure you have `.env.local` in the project root:

```bash
AUTH_ALLOWED_EMAILS=vk.buenatura@gmail.com,ag.buenatura@gmail.com
AUTH_PASSWORD=your-strong-shared-password
AUTH_SECRET=long-random-secret-for-signing
```

Then open `http://localhost:3000/login` and sign in with one of the allowed emails and the shared password.

## Deploying to Vercel

1. Push changes to GitHub
2. In Vercel, connect the `sovereign-rag-stack` repository if not already connected
3. Add environment variables in **Settings → Environment Variables**:

```bash
AUTH_ALLOWED_EMAILS
AUTH_PASSWORD
AUTH_SECRET
```

4. Trigger a new deployment
5. Point your domain from Squarespace to Vercel via DNS records as described in `docs/VERCEL_DEPLOYMENT_CHECKLIST.md` or the Vercel docs

Vercel issues HTTPS automatically once DNS is correctly configured.

## Frontend capabilities

Even before the RAG backend is wired in, the frontend is structured for:

- Chat centric workflows with a clear hierarchy of conversation, context, and tools
- File uploads ready to be sent to an embedding or parsing pipeline
- Toggles for different model backends or connectors
- A layout that can easily host metadata sidebars, memory viewers, or document panes

All components live in `components/chat` and `components/ui`, following a clean, composable pattern.

## Roadmap

Short term, this repo will evolve along three tracks:

1. **Backend bridge**
   - Connect `/api/chat` to a real RAG backend (local or remote)
   - Add streaming responses
2. **Memory and documents**
   - Wire up a document store and memory layer
   - Add basic CRUD screens for documents and memories
3. **Hybrid mode**
   - Re introduce a local Python server and sync conduit
   - Turn the existing docs into a living spec of the final architecture

The goal is to keep the **web app** production ready while gradually plugging in the deeper sovereignty stack behind it.

## Documentation map

Existing docs are kept as reference material for the full sovereign vision:

- `docs/QUICKSTART.md` – high level options overview
- `docs/FRONTEND.md` – frontend specific notes
- `docs/DEPLOYMENT.md` – general deployment thinking
- `docs/VERCEL_DEPLOYMENT_CHECKLIST.md` – detailed Vercel checklist
- `docs/sync-architecture.md` – planned sync system between local and web

Treat anything that mentions Python servers, mem0, LanceDB, or Clerk as **design direction** rather than current implementation.

## License

MIT License – see [LICENSE](LICENSE)

---

Built for freedom. Runs on Vercel today. Ready to grow into a full sovereign stack tomorrow.
