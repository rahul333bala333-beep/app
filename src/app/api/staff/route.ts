import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET() {
  try {
    const staffUsers = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'OPS', 'SUPPORT'] },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    const permissions = await prisma.staffPermission.findMany();

    return NextResponse.json({
      success: true,
      data: {
        staff: staffUsers,
        permissions: permissions.map((p) => ({
          role: p.role,
          permissions: JSON.parse(p.permissions),
        })),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(req);
    const { role, permissions } = await req.json();

    const updated = await prisma.staffPermission.upsert({
      where: { role },
      update: { permissions: JSON.stringify(permissions) },
      create: { role, permissions: JSON.stringify(permissions) },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session?.userId || 'admin',
        actorName: session?.name || 'Admin',
        actorRole: 'ADMIN',
        action: 'Updated staff role permissions',
        entityType: 'StaffPermission',
        entityId: role,
        details: `Role ${role} permissions updated`,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

