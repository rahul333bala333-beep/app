import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get('propertyId');

    const blocks = await prisma.maintenanceBlock.findMany({
      where: propertyId ? { propertyId } : undefined,
      include: {
        room: true,
        bed: true,
        property: { select: { id: true, name: true } },
      },
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json({ success: true, data: blocks });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(req);
    const body = await req.json();
    const { propertyId, roomId, bedId, startDate, endDate, reason } = body;

    const block = await prisma.maintenanceBlock.create({
      data: {
        propertyId: propertyId || 'prop-hsr-1',
        roomId: roomId || null,
        bedId: bedId || null,
        startDate: new Date(startDate || '2024-12-12'),
        endDate: new Date(endDate || '2024-12-18'),
        reason: reason || 'Scheduled maintenance & sanitization',
      },
      include: {
        room: true,
        bed: true,
      },
    });

    // If a specific bed was blocked, set its status to MAINTENANCE
    if (bedId) {
      await prisma.bed.update({
        where: { id: bedId },
        data: { status: 'MAINTENANCE' },
      });
    }

    await prisma.auditLog.create({
      data: {
        actorId: session?.userId || 'owner',
        actorName: session?.name || 'Owner',
        actorRole: session?.role || 'OWNER',
        action: 'Created maintenance block',
        entityType: 'MaintenanceBlock',
        entityId: block.id,
        details: `${reason} (${new Date(block.startDate).toLocaleDateString()} to ${new Date(block.endDate).toLocaleDateString()})`,
      },
    });

    return NextResponse.json({ success: true, data: block }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'id parameter is required' }, { status: 400 });
    }

    const block = await prisma.maintenanceBlock.findUnique({ where: { id } });
    if (block && block.bedId) {
      await prisma.bed.update({
        where: { id: block.bedId },
        data: { status: 'AVAILABLE' },
      });
    }

    await prisma.maintenanceBlock.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Maintenance block removed' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

