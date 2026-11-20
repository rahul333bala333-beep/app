'use client';

import {
  Property,
  Room,
  Bed,
  Booking,
  Payment,
  Refund,
  Visit,
  SupportTicket,
  Escalation,
  AuditLog,
  MaintenanceBlock,
  Payout,
  User,
  PermissionMatrixItem,
  Role,
} from './types';
import {
  INITIAL_PROPERTIES,
  INITIAL_ROOMS,
  INITIAL_BOOKINGS,
  INITIAL_PAYMENTS,
  INITIAL_REFUNDS,
  INITIAL_VISITS,
  INITIAL_ESCALATIONS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_AUDIT_LOGS,
  INITIAL_MAINTENANCE_BLOCKS,
  INITIAL_PAYOUTS,
  INITIAL_USERS,
  INITIAL_STAFF_PERMISSIONS,
} from './initial-data';

export interface AppState {
  users: User[];
  currentUser: User;
  staffPermissions: PermissionMatrixItem[];
  properties: Property[];
  rooms: Room[];
  bookings: Booking[];
  payments: Payment[];
  refunds: Refund[];
  visits: Visit[];
  escalations: Escalation[];
  supportTickets: SupportTicket[];
  auditLogs: AuditLog[];
  maintenanceBlocks: MaintenanceBlock[];
  payouts: Payout[];
  savedPropertyIds: string[];
}

const STORAGE_KEY = 'stayzy_platform_state_v1';
const BROADCAST_CHANNEL = 'stayzy_realtime_events';

function getInitialState(): AppState {
  if (typeof window === 'undefined') {
    return {
      users: INITIAL_USERS,
      currentUser: INITIAL_USERS[0], // Admin by default
      staffPermissions: INITIAL_STAFF_PERMISSIONS,
      properties: INITIAL_PROPERTIES,
      rooms: INITIAL_ROOMS,
      bookings: INITIAL_BOOKINGS,
      payments: INITIAL_PAYMENTS,
      refunds: INITIAL_REFUNDS,
      visits: INITIAL_VISITS,
      escalations: INITIAL_ESCALATIONS,
      supportTickets: INITIAL_SUPPORT_TICKETS,
      auditLogs: INITIAL_AUDIT_LOGS,
      maintenanceBlocks: INITIAL_MAINTENANCE_BLOCKS,
      payouts: INITIAL_PAYOUTS,
      savedPropertyIds: ['prop-hsr-1', 'prop-orchid-1', 'prop-cedar-1'],
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        currentUser: parsed.currentUser || INITIAL_USERS[0],
      };
    }
  } catch (e) {
    console.error('Failed to parse state from localStorage', e);
  }

  const defaultState: AppState = {
    users: INITIAL_USERS,
    currentUser: INITIAL_USERS[0],
    staffPermissions: INITIAL_STAFF_PERMISSIONS,
    properties: INITIAL_PROPERTIES,
    rooms: INITIAL_ROOMS,
    bookings: INITIAL_BOOKINGS,
    payments: INITIAL_PAYMENTS,
    refunds: INITIAL_REFUNDS,
    visits: INITIAL_VISITS,
    escalations: INITIAL_ESCALATIONS,
    supportTickets: INITIAL_SUPPORT_TICKETS,
    auditLogs: INITIAL_AUDIT_LOGS,
    maintenanceBlocks: INITIAL_MAINTENANCE_BLOCKS,
    payouts: INITIAL_PAYOUTS,
    savedPropertyIds: ['prop-hsr-1', 'prop-orchid-1', 'prop-cedar-1'],
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
  } catch (e) {}

  return defaultState;
}

// Global in-memory singleton
let currentState: AppState = getInitialState();
const listeners = new Set<(state: AppState) => void>();
let broadcastChannel: BroadcastChannel | null = null;
let hasSyncedWithDb = false;

if (typeof window !== 'undefined') {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL);
    broadcastChannel.onmessage = (event) => {
      if (event.data?.type === 'SYNC_STATE' && event.data?.state) {
        currentState = event.data.state;
        listeners.forEach((fn) => fn(currentState));
      }
    };
  } catch (e) {}

  // Automatically sync with real SQLite database on client start
  setTimeout(() => {
    syncWithDatabase();
  }, 100);
}

