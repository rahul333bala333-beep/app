'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Plus, Check } from 'lucide-react';
import { getState, subscribeToState, updateVisitStatus } from '@/lib/store';
import { VisitActionModal } from '@/components/modals/VisitActionModal';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { toast } from '@/components/ui/Toast';

export default function CustomerVisitsPage() {
  const [state, setState] = useState(getState());
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<any>(null);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  useEffect(() => {
    return subscribeToState((newState) => {
      setState(newState);
    });
  }, []);

  const scheduledVisit = state.visits[0];

  const handleCancelVisit = () => {
    if (scheduledVisit) {
      updateVisitStatus(scheduledVisit.id, 'CANCELLED', 'Aarav Sharma', 'CUSTOMER');
      setIsCancelConfirmOpen(false);
      toast.success('Visit appointment cancelled');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#202820]">Visits</h1>
        <p className="text-xs text-gray-500 mt-0.5">Customer Module 10 • Physical property visits, appointments & walkthroughs</p>
      </div>

      {/* Tabs (Exact to Reference Image 2 Module 10) */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
            activeTab === 'upcoming' ? 'bg-[#D9F58B] text-[#07552D] font-bold shadow-xs' : 'text-gray-600'
          }`}
        >
          Upcoming (1)
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
            activeTab === 'past' ? 'bg-[#D9F58B] text-[#07552D] font-bold shadow-xs' : 'text-gray-600'
          }`}
        >
          Past (3)
        </button>
      </div>

      {/* Scheduled Visit Card (Exact to Reference Image 2 Module 10) */}
      {activeTab === 'upcoming' && scheduledVisit ? (
        <div className="bg-white rounded-2xl border border-[#E2E8DE] p-4 shadow-card space-y-4">
          <div className="flex items-start gap-3">
            <img
              src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=200&q=80"
              alt="HSR Garden PG"
              className="w-16 h-16 object-cover rounded-xl border border-gray-200"
            />
            <div>
              <h2 className="font-bold text-sm text-[#202820]">{scheduledVisit.propertyName}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{scheduledVisit.propertyLocality || 'HSR Layout'}, Bengaluru</p>
            </div>
          </div>

          <div className="p-3 bg-[#F7F9F5] rounded-xl border border-[#E2E8DE] flex items-center justify-between text-xs font-medium text-gray-800">
            <span>Visit: {scheduledVisit.scheduledTime}</span>
            <span className="badge-lime font-bold">Scheduled</span>
          </div>

          {/* Action buttons (Exact to Reference Image 2 Module 10) */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                setRescheduleTarget(scheduledVisit);
                setIsVisitModalOpen(true);
              }}
              className="btn-primary py-2 rounded-xl text-xs font-bold"
            >
              📅 Reschedule
            </button>
            <button
              onClick={() => setIsCancelConfirmOpen(true)}
              className="py-2 px-3 border border-gray-300 hover:bg-gray-50 rounded-xl text-center text-gray-700 font-semibold shadow-xs transition-colors"
            >
              ✕ Cancel Visit
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E8DE] p-6 text-center text-xs text-gray-500 shadow-card">
          No past visits.
        </div>
      )}

      {/* Bottom Button */}
      <button
        onClick={() => {
          setRescheduleTarget(null);
          setIsVisitModalOpen(true);
        }}
        className="w-full py-2.5 border border-dashed border-[#07552D] text-[#07552D] hover:bg-[#F1FCDF] rounded-xl text-xs font-bold transition-colors"
      >
        + Schedule Another Visit
      </button>

      {/* In-App Visit Modal */}
      <VisitActionModal
        isOpen={isVisitModalOpen}
        onClose={() => {
          setIsVisitModalOpen(false);
          setRescheduleTarget(null);
        }}
        visitToReschedule={rescheduleTarget}
        defaultPropertyId="prop-hsr-1"
      />

      {/* Cancel Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onConfirm={handleCancelVisit}
        title="Cancel Property Visit?"
        message="Are you sure you want to cancel your scheduled property visit? You can reschedule or book a new appointment at any time."
        confirmText="Cancel Visit"
        type="warning"
      />
    </div>
  );
}
