"""RAG engine combining embeddings, vector store, and memory.

Provides document ingestion and semantic search.
Works with local or remote components.
"""

import os
import hashlib
from typing import List, Dict, Any, Optional
from pathlib import Path

from lib.embeddings import get_embeddings
from lib.vector_store import get_vector_store
from lib.memory_layer import get_memory_layer


class RAGEngine:
    def __init__(
        self,
        vector_db_path: Optional[str] = None,
        embeddings_model: str = "all-MiniLM-L6-v2",
        collection_name: str = "documents"
    ):
        self.embeddings = get_embeddings(model_name=embeddings_model)
        self.vector_store = get_vector_store(db_path=vector_db_path)
        self.memory = get_memory_layer()
        self.collection_name = collection_name
    
    def ingest_text(
        self,
        text: str,
        metadata: Optional[Dict[str, Any]] = None,
        chunk_size: int = 500,
        overlap: int = 50
    ):
        chunks = self._chunk_text(text, chunk_size, overlap)
        
        ids = [self._generate_id(chunk) for chunk in chunks]
        vectors = self.embeddings.encode(chunks)
        metadatas = [metadata or {} for _ in chunks]
        
        self.vector_store.add_documents(
            collection_name=self.collection_name,
            ids=ids,
            texts=chunks,
            vectors=vectors,
            metadatas=metadatas
        )
        
        return {"chunks": len(chunks), "ids": ids}
    
    def ingest_file(
        self,
        file_path: str,
        metadata: Optional[Dict[str, Any]] = None
    ):
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        text = path.read_text(encoding="utf-8")
        
        file_metadata = metadata or {}
        file_metadata.update({
            "filename": path.name,
            "filepath": str(path.absolute()),
            "extension": path.suffix
        })
        
        return self.ingest_text(text, metadata=file_metadata)
    
    def search(
        self,
        query: str,
        limit: int = 5,
        filter_metadata: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        query_vector = self.embeddings.encode_single(query)
        
        results = self.vector_store.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            limit=limit,
            filter_metadata=filter_metadata
        )
        
        return results
    
    def search_with_memory(
        self,
        query: str,
        user_id: str,
        limit: int = 5
    ) -> Dict[str, Any]:
        doc_results = self.search(query, limit=limit)
        
        memory_results = self.memory.search(query=query, user_id=user_id, limit=3)
        
        return {
            "documents": doc_results,
            "memories": memory_results.get("results", [])
        }
    
    def add_conversation(
        self,
        messages: List[Dict[str, str]],
        user_id: str,
        metadata: Optional[Dict[str, Any]] = None
    ):
        return self.memory.add(messages, user_id=user_id, metadata=metadata)
    
    def _chunk_text(self, text: str, chunk_size: int, overlap: int) -> List[str]:
        words = text.split()
        chunks = []
        
        for i in range(0, len(words), chunk_size - overlap):
            chunk = " ".join(words[i:i + chunk_size])
            if chunk:
                chunks.append(chunk)
        
        return chunks
    
    def _generate_id(self, text: str) -> str:
        return hashlib.sha256(text.encode()).hexdigest()[:16]
    
    def list_collections(self) -> List[str]:
        return self.vector_store.list_collections()


def get_rag_engine(**kwargs) -> RAGEngine:
    return RAGEngine(**kwargs)
