'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock, Check, XCircle } from 'lucide-react';
import { getState, subscribeToState, syncWithDatabase } from '@/lib/store';
import { RefundActionModal } from '@/components/modals/RefundActionModal';

export default function AdminRefundsPage() {
  const [state, setState] = useState(getState());
  const [selectedRefund, setSelectedRefund] = useState<any | null>(null);

  useEffect(() => {
    return subscribeToState((newState) => {
      setState(newState);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/payments" className="text-xs text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Payments Ledger</span>
            </Link>
          </div>
          <h1 className="text-xl font-bold text-[#202820]">Refund Review Queue ({state.refunds.length})</h1>
          <p className="text-xs text-gray-500 mt-0.5">Admin Module 09 • Review cancellation reasons, process refunds & audit gateway reversals</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8DE] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F7F9F5] text-gray-700 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Booking ID</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Cancellation Reason</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {state.refunds.map((ref) => (
                <tr key={ref.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{ref.bookingNumber}</td>
                  <td className="py-3.5 px-4 font-medium text-gray-800">{ref.customerName}</td>
                  <td className="py-3.5 px-4 text-gray-600 max-w-xs truncate">{ref.reason}</td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">₹{ref.amount.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4">
                    <span className={ref.status === 'COMPLETED' ? 'badge-active' : 'badge-pending'}>
                      {ref.status === 'COMPLETED' ? 'Refund Processed' : 'Refund Requested'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {ref.status === 'PENDING_REVIEW' ? (
                      <button
                        onClick={() => setSelectedRefund(ref)}
                        className="btn-primary text-xs py-1 px-3 shadow-xs font-bold"
                      >
                        Review Request
                      </button>
                    ) : (
                      <span className="text-gray-400 font-medium">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* In-App Refund Review Modal */}
      {selectedRefund && (
        <RefundActionModal
          isOpen={Boolean(selectedRefund)}
          onClose={() => setSelectedRefund(null)}
          refund={selectedRefund}
          onSuccess={() => {
            syncWithDatabase();
          }}
        />
      )}
    </div>
  );
}
