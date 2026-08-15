import { NextResponse } from 'next/server';
import { createSessionClient, createAdminClient } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export async function GET(req) {
  try {
    const sessionCookie = req.cookies.get('appwrite-session');
    
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ user: null });
    }

    // 1. Verify session with Appwrite
    const { account } = createSessionClient(sessionCookie.value);
    let authUser;
    try {
      authUser = await account.get();
    } catch (err) {
      // Invalid session token (expired or deleted)
      const response = NextResponse.json({ user: null });
      response.cookies.set('appwrite-session', '', { path: '/', expires: new Date(0) });
      return response;
    }

    // 2. Fetch profile from Custom Collections
    // We use the admin client to bypass read-access restrictions on other collections if any.
    const { databases } = createAdminClient();
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const emailLower = authUser.email.toLowerCase();

    let mergedProfile = {
      $id: authUser.$id,
      email: authUser.email,
      name: authUser.name,
      emailVerification: authUser.emailVerification,
      createdAt: authUser.createdAt,
      role: 'Citizen', // Default fallback role
      profileDetails: null
    };

    // Check admin collection first (Admins, Officers, Authorities)
    try {
      const adminDocs = await databases.listDocuments(
        databaseId,
        'admin',
        [Query.equal('email', emailLower), Query.limit(1)]
      );

      if (adminDocs.total > 0) {
        const adminProfile = adminDocs.documents[0];
        mergedProfile.role = adminProfile.role; // 'Admin', 'Officer', 'Authority', 'Super Admin'
        mergedProfile.profileDetails = adminProfile;
        
        return NextResponse.json({ user: mergedProfile });
      }
    } catch (dbError) {
      console.error('Error fetching admin profile:', dbError.message);
    }

    // Check users collection (Citizens)
    try {
      const userDocs = await databases.listDocuments(
        databaseId,
        'users',
        [Query.equal('email', emailLower), Query.limit(1)]
      );

      if (userDocs.total > 0) {
        const userProfile = userDocs.documents[0];
        mergedProfile.role = 'Citizen';
        mergedProfile.profileDetails = userProfile;
      } else {
        // Create citizen profile if missing (e.g. registered via alternative admin tool or Oauth)
        const nameParts = (authUser.name || 'Citizen User').split(' ');
        const firstName = nameParts[0] || 'Citizen';
        const lastName = nameParts.slice(1).join(' ') || 'User';
        
        const newCitizen = await databases.createDocument(
          databaseId,
          'users',
          authUser.$id,
          {
            id_user: `CIV-${authUser.$id.slice(0, 8).toUpperCase()}`,
            First_name: firstName,
            Last_name: lastName,
            email: emailLower,
            phone: authUser.phone || '',
            password_hash: '',
            gender: '',
            date_of_birth: '',
            profile_image: '',
            pin_code: '',
            address: '',
            kyc_status: 'UNVERIFIED'
          }
        );
        mergedProfile.profileDetails = newCitizen;
      }
    } catch (dbError) {
      console.error('Error fetching user profile:', dbError.message);
    }

    return NextResponse.json({ user: mergedProfile });
  } catch (error) {
    console.error('Session hydration API error:', error);
    return NextResponse.json({ user: null, error: error.message });
  }
}
