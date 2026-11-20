import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const booking = await prisma.booking.findFirst({
      where: {
        OR: [{ id }, { bookingNumber: id }],
      },
      include: {
        customer: true,
        property: {
          include: {
            owner: { select: { id: true, name: true, phone: true, email: true } },
          },
        },
        bed: {
          include: {
            room: true,
          },
        },
        payments: true,
        refunds: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(req);
    const { id } = params;
    const body = await req.json();

    const booking = await prisma.booking.findFirst({
      where: { OR: [{ id }, { bookingNumber: id }] },
      include: { bed: { include: { room: true } }, property: true, payments: true },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    // A. Action: Assign / Move Bed
    if (body.action === 'ASSIGN_BED' || body.bedId) {
      const newBedId = body.bedId;

      const result = await prisma.$transaction(async (tx) => {
        // Free old bed if any
        if (booking.bedId && booking.bedId !== newBedId) {
          await tx.bed.update({
            where: { id: booking.bedId },
            data: { status: 'AVAILABLE' },
          });
        }

        // Verify new bed is available
        const targetBed = await tx.bed.findUnique({
          where: { id: newBedId },
          include: { room: true },
        });

        if (!targetBed) {
          throw new Error('Target bed not found');
        }

        // Mark target bed OCCUPIED
        await tx.bed.update({
          where: { id: newBedId },
          data: { status: 'OCCUPIED' },
        });

        // Update booking to CONFIRMED
        const updatedBooking = await tx.booking.update({
          where: { id: booking.id },
          data: {
            bedId: newBedId,
            status: 'CONFIRMED',
          },
          include: {
            bed: { include: { room: true } },
            customer: true,
            property: true,
          },
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            actorId: session?.userId || 'admin',
            actorName: session?.name || 'Admin',
            actorRole: session?.role || 'ADMIN',
            action: 'Assigned bed',
            entityType: 'Booking',
            entityId: booking.id,
            details: `${booking.bookingNumber} -> Room ${targetBed.room.roomNumber} (${targetBed.bedNumber})`,
          },
        });

        return updatedBooking;
      });

      return NextResponse.json({ success: true, data: result });
    }

    // B. Action: Extend Stay
    if (body.action === 'EXTEND_STAY') {
      const additionalNights = body.additionalNights ? parseInt(body.additionalNights, 10) : 7;
      const currentOut = new Date(booking.checkOutDate);
      const newOut = new Date(currentOut.getTime() + additionalNights * 86400000);
      const additionalCost = additionalNights * booking.nightlyRate;

      const updated = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          checkOutDate: newOut,
          nightsCount: booking.nightsCount + additionalNights,
          totalAmount: booking.totalAmount + additionalCost,
        },
        include: { bed: { include: { room: true } }, customer: true, property: true },
      });

      await prisma.auditLog.create({
        data: {
          actorId: session?.userId || booking.customerId,
          actorName: session?.name || 'Customer',
          actorRole: session?.role || 'CUSTOMER',
          action: 'Extended stay',
          entityType: 'Booking',
          entityId: booking.id,
          details: `${booking.bookingNumber} extended by ${additionalNights} nights (+₹${additionalCost})`,
        },
      });

      return NextResponse.json({ success: true, data: updated });
    }

    // C. Action: Cancel Booking
    if (body.action === 'CANCEL') {
      const result = await prisma.$transaction(async (tx) => {
        // Free the bed if assigned
        if (booking.bedId) {
          await tx.bed.update({
            where: { id: booking.bedId },
            data: { status: 'AVAILABLE' },
          });
        }

        // Update booking
        const cancelled = await tx.booking.update({
          where: { id: booking.id },
          data: {
            status: 'CANCELLED',
          },
        });

        // Auto-create refund request if payment exists
        if (booking.payments.length > 0) {
          const mainPay = booking.payments[0];
          await tx.refund.create({
            data: {
              paymentId: mainPay.id,
              bookingId: booking.id,
              amount: mainPay.amount,
              reason: body.reason || 'Customer requested stay cancellation',
              status: 'PENDING_REVIEW',
            },
          });
        }

        await tx.auditLog.create({
          data: {
            actorId: session?.userId || booking.customerId,
            actorName: session?.name || 'User',
            actorRole: session?.role || 'CUSTOMER',
            action: 'Cancelled booking',
            entityType: 'Booking',
            entityId: booking.id,
            details: `${booking.bookingNumber} cancelled. Refund queued for review.`,
          },
        });

        return cancelled;
      });

      return NextResponse.json({ success: true, data: result });
    }

    // Generic update
    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: body.status ?? undefined,
        roomType: body.roomType ?? undefined,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

