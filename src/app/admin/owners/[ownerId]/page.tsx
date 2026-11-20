'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, Phone, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { getState, toggleUserStatus } from '@/lib/store';

export default function AdminOwnerDetailPage({ params }: { params: { ownerId: string } }) {
  const state = getState();
  const owner = state.users.find((u) => u.id === params.ownerId) || state.users.find((u) => u.role === 'OWNER') || state.users[3];
  const linkedProperties = state.properties.filter((p) => p.ownerId === owner.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/admin/owners" className="hover:text-black flex items-center gap-1 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Owners
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-bold">{owner.name}</span>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#07552D] font-black text-xl flex items-center justify-center">
              {owner.avatar || owner.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#202820]">{owner.name}</h1>
                <span className={owner.status === 'ACTIVE' ? 'badge-active' : 'badge-issue'}>
                  {owner.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 mt-1">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {owner.email}</span>
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {owner.phone || '+91 98765 43210'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => toggleUserStatus(owner.id)}
            className="btn-secondary text-xs py-2 px-4 self-start sm:self-auto"
          >
            {owner.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account'}
          </button>
        </div>

        {/* Verification Status */}
        <div className="py-4 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-[#F7F9F5] p-3 rounded-lg border">
            <span className="text-gray-500 block">Identity Verification</span>
            <span className="font-bold text-[#07552D] flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified (Aadhaar/PAN)
            </span>
          </div>
          <div className="bg-[#F7F9F5] p-3 rounded-lg border">
            <span className="text-gray-500 block">Property Ownership</span>
            <span className="font-bold text-[#07552D] flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified Deeds
            </span>
          </div>
          <div className="bg-[#F7F9F5] p-3 rounded-lg border">
            <span className="text-gray-500 block">Payout Bank Status</span>
            <span className="font-bold text-gray-900 block mt-0.5">HDFC Bank •• 4910</span>
          </div>
        </div>

        {/* Linked PG Properties */}
        <div className="pt-4">
          <h2 className="text-sm font-bold text-[#202820] mb-3">Linked PG Properties ({linkedProperties.length || 1})</h2>
          <div className="space-y-3">
            {(linkedProperties.length > 0 ? linkedProperties : [state.properties[0]]).map((p) => (
              <div key={p.id} className="p-3.5 bg-[#F7F9F5] rounded-lg border border-[#E2E8DE] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{p.name}</h3>
                  <p className="text-xs text-gray-500">{p.address}, {p.locality}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={p.status === 'LISTED' ? 'badge-active' : 'badge-pending'}>{p.status}</span>
                  <Link href={`/admin/properties/${p.id}`} className="text-xs font-semibold text-[#07552D] hover:underline">
                    View Inventory →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

