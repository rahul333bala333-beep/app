import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const ticket = await prisma.supportTicket.findFirst({
      where: { OR: [{ id }, { ticketNumber: id }] },
      include: {
        customer: true,
        property: true,
      },
    });

    if (!ticket) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(req);
    const { id } = params;
    const body = await req.json();
    const { status, assigneeName, resolutionNotes, priority } = body;

    const existing = await prisma.supportTicket.findFirst({
      where: { OR: [{ id }, { ticketNumber: id }] },
      include: { customer: true, property: true },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
    }

    const updated = await prisma.supportTicket.update({
      where: { id: existing.id },
      data: {
        status: status ?? undefined,
        assigneeName: assigneeName ?? undefined,
        resolutionNotes: resolutionNotes ?? undefined,
        priority: priority ?? undefined,
        resolvedAt: status === 'RESOLVED' ? new Date() : status === 'OPEN' ? null : undefined,
      },
      include: { customer: true, property: true },
    });

    // Notify customer if ticket resolved or closed
    if (existing.customerId && (status === 'RESOLVED' || status === 'CLOSED')) {
      await prisma.notification.create({
        data: {
          userId: existing.customerId,
          title: `Support Ticket ${status}`,
          message: `Your ticket ${existing.ticketNumber} (${existing.subject}) has been marked ${status.toLowerCase()}.`,
          type: 'TICKET',
          link: '/customer/support',
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        actorId: session?.userId || 'staff',
        actorName: session?.name || 'Support Staff',
        actorRole: session?.role || 'SUPPORT',
        action: `Updated ticket ${existing.ticketNumber} (${status || 'notes'})`,
        entityType: 'SupportTicket',
        entityId: existing.id,
        details: `${existing.subject} - Notes: ${resolutionNotes || 'Updated'}`,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

