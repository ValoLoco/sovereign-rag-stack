"""
Local sync daemon for Windows
Monitors C:\BUENATURA and syncs to GitHub
"""

import os
import time
import json
import hashlib
from pathlib import Path
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import git
from dotenv import load_dotenv

load_dotenv()

class SyncDaemon:
    def __init__(self):
        self.base_path = Path("C:\\BUENATURA")
        self.repo_path = Path.cwd()
        self.sync_interval = int(os.getenv("SYNC_INTERVAL", "900"))
        
        self.repo = git.Repo(self.repo_path)
        self.watch_dirs = [
            self.base_path / "knowledge",
            self.base_path / "mem0"
        ]
        
        self.state_file = self.repo_path / "shared" / "state.json"
        self.state = self.load_state()
    
    def load_state(self):
        if self.state_file.exists():
            with open(self.state_file, 'r') as f:
                return json.load(f)
        return {
            "version": "1.0.0",
            "last_sync": {},
            "files": {},
            "pending_conflicts": [],
            "sync_health": {"status": "healthy"}
        }
    
    def save_state(self):
        self.state_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.state_file, 'w') as f:
            json.dump(self.state, f, indent=2)
    
    def compute_hash(self, file_path: Path) -> str:
        with open(file_path, 'rb') as f:
            return hashlib.sha256(f.read()).hexdigest()
    
    def detect_changes(self) -> list:
        changes = []
        
        for watch_dir in self.watch_dirs:
            if not watch_dir.exists():
                continue
            
            for file_path in watch_dir.rglob('*'):
                if file_path.is_file():
                    rel_path = str(file_path.relative_to(self.base_path))
                    current_hash = self.compute_hash(file_path)
                    
                    stored_hash = self.state["files"].get(rel_path, {}).get("hash")
                    
                    if current_hash != stored_hash:
                        changes.append({
                            "path": rel_path,
                            "hash": current_hash,
                            "size": file_path.stat().st_size,
                            "modified": datetime.fromtimestamp(
                                file_path.stat().st_mtime
                            ).isoformat()
                        })
        
        return changes
    
    def commit_and_push(self, changes: list):
        if not changes:
            return
        
        print(f"\ud83d� Syncing {len(changes)} files to GitHub...")
        
        # Copy changed files to shared/ directory
        for change in changes:
            src = self.base_path / change["path"]
            dst = self.repo_path / "shared" / change["path"]
            dst.parent.mkdir(parents=True, exist_ok=True)
            
            if src.exists():
                import shutil
                shutil.copy2(src, dst)
                
                # Update state
                self.state["files"][change["path"]] = {
                    "hash": change["hash"],
                    "size": change["size"],
                    "last_modified": change["modified"],
                    "source": "local"
                }
        
        # Update timestamps
        self.state["last_sync"]["local_to_remote"] = datetime.now().isoformat()
        self.save_state()
        
        # Git commit and push
        try:
            self.repo.index.add(['shared/'])
            self.repo.index.commit(f"Sync from local: {len(changes)} files")
            origin = self.repo.remote('origin')
            origin.push('sync')
            print("✅ Sync complete")
        except Exception as e:
            print(f"❌ Sync failed: {e}")
    
    def pull_remote_changes(self):
        try:
            origin = self.repo.remote('origin')
            origin.pull('sync')
            
            # Copy synced files back to C:\BUENATURA
            shared_dir = self.repo_path / "shared"
            if shared_dir.exists():
                import shutil
                for file_path in shared_dir.rglob('*'):
                    if file_path.is_file() and file_path.name != 'state.json':
                        rel_path = file_path.relative_to(shared_dir)
                        dst = self.base_path / rel_path
                        dst.parent.mkdir(parents=True, exist_ok=True)
                        shutil.copy2(file_path, dst)
            
            self.state["last_sync"]["remote_to_local"] = datetime.now().isoformat()
            print("✅ Pulled remote changes")
        except Exception as e:
            print(f"❌ Pull failed: {e}")
    
    def run(self):
        print("🚀 Sovereign RAG Stack - Sync Daemon")
        print(f"Watching: {', '.join(str(d) for d in self.watch_dirs)}")
        print(f"Sync interval: {self.sync_interval}s\n")
        
        while True:
            try:
                changes = self.detect_changes()
                if changes:
                    self.commit_and_push(changes)
                
                self.pull_remote_changes()
                
                time.sleep(self.sync_interval)
            except KeyboardInterrupt:
                print("\n🛑 Daemon stopped")
                break
            except Exception as e:
                print(f"❌ Error: {e}")
                time.sleep(60)

if __name__ == "__main__":
    daemon = SyncDaemon()
    daemon.run()
