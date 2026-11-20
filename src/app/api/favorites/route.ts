import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(req);
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || session?.userId || 'user-customer-1';

    const saved = await prisma.savedProperty.findMany({
      where: { userId },
      include: {
        property: {
          include: {
            photos: true,
            amenities: true,
            rooms: { include: { beds: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: saved.map((s) => s.property),
      savedIds: saved.map((s) => s.propertyId),
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(req);
    const { propertyId, userId } = await req.json();

    const actualUserId = userId || session?.userId || 'user-customer-1';

    const existing = await prisma.savedProperty.findUnique({
      where: {
        userId_propertyId: {
          userId: actualUserId,
          propertyId,
        },
      },
    });

    if (existing) {
      // Toggle off / remove
      await prisma.savedProperty.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ success: true, saved: false, message: 'Removed from saved' });
    } else {
      // Toggle on / save
      await prisma.savedProperty.create({
        data: {
          userId: actualUserId,
          propertyId,
        },
      });
      return NextResponse.json({ success: true, saved: true, message: 'Added to saved' });
    }
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

