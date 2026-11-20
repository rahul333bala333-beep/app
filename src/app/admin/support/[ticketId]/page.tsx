'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, CheckCircle2, Clock, Check } from 'lucide-react';
import { getState, updateTicketResolution, recordAuditLog } from '@/lib/store';
import { toast } from '@/components/ui/Toast';

export default function AdminSupportDetailPage({ params }: { params: { ticketId: string } }) {
  const state = getState();
  const ticket = state.supportTickets.find((t) => t.id === params.ticketId || t.ticketNumber === params.ticketId) || state.supportTickets[0];
  const [resolutionInput, setResolutionInput] = useState(ticket.resolutionNotes || 'Wi-Fi restored. Router reset and verified with customer.');
  const [status, setStatus] = useState<string>(ticket.status);

  const handleSaveResolution = () => {
    updateTicketResolution(ticket.id, resolutionInput, status === 'RESOLVED');
    toast.success('Resolution notes saved successfully!');
  };

  const handleToggleStatus = () => {
    const nextStatus = status === 'RESOLVED' ? 'OPEN' : 'RESOLVED';
    setStatus(nextStatus);
    updateTicketResolution(ticket.id, resolutionInput, nextStatus === 'RESOLVED');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/admin/support" className="hover:text-black flex items-center gap-1 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> All Tickets
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-bold">{ticket.ticketNumber}</span>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-[#202820]">Ticket {ticket.ticketNumber}</h1>
            <p className="text-xs text-gray-500 mt-0.5">Admin Module 11 • Detailed assignee workflow & root-cause verification</p>
          </div>
          <span className={status === 'RESOLVED' ? 'badge-active' : 'badge-pending'}>
            {status}
          </span>
        </div>

        {/* Ticket Details Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-[#F7F9F5] p-5 rounded-xl border border-[#E2E8DE]">
          <div>
            <span className="text-gray-500 block font-medium">Subject</span>
            <div className="font-bold text-sm text-gray-900 mt-0.5">{ticket.subject}</div>
          </div>
          <div>
            <span className="text-gray-500 block font-medium">Customer</span>
            <div className="font-semibold text-gray-900 mt-0.5">{ticket.customerName || 'Aarav Singh'}</div>
          </div>
          <div>
            <span className="text-gray-500 block font-medium">Property</span>
            <div className="font-semibold text-gray-900 mt-0.5">{ticket.propertyName}</div>
          </div>
          <div>
            <span className="text-gray-500 block font-medium">Assignee</span>
            <div className="font-semibold text-[#07552D] mt-0.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> {ticket.assigneeName || 'Megha Kulkarni'}
            </div>
          </div>
          <div>
            <span className="text-gray-500 block font-medium">Created Time</span>
            <div className="text-gray-700 mt-0.5">10 Dec, 10:02 AM</div>
          </div>
          <div>
            <span className="text-gray-500 block font-medium">Resolution Time</span>
            <div className="text-gray-700 mt-0.5">10 Dec, 11:26 AM</div>
          </div>
        </div>

        {/* Resolution Notes Box */}
        <div className="space-y-2 text-xs">
          <label className="block font-bold text-gray-800">Resolution Notes</label>
          <textarea
            rows={3}
            value={resolutionInput}
            onChange={(e) => setResolutionInput(e.target.value)}
            className="w-full p-3 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-[#07552D]"
          />
          <div className="text-[11px] text-gray-500">
            Recorded in immutable audit log upon saving.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleSaveResolution}
            className="btn-secondary text-xs py-2 px-5 font-bold"
          >
            Save Resolution
          </button>
          <button
            type="button"
            onClick={handleToggleStatus}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              status === 'RESOLVED'
                ? 'bg-[#D9F58B] text-[#07552D] hover:bg-[#cbf06f]'
                : 'btn-primary'
            }`}
          >
            {status === 'RESOLVED' ? 'Reopen Ticket' : 'Mark Resolved'}
          </button>
        </div>
      </div>
    </div>
  );
}

