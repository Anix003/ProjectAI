import { NextResponse } from 'next/server';

export default function proxy(req) {
  const session = req.cookies.get('appwrite-session');
  const { pathname } = req.nextUrl;

  // Let public auth pages and assets pass through without auth checks
  const isPublicPath = pathname === '/login' || pathname === '/register';

  if (!session && !isPublicPath && !pathname.startsWith('/api/') && pathname !== '/' && pathname !== '/favicon.ico') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (session && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files, next assets, favicon, and API routes.
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
