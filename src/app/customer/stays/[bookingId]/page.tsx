'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BedDouble, Calendar, Check, Download, ShieldCheck } from 'lucide-react';
import { getState } from '@/lib/store';
import { StayActionModal } from '@/components/modals/StayActionModal';

export default function CustomerStayDetailPage({ params }: { params: { bookingId: string } }) {
  const state = getState();
  const stay = state.bookings.find((b) => b.id === params.bookingId || b.bookingNumber === params.bookingId) || state.bookings[0];

  const [modalMode, setModalMode] = useState<'EXTEND' | 'CANCEL' | null>(null);

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/customer/stays" className="hover:text-black flex items-center gap-1 font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Stays
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-bold">{stay.bookingNumber}</span>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8DE] p-5 shadow-card space-y-5">
        <div className="flex items-center justify-between pb-3 border-b">
          <div>
            <h1 className="text-base font-bold text-gray-900">{stay.propertyName}</h1>
            <p className="text-xs text-gray-500 mt-0.5">{stay.propertyLocality}, Bengaluru</p>
          </div>
          <span className="badge-active">Ongoing Stay</span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Stay Period</span>
            <span className="font-semibold text-gray-900">
              {stay.checkInDate} – {stay.checkOutDate} ({stay.nightsCount} nights)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Bed Category</span>
            <span className="font-semibold text-gray-900">{stay.roomType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Assigned Bed</span>
            <span className="font-bold text-[#07552D] font-mono">{stay.bedName || stay.bedId || 'Room 102 – Bed B'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Nightly Rate</span>
            <span className="font-semibold text-gray-900">₹{stay.nightlyRate}/night</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total Paid</span>
            <span className="font-bold text-gray-900">₹{stay.totalAmount.toLocaleString('en-IN')} (Paid)</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => setModalMode('EXTEND')}
            className="btn-primary py-2.5 rounded-xl font-bold text-center"
          >
            + Extend Stay
          </button>
          <button
            onClick={() => setModalMode('CANCEL')}
            className="py-2.5 px-3 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl font-bold text-center transition-colors"
          >
            Cancel Stay & Refund
          </button>
        </div>
      </div>

      {/* In-App Stay Action Modal */}
      {modalMode && (
        <StayActionModal
          isOpen={true}
          onClose={() => setModalMode(null)}
          booking={stay}
          mode={modalMode}
        />
      )}
    </div>
  );
}
