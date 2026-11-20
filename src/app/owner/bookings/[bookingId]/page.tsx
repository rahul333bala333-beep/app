'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BedDouble, Check, Users, ArrowRightLeft, ShieldCheck } from 'lucide-react';
import { getState, assignBedToBooking } from '@/lib/store';
import { toast } from '@/components/ui/Toast';

export default function OwnerBookingDetailPage({ params }: { params: { bookingId: string } }) {
  const state = getState();
  const booking = state.bookings.find((b) => b.id === params.bookingId || b.bookingNumber === params.bookingId) || state.bookings[4];
  const [targetRoomId, setTargetRoomId] = useState('');
  const [targetBedId, setTargetBedId] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  const handleMoveBed = () => {
    if (!targetRoomId || !targetBedId) return;
    const res = assignBedToBooking(booking.id, targetRoomId, targetBedId, 'Rakesh Kumar', 'OWNER');
    if (res.success) {
      setSuccessMsg(true);
      toast.success('Resident successfully reassigned to selected room & bed!');
      setTimeout(() => setSuccessMsg(false), 3000);
    } else {
      toast.error(res.error || 'Failed to move bed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/owner/bookings" className="hover:text-black flex items-center gap-1 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Bookings
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-bold">{booking.bookingNumber}</span>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-[#202820]">Booking – #{booking.bookingNumber}</h1>
            <p className="text-xs text-gray-500 mt-0.5">PG Owner Module 08 • Resident stay overview & bed reallocation</p>
          </div>
          <span className="badge-active">Confirmed</span>
        </div>

        {/* Resident & Stay Details Box (Exact match to Reference Image 3 Module 8) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#F7F9F5] p-5 rounded-xl border border-[#E2E8DE] text-xs">
          <div className="space-y-3">
            <div>
              <span className="text-gray-500 block font-medium">Customer Information</span>
              <div className="font-bold text-sm text-gray-900 mt-0.5">{booking.customerName}</div>
              <div className="text-gray-600 font-mono text-[11px]">{booking.customerEmail || 'rohan.k@gmail.com'} • {booking.customerPhone || '+91 98765 43210'}</div>
            </div>
            <div>
              <span className="text-gray-500 block font-medium">PG Property</span>
              <div className="font-semibold text-gray-900 mt-0.5">{booking.propertyName}</div>
            </div>
          </div>

          <div className="space-y-3 border-t md:border-t-0 md:border-l border-gray-200 md:pl-6">
            <div>
              <span className="text-gray-500 block font-medium">Stay Dates</span>
              <div className="font-bold text-gray-900 mt-0.5">12 – 19 Dec 2024 (7 nights)</div>
            </div>
            <div>
              <span className="text-gray-500 block font-medium">Nightly Rate & Total</span>
              <div className="text-gray-800 mt-0.5">
                ₹{booking.nightlyRate} / night • <span className="font-bold text-[#07552D]">Total: ₹{booking.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Bed Assignment Card */}
        <div className="bg-[#F1FCDF] border border-[#D9F58B] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-[#07552D]">Current Bed Assignment</div>
            <div className="text-base font-bold text-[#07552D] mt-0.5">
              Room {booking.roomNumber || '102'} – {booking.bedName || 'Bed B'}
            </div>
          </div>
          <span className="badge-active text-xs">Assigned & Active</span>
        </div>

        {successMsg && (
          <div className="bg-green-100 border border-green-300 text-green-900 p-3 rounded-lg text-xs font-bold">
            Bed successfully moved to Room {state.rooms.find(r => r.id === targetRoomId)?.roomNumber}!
          </div>
        )}

        {/* Move Bed Form */}
        <div className="p-5 border border-[#E2E8DE] rounded-xl bg-white space-y-4 text-xs">
          <h2 className="font-bold text-sm text-[#202820] flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-[#07552D]" />
            <span>Move Bed / Reassign Resident</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Select Destination Room</label>
              <select
                value={targetRoomId}
                onChange={(e) => {
                  setTargetRoomId(e.target.value);
                  setTargetBedId('');
                }}
                className="w-full px-3 py-2 border rounded-lg outline-none"
              >
                <option value="">-- Choose Room --</option>
                {state.rooms.map((r) => (
                  <option key={r.id} value={r.id}>Room {r.roomNumber}</option>
                ))}
              </select>
            </div>

            {targetRoomId && (
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Select Available Bed</label>
                <div className="flex flex-wrap gap-2">
                  {state.rooms
                    .find((r) => r.id === targetRoomId)
                    ?.beds.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        disabled={b.status !== 'AVAILABLE'}
                        onClick={() => setTargetBedId(b.id)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                          targetBedId === b.id
                            ? 'bg-[#D9F58B] border-[#07552D] text-[#07552D]'
                            : b.status === 'AVAILABLE'
                            ? 'bg-white hover:bg-gray-100 border-gray-300'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {b.bedNumber} ({b.status === 'AVAILABLE' ? 'Free' : 'Occupied'})
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={!targetBedId}
            onClick={handleMoveBed}
            className="btn-primary text-xs py-2 px-5 font-bold shadow-sm disabled:opacity-50"
          >
            Confirm Bed Move
          </button>
        </div>
      </div>
    </div>
  );
}

