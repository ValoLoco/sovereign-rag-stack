import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

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

    const { skillId, skillName, skillUrl } = await request.json();

    if (!skillId || !skillName) {
      return NextResponse.json(
        { error: 'skillId and skillName are required' },
        { status: 400 }
      );
    }

    console.log(`[Skills] Install request: ${skillName} (${skillId}) by ${session.email}`);

    return NextResponse.json({
      success: true,
      message: 'Skill installation feature coming soon. For now, visit skills.sh to browse available skills.',
      skill: {
        id: skillId,
        name: skillName,
        url: skillUrl,
        status: 'pending',
      },
    });
  } catch (error) {
    console.error('[Skills] Installation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to install skill' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Skills API endpoint',
    endpoints: {
      install: 'POST /api/skills/install',
      browse: 'https://skills.sh/vercel-labs/skills',
    },
  });
}
