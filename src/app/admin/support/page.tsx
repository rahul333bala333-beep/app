'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LifeBuoy, Plus, CheckCircle2, AlertCircle, ArrowRight, User } from 'lucide-react';
import { getState, subscribeToState, syncWithDatabase } from '@/lib/store';
import { TicketDrawer } from '@/components/modals/TicketDrawer';

export default function AdminSupportPage() {
  const [state, setState] = useState(getState());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    return subscribeToState((newState) => {
      setState(newState);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#202820]">Support Tickets ({state.supportTickets.length})</h1>
          <p className="text-xs text-gray-500 mt-0.5">Admin Module 11 • Guest service complaints, maintenance dispatch & resolution logs</p>
        </div>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="btn-primary text-xs py-2 px-3.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Ticket</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8DE] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F7F9F5] text-gray-700 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Ticket ID</th>
                <th className="py-3 px-4 font-semibold">Subject</th>
                <th className="py-3 px-4 font-semibold">Customer / Property</th>
                <th className="py-3 px-4 font-semibold">Assignee</th>
                <th className="py-3 px-4 font-semibold">Priority</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {state.supportTickets.map((tkt) => (
                <tr key={tkt.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                    <Link href={`/admin/support/${tkt.id}`} className="hover:text-[#07552D] hover:underline">
                      {tkt.ticketNumber}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-800">{tkt.subject}</td>
                  <td className="py-3.5 px-4 text-gray-600">
                    <div>{tkt.customerName || 'Aarav Singh'}</div>
                    <div className="text-[11px] text-gray-400">{tkt.propertyName}</div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-700 font-medium">
                    {tkt.assigneeName || 'Megha Kulkarni'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={tkt.priority === 'HIGH' ? 'badge-issue' : 'badge-pending'}>
                      {tkt.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={tkt.status === 'RESOLVED' ? 'badge-confirmed' : 'badge-issue'}>
                      {tkt.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/admin/support/${tkt.id}`}
                      className="inline-flex items-center gap-1 font-bold text-[#07552D] hover:underline"
                    >
                      <span>Resolve</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* In-App Support Ticket Drawer */}
      <TicketDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSuccess={() => {
          syncWithDatabase();
        }}
      />
    </div>
  );
}
