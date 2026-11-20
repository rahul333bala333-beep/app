'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Check, Clock, User, MapPin } from 'lucide-react';
import { getState, subscribeToState, updateVisitStatus, syncWithDatabase } from '@/lib/store';
import { VisitActionModal } from '@/components/modals/VisitActionModal';
import { toast } from '@/components/ui/Toast';

export default function OwnerVisitsPage() {
  const [state, setState] = useState(getState());
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rescheduled'>('pending');
  const [visitToReschedule, setVisitToReschedule] = useState<any | null>(null);

  useEffect(() => {
    return subscribeToState((newState) => {
      setState(newState);
    });
  }, []);

  const pendingVisits = state.visits.filter((v) => v.status === 'PENDING' || v.status === 'SCHEDULED');
  const approvedVisits = state.visits.filter((v) => v.status === 'APPROVED');
  const rescheduledVisits = state.visits.filter((v) => v.status === 'RESCHEDULED');

  const displayedVisits =
    activeTab === 'pending'
      ? pendingVisits
      : activeTab === 'approved'
      ? approvedVisits
      : rescheduledVisits;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#202820]">Visit Requests ({state.visits.length})</h1>
          <p className="text-xs text-gray-500 mt-0.5">PG Owner Module 10 • Prospective resident walk-in appointments & reschedule manager</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
            activeTab === 'pending' ? 'bg-[#D9F58B] text-[#07552D] font-bold shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Pending ({pendingVisits.length})
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
            activeTab === 'approved' ? 'bg-[#D9F58B] text-[#07552D] font-bold shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Approved ({approvedVisits.length})
        </button>
        <button
          onClick={() => setActiveTab('rescheduled')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
            activeTab === 'rescheduled' ? 'bg-[#D9F58B] text-[#07552D] font-bold shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Rescheduled ({rescheduledVisits.length})
        </button>
      </div>

      {/* Visits Feed */}
      <div className="space-y-3">
        {displayedVisits.map((vis) => (
          <div
            key={vis.id}
            className="bg-white p-5 rounded-xl border border-[#E2E8DE] shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-[#07552D] font-bold text-xs flex items-center justify-center">
                  <User className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-[#202820]">{vis.customerName}</h3>
                  <div className="text-xs text-gray-500">{vis.customerPhone || '+91 98765 43210'}</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 pt-1">
                <span className="flex items-center gap-1.5 font-semibold text-gray-800">
                  <Clock className="w-3.5 h-3.5 text-[#07552D]" />
                  {new Date(vis.scheduledTime).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" /> {vis.propertyName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {vis.status !== 'APPROVED' && (
                <button
                  onClick={() => {
                    updateVisitStatus(vis.id, 'APPROVED');
                    toast.success(`Visit request approved for ${vis.customerName}!`);
                    syncWithDatabase();
                  }}
                  className="btn-primary text-xs py-2 px-4 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve</span>
                </button>
              )}
              <button
                onClick={() => setVisitToReschedule(vis)}
                className="btn-secondary text-xs py-2 px-3.5 font-semibold"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Reschedule</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* In-App Reschedule Visit Modal */}
      {visitToReschedule && (
        <VisitActionModal
          isOpen={Boolean(visitToReschedule)}
          onClose={() => setVisitToReschedule(null)}
          visitToReschedule={visitToReschedule}
          onSuccess={() => {
            syncWithDatabase();
          }}
        />
      )}
    </div>
  );
}
