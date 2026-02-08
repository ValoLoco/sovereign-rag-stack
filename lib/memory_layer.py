"""Memory layer using mem0 for persistent context.

Integrates with mem0 for user, session, and agent memory.
Supports local and cloud modes.
"""

import os
from typing import List, Dict, Any, Optional
from mem0 import Memory


class MemoryLayer:
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or self._default_config()
        self.memory = Memory(config=self.config)
    
    def _default_config(self) -> Dict[str, Any]:
        use_local = os.getenv("MEM0_USE_LOCAL", "true").lower() == "true"
        
        if use_local:
            return {
                "vector_store": {
                    "provider": "lancedb",
                    "config": {
                        "uri": os.getenv("VECTOR_DB_PATH", "./data/vectors"),
                        "collection_name": "mem0_memories"
                    }
                },
                "llm": {
                    "provider": "anthropic",
                    "config": {
                        "model": "claude-sonnet-4-20250514",
                        "api_key": os.getenv("ANTHROPIC_API_KEY")
                    }
                },
                "embedder": {
                    "provider": "huggingface",
                    "config": {
                        "model": "sentence-transformers/all-MiniLM-L6-v2"
                    }
                }
            }
        else:
            return {
                "llm": {
                    "provider": "anthropic",
                    "config": {
                        "model": "claude-sonnet-4-20250514",
                        "api_key": os.getenv("ANTHROPIC_API_KEY")
                    }
                }
            }
    
    def add(self, messages: List[Dict[str, str]], user_id: str, metadata: Optional[Dict[str, Any]] = None):
        return self.memory.add(messages, user_id=user_id, metadata=metadata)
    
    def search(self, query: str, user_id: str, limit: int = 5) -> Dict[str, Any]:
        return self.memory.search(query=query, user_id=user_id, limit=limit)
    
    def get_all(self, user_id: str) -> List[Dict[str, Any]]:
        return self.memory.get_all(user_id=user_id)
    
    def update(self, memory_id: str, data: Dict[str, Any]):
        return self.memory.update(memory_id=memory_id, data=data)
    
    def delete(self, memory_id: str):
        return self.memory.delete(memory_id=memory_id)
    
    def delete_all(self, user_id: str):
        return self.memory.delete_all(user_id=user_id)
    
    def history(self, memory_id: str) -> List[Dict[str, Any]]:
        return self.memory.history(memory_id=memory_id)


def get_memory_layer(config: Optional[Dict[str, Any]] = None) -> MemoryLayer:
    return MemoryLayer(config=config)
