# Sovereign RAG Stack - Windows Installation Script
# Run as: .\scripts\install.ps1

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Sovereign RAG Stack Installer" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check Python
Write-Host "[1/6] Checking Python..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Python not found. Install Python 3.11+ from python.org" -ForegroundColor Red
    exit 1
}
Write-Host "✓ $pythonVersion" -ForegroundColor Green

# Create virtual environment
Write-Host ""
Write-Host "[2/6] Creating virtual environment..." -ForegroundColor Yellow
if (Test-Path ".venv") {
    Write-Host "✓ Virtual environment already exists" -ForegroundColor Green
} else {
    python -m venv .venv
    Write-Host "✓ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host ""
Write-Host "[3/6] Activating virtual environment..." -ForegroundColor Yellow
& ".venv\Scripts\Activate.ps1"
Write-Host "✓ Virtual environment activated" -ForegroundColor Green

# Install MCP dependencies
Write-Host ""
Write-Host "[4/6] Installing MCP dependencies..." -ForegroundColor Yellow
pip install -r mcp/requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Create data directories
Write-Host ""
Write-Host "[5/6] Creating data directories..." -ForegroundColor Yellow
$dataDir = "C:\BUENATURA"
if (-not (Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir | Out-Null
    New-Item -ItemType Directory -Path "$dataDir\vectors" | Out-Null
    New-Item -ItemType Directory -Path "$dataDir\knowledge" | Out-Null
    New-Item -ItemType Directory -Path "$dataDir\conversations" | Out-Null
    Write-Host "✓ Created $dataDir" -ForegroundColor Green
} else {
    Write-Host "✓ $dataDir already exists" -ForegroundColor Green
}

# Setup environment file
Write-Host ""
Write-Host "[6/6] Setting up environment..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created .env file" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠ IMPORTANT: Edit .env and add your ANTHROPIC_API_KEY" -ForegroundColor Yellow
} else {
    Write-Host "✓ .env file exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✓ Installation Complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env and add your API keys"
Write-Host "2. Test CLI: python scripts/cli.py collections"
Write-Host "3. Configure Claude Desktop with config/claude_desktop_config.json"
Write-Host ""
Write-Host "Documentation: docs/local-setup.md" -ForegroundColor Gray