// Synchronize state with real Prisma SQLite backend
export async function syncWithDatabase() {
  if (typeof window === 'undefined') return;
  try {
    const [propRes, bkgRes, roomRes, visitRes, tktRes, payRes, refRes, logRes] = await Promise.all([
      fetch('/api/properties?status=ALL').then((r) => r.json()).catch(() => null),
      fetch('/api/bookings?status=ALL').then((r) => r.json()).catch(() => null),
      fetch('/api/rooms').then((r) => r.json()).catch(() => null),
      fetch('/api/visits?status=ALL').then((r) => r.json()).catch(() => null),
      fetch('/api/support?status=ALL').then((r) => r.json()).catch(() => null),
      fetch('/api/payments').then((r) => r.json()).catch(() => null),
      fetch('/api/refunds').then((r) => r.json()).catch(() => null),
      fetch('/api/audit-logs').then((r) => r.json()).catch(() => null),
    ]);

    let stateModified = false;
    const nextState = { ...currentState };

    if (propRes?.success && Array.isArray(propRes.data) && propRes.data.length > 0) {
      nextState.properties = propRes.data.map((p: any) => ({
        ...p,
        totalBeds: p.rooms?.reduce((acc: number, r: any) => acc + (r.beds?.length || 0), 0) || p.totalBeds || 64,
        occupiedBeds: p.rooms?.reduce((acc: number, r: any) => acc + (r.beds?.filter((b: any) => b.status === 'OCCUPIED').length || 0), 0) || p.occupiedBeds || 52,
        availableBeds: p.rooms?.reduce((acc: number, r: any) => acc + (r.beds?.filter((b: any) => b.status === 'AVAILABLE').length || 0), 0) || p.availableBeds || 12,
        occupancyRate: 81,
        photos: p.photos?.map((ph: any) => ph.url) || ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'],
        amenities: p.amenities?.map((a: any) => a.name) || ['Wi-Fi', 'Meals', 'Laundry'],
        ownerName: p.owner?.name || 'Rakesh Kumar',
        ownerEmail: p.owner?.email || 'rakesh@hsrgarden.in',
      }));
      stateModified = true;
    }

    if (bkgRes?.success && Array.isArray(bkgRes.data) && bkgRes.data.length > 0) {
      nextState.bookings = bkgRes.data.map((b: any) => ({
        ...b,
        customerName: b.customer?.name || b.customerName || 'Guest',
        customerPhone: b.customer?.phone || b.customerPhone || '+91 98765 43210',
        customerEmail: b.customer?.email || b.customerEmail || 'customer@stayzy.in',
        propertyName: b.property?.name || b.propertyName || 'HSR Garden PG',
        propertyLocality: b.property?.locality || b.propertyLocality || 'HSR Layout',
        bedName: b.bed?.bedNumber || b.bedName || null,
        roomNumber: b.bed?.room?.roomNumber || b.roomNumber || null,
        checkInDate: typeof b.checkInDate === 'string' ? b.checkInDate : new Date(b.checkInDate).toISOString(),
        checkOutDate: typeof b.checkOutDate === 'string' ? b.checkOutDate : new Date(b.checkOutDate).toISOString(),
      }));
      stateModified = true;
    }

    if (roomRes?.success && Array.isArray(roomRes.data) && roomRes.data.length > 0) {
      nextState.rooms = roomRes.data.map((r: any) => ({
        id: r.id,
        propertyId: r.propertyId,
        roomNumber: r.roomNumber,
        sharingType: r.sharingType,
        floor: r.floor,
        isAc: r.isAc,
        basePricePerNight: r.basePricePerNight,
        beds: r.beds || [],
      }));
      stateModified = true;
    }

    if (visitRes?.success && Array.isArray(visitRes.data)) {
      nextState.visits = visitRes.data.map((v: any) => ({
        ...v,
        customerName: v.customer?.name || v.customerName,
        customerPhone: v.customer?.phone || v.customerPhone,
        propertyName: v.property?.name || v.propertyName,
        propertyLocality: v.property?.locality || v.propertyLocality,
        scheduledTime: typeof v.scheduledTime === 'string' ? v.scheduledTime : new Date(v.scheduledTime).toISOString(),
      }));
      stateModified = true;
    }

    if (tktRes?.success && Array.isArray(tktRes.data)) {
      nextState.supportTickets = tktRes.data.map((t: any) => ({
        ...t,
        customerName: t.customer?.name || t.customerName,
        propertyName: t.property?.name || t.propertyName,
      }));
      stateModified = true;
    }

    if (payRes?.success && Array.isArray(payRes.data)) {
      nextState.payments = payRes.data.map((p: any) => ({
        ...p,
        bookingNumber: p.booking?.bookingNumber || p.bookingNumber,
        customerName: p.booking?.customer?.name || p.customerName,
      }));
      stateModified = true;
    }

    if (refRes?.success && Array.isArray(refRes.data)) {
      nextState.refunds = refRes.data.map((r: any) => ({
        ...r,
        bookingNumber: r.booking?.bookingNumber || r.bookingNumber,
        customerName: r.booking?.customer?.name || r.customerName,
      }));
      stateModified = true;
    }

    if (logRes?.success && Array.isArray(logRes.data)) {
      nextState.auditLogs = logRes.data;
      stateModified = true;
    }

    if (stateModified) {
      hasSyncedWithDb = true;
      notifyAndPersist(nextState, true);
    }
  } catch (err) {
    console.error('Failed to sync state from database:', err);
  }
}

