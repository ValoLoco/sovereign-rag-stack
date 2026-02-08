#!/usr/bin/env python
"""MCP server for mem0 memory operations.

Exposes memory management to Claude Desktop, Cursor, etc.
Based on mem0-mcp architecture.
"""

import sys
import os
import asyncio
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).parent.parent))

from mcp.server.models import InitializationOptions
from mcp.server import NotificationOptions, Server
from mcp.server.stdio import stdio_server
from mcp import types

from lib.memory_layer import get_memory_layer

memory = get_memory_layer()

server = Server("mem0-memory-server")


@server.list_tools()
async def handle_list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="add_memory",
            description="Store a conversation or context in memory for a user.",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "User identifier"},
                    "content": {"type": "string", "description": "Content to remember"},
                    "role": {"type": "string", "enum": ["user", "assistant"], "default": "user"}
                },
                "required": ["user_id", "content"]
            }
        ),
        types.Tool(
            name="search_memories",
            description="Search through user memories using semantic similarity.",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "User identifier"},
                    "query": {"type": "string", "description": "Search query"},
                    "limit": {"type": "integer", "default": 5, "description": "Number of results"}
                },
                "required": ["user_id", "query"]
            }
        ),
        types.Tool(
            name="get_all_memories",
            description="Retrieve all stored memories for a user.",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "User identifier"}
                },
                "required": ["user_id"]
            }
        ),
        types.Tool(
            name="delete_memory",
            description="Delete a specific memory by ID.",
            inputSchema={
                "type": "object",
                "properties": {
                    "memory_id": {"type": "string", "description": "Memory ID to delete"}
                },
                "required": ["memory_id"]
            }
        ),
        types.Tool(
            name="delete_all_memories",
            description="Delete all memories for a user.",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "User identifier"}
                },
                "required": ["user_id"]
            }
        )
    ]


@server.call_tool()
async def handle_call_tool(
    name: str, arguments: dict[str, Any]
) -> list[types.TextContent | types.ImageContent | types.EmbeddedResource]:
    
    if name == "add_memory":
        messages = [{
            "role": arguments.get("role", "user"),
            "content": arguments["content"]
        }]
        result = memory.add(messages, user_id=arguments["user_id"])
        return [types.TextContent(type="text", text=f"Memory added successfully. ID: {result}")]
    
    elif name == "search_memories":
        results = memory.search(
            query=arguments["query"],
            user_id=arguments["user_id"],
            limit=arguments.get("limit", 5)
        )
        
        memories = results.get("results", [])
        if not memories:
            return [types.TextContent(type="text", text="No memories found.")]
        
        formatted = "\n\n".join([
            f"Memory {i+1}:\n{mem.get('memory', 'N/A')}"
            for i, mem in enumerate(memories)
        ])
        return [types.TextContent(type="text", text=formatted)]
    
    elif name == "get_all_memories":
        memories = memory.get_all(user_id=arguments["user_id"])
        
        if not memories:
            return [types.TextContent(type="text", text="No memories found for this user.")]
        
        formatted = "\n\n".join([
            f"Memory {i+1} (ID: {mem.get('id', 'N/A')}):\n{mem.get('memory', 'N/A')}"
            for i, mem in enumerate(memories)
        ])
        return [types.TextContent(type="text", text=formatted)]
    
    elif name == "delete_memory":
        memory.delete(memory_id=arguments["memory_id"])
        return [types.TextContent(type="text", text=f"Memory {arguments['memory_id']} deleted.")]
    
    elif name == "delete_all_memories":
        memory.delete_all(user_id=arguments["user_id"])
        return [types.TextContent(type="text", text=f"All memories deleted for user {arguments['user_id']}.")]
    
    else:
        raise ValueError(f"Unknown tool: {name}")


async def main():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="mem0-memory-server",
                server_version="1.0.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={}
                )
            )
        )


if __name__ == "__main__":
    asyncio.run(main())
