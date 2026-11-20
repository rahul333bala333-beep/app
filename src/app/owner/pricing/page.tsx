'use client';

import React, { useState } from 'react';
import { Sliders, Edit2, Check, ShieldCheck } from 'lucide-react';
import { getState, recordAuditLog } from '@/lib/store';
import { toast } from '@/components/ui/Toast';

export default function OwnerPricingPage() {
  const state = getState();
  const [minStay, setMinStay] = useState(7);
  const [noticePeriod, setNoticePeriod] = useState(7);
  const [nightlyRate, setNightlyRate] = useState(700);
  const [deposit, setDeposit] = useState(5000);
  const [noSmoking, setNoSmoking] = useState(true);
  const [noOutsideGuests, setNoOutsideGuests] = useState(true);

  const handleSave = () => {
    recordAuditLog('Rakesh Kumar', 'OWNER', 'Updated rates and rules', 'Property', 'prop-hsr-1', `Rate: ₹${nightlyRate}/night, Deposit: ₹${deposit}`);
    toast.success('Stay rates, security deposits, and house rules updated!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-[#202820]">HSR Garden PG – Rates, Deposits & Rules</h1>
          <p className="text-xs text-gray-500 mt-0.5">PG Owner Module 07 • Financial stay terms, security deposit policies & house rules</p>
        </div>
        <button onClick={handleSave} className="btn-primary text-xs py-2 px-4 font-bold shadow-sm">
          Save Rules
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Left Column: Rates & Deposits */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E2E8DE] p-5 shadow-card space-y-2">
            <span className="text-gray-500 font-medium block">Stay Rate Configuration</span>
            <div className="text-sm font-bold text-gray-900">
              12 – 19 Dec (7 nights) • ₹{nightlyRate} / night
            </div>
            <div className="text-lg font-black text-[#07552D] pt-1">
              Total (7 nights): ₹{(nightlyRate * 7).toLocaleString('en-IN')}
            </div>
            <div className="pt-2">
              <label className="block text-gray-600 mb-1">Update Nightly Rate (₹)</label>
              <input
                type="number"
                value={nightlyRate}
                onChange={(e) => setNightlyRate(Number(e.target.value))}
                className="w-full px-3 py-1.5 border rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8DE] p-5 shadow-card space-y-2">
            <span className="text-gray-500 font-medium block">Security Deposit (Refundable)</span>
            <div className="text-base font-bold text-gray-900">₹{deposit.toLocaleString('en-IN')}</div>
            <p className="text-[11px] text-gray-500">Collected at check-in, refundable upon move-out clearance.</p>
            <div className="pt-2">
              <label className="block text-gray-600 mb-1">Update Deposit (₹)</label>
              <input
                type="number"
                value={deposit}
                onChange={(e) => setDeposit(Number(e.target.value))}
                className="w-full px-3 py-1.5 border rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {/* Right Column: House Policies */}
        <div className="bg-white rounded-xl border border-[#E2E8DE] p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b">
            <h2 className="text-sm font-bold text-gray-900">House Policies & Stay Rules</h2>
            <span className="badge-lime text-[11px]">Enforced</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 bg-[#F7F9F5] rounded-lg border">
              <span className="flex items-center gap-2 font-medium text-gray-800">
                <Check className="w-4 h-4 text-[#07552D]" /> Minimum stay: {minStay} nights
              </span>
              <input
                type="number"
                value={minStay}
                onChange={(e) => setMinStay(Number(e.target.value))}
                className="w-16 px-2 py-1 border rounded text-xs text-right"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-[#F7F9F5] rounded-lg border">
              <span className="flex items-center gap-2 font-medium text-gray-800">
                <Check className="w-4 h-4 text-[#07552D]" /> Notice period: {noticePeriod} days
              </span>
              <input
                type="number"
                value={noticePeriod}
                onChange={(e) => setNoticePeriod(Number(e.target.value))}
                className="w-16 px-2 py-1 border rounded text-xs text-right"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-[#F7F9F5] rounded-lg border">
              <span className="flex items-center gap-2 font-medium text-gray-800">
                <Check className="w-4 h-4 text-[#07552D]" /> Strict No Smoking on premises
              </span>
              <input
                type="checkbox"
                checked={noSmoking}
                onChange={(e) => setNoSmoking(e.target.checked)}
                className="w-4 h-4 accent-[#07552D]"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-[#F7F9F5] rounded-lg border">
              <span className="flex items-center gap-2 font-medium text-gray-800">
                <Check className="w-4 h-4 text-[#07552D]" /> No outside guests past 9:30 PM
              </span>
              <input
                type="checkbox"
                checked={noOutsideGuests}
                onChange={(e) => setNoOutsideGuests(e.target.checked)}
                className="w-4 h-4 accent-[#07552D]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