function notifyAndPersist(newState: AppState, skipBroadcast = false) {
  currentState = newState;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      if (!skipBroadcast && broadcastChannel) {
        broadcastChannel.postMessage({ type: 'SYNC_STATE', state: newState });
      }
    } catch (e) {}
  }
  listeners.forEach((fn) => fn(currentState));
}

export function subscribeToState(callback: (state: AppState) => void) {
  listeners.add(callback);
  callback(currentState);
  return () => {
    listeners.delete(callback);
  };
}

export function getState(): AppState {
  return currentState;
}

export function resetStateToDefault() {
  const reset: AppState = {
    users: INITIAL_USERS,
    currentUser: INITIAL_USERS[0],
    staffPermissions: INITIAL_STAFF_PERMISSIONS,
    properties: INITIAL_PROPERTIES,
    rooms: INITIAL_ROOMS,
    bookings: INITIAL_BOOKINGS,
    payments: INITIAL_PAYMENTS,
    refunds: INITIAL_REFUNDS,
    visits: INITIAL_VISITS,
    escalations: INITIAL_ESCALATIONS,
    supportTickets: INITIAL_SUPPORT_TICKETS,
    auditLogs: INITIAL_AUDIT_LOGS,
    maintenanceBlocks: INITIAL_MAINTENANCE_BLOCKS,
    payouts: INITIAL_PAYOUTS,
    savedPropertyIds: ['prop-hsr-1', 'prop-orchid-1', 'prop-cedar-1'],
  };
  notifyAndPersist(reset);
}

// Helper to record audit log
export function recordAuditLog(
  actorName: string,
  actorRole: AuditLog['actorRole'],
  action: string,
  entityType: string,
  entityId: string,
  details: string
) {
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    actorName,
    actorRole,
    action,
    entityType,
    entityId,
    details,
    createdAt: new Date().toISOString(),
  };

  const updatedLogs = [newLog, ...currentState.auditLogs];
  notifyAndPersist({
    ...currentState,
    auditLogs: updatedLogs,
  });

  // Background DB persistence
  if (typeof window !== 'undefined') {
    fetch('/api/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actorName,
        actorRole,
        action,
        entityType,
        entityId,
        details,
      }),
    }).catch(() => {});
  }
}

// User Actions
export function setCurrentUser(user: User) {
  notifyAndPersist({
    ...currentState,
    currentUser: user,
  });
}

export function updateStaffPermissions(permissions: PermissionMatrixItem[]) {
  notifyAndPersist({
    ...currentState,
    staffPermissions: permissions,
  });
  recordAuditLog('Admin', 'ADMIN', 'Updated permissions', 'StaffRole', 'matrix', 'Updated Role Permissions Matrix');

  if (typeof window !== 'undefined') {
    fetch('/api/staff', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'ADMIN', permissions }),
    }).catch(() => {});
  }
}

export function toggleUserStatus(userId: string) {
  const target = currentState.users.find((u) => u.id === userId);
  const nextStatus: 'ACTIVE' | 'SUSPENDED' = target?.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

  const users = currentState.users.map((u) => {
    if (u.id === userId) {
      return { ...u, status: nextStatus };
    }
    return u;
  });

  notifyAndPersist({ ...currentState, users });

  if (target) {
    recordAuditLog('Admin', 'ADMIN', `${nextStatus === 'SUSPENDED' ? 'Suspended' : 'Activated'} account`, 'User', userId, target.name);

    if (typeof window !== 'undefined') {
      fetch('/api/users/owners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerId: userId, status: nextStatus }),
      }).catch(() => {});
    }
  }
}

