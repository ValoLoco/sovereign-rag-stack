import { NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

function getAllowedEmails() {
  const raw = process.env.AUTH_ALLOWED_EMAILS || '';
  return raw.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const normalizedEmail = (email || '').trim().toLowerCase();
    const allowed = getAllowedEmails();

    if (!allowed.includes(normalizedEmail)) {
      console.warn(`Failed login: email not allowed - ${normalizedEmail}`);
      return NextResponse.json(
        { error: 'Access restricted. Please use your BUENATURA email.' },
        { status: 401 }
      );
    }

    if (password !== process.env.AUTH_PASSWORD) {
      console.warn(`Failed login: wrong password - ${normalizedEmail}`);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = await createSessionToken(normalizedEmail);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    console.log(`Successful login: ${normalizedEmail}`);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
