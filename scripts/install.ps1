# Sovereign RAG Stack Installation Script
# Run as Administrator

Write-Host "🚀 Installing Sovereign RAG Stack..." -ForegroundColor Cyan

$basePath = "C:\BUENATURA"

# Create directory structure
Write-Host "\n📁 Creating directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "$basePath\mem0\vectors" | Out-Null
New-Item -ItemType Directory -Force -Path "$basePath\knowledge" | Out-Null
New-Item -ItemType Directory -Force -Path "$basePath\mcp" | Out-Null
New-Item -ItemType Directory -Force -Path "$basePath\workflows" | Out-Null
New-Item -ItemType Directory -Force -Path "$basePath\logs" | Out-Null

# Create Python virtual environment
Write-Host "\n🐍 Creating Python environment..." -ForegroundColor Yellow
Set-Location $basePath
python -m venv venv
& "$basePath\venv\Scripts\Activate.ps1"

# Install dependencies
Write-Host "\n📦 Installing dependencies..." -ForegroundColor Yellow
pip install --upgrade pip
pip install mem0ai
pip install langchain-anthropic
pip install langgraph
pip install chromadb
pip install lancedb
pip install sentence-transformers
pip install python-dotenv
pip install fastmcp

# Copy MCP server
Write-Host "\n📥 Copying MCP server..." -ForegroundColor Yellow
Copy-Item -Path "..\mcp\buenatura_rag_server.py" -Destination "$basePath\mcp\" -Force

# Create .env file
Write-Host "\n⚙️ Creating configuration..." -ForegroundColor Yellow
$envContent = @"
ANTHROPIC_API_KEY=your_api_key_here
RAG_DATA_DIR=C:\BUENATURA\knowledge
RAG_DB_DIR=C:\BUENATURA\mem0\vectors
MEM0_DB_PATH=C:\BUENATURA\mem0\vectors\memory.db
LOG_DIR=C:\BUENATURA\logs
VECTOR_STORE=lancedb
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
MEM0_HISTORY_LIMIT=10
MEM0_RELEVANCE_THRESHOLD=0.7
"@

$envContent | Out-File -FilePath "$basePath\.env" -Encoding utf8

# Configure Claude Desktop
Write-Host "\n🤖 Configuring Claude Desktop..." -ForegroundColor Yellow
$claudeConfigPath = "$env:APPDATA\Claude"
New-Item -ItemType Directory -Force -Path $claudeConfigPath | Out-Null

$claudeConfig = @"
{
  "mcpServers": {
    "buenatura-sovereign-rag": {
      "command": "C:\\BUENATURA\\venv\\Scripts\\python.exe",
      "args": ["C:\\BUENATURA\\mcp\\buenatura_rag_server.py"],
      "env": {
        "PYTHONPATH": "C:\\BUENATURA",
        "RAG_DATA_DIR": "C:\\BUENATURA\\knowledge",
        "RAG_DB_DIR": "C:\\BUENATURA\\mem0\\vectors"
      }
    }
  }
}
"@

$claudeConfig | Out-File -FilePath "$claudeConfigPath\claude_desktop_config.json" -Encoding utf8

Write-Host "\n✅ Installation complete!" -ForegroundColor Green
Write-Host "\nNext steps:" -ForegroundColor Cyan
Write-Host "1. Edit C:\BUENATURA\.env and add your Anthropic API key" -ForegroundColor White
Write-Host "2. Run: python test_setup.py" -ForegroundColor White
Write-Host "3. Open Claude Desktop" -ForegroundColor White
Write-Host "\n🚀 Ready for sovereign AI!" -ForegroundColor Green
