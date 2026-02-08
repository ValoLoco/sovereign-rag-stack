"""Local embedding generation using sentence-transformers.

Provides embeddings without external API calls.
Uses all-MiniLM-L6-v2 for CPU efficiency.
"""

import os
from typing import List, Optional
from sentence_transformers import SentenceTransformer
import torch


class LocalEmbeddings:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2", device: Optional[str] = None):
        self.model_name = model_name
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.model = self._load_model()
        
    def _load_model(self) -> SentenceTransformer:
        cache_dir = os.getenv("EMBEDDINGS_CACHE_DIR", os.path.join(os.getcwd(), ".cache", "embeddings"))
        os.makedirs(cache_dir, exist_ok=True)
        
        model = SentenceTransformer(self.model_name, cache_folder=cache_dir)
        model.to(self.device)
        return model
    
    def encode(self, texts: List[str], batch_size: int = 32, show_progress: bool = False) -> List[List[float]]:
        embeddings = self.model.encode(
            texts,
            batch_size=batch_size,
            show_progress_bar=show_progress,
            convert_to_numpy=True
        )
        return embeddings.tolist()
    
    def encode_single(self, text: str) -> List[float]:
        return self.encode([text])[0]
    
    @property
    def dimension(self) -> int:
        return self.model.get_sentence_embedding_dimension()


def get_embeddings(model_name: str = "all-MiniLM-L6-v2") -> LocalEmbeddings:
    return LocalEmbeddings(model_name=model_name)
