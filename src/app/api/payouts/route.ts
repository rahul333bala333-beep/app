import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get('ownerId');

    const payouts = await prisma.payout.findMany({
      where: ownerId ? { ownerId } : undefined,
      include: {
        property: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
      },
      orderBy: { requestedAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: payouts });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(req);
    const body = await req.json();
    const { ownerId, propertyId, amount } = body;

    const actualOwnerId = ownerId || session?.userId || 'user-owner-1';
    const propId = propertyId || 'prop-hsr-1';

    const payout = await prisma.payout.create({
      data: {
        ownerId: actualOwnerId,
        propertyId: propId,
        amount: amount ? parseInt(amount, 10) : 15000,
        status: 'PENDING',
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: actualOwnerId,
        actorName: session?.name || 'Owner',
        actorRole: 'OWNER',
        action: 'Submitted payout request',
        entityType: 'Payout',
        entityId: payout.id,
        details: `Amount: ₹${payout.amount.toLocaleString('en-IN')}`,
      },
    });

    return NextResponse.json({ success: true, data: payout }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

