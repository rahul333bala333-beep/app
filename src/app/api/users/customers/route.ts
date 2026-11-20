import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');

    const where: any = { role: 'CUSTOMER' };

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
      ];
    }

    const customers = await prisma.user.findMany({
      where,
      include: {
        bookings: {
          orderBy: { createdAt: 'desc' },
          include: {
            property: { select: { id: true, name: true } },
            payments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: customers.map((c) => {
        const lastBkg = c.bookings[0];
        return {
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone || 'N/A',
          status: c.status,
          avatar: c.avatar || c.name.slice(0, 2).toUpperCase(),
          bookingCount: c.bookings.length,
          lastBooking: lastBkg
            ? `${new Date(lastBkg.checkInDate).getDate()}-${new Date(lastBkg.checkOutDate).getDate()} ${new Date(lastBkg.checkOutDate).toLocaleString('default', { month: 'short' })}`
            : 'No bookings',
          lastProperty: lastBkg ? lastBkg.property.name : null,
          bookings: c.bookings,
        };
      }),
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

