# Sync Architecture

## Overview

GitHub repository acts as single source of truth, bridging local Windows environment and Vercel web deployment.

## Sync Flow

### Local → GitHub → Web

```
┌──────────────┐    git push     ┌─────────────┐    webhook    ┌──────────────┐
│   Local PC   │ ───────────────► │   GitHub    │ ─────────────► │   Vercel     │
│  (Windows)   │                  │  Repository │                │   Web App    │
└──────────────┘                  └─────────────┘                └──────────────┘
```

### Web → GitHub → Local

```
┌──────────────┐  GitHub API    ┌─────────────┐    git pull    ┌──────────────┐
│   Vercel     │ ───────────────► │   GitHub    │ ◄───────────── │   Local PC   │
│   Web App    │                  │  Repository │                │  (Windows)   │
└──────────────┘                  └─────────────┘                └──────────────┘
```

## Synced Data Structure

```
shared/
├── memories/
│   ├── user_valentin/
│   │   ├── memories.json        # Serialized mem0 memories
│   │   └── index.meta           # Vector index metadata
│   └── sync_manifest.json       # Sync state
├── documents/
│   ├── ingested/
│   │   ├── doc1.txt
│   │   └── doc2.md
│   └── index.json               # Document registry
├── conversations/
│   ├── 2026-02-08_conversation.json
│   └── index.json
└── state.json                   # Global sync state
```

## Sync Mechanisms

### 1. Local Daemon (Windows)

**Location**: `scripts/sync-daemon.py`

Runs as Windows service, monitors changes:

```python
class SyncDaemon:
    def __init__(self):
        self.watch_dirs = [
            "C:\\BUENATURA\\knowledge",
            "C:\\BUENATURA\\mem0"
        ]
        self.sync_interval = 900  # 15 minutes
    
    def watch_and_sync(self):
        while True:
            changes = self.detect_changes()
            if changes:
                self.commit_and_push(changes)
            
            self.pull_remote_changes()
            time.sleep(self.sync_interval)
```

**Features**:
- File system watcher for immediate detection
- Periodic full scan as backup
- Delta compression for large files
- Automatic conflict resolution

### 2. GitHub Actions

**Location**: `.github/workflows/auto-sync.yml`

Triggers on push to sync branch:

```yaml
name: Auto Sync
on:
  push:
    branches: [sync]
    paths:
      - 'shared/**'

jobs:
  sync-to-vercel:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Trigger Vercel sync
        run: |
          curl -X POST https://flipadonga.com/api/sync/webhook \
            -H "Authorization: Bearer ${{ secrets.SYNC_TOKEN }}"
```

### 3. Web Sync Client

**Location**: `app/api/sync/route.ts`

Next.js API route handling sync from web:

```typescript
export async function POST(req: Request) {
  const changes = await req.json()
  
  // Commit to GitHub via Octokit
  await octokit.repos.createOrUpdateFileContents({
    owner: 'ValoLoco',
    repo: 'sovereign-rag-stack',
    path: `shared/${changes.path}`,
    message: `Sync from web: ${changes.description}`,
    content: Buffer.from(changes.content).toString('base64'),
    branch: 'sync'
  })
  
  return Response.json({ synced: true })
}
```

## Conflict Resolution

### Strategy: Last-Write-Wins with Timestamps

```json
{
  "file": "shared/memories/user_valentin/memories.json",
  "local_timestamp": "2026-02-08T17:30:00Z",
  "remote_timestamp": "2026-02-08T17:45:00Z",
  "winner": "remote",
  "action": "overwrite_local"
}
```

### Conflict Types

1. **Simple conflicts** (preferences, settings)
   - Resolution: Newest timestamp wins
   - No user intervention

2. **Document conflicts**
   - Resolution: Merge with markers
   - User review required

3. **Memory conflicts**
   - Resolution: Union merge (append)
   - Duplicate detection

### Manual Resolution UI

Web interface at `/settings/sync/conflicts`:

