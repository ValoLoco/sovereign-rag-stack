# Goose CLI + Ollama Setup Guide

Run your sovereign RAG stack with Goose AI agent using fully local Ollama models.

## Overview

This setup gives you:
- **Goose CLI** for autonomous AI agent workflows[web:36][web:39]
- **Ollama** for local LLM inference (no API costs)[web:41][web:44]
- **Full integration** with your RAG stack and memory layer

## Prerequisites

- Windows 10/11
- Python 3.11+
- 8GB+ RAM (16GB recommended for larger models)

## Part 1: Install Ollama

### 1. Download and Install

```powershell
# Download from ollama.com
winget install Ollama.Ollama

# Or download directly
# https://ollama.com/download/windows
```

### 2. Verify Installation

```powershell
ollama --version
```

### 3. Pull Models

**Recommended models:**

```powershell
# Llama 3.3 (best general purpose, 8B params)
ollama pull llama3.3

# Qwen 2.5 (great for coding, 7B params)
ollama pull qwen2.5:7b

# DeepSeek-R1 (reasoning, 7B distill)
ollama pull deepseek-r1:7b

# Gemma 2 (efficient, 9B params)
ollama pull gemma2:9b
```

### 4. Test Ollama

```powershell
ollama run llama3.3
```

Type a message, press Enter. Use `/bye` to exit.

### 5. Configure Context Window

For better results with Goose, increase context size[web:42]:

```powershell
# Get model configuration
ollama show llama3.3 --modelfile > llama3.3.modelfile

# Edit file and add/update this line:
# PARAMETER num_ctx 8192

# Create custom model
ollama create llama3.3-8k --file llama3.3.modelfile

# Verify
ollama list
```

## Part 2: Install Goose CLI

### 1. Download Goose

**Option A: Direct download**[web:38]
```powershell
curl -fsSL https://github.com/block/goose/releases/download/stable/download_cli.sh | bash
```

