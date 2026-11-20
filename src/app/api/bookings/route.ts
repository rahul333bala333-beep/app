import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const propertyId = searchParams.get('propertyId');
    const status = searchParams.get('status');
    const q = searchParams.get('q');

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (propertyId) where.propertyId = propertyId;
    if (status && status !== 'ALL') where.status = status;

    if (q) {
      where.OR = [
        { bookingNumber: { contains: q } },
        { customer: { name: { contains: q } } },
        { customer: { phone: { contains: q } } },
        { property: { name: { contains: q } } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true, avatar: true } },
        property: { select: { id: true, name: true, locality: true, address: true } },
        bed: { include: { room: true } },
        payments: true,
        refunds: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: bookings });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(req);
    const body = await req.json();

    const {
      customerId,
      propertyId,
      bedId,
      roomType,
      checkInDate,
      checkOutDate,
      nightsCount,
      nightlyRate,
      totalAmount,
      paymentMethod,
    } = body;

    const actualCustomerId = customerId || session?.userId || 'user-customer-1';

    // Verify property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
    }

    // Atomic transaction for double-booking prevention
    const result = await prisma.$transaction(async (tx) => {
      let assignedBedId = bedId || null;
      let bookingStatus = 'CONFIRMED';

      if (assignedBedId) {
        // 1. Lock/verify bed exists and is available
        const bed = await tx.bed.findUnique({
          where: { id: assignedBedId },
          include: { room: true },
        });

        if (!bed) {
          throw new Error('Selected bed does not exist');
        }

        if (bed.status !== 'AVAILABLE') {
          // If the requested bed is already occupied, check if we should create a PAID_UNASSIGNED booking
          bookingStatus = 'PAID_UNASSIGNED';
          assignedBedId = null;
        } else {
          // Check for overlapping active bookings on this bed
          const checkIn = new Date(checkInDate);
          const checkOut = new Date(checkOutDate);

          const overlapping = await tx.booking.findFirst({
            where: {
              bedId: assignedBedId,
              status: { in: ['CONFIRMED', 'PAID_UNASSIGNED'] },
              OR: [
                {
                  checkInDate: { lte: checkOut },
                  checkOutDate: { gte: checkIn },
                },
              ],
            },
          });

          if (overlapping) {
            bookingStatus = 'PAID_UNASSIGNED';
            assignedBedId = null;
          } else {
            // Bed is available! Mark it OCCUPIED
            await tx.bed.update({
              where: { id: assignedBedId },
              data: { status: 'OCCUPIED' },
            });
          }
        }
      } else {
        // If no bedId requested directly, find first available bed matching roomType or mark PAID_UNASSIGNED
        const availableBed = await tx.bed.findFirst({
          where: {
            propertyId,
            status: 'AVAILABLE',
          },
        });

        if (availableBed) {
          assignedBedId = availableBed.id;
          await tx.bed.update({
            where: { id: availableBed.id },
            data: { status: 'OCCUPIED' },
          });
        } else {
          bookingStatus = 'PAID_UNASSIGNED';
        }
      }

      // Generate unique booking number
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      const bookingNumber = `BKG${randomSuffix}`;
      const nights = nightsCount ? parseInt(nightsCount, 10) : 7;
      const rate = nightlyRate ? parseInt(nightlyRate, 10) : property.basePricePerNight;
      const total = totalAmount ? parseInt(totalAmount, 10) : nights * rate;

      // Create Booking
      const booking = await tx.booking.create({
        data: {
          bookingNumber,
          customerId: actualCustomerId,
          propertyId,
          bedId: assignedBedId,
          roomType: roomType || 'Single Bed - Non AC',
          checkInDate: new Date(checkInDate || Date.now()),
          checkOutDate: new Date(checkOutDate || Date.now() + 7 * 86400000),
          nightsCount: nights,
          nightlyRate: rate,
          totalAmount: total,
          status: bookingStatus,
          isCheckedIn: false,
        },
        include: {
          bed: { include: { room: true } },
          customer: true,
          property: true,
        },
      });

      // Create Payment
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          transactionId: `TXN-${randomSuffix}0`,
          amount: total,
          method: paymentMethod || 'UPI',
          status: 'PAID',
          invoiceNumber: `INV-${randomSuffix}`,
        },
      });

      // Create Notification for Customer
      await tx.notification.create({
        data: {
          userId: actualCustomerId,
          title: 'Booking Confirmed!',
          message: `Your booking ${bookingNumber} at ${property.name} is confirmed for ${nights} nights.`,
          type: 'BOOKING',
          link: `/customer/stays/${booking.id}`,
        },
      });

      // Create Notification for Owner
      await tx.notification.create({
        data: {
          userId: property.ownerId,
          title: 'New Booking Received',
          message: `New booking ${bookingNumber} received for ${property.name} (Amount: ₹${total.toLocaleString('en-IN')}).`,
          type: 'BOOKING',
          link: `/owner/bookings/${booking.id}`,
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          actorId: session?.userId || actualCustomerId,
          actorName: session?.name || 'Customer',
          actorRole: session?.role || 'CUSTOMER',
          action: 'Created booking & completed payment',
          entityType: 'Booking',
          entityId: booking.id,
          details: `${bookingNumber} -> ${property.name} (Status: ${bookingStatus})`,
        },
      });

      return { booking, payment };
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
