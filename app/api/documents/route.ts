import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { uploadDocument, searchDocuments, listDocuments, deleteDocument, getDocument } from '@/lib/documents';
import { linkDocumentToUser, getUserDocuments, getDocumentOwner, unlinkDocumentFromUser } from '@/lib/user-data';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

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

    console.log('[Documents API] Uploading file:', file.name, 'for user:', session.email);
    const result = await uploadDocument(file, ollamaEndpoint);
    
    await linkDocumentToUser(session.email, result.id);
    
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
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const ollamaEndpoint = searchParams.get('ollamaEndpoint') || process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';

    if (query) {
      console.log('[Documents API] Searching for:', query, 'user:', session.email);
      const results = await searchDocuments(query, 5, ollamaEndpoint);
      
      const userDocIds = await getUserDocuments(session.email);
      const filteredResults = results.filter(r => userDocIds.includes(r.document.id));
      
      return NextResponse.json({ results: filteredResults });
    }

    console.log('[Documents API] Listing documents for user:', session.email);
    const userDocIds = await getUserDocuments(session.email);
    const allDocuments = await listDocuments();
    const userDocuments = allDocuments.filter(doc => userDocIds.includes(doc.id));
    
    return NextResponse.json({ documents: userDocuments });
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
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Document ID required' },
        { status: 400 }
      );
    }

    const owner = await getDocumentOwner(id);
    if (owner !== session.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    console.log('[Documents API] Deleting document:', id, 'by user:', session.email);
    await deleteDocument(id);
    await unlinkDocumentFromUser(session.email, id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Documents API] Delete error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete document' },
      { status: 500 }
    );
  }
}
