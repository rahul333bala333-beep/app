import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const role = searchParams.get('role');
    const days = searchParams.get('days');

    const where: any = {};
    if (action && action !== 'ALL') where.action = { contains: action };
    if (role && role !== 'ALL') where.actorRole = role;

    if (days && days !== 'ALL') {
      const numDays = parseInt(days, 10);
      const sinceDate = new Date(Date.now() - numDays * 24 * 60 * 60 * 1000);
      where.createdAt = { gte: sinceDate };
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const log = await prisma.auditLog.create({
      data: {
        actorId: body.actorId || null,
        actorName: body.actorName || 'System',
        actorRole: body.actorRole || 'SYSTEM',
        action: body.action,
        entityType: body.entityType || 'General',
        entityId: body.entityId || 'none',
        details: body.details || '',
      },
    });

    return NextResponse.json({ success: true, data: log }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
