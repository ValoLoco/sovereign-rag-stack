import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message, model, files } = await req.json();

    // TODO: Implement actual RAG query
    // For now, return mock response
    const response = {
      answer: `I received your message: "${message}". Model: ${model}. Files: ${files?.length || 0}`,
      sources: 3,
      model,
    };

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
