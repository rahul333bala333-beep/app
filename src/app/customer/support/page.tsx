'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, LifeBuoy, CheckCircle2, MessageSquare } from 'lucide-react';
import { getState, subscribeToState, createSupportTicket } from '@/lib/store';
import { toast } from '@/components/ui/Toast';

export default function CustomerSupportPage() {
  const [state, setState] = useState(getState());
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    return subscribeToState((newState) => {
      setState(newState);
    });
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject) return;
    createSupportTicket(subject, 'prop-hsr-1', description, 'HIGH');
    setSubject('');
    setDescription('');
    setShowForm(false);
    toast.success('Support ticket logged with stay manager!');
  };

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="flex items-center gap-2">
        <Link href="/customer/account" className="p-1 rounded-full hover:bg-gray-200 text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-base font-bold text-gray-900">Support Tickets</h1>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8DE] p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b">
          <span className="text-xs font-bold text-gray-700">Active Requests</span>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary text-xs py-1.5 px-3"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Ticket</span>
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="p-4 bg-[#F7F9F5] rounded-xl border border-[#E2E8DE] space-y-3 text-xs">
            <h2 className="font-bold text-sm text-[#202820]">Create Support Ticket</h2>
            <div>
              <label className="block text-gray-700 mb-1 font-semibold">Issue Subject</label>
              <input
                type="text"
                required
                placeholder="e.g. Wi-Fi connection issue in Room 101"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none bg-white"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-semibold">Description</label>
              <textarea
                rows={2}
                placeholder="Provide details for the property technician..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none bg-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary py-1 px-3 text-xs">
                Cancel
              </button>
              <button type="submit" className="btn-primary py-1 px-4 text-xs font-bold">
                Submit Ticket
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {state.supportTickets.map((tkt) => (
            <div key={tkt.id} className="p-3.5 bg-[#F7F9F5] rounded-xl border border-[#E2E8DE] text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-gray-900">{tkt.ticketNumber}</span>
                <span className={tkt.status === 'RESOLVED' ? 'badge-active' : 'badge-pending'}>
                  {tkt.status}
                </span>
              </div>
              <div className="font-bold text-gray-800">{tkt.subject}</div>
              <div className="text-[11px] text-gray-500">{tkt.propertyName}</div>
              {tkt.resolutionNotes && (
                <div className="p-2 bg-white rounded border text-[11px] text-[#07552D] font-medium mt-1">
                  Resolution: {tkt.resolutionNotes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

