'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, CreditCard, RotateCcw, Download, ArrowRight } from 'lucide-react';
import { getState, subscribeToState } from '@/lib/store';
import { toast } from '@/components/ui/Toast';

export default function AdminPaymentsPage() {
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
          <h1 className="text-xl font-bold text-[#202820]">Payments & Financial Ledger</h1>
          <p className="text-xs text-gray-500 mt-0.5">Admin Module 09 • Transaction tracking, UPI/Card gateways & settlement audit</p>
        </div>
        <Link href="/admin/refunds" className="btn-secondary text-xs py-2 px-3.5 self-start sm:self-auto font-semibold">
          <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
          <span>Review Refunds ({state.refunds.filter(r => r.status === 'PENDING_REVIEW').length})</span>
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by booking ID, customer or transaction"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#07552D] outline-none"
          />
        </div>
        <div className="sm:w-36">
          <select className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none">
            <option>All Status</option>
            <option>Paid</option>
            <option>Refunded</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-[#E2E8DE] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F7F9F5] text-gray-700 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Booking ID</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Transaction ID</th>
                <th className="py-3 px-4 font-semibold">Method</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {state.payments
                .filter((p) => {
                  if (!search) return true;
                  return (
                    p.bookingNumber.toLowerCase().includes(search.toLowerCase()) ||
                    p.customerName.toLowerCase().includes(search.toLowerCase()) ||
                    p.transactionId.toLowerCase().includes(search.toLowerCase())
                  );
                })
                .map((pay) => (
                  <tr key={pay.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{pay.bookingNumber}</td>
                    <td className="py-3.5 px-4 font-medium text-gray-800">{pay.customerName}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-500">{pay.transactionId}</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-700">{pay.method}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">₹{pay.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4">
                      <span className="badge-active">{pay.status}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => toast.success(`Downloaded Tax Invoice ${pay.invoiceNumber}`)}
                        className="px-2.5 py-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded text-gray-800 inline-flex items-center gap-1 transition"
                      >
                        <Download className="w-3 h-3" />
                        <span>{pay.invoiceNumber}</span>
                      </button>
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

