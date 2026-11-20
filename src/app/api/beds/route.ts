import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    const propertyId = searchParams.get('propertyId');
    const status = searchParams.get('status');

    const where: any = {};
    if (roomId) where.roomId = roomId;
    if (propertyId) where.propertyId = propertyId;
    if (status) where.status = status;

    const beds = await prisma.bed.findMany({
      where,
      include: {
        room: true,
        property: { select: { id: true, name: true } },
      },
      orderBy: { bedNumber: 'asc' },
    });

    return NextResponse.json({ success: true, data: beds });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { roomId, propertyId, bedNumber, status } = body;

    const bed = await prisma.bed.create({
      data: {
        roomId,
        propertyId,
        bedNumber,
        status: status || 'AVAILABLE',
      },
    });

    return NextResponse.json({ success: true, data: bed }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

