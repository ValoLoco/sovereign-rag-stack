import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

const PUBLIC_PATHS = ['/login', '/'];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname) || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  const payload = await verifySessionToken(token);

  if (!payload) {
    const url = new URL('/login', request.url);
    const response = NextResponse.redirect(url);
    response.cookies.set(SESSION_COOKIE_NAME, '', { maxAge: 0 });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
