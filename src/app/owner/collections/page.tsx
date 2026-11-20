'use client';

import React, { useState, useEffect } from 'react';
import { IndianRupee, ArrowDownToLine, Clock, CheckCircle2, Plus } from 'lucide-react';
import { getState, subscribeToState } from '@/lib/store';
import { PayoutModal } from '@/components/modals/PayoutModal';

export default function OwnerCollectionsPage() {
  const [state, setState] = useState(getState());
  const [activeTab, setActiveTab] = useState<'collections' | 'payouts'>('collections');
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);

  useEffect(() => {
    return subscribeToState((newState) => {
      setState(newState);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#202820]">HSR Garden PG – Collections & Payouts</h1>
          <p className="text-xs text-gray-500 mt-0.5">PG Owner Module 11 • Monthly rental ledger, booking revenue & bank payout transfers</p>
        </div>
        <button
          onClick={() => setIsPayoutModalOpen(true)}
          className="btn-primary text-xs py-2 px-4 self-start sm:self-auto font-bold shadow-sm"
        >
          <IndianRupee className="w-3.5 h-3.5" />
          <span>Request Payout</span>
        </button>
      </div>

      {/* KPI Cards (Exact to Reference Image 3 Module 11) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-[#E2E8DE] shadow-card">
          <div className="text-xs text-gray-500 font-medium">Collected (Dec)</div>
          <div className="text-2xl font-black text-[#07552D] mt-1">₹3,43,000</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8DE] shadow-card">
          <div className="text-xs text-gray-500 font-medium">Total Payouts</div>
          <div className="text-2xl font-black text-gray-900 mt-1">₹3,28,000</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8DE] shadow-card">
          <div className="text-xs text-gray-500 font-medium">Pending Payout</div>
          <div className="text-2xl font-black text-amber-600 mt-1">₹15,000</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card space-y-4">
        {/* Toggle Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('collections')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'collections' ? 'bg-[#07552D] text-[#D9F58B]' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Collections
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'payouts' ? 'bg-[#07552D] text-[#D9F58B]' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Payouts
          </button>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 font-bold bg-[#F7F9F5]">
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Particulars</th>
                <th className="py-2.5 px-4">Amount</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {state.payouts.map((pay) => (
                <tr key={pay.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4 text-gray-500 font-mono">{pay.date}</td>
                  <td className="py-3.5 px-4 font-semibold text-gray-900">{pay.particulars}</td>
                  <td className="py-3.5 px-4 font-bold text-gray-900 text-sm">₹{pay.amount.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="badge-active">Collected</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* In-App Payout Modal */}
      <PayoutModal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        pendingAmount={15000}
      />
    </div>
  );
}
