"""
Batch document ingestion for BUENATURA knowledge base
"""

import os
from pathlib import Path
from mem0 import Memory
from dotenv import load_dotenv

load_dotenv()

memory = Memory(
    config={
        "vector_store": {
            "provider": "lancedb",
            "config": {
                "uri": "C:\\BUENATURA\\mem0\\vectors\\lance"
            }
        }
    }
)

def ingest_directory(directory: str, user_id: str = "valentin"):
    """Ingest all documents in directory"""
    path = Path(directory)
    supported_extensions = {'.txt', '.md', '.pdf', '.docx'}
    
    ingested = 0
    failed = 0
    
    for file_path in path.rglob('*'):
        if file_path.suffix.lower() in supported_extensions:
            print(f"📄 Ingesting: {file_path.name}")
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                memory.add(
                    messages=[{
                        "role": "system",
                        "content": f"Document: {file_path.name}\n\n{content}"
                    }],
                    user_id=user_id
                )
                print(f"   ✅ Success")
                ingested += 1
            except Exception as e:
                print(f"   ❌ Failed: {e}")
                failed += 1
    
    return ingested, failed

if __name__ == "__main__":
    print("🚀 Starting BUENATURA knowledge ingestion...\n")
    
    knowledge_dir = os.getenv("RAG_DATA_DIR", "C:\\BUENATURA\\knowledge")
    
    if not Path(knowledge_dir).exists():
        print(f"❌ Directory not found: {knowledge_dir}")
        exit(1)
    
    ingested, failed = ingest_directory(knowledge_dir)
    
    print(f"\n✅ Ingestion complete")
    print(f"   Ingested: {ingested}")
    print(f"   Failed: {failed}")
