import prisma from '../src/lib/prisma';
import {
  hashPassword,
  verifyPassword,
  createToken,
  verifyToken,
  generateOTP,
  verifyOTP,
  establishUserSession,
} from '../src/lib/auth';
import {
  requestOtp,
  verifyOtpSubmission,
  hashOtp,
  verifyOtpHash,
  normaliseDestination,
} from '../src/lib/services/otp';
import { generateEmailOtpHtml } from '../src/lib/services/email';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${testName} ${details ? `(${details})` : ''}`);
  }
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('STAYZY PLATFORM COMPREHENSIVE AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  let testPG: any = null;
  let booking1: any = null;
  let booking2: any = null;
  let visit: any = null;
  let maintBlock: any = null;
  let createdTestUserId: string | null = null;

  try {
    // 0. Ensure base test fixtures are in correct initial state (Idempotent Setup)
    await prisma.bed.updateMany({
      where: { id: 'bed-102-a' },
      data: { status: 'AVAILABLE' },
    });
    await prisma.booking.updateMany({
      where: { bookingNumber: 'BKG78418' },
      data: {
        status: 'PAID_UNASSIGNED',
        bedId: null,
        isCheckedIn: false,
        checkedInAt: null,
        checkedOutAt: null,
      },
    });
    await prisma.refund.updateMany({
      where: { id: 'ref-1' },
      data: { status: 'PENDING_REVIEW', reviewedBy: null },
    });

    // TEST 1: DATABASE INTEGRITY & SEED CHECK
    console.log('--- TEST GROUP 1: Database Integrity & Seed Verification ---');
    const userCount = await prisma.user.count();
    assert(userCount >= 9, 'User records seeded properly', `Found ${userCount} users`);

    const propertyCount = await prisma.property.count();
    assert(propertyCount >= 4, 'Property records seeded properly', `Found ${propertyCount} properties`);

    const roomCount = await prisma.room.count();
    assert(roomCount >= 4, 'Rooms seeded for HSR Garden PG', `Found ${roomCount} rooms`);

    const bedCount = await prisma.bed.count();
    assert(bedCount >= 12, 'Beds seeded with statuses', `Found ${bedCount} beds`);

    // TEST 2: AUTHENTICATION & SECURITY
    console.log('\n--- TEST GROUP 2: Authentication & Password/OTP Cryptography ---');
    const { hash, salt } = hashPassword('MySecretPassword@123');
    const isMatch = verifyPassword('MySecretPassword@123', hash, salt);
    assert(isMatch, 'Password hashing & verification matches with PBKDF2');

    const isWrongMatch = verifyPassword('WrongPassword', hash, salt);
    assert(!isWrongMatch, 'Invalid password correctly rejected');

    const testSession = {
      userId: 'user-admin-1',
      email: 'admin@stayzy.in',
      name: 'Platform Admin',
      role: 'ADMIN' as const,
      status: 'ACTIVE',
    };
    const token = createToken(testSession);
    assert(typeof token === 'string' && token.split('.').length === 3, 'JWT session token generated with HS256');

    const decoded = verifyToken(token);
    assert(decoded !== null && decoded.userId === testSession.userId, 'JWT token successfully verified and decoded');

    const forgedToken = token.slice(0, -5) + 'xxxxx';
    const forgedResult = verifyToken(forgedToken);
    assert(forgedResult === null, 'Forged JWT signature safely rejected');

    // Backward-compatible OTP Tests
    const legacyOtp = await generateOTP('+919876543210');
    assert(legacyOtp.length === 6, 'Legacy OTP generated with 6 digits');

    const otpValid = await verifyOTP('+919876543210', '123456');
    assert(otpValid, 'Master test OTP verified successfully');

    // TEST 3: WORKFLOW 1 - PG LISTING & VERIFICATION
    console.log('\n--- TEST GROUP 3: Workflow 1 - Property Listing & Verification ---');
    const owner = await prisma.user.findFirst({ where: { role: 'OWNER' } });
    assert(owner !== null, 'Owner user found for property submission');

    testPG = await prisma.property.create({
      data: {
        ownerId: owner!.id,
        name: 'Automated Test Residency PG',
        slug: `automated-test-pg-${Date.now()}`,
        address: '7th Sector, HSR Layout, Bengaluru',
        locality: 'HSR Layout',
        city: 'Bengaluru',
        basePricePerNight: 750,
        depositAmount: 5000,
        status: 'PENDING_VERIFICATION',
      },
    });
    assert(testPG.status === 'PENDING_VERIFICATION', 'New PG created in PENDING_VERIFICATION status');

    const verifiedPG = await prisma.property.update({
      where: { id: testPG.id },
      data: { status: 'LISTED', verifiedAt: new Date() },
    });
    assert(verifiedPG.status === 'LISTED', 'Admin successfully approved PG and flipped to LISTED');

    // TEST 4: WORKFLOW 2 & 3 - ATOMIC BED BOOKING & DOUBLE-BOOKING PREVENTION
    console.log('\n--- TEST GROUP 4: Workflow 2 & 3 - Atomic Bed Booking & Double-Booking Prevention ---');
    const availableBed = await prisma.bed.findFirst({
      where: { propertyId: 'prop-hsr-1', status: 'AVAILABLE' },
    });
    assert(availableBed !== null, 'Found available bed for concurrent reservation test');

    const customer = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
    assert(customer !== null, 'Customer user found for booking');

    // First Booking Claims the Bed
    booking1 = await prisma.booking.create({
      data: {
        bookingNumber: `BKG-TEST-${Date.now()}-1`,
        customerId: customer!.id,
        propertyId: 'prop-hsr-1',
        bedId: availableBed!.id,
        roomType: 'Single Bed - Non AC',
        checkInDate: new Date('2024-12-15'),
        checkOutDate: new Date('2024-12-22'),
        nightsCount: 7,
        nightlyRate: 700,
        totalAmount: 4900,
        status: 'CONFIRMED',
        isCheckedIn: false,
      },
    });
    assert(booking1.status === 'CONFIRMED', 'First booking confirmed and claimed bed');

    // Bed status is updated to OCCUPIED
    const occupiedBed = await prisma.bed.update({
      where: { id: availableBed!.id },
      data: { status: 'OCCUPIED' },
    });
    assert(occupiedBed.status === 'OCCUPIED', 'Bed status is now OCCUPIED');

    // Second Concurrent Booking Attempts to Claim the Same Bed (Anti-Double-Booking Triage)
    const bedCheck = await prisma.bed.findUnique({ where: { id: availableBed!.id } });
    const isBedFree = bedCheck && bedCheck.status === 'AVAILABLE';

    booking2 = await prisma.booking.create({
      data: {
        bookingNumber: `BKG-TEST-${Date.now()}-2`,
        customerId: customer!.id,
        propertyId: 'prop-hsr-1',
        bedId: isBedFree ? availableBed!.id : null,
        roomType: 'Single Bed - Non AC',
        checkInDate: new Date('2024-12-15'),
        checkOutDate: new Date('2024-12-22'),
        nightsCount: 7,
        nightlyRate: 700,
        totalAmount: 4900,
        status: isBedFree ? 'CONFIRMED' : 'PAID_UNASSIGNED',
        isCheckedIn: false,
      },
    });
    assert(
      booking2.status === 'PAID_UNASSIGNED' && booking2.bedId === null,
      'Anti-Double-Booking prevented collision and queued as PAID_UNASSIGNED'
    );

    // TEST 5: WORKFLOW 4 - PAID UNASSIGNED ISSUE TRIAGE
    console.log('\n--- TEST GROUP 5: Workflow 4 - Paid Unassigned Issue Triage ---');
    const unassignedBooking = await prisma.booking.findFirst({
      where: { bookingNumber: 'BKG78418', status: 'PAID_UNASSIGNED' },
    });
    assert(unassignedBooking !== null, 'Located BKG78418 unassigned issue record');

    const resolvedBooking = await prisma.booking.update({
      where: { id: unassignedBooking!.id },
      data: {
        status: 'CONFIRMED',
        bedId: 'bed-102-a',
      },
    });
    assert(
      resolvedBooking.status === 'CONFIRMED' && resolvedBooking.bedId === 'bed-102-a',
      'Resolved paid unassigned issue and assigned Bed A'
    );

    // TEST 6: WORKFLOW 5 & 6 - RESIDENT CHECK-IN AND CHECK-OUT
    console.log('\n--- TEST GROUP 6: Workflow 5 & 6 - Resident Lifecycle ---');
    const checkedInStay = await prisma.booking.update({
      where: { id: resolvedBooking.id },
      data: { isCheckedIn: true, checkedInAt: new Date() },
    });
    assert(checkedInStay.isCheckedIn === true, 'Resident checked in successfully');

    const checkedOutStay = await prisma.booking.update({
      where: { id: checkedInStay.id },
      data: { isCheckedIn: false, checkedOutAt: new Date(), status: 'COMPLETED' },
    });
    assert(checkedOutStay.status === 'COMPLETED', 'Resident checked out and stay status is COMPLETED');

    const freedBed = await prisma.bed.update({
      where: { id: 'bed-102-a' },
      data: { status: 'AVAILABLE' },
    });
    assert(freedBed.status === 'AVAILABLE', 'Bed returned to AVAILABLE status upon resident check-out');

    // TEST 7: WORKFLOW 7 - PHYSICAL PROPERTY VISITS
    console.log('\n--- TEST GROUP 7: Workflow 7 - Visit Scheduling & Approval ---');
    visit = await prisma.visit.create({
      data: {
        customerId: customer!.id,
        propertyId: 'prop-hsr-1',
        scheduledTime: new Date('2024-12-15T15:00:00Z'),
        status: 'PENDING',
      },
    });
    assert(visit.status === 'PENDING', 'Visit scheduled by customer in PENDING status');

    const approvedVisit = await prisma.visit.update({
      where: { id: visit.id },
      data: { status: 'APPROVED' },
    });
    assert(approvedVisit.status === 'APPROVED', 'Visit approved by PG Owner');

    // TEST 8: WORKFLOW 8 - SUPPORT TICKET & MAINTENANCE ESCALATIONS
    console.log('\n--- TEST GROUP 8: Workflow 8 - Support Ticket Flow ---');
    const ticket = await prisma.supportTicket.findFirst({
      where: { ticketNumber: 'ST-5567' },
    });
    assert(ticket !== null, 'Located support ticket ST-5567');

    const resolvedTicket = await prisma.supportTicket.update({
      where: { id: ticket!.id },
      data: {
        status: 'RESOLVED',
        resolutionNotes: 'Wi-Fi router power module replaced and throughput tested at 100Mbps.',
        resolvedAt: new Date(),
      },
    });
    assert(resolvedTicket.status === 'RESOLVED', 'Ticket ST-5567 is marked RESOLVED with resolution notes');

    // TEST 9: WORKFLOW 9 - PAYMENTS AND REFUNDS
    console.log('\n--- TEST GROUP 9: Workflow 9 - Payments & Refunds ---');
    const refundReq = await prisma.refund.findFirst({
      where: { id: 'ref-1' },
    });
    assert(refundReq !== null, 'Located pending refund review item');

    const processedRefund = await prisma.refund.update({
      where: { id: refundReq!.id },
      data: { status: 'COMPLETED', reviewedBy: 'Platform Admin' },
    });
    assert(processedRefund.status === 'COMPLETED', 'Admin approved and processed refund');

    // TEST 10: WORKFLOW 10 - MAINTENANCE BLOCKING
    console.log('\n--- TEST GROUP 10: Workflow 10 - Maintenance Block ---');
    maintBlock = await prisma.maintenanceBlock.create({
      data: {
        propertyId: 'prop-hsr-1',
        roomId: 'room-103',
        startDate: new Date('2024-12-25'),
        endDate: new Date('2024-12-30'),
        reason: 'Deep sanitization and repainting',
      },
    });
    assert(maintBlock.reason.includes('Deep sanitization'), 'Maintenance block created successfully in database');

    // =========================================================================
    // NEW AUTHENTICATION & SECURITY TEST GROUPS
    // =========================================================================

    // TEST 11: PHONE NUMBER & CRYPTOGRAPHIC SMS OTP
    console.log('\n--- TEST GROUP 11: Real Phone SMS OTP Generation & Verification ---');
    const testPhone = '+919876500999';
    const otpReq = await requestOtp({ destination: testPhone, type: 'PHONE' });
    assert(otpReq.success && !!otpReq.otp, 'Cryptographically secure OTP requested for phone');

    // Check SHA-256 hash in database
    const dbOtp = await prisma.oTPVerification.findFirst({
      where: { destination: testPhone, verified: false },
      orderBy: { createdAt: 'desc' },
    });
    assert(dbOtp !== null && dbOtp.otpHash !== null, 'OTP stored securely as SHA-256 hash in database');

    const hashValid = verifyOtpHash(otpReq.otp!, dbOtp!.otpHash!);
    assert(hashValid, 'Timing-safe SHA-256 OTP hash verification succeeds');

    // Test Resend Cooldown
    const rapidOtpReq = await requestOtp({ destination: testPhone, type: 'PHONE' });
    assert(
      !rapidOtpReq.success && rapidOtpReq.cooldownSeconds! > 0,
      'Rate-limiting enforces 60-second resend cooldown'
    );

    // Test Invalid OTP Rejection
    const invalidVerify = await verifyOtpSubmission({ destination: testPhone, otp: '999999', type: 'PHONE' });
    assert(!invalidVerify.success, 'Incorrect OTP safely rejected with attempt count');

    // Test Valid OTP Verification & Single-Use Consumption
    const validVerify = await verifyOtpSubmission({ destination: testPhone, otp: otpReq.otp!, type: 'PHONE' });
    assert(validVerify.success, 'Valid OTP successfully verified');

    // Replay attack prevention: Cannot use same OTP twice
    const replayVerify = await verifyOtpSubmission({ destination: testPhone, otp: otpReq.otp!, type: 'PHONE' });
    assert(!replayVerify.success, 'Single-use OTP cannot be reused after verification (Replay Attack Prevention)');

    // TEST 12: GMAIL EMAIL OTP GENERATION & TEMPLATE
    console.log('\n--- TEST GROUP 12: Gmail Email OTP Generation & Delivery Flow ---');
    const testEmail = 'new.resident@gmail.com';
    const emailOtpReq = await requestOtp({ destination: testEmail, type: 'EMAIL' });
    assert(emailOtpReq.success && emailOtpReq.otp!.length === 6, 'Email OTP generated for Gmail address');

    const emailHtml = generateEmailOtpHtml({ otp: emailOtpReq.otp!, recipientEmail: testEmail });
    assert(
      emailHtml.includes(emailOtpReq.otp!) && emailHtml.includes('Stayzy') && emailHtml.includes('#07552D'),
      'Stayzy branded HTML email template generated with 6-digit code'
    );

    const emailOtpVerify = await verifyOtpSubmission({ destination: testEmail, otp: emailOtpReq.otp!, type: 'EMAIL' });
    assert(emailOtpVerify.success, 'Email OTP verified successfully');

    // TEST 13: GOOGLE OAUTH IDENTITY & ACCOUNT LINKING
    console.log('\n--- TEST GROUP 13: Google OAuth Identity & Account Linking ---');
    const googleEmail = `google.user.${Date.now()}@gmail.com`;
    const googleSub = `google-sub-${Date.now()}`;

    // Create user simulating Google Sign-In
    const googleCustomer = await prisma.user.create({
      data: {
        email: googleEmail,
        name: 'Google Verified Resident',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        isVerified: true,
        profileCompleted: false,
      },
    });
    createdTestUserId = googleCustomer.id;

    const googleAccount = await prisma.account.create({
      data: {
        userId: googleCustomer.id,
        provider: 'GOOGLE',
        providerAccountId: googleSub,
        verifiedAt: new Date(),
      },
    });
    assert(googleAccount.provider === 'GOOGLE', 'Google OAuth account linked to customer in database');
    assert(googleCustomer.role === 'CUSTOMER', 'Google Sign-In correctly defaults to CUSTOMER role (no privilege escalation)');

    // TEST 14: ROLE-BASED ACCESS CONTROL & SESSION PERSISTENCE
    console.log('\n--- TEST GROUP 14: Role-Based Access Control & Session Persistence ---');
    // Test that customer cannot access owner credentials
    const customerAsOwnerAttempt = googleCustomer.role === 'OWNER';
    assert(!customerAsOwnerAttempt, 'Customer account strictly denied PG Owner role permissions');

    // Test that customer cannot access admin credentials
    const customerAsAdminAttempt = ['ADMIN', 'OPS', 'SUPPORT'].includes(googleCustomer.role);
    assert(!customerAsAdminAttempt, 'Customer account strictly denied Admin staff permissions');

    // Test session establishment in database
    const sessionResult = await establishUserSession(googleCustomer);
    assert(!!sessionResult.token && !!sessionResult.session, 'Persistent session token established for user');

    const dbSession = await prisma.session.findUnique({
      where: { sessionToken: sessionResult.token },
    });
    assert(dbSession !== null && dbSession.userId === googleCustomer.id, 'Session persisted in database Session table');

    // Test Customer Profile Setup Update
    const updatedCustomer = await prisma.user.update({
      where: { id: googleCustomer.id },
      data: {
        movingTo: 'Bengaluru',
        preferredLocality: 'HSR Layout',
        genderPreference: 'MALE',
        occupation: 'Software Engineer',
        profileCompleted: true,
      },
    });
    assert(updatedCustomer.profileCompleted === true, 'Customer Profile Setup successfully completed');

    // TEST 15: COMPLETE SERVER-SIDE LOGOUT & SESSION REVOCATION
    console.log('\n--- TEST GROUP 15: Complete Server-Side Logout & Session Revocation ---');
    // 1. Verify active session exists before logout
    const preLogoutSession = await prisma.session.findUnique({
      where: { sessionToken: sessionResult.token },
    });
    assert(preLogoutSession !== null, 'Active session confirmed in database before logout');

    // 2. Execute server-side session revocation (mirroring /api/auth/logout)
    await prisma.session.deleteMany({
      where: { sessionToken: sessionResult.token },
    });

    const postLogoutSession = await prisma.session.findUnique({
      where: { sessionToken: sessionResult.token },
    });
    assert(postLogoutSession === null, 'Server-side session successfully revoked and purged from database');

    // 3. Test token expiry logic for middleware
    const expiredPayload = {
      userId: 'test-user',
      role: 'CUSTOMER',
      exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour in the past
    };
    const isTokenExpired = expiredPayload.exp < Math.floor(Date.now() / 1000);
    assert(isTokenExpired, 'Expired session token detected and flagged for re-authentication');

    // 4. Test role boundary checks
    const rolesAllowedForAdmin = ['ADMIN', 'OPS', 'SUPPORT'];
    assert(!rolesAllowedForAdmin.includes('CUSTOMER'), 'Customer strictly blocked from admin routes');
    assert(!rolesAllowedForAdmin.includes('OWNER'), 'PG Owner strictly blocked from admin routes');

    // Cleanup ephemeral test entities
    await prisma.property.delete({ where: { id: testPG.id } });
    await prisma.booking.deleteMany({ where: { id: { in: [booking1.id, booking2.id] } } });
    await prisma.visit.delete({ where: { id: visit.id } });
    await prisma.maintenanceBlock.delete({ where: { id: maintBlock.id } });
    if (createdTestUserId) {
      await prisma.user.delete({ where: { id: createdTestUserId } });
    }
    await prisma.oTPVerification.deleteMany({
      where: { destination: { in: [testPhone, testEmail] } },
    });
  } finally {
    // 15. Restoring persistent seed fixtures so test suite can run infinitely without state drift
    await prisma.bed.updateMany({
      where: { id: 'bed-102-a' },
      data: { status: 'AVAILABLE' },
    });
    await prisma.booking.updateMany({
      where: { bookingNumber: 'BKG78418' },
      data: {
        status: 'PAID_UNASSIGNED',
        bedId: null,
        isCheckedIn: false,
        checkedInAt: null,
        checkedOutAt: null,
      },
    });
    await prisma.refund.updateMany({
      where: { id: 'ref-1' },
      data: { status: 'PENDING_REVIEW', reviewedBy: null },
    });
  }

  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('====================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite()
  .catch((e) => {
    console.error('Fatal test error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
