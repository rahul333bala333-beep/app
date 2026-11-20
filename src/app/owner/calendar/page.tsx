'use client';

import React, { useState } from 'react';
import { Calendar, Plus, Wrench, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getState, createMaintenanceBlock, syncWithDatabase } from '@/lib/store';
import { MaintenanceModal } from '@/components/modals/MaintenanceModal';

export default function OwnerCalendarPage() {
  const [maintReason, setMaintReason] = useState('Annual AC duct servicing & deep cleaning');
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#202820]">HSR Garden PG – Availability Calendar</h1>
          <p className="text-xs text-gray-500 mt-0.5">PG Owner Module 06 • Date reservation states & maintenance blockage manager</p>
        </div>
        <button
          onClick={() => setIsMaintenanceModalOpen(true)}
          className="btn-primary text-xs py-2 px-3.5 self-start sm:self-auto font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Maintenance Block</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card space-y-6">
        {/* Month & Legend Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#07552D]" />
            <h2 className="text-base font-bold text-[#202820]">December 2024</h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available
            </span>
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-400" /> Booked
            </span>
            <span className="flex items-center gap-1.5 text-rose-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Maintenance (12–18 Dec)
            </span>
          </div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="py-2 font-bold text-gray-400 uppercase text-[10px]">
              {day}
            </div>
          ))}

          {/* Blank padding for December 2024 (starts Sunday) */}
          <div className="p-3" />
          <div className="p-3" />
          <div className="p-3" />
          <div className="p-3" />
          <div className="p-3" />
          <div className="p-3" />

          {/* 31 days */}
          {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => {
            const isMaintenance = date >= 12 && date <= 18;
            const isBooked = [2, 3, 4, 8, 9, 10, 22, 23, 24].includes(date);

            return (
              <div
                key={date}
                className={`py-3 rounded-lg border text-xs font-bold transition-all ${
                  isMaintenance
                    ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs'
                    : isBooked
                    ? 'bg-gray-100 border-gray-200 text-gray-500'
                    : 'bg-white border-[#E2E8DE] text-gray-800 hover:border-[#07552D]'
                }`}
              >
                {date}
                {isMaintenance && <span className="block text-[9px] font-normal mt-0.5">Maint</span>}
              </div>
            );
          })}
        </div>

        {/* Maintenance Banner */}
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-950">Active Maintenance Block: 12 – 18 Dec 2024 (7 nights)</div>
              <div className="text-xs text-rose-800 mt-0.5">{maintReason}</div>
            </div>
          </div>
          <button
            onClick={() => setIsMaintenanceModalOpen(true)}
            className="btn-secondary text-xs py-1.5 px-3 self-end sm:self-auto font-semibold"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Block</span>
          </button>
        </div>
      </div>

      {/* In-App Maintenance Modal */}
      <MaintenanceModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        propertyId="prop-hsr-1"
        onSuccess={() => {
          syncWithDatabase();
        }}
      />
    </div>
  );
}
