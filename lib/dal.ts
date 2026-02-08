import 'server-only';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, verifySessionToken } from './auth';
import { cache } from 'react';

export interface VerifiedSession {
  email: string;
  exp: number;
}

export const verifySession = cache(async (): Promise<VerifiedSession | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await verifySessionToken(token);
  
  if (!session) {
    return null;
  }

  return {
    email: session.email,
    exp: session.exp,
  };
});

export async function getSession(): Promise<VerifiedSession> {
  const session = await verifySession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  return session;
}
