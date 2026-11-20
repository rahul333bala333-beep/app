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

    const visits = await prisma.visit.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true } },
        property: { select: { id: true, name: true, locality: true, address: true, ownerId: true } },
      },
      orderBy: { scheduledTime: 'asc' },
    });

    return NextResponse.json({ success: true, data: visits });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(req);
    const body = await req.json();
    const { customerId, propertyId, scheduledTime, note } = body;

    const actualCustomerId = customerId || session?.userId || 'user-customer-1';

    const visit = await prisma.visit.create({
      data: {
        customerId: actualCustomerId,
        propertyId,
        scheduledTime: new Date(scheduledTime || Date.now() + 86400000),
        status: 'PENDING',
        note: note || '',
      },
      include: {
        customer: true,
        property: true,
      },
    });

    // Notify the owner
    await prisma.notification.create({
      data: {
        userId: visit.property.ownerId,
        title: 'New Visit Request',
        message: `${visit.customer.name} requested a visit to ${visit.property.name} on ${new Date(visit.scheduledTime).toLocaleDateString('en-IN')}.`,
        type: 'INFO',
        link: '/owner/visits',
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: actualCustomerId,
        actorName: session?.name || visit.customer.name,
        actorRole: 'CUSTOMER',
        action: 'Scheduled property visit',
        entityType: 'Visit',
        entityId: visit.id,
        details: `${visit.property.name} at ${new Date(visit.scheduledTime).toLocaleString('en-IN')}`,
      },
    });

    return NextResponse.json({ success: true, data: visit }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

