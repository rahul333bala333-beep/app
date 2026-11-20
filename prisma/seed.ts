import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string) {
  const salt = '1234567890abcdef1234567890abcdef';
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

async function main() {
  console.log('Seeding Stayzy SQLite Database...');

  // 1. Clean existing records in correct relation order
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.savedProperty.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.escalation.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.maintenanceBlock.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.bed.deleteMany();
  await prisma.room.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.propertyPhoto.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.property.deleteMany();
  await prisma.oTPVerification.deleteMany();
  await prisma.staffPermission.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.user.deleteMany();

  const { hash, salt } = hashPassword('password123');

  // 2. Seed Users
  const adminUser = await prisma.user.create({
    data: {
      id: 'user-admin-1',
      email: 'admin@stayzy.in',
      name: 'Platform Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
      passwordHash: hash,
      salt: salt,
      isVerified: true,
    },
  });

  const opsUser = await prisma.user.create({
    data: {
      id: 'user-ops-1',
      email: 'ops@stayzy.in',
      name: 'Operations Lead',
      role: 'OPS',
      status: 'ACTIVE',
      passwordHash: hash,
      salt: salt,
      isVerified: true,
    },
  });

  const supportUser = await prisma.user.create({
    data: {
      id: 'user-support-1',
      email: 'megha@stayzy.in',
      name: 'Megha Kulkarni',
      role: 'SUPPORT',
      status: 'ACTIVE',
      passwordHash: hash,
      salt: salt,
      isVerified: true,
    },
  });

  const owner1 = await prisma.user.create({
    data: {
      id: 'user-owner-1',
      email: 'rakesh@hsrgarden.in',
      phone: '+91 98765 43210',
      name: 'Rakesh Kumar',
      role: 'OWNER',
      status: 'ACTIVE',
      avatar: 'RK',
      passwordHash: hash,
      salt: salt,
      isVerified: true,
      kycDocuments: JSON.stringify({ ownerId: true, propertyLicense: true, photos: true }),
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      id: 'user-owner-2',
      email: 'sneha@staypg.in',
      phone: '+91 98450 11223',
      name: 'Sneha Patel',
      role: 'OWNER',
      status: 'ACTIVE',
      avatar: 'SP',
      passwordHash: hash,
      salt: salt,
      isVerified: true,
    },
  });

  const owner3 = await prisma.user.create({
    data: {
      id: 'user-owner-3',
      email: 'manoj@pghub.in',
      phone: '+91 99012 88990',
      name: 'Manoj Verma',
      role: 'OWNER',
      status: 'SUSPENDED',
      avatar: 'MV',
      passwordHash: hash,
      salt: salt,
      isVerified: false,
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      id: 'user-customer-1',
      email: 'aarav.singh@gmail.com',
      phone: '+91 98765 43210',
      name: 'Aarav Singh',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      avatar: 'AS',
      movingTo: 'Bengaluru',
      isVerified: true,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      id: 'user-customer-2',
      email: 'priya.khatri@gmail.com',
      phone: '+91 98450 77880',
      name: 'Priya Khatri',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      avatar: 'PK',
      movingTo: 'Bengaluru',
      isVerified: true,
    },
  });

  const customer3 = await prisma.user.create({
    data: {
      id: 'user-customer-3',
      email: 'neha.desai@gmail.com',
      phone: '+91 99012 34567',
      name: 'Neha Desai',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      avatar: 'ND',
      movingTo: 'Bengaluru',
      isVerified: true,
    },
  });

  const customer4 = await prisma.user.create({
    data: {
      id: 'user-customer-4',
      email: 'rohit.mehta@gmail.com',
      phone: '+91 99876 54321',
      name: 'Rohit Mehta',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      avatar: 'RM',
      movingTo: 'Bengaluru',
      isVerified: true,
    },
  });

  const customer5 = await prisma.user.create({
    data: {
      id: 'user-customer-5',
      email: 'krishna.rao@gmail.com',
      phone: '+91 97412 33445',
      name: 'Krishna Rao',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      avatar: 'KR',
      movingTo: 'Bengaluru',
      isVerified: true,
    },
  });

  const customer6 = await prisma.user.create({
    data: {
      id: 'user-customer-6',
      email: 'isha.nair@gmail.com',
      phone: '+91 96321 55667',
      name: 'Isha Nair',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      avatar: 'IN',
      movingTo: 'Bengaluru',
      isVerified: true,
    },
  });

  // 3. Staff Permissions
  await prisma.staffPermission.createMany({
    data: [
      {
        role: 'ADMIN',
        permissions: JSON.stringify({
          view_dashboard: true,
          manage_bookings: true,
          manage_properties: true,
          users_accounts: true,
          payments_refunds: true,
          settings_audit_log: true,
        }),
      },
      {
        role: 'OPS',
        permissions: JSON.stringify({
          view_dashboard: true,
          manage_bookings: true,
          manage_properties: true,
          users_accounts: false,
          payments_refunds: false,
          settings_audit_log: false,
        }),
      },
      {
        role: 'SUPPORT',
        permissions: JSON.stringify({
          view_dashboard: true,
          manage_bookings: false,
          manage_properties: false,
          users_accounts: false,
          payments_refunds: false,
          settings_audit_log: false,
        }),
      },
    ],
  });

  // 4. Seed Properties
  const propHsr = await prisma.property.create({
    data: {
      id: 'prop-hsr-1',
      ownerId: owner1.id,
      name: 'HSR Garden PG',
      slug: 'hsr-garden-pg',
      address: 'Sector 4, 14th Main Rd, HSR Layout, Bengaluru, Karnataka 560102',
      locality: 'HSR Layout',
      city: 'Bengaluru',
      description:
        'Premium co-living PG accommodation in HSR Layout with high-speed Wi-Fi, 3 times hygienic meals, daily housekeeping, 24x7 security, and AC/Non-AC rooms.',
      rating: 4.6,
      reviewCount: 428,
      basePricePerNight: 700,
      depositAmount: 5000,
      minStayDays: 7,
      noticePeriodDays: 7,
      status: 'LISTED',
      verificationDocs: JSON.stringify({
        ownerId: true,
        propertyLicense: true,
        photos: 8,
        status: 'VERIFIED',
      }),
      verifiedAt: new Date('2024-12-10T09:05:00.000Z'),
      rules: JSON.stringify({
        minStay: '7 nights',
        noticePeriod: '7 days',
        smoking: false,
        outsideGuests: false,
        curfew: '11:00 PM',
      }),
    },
  });

  const propOrchid = await prisma.property.create({
    data: {
      id: 'prop-orchid-1',
      ownerId: owner2.id,
      name: 'Orchid PG',
      slug: 'orchid-pg-koramangala',
      address: '5th Block, Koramangala, Bengaluru, Karnataka 560095',
      locality: 'Koramangala',
      city: 'Bengaluru',
      description: 'Luxury tech-worker accommodation next to Sony World Signal Koramangala.',
      rating: 4.5,
      reviewCount: 290,
      basePricePerNight: 800,
      depositAmount: 6000,
      minStayDays: 7,
      noticePeriodDays: 15,
      status: 'LISTED',
    },
  });

  const propCedar = await prisma.property.create({
    data: {
      id: 'prop-cedar-1',
      ownerId: owner2.id,
      name: 'Cedar PG',
      slug: 'cedar-pg-btm',
      address: '2nd Stage, BTM Layout, Bengaluru, Karnataka 560076',
      locality: 'BTM Layout',
      city: 'Bengaluru',
      description: 'Budget-friendly PG near metro station with food and high-speed fiber.',
      rating: 4.3,
      reviewCount: 176,
      basePricePerNight: 750,
      depositAmount: 5000,
      minStayDays: 7,
      noticePeriodDays: 7,
      status: 'LISTED',
    },
  });

  const propLakeview = await prisma.property.create({
    data: {
      id: 'prop-lakeview-1',
      ownerId: owner1.id,
      name: 'Lakeview PG',
      slug: 'lakeview-pg-hsr',
      address: 'Agara Lake Road, Sector 1, HSR Layout, Bengaluru',
      locality: 'HSR Layout',
      city: 'Bengaluru',
      description: 'Spacious scenic PG near Agara Lake with modern amenities and attached gym.',
      rating: 4.4,
      reviewCount: 312,
      basePricePerNight: 750,
      depositAmount: 5000,
      minStayDays: 7,
      status: 'LISTED',
    },
  });

  const propBtm = await prisma.property.create({
    data: {
      id: 'prop-btm-1',
      ownerId: owner3.id,
      name: 'BTM Comfort PG',
      slug: 'btm-comfort-pg',
      address: 'Near Udupi Garden, BTM 1st Stage, Bengaluru',
      locality: 'BTM Layout',
      city: 'Bengaluru',
      description: 'Quiet residential PG for students and IT professionals.',
      rating: 4.2,
      reviewCount: 94,
      basePricePerNight: 650,
      depositAmount: 4000,
      minStayDays: 7,
      status: 'UNLISTED',
    },
  });

  // 5. Photos & Amenities for HSR Garden PG
  await prisma.propertyPhoto.createMany({
    data: [
      { propertyId: propHsr.id, url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80', isCover: true, sortOrder: 1, caption: 'Facade & Entrance' },
      { propertyId: propHsr.id, url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80', isCover: false, sortOrder: 2, caption: 'Single Deluxe Bedroom' },
      { propertyId: propHsr.id, url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80', isCover: false, sortOrder: 3, caption: 'Twin Sharing Room' },
      { propertyId: propHsr.id, url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80', isCover: false, sortOrder: 4, caption: 'Dining Hall' },
    ],
  });

  await prisma.amenity.createMany({
    data: [
      { propertyId: propHsr.id, name: 'Wi-Fi', icon: 'Wifi' },
      { propertyId: propHsr.id, name: 'Meals (3x)', icon: 'Utensils' },
      { propertyId: propHsr.id, name: 'Laundry', icon: 'Shirt' },
      { propertyId: propHsr.id, name: 'AC', icon: 'Snowflake' },
      { propertyId: propHsr.id, name: '24x7 Security', icon: 'ShieldCheck' },
      { propertyId: propHsr.id, name: 'Housekeeping', icon: 'Sparkles' },
    ],
  });

  // 6. Rooms & Beds for HSR Garden PG (Rooms 101, 102, 103, 104)
  const room101 = await prisma.room.create({
    data: {
      id: 'room-101',
      propertyId: propHsr.id,
      roomNumber: '101',
      sharingType: 3,
      floor: 1,
      isAc: false,
      basePricePerNight: 700,
    },
  });

  const room102 = await prisma.room.create({
    data: {
      id: 'room-102',
      propertyId: propHsr.id,
      roomNumber: '102',
      sharingType: 3,
      floor: 1,
      isAc: true,
      basePricePerNight: 900,
    },
  });

  const room103 = await prisma.room.create({
    data: {
      id: 'room-103',
      propertyId: propHsr.id,
      roomNumber: '103',
      sharingType: 2,
      floor: 1,
      isAc: false,
      basePricePerNight: 750,
    },
  });

  const room104 = await prisma.room.create({
    data: {
      id: 'room-104',
      propertyId: propHsr.id,
      roomNumber: '104',
      sharingType: 4,
      floor: 1,
      isAc: false,
      basePricePerNight: 650,
    },
  });

  // Beds for Room 101 (3 Sharing: 3 Occupied, 0 Available)
  const bed101A = await prisma.bed.create({ data: { id: 'bed-101-a', roomId: room101.id, propertyId: propHsr.id, bedNumber: 'Bed 1', status: 'OCCUPIED' } });
  const bed101B = await prisma.bed.create({ data: { id: 'bed-101-b', roomId: room101.id, propertyId: propHsr.id, bedNumber: 'Bed 2', status: 'OCCUPIED' } });
  const bed101C = await prisma.bed.create({ data: { id: 'bed-101-c', roomId: room101.id, propertyId: propHsr.id, bedNumber: 'Bed 3', status: 'OCCUPIED' } });

  // Beds for Room 102 (3 Sharing: 2 Occupied, 1 Available)
  const bed102A = await prisma.bed.create({ data: { id: 'bed-102-a', roomId: room102.id, propertyId: propHsr.id, bedNumber: 'Bed A', status: 'AVAILABLE' } });
  const bed102B = await prisma.bed.create({ data: { id: 'bed-102-b', roomId: room102.id, propertyId: propHsr.id, bedNumber: 'Bed B', status: 'OCCUPIED' } });
  const bed102C = await prisma.bed.create({ data: { id: 'bed-102-c', roomId: room102.id, propertyId: propHsr.id, bedNumber: 'Bed C', status: 'OCCUPIED' } });

  // Beds for Room 103 (2 Sharing: 2 Occupied, 0 Available)
  const bed103A = await prisma.bed.create({ data: { id: 'bed-103-a', roomId: room103.id, propertyId: propHsr.id, bedNumber: 'Bed 1', status: 'OCCUPIED' } });
  const bed103B = await prisma.bed.create({ data: { id: 'bed-103-b', roomId: room103.id, propertyId: propHsr.id, bedNumber: 'Bed 2', status: 'OCCUPIED' } });

  // Beds for Room 104 (4 Sharing: 3 Occupied, 1 Available)
  const bed104A = await prisma.bed.create({ data: { id: 'bed-104-a', roomId: room104.id, propertyId: propHsr.id, bedNumber: 'Bed 1', status: 'OCCUPIED' } });
  const bed104B = await prisma.bed.create({ data: { id: 'bed-104-b', roomId: room104.id, propertyId: propHsr.id, bedNumber: 'Bed 2', status: 'OCCUPIED' } });
  const bed104C = await prisma.bed.create({ data: { id: 'bed-104-c', roomId: room104.id, propertyId: propHsr.id, bedNumber: 'Bed 3', status: 'OCCUPIED' } });
  const bed104D = await prisma.bed.create({ data: { id: 'bed-104-d', roomId: room104.id, propertyId: propHsr.id, bedNumber: 'Bed 4', status: 'AVAILABLE' } });

  // 7. Seed Bookings
  // BKG78421: Aarav Singh (Confirmed)
  const bkg1 = await prisma.booking.create({
    data: {
      id: 'bkg-1',
      bookingNumber: 'BKG78421',
      customerId: customer1.id,
      propertyId: propHsr.id,
      bedId: bed102B.id,
      roomType: 'Single Bed - AC',
      checkInDate: new Date('2024-12-12T00:00:00.000Z'),
      checkOutDate: new Date('2024-12-19T00:00:00.000Z'),
      nightsCount: 7,
      nightlyRate: 700,
      totalAmount: 4900,
      status: 'CONFIRMED',
      isCheckedIn: true,
      checkedInAt: new Date('2024-12-12T10:00:00.000Z'),
    },
  });

  // BKG78420: Priya Khatri (Confirmed)
  const bkg2 = await prisma.booking.create({
    data: {
      id: 'bkg-2',
      bookingNumber: 'BKG78420',
      customerId: customer2.id,
      propertyId: propHsr.id,
      bedId: bed101A.id,
      roomType: 'Sharing (3 Bed) - Non AC',
      checkInDate: new Date('2024-12-12T00:00:00.000Z'),
      checkOutDate: new Date('2024-12-19T00:00:00.000Z'),
      nightsCount: 7,
      nightlyRate: 700,
      totalAmount: 4900,
      status: 'CONFIRMED',
      isCheckedIn: true,
      checkedInAt: new Date('2024-12-12T11:30:00.000Z'),
    },
  });

  // BKG78419: Neha Desai (Completed)
  const bkg3 = await prisma.booking.create({
    data: {
      id: 'bkg-3',
      bookingNumber: 'BKG78419',
      customerId: customer3.id,
      propertyId: propHsr.id,
      bedId: bed103A.id,
      roomType: 'Twin Sharing',
      checkInDate: new Date('2024-12-05T00:00:00.000Z'),
      checkOutDate: new Date('2024-12-12T00:00:00.000Z'),
      nightsCount: 7,
      nightlyRate: 700,
      totalAmount: 4900,
      status: 'COMPLETED',
      isCheckedIn: false,
      checkedInAt: new Date('2024-12-05T10:00:00.000Z'),
      checkedOutAt: new Date('2024-12-12T09:00:00.000Z'),
    },
  });

  // BKG78418: Rohit Mehta (PAID_UNASSIGNED - Issue to resolve!)
  const bkg4 = await prisma.booking.create({
    data: {
      id: 'bkg-4',
      bookingNumber: 'BKG78418',
      customerId: customer4.id,
      propertyId: propHsr.id,
      bedId: null, // Unassigned!
      roomType: 'Single Bed - Non AC',
      checkInDate: new Date('2024-12-12T00:00:00.000Z'),
      checkOutDate: new Date('2024-12-19T00:00:00.000Z'),
      nightsCount: 7,
      nightlyRate: 700,
      totalAmount: 4900,
      status: 'PAID_UNASSIGNED',
      isCheckedIn: false,
    },
  });

  // 8. Payments
  const pay1 = await prisma.payment.create({
    data: {
      id: 'pay-1',
      bookingId: bkg1.id,
      transactionId: 'TXN-872341',
      amount: 4900,
      method: 'UPI',
      status: 'PAID',
      invoiceNumber: 'INV-872341',
    },
  });

  const pay2 = await prisma.payment.create({
    data: {
      id: 'pay-2',
      bookingId: bkg4.id,
      transactionId: 'TXN-784180',
      amount: 4900,
      method: 'CARD',
      status: 'PAID',
      invoiceNumber: 'INV-784180',
    },
  });

  // Payments with Refund Requests (from Image 1 Screen 9)
  const bkgRefund1 = await prisma.booking.create({
    data: {
      id: 'bkg-refund-1',
      bookingNumber: 'BKG78407',
      customerId: customer5.id,
      propertyId: propHsr.id,
      roomType: 'Single Bed - Non AC',
      checkInDate: new Date('2024-12-15T00:00:00.000Z'),
      checkOutDate: new Date('2024-12-22T00:00:00.000Z'),
      nightsCount: 7,
      totalAmount: 4900,
      status: 'REFUND_REQUESTED',
    },
  });

  const payRefund1 = await prisma.payment.create({
    data: {
      id: 'pay-refund-1',
      bookingId: bkgRefund1.id,
      transactionId: 'TXN-784070',
      amount: 4900,
      method: 'UPI',
      status: 'PAID',
      invoiceNumber: 'INV-784070',
    },
  });

  await prisma.refund.create({
    data: {
      id: 'ref-1',
      paymentId: payRefund1.id,
      bookingId: bkgRefund1.id,
      amount: 4900,
      reason: 'Relocated by employer before check-in date',
      status: 'PENDING_REVIEW',
    },
  });

  // 9. Escalations
  await prisma.escalation.createMany({
    data: [
      {
        id: 'esc-1',
        code: 'E-1042',
        title: 'Room AC not working',
        propertyId: propHsr.id,
        priority: 'HIGH',
        status: 'OPEN',
        assignedTo: 'Megha Kulkarni',
        since: '10 Dec, 9:10 AM',
      },
      {
        id: 'esc-2',
        code: 'E-1041',
        title: 'Check-in delay',
        propertyId: propHsr.id,
        priority: 'HIGH',
        status: 'OPEN',
        assignedTo: 'Ops Team',
        since: '9 Dec, 7:25 PM',
      },
    ],
  });

  // 10. Support Tickets (Matching Image 1 Screen 11 & Image 3 Screen 12)
  await prisma.supportTicket.create({
    data: {
      id: 'tkt-1',
      ticketNumber: 'ST-5567',
      customerId: customer1.id,
      propertyId: propHsr.id,
      subject: 'Wi-Fi not working at HSR Garden PG',
      description: 'The 3rd floor router seems to be restarting repeatedly.',
      priority: 'HIGH',
      status: 'RESOLVED',
      assigneeName: 'Megha Kulkarni',
      resolutionNotes: 'Wi-Fi restored. Router reset and verified with customer.',
      resolvedAt: new Date('2024-12-10T11:26:00.000Z'),
    },
  });

  await prisma.supportTicket.create({
    data: {
      id: 'tkt-2',
      ticketNumber: 'TKT-4172',
      propertyId: propHsr.id,
      subject: 'Water leakage in Room 104',
      description: 'Bathroom tap leaking continuously.',
      priority: 'HIGH',
      status: 'OPEN',
      assigneeName: 'Ramesh (Plumber)',
    },
  });

  await prisma.supportTicket.create({
    data: {
      id: 'tkt-3',
      ticketNumber: 'TKT-4171',
      propertyId: propHsr.id,
      subject: 'Fan not working - Room 102',
      description: 'Ceiling fan regulator stuck at speed 1.',
      priority: 'MEDIUM',
      status: 'OPEN',
      assigneeName: 'Suresh (Electrician)',
    },
  });

  // 11. Maintenance Block (Matching Image 3 Screen 6: 12-18 Dec 2024)
  await prisma.maintenanceBlock.create({
    data: {
      id: 'maint-1',
      propertyId: propHsr.id,
      roomId: room102.id,
      startDate: new Date('2024-12-12T00:00:00.000Z'),
      endDate: new Date('2024-12-18T00:00:00.000Z'),
      reason: 'Annual AC duct servicing & deep cleaning',
    },
  });

  // 12. Payouts (Matching Image 3 Screen 11: Collections ₹3,43,000, Payouts ₹3,28,000, Pending ₹15,000)
  await prisma.payout.create({
    data: {
      id: 'payout-1',
      ownerId: owner1.id,
      propertyId: propHsr.id,
      amount: 328000,
      status: 'PROCESSED',
      requestedAt: new Date('2024-12-01T10:00:00.000Z'),
      processedAt: new Date('2024-12-03T14:30:00.000Z'),
    },
  });

  await prisma.payout.create({
    data: {
      id: 'payout-2',
      ownerId: owner1.id,
      propertyId: propHsr.id,
      amount: 15000,
      status: 'PENDING',
      requestedAt: new Date('2024-12-10T12:00:00.000Z'),
    },
  });

  // 13. Visits (Matching Image 2 Screen 10 & Image 3 Screen 10)
  await prisma.visit.create({
    data: {
      id: 'visit-1',
      customerId: customer1.id,
      propertyId: propHsr.id,
      scheduledTime: new Date('2024-12-10T15:00:00.000Z'),
      status: 'SCHEDULED',
      note: 'Interested in Single AC room on 1st floor',
    },
  });

  await prisma.visit.create({
    data: {
      id: 'visit-2',
      customerId: customer2.id,
      propertyId: propHsr.id,
      scheduledTime: new Date('2024-12-12T16:00:00.000Z'),
      status: 'PENDING',
      note: 'Checking twin sharing options',
    },
  });

  // 14. Audit Logs (Matching Image 1 Screen 12)
  await prisma.auditLog.createMany({
    data: [
      {
        id: 'log-1',
        actorId: supportUser.id,
        actorName: 'Megha Kulkarni',
        actorRole: 'SUPPORT',
        action: 'Resolved ticket',
        entityType: 'SupportTicket',
        entityId: 'tkt-1',
        details: 'ST-5567',
        createdAt: new Date('2024-12-10T11:26:00.000Z'),
      },
      {
        id: 'log-2',
        actorId: adminUser.id,
        actorName: 'Admin',
        actorRole: 'ADMIN',
        action: 'Assigned bed',
        entityType: 'Booking',
        entityId: 'bkg-1',
        details: 'BKG78418 -> A-102 (Bed 3)',
        createdAt: new Date('2024-12-10T10:42:00.000Z'),
      },
      {
        id: 'log-3',
        actorId: owner1.id,
        actorName: 'Rakesh Kumar',
        actorRole: 'OWNER',
        action: 'Submitted PG',
        entityType: 'Property',
        entityId: propHsr.id,
        details: 'HSR Garden PG (Verification)',
        createdAt: new Date('2024-12-10T09:05:00.000Z'),
      },
      {
        id: 'log-4',
        actorId: opsUser.id,
        actorName: 'Ops Team',
        actorRole: 'OPS',
        action: 'Created escalation',
        entityType: 'Escalation',
        entityId: 'esc-2',
        details: 'E-1041 (Check-in delay)',
        createdAt: new Date('2024-12-09T18:15:00.000Z'),
      },
    ],
  });

  // 15. Saved Properties (Aarav Singh has HSR Garden PG, Orchid, Cedar saved)
  await prisma.savedProperty.createMany({
    data: [
      { userId: customer1.id, propertyId: propHsr.id },
      { userId: customer1.id, propertyId: propOrchid.id },
      { userId: customer1.id, propertyId: propCedar.id },
    ],
  });

  // 16. System Settings
  await prisma.systemSetting.createMany({
    data: [
      { key: 'min_stay_days', value: '7', category: 'BOOKING' },
      { key: 'deposit_multiplier', value: '1.0', category: 'FINANCIAL' },
      { key: 'auto_assign_beds', value: 'true', category: 'BOOKING' },
      { key: 'platform_commission_pct', value: '5', category: 'FINANCIAL' },
      { key: 'refund_grace_hours', value: '24', category: 'REFUNDS' },
      { key: 'checkin_time', value: '12:00 PM', category: 'OPERATIONS' },
      { key: 'checkout_time', value: '11:00 AM', category: 'OPERATIONS' },
    ],
  });

  console.log('✅ Stayzy SQLite database seeded successfully with all 16 modules & relational entities.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

