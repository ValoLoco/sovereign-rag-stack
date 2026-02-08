import { kv } from '@vercel/kv';

export interface Document {
  id: string;
  filename: string;
  content: string;
  embedding?: number[];
  metadata: {
    size: number;
    type: string;
    uploadedAt: string;
  };
}

export interface SearchResult {
  document: Document;
  score: number;
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

async function generateEmbedding(text: string, ollamaEndpoint: string): Promise<number[]> {
  const response = await fetch(`${ollamaEndpoint}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'nomic-embed-text',
      prompt: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate embedding: ${response.statusText}`);
  }

  const data = await response.json();
  return data.embedding;
}

export async function uploadDocument(
  file: File,
  ollamaEndpoint: string = 'http://localhost:11434'
): Promise<{ id: string }> {
  const content = await file.text();
  const id = `doc:${Date.now()}:${file.name}`;

  const embedding = await generateEmbedding(content.substring(0, 5000), ollamaEndpoint);

  const document: Document = {
    id,
    filename: file.name,
    content,
    embedding,
    metadata: {
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    },
  };

  await kv.set(id, document);
  await kv.sadd('documents:all', id);

  return { id };
}

export async function searchDocuments(
  query: string,
  limit: number = 5,
  ollamaEndpoint: string = 'http://localhost:11434'
): Promise<SearchResult[]> {
  const documentIds = await kv.smembers('documents:all');
  
  if (!documentIds || documentIds.length === 0) {
    return [];
  }

  const queryEmbedding = await generateEmbedding(query, ollamaEndpoint);

  const documents = await Promise.all(
    documentIds.map(async (id) => {
      const doc = await kv.get<Document>(id as string);
      return doc;
    })
  );

  const validDocs = documents.filter((doc): doc is Document => doc !== null && doc.embedding !== undefined);

  const results = validDocs.map((doc) => ({
    document: doc,
    score: cosineSimilarity(queryEmbedding, doc.embedding!),
  }));

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export async function getDocument(id: string): Promise<Document | null> {
  return await kv.get<Document>(id);
}

export async function listDocuments(): Promise<Document[]> {
  const documentIds = await kv.smembers('documents:all');
  
  if (!documentIds || documentIds.length === 0) {
    return [];
  }

  const documents = await Promise.all(
    documentIds.map(async (id) => {
      const doc = await kv.get<Document>(id as string);
      return doc;
    })
  );

  return documents.filter((doc): doc is Document => doc !== null);
}

export async function deleteDocument(id: string): Promise<void> {
  await kv.del(id);
  await kv.srem('documents:all', id);
}
