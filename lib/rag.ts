/**
 * RAG operations for web mode
 * Interfaces with Vercel Postgres + Blob storage
 */

import { sql } from '@vercel/postgres'
import { put, list } from '@vercel/blob'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function searchMemories({
  query,
  userId,
  limit = 5
}: {
  query: string
  userId: string
  limit?: number
}) {
  // Query Vercel Postgres for memory metadata
  const { rows } = await sql`
    SELECT * FROM memories 
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `
  
  return rows
}

export async function ingestDocument({
  content,
  filename,
  userId
}: {
  content: string
  filename: string
  userId: string
}) {
  // Store in Vercel Blob
  const blob = await put(`documents/${userId}/${filename}`, content, {
    access: 'public'
  })
  
  // Store metadata in Postgres
  await sql`
    INSERT INTO documents (user_id, filename, blob_url, created_at)
    VALUES (${userId}, ${filename}, ${blob.url}, NOW())
  `
  
  return { url: blob.url }
}

export async function chat({
  messages,
  userId
}: {
  messages: Array<{ role: string; content: string }>
  userId: string
}) {
  // Get relevant memories
  const lastMessage = messages[messages.length - 1]
  const memories = await searchMemories({
    query: lastMessage.content,
    userId,
    limit: 3
  })
  
  // Build context
  const context = memories
    .map(m => m.content)
    .join('\n\n')
  
  // Call Claude with context
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: `You are a helpful AI assistant with access to this context:\n\n${context}`,
    messages
  })
  
  return response
}
