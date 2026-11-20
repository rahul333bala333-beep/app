'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, BedDouble, Check, CheckCircle2, User, Phone, MapPin } from 'lucide-react';
import { getState, assignBedToBooking } from '@/lib/store';
import { toast } from '@/components/ui/Toast';

export default function AdminBookingDetailPage({ params }: { params: { bookingId: string } }) {
  const state = getState();
  const booking = state.bookings.find((b) => b.id === params.bookingId || b.bookingNumber === params.bookingId) || state.bookings[3];
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedBedId, setSelectedBedId] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAssignBed = () => {
    if (!selectedRoomId || !selectedBedId) {
      toast.error('Please select an available room and bed.');
      return;
    }
    const res = assignBedToBooking(booking.id, selectedRoomId, selectedBedId, 'Admin', 'ADMIN');
    if (res.success) {
      setIsSuccess(true);
      toast.success('Bed assigned successfully! Booking confirmed.');
      setTimeout(() => setIsSuccess(false), 3000);
    } else {
      toast.error(res.error || 'Failed to assign bed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/admin/bookings" className="hover:text-black flex items-center gap-1 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> All Bookings
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-bold">{booking.bookingNumber}</span>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-[#202820]">
              Booking {booking.bookingNumber} – {booking.status === 'PAID_UNASSIGNED' ? 'Issue' : 'Details'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Admin Module 08 • Reservation verification & bed assignment</p>
          </div>
          <span className={booking.status === 'PAID_UNASSIGNED' ? 'badge-pending' : 'badge-active'}>
            {booking.status === 'PAID_UNASSIGNED' ? 'Paid, Not Assigned' : 'Confirmed & Allocated'}
          </span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#F7F9F5] p-5 rounded-xl border border-[#E2E8DE] text-xs">
          <div className="space-y-3">
            <div>
              <span className="text-gray-500 block font-medium">Customer Information</span>
              <div className="font-bold text-sm text-gray-900 mt-0.5">{booking.customerName}</div>
              <div className="text-gray-600">{booking.customerPhone || '+91 99876 54321'}</div>
            </div>
            <div>
              <span className="text-gray-500 block font-medium">Property</span>
              <div className="font-semibold text-gray-900 mt-0.5">{booking.propertyName}</div>
              <div className="text-gray-500">{booking.propertyLocality || 'HSR Layout'}, Bengaluru</div>
            </div>
            <div>
              <span className="text-gray-500 block font-medium">Stay Duration</span>
              <div className="text-gray-800 mt-0.5">12 – 19 Dec (7 nights)</div>
            </div>
          </div>

          <div className="space-y-3 border-t md:border-t-0 md:border-l border-gray-200 md:pl-6">
            <div>
              <span className="text-gray-500 block font-medium">Payment Calculation</span>
              <div className="text-gray-700 mt-0.5 font-medium">
                ₹{booking.nightlyRate} × {booking.nightsCount} nights = <span className="font-bold text-gray-900">₹{booking.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div>
              <span className="text-gray-500 block font-medium">Payment Status</span>
              <div className="text-base font-bold text-[#07552D] mt-0.5">
                Total Paid: ₹{booking.totalAmount.toLocaleString('en-IN')} (Verified)
              </div>
            </div>
            <div>
              <span className="text-gray-500 block font-medium">Assigned Bed</span>
              <div className="font-bold text-gray-900 mt-0.5">
                {booking.bedName ? `Room ${booking.roomNumber} – ${booking.bedName}` : '⚠️ None (Unassigned Exception)'}
              </div>
            </div>
          </div>
        </div>

        {/* Warning Alert Box for Paid-Unassigned */}
        {booking.status === 'PAID_UNASSIGNED' && (
          <div className="bg-amber-100 border border-amber-300 text-amber-950 p-4 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
              <span className="font-semibold">Issue: Payment received, but no bed assigned.</span>
            </div>
          </div>
        )}

        {isSuccess && (
          <div className="bg-green-100 border border-green-300 text-green-900 p-4 rounded-xl flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-5 h-5 text-green-700" />
            <span>Bed allocated successfully! Booking status updated to Confirmed.</span>
          </div>
        )}

        {/* Interactive Bed Allocation Form */}
        <div className="p-5 border border-[#E2E8DE] rounded-xl bg-white space-y-4 text-xs">
          <h2 className="font-bold text-sm text-[#202820] flex items-center gap-2">
            <BedDouble className="w-4 h-4 text-[#07552D]" />
            <span>Manual Bed Allocator</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">1. Choose Room</label>
              <select
                value={selectedRoomId}
                onChange={(e) => {
                  setSelectedRoomId(e.target.value);
                  setSelectedBedId('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-[#07552D]"
              >
                <option value="">-- Select Room --</option>
                {state.rooms.map((r) => {
                  const availCount = r.beds.filter((b) => b.status === 'AVAILABLE').length;
                  return (
                    <option key={r.id} value={r.id}>
                      Room {r.roomNumber} ({availCount} available beds)
                    </option>
                  );
                })}
              </select>
            </div>

            {selectedRoomId && (
              <div>
                <label className="block font-semibold text-gray-700 mb-1">2. Choose Bed</label>
                <div className="flex flex-wrap gap-2">
                  {state.rooms
                    .find((r) => r.id === selectedRoomId)
                    ?.beds.map((b) => {
                      const isAvail = b.status === 'AVAILABLE';
                      return (
                        <button
                          key={b.id}
                          type="button"
                          disabled={!isAvail}
                          onClick={() => setSelectedBedId(b.id)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                            selectedBedId === b.id
                              ? 'bg-[#D9F58B] border-[#07552D] text-[#07552D]'
                              : isAvail
                              ? 'bg-white hover:bg-gray-100 border-gray-300 text-gray-800'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {b.bedNumber} ({isAvail ? 'Free' : 'Occupied'})
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={!selectedBedId}
            onClick={handleAssignBed}
            className="btn-primary text-xs py-2 px-5 font-bold shadow-sm disabled:opacity-50"
          >
            Confirm & Assign Bed
          </button>
        </div>
      </div>
    </div>
  );
}

