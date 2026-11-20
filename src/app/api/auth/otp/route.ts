import { NextResponse } from 'next/server';
import { requestOtp, verifyOtpSubmission } from '@/lib/services/otp';
import { sendSmsOtp } from '@/lib/services/sms';
import { sendEmailOtp } from '@/lib/services/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = body.action || 'send';
    const destination = body.destination || body.phone || body.email;
    const type: 'PHONE' | 'EMAIL' = body.type || (body.email ? 'EMAIL' : 'PHONE');
    const otp = body.otp;

    if (!destination) {
      return NextResponse.json({ success: false, error: 'Destination (phone or email) is required' }, { status: 400 });
    }

    if (action === 'send') {
      const result = await requestOtp({ destination, type });
      if (!result.success || !result.otp) {
        return NextResponse.json({ success: false, error: result.error || 'Failed to send OTP' }, { status: 429 });
      }

      if (type === 'PHONE') {
        await sendSmsOtp({ phone: destination, otp: result.otp });
      } else {
        await sendEmailOtp({ email: destination, otp: result.otp });
      }

      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully to ' + destination,
        cooldownSeconds: result.cooldownSeconds || 60,
        // In test mode, return the otp to expedite automated tests
        otp: process.env.NODE_ENV === 'production' ? undefined : result.otp,
      });
    }

    if (action === 'verify') {
      if (!otp) {
        return NextResponse.json({ success: false, error: 'OTP is required' }, { status: 400 });
      }

      const verifyResult = await verifyOtpSubmission({ destination, otp, type });
      if (!verifyResult.success) {
        return NextResponse.json({ success: false, error: verifyResult.error || 'Invalid or expired OTP' }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: 'OTP verified successfully' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action. Expected "send" or "verify"' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
