# CLI-Agnostic Design

The sovereign-rag-stack is designed to work from **any interface** without modification.

## Design Philosophy

### Single Core, Multiple Interfaces

All functionality lives in `lib/` as pure Python modules. Interfaces (CLI, MCP, web) are thin wrappers that call the same core code.

```
┌───────────────────────────────────┐
│         Interfaces (Thin)         │
├───────────────────────────────────┤
│ CLI    MCP    Web    Goose      │
│  │      │      │      │        │
│  └──────┼──────┼──────┘        │
│         │                      │
│    ┌────┴────┐               │
│    │ lib/    │  Core Logic  │
│    └─────────┘               │
└───────────────────────────────────┘
```

### Core Modules

**lib/embeddings.py**
- Local sentence-transformers
- No external API calls
- Works on CPU or GPU

**lib/vector_store.py**
- LanceDB embedded database
- No server required
- File-based storage

**lib/memory_layer.py**
- mem0 integration
- User/session/agent memory
- Local or cloud mode

**lib/rag_engine.py**
- Combines all components
- Document ingestion
- Semantic search
- Memory-aware queries

## Usage from Different Tools

### 1. Terminal (Pure CLI)

```powershell
python scripts/cli.py search "your query"
```

**How it works:**
- Calls `lib.rag_engine.get_rag_engine()`
- Same code as MCP/web
- Zero dependencies on other interfaces

### 2. Claude Desktop (MCP)

```
In Claude: "Search my documents for X"
```

**How it works:**
- MCP server (`mcp/memory_server.py`) receives request
- Calls `lib.rag_engine.get_rag_engine()`
- Returns results via MCP protocol
- Same core code as CLI

### 3. Cursor IDE (MCP)

```
In Cursor: Ask AI to search knowledge base
```

**How it works:**
- Connects to same MCP servers as Claude
- Uses identical backend
- No Cursor-specific code needed

### 4. VSCode (Terminal or Extension)

**Option A: Integrated Terminal**
```powershell
python scripts/cli.py search "query"
```

**Option B: Extension with MCP**
- Install MCP-compatible extension
- Point to MCP servers
- Same backend as Claude/Cursor

### 5. Goose (Python API)

```python
from lib.rag_engine import get_rag_engine

engine = get_rag_engine()
results = engine.search("your query", limit=5)
```

**How it works:**
- Direct Python import
- No CLI or MCP overhead
- Native API access

### 6. Custom Scripts

```python
import sys
sys.path.append("path/to/sovereign-rag-stack")

from lib.rag_engine import get_rag_engine
from lib.memory_layer import get_memory_layer

engine = get_rag_engine()
memory = get_memory_layer()

results = engine.search_with_memory(
    query="business strategy",
    user_id="valentin",
    limit=5
)
```

## Interface Comparison

| Interface | Use Case | Latency | Setup |
|-----------|----------|---------|-------|
| **CLI** | Automation, scripts | Lowest | None |
| **MCP (Claude)** | Conversational AI | Low | Config file |
| **MCP (Cursor)** | Code context | Low | Extension |
| **Python API** | Custom tools | Lowest | Import |
| **Web UI** | Remote access | Medium | Deployment |

## Data Flow

All interfaces access the same data:

```
C:\BUENATURA\
├── vectors\              # Shared by all
│   ├── documents\       # LanceDB tables
│   └── mem0_memories\  # mem0 storage
├── knowledge\          # Raw documents
└── conversations\      # Chat history
```

**Result:** CLI ingestion is immediately available in Claude Desktop and vice versa.

## Adding New Interfaces

To add a new interface (e.g., Slack bot):

1. Create thin wrapper (e.g., `integrations/slack_bot.py`)
2. Import from `lib/`
3. No changes to core modules

```python
from lib.rag_engine import get_rag_engine

engine = get_rag_engine()

@slack_app.message("search")
def handle_search(message):
    results = engine.search(message["text"])
    return format_results(results)
```

## Protocol Independence

The stack supports multiple protocols simultaneously:

- **stdio** (MCP for Claude Desktop)
- **SSE** (MCP for web clients)
- **HTTP** (REST API for web UI)
- **Python** (Direct imports)

All hit the same `lib/` modules.

## Environment Consistency

Single `.env` file configures all interfaces:

```bash
ANTHROPIC_API_KEY=sk-ant-...
VECTOR_DB_PATH=C:\BUENATURA\vectors
MEM0_USE_LOCAL=true
```

CLI, MCP servers, and web all read the same config.

## Testing Across Interfaces

```powershell
# Test via CLI
python scripts/cli.py ingest --text "Test document"

# Query via MCP (Claude Desktop)
# "Search for: test document"

# Query via Python
python -c "from lib.rag_engine import get_rag_engine; print(get_rag_engine().search('test'))"
```

All should return the same results.

## Benefits

### For Users
- Use whatever tool fits your workflow
- No vendor lock-in
- Switch interfaces without data migration

### For Developers
- Fix bugs once, all interfaces benefit
- Add features to core, all interfaces get them
- Test in one place

### For AI Agents
- Multiple access paths
- Choose lowest latency (Python API)
- Or most convenient (MCP/CLI)

## Carbon Fiber Principle Applied

Minimum code, maximum flexibility:

- **Core modules**: 400 LOC total
- **CLI**: 150 LOC
- **MCP servers**: 200 LOC
- **Total**: ~750 LOC for full stack

No duplication, no abstraction overhead.

## Implementation Guidelines

### DO:
✓ Put all logic in `lib/`
✓ Keep interfaces thin (< 200 LOC)
✓ Share configuration via `.env`
✓ Use same data directory

### DON'T:
✗ Duplicate logic in multiple interfaces
✗ Add interface-specific features to core
✗ Create separate databases per interface
✗ Hardcode paths or configs

## Future Interfaces

Easy to add:
- Telegram bot
- Discord bot
- HTTP REST API
- GraphQL API
- gRPC service
- Obsidian plugin
- Raycast extension

All would be ~100 LOC wrappers around `lib/`.

## Summary

The sovereign-rag-stack achieves true CLI-agnosticism by:

1. **Separating core from interface**
2. **Using standard protocols** (MCP, HTTP, Python)
3. **Sharing data** (single source of truth)
4. **Consistent configuration** (one .env)
5. **No duplication** (YAGNI principle)

Result: Works from terminal, Claude Desktop, Cursor, Goose, or custom tools without modification.
