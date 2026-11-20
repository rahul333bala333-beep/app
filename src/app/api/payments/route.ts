import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('bookingId');
    const status = searchParams.get('status');
    const q = searchParams.get('q');

    const where: any = {};
    if (bookingId) where.bookingId = bookingId;
    if (status && status !== 'ALL') where.status = status;

    if (q) {
      where.OR = [
        { transactionId: { contains: q } },
        { invoiceNumber: { contains: q } },
        { booking: { bookingNumber: { contains: q } } },
        { booking: { customer: { name: { contains: q } } } },
      ];
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        booking: {
          include: {
            customer: true,
            property: true,
          },
        },
        refunds: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: payments });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

