import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get('propertyId');

    const rooms = await prisma.room.findMany({
      where: propertyId ? { propertyId } : undefined,
      include: {
        beds: true,
        property: {
          select: { id: true, name: true, locality: true },
        },
      },
      orderBy: { roomNumber: 'asc' },
    });

    return NextResponse.json({ success: true, data: rooms });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { propertyId, roomNumber, sharingType, floor, isAc, basePricePerNight } = body;

    if (!propertyId || !roomNumber) {
      return NextResponse.json({ success: false, error: 'propertyId and roomNumber are required' }, { status: 400 });
    }

    const room = await prisma.room.create({
      data: {
        propertyId,
        roomNumber,
        sharingType: parseInt(sharingType || 2, 10),
        floor: parseInt(floor || 1, 10),
        isAc: Boolean(isAc),
        basePricePerNight: parseInt(basePricePerNight || 700, 10),
      },
    });

    // Auto-create beds based on sharing type
    const bedsCount = room.sharingType;
    for (let i = 0; i < bedsCount; i++) {
      const letter = String.fromCharCode(65 + i); // A, B, C, D
      await prisma.bed.create({
        data: {
          roomId: room.id,
          propertyId,
          bedNumber: `Bed ${letter}`,
          status: 'AVAILABLE',
        },
      });
    }

    const completeRoom = await prisma.room.findUnique({
      where: { id: room.id },
      include: { beds: true },
    });

    return NextResponse.json({ success: true, data: completeRoom }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

