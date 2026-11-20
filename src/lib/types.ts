export type Role = 'ADMIN' | 'OPS' | 'SUPPORT' | 'OWNER' | 'CUSTOMER';

export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: Role;
  status: 'ACTIVE' | 'SUSPENDED';
  avatar?: string;
  movingTo?: string;
  createdAt: string;
}

export interface Amenity {
  id: string;
  name: string;
  icon?: string;
}

export interface PropertyPhoto {
  id: string;
  url: string;
  caption?: string;
  sortOrder: number;
  isCover: boolean;
}

export interface Bed {
  id: string;
  roomId: string;
  propertyId: string;
  bedNumber: string; // e.g. "Bed 1", "Bed A", "Bed B"
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
}

export interface Room {
  id: string;
  propertyId: string;
  roomNumber: string;
  sharingType: number; // 1, 2, 3, 4
  floor: number;
  isAc: boolean;
  basePricePerNight: number;
  beds: Bed[];
}

export interface Property {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  address: string;
  locality: string;
  city: string;
  description: string;
  rating: number;
  reviewCount: number;
  basePricePerNight: number;
  depositAmount: number;
  minStayDays: number;
  noticePeriodDays: number;
  rules: string[];
  status: 'PENDING_VERIFICATION' | 'LISTED' | 'UNLISTED' | 'REJECTED';
  verificationDocs: {
    ownerId: boolean;
    propertyLicense: boolean;
    photosCount: number;
    submittedAt: string;
  };
  verifiedAt?: string;
  photos: PropertyPhoto[];
  amenities: string[];
  rooms?: Room[];
  createdAt: string;
}

export interface Booking {
  id: string;
  bookingNumber: string; // e.g. "BKG78421"
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  propertyId: string;
  propertyName: string;
  propertyLocality: string;
  bedId?: string | null;
  bedName?: string | null;
  roomNumber?: string | null;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  nightsCount: number;
  nightlyRate: number;
  totalAmount: number;
  status: 'CONFIRMED' | 'PAID_UNASSIGNED' | 'COMPLETED' | 'CANCELLED' | 'REFUND_REQUESTED';
  isCheckedIn: boolean;
  checkedInAt?: string;
  checkedOutAt?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  bookingNumber: string;
  customerName: string;
  transactionId: string;
  amount: number;
  method: 'UPI' | 'CARD';
  status: 'PAID' | 'REFUNDED' | 'FAILED';
  invoiceNumber: string;
  createdAt: string;
}

export interface Refund {
  id: string;
  paymentId: string;
  bookingId: string;
  bookingNumber: string;
  customerName: string;
  amount: number;
  reason: string;
  status: 'PENDING_REVIEW' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  reviewedBy?: string;
  createdAt: string;
}

export interface Visit {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  propertyId: string;
  propertyName: string;
  propertyLocality: string;
  scheduledTime: string; // e.g. "10 Dec, Tue @ 3:00 PM"
  status: 'PENDING' | 'APPROVED' | 'SCHEDULED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED';
  note?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string; // e.g. "ST-5567", "TKT-4172"
  customerId?: string;
  customerName?: string;
  propertyId: string;
  propertyName: string;
  subject: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'ASSIGNED' | 'RESOLVED' | 'CLOSED';
  assigneeName?: string;
  resolutionNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface Escalation {
  id: string; // e.g. "E-1042"
  propertyId: string;
  propertyName: string;
  issue: string; // "Room AC not working", "Check-in delay"
  priority: 'HIGH' | 'MEDIUM';
  since: string;
  status: 'OPEN' | 'RESOLVED';
  assignedTo?: string;
}

export interface AuditLog {
  id: string;
  actorId?: string;
  actorName: string;
  actorRole: 'ADMIN' | 'OPS' | 'SUPPORT' | 'OWNER' | 'CUSTOMER' | 'SYSTEM';
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  createdAt: string;
}

export interface MaintenanceBlock {
  id: string;
  propertyId: string;
  propertyName: string;
  roomId?: string;
  bedId?: string;
  startDate: string;
  endDate: string;
  nightsCount: number;
  reason: string;
  createdAt: string;
}

export interface Payout {
  id: string;
  ownerId: string;
  propertyId: string;
  amount: number;
  status: 'PENDING' | 'PROCESSED';
  particulars: string;
  date: string;
}

export interface PermissionMatrixItem {
  permission: string;
  admin: boolean;
  ops: boolean;
  support: boolean;
}

