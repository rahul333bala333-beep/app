'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreditCard, Download, RotateCcw, ChevronRight, CheckCircle2 } from 'lucide-react';
import { getState, subscribeToState } from '@/lib/store';
import { toast } from '@/components/ui/Toast';

export default function CustomerPaymentsPage() {
  const [state, setState] = useState(getState());
  const [activeTab, setActiveTab] = useState<'all' | 'receipts' | 'refunds'>('all');

  useEffect(() => {
    return subscribeToState((newState) => {
      setState(newState);
    });
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#202820]">Payments & Receipts</h1>
        <p className="text-xs text-gray-500 mt-0.5">Customer Module 11 • Booking invoices, payment history & refund disbursement</p>
      </div>

      {/* Tabs (Exact to Reference Image 2 Module 11) */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
            activeTab === 'all' ? 'bg-[#D9F58B] text-[#07552D] font-bold shadow-xs' : 'text-gray-600'
          }`}
        >
          All (3)
        </button>
        <button
          onClick={() => setActiveTab('receipts')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
            activeTab === 'receipts' ? 'bg-[#D9F58B] text-[#07552D] font-bold shadow-xs' : 'text-gray-600'
          }`}
        >
          Receipts
        </button>
        <button
          onClick={() => setActiveTab('refunds')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
            activeTab === 'refunds' ? 'bg-[#D9F58B] text-[#07552D] font-bold shadow-xs' : 'text-gray-600'
          }`}
        >
          Refunds
        </button>
      </div>

      {/* Payment Cards List (Exact to Reference Image 2 Module 11) */}
      <div className="space-y-3.5">
        {/* Card 1: Stay Payment */}
        {(activeTab === 'all' || activeTab === 'receipts') && (
          <div className="bg-white rounded-2xl border border-[#E2E8DE] p-4 shadow-card text-xs flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-bold text-sm text-gray-900">Stay @ HSR Garden PG</div>
              <div className="text-gray-500">12 Dec – 19 Dec (7 nights)</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="badge-active font-bold">₹4,900 Paid</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        )}

        {/* Card 2: Downloadable Receipt */}
        {(activeTab === 'all' || activeTab === 'receipts') && (
          <div className="bg-white rounded-2xl border border-[#E2E8DE] p-4 shadow-card text-xs flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-gray-900">Receipt INV-872341</div>
              <div className="text-gray-500">Tax Invoice • PDF Format</div>
            </div>
            <button
              onClick={() => toast.success('Downloading official GST tax invoice PDF for INV-872341...')}
              className="btn-secondary py-1.5 px-3.5 text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-[#07552D]" />
              <span>Download</span>
            </button>
          </div>
        )}

        {/* Card 3: Refund Tracking */}
        {(activeTab === 'all' || activeTab === 'refunds') && (
          <div className="bg-[#FFFBEB] rounded-2xl border border-amber-200 p-4 shadow-card text-xs flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-amber-950">Refund: Cancellation</div>
              <div className="text-amber-800 text-[11px] mt-0.5">UPI source reversal under review</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="badge-pending font-bold">₹4,900 Processing</span>
              <ChevronRight className="w-4 h-4 text-amber-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

