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

    if (booking.status !== 'CONFIRMED') {
      return NextResponse.json(
        { success: false, error: 'Cannot check-in booking that is not confirmed or unassigned' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // If bed is assigned, ensure status is OCCUPIED
      if (booking.bedId) {
        await tx.bed.update({
          where: { id: booking.bedId },
          data: { status: 'OCCUPIED' },
        });
      }

      const updated = await tx.booking.update({
        where: { id: booking.id },
        data: {
          isCheckedIn: true,
          checkedInAt: new Date(),
        },
        include: { customer: true, bed: { include: { room: true } } },
      });

      await tx.notification.create({
        data: {
          userId: booking.customerId,
          title: 'Checked In Successfully!',
          message: `Welcome to ${booking.property.name}! Your check-in is complete.`,
          type: 'BOOKING',
          link: `/customer/stays/${booking.id}`,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: session?.userId || 'owner',
          actorName: session?.name || 'Owner',
          actorRole: session?.role || 'OWNER',
          action: 'Checked-in resident',
          entityType: 'Booking',
          entityId: booking.id,
          details: `${booking.customer.name} -> ${booking.property.name} (${booking.bookingNumber})`,
        },
      });

      return updated;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

