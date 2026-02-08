#!/usr/bin/env python
"""CLI interface for sovereign-rag-stack.

Run from terminal: python scripts/cli.py [command] [args]
Works independently of Claude/Cursor/VSCode.
"""

import sys
import os
import argparse
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from lib.rag_engine import get_rag_engine
from lib.memory_layer import get_memory_layer


def ingest_command(args):
    engine = get_rag_engine()
    
    if args.file:
        result = engine.ingest_file(args.file)
        print(f"✓ Ingested file: {args.file}")
        print(f"  Chunks: {result['chunks']}")
    elif args.text:
        result = engine.ingest_text(args.text)
        print(f"✓ Ingested text")
        print(f"  Chunks: {result['chunks']}")
    else:
        print("Error: Provide --file or --text")
        sys.exit(1)


def search_command(args):
    engine = get_rag_engine()
    
    if args.user_id:
        results = engine.search_with_memory(
            query=args.query,
            user_id=args.user_id,
            limit=args.limit
        )
        
        print(f"\n📄 Document Results ({len(results['documents'])}):\n")
        for i, doc in enumerate(results['documents'], 1):
            print(f"{i}. {doc['text'][:200]}...")
            print(f"   Metadata: {doc['metadata']}\n")
        
        print(f"\n🧠 Memory Results ({len(results['memories'])}):\n")
        for i, mem in enumerate(results['memories'], 1):
            print(f"{i}. {mem.get('memory', 'N/A')}\n")
    else:
        results = engine.search(query=args.query, limit=args.limit)
        
        print(f"\n📄 Results ({len(results)}):\n")
        for i, doc in enumerate(results, 1):
            print(f"{i}. {doc['text'][:200]}...")
            print(f"   Metadata: {doc['metadata']}\n")


def memory_command(args):
    memory = get_memory_layer()
    
    if args.action == "add":
        messages = [{"role": "user", "content": args.content}]
        result = memory.add(messages, user_id=args.user_id)
        print(f"✓ Added memory for user: {args.user_id}")
        print(f"  Memory ID: {result}")
    
    elif args.action == "list":
        memories = memory.get_all(user_id=args.user_id)
        print(f"\n🧠 Memories for {args.user_id} ({len(memories)}):\n")
        for i, mem in enumerate(memories, 1):
            print(f"{i}. {mem.get('memory', 'N/A')}")
            print(f"   ID: {mem.get('id', 'N/A')}\n")
    
    elif args.action == "search":
        results = memory.search(query=args.query, user_id=args.user_id, limit=args.limit)
        print(f"\n🧠 Memory Search Results:\n")
        for i, mem in enumerate(results.get('results', []), 1):
            print(f"{i}. {mem.get('memory', 'N/A')}\n")
    
    elif args.action == "delete":
        if args.memory_id:
            memory.delete(memory_id=args.memory_id)
            print(f"✓ Deleted memory: {args.memory_id}")
        elif args.all:
            memory.delete_all(user_id=args.user_id)
            print(f"✓ Deleted all memories for user: {args.user_id}")
        else:
            print("Error: Provide --memory-id or --all")
            sys.exit(1)


def collections_command(args):
    engine = get_rag_engine()
    collections = engine.list_collections()
    
    print(f"\n📚 Collections ({len(collections)}):\n")
    for i, coll in enumerate(collections, 1):
        print(f"{i}. {coll}")


def main():
    parser = argparse.ArgumentParser(description="Sovereign RAG Stack CLI")
    subparsers = parser.add_subparsers(dest="command", help="Commands")
    
    ingest_parser = subparsers.add_parser("ingest", help="Ingest documents")
    ingest_parser.add_argument("--file", type=str, help="File path to ingest")
    ingest_parser.add_argument("--text", type=str, help="Text to ingest")
    
    search_parser = subparsers.add_parser("search", help="Search documents")
    search_parser.add_argument("query", type=str, help="Search query")
    search_parser.add_argument("--limit", type=int, default=5, help="Number of results")
    search_parser.add_argument("--user-id", type=str, help="Include user memories")
    
    memory_parser = subparsers.add_parser("memory", help="Manage memories")
    memory_parser.add_argument("action", choices=["add", "list", "search", "delete"], help="Memory action")
    memory_parser.add_argument("--user-id", type=str, required=True, help="User ID")
    memory_parser.add_argument("--content", type=str, help="Memory content (for add)")
    memory_parser.add_argument("--query", type=str, help="Search query (for search)")
    memory_parser.add_argument("--limit", type=int, default=5, help="Number of results")
    memory_parser.add_argument("--memory-id", type=str, help="Memory ID (for delete)")
    memory_parser.add_argument("--all", action="store_true", help="Delete all memories")
    
    collections_parser = subparsers.add_parser("collections", help="List collections")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    commands = {
        "ingest": ingest_command,
        "search": search_command,
        "memory": memory_command,
        "collections": collections_command
    }
    
    commands[args.command](args)


if __name__ == "__main__":
    main()
