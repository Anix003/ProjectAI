import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite-server';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const { account } = createAdminClient();

    // Call Appwrite to authenticate
    const session = await account.createEmailPasswordSession(email, password);

    // Set Appwrite session cookie
    const response = NextResponse.json({ success: true, userId: session.userId });
    
    // Cookie parameters
    response.cookies.set('appwrite-session', session.secret, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(session.expire)
    });

    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 401 });
  }
}
