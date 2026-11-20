import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, paymentId, signature, bookingId, amount, method } = body;

    // Idempotency check: Has this transaction already been recorded?
    if (paymentId) {
      const existing = await prisma.payment.findUnique({
        where: { transactionId: paymentId },
      });
      if (existing) {
        return NextResponse.json({
          success: true,
          message: 'Payment already processed (Idempotent)',
          data: existing,
        });
      }
    }

    // In sandbox/test environment: Verify signature or validate test parameters
    const gatewaySecret = process.env.PAYMENT_SECRET || 'stayzy_sandbox_secret_2024';
    let isSignatureValid = true;

    if (orderId && paymentId && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', gatewaySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');
      // In sandbox mode accept if signature matches or if simulated in development
      isSignatureValid = signature === expectedSignature || process.env.NODE_ENV !== 'production';
    }

    if (!isSignatureValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature from gateway' },
        { status: 400 }
      );
    }

    const txnId = paymentId || `TXN-${Date.now().toString().slice(-6)}`;
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        transactionId: txnId,
        amount: amount ? parseInt(amount, 10) : 4900,
        method: method || 'UPI',
        status: 'PAID',
        invoiceNumber: `INV-${randomSuffix}`,
      },
      include: {
        booking: {
          include: { customer: true, property: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: payment });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

