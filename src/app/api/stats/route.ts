import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get('ownerId');

    // 1. Total and occupied beds
    const bedWhere: any = {};
    if (ownerId) {
      bedWhere.property = { ownerId };
    }

    const totalBeds = await prisma.bed.count({ where: bedWhere });
    const occupiedBeds = await prisma.bed.count({
      where: {
        ...bedWhere,
        status: 'OCCUPIED',
      },
    });
    const availableBeds = await prisma.bed.count({
      where: {
        ...bedWhere,
        status: 'AVAILABLE',
      },
    });
    const maintenanceBeds = await prisma.bed.count({
      where: {
        ...bedWhere,
        status: 'MAINTENANCE',
      },
    });

    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    // 2. Bookings
    const bookingWhere: any = {};
    if (ownerId) {
      bookingWhere.property = { ownerId };
    }

    const totalBookings = await prisma.booking.count({ where: bookingWhere });
    const activeBookings = await prisma.booking.count({
      where: {
        ...bookingWhere,
        status: { in: ['CONFIRMED', 'PAID_UNASSIGNED'] },
      },
    });

    const unassignedBookings = await prisma.booking.count({
      where: {
        ...bookingWhere,
        status: 'PAID_UNASSIGNED',
      },
    });

    // 3. Issues & Escalations
    const openEscalations = await prisma.escalation.count({
      where: { status: 'OPEN' },
    });
    const openTickets = await prisma.supportTicket.count({
      where: { status: 'OPEN' },
    });
    const totalIssues = unassignedBookings + openEscalations;

    // 4. Financial totals
    const payments = await prisma.payment.findMany({
      where: {
        status: 'PAID',
        booking: ownerId ? { property: { ownerId } } : undefined,
      },
      select: { amount: true },
    });
    const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);

    // 5. Properties
    const propertyWhere: any = {};
    if (ownerId) propertyWhere.ownerId = ownerId;
    const totalProperties = await prisma.property.count({ where: propertyWhere });

    return NextResponse.json({
      success: true,
      data: {
        occupancyRate,
        totalBeds,
        occupiedBeds,
        availableBeds,
        maintenanceBeds,
        activeBookings,
        unassignedBookings,
        totalBookings,
        openEscalations,
        openTickets,
        totalIssues,
        totalRevenue,
        totalProperties,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

