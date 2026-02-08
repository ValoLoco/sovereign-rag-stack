import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { searchMemories } from '@/lib/rag'

export async function POST(req: Request) {
  const { userId } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { query, limit = 5 } = await req.json()
  
  try {
    const results = await searchMemories({
      query,
      userId,
      limit
    })
    
    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
