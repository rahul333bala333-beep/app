'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, AlertTriangle, Plus, ArrowRight, UserCheck } from 'lucide-react';
import { getState, subscribeToState } from '@/lib/store';
import { TicketDrawer } from '@/components/modals/TicketDrawer';
import { VisitActionModal } from '@/components/modals/VisitActionModal';
import { toast } from '@/components/ui/Toast';

export default function AdminVisitsPage() {
  const [state, setState] = useState(getState());
  const [activeTab, setActiveTab] = useState<'escalations' | 'visits'>('escalations');
  const [isEscalationOpen, setIsEscalationOpen] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);

  useEffect(() => {
    return subscribeToState((newState) => {
      setState(newState);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#202820]">Visits & Escalations</h1>
          <p className="text-xs text-gray-500 mt-0.5">Admin Module 10 • Scheduled property visits, high-priority incident escalations</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Sub-tabs switch */}
          <div className="bg-gray-100 p-1 rounded-lg flex items-center">
            <button
              onClick={() => setActiveTab('escalations')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                activeTab === 'escalations' ? 'bg-[#D9F58B] text-[#07552D] shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Escalations ({state.escalations.length})
            </button>
            <button
              onClick={() => setActiveTab('visits')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                activeTab === 'visits' ? 'bg-[#D9F58B] text-[#07552D] shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Visits ({state.visits.length})
            </button>
          </div>
          <button
            onClick={() => setIsEscalationOpen(true)}
            className="btn-primary text-xs py-2 px-3.5 font-bold shadow-sm"
          >
            <Plus className="w-4 h-4" /> <span>Add Escalation</span>
          </button>
        </div>
      </div>

      {/* Escalations Table */}
      {activeTab === 'escalations' ? (
        <div className="bg-white rounded-xl border border-[#E2E8DE] shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F7F9F5] text-gray-700 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Escalation ID</th>
                  <th className="py-3 px-4 font-semibold">Issue Details</th>
                  <th className="py-3 px-4 font-semibold">Property</th>
                  <th className="py-3 px-4 font-semibold">Priority</th>
                  <th className="py-3 px-4 font-semibold">Since</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {state.escalations.map((esc) => (
                  <tr key={esc.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{esc.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-800">{esc.issue}</td>
                    <td className="py-3.5 px-4 text-gray-700">{esc.propertyName}</td>
                    <td className="py-3.5 px-4">
                      <span className="badge-issue">{esc.priority}</span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">{esc.since}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href="/admin/support"
                        className="px-3 py-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded text-gray-800 inline-flex items-center gap-1 transition"
                      >
                        <span>Open Ticket</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8DE] shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F7F9F5] text-gray-700 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">PG Property</th>
                  <th className="py-3 px-4 font-semibold">Scheduled Date/Time</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {state.visits.map((vis) => (
                  <tr key={vis.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900">{vis.customerName}</td>
                    <td className="py-3.5 px-4 text-gray-700">{vis.propertyName}</td>
                    <td className="py-3.5 px-4 text-gray-600">
                      {new Date(vis.scheduledTime).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="badge-lime">{vis.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Metric cards below */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E2E8DE] shadow-card flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 font-medium">Visits Scheduled This Week</div>
            <div className="text-2xl font-black text-[#07552D] mt-0.5">{state.visits.length}</div>
          </div>
          <button
            onClick={() => setIsVisitModalOpen(true)}
            className="btn-secondary text-xs py-1.5 px-3 font-semibold"
          >
            Schedule Visit
          </button>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8DE] shadow-card flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 font-medium">Open Operational Escalations</div>
            <div className="text-2xl font-black text-rose-700 mt-0.5">{state.escalations.length}</div>
          </div>
          <Link
            href="/admin/support"
            className="btn-secondary text-xs py-1.5 px-3 font-semibold"
          >
            View All
          </Link>
        </div>
      </div>

      {/* In-App Ticket Drawer for Escalation */}
      <TicketDrawer
        isOpen={isEscalationOpen}
        onClose={() => setIsEscalationOpen(false)}
      />

      {/* In-App Visit Scheduling Modal */}
      <VisitActionModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
      />
    </div>
  );
}
