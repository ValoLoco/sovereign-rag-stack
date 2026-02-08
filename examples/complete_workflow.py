#!/usr/bin/env python
"""Complete end-to-end workflow example.

Demonstrates full RAG stack capabilities:
1. Document ingestion (multiple formats)
2. Vector storage
3. Memory management
4. Semantic search
5. LLM-powered RAG queries
6. Health monitoring
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from lib import get_rag_engine, get_memory_layer, get_llm_provider, get_embeddings
from lib.document_processor import get_document_processor
from lib.health import get_health_monitor
from lib.logger import get_logger

logger = get_logger("example")


def main():
    print("="*60)
    print("Sovereign RAG Stack - Complete Workflow Demo")
    print("="*60)
    print()
    
    # 1. Health Check
    print("[1/7] Health Check...")
    monitor = get_health_monitor()
    health = monitor.check_all()
    print(f"Status: {health['status']}")
    print(f"Components: {len(health['components'])} checked")
    print()
    
    # 2. Initialize Components
    print("[2/7] Initializing components...")
    rag = get_rag_engine()
    memory = get_memory_layer()
    llm = get_llm_provider()
    embeddings = get_embeddings()
    processor = get_document_processor()
    
    print(f"✓ RAG Engine ready")
    print(f"✓ Memory Layer ready")
    print(f"✓ LLM Provider: {llm.__class__.__name__}")
    print(f"✓ Embeddings: {embeddings.model_name} ({embeddings.dimension}d)")
    print()
    
    # 3. Ingest Sample Documents
    print("[3/7] Ingesting sample documents...")
    
    sample_docs = [
        {
            "text": """BUENATURA Holdings is a sovereign holdings company founded by Valentin Kranz.
            It focuses on building lean, purpose-driven companies that operate with full data sovereignty.
            Core values: truth, excellence, long-term integrity.""",
            "metadata": {"source": "company_overview", "type": "foundational"}
        },
        {
            "text": """The Carbon Fiber Principle: Maximum strength with minimum weight.
            Every line of code must earn its place. No bloat, no waste, only essential functionality.""",
            "metadata": {"source": "principles", "type": "philosophy"}
        },
        {
            "text": """Sovereign technology means full control over your data and infrastructure.
            Local-first, cloud-optional. Your data never leaves your control unless you explicitly choose.""",
            "metadata": {"source": "technology", "type": "technical"}
        }
    ]
    
    for i, doc in enumerate(sample_docs, 1):
        result = rag.ingest_text(doc["text"], metadata=doc["metadata"])
        print(f"  Document {i}: {result['chunks']} chunks ingested")
    
    print()
    
    # 4. Add Memories
    print("[4/7] Adding user memories...")
    
    user_id = "valentin"
    memories = [
        "I prefer TypeScript over JavaScript for type safety",
        "I value clarity over cleverness in code",
        "I'm based in Madrid, Spain"
    ]
    
    for mem in memories:
        messages = [{"role": "user", "content": mem}]
        memory_id = memory.add(messages, user_id=user_id)
        print(f"  ✓ Memory added: {mem[:50]}...")
    
    print()
    
    # 5. Semantic Search
    print("[5/7] Performing semantic search...")
    
    query = "What are the core principles?"
    results = rag.search(query, limit=2)
    
    print(f"Query: '{query}'")
    print(f"Results: {len(results)} documents found")
    for i, doc in enumerate(results, 1):
        print(f"\n  Result {i}:")
        print(f"  Text: {doc['text'][:100]}...")
        print(f"  Source: {doc.get('metadata', {}).get('source', 'unknown')}")
    
    print()
    
    # 6. Memory-Aware Search
    print("[6/7] Memory-aware search...")
    
    query = "coding preferences"
    results = rag.search_with_memory(query, user_id=user_id, limit=2)
    
    print(f"Query: '{query}'")
    print(f"Documents: {len(results.get('documents', []))}")
    print(f"Memories: {len(results.get('memories', []))}")
    
    if results.get('memories'):
        print("\n  Relevant memories:")
        for mem in results['memories']:
            print(f"    - {mem.get('memory', 'N/A')}")
    
    print()
    
    # 7. RAG Query with LLM
    print("[7/7] RAG query with LLM...")
    
    question = "What is BUENATURA and what are its core values?"
    
    # Get context
    search_results = rag.search(question, limit=2)
    context = "\n\n".join([doc['text'] for doc in search_results])
    
    # Generate answer
    prompt = f"""Based on the following context, answer the question concisely.

Context:
{context}

Question: {question}

Answer:"""
    
    print(f"Question: '{question}'")
    print("\nGenerating answer...")
    
    try:
        answer = llm.generate(prompt, max_tokens=200)
        print(f"\nAnswer:\n{answer}")
    except Exception as e:
        print(f"\nError generating answer: {e}")
        print("Tip: Ensure your LLM provider is configured correctly in .env")
    
    print()
    print("="*60)
    print("Workflow Complete!")
    print("="*60)
    print()
    print("Next steps:")
    print("- Try ingesting your own documents")
    print("- Experiment with different queries")
    print("- Check health status: python -c 'from lib.health import get_health_monitor; print(get_health_monitor().check_all())'")
    print("- View logs in C:\\BUENATURA\\logs")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Workflow failed: {e}")
        print(f"\nError: {e}")
        sys.exit(1)
