"""Health monitoring and diagnostics.

Provides health checks for all system components.
"""

import os
import time
from typing import Dict, Any, Optional
from datetime import datetime
import platform

from lib.logger import get_logger

logger = get_logger("health")


class HealthMonitor:
    def __init__(self):
        self.start_time = time.time()
        self.checks_performed = 0
        self.last_check = None
    
    def check_all(self) -> Dict[str, Any]:
        self.checks_performed += 1
        self.last_check = datetime.now()
        
        return {
            "status": "healthy",
            "timestamp": self.last_check.isoformat(),
            "uptime_seconds": int(time.time() - self.start_time),
            "checks_performed": self.checks_performed,
            "components": {
                "system": self._check_system(),
                "embeddings": self._check_embeddings(),
                "vector_store": self._check_vector_store(),
                "memory_layer": self._check_memory(),
                "llm_providers": self._check_llm_providers(),
            }
        }
    
    def _check_system(self) -> Dict[str, Any]:
        try:
            data_dir = os.getenv("LOCAL_DATA_DIR", "C:\\BUENATURA")
            exists = os.path.exists(data_dir)
            
            return {
                "status": "healthy" if exists else "degraded",
                "platform": platform.system(),
                "python_version": platform.python_version(),
                "data_directory": data_dir,
                "data_directory_exists": exists
            }
        except Exception as e:
            logger.error(f"System check failed: {e}")
            return {"status": "unhealthy", "error": str(e)}
    
    def _check_embeddings(self) -> Dict[str, Any]:
        try:
            from lib.embeddings import get_embeddings
            
            embeddings = get_embeddings()
            test_embedding = embeddings.embed_query("test")
            
            return {
                "status": "healthy",
                "model": embeddings.model_name,
                "dimension": embeddings.dimension,
                "test_passed": len(test_embedding) == embeddings.dimension
            }
        except Exception as e:
            logger.error(f"Embeddings check failed: {e}")
            return {"status": "unhealthy", "error": str(e)}
    
    def _check_vector_store(self) -> Dict[str, Any]:
        try:
            from lib.vector_store import get_vector_store
            
            store = get_vector_store()
            collections = store.list_collections()
            
            return {
                "status": "healthy",
                "collections": collections,
                "collection_count": len(collections)
            }
        except Exception as e:
            logger.error(f"Vector store check failed: {e}")
            return {"status": "unhealthy", "error": str(e)}
    
    def _check_memory(self) -> Dict[str, Any]:
        try:
            from lib.memory_layer import get_memory_layer
            
            memory = get_memory_layer()
            
            return {
                "status": "healthy",
                "use_local": os.getenv("MEM0_USE_LOCAL", "false").lower() == "true"
            }
        except Exception as e:
            logger.error(f"Memory layer check failed: {e}")
            return {"status": "unhealthy", "error": str(e)}
    
    def _check_llm_providers(self) -> Dict[str, Any]:
        provider = os.getenv("LLM_PROVIDER", "anthropic")
        
        checks = {
            "active_provider": provider
        }
        
        if provider == "anthropic":
            api_key = os.getenv("ANTHROPIC_API_KEY")
            checks["anthropic"] = {
                "status": "configured" if api_key else "not_configured",
                "model": os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-20250514")
            }
        
        if provider == "ollama":
            host = os.getenv("OLLAMA_HOST", "http://localhost:11434")
            checks["ollama"] = {
                "status": "configured",
                "host": host,
                "model": os.getenv("OLLAMA_MODEL", "llama3.3")
            }
            
            try:
                import requests
                response = requests.get(f"{host}/api/version", timeout=2)
                checks["ollama"]["status"] = "healthy" if response.status_code == 200 else "unreachable"
                checks["ollama"]["version"] = response.json().get("version", "unknown")
            except Exception as e:
                checks["ollama"]["status"] = "unreachable"
                checks["ollama"]["error"] = str(e)
        
        return checks
    
    def quick_check(self) -> bool:
        try:
            result = self.check_all()
            return result["status"] == "healthy"
        except Exception as e:
            logger.error(f"Quick check failed: {e}")
            return False


_monitor = None


def get_health_monitor() -> HealthMonitor:
    global _monitor
    if _monitor is None:
        _monitor = HealthMonitor()
    return _monitor
