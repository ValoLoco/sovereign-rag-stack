import { NextResponse } from 'next/server';
import { 
  createSessionToken, 
  SESSION_COOKIE_NAME, 
  recordFailedLogin, 
  recordSuccessfulLogin, 
  isAccountLocked 
} from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

function getAllowedEmails() {
  const raw = process.env.AUTH_ALLOWED_EMAILS || '';
  return raw.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIp || 'unknown';
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  
  try {
    const { email, password } = await request.json();
    const normalizedEmail = (email || '').trim().toLowerCase();

    const rateLimitResult = await checkRateLimit(`login:${ip}`);
    if (!rateLimitResult.success) {
      console.warn(`[Login] Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { 
          error: 'Too many login attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
          }
        }
      );
    }

    if (await isAccountLocked(normalizedEmail)) {
      console.warn(`[Login] Account locked: ${normalizedEmail}`);
      return NextResponse.json(
        { error: 'Account temporarily locked due to multiple failed attempts. Please try again in 15 minutes.' },
        { status: 423 }
      );
    }

    const allowed = getAllowedEmails();
    if (!allowed.includes(normalizedEmail)) {
      console.warn(`[Login] Email not allowed: ${normalizedEmail}`);
      await recordFailedLogin(normalizedEmail, ip);
      return NextResponse.json(
        { error: 'Access restricted. Please use your BUENATURA email.' },
        { status: 401 }
      );
    }

    if (password !== process.env.AUTH_PASSWORD) {
      console.warn(`[Login] Wrong password: ${normalizedEmail}`);
      await recordFailedLogin(normalizedEmail, ip);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = await createSessionToken(normalizedEmail);
    await recordSuccessfulLogin(normalizedEmail, ip);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    console.log(`[Login] Success: ${normalizedEmail} from ${ip}`);
    return response;
  } catch (error) {
    console.error('[Login] Error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
