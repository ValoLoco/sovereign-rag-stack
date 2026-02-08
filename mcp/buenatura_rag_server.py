"""
BUENATURA Sovereign RAG MCP Server
Integrates mem0 memory layer with local vector storage

Carbon Fiber Principle: Maximum strength with minimum weight
"""

import os
import logging
from pathlib import Path
from typing import List, Dict, Any
from dotenv import load_dotenv

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp import types

from mem0 import Memory
import lancedb
from sentence_transformers import SentenceTransformer

load_dotenv()

logging.basicConfig(
    filename=os.path.join(os.getenv("LOG_DIR", "C:\\BUENATURA\\logs"), "rag_server.log"),
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

class BuenaturaRAGServer:
    def __init__(self):
        self.data_dir = Path(os.getenv("RAG_DATA_DIR", "C:\\BUENATURA\\knowledge"))
        self.db_dir = Path(os.getenv("RAG_DB_DIR", "C:\\BUENATURA\\mem0\\vectors"))
        
        self.memory = Memory(
            config={
                "vector_store": {
                    "provider": "lancedb",
                    "config": {
                        "uri": str(self.db_dir / "lance")
                    }
                },
                "embedder": {
                    "provider": "sentence_transformers",
                    "config": {
                        "model": os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
                    }
                }
            }
        )
        
        self.embedding_model = SentenceTransformer(
            os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
        )
        
        logging.info("✅ BUENATURA RAG Server initialized")
    
    def ingest_document(self, file_path: str, user_id: str = "valentin") -> Dict[str, Any]:
        """Ingest document into memory layer"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            result = self.memory.add(
                messages=[{
                    "role": "system",
                    "content": f"Document: {Path(file_path).name}\n\n{content}"
                }],
                user_id=user_id
            )
            
            logging.info(f"✅ Ingested: {file_path}")
            return {
                "status": "success",
                "file": file_path,
                "memories_created": len(result)
            }
        except Exception as e:
            logging.error(f"❌ Ingestion failed: {e}")
            return {"status": "error", "message": str(e)}
    
    def search_memories(
        self, 
        query: str, 
        user_id: str = "valentin",
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Search mem0 memory layer"""
        try:
            results = self.memory.search(
                query=query,
                user_id=user_id,
                limit=limit
            )
            
            logging.info(f"🔍 Search: '{query}' - {len(results['results'])} results")
            return results["results"]
        except Exception as e:
            logging.error(f"❌ Search failed: {e}")
            return []
    
    def get_all_memories(self, user_id: str = "valentin") -> List[Dict[str, Any]]:
        """Retrieve all memories for user"""
        try:
            memories = self.memory.get_all(user_id=user_id)
            return memories
        except Exception as e:
            logging.error(f"❌ Get all memories failed: {e}")
            return []
    
    def add_conversation(
        self, 
        messages: List[Dict[str, str]], 
        user_id: str = "valentin"
    ) -> Dict[str, Any]:
        """Store conversation in memory"""
        try:
            result = self.memory.add(messages=messages, user_id=user_id)
            logging.info(f"💬 Conversation stored: {len(result)} memories")
            return {"status": "success", "memories_created": len(result)}
        except Exception as e:
            logging.error(f"❌ Conversation storage failed: {e}")
            return {"status": "error", "message": str(e)}

server = Server("buenatura-rag")
rag = BuenaturaRAGServer()

@server.list_tools()
async def list_tools() -> List[types.Tool]:
    """List available RAG tools"""
    return [
        types.Tool(
            name="ingest_document",
            description="Ingest a document into the sovereign memory layer",
            inputSchema={
                "type": "object",
                "properties": {
                    "file_path": {
                        "type": "string",
                        "description": "Full path to document"
                    },
                    "user_id": {
                        "type": "string",
                        "description": "User identifier (default: valentin)"
                    }
                },
                "required": ["file_path"]
            }
        ),
        types.Tool(
            name="search_memories",
            description="Search semantic memory across all ingested content",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query"
                    },
                    "user_id": {
                        "type": "string",
                        "description": "User identifier"
                    },
                    "limit": {
                        "type": "number",
                        "description": "Max results (default: 5)"
                    }
                },
                "required": ["query"]
            }
        ),
        types.Tool(
            name="get_all_memories",
            description="Retrieve all memories for a user",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "description": "User identifier"
                    }
                }
            }
        ),
        types.Tool(
            name="add_conversation",
            description="Store conversation in persistent memory",
            inputSchema={
                "type": "object",
                "properties": {
                    "messages": {
                        "type": "array",
                        "description": "Conversation messages"
                    },
                    "user_id": {
                        "type": "string",
                        "description": "User identifier"
                    }
                },
                "required": ["messages"]
            }
        )
    ]

@server.call_tool()
async def call_tool(
    name: str, 
    arguments: dict
) -> List[types.TextContent]:
    """Execute RAG tool"""
    
    if name == "ingest_document":
        result = rag.ingest_document(
            file_path=arguments["file_path"],
            user_id=arguments.get("user_id", "valentin")
        )
        return [types.TextContent(type="text", text=str(result))]
    
    elif name == "search_memories":
        results = rag.search_memories(
            query=arguments["query"],
            user_id=arguments.get("user_id", "valentin"),
            limit=arguments.get("limit", 5)
        )
        return [types.TextContent(
            type="text", 
            text=f"Found {len(results)} memories:\n\n" + 
                 "\n\n".join([f"- {r['memory']}" for r in results])
        )]
    
    elif name == "get_all_memories":
        memories = rag.get_all_memories(
            user_id=arguments.get("user_id", "valentin")
        )
        return [types.TextContent(
            type="text",
            text=f"Total memories: {len(memories)}\n\n" +
                 "\n".join([f"- {m['memory']}" for m in memories[:10]])
        )]
    
    elif name == "add_conversation":
        result = rag.add_conversation(
            messages=arguments["messages"],
            user_id=arguments.get("user_id", "valentin")
        )
        return [types.TextContent(type="text", text=str(result))]
    
    raise ValueError(f"Unknown tool: {name}")

async def main():
    """Run MCP server"""
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options()
        )

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
