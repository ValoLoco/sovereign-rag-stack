# Frontend Architecture

Modern chat interface for flipadonga.com built with Next.js 15, React 19, and Tailwind CSS.

## Design Philosophy

Follows [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines)[web:66] for production-quality UX:

### Core Principles

**Optical Alignment**[web:66]
- Elements aligned deliberately to grid, baseline, or optical center
- ±1px adjustments for perception over geometry

**Stable Skeletons**[web:66]
- Loading states mirror final content
- No layout shift during data loading

**All States Designed**[web:66]
- Empty, sparse, dense, error, and loading states
- No dead ends - every screen offers next step

**Keyboard First**[web:66]
- Full keyboard navigation
- Autofocus on desktop for speed
- Enter to send, Shift+Enter for newline

**Deep-link Everything**[web:66]
- Shareable URLs for conversations
- Preserved scroll positions
- Back/Forward navigation works

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: lucide-react
- **Authentication**: Clerk (planned)

## Structure

```
app/
├── (auth)/
│   ├── login/page.tsx          # Login page
│   └── register/page.tsx       # Registration (planned)
├── (chat)/
│   └── chat/page.tsx           # Main chat interface
├── api/
│   └── chat/route.ts           # Chat API endpoint
├── globals.css                # Global styles
└── layout.tsx                 # Root layout

components/
├── auth/
│   └── login-form.tsx          # Login form component
├── chat/
│   ├── chat-header.tsx         # Header with menu/settings
│   ├── chat-messages.tsx       # Message list with bubbles
│   ├── chat-input.tsx          # Input with file upload
│   └── sidebar.tsx             # Sidebar with models/connectors
└── ui/                        # shadcn/ui components
    ├── button.tsx
    ├── input.tsx
    ├── label.tsx
    ├── textarea.tsx
    └── scroll-area.tsx
```

## Features

### Chat Interface

**Message Bubbles**[web:71][web:72]
- User messages: Right-aligned, dark background
- Assistant messages: Left-aligned, light background with border
- Timestamps for all messages
- Source count indicators
- Smooth scroll to bottom

**Input Area**[web:71]
- Auto-resizing textarea
- File attachment support (TXT, MD, PDF, DOCX, code)
- Visual file preview chips
- Send button (disabled when empty)
- Keyboard shortcuts (Enter to send, Shift+Enter for newline)

**Loading States**[web:66]
- Animated dots for assistant thinking
- Stable skeleton (matches message bubble)
- No layout shift

**Empty State**[web:66]
- Welcoming message
- Clear call-to-action
- Suggests next steps

### Sidebar

**Model Selection**[web:72]
- Ollama models (Llama 3.3, Qwen 2.5, DeepSeek R1)
- Anthropic models (Claude Sonnet 4)
- Local indicator for Ollama models
- Visual selection state

**Connectors**[web:72]
- Knowledge Base (RAG)
- Personal Memory
- Web Search (planned)
- Toggle switches with smooth animation

**Recent Chats**
- Conversation history
- Timestamps
- Clickable to resume

### Responsive Design

**Mobile**[web:66]
- Hamburger menu for sidebar
- Backdrop blur overlay
- Touch-optimized buttons
- No autofocus (prevents keyboard shift)

**Desktop**
- Persistent sidebar
- Keyboard navigation
- Autofocus on input[web:66]
- Larger hit targets

## Design Tokens

### Colors

Neutral palette for clean, professional look:

```css
/* Light mode */
--background: neutral-50
--foreground: neutral-900
--border: neutral-200
--muted: neutral-100

/* Dark mode */
--background: neutral-950
--foreground: neutral-100
--border: neutral-800
--muted: neutral-900
```

### Typography

- **Font**: Inter (system font stack)
- **Base size**: 14px (0.875rem)
- **Line height**: 1.5
- **Headings**: Semibold (600)
- **Body**: Regular (400)

### Spacing

- **Base unit**: 4px (0.25rem)
- **Container padding**: 16px (1rem)
- **Message gap**: 24px (1.5rem)
- **Input height**: 52px minimum

### Borders

- **Radius**: 0.5rem (8px) for cards
- **Button radius**: 0.5rem (8px)
- **Message radius**: 1rem (16px) with 2px corner cut
- **Border width**: 1px

### Shadows

**Layered shadows**[web:66] for depth:

```css
/* Card shadow */
shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)

/* Modal shadow */
shadow-lg: 
  0 10px 15px rgba(0, 0, 0, 0.1),
  0 4px 6px rgba(0, 0, 0, 0.05)
```

## Animations

**Easing**[web:66]
- UI transitions: `ease-in-out`
- Sidebar slide: `duration-200`
- Button hover: `transition-colors`

**Loading dots**:
- 3 dots with staggered bounce
- Delay: 0ms, 150ms, 300ms

**Interruptible**[web:66]
- All animations cancelable by user input
- No autoplay

## Accessibility

**Semantics First**[web:66]
- Native `<button>`, `<textarea>`, `<label>`
- ARIA only when needed
- Hierarchical headings

**Keyboard Navigation**[web:66]
- Tab order logical
- Focus visible
- Skip links (planned)

**Contrast**[web:66]
- APCA-compliant color pairs
- Minimum 7:1 for text
- Hover states increase contrast

**Screen Readers**
- Descriptive labels
- Live regions for messages
- Status announcements

## Performance

**Code Splitting**
- Route-based splitting
- Component lazy loading
- Dynamic imports for heavy components

**Image Optimization**
- Next.js Image component
- Lazy loading
- WebP with fallbacks

**Bundle Size**
- Minimal dependencies
- Tree-shaking enabled
- ~50KB initial JS

## Usage

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
vercel
```

Or connect GitHub repo in Vercel dashboard for automatic deployments.

## API Integration

The frontend calls `/api/chat` for RAG queries:

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'your question',
    model: 'ollama/llama3.3',
    files: ['document.pdf'],
  }),
});

const { answer, sources } = await response.json();
```

## Customization

### Brand Colors

Edit `app/globals.css`:

```css
:root {
  --primary: your-color;
  --primary-foreground: your-fg-color;
}
```

### Add New Model

Edit `components/chat/sidebar.tsx`:

```typescript
const models = [
  { id: 'new-model', name: 'New Model', provider: 'Provider', local: true },
  // ...
];
```

### Add Connector

Edit `components/chat/sidebar.tsx`:

```typescript
const connectors = [
  { id: 'new-connector', name: 'New Feature', enabled: false },
  // ...
];
```

## Next Steps

1. **Implement Clerk Auth** - Replace mock login
2. **Connect to Backend** - Wire up `/api/chat` to Python RAG
3. **Add File Upload** - Process and display uploaded docs
4. **Conversation History** - Persist chats
5. **Source Citations** - Link to original documents
6. **Settings Panel** - User preferences
7. **Dark Mode Toggle** - System preference detection
8. **Mobile App** - React Native version

## References

- [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines)[web:66]
- [shadcn/ui Components](https://ui.shadcn.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Chat UI Best Practices](https://www.mtlc.co/designing-trustworthy-ai-assistants-9-simple-ux-patterns-that-make-a-big-difference/)[web:72]
