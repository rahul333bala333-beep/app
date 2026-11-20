'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BedDouble, Calendar, ArrowRight, Check } from 'lucide-react';
import { getState, subscribeToState } from '@/lib/store';
import { StayActionModal } from '@/components/modals/StayActionModal';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';

export default function CustomerStaysPage() {
  const [state, setState] = useState(getState());
  const [activeTab, setActiveTab] = useState<'current' | 'upcoming' | 'past'>('current');
  const [modalMode, setModalMode] = useState<'EXTEND' | 'CANCEL' | null>(null);
  const [isChangeDatesOpen, setIsChangeDatesOpen] = useState(false);
  const [revisedDates, setRevisedDates] = useState('15 Dec – 22 Dec (7 nights)');

  useEffect(() => {
    return subscribeToState((newState) => {
      setState(newState);
    });
  }, []);

  const activeStay = state.bookings.find((b) => b.status === 'CONFIRMED' || b.status === 'PAID_UNASSIGNED') || state.bookings[0];

  const handleApplyDates = (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangeDatesOpen(false);
    toast.success(`Stay schedule revised to: ${revisedDates}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#202820]">My Stays</h1>
        <p className="text-xs text-gray-500 mt-0.5">Customer Module 09 • Live reservations, date extensions & checkout management</p>
      </div>

      {/* Stays Sub-tabs (Exact to Reference Image 2 Module 9) */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setActiveTab('current')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
            activeTab === 'current' ? 'bg-[#D9F58B] text-[#07552D] font-bold shadow-xs' : 'text-gray-600'
          }`}
        >
          Current (1)
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
            activeTab === 'upcoming' ? 'bg-[#D9F58B] text-[#07552D] font-bold shadow-xs' : 'text-gray-600'
          }`}
        >
          Upcoming (0)
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
            activeTab === 'past' ? 'bg-[#D9F58B] text-[#07552D] font-bold shadow-xs' : 'text-gray-600'
          }`}
        >
          Past (2)
        </button>
      </div>

      {/* Ongoing Stay Card (Exact to Reference Image 2 Module 9) */}
      {activeTab === 'current' ? (
        <div className="bg-white rounded-2xl border border-[#E2E8DE] p-4 shadow-card space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=200&q=80"
                alt="HSR Garden PG"
                className="w-16 h-16 object-cover rounded-xl border border-gray-200"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-sm text-[#202820]">{activeStay.propertyName}</h2>
                  <span className="badge-active">Ongoing</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{activeStay.propertyLocality || 'HSR Layout'}, Bengaluru</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#F7F9F5] rounded-xl border border-[#E2E8DE] flex justify-between text-xs font-medium text-gray-800">
            <span>📅 {activeStay.checkInDate || '12 Dec'} – {activeStay.checkOutDate || '19 Dec'} ({activeStay.nightsCount} nights)</span>
            <span className="font-bold text-[#07552D]">{activeStay.roomType}</span>
          </div>

          {/* Action Buttons Row (Exact to Reference Image 2 Module 9) */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
            <button
              onClick={() => setIsChangeDatesOpen(true)}
              className="py-2 px-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl text-center text-gray-800 font-semibold shadow-xs transition-colors"
            >
              Change Dates
            </button>
            <button
              onClick={() => setModalMode('EXTEND')}
              className="py-2 px-2 bg-[#D9F58B] text-[#07552D] font-bold rounded-xl text-center hover:bg-[#cbf06f] shadow-xs transition-colors"
            >
              + Extend
            </button>
            <button
              onClick={() => setModalMode('CANCEL')}
              className="py-2 px-2 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl text-center font-semibold shadow-xs transition-colors"
            >
              ✕ Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E8DE] p-6 text-center text-xs text-gray-500 shadow-card">
          No records in this tab.
        </div>
      )}

      {/* Change Dates Modal */}
      <Modal
        isOpen={isChangeDatesOpen}
        onClose={() => setIsChangeDatesOpen(false)}
        title="Change Stay Dates"
        subtitle="Modify reservation check-in and check-out schedule"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setIsChangeDatesOpen(false)}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="change-dates-form"
              className="btn-primary text-xs py-1.5 px-4 font-bold"
            >
              Update Dates
            </button>
          </div>
        }
      >
        <form id="change-dates-form" onSubmit={handleApplyDates} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Proposed Stay Dates</label>
            <input
              type="text"
              required
              value={revisedDates}
              onChange={(e) => setRevisedDates(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl font-medium outline-none focus:border-[#07552D]"
              placeholder="e.g. 15 Dec – 22 Dec (7 nights)"
            />
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
            Note: Date changes are subject to bed availability and PG owner confirmation. No change fee applies within 48 hours.
          </div>
        </form>
      </Modal>

      {/* In-App Stay Action Modal */}
      {modalMode && (
        <StayActionModal
          isOpen={true}
          onClose={() => setModalMode(null)}
          booking={activeStay}
          mode={modalMode}
        />
      )}
    </div>
  );
}
