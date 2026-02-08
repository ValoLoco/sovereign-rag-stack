import { SignJWT, jwtVerify } from 'jose';
import { kv } from '@vercel/kv';

const ISSUER = 'flipadonga-auth';
const SESSION_COOKIE = 'flipadonga_session';
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(email: string) {
  const key = getSecretKey();
  const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days

  return new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(ISSUER)
    .setExpirationTime(expires)
    .sign(key);
}

export async function verifySessionToken(token: string) {
  try {
    const key = getSecretKey();
    const { payload } = await jwtVerify(token, key, { issuer: ISSUER });
    return payload as { email: string; exp: number };
  } catch {
    return null;
  }
}

export async function recordFailedLogin(email: string, ip: string): Promise<void> {
  const key = `failed_login:${email}`;
  const auditKey = `audit:login:${Date.now()}`;
  
  try {
    const attempts = await kv.get<number>(key) || 0;
    await kv.set(key, attempts + 1, { ex: 900 }); // 15 min TTL
    
    await kv.set(auditKey, {
      email,
      ip,
      timestamp: new Date().toISOString(),
      success: false,
    }, { ex: 86400 * 7 }); // 7 days
  } catch (error) {
    console.error('[Auth] Failed to record login attempt:', error);
  }
}

export async function recordSuccessfulLogin(email: string, ip: string): Promise<void> {
  const key = `failed_login:${email}`;
  const auditKey = `audit:login:${Date.now()}`;
  
  try {
    await kv.del(key);
    
    await kv.set(auditKey, {
      email,
      ip,
      timestamp: new Date().toISOString(),
      success: true,
    }, { ex: 86400 * 7 }); // 7 days
  } catch (error) {
    console.error('[Auth] Failed to record successful login:', error);
  }
}

export async function isAccountLocked(email: string): Promise<boolean> {
  try {
    const key = `failed_login:${email}`;
    const attempts = await kv.get<number>(key) || 0;
    return attempts >= LOCKOUT_THRESHOLD;
  } catch (error) {
    console.error('[Auth] Failed to check lockout status:', error);
    return false;
  }
}

export async function getUserProfile(email: string) {
  return {
    email,
    createdAt: new Date().toISOString(),
  };
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
