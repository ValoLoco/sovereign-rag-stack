import { NextResponse } from 'next/server';
import { uploadDocument, searchDocuments, listDocuments, deleteDocument } from '@/lib/documents';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const ollamaEndpoint = formData.get('ollamaEndpoint') as string || process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const allowedTypes = ['text/plain', 'text/markdown', 'application/json', 'text/csv'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(txt|md|json|csv|py|js|ts|tsx|jsx)$/)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload text-based files.' },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    console.log('[Documents API] Uploading file:', file.name);
    const result = await uploadDocument(file, ollamaEndpoint);
    console.log('[Documents API] Upload complete:', result.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Documents API] Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload document' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const ollamaEndpoint = searchParams.get('ollamaEndpoint') || process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';

    if (query) {
      console.log('[Documents API] Searching for:', query);
      const results = await searchDocuments(query, 5, ollamaEndpoint);
      return NextResponse.json({ results });
    }

    console.log('[Documents API] Listing all documents');
    const documents = await listDocuments();
    return NextResponse.json({ documents });
  } catch (error) {
    console.error('[Documents API] Search/list error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve documents' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Document ID required' },
        { status: 400 }
      );
    }

    console.log('[Documents API] Deleting document:', id);
    await deleteDocument(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Documents API] Delete error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete document' },
      { status: 500 }
    );
  }
}
