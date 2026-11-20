import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getGoogleAuthUrl, verifyGoogleIdToken } from '@/lib/services/google';
import { establishUserSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

    // If client requested the URL as JSON
    if (url.searchParams.get('format') === 'json') {
      const authUrl = getGoogleAuthUrl({ redirectUri });
      return NextResponse.json({ success: true, url: authUrl });
    }

    // Direct 302 redirect to Google OAuth
    const authUrl = getGoogleAuthUrl({ redirectUri });
    return NextResponse.redirect(authUrl);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { idToken, googleProfile } = body;

    let profile = null;

    if (idToken) {
      profile = await verifyGoogleIdToken(idToken);
      if (!profile) {
        return NextResponse.json({ success: false, error: 'Invalid Google identity token' }, { status: 401 });
      }
    } else if (googleProfile && process.env.NODE_ENV !== 'production') {
      // In development mode, allow direct verified profile payload
      profile = {
        googleId: googleProfile.googleId || `g-${Date.now()}`,
        email: (googleProfile.email || 'customer.google@gmail.com').toLowerCase(),
        name: googleProfile.name || 'Google Verified Guest',
        picture: googleProfile.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        emailVerified: true,
      };
    } else {
      return NextResponse.json({ success: false, error: 'Google ID token is required' }, { status: 400 });
    }

    // Find user by email or linked Google account
    let user = await prisma.user.findUnique({
      where: { email: profile.email },
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          avatar: profile.picture,
          role: 'CUSTOMER',
          status: 'ACTIVE',
          isVerified: true,
          profileCompleted: false,
        },
      });

      // Link Account method
      await prisma.account.create({
        data: {
          userId: user.id,
          provider: 'GOOGLE',
          providerAccountId: profile.googleId,
          verifiedAt: new Date(),
        },
      });
    } else {
      isNewUser = !user.profileCompleted;
      // Ensure account link exists
      const existingAccount = await prisma.account.findFirst({
        where: { userId: user.id, provider: 'GOOGLE' },
      });
      if (!existingAccount) {
        await prisma.account.create({
          data: {
            userId: user.id,
            provider: 'GOOGLE',
            providerAccountId: profile.googleId,
            verifiedAt: new Date(),
          },
        });
      }
    }

    // Establish persistent session
    const { token, session } = await establishUserSession(user);

    return NextResponse.json({
      success: true,
      user: session,
      token,
      isNewUser,
      redirectTo: isNewUser ? '/customer/profile-setup' : '/customer/explore',
    });
  } catch (err: any) {
    console.error('[API /api/auth/google Exception]', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}

