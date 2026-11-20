'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BedDouble,
  Calendar,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { getState, subscribeToState } from '@/lib/store';

export default function AdminDashboardPage() {
  const [state, setState] = useState(getState());

  useEffect(() => {
    return subscribeToState((newState) => {
      setState(newState);
    });
  }, []);

  const totalOccupiedBeds = state.rooms.reduce((acc, r) => acc + r.beds.filter((b) => b.status === 'OCCUPIED').length, 0);
  const totalBeds = state.rooms.reduce((acc, r) => acc + r.beds.length, 0);
  const occupancyRate = totalBeds > 0 ? Math.round((totalOccupiedBeds / totalBeds) * 100) : 92;
  const activeBookingsCount = state.bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'PAID_UNASSIGNED').length;
  const unassignedBookings = state.bookings.filter((b) => b.status === 'PAID_UNASSIGNED');
  const openEscalations = state.escalations.filter((e) => e.status === 'OPEN');
  const totalIssuesCount = unassignedBookings.length + openEscalations.length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-2">
        <div>
          <h1 className="text-xl font-black text-[#202820]">Operations Overview & Issues</h1>
          <p className="text-xs text-gray-500 mt-0.5">Admin Module 02 • Real-time platform pulse & operational triage</p>
        </div>
        <div className="text-xs text-gray-500 font-medium">Last updated: 10 Dec, 11:30 AM</div>
      </div>

      {/* KPI Cards (Exact match to Reference Image 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-[#E2E8DE] shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 text-[#07552D] flex items-center justify-center font-bold">
            <BedDouble className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Occupancy</div>
            <div className="text-2xl font-black text-[#07552D]">{occupancyRate}%</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8DE] shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#EBFCC0] text-[#07552D] flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Active Bookings</div>
            <div className="text-2xl font-black text-[#202820]">{activeBookingsCount}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-red-200 shadow-card flex items-center gap-4 bg-red-50/20">
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Issues</div>
            <div className="text-2xl font-black text-rose-700">{totalIssuesCount}</div>
          </div>
        </div>
      </div>

      {/* Issues Needing Action Table */}
      <div className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#202820]">
            Issues Needing Action ({totalIssuesCount})
          </h2>
          <span className="text-xs text-gray-500">Prioritized by severity</span>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F7F9F5] text-gray-600 border-b border-gray-200">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Issue</th>
                <th className="py-2.5 px-4 font-semibold">Property</th>
                <th className="py-2.5 px-4 font-semibold">Since</th>
                <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Paid, Not Assigned exception */}
              {unassignedBookings.map((bkg) => (
                <tr key={bkg.id} className="bg-amber-50/60 hover:bg-amber-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-amber-950 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-ping" />
                    <span>Paid, not assigned ({bkg.bookingNumber})</span>
                  </td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{bkg.propertyName}</td>
                  <td className="py-3 px-4 text-gray-500">10 Dec, 9:20 AM</td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/admin/bookings/${bkg.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[#07552D] hover:bg-[#054022] text-white rounded text-xs font-semibold shadow-xs"
                    >
                      <span>Resolve</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}

              {/* Operational Escalations */}
              {openEscalations.map((esc) => (
                <tr key={esc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span>{esc.issue} ({esc.id})</span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{esc.propertyName}</td>
                  <td className="py-3 px-4 text-gray-500">{esc.since}</td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href="/admin/visits"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 rounded text-xs font-medium"
                    >
                      <span>Review</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