// Property Actions
export function verifyProperty(propertyId: string, approved: boolean, note?: string) {
  const nextStatus = approved ? 'LISTED' : 'REJECTED';
  const properties = currentState.properties.map((p) => {
    if (p.id === propertyId) {
      return {
        ...p,
        status: nextStatus as any,
        verifiedAt: approved ? new Date().toISOString() : undefined,
      };
    }
    return p;
  });
  const prop = currentState.properties.find((p) => p.id === propertyId);
  notifyAndPersist({ ...currentState, properties });

  recordAuditLog(
    'Admin',
    'ADMIN',
    approved ? 'Approved PG' : 'Requested changes',
    'Property',
    propertyId,
    `${prop?.name || propertyId} (${approved ? 'Verification Approved' : note || 'Changes requested'})`
  );

  // Background DB persistence
  if (typeof window !== 'undefined') {
    fetch(`/api/properties/${propertyId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: approved ? 'APPROVE' : 'REQUEST_CHANGES',
        reason: note,
      }),
    }).catch(() => {});
  }
}

export function togglePropertyListing(propertyId: string) {
  const prop = currentState.properties.find((p) => p.id === propertyId);
  if (!prop) return;
  const next = prop.status === 'LISTED' ? 'UNLISTED' : 'LISTED';

  const properties = currentState.properties.map((p) => {
    if (p.id === propertyId) {
      return { ...p, status: next as any };
    }
    return p;
  });

  notifyAndPersist({ ...currentState, properties });

  recordAuditLog(
    prop.ownerId === currentState.currentUser.id ? currentState.currentUser.name : 'Owner',
    'OWNER',
    'Updated listing status',
    'Property',
    propertyId,
    `${prop.name} set to ${next}`
  );

  if (typeof window !== 'undefined') {
    fetch(`/api/properties/${propertyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    }).catch(() => {});
  }
}

