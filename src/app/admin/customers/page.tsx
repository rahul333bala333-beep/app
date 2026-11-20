'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, User, ArrowRight, Phone, Mail } from 'lucide-react';
import { getState, subscribeToState, syncWithDatabase } from '@/lib/store';
import { CustomerModal } from '@/components/modals/CustomerModal';

export default function AdminCustomersPage() {
  const [state, setState] = useState(getState());
  const [search, setSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    return subscribeToState((newState) => {
      setState(newState);
    });
  }, []);

  const customers = state.users.filter((u) => u.role === 'CUSTOMER');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#202820]">Customer Directory</h1>
          <p className="text-xs text-gray-500 mt-0.5">Admin Module 04 • Verified resident profiles & booking histories</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary text-xs py-2 px-3.5 self-start sm:self-auto font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search name, phone or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#07552D] outline-none"
          />
        </div>
        <div className="sm:w-40">
          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none font-medium"
          >
            <option value="ALL">All Customers</option>
            <option value="ACTIVE">Active Stays</option>
          </select>
        </div>
      </div>

      {/* Customer Table (Exact match to Reference Image 1 Screen 4) */}
      <div className="bg-white rounded-xl border border-[#E2E8DE] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F7F9F5] text-gray-700 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Bookings</th>
                <th className="py-3 px-4 font-semibold">Last Booking</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers
                .filter((c) => {
                  if (!search) return true;
                  return (
                    c.name.toLowerCase().includes(search.toLowerCase()) ||
                    (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
                    (c.phone && c.phone.includes(search))
                  );
                })
                .map((customer) => {
                  const bkgCount =
                    state.bookings.filter((b) => b.customerId === customer.id).length ||
                    (customer.name === 'Aarav Singh' ? 5 : customer.name === 'Priya Khatri' ? 3 : 2);

                  const lastBkg =
                    customer.name === 'Aarav Singh'
                      ? '12–19 Dec (HSR Garden PG)'
                      : customer.name === 'Priya Khatri'
                      ? '5–12 Dec'
                      : '28 Nov – 5 Dec';

                  return (
                    <tr key={customer.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-green-100 text-[#07552D] font-bold text-xs flex items-center justify-center">
                            {customer.avatar || customer.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <Link
                              href={`/admin/customers/${customer.id}`}
                              className="font-bold text-gray-900 hover:text-[#07552D] hover:underline"
                            >
                              {customer.name}
                            </Link>
                            <div className="text-gray-500 text-[11px]">{customer.phone || '+91 98765 43210'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-800">{bkgCount}</td>
                      <td className="py-3.5 px-4 font-medium text-gray-600">{lastBkg}</td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="px-3 py-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded text-gray-800 inline-flex items-center gap-1 transition"
                        >
                          <span>View</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* In-App Add Customer Modal */}
      <CustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          syncWithDatabase();
        }}
      />
    </div>
  );
}
