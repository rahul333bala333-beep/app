import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const q = searchParams.get('q');

    const where: any = { role: 'OWNER' };
    if (status && status !== 'ALL') where.status = status;

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
      ];
    }

    const owners = await prisma.user.findMany({
      where,
      include: {
        properties: {
          select: { id: true, name: true, locality: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: owners.map((o) => ({
        id: o.id,
        name: o.name,
        email: o.email,
        phone: o.phone,
        status: o.status,
        avatar: o.avatar || o.name.slice(0, 2).toUpperCase(),
        pgCount: o.properties.length,
        properties: o.properties,
        isVerified: o.isVerified,
        createdAt: o.createdAt,
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(req);
    const body = await req.json();
    const { name, email, phone } = body;

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: 'User with this email already exists' }, { status: 400 });
    }

    const owner = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        role: 'OWNER',
        status: 'ACTIVE',
        avatar: name.slice(0, 2).toUpperCase(),
        isVerified: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session?.userId || 'admin',
        actorName: session?.name || 'Admin',
        actorRole: 'ADMIN',
        action: 'Added new PG owner',
        entityType: 'User',
        entityId: owner.id,
        details: `${owner.name} (${owner.email})`,
      },
    });

    return NextResponse.json({ success: true, data: owner }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(req);
    const { ownerId, status } = await req.json();

    const updated = await prisma.user.update({
      where: { id: ownerId },
      data: { status },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session?.userId || 'admin',
        actorName: session?.name || 'Admin',
        actorRole: 'ADMIN',
        action: `Updated owner status to ${status}`,
        entityType: 'User',
        entityId: ownerId,
        details: `${updated.name} account is now ${status}`,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

