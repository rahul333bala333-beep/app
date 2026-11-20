'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Copy, Calendar, BedDouble, ArrowRight } from 'lucide-react';
import { getState } from '@/lib/store';
import { toast } from '@/components/ui/Toast';

export default function CustomerConfirmationPage({ params }: { params: { bookingId: string } }) {
  const state = getState();
  const booking = state.bookings.find((b) => b.id === params.bookingId || b.bookingNumber === params.bookingId) || state.bookings[0];

  return (
    <div className="max-w-md mx-auto py-6 space-y-5">
      <div className="bg-white rounded-2xl border border-[#E2E8DE] p-6 shadow-card space-y-5 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-green-100 text-[#07552D] flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <h1 className="text-xl font-black text-[#07552D]">Booking Confirmed!</h1>
          <p className="text-xs text-gray-600 mt-1">
            Your stay at <span className="font-bold text-gray-900">{booking.propertyName}</span> is confirmed.
          </p>
        </div>

        {/* Property & Stay Card (Exact to Reference Image 2 Module 8) */}
        <div className="bg-[#F7F9F5] p-4 rounded-xl border border-[#E2E8DE] text-left text-xs space-y-3">
          <div className="flex items-start gap-3">
            <img
              src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=200&q=80"
              alt={booking.propertyName}
              className="w-14 h-14 object-cover rounded-lg border"
            />
            <div>
              <div className="font-bold text-sm text-gray-900">{booking.propertyName}</div>
              <div className="text-gray-500">{booking.propertyLocality || 'HSR Layout'}, Bengaluru</div>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200 grid grid-cols-2 gap-2 text-gray-700">
            <div>
              <span className="text-gray-400 block text-[10px]">Stay Dates</span>
              <span className="font-bold">12 Dec – 19 Dec (7 nights)</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">Bed Category</span>
              <span className="font-bold">{booking.roomType}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-gray-700">
            <span className="font-medium">Booking ID:</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-gray-900">
              <span>{booking.bookingNumber || 'STZ872341'}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(booking.bookingNumber);
                  toast.success(`Booking ID ${booking.bookingNumber} copied to clipboard!`);
                }}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Copy Booking ID"
              >
                <Copy className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* View Stay CTA */}
        <Link
          href={`/customer/stays/${booking.id}`}
          className="btn-primary w-full text-xs py-3 rounded-xl font-bold shadow-md flex items-center justify-center gap-2"
        >
          <span>View My Stay</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