**Option B: Manual download**[web:38]
- Visit [github.com/block/goose/releases](https://github.com/block/goose/releases)
- Download Windows binary
- Extract to `C:\Program Files\Goose`
- Add to PATH

### 2. Verify Installation

```powershell
goose --version
```

### 3. Configure Goose with Ollama

```powershell
goose configure
```

**Follow prompts:**[web:48]
1. Select "Configure Providers"
2. Choose "Ollama"
3. Confirm API Host: `http://localhost:11434`
4. Enter model name: `llama3.3-8k` (or your preferred model)

**Configuration is saved to:**
```
%USERPROFILE%\.config\goose\config.yaml
```

### 4. Test Goose

```powershell
goose session start
```

Try: "Help me write a Python function that calculates fibonacci numbers"

## Part 3: Integrate with Sovereign RAG Stack

### 1. Update Environment Variables

Edit your `.env` file:

```bash
# LLM Provider Configuration
LLM_PROVIDER=ollama
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.3-8k

# Fallback to Anthropic (optional)
# LLM_PROVIDER=anthropic
# ANTHROPIC_API_KEY=sk-ant-...

# Memory configuration
MEM0_USE_LOCAL=true
VECTOR_DB_PATH=C:\BUENATURA\vectors
```

### 2. Install Additional Dependencies

```powershell
.venv\Scripts\Activate.ps1
pip install ollama anthropic
```

### 3. Test LLM Provider Switching

```powershell
# Test Ollama
python -c "from lib.llm_providers import get_llm_provider; llm = get_llm_provider('ollama'); print(llm.generate('Say hello'))"

# Test Anthropic (if configured)
python -c "from lib.llm_providers import get_llm_provider; llm = get_llm_provider('anthropic'); print(llm.generate('Say hello'))"
```

### 4. Use Goose with RAG Toolkit

Create a Goose session that can access your RAG stack:

```python
# integrations/goose_session.py
from integrations.goose_toolkit import create_goose_toolkit

toolkit = create_goose_toolkit(user_id="valentin")

# Ingest documents
toolkit.ingest_text("BUENATURA is a sovereign holdings company.")

# Query with RAG
result = toolkit.rag_query("What is BUENATURA?", use_memory=True)
print(result["answer"])
```

Run it:
```powershell
python integrations/goose_session.py
```

## Part 4: Advanced Goose Configuration

### Configure Multiple Providers

Edit `~/.config/goose/config.yaml`:

```yaml
providers:
  ollama:
    host: http://localhost:11434
    models:
      - llama3.3-8k
      - qwen2.5:7b
      - deepseek-r1:7b
  
  anthropic:
    api_key: ${ANTHROPIC_API_KEY}
    models:
      - claude-sonnet-4-20250514

default_provider: ollama
default_model: llama3.3-8k
```

### Add Extensions

Goose supports MCP-compatible extensions:

```powershell
goose configure
# Select "Add Extension"
```

You can add your MCP servers as Goose extensions.

## Part 5: Usage Patterns

### Pattern 1: Goose as Autonomous Agent

```powershell
goose session start
```

Goose can:
- Execute commands
- Read/write files
- Run Python scripts
- Access your RAG toolkit

**Example prompts:**
- "Analyze all markdown files in docs/ and summarize key points"
- "Search my knowledge base for information about X"
- "Add this conversation to memory"

### Pattern 2: Goose + CLI Hybrid

```powershell
# Use CLI for specific operations
python scripts/cli.py ingest --file document.txt

# Use Goose for reasoning and synthesis
goose session start
# "Based on the documents I just ingested, create a summary"
```

### Pattern 3: Goose with Python API

```python
from integrations.goose_toolkit import create_goose_toolkit
from lib.llm_providers import get_llm_provider

toolkit = create_goose_toolkit()
llm = get_llm_provider("ollama", model="llama3.3-8k")

# Search knowledge
results = toolkit.search_knowledge("sovereign technology")

# Generate with LLM
context = "\n".join([r["text"] for r in results["results"]])
answer = llm.generate(f"Based on: {context}\n\nQuestion: What is sovereign tech?")
print(answer)
```

## Model Recommendations

### For General Use
- **llama3.3:8b** - Best all-around performance
- **qwen2.5:7b** - Excellent for code and technical tasks

### For Reasoning
- **deepseek-r1:7b** - Shows reasoning steps
- **gemma2:9b** - Good balance of speed and quality

### For Low Memory
- **llama3.2:3b** - Efficient, good for simple tasks
- **phi3:mini** - Very fast, 3.8B params

## Performance Optimization

### GPU Acceleration

If you have NVIDIA GPU:

```powershell
# Ollama automatically uses GPU if available
ollama run llama3.3
```

Check GPU usage:
```powershell
nvidia-smi
```

### CPU Optimization

Set thread count:
```powershell
$env:OLLAMA_NUM_THREADS="8"  # Match your CPU cores
ollama serve
```

## Troubleshooting

### Ollama Not Running

```powershell
# Check service
Get-Service Ollama

# Start manually
ollama serve
```

### Goose Can't Connect to Ollama

```powershell
# Verify Ollama is accessible
curl http://localhost:11434/api/version

# Check OLLAMA_HOST in goose config
goose configure
```

### Context Window Errors

Increase model context size (see Part 1, Step 5).

### Out of Memory

Use smaller models:
```powershell
ollama pull llama3.2:3b
goose configure  # Select llama3.2:3b
```

## Comparison: Ollama vs Anthropic

| Feature | Ollama (Local) | Anthropic (Cloud) |
|---------|----------------|-------------------|
| Cost | Free | Pay per token |
| Privacy | 100% local | Data sent to API |
| Speed | Depends on hardware | Fast |
| Quality | Good (8B-70B models) | Excellent |
| Context | 4k-128k | 200k |
| Offline | Yes | No |

## Best Practices

### When to Use Ollama
- Sensitive data
- High volume queries
- Offline work
- Cost-sensitive projects

### When to Use Anthropic
- Maximum quality needed
- Large context windows
- Complex reasoning
- Production applications

### Hybrid Approach

Use both:
```bash
# .env configuration
LLM_PROVIDER=ollama  # Default
ANTHROPIC_API_KEY=sk-ant-...  # Fallback
```

Switch dynamically:
```python
llm = get_llm_provider("ollama")  # Use local
# llm = get_llm_provider("anthropic")  # Switch to cloud
```

## Next Steps

1. **Experiment with models** - Try different sizes/types
2. **Optimize performance** - Tune context size and threads
3. **Build workflows** - Combine Goose + RAG + Memory
4. **Add extensions** - Integrate MCP servers with Goose

## Resources

- [Ollama Documentation](https://ollama.com/docs)
- [Goose Documentation](https://block.github.io/goose/docs)[web:36]
- [Ollama Models Library](https://ollama.com/library)
- [Goose GitHub](https://github.com/block/goose)[web:39]
- [Goose + Ollama Guide](https://docs.ollama.com/integrations/goose)[web:48]

## Summary

You now have:

✓ Ollama running locally with optimized models  
✓ Goose CLI configured to use Ollama  
✓ RAG stack integrated with LLM provider abstraction  
✓ Toolkit for Goose to access your knowledge base  
✓ Option to switch between local and cloud LLMs  

**Result**: Fully sovereign AI agent with local LLMs and RAG capabilities.
