import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite-server';
import { ID, Query } from 'node-appwrite';

export async function POST(req) {
  try {
    const { email, password, firstName, lastName, phone, role, departmentId, otp } = await req.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { users, databases } = createAdminClient();
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const emailLower = email.toLowerCase();

    // 1. Verify OTP
    if (!otp) {
      return NextResponse.json({ error: 'Verification code (OTP) is required' }, { status: 400 });
    }

    try {
      const otpDocs = await databases.listDocuments(
        databaseId,
        'otps',
        [Query.equal('email', emailLower)]
      );

      if (otpDocs.total === 0) {
        return NextResponse.json({ error: 'No verification code found. Please request a new OTP.' }, { status: 400 });
      }

      const storedOtpInfo = otpDocs.documents[0];
      const now = Date.now();

      if (now > storedOtpInfo.expires_at) {
        return NextResponse.json({ error: 'Verification code has expired. Please request a new OTP.' }, { status: 400 });
      }

      if (storedOtpInfo.otp !== otp) {
        return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
      }

      // Delete the OTP document so it cannot be reused
      await databases.deleteDocument(databaseId, 'otps', storedOtpInfo.$id);
    } catch (otpErr) {
      console.error('OTP verification database error:', otpErr.message);
      return NextResponse.json({ error: 'Failed to verify verification code' }, { status: 500 });
    }

    // 2. Create user in Appwrite Auth
    const userId = ID.unique();
    const authUser = await users.create(
      userId,
      email,
      phone || undefined,
      password,
      `${firstName} ${lastName}`
    );

    // 2. Determine and create corresponding profile collection entry
    if (role === 'Officer' || role === 'Authority' || role === 'Admin' || role === 'Super Admin') {
      const adminDocId = authUser.$id;
      await databases.createDocument(
        databaseId,
        'admin',
        adminDocId,
        {
          id_admin: `ADM-${ID.unique().slice(0, 8).toUpperCase()}`,
          First_name: firstName,
          Last_name: lastName,
          email: emailLower,
          phone: phone || '',
          gender: '',
          date_of_birth: '',
          profile_image: '',
          pin_code: '',
          address: '',
          role: role,
          department_id: departmentId || '',
          is_active: role === 'Super Admin' // Super Admins are auto-active
        }
      );

      // Create a pending application for Officers
      if (role === 'Officer') {
        await databases.createDocument(
          databaseId,
          'OfficerApplications',
          ID.unique(),
          {
            application_id: `APP-${ID.unique().slice(0, 8).toUpperCase()}`,
            id_admin: adminDocId,
            department_proof: 'pending_upload',
            identity_proof: 'pending_upload',
            office_details: 'Pending officer profile completion',
            region_details: 'Pending officer profile completion',
            status: 'Pending'
          }
        );
      }
    } else {
      // Citizen profile
      const userDocId = authUser.$id;
      await databases.createDocument(
        databaseId,
        'users',
        userDocId,
        {
          id_user: `CIV-${ID.unique().slice(0, 8).toUpperCase()}`,
          First_name: firstName,
          Last_name: lastName,
          email: emailLower,
          phone: phone || '',
          gender: '',
          date_of_birth: '',
          profile_image: '',
          pin_code: '',
          address: '',
          kyc_status: 'UNVERIFIED'
        }
      );
    }

    return NextResponse.json({ success: true, userId: authUser.$id });
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
