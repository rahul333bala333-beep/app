import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const propertyId = searchParams.get('propertyId');
    const status = searchParams.get('status');

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (propertyId) where.propertyId = propertyId;
    if (status && status !== 'ALL') where.status = status;

    const tickets = await prisma.supportTicket.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true } },
        property: { select: { id: true, name: true, locality: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: tickets });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(req);
    const body = await req.json();
    const { customerId, propertyId, subject, description, priority } = body;

    const actualCustomerId = customerId || session?.userId || 'user-customer-1';
    const propId = propertyId || 'prop-hsr-1';
    const ticketNumber = `ST-${Math.floor(1000 + Math.random() * 9000)}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        customerId: actualCustomerId,
        propertyId: propId,
        subject,
        description: description || '',
        priority: priority || 'MEDIUM',
        status: 'OPEN',
      },
      include: {
        customer: true,
        property: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: actualCustomerId,
        actorName: session?.name || 'Customer',
        actorRole: session?.role || 'CUSTOMER',
        action: 'Opened support ticket',
        entityType: 'SupportTicket',
        entityId: ticket.id,
        details: `${ticketNumber}: ${subject}`,
      },
    });

    return NextResponse.json({ success: true, data: ticket }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