export function savePropertyDetails(propertyId: string, updates: Partial<Property>) {
  const properties = currentState.properties.map((p) => {
    if (p.id === propertyId) {
      return { ...p, ...updates };
    }
    return p;
  });
  notifyAndPersist({ ...currentState, properties });
  recordAuditLog(
    currentState.currentUser.name,
    currentState.currentUser.role as any,
    'Updated PG Details',
    'Property',
    propertyId,
    `Saved edits for ${updates.name || propertyId}`
  );

  if (typeof window !== 'undefined') {
    fetch(`/api/properties/${propertyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {});
  }
}

// Booking & Atomic Bed Allocation
export function createCustomerBooking({
  propertyId,
  roomType,
  checkInDate,
  checkOutDate,
  nightsCount,
  nightlyRate,
  paymentMethod,
}: {
  propertyId: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  nightsCount: number;
  nightlyRate: number;
  paymentMethod: 'UPI' | 'CARD';
}): { success: boolean; booking?: Booking; error?: string } {
  const prop = currentState.properties.find((p) => p.id === propertyId);
  if (!prop) return { success: false, error: 'Property not found' };

  // Find available bed atomically
  let assignedBed: Bed | null = null;
  let assignedRoom: Room | null = null;

  for (const room of currentState.rooms) {
    if (room.propertyId === propertyId) {
      const availBed = room.beds.find((b) => b.status === 'AVAILABLE');
      if (availBed) {
        assignedBed = availBed;
        assignedRoom = room;
        break;
      }
    }
  }

  const bookingId = `bkg-${Date.now()}`;
  const bookingNumber = `BKG${Math.floor(10000 + Math.random() * 90000)}`;
  const totalAmount = nightsCount * nightlyRate;

  // If no bed available, create a PAID_UNASSIGNED exception!
  const hasBed = assignedBed !== null;
  const newBooking: Booking = {
    id: bookingId,
    bookingNumber,
    customerId: currentState.currentUser.id,
    customerName: currentState.currentUser.name || 'Aarav Sharma',
    customerPhone: currentState.currentUser.phone || '+91 98765 43210',
    customerEmail: currentState.currentUser.email,
    propertyId: prop.id,
    propertyName: prop.name,
    propertyLocality: prop.locality,
    bedId: hasBed ? assignedBed!.id : null,
    bedName: hasBed ? assignedBed!.bedNumber : null,
    roomNumber: hasBed ? assignedRoom!.roomNumber : null,
    roomType,
    checkInDate,
    checkOutDate,
    nightsCount,
    nightlyRate,
    totalAmount,
    status: hasBed ? 'CONFIRMED' : 'PAID_UNASSIGNED',
    isCheckedIn: false,
    createdAt: new Date().toISOString(),
  };

  const newPayment: Payment = {
    id: `pay-${Date.now()}`,
    bookingId: newBooking.id,
    bookingNumber: newBooking.bookingNumber,
    customerName: newBooking.customerName,
    transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
    amount: totalAmount,
    method: paymentMethod,
    status: 'PAID',
    invoiceNumber: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
    createdAt: new Date().toISOString(),
  };

  // Update bed status if assigned
  let updatedRooms = currentState.rooms;
  if (hasBed) {
    updatedRooms = currentState.rooms.map((room) => {
      if (room.id === assignedRoom!.id) {
        return {
          ...room,
          beds: room.beds.map((b) => (b.id === assignedBed!.id ? { ...b, status: 'OCCUPIED' as const } : b)),
        };
      }
      return room;
    });
  }

  const updatedBookings = [newBooking, ...currentState.bookings];
  const updatedPayments = [newPayment, ...currentState.payments];

  notifyAndPersist({
    ...currentState,
    rooms: updatedRooms,
    bookings: updatedBookings,
    payments: updatedPayments,
  });

  recordAuditLog(
    newBooking.customerName,
    'CUSTOMER',
    hasBed ? 'Created booking' : 'Booking paid (unassigned)',
    'Booking',
    newBooking.id,
    `${newBooking.bookingNumber} at ${prop.name} - ${hasBed ? `Assigned Room ${assignedRoom?.roomNumber} (${assignedBed?.bedNumber})` : '⚠️ Awaiting Bed Assignment'}`
  );

  // Background DB persistence
  if (typeof window !== 'undefined') {
    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: currentState.currentUser.id,
        propertyId: prop.id,
        bedId: hasBed ? assignedBed?.id : null,
        roomType,
        checkInDate,
        checkOutDate,
        nightsCount,
        nightlyRate,
        totalAmount,
        paymentMethod,
      }),
    }).catch(() => {});
  }

  return { success: true, booking: newBooking };
}

// Assign bed to resolve Paid-Unassigned booking or Move Bed
export function assignBedToBooking(
  bookingId: string,
  roomId: string,
  bedId: string,
  actorName = 'Admin',
  actorRole: AuditLog['actorRole'] = 'ADMIN'
) {
  const booking = currentState.bookings.find((b) => b.id === bookingId);
  const targetRoom = currentState.rooms.find((r) => r.id === roomId);
  const targetBed = targetRoom?.beds.find((b) => b.id === bedId);

  if (!booking || !targetRoom || !targetBed) return { success: false, error: 'Invalid booking, room or bed' };
  if (targetBed.status !== 'AVAILABLE' && targetBed.id !== booking.bedId) {
    return { success: false, error: 'Selected bed is not available' };
  }

  // Release old bed if any
  let updatedRooms = currentState.rooms.map((room) => {
    return {
      ...room,
      beds: room.beds.map((b) => {
        if (booking.bedId && b.id === booking.bedId && b.id !== bedId) {
          return { ...b, status: 'AVAILABLE' as const };
        }
        if (b.id === bedId) {
          return { ...b, status: 'OCCUPIED' as const };
        }
        return b;
      }),
    };
  });

  const updatedBookings = currentState.bookings.map((b) => {
    if (b.id === bookingId) {
      return {
        ...b,
        bedId: targetBed.id,
        bedName: targetBed.bedNumber,
        roomNumber: targetRoom.roomNumber,
        status: 'CONFIRMED' as const,
      };
    }
    return b;
  });

  notifyAndPersist({
    ...currentState,
    rooms: updatedRooms,
    bookings: updatedBookings,
  });

  recordAuditLog(
    actorName,
    actorRole,
    booking.bedId ? 'Moved bed' : 'Assigned bed',
    'Booking',
    bookingId,
    `${booking.bookingNumber} → Room ${targetRoom.roomNumber} (${targetBed.bedNumber})`
  );

  // Background DB persistence
  if (typeof window !== 'undefined') {
    fetch(`/api/bookings/${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'ASSIGN_BED',
        bedId: targetBed.id,
      }),
    }).catch(() => {});
  }

  return { success: true };
}

