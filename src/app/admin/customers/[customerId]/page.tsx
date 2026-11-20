'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, BedDouble } from 'lucide-react';
import { getState } from '@/lib/store';

export default function AdminCustomerDetailPage({ params }: { params: { customerId: string } }) {
  const state = getState();
  const customer = state.users.find((u) => u.id === params.customerId) || state.users.find((u) => u.role === 'CUSTOMER') || state.users[6];
  const customerBookings = state.bookings.filter((b) => b.customerId === customer.id || b.customerName === customer.name);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/admin/customers" className="hover:text-black flex items-center gap-1 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Customers
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-bold">{customer.name}</span>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card">
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
          <div className="w-14 h-14 rounded-full bg-lime-100 text-[#07552D] font-black text-xl flex items-center justify-center">
            {customer.avatar || customer.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#202820]">{customer.name}</h1>
              <span className="badge-active">Verified Guest</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 mt-1">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {customer.email}</span>
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {customer.phone || '+91 98765 43210'}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Moving to: {customer.movingTo || 'Bengaluru'}</span>
            </div>
          </div>
        </div>

        {/* Booking History Table */}
        <div className="pt-6">
          <h2 className="text-sm font-bold text-[#202820] mb-3">Booking History</h2>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F7F9F5] text-gray-700 border-b">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Booking ID</th>
                  <th className="py-2.5 px-3 font-semibold">Property</th>
                  <th className="py-2.5 px-3 font-semibold">Stay Dates</th>
                  <th className="py-2.5 px-3 font-semibold">Bed</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(customerBookings.length > 0 ? customerBookings : [state.bookings[0]]).map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="py-3 px-3 font-mono font-bold text-gray-900">{b.bookingNumber}</td>
                    <td className="py-3 px-3 font-medium text-gray-800">{b.propertyName}</td>
                    <td className="py-3 px-3 text-gray-600">12–19 Dec</td>
                    <td className="py-3 px-3 text-gray-700 font-semibold">{b.bedName || 'Bed 1'}</td>
                    <td className="py-3 px-3"><span className="badge-active">{b.status}</span></td>
                    <td className="py-3 px-3 text-right">
                      <Link href={`/admin/bookings/${b.id}`} className="text-[#07552D] font-bold hover:underline">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

