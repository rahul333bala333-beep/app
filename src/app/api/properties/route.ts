import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const locality = searchParams.get('locality');
    const ownerId = searchParams.get('ownerId');
    const status = searchParams.get('status');
    const query = searchParams.get('q');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const where: any = {};

    if (ownerId) {
      where.ownerId = ownerId;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    } else if (!ownerId && !status) {
      // Default to public listed properties for customer exploration
      where.status = 'LISTED';
    }

    if (locality && locality !== 'All' && locality !== 'All Localities') {
      where.locality = { contains: locality };
    }

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { locality: { contains: query } },
        { address: { contains: query } },
        { city: { contains: query } },
      ];
    }

    if (minPrice || maxPrice) {
      where.basePricePerNight = {};
      if (minPrice) where.basePricePerNight.gte = parseInt(minPrice, 10);
      if (maxPrice) where.basePricePerNight.lte = parseInt(maxPrice, 10);
    }

    const properties = await prisma.property.findMany({
      where,
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: properties });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(req);
    const body = await req.json();

    const ownerId = body.ownerId || session?.userId || 'user-owner-1';
    const slug = (body.name || 'stayzy-pg')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + `-${Date.now().toString().slice(-4)}`;

    const newProperty = await prisma.property.create({
      data: {
        ownerId,
        name: body.name,
        slug,
        address: body.address,
        locality: body.locality || 'HSR Layout',
        city: body.city || 'Bengaluru',
        description: body.description || '',
        basePricePerNight: body.basePricePerNight ? parseInt(body.basePricePerNight, 10) : 700,
        depositAmount: body.depositAmount ? parseInt(body.depositAmount, 10) : 5000,
        minStayDays: body.minStayDays ? parseInt(body.minStayDays, 10) : 7,
        noticePeriodDays: body.noticePeriodDays ? parseInt(body.noticePeriodDays, 10) : 7,
        status: 'PENDING_VERIFICATION',
        rules: body.rules ? JSON.stringify(body.rules) : JSON.stringify({
          minStay: '7 nights',
          noticePeriod: '7 days',
          smoking: false,
          outsideGuests: false,
        }),
      },
      include: {
        photos: true,
        amenities: true,
      },
    });

    // Create default photos if provided
    if (body.photos && Array.isArray(body.photos)) {
      for (let i = 0; i < body.photos.length; i++) {
        await prisma.propertyPhoto.create({
          data: {
            propertyId: newProperty.id,
            url: body.photos[i],
            sortOrder: i + 1,
            isCover: i === 0,
          },
        });
      }
    } else {
      // Default placeholder photo
      await prisma.propertyPhoto.create({
        data: {
          propertyId: newProperty.id,
          url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
          sortOrder: 1,
          isCover: true,
          caption: 'Property Exterior',
        },
      });
    }

    // Create default amenities
    const amenityList = body.amenities || ['Wi-Fi', 'Meals (3x)', 'Laundry', 'Housekeeping'];
    for (const item of amenityList) {
      await prisma.amenity.create({
        data: {
          propertyId: newProperty.id,
          name: typeof item === 'string' ? item : item.name,
        },
      });
    }

    // Default Rooms & Beds
    const r1 = await prisma.room.create({
      data: {
        propertyId: newProperty.id,
        roomNumber: '101',
        sharingType: 2,
        floor: 1,
        isAc: true,
        basePricePerNight: newProperty.basePricePerNight,
      },
    });

    await prisma.bed.createMany({
      data: [
        { roomId: r1.id, propertyId: newProperty.id, bedNumber: 'Bed A', status: 'AVAILABLE' },
        { roomId: r1.id, propertyId: newProperty.id, bedNumber: 'Bed B', status: 'AVAILABLE' },
      ],
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: ownerId,
        actorName: session?.name || 'Owner',
        actorRole: 'OWNER',
        action: 'Submitted PG for verification',
        entityType: 'Property',
        entityId: newProperty.id,
        details: `${newProperty.name} (${newProperty.locality})`,
      },
    });

    return NextResponse.json({ success: true, data: newProperty }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
