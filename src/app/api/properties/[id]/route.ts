import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const property = await prisma.property.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        photos: { orderBy: { sortOrder: 'asc' } },
        amenities: true,
        rooms: {
          include: {
            beds: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
            isVerified: true,
          },
        },
        reviews: {
          include: {
            user: { select: { name: true, avatar: true } },
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: property });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(req);
    const { id } = params;
    const body = await req.json();

    const existing = await prisma.property.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
    }

    // Role check: Owner can only edit their own property; Admin/Ops can edit any
    if (session && session.role === 'OWNER' && existing.ownerId !== session.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.property.update({
      where: { id },
      data: {
        name: body.name ?? undefined,
        address: body.address ?? undefined,
        locality: body.locality ?? undefined,
        description: body.description ?? undefined,
        basePricePerNight: body.basePricePerNight ? parseInt(body.basePricePerNight, 10) : undefined,
        depositAmount: body.depositAmount ? parseInt(body.depositAmount, 10) : undefined,
        minStayDays: body.minStayDays ? parseInt(body.minStayDays, 10) : undefined,
        noticePeriodDays: body.noticePeriodDays ? parseInt(body.noticePeriodDays, 10) : undefined,
        status: body.status ?? undefined,
        rules: body.rules ? (typeof body.rules === 'string' ? body.rules : JSON.stringify(body.rules)) : undefined,
      },
      include: {
        photos: true,
        amenities: true,
        rooms: { include: { beds: true } },
      },
    });

    // Update photos if provided
    if (body.photos && Array.isArray(body.photos)) {
      await prisma.propertyPhoto.deleteMany({ where: { propertyId: id } });
      for (let i = 0; i < body.photos.length; i++) {
        await prisma.propertyPhoto.create({
          data: {
            propertyId: id,
            url: typeof body.photos[i] === 'string' ? body.photos[i] : body.photos[i].url,
            caption: typeof body.photos[i] === 'object' ? body.photos[i].caption : `Photo ${i + 1}`,
            sortOrder: i + 1,
            isCover: i === 0,
          },
        });
      }
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: session?.userId || 'system',
        actorName: session?.name || 'User',
        actorRole: session?.role || 'SYSTEM',
        action: 'Updated property details',
        entityType: 'Property',
        entityId: id,
        details: `${updated.name} (Status: ${updated.status})`,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const session = await getServerSession(req);

    // Check for active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        propertyId: id,
        status: { in: ['CONFIRMED', 'PAID_UNASSIGNED'] },
      },
    });

    if (activeBookings > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete property with active confirmed bookings. Unlist it instead.' },
        { status: 400 }
      );
    }

    await prisma.property.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        actorId: session?.userId || 'system',
        actorName: session?.name || 'User',
        actorRole: session?.role || 'ADMIN',
        action: 'Deleted property',
        entityType: 'Property',
        entityId: id,
        details: `Property ID: ${id}`,
      },
    });

    return NextResponse.json({ success: true, message: 'Property deleted' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

