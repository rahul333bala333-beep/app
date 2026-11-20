import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(req);
    const { id } = params;
    const { status, scheduledTime, note } = await req.json(); // status: "APPROVED", "RESCHEDULED", "CANCELLED", "COMPLETED"

    const visit = await prisma.visit.findUnique({
      where: { id },
      include: { customer: true, property: true },
    });

    if (!visit) {
      return NextResponse.json({ success: false, error: 'Visit not found' }, { status: 404 });
    }

    const updated = await prisma.visit.update({
      where: { id },
      data: {
        status: status ?? undefined,
        scheduledTime: scheduledTime ? new Date(scheduledTime) : undefined,
        note: note ?? undefined,
      },
      include: { customer: true, property: true },
    });

    // Notify customer
    await prisma.notification.create({
      data: {
        userId: visit.customerId,
        title: `Visit ${status === 'APPROVED' ? 'Confirmed' : status}`,
        message: `Your visit to ${visit.property.name} has been ${status.toLowerCase()}${scheduledTime ? ` for ${new Date(scheduledTime).toLocaleString('en-IN')}` : ''}.`,
        type: 'INFO',
        link: '/customer/visits',
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session?.userId || 'owner',
        actorName: session?.name || 'Owner',
        actorRole: session?.role || 'OWNER',
        action: `Updated visit to ${status}`,
        entityType: 'Visit',
        entityId: id,
        details: `${visit.property.name} - ${visit.customer.name}`,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

