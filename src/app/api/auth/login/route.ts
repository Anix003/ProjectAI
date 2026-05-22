import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';
import bcrypt from 'bcryptjs';
import { setSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { emailOrPhone, password, rememberMe } = body;

    // 1. Validate request fields
    if (!emailOrPhone || !password) {
      return NextResponse.json(
        { error: 'Email/Phone and Password are required.' },
        { status: 400 }
      );
    }

    // 2. Initialize Appwrite server client and configurations
    const { databases } = createAdminClient();
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS;

    if (!databaseId || !collectionId) {
      return NextResponse.json(
        { error: 'Server configuration error: Appwrite Database/Collection ID not set.' },
        { status: 500 }
      );
    }

    // Determine query filter: email or phone
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone.trim());
    let queries: string[] = [];

    if (isEmail) {
      queries = [Query.equal('email', emailOrPhone.trim())];
    } else {
      // Strip any non-digit chars from the phone input
      const phoneDigits = emailOrPhone.replace(/\D/g, '');
      const phoneInt = parseInt(phoneDigits, 10);
      
      if (isNaN(phoneInt) || phoneDigits.length < 8) {
        return NextResponse.json(
          { error: 'Please enter a valid email format or phone number.' },
          { status: 400 }
        );
      }
      queries = [Query.equal('phone', phoneInt)];
    }

    // 3. Retrieve user document from the database
    const response = await databases.listDocuments(
      databaseId,
      collectionId,
      queries
    );

    if (response.total === 0) {
      return NextResponse.json(
        { error: 'Invalid email/phone or password.' },
        { status: 401 }
      );
    }

    const userDoc = response.documents[0];

    // 4. Verify password hash using bcrypt
    const passwordHash = userDoc.password_hash;
    if (!passwordHash) {
      return NextResponse.json(
        { error: 'User registration incomplete. No password hash exists.' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email/phone or password.' },
        { status: 401 }
      );
    }

    // 5. Check if the user account is locked or disabled
    // Handles various potential naming schemas (e.g. status === 'locked', is_disabled === true, is_active === false)
    if (
      userDoc.status === 'locked' || 
      userDoc.status === 'disabled' || 
      userDoc.is_disabled === true || 
      userDoc.is_active === false
    ) {
      return NextResponse.json(
        { error: 'This account has been locked or disabled. Please contact administration.' },
        { status: 403 }
      );
    }

    // 6. Sign session token and set cookie
    const firstName = userDoc.First_name || '';
    const lastName = userDoc.Last_name || '';
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
    const displayName = fullName || userDoc.email || 'Citizen';

    const sessionUser = {
      id: userDoc.$id,
      email: userDoc.email || '',
      name: displayName,
    };

    await setSessionCookie(sessionUser, rememberMe);

    return NextResponse.json({
      success: true,
      user: sessionUser
    });

  } catch (error: any) {
    console.error('Authentication Error:', error);
    
    // Check for Appwrite missing index or connectivity error
    if (error.code === 400 || error.type === 'database_index_not_found') {
      return NextResponse.json(
        { error: 'Database search error. Ensure index exists for email/phone fields in Appwrite.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error during authentication.' },
      { status: 500 }
    );
  }
}
