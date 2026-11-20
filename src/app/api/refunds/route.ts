import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const refunds = await prisma.refund.findMany({
      where: status && status !== 'ALL' ? { status } : undefined,
      include: {
        payment: true,
        booking: {
          include: {
            customer: true,
            property: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: refunds });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(req);
    const body = await req.json();
    const { bookingId, paymentId, amount, reason } = body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    const payId = paymentId || (booking.payments.length > 0 ? booking.payments[0].id : null);
    if (!payId) {
      return NextResponse.json({ success: false, error: 'No associated payment found' }, { status: 400 });
    }

    const refund = await prisma.refund.create({
      data: {
        bookingId,
        paymentId: payId,
        amount: amount ? parseInt(amount, 10) : booking.totalAmount,
        reason: reason || 'Customer requested refund',
        status: 'PENDING_REVIEW',
      },
      include: {
        booking: { include: { customer: true, property: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session?.userId || booking.customerId,
        actorName: session?.name || 'Customer',
        actorRole: session?.role || 'CUSTOMER',
        action: 'Requested refund',
        entityType: 'Refund',
        entityId: refund.id,
        details: `${booking.bookingNumber} - Amount: ₹${refund.amount} (Reason: ${refund.reason})`,
      },
    });

    return NextResponse.json({ success: true, data: refund }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(req);
    const body = await req.json();
    const { refundId, action, notes } = body; // action: "APPROVE", "REJECT"

    const refund = await prisma.refund.findUnique({
      where: { id: refundId },
      include: { booking: { include: { customer: true, property: true } }, payment: true },
    });

    if (!refund) {
      return NextResponse.json({ success: false, error: 'Refund request not found' }, { status: 404 });
    }

    const newStatus = action === 'APPROVE' ? 'COMPLETED' : 'REJECTED';

    const result = await prisma.$transaction(async (tx) => {
      const updatedRefund = await tx.refund.update({
        where: { id: refundId },
        data: {
          status: newStatus,
          reviewedBy: session?.name || 'Admin',
        },
      });

      if (action === 'APPROVE') {
        // Mark payment as REFUNDED
        await tx.payment.update({
          where: { id: refund.paymentId },
          data: { status: 'REFUNDED' },
        });

        // Mark booking as CANCELLED
        await tx.booking.update({
          where: { id: refund.bookingId },
          data: { status: 'CANCELLED' },
        });

        // Notify customer
        await tx.notification.create({
          data: {
            userId: refund.booking.customerId,
            title: 'Refund Approved',
            message: `Your refund of ₹${refund.amount.toLocaleString('en-IN')} for booking ${refund.booking.bookingNumber} has been approved and processed.`,
            type: 'PAYMENT',
            link: '/customer/payments',
          },
        });
      } else {
        // Notify customer of rejection
        await tx.notification.create({
          data: {
            userId: refund.booking.customerId,
            title: 'Refund Request Update',
            message: `Your refund request for booking ${refund.booking.bookingNumber} was not approved: ${notes || 'Terms of cancellation policy not met.'}`,
            type: 'PAYMENT',
            link: '/customer/payments',
          },
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: session?.userId || 'admin',
          actorName: session?.name || 'Admin',
          actorRole: session?.role || 'ADMIN',
          action: `${action === 'APPROVE' ? 'Approved' : 'Rejected'} refund`,
          entityType: 'Refund',
          entityId: refundId,
          details: `Booking ${refund.booking.bookingNumber} (₹${refund.amount})`,
        },
      });

      return updatedRefund;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

