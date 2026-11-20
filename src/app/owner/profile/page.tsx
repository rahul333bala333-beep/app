'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Check, Building2, User, Phone, Mail, FileCheck } from 'lucide-react';
import { getState } from '@/lib/store';

export default function OwnerProfilePage() {
  const state = getState();
  const owner = state.users.find(u => u.role === 'OWNER') || state.users[3];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-[#202820]">Owner Verification & Business Profile</h1>
          <p className="text-xs text-gray-500 mt-0.5">PG Owner Module 01 Extended • Verified credential badges & legal documentation</p>
        </div>
        <span className="badge-active text-xs px-3 py-1 font-bold">100% Verified</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Verification Status Hero Card */}
        <div className="bg-[#F1FCDF] border border-[#D9F58B] p-6 rounded-xl shadow-card space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#07552D] text-[#D9F58B] flex items-center justify-center font-bold">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-[#07552D]">Owner Verified</h2>
            <div className="text-xs font-semibold text-gray-700">HSR Garden PG</div>
          </div>
          <div className="space-y-2 text-xs text-gray-800 bg-white/70 p-3 rounded-lg border border-[#D9F58B]">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#07552D] font-bold" />
              <span>Identity Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#07552D] font-bold" />
              <span>Property Ownership</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#07552D] font-bold" />
              <span>Business Details</span>
            </div>
          </div>
          <div className="text-[11px] text-[#07552D] font-bold">Verified on 10 Dec 2024</div>
        </div>

        {/* Profile Details */}
        <div className="md:col-span-2 bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card space-y-4 text-xs">
          <h3 className="font-bold text-sm text-[#202820]">Registered Owner Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#F7F9F5] p-3 rounded-lg border">
              <span className="text-gray-500 block font-medium">Full Legal Name</span>
              <span className="font-bold text-gray-900 text-sm block mt-0.5">{owner.name}</span>
            </div>
            <div className="bg-[#F7F9F5] p-3 rounded-lg border">
              <span className="text-gray-500 block font-medium">Registered Email</span>
              <span className="font-bold text-gray-900 text-sm block mt-0.5">{owner.email}</span>
            </div>
            <div className="bg-[#F7F9F5] p-3 rounded-lg border">
              <span className="text-gray-500 block font-medium">Phone Number</span>
              <span className="font-bold text-gray-900 text-sm block mt-0.5">{owner.phone || '+91 98765 43210'}</span>
            </div>
            <div className="bg-[#F7F9F5] p-3 rounded-lg border">
              <span className="text-gray-500 block font-medium">Designated Account</span>
              <span className="font-bold text-gray-900 text-sm block mt-0.5">Primary Administrator</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

