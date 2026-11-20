'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CalendarCheck, Search, BedDouble, ArrowRight, User } from 'lucide-react';
import { getState, subscribeToState } from '@/lib/store';

export default function OwnerBookingsPage() {
  const [state, setState] = useState(getState());
  const [search, setSearch] = useState('');

  useEffect(() => {
    return subscribeToState((newState) => {
      setState(newState);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#202820]">Owner Bookings & Bed Allocation</h1>
          <p className="text-xs text-gray-500 mt-0.5">PG Owner Module 08 • Resident reservation manifest, bed moving & reallocations</p>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Search bookings by customer name, booking ID, or room"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#07552D] outline-none"
        />
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8DE] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F7F9F5] text-gray-700 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Booking ID</th>
                <th className="py-3 px-4 font-semibold">Resident</th>
                <th className="py-3 px-4 font-semibold">Dates</th>
                <th className="py-3 px-4 font-semibold">Assigned Room / Bed</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {state.bookings
                .filter((b) => {
                  if (!search) return true;
                  return (
                    b.bookingNumber.toLowerCase().includes(search.toLowerCase()) ||
                    b.customerName.toLowerCase().includes(search.toLowerCase())
                  );
                })
                .map((bkg) => (
                  <tr key={bkg.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                      <Link href={`/owner/bookings/${bkg.id}`} className="hover:text-[#07552D] hover:underline">
                        {bkg.bookingNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">{bkg.customerName}</td>
                    <td className="py-3.5 px-4 text-gray-600">12–19 Dec 2024</td>
                    <td className="py-3.5 px-4 font-bold text-[#07552D]">
                      {bkg.bedName ? `Room ${bkg.roomNumber || '102'} – ${bkg.bedName}` : '⚠️ Unassigned'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={bkg.status === 'CONFIRMED' ? 'badge-active' : 'badge-pending'}>
                        {bkg.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/owner/bookings/${bkg.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded text-gray-800"
                      >
                        <span>Move Bed</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

