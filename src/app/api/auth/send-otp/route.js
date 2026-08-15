import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite-server';
import { Query, ID } from 'node-appwrite';
import { sendOTPEmail } from '@/lib/nodemailer';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailLower = email.toLowerCase();
    const { users, databases } = createAdminClient();
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

    // 1. Check if user already exists in Appwrite Auth
    try {
      const existingUser = await users.list([Query.equal('email', emailLower)]);
      if (existingUser.total > 0) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
      }
    } catch (err) {
      console.error('Error checking existing user in Auth:', err.message);
    }

    // 2. Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    // 3. Store OTP in Appwrite Database
    try {
      const existingDocs = await databases.listDocuments(
        databaseId,
        'otps',
        [Query.equal('email', emailLower)]
      );

      if (existingDocs.total > 0) {
        // Update existing document
        const docId = existingDocs.documents[0].$id;
        await databases.updateDocument(
          databaseId,
          'otps',
          docId,
          { otp, expires_at: expiresAt }
        );
      } else {
        // Create new document
        await databases.createDocument(
          databaseId,
          'otps',
          ID.unique(),
          { email: emailLower, otp, expires_at: expiresAt }
        );
      }
    } catch (dbErr) {
      console.error('Database error storing OTP:', dbErr.message);
      return NextResponse.json({ error: 'Failed to generate verification code' }, { status: 500 });
    }

    // 4. Send email containing OTP
    const emailRes = await sendOTPEmail(emailLower, otp);

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email.',
      mock: !!emailRes.mock
    });
  } catch (error) {
    console.error('Send OTP API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send OTP' }, { status: 500 });
  }
}
