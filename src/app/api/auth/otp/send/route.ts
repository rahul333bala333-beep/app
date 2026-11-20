import { NextResponse } from 'next/server';
import { requestOtp } from '@/lib/services/otp';
import { sendSmsOtp } from '@/lib/services/sms';
import { sendEmailOtp } from '@/lib/services/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const destination = body.destination || body.phone || body.email;
    const type: 'PHONE' | 'EMAIL' = body.type || (body.email ? 'EMAIL' : 'PHONE');
    const purpose = body.purpose || 'CUSTOMER_LOGIN';

    if (!destination) {
      return NextResponse.json(
        { success: false, error: type === 'EMAIL' ? 'Email address is required' : 'Phone number is required' },
        { status: 400 }
      );
    }

    // 1. Generate & Hash OTP with rate-limiting & cooldown
    const result = await requestOtp({ destination, type, purpose });
    if (!result.success || !result.otp) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to generate verification code' },
        { status: 429 }
      );
    }

    // 2. Dispatch through Real SMS or Email Service
    let dispatchResult;
    if (type === 'PHONE') {
      dispatchResult = await sendSmsOtp({ phone: destination, otp: result.otp });
    } else {
      dispatchResult = await sendEmailOtp({ email: destination, otp: result.otp });
    }

    if (!dispatchResult.success) {
      return NextResponse.json(
        { success: false, error: dispatchResult.error || 'Failed to dispatch verification code' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${destination}`,
      cooldownSeconds: result.cooldownSeconds || 60,
      expiresAt: result.expiresAt,
    });
  } catch (err: any) {
    console.error('[API /api/auth/otp/send Exception]', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}

