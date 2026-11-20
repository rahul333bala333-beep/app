'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Calendar, BedDouble, AlertCircle, ArrowRight } from 'lucide-react';
import { getState, subscribeToState } from '@/lib/store';

export default function AdminBookingsPage() {
  const [state, setState] = useState(getState());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    return subscribeToState((newState) => {
      setState(newState);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#202820]">All Bookings ({state.bookings.length})</h1>
          <p className="text-xs text-gray-500 mt-0.5">Admin Module 07 • Centralized reservation registry & exception monitor</p>
        </div>
        <Link
          href="/customer/explore"
          className="btn-primary text-xs py-2 px-3.5 self-start sm:self-auto flex items-center gap-1.5 font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Booking</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by booking ID, customer or PG"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#07552D] outline-none"
          />
        </div>
        <div className="sm:w-44">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PAID_UNASSIGNED">Paid (Unassigned)</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-[#E2E8DE] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F7F9F5] text-gray-700 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Booking ID</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">PG Property</th>
                <th className="py-3 px-4 font-semibold">Stay Dates</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {state.bookings
                .filter((b) => {
                  if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
                  if (!search) return true;
                  return (
                    b.bookingNumber.toLowerCase().includes(search.toLowerCase()) ||
                    b.customerName.toLowerCase().includes(search.toLowerCase()) ||
                    b.propertyName.toLowerCase().includes(search.toLowerCase())
                  );
                })
                .map((bkg) => (
                  <tr key={bkg.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                      <Link href={`/admin/bookings/${bkg.id}`} className="hover:text-[#07552D] hover:underline">
                        {bkg.bookingNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-900">{bkg.customerName}</td>
                    <td className="py-3.5 px-4 text-gray-700">{bkg.propertyName}</td>
                    <td className="py-3.5 px-4 text-gray-600">12–19 Dec</td>
                    <td className="py-3.5 px-4">
                      {bkg.status === 'CONFIRMED' && <span className="badge-active">Confirmed</span>}
                      {bkg.status === 'PAID_UNASSIGNED' && <span className="badge-pending">Paid (Unassigned)</span>}
                      {bkg.status === 'COMPLETED' && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[11px] font-semibold border">Completed</span>}
                      {bkg.status === 'CANCELLED' && <span className="badge-issue">Cancelled</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/bookings/${bkg.id}`}
                        className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded shadow-xs ${
                          bkg.status === 'PAID_UNASSIGNED'
                            ? 'bg-[#07552D] text-white hover:bg-[#054022]'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        <span>{bkg.status === 'PAID_UNASSIGNED' ? 'Resolve Bed' : 'View'}</span>
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

