import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { exchangeGoogleCodeForTokens, verifyGoogleIdToken } from '@/lib/services/google';
import { establishUserSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error || !code) {
      console.error('[Google OAuth Callback Error]', error || 'Missing authorization code');
      return NextResponse.redirect(new URL('/customer/login?error=google_auth_failed', req.url));
    }

    const redirectUri = new URL('/api/auth/google/callback', req.url).toString();

    // Exchange code for tokens
    const tokens = await exchangeGoogleCodeForTokens({ code, redirectUri });
    if (!tokens || !tokens.idToken) {
      return NextResponse.redirect(new URL('/customer/login?error=token_exchange_failed', req.url));
    }

    // Verify ID token
    const profile = await verifyGoogleIdToken(tokens.idToken);
    if (!profile) {
      return NextResponse.redirect(new URL('/customer/login?error=invalid_google_token', req.url));
    }

    // Find or create customer
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
    }

    // Establish persistent session
    await establishUserSession(user);

    const destination = isNewUser ? '/customer/profile-setup' : '/customer/explore';
    return NextResponse.redirect(new URL(destination, req.url));
  } catch (err) {
    console.error('[Google Callback Exception]', err);
    return NextResponse.redirect(new URL('/customer/login?error=server_error', req.url));
  }
}
