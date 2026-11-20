'use client';

import React, { useState, useEffect } from 'react';
import { History, Filter, Search, Clock, ShieldCheck } from 'lucide-react';
import { getState, subscribeToState } from '@/lib/store';

export default function AdminAuditLogsPage() {
  const [state, setState] = useState(getState());
  const [filterAction, setFilterAction] = useState('ALL');
  const [filterDate, setFilterDate] = useState('7DAYS');

  useEffect(() => {
    return subscribeToState((newState) => {
      setState(newState);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#202820]">Audit Logs (Actor & Time)</h1>
          <p className="text-xs text-gray-500 mt-0.5">Admin Module 12 • Immutable operational mutation trail</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none font-medium"
          >
            <option value="7DAYS">Last 7 Days</option>
            <option value="TODAY">Today</option>
            <option value="30DAYS">Last 30 Days</option>
          </select>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none font-medium"
          >
            <option value="ALL">All Actions</option>
            <option value="BED">Bed Allocation</option>
            <option value="VERIFY">PG Verification</option>
            <option value="TICKET">Ticket Resolution</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-[#E2E8DE] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F7F9F5] text-gray-700 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 font-semibold w-44">Time</th>
                <th className="py-3 px-4 font-semibold w-48">Actor</th>
                <th className="py-3 px-4 font-semibold">Action</th>
                <th className="py-3 px-4 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {state.auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-gray-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })},{' '}
                    {new Date(log.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">
                    <span>{log.actorName}</span>
                    <span className="text-[10px] font-normal text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded ml-1.5">
                      {log.actorRole}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#07552D]">{log.action}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-gray-700">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

