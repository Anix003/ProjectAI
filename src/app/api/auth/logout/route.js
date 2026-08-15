import { NextResponse } from 'next/server';
import { createSessionClient } from '@/lib/appwrite-server';

export async function POST(req) {
  try {
    const sessionCookie = req.cookies.get('appwrite-session');
    
    if (sessionCookie && sessionCookie.value) {
      const { account } = createSessionClient(sessionCookie.value);
      try {
        await account.deleteSession('current');
      } catch (err) {
        // Terminated session on server or already expired
      }
    }

    const response = NextResponse.json({ success: true });
    
    // Clear cookie
    response.cookies.set('appwrite-session', '', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0)
    });

    return response;
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
