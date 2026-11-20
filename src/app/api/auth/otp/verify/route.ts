import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyOtpSubmission } from '@/lib/services/otp';
import { establishUserSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const destination = body.destination || body.phone || body.email;
    const otp = body.otp;
    const type: 'PHONE' | 'EMAIL' = body.type || (body.email ? 'EMAIL' : 'PHONE');
    const requestedRole = body.role || 'CUSTOMER';

    if (!destination || !otp) {
      return NextResponse.json(
        { success: false, error: 'Both destination and 6-digit OTP code are required' },
        { status: 400 }
      );
    }

    // 1. Verify OTP Submission
    const verification = await verifyOtpSubmission({ destination, otp, type });
    if (!verification.success) {
      return NextResponse.json(
        { success: false, error: verification.error || 'Invalid or expired OTP' },
        { status: 401 }
      );
    }

    const normDest = verification.destination || destination;

    // 2. Locate or Create User
    let user;
    if (type === 'PHONE') {
      user = await prisma.user.findFirst({
        where: { phone: normDest },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { email: normDest.toLowerCase() },
      });
    }

    // Role check if logging in from PG Owner portal
    if (requestedRole === 'OWNER') {
      if (!user || user.role !== 'OWNER') {
        return NextResponse.json(
          {
            success: false,
            error: 'No registered PG Owner account found with this phone number. Please contact Stayzy Partner onboarding.',
          },
          { status: 403 }
        );
      }
      if (user.status === 'SUSPENDED') {
        return NextResponse.json(
          {
            success: false,
            error: 'Your PG Owner account has been suspended by Stayzy Platform Operations.',
          },
          { status: 403 }
        );
      }
    }

    // Create new customer account if not found
    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      const defaultEmail = type === 'EMAIL' ? normDest.toLowerCase() : `${normDest.replace(/\D/g, '')}@stayzy.in`;
      const defaultPhone = type === 'PHONE' ? normDest : null;
      const defaultName = type === 'EMAIL' ? normDest.split('@')[0] : 'Stayzy Guest';

      user = await prisma.user.create({
        data: {
          email: defaultEmail,
          phone: defaultPhone,
          name: body.name || defaultName,
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
          provider: type === 'PHONE' ? 'PHONE_OTP' : 'EMAIL_OTP',
          providerAccountId: normDest,
          verifiedAt: new Date(),
        },
      });
    } else {
      isNewUser = !user.profileCompleted;
    }

    // 3. Establish persistent HTTP-only session
    const { token, session } = await establishUserSession(user);

    return NextResponse.json({
      success: true,
      user: session,
      token,
      isNewUser,
      redirectTo: isNewUser ? '/customer/profile-setup' : (user.role === 'OWNER' ? '/owner/dashboard' : '/customer/explore'),
    });
  } catch (err: any) {
    console.error('[API /api/auth/otp/verify Exception]', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}

