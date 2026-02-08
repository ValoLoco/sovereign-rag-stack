"""LLM provider abstraction supporting Anthropic and Ollama.

Enables switching between cloud (Claude) and local (Ollama) models.
"""

import os
from typing import Dict, Any, Optional, List
from abc import ABC, abstractmethod


class LLMProvider(ABC):
    @abstractmethod
    def generate(self, prompt: str, **kwargs) -> str:
        pass
    
    @abstractmethod
    def chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        pass


class AnthropicProvider(LLMProvider):
    def __init__(self, api_key: Optional[str] = None, model: str = "claude-sonnet-4-20250514"):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        self.model = model
        
        try:
            from anthropic import Anthropic
            self.client = Anthropic(api_key=self.api_key)
        except ImportError:
            raise ImportError("Install anthropic: pip install anthropic")
    
    def generate(self, prompt: str, **kwargs) -> str:
        messages = [{"role": "user", "content": prompt}]
        return self.chat(messages, **kwargs)
    
    def chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        response = self.client.messages.create(
            model=self.model,
            messages=messages,
            max_tokens=kwargs.get("max_tokens", 4096),
            temperature=kwargs.get("temperature", 0.7)
        )
        return response.content[0].text


class OllamaProvider(LLMProvider):
    def __init__(self, base_url: Optional[str] = None, model: str = "llama3.3"):
        self.base_url = base_url or os.getenv("OLLAMA_HOST", "http://localhost:11434")
        self.model = model
        
        try:
            import ollama
            self.client = ollama.Client(host=self.base_url)
        except ImportError:
            raise ImportError("Install ollama: pip install ollama")
    
    def generate(self, prompt: str, **kwargs) -> str:
        response = self.client.generate(
            model=self.model,
            prompt=prompt,
            options={
                "temperature": kwargs.get("temperature", 0.7),
                "num_ctx": kwargs.get("num_ctx", 8192)
            }
        )
        return response["response"]
    
    def chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        response = self.client.chat(
            model=self.model,
            messages=messages,
            options={
                "temperature": kwargs.get("temperature", 0.7),
                "num_ctx": kwargs.get("num_ctx", 8192)
            }
        )
        return response["message"]["content"]


def get_llm_provider(
    provider: Optional[str] = None,
    model: Optional[str] = None,
    **kwargs
) -> LLMProvider:
    provider = provider or os.getenv("LLM_PROVIDER", "anthropic")
    
    if provider.lower() == "anthropic":
        model = model or os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-20250514")
        return AnthropicProvider(model=model, **kwargs)
    
    elif provider.lower() == "ollama":
        model = model or os.getenv("OLLAMA_MODEL", "llama3.3")
        return OllamaProvider(model=model, **kwargs)
    
    else:
        raise ValueError(f"Unsupported provider: {provider}. Use 'anthropic' or 'ollama'")