// Resident Check-in & Check-out
export function checkInResident(bookingId: string) {
  const updatedBookings = currentState.bookings.map((b) => {
    if (b.id === bookingId) {
      return {
        ...b,
        isCheckedIn: true,
        checkedInAt: new Date().toISOString(),
      };
    }
    return b;
  });
  const booking = currentState.bookings.find((b) => b.id === bookingId);
  notifyAndPersist({ ...currentState, bookings: updatedBookings });

  recordAuditLog(
    'Rakesh Kumar',
    'OWNER',
    'Checked in resident',
    'Booking',
    bookingId,
    `${booking?.customerName} (${booking?.bookingNumber}) in Room ${booking?.roomNumber}`
  );

  if (typeof window !== 'undefined') {
    fetch(`/api/bookings/${bookingId}/check-in`, {
      method: 'POST',
    }).catch(() => {});
  }
}

export function checkOutResident(bookingId: string) {
  const booking = currentState.bookings.find((b) => b.id === bookingId);
  if (!booking) return;

  const updatedBookings = currentState.bookings.map((b) => {
    if (b.id === bookingId) {
      return {
        ...b,
        isCheckedIn: false,
        status: 'COMPLETED' as const,
        checkedOutAt: new Date().toISOString(),
      };
    }
    return b;
  });

  // Free the bed
  let updatedRooms = currentState.rooms;
  if (booking.bedId) {
    updatedRooms = currentState.rooms.map((room) => ({
      ...room,
      beds: room.beds.map((b) => (b.id === booking.bedId ? { ...b, status: 'AVAILABLE' as const } : b)),
    }));
  }

  notifyAndPersist({
    ...currentState,
    rooms: updatedRooms,
    bookings: updatedBookings,
  });

  recordAuditLog(
    'Rakesh Kumar',
    'OWNER',
    'Checked out resident',
    'Booking',
    bookingId,
    `${booking.customerName} checked out. Bed ${booking.bedName || ''} freed.`
  );

  if (typeof window !== 'undefined') {
    fetch(`/api/bookings/${bookingId}/check-out`, {
      method: 'POST',
    }).catch(() => {});
  }
}

// Booking Modification & Cancellation
export function cancelBooking(bookingId: string, reason = 'Customer requested cancellation') {
  const booking = currentState.bookings.find((b) => b.id === bookingId);
  if (!booking) return;

  const updatedBookings = currentState.bookings.map((b) => {
    if (b.id === bookingId) {
      return { ...b, status: 'CANCELLED' as const };
    }
    return b;
  });

  // Free the bed
  let updatedRooms = currentState.rooms;
  if (booking.bedId) {
    updatedRooms = currentState.rooms.map((room) => ({
      ...room,
      beds: room.beds.map((b) => (b.id === booking.bedId ? { ...b, status: 'AVAILABLE' as const } : b)),
    }));
  }

  // Create refund entry
  const payment = currentState.payments.find((p) => p.bookingId === bookingId);
  const newRefund: Refund = {
    id: `ref-${Date.now()}`,
    paymentId: payment ? payment.id : `pay-${Date.now()}`,
    bookingId: booking.id,
    bookingNumber: booking.bookingNumber,
    customerName: booking.customerName,
    amount: booking.totalAmount,
    reason,
    status: 'PENDING_REVIEW',
    createdAt: new Date().toISOString(),
  };

  notifyAndPersist({
    ...currentState,
    rooms: updatedRooms,
    bookings: updatedBookings,
    refunds: [newRefund, ...currentState.refunds],
  });

  recordAuditLog(
    booking.customerName,
    'CUSTOMER',
    'Cancelled booking',
    'Booking',
    bookingId,
    `${booking.bookingNumber} cancelled. Refund request initiated for ₹${booking.totalAmount}.`
  );

  if (typeof window !== 'undefined') {
    fetch(`/api/bookings/${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'CANCEL', reason }),
    }).catch(() => {});
  }
}

export function extendStay(bookingId: string, additionalNights = 7) {
  const booking = currentState.bookings.find((b) => b.id === bookingId);
  if (!booking) return;

  const newNights = booking.nightsCount + additionalNights;
  const newTotal = newNights * booking.nightlyRate;

  const updatedBookings = currentState.bookings.map((b) => {
    if (b.id === bookingId) {
      return {
        ...b,
        nightsCount: newNights,
        totalAmount: newTotal,
      };
    }
    return b;
  });

  notifyAndPersist({ ...currentState, bookings: updatedBookings });
  recordAuditLog(
    booking.customerName,
    'CUSTOMER',
    'Extended stay',
    'Booking',
    bookingId,
    `Extended by ${additionalNights} nights. New stay: ${newNights} nights.`
  );

  if (typeof window !== 'undefined') {
    fetch(`/api/bookings/${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'EXTEND_STAY', additionalNights }),
    }).catch(() => {});
  }
}

