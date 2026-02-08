# Quickstart: Local Deployment

Get your sovereign RAG stack running locally in under 10 minutes.

## Prerequisites

- Windows 10/11
- Python 3.11+
- Git
- Anthropic API key

## Installation

### 1. Clone Repository

```powershell
git clone https://github.com/ValoLoco/sovereign-rag-stack.git
cd sovereign-rag-stack
```

### 2. Run Installer

```powershell
.\scripts\install.ps1
```

This will:
- Create virtual environment
- Install all dependencies
- Set up data directories in `C:\BUENATURA`
- Create `.env` file

### 3. Configure Environment

Edit `.env`:

```bash
ANTHROPIC_API_KEY=sk-ant-...
VECTOR_DB_PATH=C:\BUENATURA\vectors
MEM0_USE_LOCAL=true
```

### 4. Test CLI

```powershell
# Activate virtual environment
.venv\Scripts\Activate.ps1

# Test installation
python scripts/cli.py collections

# Ingest a document
python scripts/cli.py ingest --text "BUENATURA is a holdings company focused on sovereign technology."

# Search
python scripts/cli.py search "What is BUENATURA?" --limit 3
```

## CLI Usage

The CLI works from any terminal (PowerShell, CMD, Windows Terminal).

### Ingest Documents

```powershell
# Ingest text
python scripts/cli.py ingest --text "Your content here"

# Ingest file
python scripts/cli.py ingest --file "path/to/document.txt"
```

### Search Documents

```powershell
# Basic search
python scripts/cli.py search "your query" --limit 5

# Search with user memory
python scripts/cli.py search "your query" --user-id valentin --limit 5
```

### Manage Memories

```powershell
# Add memory
python scripts/cli.py memory add --user-id valentin --content "I prefer TypeScript over JavaScript"

# List all memories
python scripts/cli.py memory list --user-id valentin

# Search memories
python scripts/cli.py memory search --user-id valentin --query "programming preferences"

# Delete memory
python scripts/cli.py memory delete --user-id valentin --memory-id abc123

# Delete all memories
python scripts/cli.py memory delete --user-id valentin --all
```

### List Collections

```powershell
python scripts/cli.py collections
```

## Claude Desktop Integration

### 1. Install Claude Desktop

Download from [claude.ai/download](https://claude.ai/download)

### 2. Configure MCP Servers

Edit your Claude Desktop config:

**Location**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "buenatura-memory": {
      "command": "python",
      "args": [
        "C:\\Users\\YourName\\sovereign-rag-stack\\mcp\\memory_server.py"
      ],
      "env": {
        "ANTHROPIC_API_KEY": "sk-ant-...",
        "VECTOR_DB_PATH": "C:\\BUENATURA\\vectors",
        "MEM0_USE_LOCAL": "true"
      }
    },
    "buenatura-rag": {
      "command": "python",
      "args": [
        "C:\\Users\\YourName\\sovereign-rag-stack\\mcp\\buenatura_rag_server.py"
      ],
      "env": {
        "ANTHROPIC_API_KEY": "sk-ant-...",
        "RAG_DATA_DIR": "C:\\BUENATURA\\knowledge",
        "RAG_DB_DIR": "C:\\BUENATURA\\vectors"
      }
    }
  }
}
```

**Important**: Replace `C:\\Users\\YourName\\` with your actual path.

### 3. Restart Claude Desktop

Close and reopen Claude Desktop. You should now see MCP tools available.

### 4. Test in Claude

In Claude Desktop:

```
Add a memory: "I am Valentin Kranz, founder of BUENATURA Holdings"
```

Claude will use the `add_memory` tool.

```
Search my memories for information about myself
```

Claude will use the `search_memories` tool.

## Cursor Integration

Cursor IDE can connect to the same MCP servers.

### Configuration

Add to Cursor settings:

```json
{
  "mcp": {
    "servers": {
      "buenatura-memory": {
        "command": "python",
        "args": ["C:\\path\\to\\mcp\\memory_server.py"]
      }
    }
  }
}
```

## VSCode Integration

For VSCode, you can:

1. Use the CLI directly in the integrated terminal
2. Install Claude/AI extensions that support MCP
3. Run MCP servers as background processes

## Goose Integration

Goose can call your CLI:

```python
import subprocess

result = subprocess.run(
    ["python", "scripts/cli.py", "search", "your query"],
    capture_output=True,
    text=True
)
print(result.stdout)
```

## Verify Installation

```powershell
# Check Python environment
python --version

# Check dependencies
pip list | Select-String "mem0\|lancedb\|sentence-transformers"

# Test embedding generation
python -c "from lib.embeddings import get_embeddings; e = get_embeddings(); print(f'Embedding dimension: {e.dimension}')"

# Test vector store
python -c "from lib.vector_store import get_vector_store; vs = get_vector_store(); print(f'Collections: {vs.list_collections()}')"
```

## Data Locations

All data is stored locally:

```
C:\BUENATURA\
├── vectors\          # Vector embeddings (LanceDB)
├── knowledge\        # Original documents
└── conversations\    # Chat history
```

No data leaves your machine except LLM API calls to Anthropic.

## Troubleshooting

### Python Not Found

```powershell
winget install Python.Python.3.11
```

### MCP Server Not Starting

Check logs in Claude Desktop:
- Help → View Logs
- Look for MCP server errors

### Import Errors

Ensure virtual environment is activated:

```powershell
.venv\Scripts\Activate.ps1
```

### Permission Issues

Run PowerShell as Administrator to create `C:\BUENATURA`.

## Next Steps

- [Architecture Overview](./ARCHITECTURE.md)
- [API Reference](./API_REFERENCE.md)
- [Advanced Configuration](./ADVANCED_CONFIG.md)
- [Web Mode Deployment](./WEB_DEPLOYMENT.md)

## Support

- GitHub Issues: [github.com/ValoLoco/sovereign-rag-stack/issues](https://github.com/ValoLoco/sovereign-rag-stack/issues)
- Discussions: [github.com/ValoLoco/sovereign-rag-stack/discussions](https://github.com/ValoLoco/sovereign-rag-stack/discussions)
