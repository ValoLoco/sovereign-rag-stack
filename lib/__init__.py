"""Sovereign RAG Stack - Core Library.

Provides local-first RAG with memory, embeddings, and LLM abstraction.
"""

from lib.embeddings import LocalEmbeddings, get_embeddings
from lib.vector_store import VectorStore, get_vector_store
from lib.memory_layer import MemoryLayer, get_memory_layer
from lib.llm_providers import LLMProvider, AnthropicProvider, OllamaProvider, get_llm_provider
from lib.rag_engine import RAGEngine, get_rag_engine

__version__ = "0.1.0"

__all__ = [
    "LocalEmbeddings",
    "get_embeddings",
    "VectorStore",
    "get_vector_store",
    "MemoryLayer",
    "get_memory_layer",
    "LLMProvider",
    "AnthropicProvider",
    "OllamaProvider",
    "get_llm_provider",
    "RAGEngine",
    "get_rag_engine",
]
