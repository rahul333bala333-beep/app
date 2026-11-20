import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const escalations = await prisma.escalation.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: escalations });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(req);
    const body = await req.json();
    const { title, propertyId, priority, assignedTo } = body;

    const count = await prisma.escalation.count();
    const code = `E-${1043 + count}`;

    const escalation = await prisma.escalation.create({
      data: {
        code,
        title,
        propertyId: propertyId || 'prop-hsr-1',
        priority: priority || 'HIGH',
        status: 'OPEN',
        assignedTo: assignedTo || 'Ops Team',
        since: 'Just now',
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session?.userId || 'staff',
        actorName: session?.name || 'Staff',
        actorRole: session?.role || 'OPS',
        action: 'Created escalation',
        entityType: 'Escalation',
        entityId: escalation.id,
        details: `${code} (${title})`,
      },
    });

    return NextResponse.json({ success: true, data: escalation }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(req);
    const { id, status, assignedTo } = await req.json();

    const updated = await prisma.escalation.update({
      where: { id },
      data: {
        status: status ?? undefined,
        assignedTo: assignedTo ?? undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session?.userId || 'staff',
        actorName: session?.name || 'Staff',
        actorRole: session?.role || 'OPS',
        action: `Updated escalation status to ${status}`,
        entityType: 'Escalation',
        entityId: id,
        details: `${updated.code} (${updated.title})`,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