// Refund Processing
export function processRefund(refundId: string, approved: boolean, reviewerName = 'Admin') {
  const updatedRefunds = currentState.refunds.map((r) => {
    if (r.id === refundId) {
      return {
        ...r,
        status: (approved ? 'COMPLETED' : 'REJECTED') as any,
        reviewedBy: reviewerName,
      };
    }
    return r;
  });

  const ref = currentState.refunds.find((r) => r.id === refundId);
  notifyAndPersist({ ...currentState, refunds: updatedRefunds });

  recordAuditLog(
    reviewerName,
    'ADMIN',
    approved ? 'Approved refund' : 'Rejected refund',
    'Refund',
    refundId,
    `${ref?.bookingNumber} - ₹${ref?.amount || 0} (${approved ? 'Processed' : 'Rejected'})`
  );

  if (typeof window !== 'undefined') {
    fetch('/api/refunds', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refundId,
        action: approved ? 'APPROVE' : 'REJECT',
      }),
    }).catch(() => {});
  }
}

// Visits
export function scheduleVisit(propertyId: string, scheduledTime: string, note?: string) {
  const prop = currentState.properties.find((p) => p.id === propertyId);
  const newVisit: Visit = {
    id: `vis-${Date.now()}`,
    customerId: currentState.currentUser.id,
    customerName: currentState.currentUser.name || 'Aarav Sharma',
    customerPhone: currentState.currentUser.phone || '+91 98765 43210',
    propertyId,
    propertyName: prop ? prop.name : 'PG Property',
    propertyLocality: prop ? prop.locality : 'Bengaluru',
    scheduledTime,
    status: 'SCHEDULED',
    note,
    createdAt: new Date().toISOString(),
  };

  notifyAndPersist({
    ...currentState,
    visits: [newVisit, ...currentState.visits],
  });

  recordAuditLog(
    newVisit.customerName,
    'CUSTOMER',
    'Scheduled visit',
    'Visit',
    newVisit.id,
    `${newVisit.propertyName} at ${scheduledTime}`
  );

  if (typeof window !== 'undefined') {
    fetch('/api/visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: currentState.currentUser.id,
        propertyId,
        scheduledTime,
        note,
      }),
    }).catch(() => {});
  }
}

export function updateVisitStatus(visitId: string, status: Visit['status'], actorName = 'Rakesh Kumar', actorRole: AuditLog['actorRole'] = 'OWNER') {
  const updatedVisits = currentState.visits.map((v) => {
    if (v.id === visitId) {
      return { ...v, status };
    }
    return v;
  });
  const visit = currentState.visits.find((v) => v.id === visitId);
  notifyAndPersist({ ...currentState, visits: updatedVisits });

  recordAuditLog(
    actorName,
    actorRole,
    `Updated visit (${status})`,
    'Visit',
    visitId,
    `${visit?.customerName} at ${visit?.propertyName}`
  );

  if (typeof window !== 'undefined') {
    fetch(`/api/visits/${visitId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  }
}

// Support Tickets & Escalations
export function createSupportTicket(subject: string, propertyId: string, description: string, priority: SupportTicket['priority'] = 'MEDIUM') {
  const prop = currentState.properties.find((p) => p.id === propertyId);
  const ticketNumber = `ST-${Math.floor(1000 + Math.random() * 9000)}`;
  const newTicket: SupportTicket = {
    id: `tick-${Date.now()}`,
    ticketNumber,
    customerId: currentState.currentUser.id,
    customerName: currentState.currentUser.name,
    propertyId,
    propertyName: prop?.name || 'HSR Garden PG',
    subject,
    description,
    priority,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
  };

  notifyAndPersist({
    ...currentState,
    supportTickets: [newTicket, ...currentState.supportTickets],
  });

  recordAuditLog(
    currentState.currentUser.name,
    currentState.currentUser.role as any,
    'Created ticket',
    'SupportTicket',
    newTicket.id,
    `${ticketNumber} - ${subject}`
  );

  if (typeof window !== 'undefined') {
    fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: currentState.currentUser.id,
        propertyId,
        subject,
        description,
        priority,
      }),
    }).catch(() => {});
  }
}

export function updateTicketResolution(ticketId: string, resolutionNotes: string, close = true) {
  const updatedTickets = currentState.supportTickets.map((t) => {
    if (t.id === ticketId) {
      return {
        ...t,
        resolutionNotes,
        status: (close ? 'RESOLVED' : 'ASSIGNED') as any,
        resolvedAt: close ? new Date().toISOString() : undefined,
      };
    }
    return t;
  });

  const tkt = currentState.supportTickets.find((t) => t.id === ticketId);
  notifyAndPersist({ ...currentState, supportTickets: updatedTickets });

  recordAuditLog(
    currentState.currentUser.name || 'Megha Kulkarni',
    currentState.currentUser.role as any || 'SUPPORT',
    close ? 'Resolved ticket' : 'Updated ticket',
    'SupportTicket',
    ticketId,
    `${tkt?.ticketNumber} (${resolutionNotes})`
  );

  if (typeof window !== 'undefined') {
    fetch(`/api/support/${ticketId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: close ? 'RESOLVED' : 'ASSIGNED',
        resolutionNotes,
      }),
    }).catch(() => {});
  }
}

