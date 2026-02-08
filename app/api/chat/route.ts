import { NextResponse } from 'next/server';
import { createProvider, MultiModelOrchestrator } from '@/lib/llm-providers';
import type { LLMMessage } from '@/lib/llm-providers';

export async function POST(request: Request) {
  try {
    const { message, model, mode = 'chat', workerModels = [], ralphIterations = 3 } = await request.json();

    const config = {
      ollamaEndpoint: process.env.OLLAMA_ENDPOINT || 'http://localhost:11434',
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      openaiApiKey: process.env.OPENAI_API_KEY,
    };

    const messages: LLMMessage[] = [
      { role: 'user', content: message },
    ];

    // Simple chat mode (default)
    if (mode === 'chat') {
      const provider = createProvider(model, config);
      const response = await provider.generate(messages);
      
      return NextResponse.json({
        answer: response.content,
        model: response.model,
        usage: response.usage,
      });
    }

    // Multi-model worker mode
    if (mode === 'workers') {
      const chatProvider = createProvider(model, config);
      const workers = workerModels.map((m: string) => createProvider(m, config));
      
      const orchestrator = new MultiModelOrchestrator(chatProvider, workers);
      const workerResults = await orchestrator.runWorkers(message);
      
      return NextResponse.json({
        answer: workerResults[0].content,
        workerResults: workerResults.map(r => ({
          model: r.model,
          content: r.content,
          usage: r.usage,
        })),
      });
    }

    // RALPH loop mode
    if (mode === 'ralph') {
      const provider = createProvider(model, config);
      const orchestrator = new MultiModelOrchestrator(provider);
      const iterations = await orchestrator.ralphLoop(message, ralphIterations);
      
      return NextResponse.json({
        answer: iterations[iterations.length - 1].content,
        iterations: iterations.map(r => ({
          content: r.content,
          model: r.model,
        })),
      });
    }

    return NextResponse.json(
      { error: 'Invalid mode. Use: chat, workers, or ralph' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate response' },
      { status: 500 }
    );
  }
}
