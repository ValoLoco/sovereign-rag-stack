/**
 * LLM provider interfaces and API clients
 * Supports: Ollama, Anthropic, OpenAI, and multi-model orchestration
 */

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface LLMProvider {
  generate(messages: LLMMessage[], options?: any): Promise<LLMResponse>;
  stream?(messages: LLMMessage[], options?: any): AsyncIterator<string>;
}

// Ollama provider
export class OllamaProvider implements LLMProvider {
  constructor(private endpoint: string, private model: string) {}

  async generate(messages: LLMMessage[]): Promise<LLMResponse> {
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
    
    const response = await fetch(`${this.endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model.replace('ollama/', ''),
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.response,
      model: this.model,
    };
  }

  async *stream(messages: LLMMessage[]): AsyncIterator<string> {
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
    
    const response = await fetch(`${this.endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model.replace('ollama/', ''),
        prompt,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(l => l.trim());
      
      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.response) yield json.response;
        } catch {}
      }
    }
  }
}

// Anthropic provider
export class AnthropicProvider implements LLMProvider {
  constructor(private apiKey: string, private model: string) {}

  async generate(messages: LLMMessage[]): Promise<LLMResponse> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model.replace('anthropic/', ''),
        messages: messages.filter(m => m.role !== 'system'),
        system: messages.find(m => m.role === 'system')?.content,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.content[0].text,
      model: this.model,
      usage: {
        prompt_tokens: data.usage.input_tokens,
        completion_tokens: data.usage.output_tokens,
        total_tokens: data.usage.input_tokens + data.usage.output_tokens,
      },
    };
  }
}

// OpenAI provider
export class OpenAIProvider implements LLMProvider {
  constructor(private apiKey: string, private model: string) {}

  async generate(messages: LLMMessage[]): Promise<LLMResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model.replace('openai/', ''),
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      model: this.model,
      usage: data.usage,
    };
  }
}

// Multi-model orchestrator for chat + worker patterns
export class MultiModelOrchestrator {
  private chatModel: LLMProvider;
  private workerModels: LLMProvider[];

  constructor(chatModel: LLMProvider, workerModels: LLMProvider[] = []) {
    this.chatModel = chatModel;
    this.workerModels = workerModels;
  }

  async chat(messages: LLMMessage[]): Promise<LLMResponse> {
    return this.chatModel.generate(messages);
  }

  async runWorkers(task: string): Promise<LLMResponse[]> {
    const workerMessages: LLMMessage[] = [
      { role: 'system', content: 'You are a specialized worker agent.' },
      { role: 'user', content: task },
    ];

    return Promise.all(
      this.workerModels.map(worker => worker.generate(workerMessages))
    );
  }

  async ralphLoop(task: string, iterations: number = 3): Promise<LLMResponse[]> {
    const results: LLMResponse[] = [];
    let currentTask = task;

    for (let i = 0; i < iterations; i++) {
      const messages: LLMMessage[] = [
        { role: 'system', content: 'You are part of a RALPH loop. Refine and iterate on the task.' },
        { role: 'user', content: currentTask },
      ];

      const response = await this.chatModel.generate(messages);
      results.push(response);

      currentTask = `Previous iteration result: ${response.content}\n\nRefine and improve this result.`;
    }

    return results;
  }
}

// Factory to create providers
export function createProvider(
  modelId: string,
  config: {
    ollamaEndpoint?: string;
    anthropicApiKey?: string;
    openaiApiKey?: string;
  }
): LLMProvider {
  if (modelId.startsWith('ollama/')) {
    if (!config.ollamaEndpoint) throw new Error('Ollama endpoint not configured');
    return new OllamaProvider(config.ollamaEndpoint, modelId);
  }

  if (modelId.startsWith('anthropic/')) {
    if (!config.anthropicApiKey) throw new Error('Anthropic API key not configured');
    return new AnthropicProvider(config.anthropicApiKey, modelId);
  }

  if (modelId.startsWith('openai/')) {
    if (!config.openaiApiKey) throw new Error('OpenAI API key not configured');
    return new OpenAIProvider(config.openaiApiKey, modelId);
  }

  throw new Error(`Unknown model provider: ${modelId}`);
}