export function assignTicket(ticketId: string, assigneeName: string) {
  const updatedTickets = currentState.supportTickets.map((t) => {
    if (t.id === ticketId) {
      return {
        ...t,
        assigneeName,
        status: 'ASSIGNED' as const,
      };
    }
    return t;
  });
  const tkt = currentState.supportTickets.find((t) => t.id === ticketId);
  notifyAndPersist({ ...currentState, supportTickets: updatedTickets });

  recordAuditLog(
    'Rakesh Kumar',
    'OWNER',
    'Assigned technician',
    'SupportTicket',
    ticketId,
    `${tkt?.ticketNumber} assigned to ${assigneeName}`
  );

  if (typeof window !== 'undefined') {
    fetch(`/api/support/${ticketId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'ASSIGNED',
        assigneeName,
      }),
    }).catch(() => {});
  }
}

// Maintenance Block
export function createMaintenanceBlock(propertyId: string, startDate: string, endDate: string, reason: string) {
  const prop = currentState.properties.find((p) => p.id === propertyId);
  const newBlock: MaintenanceBlock = {
    id: `maint-${Date.now()}`,
    propertyId,
    propertyName: prop ? prop.name : 'PG Property',
    startDate,
    endDate,
    nightsCount: 7,
    reason,
    createdAt: new Date().toISOString(),
  };

  notifyAndPersist({
    ...currentState,
    maintenanceBlocks: [newBlock, ...currentState.maintenanceBlocks],
  });

  recordAuditLog(
    'Rakesh Kumar',
    'OWNER',
    'Blocked maintenance',
    'Property',
    propertyId,
    `${startDate} to ${endDate} (${reason})`
  );

  if (typeof window !== 'undefined') {
    fetch('/api/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId,
        startDate,
        endDate,
        reason,
      }),
    }).catch(() => {});
  }
}

// Saved PGs Wishlist
export function toggleSaveProperty(propertyId: string) {
  const exists = currentState.savedPropertyIds.includes(propertyId);
  const savedPropertyIds = exists
    ? currentState.savedPropertyIds.filter((id) => id !== propertyId)
    : [...currentState.savedPropertyIds, propertyId];

  notifyAndPersist({ ...currentState, savedPropertyIds });

  if (typeof window !== 'undefined') {
    fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId, userId: currentState.currentUser.id }),
    }).catch(() => {});
  }
}

// Payouts
export function requestOwnerPayout(ownerId: string, propertyId: string, amount: number) {
  const prop = currentState.properties.find((p) => p.id === propertyId);
  const newPayout: Payout = {
    id: `payo-${Date.now()}`,
    ownerId,
    propertyId,
    amount,
    status: 'PENDING',
    particulars: `Payout request - ${prop?.name || 'PG'}`,
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
  };

  notifyAndPersist({
    ...currentState,
    payouts: [newPayout, ...currentState.payouts],
  });

  recordAuditLog(
    'Rakesh Kumar',
    'OWNER',
    'Requested payout',
    'Payout',
    newPayout.id,
    `Amount: ₹${amount.toLocaleString('en-IN')}`
  );

  if (typeof window !== 'undefined') {
    fetch('/api/payouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ownerId, propertyId, amount }),
    }).catch(() => {});
  }
}
