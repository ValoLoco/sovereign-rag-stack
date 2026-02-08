import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    anthropicApiKey: process.env.ANTHROPIC_API_KEY ? '***' : '',
    ollamaEndpoint: process.env.OLLAMA_ENDPOINT || 'http://localhost:11434',
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  
  return NextResponse.json({
    success: true,
    message: 'Settings saved. Note: API keys are stored client-side only for now.',
  });
}
