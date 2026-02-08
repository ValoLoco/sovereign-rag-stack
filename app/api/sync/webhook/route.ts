import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { syncFromGitHub } from '@/lib/sync'

export async function POST(req: Request) {
  const headersList = await headers()
  const token = headersList.get('authorization')?.replace('Bearer ', '')
  
  if (token !== process.env.SYNC_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await syncFromGitHub()
    return NextResponse.json({ success: true, synced: result })
  } catch (error) {
    console.error('Sync webhook error:', error)
    return NextResponse.json(
      { error: 'Sync failed' },
      { status: 500 }
    )
  }
}
