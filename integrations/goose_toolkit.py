"""Goose CLI toolkit integration for sovereign-rag-stack.

Provides tools that Goose can use to interact with RAG and memory.
"""

import sys
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from lib.rag_engine import get_rag_engine
from lib.memory_layer import get_memory_layer
from lib.llm_providers import get_llm_provider


class GooseRAGToolkit:
    """RAG toolkit for Goose AI agent."""
    
    def __init__(self, user_id: str = "goose-user"):
        self.engine = get_rag_engine()
        self.memory = get_memory_layer()
        self.user_id = user_id
        self.llm = get_llm_provider()
    
    def ingest_document(self, file_path: str) -> dict:
        """Ingest a document into the knowledge base.
        
        Args:
            file_path: Path to document file
            
        Returns:
            dict with ingestion results
        """
        result = self.engine.ingest_file(file_path)
        return {
            "status": "success",
            "chunks": result["chunks"],
            "message": f"Ingested {result['chunks']} chunks from {file_path}"
        }
    
    def ingest_text(self, text: str, metadata: dict = None) -> dict:
        """Ingest text content into knowledge base.
        
        Args:
            text: Text content to ingest
            metadata: Optional metadata dictionary
            
        Returns:
            dict with ingestion results
        """
        result = self.engine.ingest_text(text, metadata=metadata)
        return {
            "status": "success",
            "chunks": result["chunks"],
            "message": f"Ingested {result['chunks']} chunks"
        }
    
    def search_knowledge(self, query: str, limit: int = 5) -> dict:
        """Search the knowledge base.
        
        Args:
            query: Search query
            limit: Number of results
            
        Returns:
            dict with search results
        """
        results = self.engine.search(query, limit=limit)
        
        formatted_results = []
        for i, doc in enumerate(results, 1):
            formatted_results.append({
                "rank": i,
                "text": doc["text"],
                "metadata": doc.get("metadata", {})
            })
        
        return {
            "status": "success",
            "count": len(results),
            "results": formatted_results
        }
    
    def search_with_memory(self, query: str, limit: int = 5) -> dict:
        """Search knowledge base with user memory context.
        
        Args:
            query: Search query
            limit: Number of results
            
        Returns:
            dict with combined document and memory results
        """
        results = self.engine.search_with_memory(
            query=query,
            user_id=self.user_id,
            limit=limit
        )
        
        return {
            "status": "success",
            "documents": results["documents"],
            "memories": results["memories"]
        }
    
    def add_memory(self, content: str) -> dict:
        """Store information in user memory.
        
        Args:
            content: Content to remember
            
        Returns:
            dict with memory ID
        """
        messages = [{"role": "user", "content": content}]
        memory_id = self.memory.add(messages, user_id=self.user_id)
        
        return {
            "status": "success",
            "memory_id": memory_id,
            "message": "Memory stored successfully"
        }
    
    def search_memories(self, query: str, limit: int = 3) -> dict:
        """Search user memories.
        
        Args:
            query: Search query
            limit: Number of results
            
        Returns:
            dict with memory search results
        """
        results = self.memory.search(query=query, user_id=self.user_id, limit=limit)
        
        return {
            "status": "success",
            "count": len(results.get("results", [])),
            "memories": results.get("results", [])
        }
    
    def get_all_memories(self) -> dict:
        """Retrieve all stored memories.
        
        Returns:
            dict with all memories
        """
        memories = self.memory.get_all(user_id=self.user_id)
        
        return {
            "status": "success",
            "count": len(memories),
            "memories": memories
        }
    
    def rag_query(self, question: str, use_memory: bool = True) -> dict:
        """Perform RAG query with LLM generation.
        
        Args:
            question: Question to answer
            use_memory: Include user memory in context
            
        Returns:
            dict with answer and sources
        """
        if use_memory:
            context_data = self.search_with_memory(question, limit=3)
            documents = context_data["documents"]
            memories = context_data["memories"]
        else:
            documents = self.search_knowledge(question, limit=3)["results"]
            memories = []
        
        context_parts = []
        
        if documents:
            context_parts.append("Relevant documents:")
            for doc in documents:
                context_parts.append(f"- {doc['text'][:200]}...")
        
        if memories:
            context_parts.append("\nRelevant memories:")
            for mem in memories:
                context_parts.append(f"- {mem.get('memory', 'N/A')}")
        
        context = "\n".join(context_parts)
        
        prompt = f"""Based on the following context, answer the question.

Context:
{context}

Question: {question}

Answer:"""
        
        answer = self.llm.generate(prompt)
        
        return {
            "status": "success",
            "question": question,
            "answer": answer,
            "sources": {
                "documents": len(documents),
                "memories": len(memories)
            }
        }


def create_goose_toolkit(user_id: str = "goose-user") -> GooseRAGToolkit:
    """Factory function for Goose toolkit."""
    return GooseRAGToolkit(user_id=user_id)


if __name__ == "__main__":
    toolkit = create_goose_toolkit()
    
    print("Goose RAG Toolkit initialized")
    print(f"User ID: {toolkit.user_id}")
    print("\nAvailable methods:")
    print("- ingest_document(file_path)")
    print("- ingest_text(text, metadata)")
    print("- search_knowledge(query, limit)")
    print("- search_with_memory(query, limit)")
    print("- add_memory(content)")
    print("- search_memories(query, limit)")
    print("- get_all_memories()")
    print("- rag_query(question, use_memory)")
