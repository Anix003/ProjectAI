import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite-server';
import { Query, ID } from 'node-appwrite';
import bcrypt from 'bcryptjs';
import { setSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      gender,
      dateOfBirth,
      pinCode,
      address,
    } = body;

    // ── 1. Validate required fields ──────────────────────────────────────
    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'First name, last name, email, phone, and password are required.' },
        { status: 400 }
      );
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 }
      );
    }

    // Phone must be numeric
    const phoneDigits = String(phone).replace(/\D/g, '');
    const phoneInt = parseInt(phoneDigits, 10);
    if (isNaN(phoneInt) || phoneDigits.length < 8) {
      return NextResponse.json(
        { error: 'Please enter a valid phone number (minimum 8 digits).' },
        { status: 400 }
      );
    }

    // ── 2. Initialise Appwrite server client ─────────────────────────────
    const { databases } = createAdminClient();
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS;

    if (!databaseId || !collectionId) {
      return NextResponse.json(
        { error: 'Server configuration error: Appwrite Database/Collection ID not set.' },
        { status: 500 }
      );
    }

    // ── 3. Check for duplicate email ─────────────────────────────────────
    const emailCheck = await databases.listDocuments(databaseId, collectionId, [
      Query.equal('email', email.trim()),
    ]);
    if (emailCheck.total > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    // ── 4. Check for duplicate phone ─────────────────────────────────────
    const phoneCheck = await databases.listDocuments(databaseId, collectionId, [
      Query.equal('phone', phoneInt),
    ]);
    if (phoneCheck.total > 0) {
      return NextResponse.json(
        { error: 'An account with this phone number already exists.' },
        { status: 409 }
      );
    }

    // ── 5. Hash password ─────────────────────────────────────────────────
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // ── 6. Generate a user-friendly id_user ──────────────────────────────
    const idUser = `CIV-${Date.now().toString(36).toUpperCase()}`;

    // ── 7. Create user document ──────────────────────────────────────────
    const userDoc = await databases.createDocument(
      databaseId,
      collectionId,
      ID.unique(),
      {
        id_user: idUser,
        First_name: firstName.trim(),
        Last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phoneInt,
        password_hash: passwordHash,
        gender: gender || null,
        date_of_birth: dateOfBirth || null,
        profile_image: null,
        pin_code: pinCode ? parseInt(String(pinCode), 10) : null,
        address: address?.trim() || null,
      }
    );

    // ── 8. Auto-login: set session cookie ────────────────────────────────
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const sessionUser = {
      id: userDoc.$id,
      email: userDoc.email,
      name: fullName,
    };

    await setSessionCookie(sessionUser, false);

    return NextResponse.json({
      success: true,
      user: sessionUser,
    });
  } catch (error: any) {
    console.error('Registration Error:', error);

    // Appwrite duplicate / validation error
    if (error.code === 409) {
      return NextResponse.json(
        { error: 'A user with this information already exists.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error during registration.' },
      { status: 500 }
    );
  }
}
