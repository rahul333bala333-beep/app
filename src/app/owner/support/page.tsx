'use client';

import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Check, Users, AlertCircle, Clock } from 'lucide-react';
import { getState, subscribeToState, updateTicketResolution, assignTicket, syncWithDatabase } from '@/lib/store';
import { TicketDrawer } from '@/components/modals/TicketDrawer';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';

export default function OwnerSupportPage() {
  const [state, setState] = useState(getState());
  const [activeTab, setActiveTab] = useState<'open' | 'assigned' | 'closed'>('open');
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [assignModalTicketId, setAssignModalTicketId] = useState<string | null>(null);
  const [technicianName, setTechnicianName] = useState('Ramesh Sharma (Plumber)');

  useEffect(() => {
    return subscribeToState((newState) => {
      setState(newState);
    });
  }, []);

  const openTickets = state.supportTickets.filter((t) => t.status === 'OPEN');
  const assignedTickets = state.supportTickets.filter((t) => t.status === 'ASSIGNED');
  const closedTickets = state.supportTickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED');

  const displayedTickets =
    activeTab === 'open'
      ? openTickets
      : activeTab === 'assigned'
      ? assignedTickets
      : closedTickets;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#202820]">Support & Maintenance</h1>
          <p className="text-xs text-gray-500 mt-0.5">PG Owner Module 12 • Room maintenance tickets, specialist assignment & job closure</p>
        </div>
        <button
          onClick={() => setIsNewTicketOpen(true)}
          className="btn-primary text-xs py-2 px-3.5 self-start sm:self-auto font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Ticket</span>
        </button>
      </div>

      {/* Tabs (Exact to Reference Image 3 Module 12) */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('open')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
            activeTab === 'open' ? 'bg-[#D9F58B] text-[#07552D] shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Open ({openTickets.length})
        </button>
        <button
          onClick={() => setActiveTab('assigned')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
            activeTab === 'assigned' ? 'bg-[#D9F58B] text-[#07552D] shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Assigned ({assignedTickets.length})
        </button>
        <button
          onClick={() => setActiveTab('closed')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
            activeTab === 'closed' ? 'bg-[#D9F58B] text-[#07552D] shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Closed ({closedTickets.length})
        </button>
      </div>

      {/* Ticket Cards Feed */}
      <div className="space-y-3">
        {displayedTickets.length === 0 && (
          <div className="p-8 text-center bg-white rounded-xl border border-gray-200 text-xs text-gray-500">
            No maintenance tickets in this category.
          </div>
        )}

        {displayedTickets.map((tkt) => (
          <div
            key={tkt.id}
            className="bg-white p-4 rounded-xl border border-[#E2E8DE] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-[#07552D]">{tkt.ticketNumber}</span>
                <span className={tkt.priority === 'HIGH' ? 'badge-issue' : 'badge-pending'}>
                  {tkt.priority}
                </span>
                <span className="text-[11px] text-gray-400">• {tkt.propertyName}</span>
              </div>
              <h3 className="font-bold text-sm text-[#202820]">{tkt.subject}</h3>
              <p className="text-xs text-gray-500">{tkt.description}</p>
              {tkt.assigneeName && (
                <div className="text-xs text-gray-600 font-medium pt-1">
                  Assigned technician: <span className="font-bold text-gray-900">{tkt.assigneeName}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {tkt.status !== 'RESOLVED' && tkt.status !== 'CLOSED' && (
                <>
                  <button
                    onClick={() => setAssignModalTicketId(tkt.id)}
                    className="btn-secondary text-xs py-1.5 px-3 font-semibold"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Assign</span>
                  </button>
                  <button
                    onClick={() => {
                      updateTicketResolution(tkt.id, 'Repaired and verified with resident.', true);
                      toast.success(`Ticket ${tkt.ticketNumber} resolved and closed!`);
                    }}
                    className="btn-primary text-xs py-1.5 px-3 font-bold shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Close Ticket</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* In-App Support Ticket Drawer */}
      <TicketDrawer
        isOpen={isNewTicketOpen}
        onClose={() => setIsNewTicketOpen(false)}
        onSuccess={() => {
          syncWithDatabase();
        }}
      />

      {/* Assign Technician Modal */}
      <Modal
        isOpen={Boolean(assignModalTicketId)}
        onClose={() => setAssignModalTicketId(null)}
        title="Assign Maintenance Technician"
        subtitle="Select a specialist technician to resolve this maintenance issue."
        maxWidth="sm"
        footer={
          <>
            <button
              onClick={() => setAssignModalTicketId(null)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (assignModalTicketId) {
                  assignTicket(assignModalTicketId, technicianName);
                  toast.success(`Ticket assigned to ${technicianName}!`);
                  setAssignModalTicketId(null);
                }
              }}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#07552D] hover:bg-[#064223] text-white"
            >
              Confirm Assignment
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-700">Select Specialist</label>
          <select
            value={technicianName}
            onChange={(e) => setTechnicianName(e.target.value)}
            className="w-full p-2.5 border border-[#E2E8DE] rounded-xl text-xs text-[#202820] outline-none focus:ring-2 focus:ring-[#07552D]/20"
          >
            <option value="Ramesh Sharma (Plumber)">Ramesh Sharma (Plumber)</option>
            <option value="Kiran Gowda (Electrician)">Kiran Gowda (Electrician)</option>
            <option value="Suresh (AC Specialist)">Suresh (AC Specialist)</option>
            <option value="Anand (Carpentry & Locks)">Anand (Carpentry & Locks)</option>
          </select>
        </div>
      </Modal>
    </div>
  );
}
