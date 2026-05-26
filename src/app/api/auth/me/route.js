import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { authenticated: false, error: 'Unauthorized session' },
        { status: 401 }
      );
    }
    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (error) {
    console.error('Me endpoint error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve session details.' },
      { status: 500 }
    );
  }
}