```tsx
function ConflictResolver({ conflicts }) {
  return (
    <div>
      {conflicts.map(conflict => (
        <ConflictCard
          local={conflict.local}
          remote={conflict.remote}
          onResolve={(choice) => resolve(conflict, choice)}
        />
      ))}
    </div>
  )
}
```

## State Tracking

### state.json Format

```json
{
  "version": "1.0.0",
  "last_sync": {
    "local_to_remote": "2026-02-08T17:48:00Z",
    "remote_to_local": "2026-02-08T17:50:00Z"
  },
  "files": {
    "shared/memories/user_valentin/memories.json": {
      "hash": "sha256:abc123...",
      "size": 4096,
      "last_modified": "2026-02-08T17:45:00Z",
      "source": "local"
    }
  },
  "pending_conflicts": [],
  "sync_health": {
    "status": "healthy",
    "last_error": null,
    "consecutive_failures": 0
  }
}
```

## Sync Optimization

### Delta Sync

Only transfer changed portions:

```python
def compute_delta(local_file, remote_file):
    """Compute binary delta for efficient sync"""
    return bsdiff.diff(local_file, remote_file)

def apply_delta(base_file, delta):
    """Apply delta patch"""
    return bsdiff.patch(base_file, delta)
```

### Compression

Large files compressed before sync:

```python
def compress_for_sync(content: bytes) -> bytes:
    """Compress using zstd for best ratio"""
    return zstd.compress(content, level=3)
```

### Batch Operations

Multiple changes batched into single commit:

```python
def batch_commit(changes: List[Change]):
    tree_changes = []
    for change in changes:
        tree_changes.append({
            'path': change.path,
            'mode': '100644',
            'type': 'blob',
            'content': change.content
        })
    
    # Single tree + commit
    tree = repo.create_git_tree(tree_changes)
    commit = repo.create_git_commit(
        message=f"Batch sync: {len(changes)} files",
        tree=tree
    )
```

## Monitoring

### Sync Dashboard

Web UI at `/settings/sync`:

- Real-time sync status
- Last sync timestamps
- Pending changes count
- Conflict resolution queue
- Sync history log

### Metrics Tracked

```typescript
interface SyncMetrics {
  totalSyncs: number
  successfulSyncs: number
  failedSyncs: number
  averageSyncDuration: number
  lastSyncTimestamp: Date
  pendingChanges: number
  conflictsResolved: number
}
```

## Error Handling

### Retry Strategy

Exponential backoff with jitter:

```python
def sync_with_retry(operation, max_retries=5):
    for attempt in range(max_retries):
        try:
            return operation()
        except SyncError as e:
            if attempt == max_retries - 1:
                raise
            
            backoff = (2 ** attempt) + random.uniform(0, 1)
            time.sleep(backoff)
```

### Failure Modes

1. **Network failure**
   - Queue changes locally
   - Retry when connection restored

2. **GitHub API rate limit**
   - Wait for rate limit reset
   - Use conditional requests

3. **Merge conflict**
   - Flag for manual resolution
   - Continue syncing other files

## Security

### Authentication

- Local: GitHub Personal Access Token (fine-grained)
- Web: GitHub App installation token
- Scope: `repo` (read/write)

### Encryption

- Transport: HTTPS/TLS 1.3
- At rest: GitHub encrypted storage
- Optional: E2E encryption for sensitive files

### Access Control

- GitHub repo: Private
- Collaborators: You only (default)
- Branch protection: Require signed commits

## Testing Sync

### Local Test

```powershell
python scripts/test-sync.py
```

Validates:
- Git configuration
- GitHub authentication
- Sync daemon functionality
- Conflict resolution

### Integration Test

```bash
npm run test:sync
```

Tests full cycle:
1. Create change locally
2. Verify GitHub commit
3. Trigger Vercel webhook
4. Verify web state updated
5. Pull from local
6. Verify consistency

---

**Sync keeps your sovereign stack unified across environments.**
