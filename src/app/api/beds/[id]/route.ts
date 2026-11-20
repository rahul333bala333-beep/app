import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(req);
    const { id } = params;
    const { status, bedNumber } = await req.json();

    const existingBed = await prisma.bed.findUnique({
      where: { id },
      include: {
        room: true,
        property: true,
      },
    });

    if (!existingBed) {
      return NextResponse.json({ success: false, error: 'Bed not found' }, { status: 404 });
    }

    const updated = await prisma.bed.update({
      where: { id },
      data: {
        status: status ?? undefined,
        bedNumber: bedNumber ?? undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session?.userId || 'system',
        actorName: session?.name || 'User',
        actorRole: session?.role || 'SYSTEM',
        action: 'Updated bed status',
        entityType: 'Bed',
        entityId: id,
        details: `${existingBed.property.name} - Room ${existingBed.room.roomNumber} (${updated.bedNumber}): ${existingBed.status} -> ${updated.status}`,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

