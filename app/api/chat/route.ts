import { NextResponse } from 'next/server';
import { createProvider, MultiModelOrchestrator } from '@/lib/llm-providers';
import type { LLMMessage } from '@/lib/llm-providers';
import { searchDocuments } from '@/lib/documents';

export async function POST(request: Request) {
  try {
    const { 
      message, 
      model, 
      mode = 'chat', 
      workerModels = [], 
      ralphIterations = 3,
      settings = {},
      ragEnabled = false
    } = await request.json();

    const ollamaEndpoint = settings.ollamaEndpointOverride || process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';
    
    const config = {
      ollamaEndpoint,
      anthropicApiKey: settings.anthropicApiKey || process.env.ANTHROPIC_API_KEY,
      openaiApiKey: settings.openaiApiKey || process.env.OPENAI_API_KEY,
    };

    console.log('[API] Using endpoint:', ollamaEndpoint.substring(0, 30) + '...');
    console.log('[API] Model requested:', model);
    console.log('[API] RAG enabled:', ragEnabled);

    let contextMessage = message;
    let sources: Array<{ docId: string; filename: string; snippet: string }> = [];

    if (ragEnabled) {
      try {
        const results = await searchDocuments(message, 3, ollamaEndpoint);
        
        if (results.length > 0) {
          console.log('[API] Found', results.length, 'relevant documents');
          
          const context = results
            .map((r, i) => `[Document ${i + 1}: ${r.document.filename}]\n${r.document.content.substring(0, 1000)}...`)
            .join('\n\n');

          contextMessage = `Context from uploaded documents:\n\n${context}\n\nUser question: ${message}`;
          
          sources = results.map((r) => ({
            docId: r.document.id,
            filename: r.document.filename,
            snippet: r.document.content.substring(0, 200) + '...',
          }));
        }
      } catch (error) {
        console.error('[API] RAG search error:', error);
      }
    }

    const messages: LLMMessage[] = [
      { role: 'user', content: contextMessage },
    ];

    if (mode === 'chat') {
      const provider = createProvider(model, config);
      const response = await provider.generate(messages);
      
      return NextResponse.json({
        answer: response.content,
        model: response.model,
        usage: response.usage,
        sources: sources.length > 0 ? sources : undefined,
      });
    }

    if (mode === 'workers') {
      const chatProvider = createProvider(model, config);
      const workers = workerModels.map((m: string) => createProvider(m, config));
      
      const orchestrator = new MultiModelOrchestrator(chatProvider, workers);
      const workerResults = await orchestrator.runWorkers(contextMessage);
      
      return NextResponse.json({
        answer: workerResults[0].content,
        workerResults: workerResults.map(r => ({
          model: r.model,
          content: r.content,
          usage: r.usage,
        })),
        sources: sources.length > 0 ? sources : undefined,
      });
    }

    if (mode === 'ralph') {
      const provider = createProvider(model, config);
      const orchestrator = new MultiModelOrchestrator(provider);
      const iterations = await orchestrator.ralphLoop(contextMessage, ralphIterations);
      
      return NextResponse.json({
        answer: iterations[iterations.length - 1].content,
        iterations: iterations.map(r => ({
          content: r.content,
          model: r.model,
        })),
        sources: sources.length > 0 ? sources : undefined,
      });
    }

    return NextResponse.json(
      { error: 'Invalid mode. Use: chat, workers, or ralph' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[API] Chat error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate response',
        model: model || 'unknown',
        endpoint: ollamaEndpoint?.substring(0, 30) || 'unknown'
      },
      { status: 500 }
    );
  }
}
