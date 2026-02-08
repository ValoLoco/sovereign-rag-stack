# Deployment Guide

Complete deployment instructions for **flipadonga.com** with both frontend and backend.

## Architecture Overview

```
flipadonga.com (Frontend)          Backend (Python RAG)
        │                                   │
        │                                   │
    Next.js 15                          FastAPI
    React 19                            LanceDB
    Vercel                              Ollama/Anthropic
        │                                   │
        └──────── API Calls ──────────┘
```

## Frontend Deployment (Vercel)

### 1. Prerequisites

- GitHub account
- Vercel account ([vercel.com](https://vercel.com))
- Domain: flipadonga.com (configured in your registrar)

### 2. Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 3. Deploy to Vercel

**Option A: Automatic (Recommended)**

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Add Environment Variables (see below)
6. Click "Deploy"

**Option B: CLI**

```bash
npm install -g vercel
vercel login
vercel
```

Follow prompts, Vercel auto-detects Next.js.

### 4. Configure Custom Domain

1. In Vercel dashboard, go to **Settings > Domains**
2. Add `flipadonga.com`
3. Add DNS records in your domain registrar:

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

4. Wait for DNS propagation (5-60 minutes)
5. Vercel auto-provisions SSL certificate

### 5. Environment Variables (Vercel)

In Vercel dashboard, add:

```bash
NEXT_PUBLIC_API_URL=https://api.flipadonga.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
```

### 6. Verify Deployment

Visit [https://flipadonga.com](https://flipadonga.com)

Expected: Login page with clean UI.

## Backend Deployment

### Option 1: Local Server (Development)

**Best for**: Testing, development, full sovereignty

```bash
# Install dependencies
pip install -r mcp/requirements.txt

# Start Ollama
ollama serve

# In another terminal, start FastAPI
cd api
uvicorn server:app --host 0.0.0.0 --port 8000
```

API runs at `http://localhost:8000`.

**Expose to Internet (for testing)**:

```bash
# Using ngrok
ngrok http 8000

# Use ngrok URL in Vercel env:
NEXT_PUBLIC_API_URL=https://abc123.ngrok.io
```

### Option 2: VPS Deployment (Production)

**Best for**: Production, full control, cost-effective

**Recommended Providers**:
- Hetzner (EU, privacy-focused): €5-20/month
- DigitalOcean: $12-48/month
- Vultr: $12-48/month

**Requirements**:
- 4GB RAM minimum (8GB recommended for Ollama)
- 50GB storage
- Ubuntu 22.04 LTS

#### Setup Steps

**1. Create VPS**

Example: Hetzner Cloud

```bash
# SSH into server
ssh root@your-server-ip
```

**2. Install Dependencies**

```bash
# Update system
apt update && apt upgrade -y

# Install Python 3.11
apt install -y python3.11 python3.11-venv python3-pip

# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama
systemctl start ollama
systemctl enable ollama

# Pull models
ollama pull llama3.3
ollama pull qwen2.5
```

**3. Deploy Backend**

```bash
# Clone repo
git clone https://github.com/ValoLoco/sovereign-rag-stack.git
cd sovereign-rag-stack

# Create virtual environment
python3.11 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r mcp/requirements.txt

# Create .env
cat > .env << EOF
LOCAL_DATA_DIR=/var/lib/rag
LLM_PROVIDER=ollama
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.3
MEM0_USE_LOCAL=true
LOG_LEVEL=INFO
EOF

# Create data directory
mkdir -p /var/lib/rag
```

**4. Run as Service**

Create `/etc/systemd/system/rag-api.service`:

```ini
[Unit]
Description=RAG API Server
After=network.target ollama.service

[Service]
Type=simple
User=root
WorkingDirectory=/root/sovereign-rag-stack
Environment="PATH=/root/sovereign-rag-stack/.venv/bin"
ExecStart=/root/sovereign-rag-stack/.venv/bin/uvicorn api.server:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
systemctl daemon-reload
systemctl enable rag-api
systemctl start rag-api
systemctl status rag-api
```

**5. Configure Nginx (Reverse Proxy)**

```bash
# Install Nginx
apt install -y nginx certbot python3-certbot-nginx

# Create config
cat > /etc/nginx/sites-available/api << EOF
server {
    listen 80;
    server_name api.flipadonga.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/api /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Get SSL certificate
certbot --nginx -d api.flipadonga.com
```

**6. Configure DNS**

Add A record for API subdomain:

```
Type    Name    Value
A       api     your-server-ip
```

**7. Update Vercel Environment**

```bash
NEXT_PUBLIC_API_URL=https://api.flipadonga.com
```

Redeploy frontend in Vercel.

### Option 3: Railway (Managed)

**Best for**: Quick deployment, managed infrastructure

**Limitations**: May not support Ollama (GPU required)

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Add environment variables
6. Railway auto-deploys

**Note**: Use Anthropic Claude instead of Ollama for Railway.

```bash
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

## Production Checklist

### Frontend (Vercel)

- [ ] Custom domain configured (flipadonga.com)
- [ ] SSL certificate active (auto by Vercel)
- [ ] Environment variables set
- [ ] Build successful
- [ ] Login page loads
- [ ] Chat interface loads
- [ ] File upload works
- [ ] Model selection works

### Backend (VPS)

- [ ] Server provisioned (4GB+ RAM)
- [ ] Ollama installed and running
- [ ] Models pulled (llama3.3, qwen2.5)
- [ ] Python dependencies installed
- [ ] RAG API running as service
- [ ] Nginx configured as reverse proxy
- [ ] SSL certificate active (Let's Encrypt)
- [ ] DNS pointing to server
- [ ] Health check endpoint works (`/health`)
- [ ] Logs rotating (`/var/lib/rag/logs`)

### Integration

- [ ] Frontend can reach backend API
- [ ] CORS configured correctly
- [ ] Authentication working (Clerk)
- [ ] File upload to backend works
- [ ] RAG queries return results
- [ ] Memory persistence works
- [ ] Error handling graceful

## Monitoring

### Frontend (Vercel)

Vercel dashboard shows:
- Deployment status
- Build logs
- Analytics
- Web vitals

### Backend (VPS)

**System Monitoring**

```bash
# Install monitoring tools
apt install -y htop iotop nethogs

# Check resource usage
htop

# Check logs
journalctl -u rag-api -f
journalctl -u ollama -f
```

**Health Checks**

```bash
# API health
curl https://api.flipadonga.com/health | jq

# Ollama health
curl http://localhost:11434/api/version
```

**Automated Monitoring (Optional)**

Use UptimeRobot or similar:
- Monitor `https://flipadonga.com`
- Monitor `https://api.flipadonga.com/health`
- Alert on downtime

## Backup Strategy

### Data Backup (VPS)

```bash
# Backup script
cat > /root/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=/var/backups/rag
DATE=$(date +%Y%m%d)

mkdir -p $BACKUP_DIR

# Backup data
tar -czf $BACKUP_DIR/rag-data-$DATE.tar.gz /var/lib/rag

# Keep last 7 days
find $BACKUP_DIR -name "rag-data-*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /root/backup.sh

# Run daily
crontab -e
# Add: 0 2 * * * /root/backup.sh >> /var/log/rag-backup.log 2>&1
```

### Database Backup

```bash
# LanceDB backup (automatic, file-based)
cp -r /var/lib/rag/lancedb /var/backups/rag/lancedb-backup
```

## Scaling

### Horizontal Scaling

Use load balancer (Nginx) with multiple backend instances:

```nginx
upstream rag_backend {
    server 10.0.0.1:8000;
    server 10.0.0.2:8000;
    server 10.0.0.3:8000;
}

server {
    location / {
        proxy_pass http://rag_backend;
    }
}
```

### Vertical Scaling

Upgrade VPS:
- 8GB RAM → 16GB for larger models
- Add GPU for faster inference
- Increase storage for more documents

## Troubleshooting

### Frontend Not Loading

```bash
# Check Vercel logs
vercel logs

# Check browser console for errors
# Verify API_URL is correct
```

### Backend Not Responding

```bash
# Check service status
systemctl status rag-api
systemctl status ollama

# Check logs
journalctl -u rag-api -n 100

# Test locally
curl http://localhost:8000/health

# Check Ollama
curl http://localhost:11434/api/version
```

### Ollama Out of Memory

```bash
# Use smaller model
ollama pull llama3.2:1b

# Or upgrade RAM
# Or use Anthropic instead
```

### SSL Certificate Issues

```bash
# Renew Let's Encrypt
certbot renew --dry-run

# Force renewal
certbot renew --force-renewal
```

## Cost Estimate

### Development

- **Frontend**: Vercel (Free tier)
- **Backend**: Local machine (Free)
- **Total**: €0/month

### Production (Small)

- **Frontend**: Vercel Pro (€20/month)
- **Backend**: Hetzner CX21 (€5/month)
- **Domain**: €10/year
- **Total**: €25-30/month

### Production (Medium)

- **Frontend**: Vercel Pro (€20/month)
- **Backend**: Hetzner CX31 (€10/month) or CCX23 with GPU (€50/month)
- **Backup Storage**: €5/month
- **Total**: €35-75/month

## Security

### Frontend

- HTTPS enforced (Vercel auto)
- CSP headers configured
- Rate limiting (Vercel Edge)
- DDoS protection (Vercel)

### Backend

```bash
# Firewall
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable

# Fail2ban (brute force protection)
apt install -y fail2ban
systemctl enable fail2ban
```

### API Authentication

Add API key middleware in FastAPI:

```python
from fastapi import Header, HTTPException

async def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != os.getenv("API_KEY"):
        raise HTTPException(status_code=403)
    return x_api_key

@app.post("/chat", dependencies=[Depends(verify_api_key)])
async def chat(...):
    ...
```

## Next Steps

1. **Deploy frontend to Vercel**
2. **Set up VPS for backend**
3. **Configure DNS**
4. **Test end-to-end**
5. **Set up monitoring**
6. **Configure backups**
7. **Add Clerk authentication**
8. **Optimize performance**

## Support

Issues? Check:
- [GitHub Issues](https://github.com/ValoLoco/sovereign-rag-stack/issues)
- [Vercel Docs](https://vercel.com/docs)
- [Ollama Docs](https://ollama.com/docs)
