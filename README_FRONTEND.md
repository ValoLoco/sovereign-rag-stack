# flipadonga Frontend

Modern chat interface for your sovereign RAG stack.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Build for Production

```bash
npm run build
npm start
```

## Features

✅ **Modern Chat Interface** - Clean, responsive design  
✅ **File Uploads** - Attach PDFs, DOCX, Markdown, code  
✅ **Model Selection** - Switch between Ollama and Anthropic  
✅ **Connectors** - Enable/disable RAG, memory, web search  
✅ **Dark Mode** - System preference detection  
✅ **Keyboard Shortcuts** - Enter to send, Shift+Enter for newline  
✅ **Mobile Responsive** - Works on all devices  
✅ **Accessibility** - Full keyboard navigation, screen reader support  

## Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality components
- **Lucide Icons** - Modern icon set

## Project Structure

```
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (chat)/chat/           # Main chat interface
│   ├── api/chat/              # Chat API endpoint
│   ├── globals.css            # Global styles
│   └── layout.tsx             # Root layout
├── components/
│   ├── auth/                  # Auth components
│   ├── chat/                  # Chat components
│   └── ui/                    # shadcn/ui components
├── lib/
│   └── utils.ts               # Utility functions
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## Design Philosophy

Follows [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines):

- **Optical alignment** - Deliberate positioning
- **Stable skeletons** - No layout shift
- **All states designed** - Empty, loading, error
- **Keyboard first** - Full navigation
- **Deep-link everything** - Shareable URLs

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Deploy

Automatic deployments on every push.

### Manual Deploy

```bash
npm run build
npm start
```

Runs on port 3000.

### Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
```

## API Integration

The frontend expects a backend API at `/api/chat`:

```typescript
POST /api/chat
{
  "message": "your question",
  "model": "ollama/llama3.3",
  "files": ["document.pdf"]
}

Response:
{
  "answer": "response text",
  "sources": 3
}
```

See `docs/FRONTEND.md` for full API spec.

## Development

### Add New Component

```bash
npx shadcn-ui@latest add [component-name]
```

### Customize Theme

Edit `app/globals.css`:

```css
:root {
  --primary: your-hsl-color;
}
```

### Add New Model

Edit `components/chat/sidebar.tsx`:

```typescript
const models = [
  { id: 'new-model', name: 'Model Name', provider: 'Provider', local: true },
];
```

## Troubleshooting

### Port Already in Use

```bash
npm run dev -- -p 3001
```

### Build Errors

```bash
rm -rf .next node_modules
npm install
npm run build
```

### Type Errors

```bash
npm run lint
```

## Documentation

- [Full Frontend Docs](docs/FRONTEND.md)
- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## License

MIT
