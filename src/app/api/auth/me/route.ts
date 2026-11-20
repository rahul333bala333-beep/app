import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(req);
    if (!session) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        status: true,
        avatar: true,
        movingTo: true,
        isVerified: true,
        kycDocuments: true,
        permissions: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name: body.name ?? undefined,
        phone: body.phone ?? undefined,
        movingTo: body.movingTo ?? undefined,
        preferredLocality: body.preferredLocality ?? undefined,
        genderPreference: body.genderPreference ?? undefined,
        occupation: body.occupation ?? undefined,
        profileCompleted: body.profileCompleted ?? undefined,
        avatar: body.avatar ?? undefined,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

