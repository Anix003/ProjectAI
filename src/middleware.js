import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'citizen_session';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return new TextEncoder().encode('fallback_secret_key_at_least_32_characters_long_civic_ai');
  }
  return new TextEncoder().encode(secret);
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // 1. Get session token from cookie
  const token = request.cookies.get(COOKIE_NAME)?.value;
  
  // 2. Verify session token
  let isAuthenticated = false;
  if (token) {
    try {
      await jwtVerify(token, getJwtSecret());
      isAuthenticated = true;
    } catch (e) {
      // Token expired, signature mismatch, or invalid
    }
  }

  // 3. Apply routing guards
  
  // Protected Routes: Require authentication
  if (pathname.startsWith('/citizen/dashboard')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/citizen/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Auth Routes: Disallow authenticated users
  if (pathname === '/citizen/login') {
    if (isAuthenticated) {
      const dashboardUrl = new URL('/citizen/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

// Intercept all routes starting with /citizen/
export const config = {
  matcher: ['/citizen/:path*'],
};
