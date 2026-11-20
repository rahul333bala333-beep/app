'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, CheckCircle, Clock, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { getState, subscribeToState, checkInResident, checkOutResident, syncWithDatabase } from '@/lib/store';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { toast } from '@/components/ui/Toast';

export default function OwnerResidentsPage() {
  const [state, setState] = useState(getState());
  const [activeTab, setActiveTab] = useState<'inhouse' | 'past'>('inhouse');
  const [residentToCheckout, setResidentToCheckout] = useState<{ id: string; name: string; bed: string } | null>(null);

  useEffect(() => {
    return subscribeToState((newState) => {
      setState(newState);
    });
  }, []);

  const inHouseResidents = state.bookings.filter((b) => b.isCheckedIn || b.status === 'CONFIRMED');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#202820]">HSR Garden PG – Residents (52)</h1>
          <p className="text-xs text-gray-500 mt-0.5">PG Owner Module 09 • Live tenant roster, check-in verification & move-out discharge</p>
        </div>
      </div>

      {/* Tabs (Exact to Image 3 Module 9) */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('inhouse')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeTab === 'inhouse' ? 'bg-[#D9F58B] text-[#07552D] font-bold shadow-xs' : 'bg-gray-100 text-gray-600'
          }`}
        >
          In-house ({inHouseResidents.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeTab === 'past' ? 'bg-[#D9F58B] text-[#07552D] font-bold shadow-xs' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Past (108)
        </button>
      </div>

      {/* Residents Table */}
      <div className="bg-white rounded-xl border border-[#E2E8DE] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F7F9F5] text-gray-700 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Resident</th>
                <th className="py-3 px-4 font-semibold">Room / Bed</th>
                <th className="py-3 px-4 font-semibold">Stay Dates</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inHouseResidents.map((bkg) => (
                <tr key={bkg.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900">{bkg.customerName}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-700">
                    {bkg.roomNumber ? `Room ${bkg.roomNumber} - ${bkg.bedName || 'Bed A'}` : 'Room 102 - Bed B'}
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">
                    {new Date(bkg.checkInDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} –{' '}
                    {new Date(bkg.checkOutDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="badge-active">In-house</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() =>
                        setResidentToCheckout({
                          id: bkg.id,
                          name: bkg.customerName,
                          bed: bkg.roomNumber ? `Room ${bkg.roomNumber}` : 'Room 102 - Bed B',
                        })
                      }
                      className="px-3 py-1 text-xs font-semibold border border-gray-300 hover:bg-gray-100 rounded text-gray-700 transition"
                    >
                      Check-out
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Actions Row */}
        <div className="p-4 bg-[#F7F9F5] border-t border-gray-200 flex items-center gap-3">
          <button
            onClick={() => {
              const bkg = state.bookings.find((b) => !b.isCheckedIn);
              if (bkg) {
                checkInResident(bkg.id);
                toast.success(`Checked in ${bkg.customerName} into Room ${bkg.roomNumber || '101'}!`);
              } else {
                toast.info('All currently booked guests are already checked in.');
              }
            }}
            className="btn-primary text-xs py-2 px-4 font-bold shadow-sm"
          >
            + Check-in Resident
          </button>
        </div>
      </div>

      {/* Check-out Confirmation Dialog */}
      {residentToCheckout && (
        <ConfirmationDialog
          isOpen={Boolean(residentToCheckout)}
          onClose={() => setResidentToCheckout(null)}
          title={`Check-out ${residentToCheckout.name}?`}
          description={`Completing move-out will terminate the stay and immediately mark ${residentToCheckout.bed} as AVAILABLE for cleaning and new customer reservations.`}
          confirmText="Confirm Move-out"
          type="warning"
          onConfirm={() => {
            checkOutResident(residentToCheckout.id);
            toast.success(`${residentToCheckout.name} checked out successfully! Bed freed.`);
            setResidentToCheckout(null);
            syncWithDatabase();
          }}
        />
      )}
    </div>
  );
}
