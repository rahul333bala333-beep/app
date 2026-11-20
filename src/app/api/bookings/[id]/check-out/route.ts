import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(req);
    const { id } = params;

    const booking = await prisma.booking.findFirst({
      where: { OR: [{ id }, { bookingNumber: id }] },
      include: { customer: true, property: true, bed: true },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Free the bed so it's AVAILABLE again
      if (booking.bedId) {
        await tx.bed.update({
          where: { id: booking.bedId },
          data: { status: 'AVAILABLE' },
        });
      }

      const updated = await tx.booking.update({
        where: { id: booking.id },
        data: {
          isCheckedIn: false,
          checkedOutAt: new Date(),
          status: 'COMPLETED',
        },
        include: { customer: true, bed: { include: { room: true } } },
      });

      await tx.notification.create({
        data: {
          userId: booking.customerId,
          title: 'Check-out Completed',
          message: `Thank you for staying at ${booking.property.name}. We hope to see you again!`,
          type: 'BOOKING',
          link: `/customer/stays/${booking.id}`,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: session?.userId || 'owner',
          actorName: session?.name || 'Owner',
          actorRole: session?.role || 'OWNER',
          action: 'Checked-out resident',
          entityType: 'Booking',
          entityId: booking.id,
          details: `${booking.customer.name} checked out from ${booking.property.name}. Bed freed to AVAILABLE.`,
        },
      });

      return updated;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

