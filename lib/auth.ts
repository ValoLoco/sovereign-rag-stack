import { SignJWT, jwtVerify } from 'jose';

const ISSUER = 'flipadonga-auth';
const SESSION_COOKIE = 'flipadonga_session';

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

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
