"""Local vector store using LanceDB.

Embedded database with no server required.
Stores vectors in local directory.
"""

import os
from typing import List, Dict, Any, Optional
import lancedb
from lancedb.pydantic import LanceModel, Vector
from pydantic import Field


class DocumentSchema(LanceModel):
    id: str
    text: str
    vector: Vector(384)  # dimension for all-MiniLM-L6-v2
    metadata: Dict[str, Any] = Field(default_factory=dict)


class VectorStore:
    def __init__(self, db_path: Optional[str] = None):
        self.db_path = db_path or os.getenv("VECTOR_DB_PATH", "./data/vectors")
        os.makedirs(self.db_path, exist_ok=True)
        self.db = lancedb.connect(self.db_path)
    
    def create_collection(self, name: str, schema=DocumentSchema):
        if name not in self.db.table_names():
            self.db.create_table(name, schema=schema, mode="create")
        return self.db.open_table(name)
    
    def get_collection(self, name: str):
        if name in self.db.table_names():
            return self.db.open_table(name)
        return self.create_collection(name)
    
    def add_documents(
        self,
        collection_name: str,
        ids: List[str],
        texts: List[str],
        vectors: List[List[float]],
        metadatas: Optional[List[Dict[str, Any]]] = None
    ):
        table = self.get_collection(collection_name)
        
        metadatas = metadatas or [{} for _ in ids]
        
        documents = [
            {"id": id_, "text": text, "vector": vec, "metadata": meta}
            for id_, text, vec, meta in zip(ids, texts, vectors, metadatas)
        ]
        
        table.add(documents)
    
    def search(
        self,
        collection_name: str,
        query_vector: List[float],
        limit: int = 5,
        filter_metadata: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        table = self.get_collection(collection_name)
        
        query = table.search(query_vector).limit(limit)
        
        if filter_metadata:
            filter_str = " AND ".join([f"metadata.{k} = '{v}'" for k, v in filter_metadata.items()])
            query = query.where(filter_str)
        
        results = query.to_list()
        return results
    
    def delete_collection(self, name: str):
        if name in self.db.table_names():
            self.db.drop_table(name)
    
    def list_collections(self) -> List[str]:
        return self.db.table_names()


def get_vector_store(db_path: Optional[str] = None) -> VectorStore:
    return VectorStore(db_path=db_path)
