import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export const COOKIE_NAME = 'citizen_session';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.warn('Warning: JWT_SECRET is not set in environment variables. Using a temporary fallback.');
    return new TextEncoder().encode('fallback_secret_key_at_least_32_characters_long_civic_ai');
  }
  return new TextEncoder().encode(secret);
};

/**
 * Sign a session payload and return a JWT token string.
 * @param {object} payload - The session user data ({ id, email, name }).
 * @param {string|number} expiresIn - Token expiry (e.g. '24h', '30d').
 */
export async function signJWT(payload, expiresIn) {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getJwtSecret());
}

/**
 * Verify a JWT token and return its payload, or null if invalid.
 * @param {string} token - The JWT token to verify.
 * @returns {Promise<object|null>} The decoded session user or null.
 */
export async function verifyJWT(token) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Retrieve the authenticated user's session data from the cookies.
 * @returns {Promise<object|null>} The session user or null.
 */
export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyJWT(token);
  } catch (error) {
    return null;
  }
}

/**
 * Set the citizen session cookie with a signed JWT.
 * @param {object} user - The session user data ({ id, email, name }).
 * @param {boolean} [rememberMe=false] - Whether to persist for 30 days.
 */
export async function setSessionCookie(user, rememberMe = false) {
  const cookieStore = await cookies();
  // 30 days if rememberMe is true, else 24 hours
  const expiresIn = rememberMe ? '30d' : '24h';
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
  
  const token = await signJWT(user, expiresIn);
  
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
}

/**
 * Clear the citizen session cookie to log out.
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
