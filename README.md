# Sovereign RAG Stack

> Local AI infrastructure with full data sovereignty. Built for Windows with mem0 memory layer, Claude Desktop integration, and local vector storage.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)

## Overview

Sovereign RAG Stack gives you complete control over your AI infrastructure. Everything runs locally on your Windows machine except Claude API calls for LLM inference.

### What You Get

- **Full Data Sovereignty**: All documents, vectors, and conversations stored locally
- **Persistent Memory**: mem0 layer remembers context across sessions
- **Local Embeddings**: No external API calls for vector generation
- **Claude Integration**: Seamless connection via MCP protocol
- **Windows Native**: Optimized for Windows 10/11

### Architecture

```
┌─────────────────────────────────────────────────┐
│      YOUR LOCAL ENVIRONMENT (Windows PC)        │
│                                                 │
│  ┌──────────────────────────────────────┐     │
│  │   Claude Desktop (Windows App)       │     │
│  │   - Local storage in AppData         │     │
│  │   - MCP protocol for extensions      │     │
│  └──────────────┬───────────────────────┘     │
│                 │ MCP Protocol                 │
│  ┌──────────────┴───────────────────────┐     │
│  │   MCP RAG Server (Python)            │     │
│  │   - Document ingestion               │     │
│  │   - Semantic search                  │     │
│  │   - mem0 integration                 │     │
│  └──────────────┬───────────────────────┘     │
│                 │                              │
│  ┌──────────────┴───────────────────────┐     │
│  │   Local Vector Store (LanceDB)       │     │
│  │   - C:\\BUENATURA\\vectors\\            │     │
│  │   - No cloud sync                    │     │
│  └──────────────────────────────────────┘     │
│                                                 │
│  ┌──────────────────────────────────────┐     │
│  │   mem0 Memory Layer                  │     │
│  │   - Multi-level memory               │     │
│  │   - Persistent context               │     │
│  └──────────────────────────────────────┘     │
│                                                 │
│  ┌──────────────────────────────────────┐     │
│  │   Local Embedding Model              │     │
│  │   - sentence-transformers            │     │
│  │   - CPU/GPU inference                │     │
│  └──────────────────────────────────────┘     │
└─────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- Windows 10/11
- Python 3.11 or higher
- Claude Desktop app
- Anthropic API key

### Installation

1. **Clone the repository**

```powershell
git clone https://github.com/ValoLoco/sovereign-rag-stack.git
cd sovereign-rag-stack
```

2. **Run installation script**

```powershell
.\install.ps1
```

3. **Configure environment**

Edit `C:\BUENATURA\.env` with your settings:

```bash
ANTHROPIC_API_KEY=your_api_key_here
RAG_DATA_DIR=C:\BUENATURA\knowledge
RAG_DB_DIR=C:\BUENATURA\mem0\vectors
```

4. **Test installation**

```powershell
python test_setup.py
```

5. **Start using with Claude Desktop**

Open Claude Desktop. The MCP server connects automatically.

## Documentation

- [Installation Guide](docs/installation.md) - Step-by-step setup
- [Configuration](docs/configuration.md) - Environment variables and settings
- [MCP Server](docs/mcp-server.md) - Server architecture and tools
- [Memory Layer](docs/memory.md) - How mem0 works
- [Usage Examples](docs/examples.md) - Common workflows
- [Troubleshooting](docs/troubleshooting.md) - Common issues

## Project Structure

```
sovereign-rag-stack/
├── mcp/
│   ├── buenatura_rag_server.py  # Main MCP server
│   └── requirements.txt         # Python dependencies
├── scripts/
│   ├── install.ps1              # Windows installation
│   ├── test_setup.py            # Setup validation
│   └── ingest_knowledge.py      # Batch document ingestion
├── docs/
│   ├── installation.md
│   ├── configuration.md
│   ├── mcp-server.md
│   ├── memory.md
│   ├── examples.md
│   └── troubleshooting.md
├── config/
│   ├── claude_desktop_config.json  # Claude Desktop MCP config
│   └── .env.example                # Environment template
├── README.md
└── LICENSE
```

## Key Features

### Local Vector Storage

- **LanceDB** for fast, embedded vector search
- No external dependencies or cloud services
- Direct file system storage

### mem0 Memory Layer

- Persistent memory across sessions
- Multi-level memory (user, session, agent)
- Automatic context extraction
- Semantic similarity search

### MCP Tools

Available tools in Claude Desktop:

- `ingest_document` - Add documents to memory
- `search_memories` - Semantic search across knowledge base
- `get_all_memories` - Retrieve all stored memories
- `add_conversation` - Store conversations persistently

### Local Embeddings

- sentence-transformers models
- No API calls for embedding generation
- CPU and GPU support

## Advanced Usage

### Batch Document Ingestion

```powershell
python scripts/ingest_knowledge.py
```

Ingests all documents from `C:\BUENATURA\knowledge`

### Custom Memory Queries

```python
from mem0 import Memory

memory = Memory(config={...})
results = memory.search(query="your query", user_id="valentin")
```

### LangGraph Integration

See [docs/examples.md](docs/examples.md) for LangGraph workflow examples.

## Reference Repositories

This project builds upon:

- [mem0ai/mem0](https://github.com/mem0ai/mem0) - Memory layer foundation
- Your fork: [ValoLoco/mem0](https://github.com/ValoLoco/mem0)

## Contributing

This is a personal sovereignty stack. Fork and customize for your needs.

## License

MIT License - See [LICENSE](LICENSE) file

## Support

For issues or questions:
1. Check [docs/troubleshooting.md](docs/troubleshooting.md)
2. Review [mem0 documentation](https://docs.mem0.ai)
3. Open an issue in this repository

## Roadmap

- [ ] Perplexity Space migration tool
- [ ] LangGraph workflow library
- [ ] Web dashboard for memory management
- [ ] Docker containerization option
- [ ] Multi-user support

---

**Built with sovereignty principles for BUENATURA Holdings**
