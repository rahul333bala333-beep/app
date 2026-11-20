'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  BedDouble,
  Users,
  Calendar,
  Percent,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { getState, subscribeToState } from '@/lib/store';

export default function OwnerDashboardPage() {
  const [state, setState] = useState(getState());
  const [selectedPG, setSelectedPG] = useState('ALL');

  useEffect(() => {
    return subscribeToState((newState) => {
      setState(newState);
    });
  }, []);

  const totalRooms = state.rooms.length;
  const totalBeds = state.rooms.reduce((acc, r) => acc + r.beds.length, 0);
  const occupiedBeds = state.rooms.reduce((acc, r) => acc + r.beds.filter((b) => b.status === 'OCCUPIED').length, 0);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 81;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#202820]">Portfolio Overview</h1>
          <p className="text-xs text-gray-500 mt-0.5">PG Owner Module 02 • Real-time portfolio occupancy & operational health</p>
        </div>
        <div className="sm:w-44">
          <select
            value={selectedPG}
            onChange={(e) => setSelectedPG(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none font-semibold text-gray-800"
          >
            <option value="ALL">All PGs (3)</option>
            {state.properties.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards (All 6 Metrics across Mobile & Desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8DE] shadow-card">
          <div className="text-[11px] text-gray-500 font-medium">Total PGs</div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
            3 <span className="text-xs font-normal text-gray-500">PGs</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8DE] shadow-card">
          <div className="text-[11px] text-gray-500 font-medium">Total Rooms</div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
            {totalRooms || 16} <span className="text-xs font-normal text-gray-500">Rooms</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8DE] shadow-card">
          <div className="text-[11px] text-gray-500 font-medium">Total Beds</div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
            {totalBeds || 78} <span className="text-xs font-normal text-gray-500">Beds</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8DE] shadow-card">
          <div className="text-[11px] text-gray-500 font-medium">Occupied Beds</div>
          <div className="text-2xl sm:text-3xl font-black text-[#07552D] mt-1">
            {occupiedBeds || 63} <span className="text-xs font-normal text-gray-500">Beds</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8DE] shadow-card">
          <div className="text-[11px] text-gray-500 font-medium">Available Beds</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
            {(totalBeds || 78) - (occupiedBeds || 63)} <span className="text-xs font-normal text-gray-500">Beds</span>
          </div>
        </div>

        <div className="bg-[#F1FCDF] p-4 sm:p-5 rounded-2xl border border-[#D9F58B] shadow-card">
          <div className="text-[11px] text-[#07552D] font-bold">Occupancy Rate</div>
          <div className="text-2xl sm:text-3xl font-black text-[#07552D] mt-1">{occupancyRate}%</div>
        </div>
      </div>

      {/* Property Showcase Cards */}
      <div className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-[#202820]">Property Occupancy Breakdown</h2>
          <Link href="/owner/properties" className="text-xs font-semibold text-[#07552D] hover:underline flex items-center gap-1">
            <span>Manage All PGs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-[#F7F9F5] border border-[#E2E8DE] rounded-xl flex items-center justify-between hover:bg-white hover:border-[#07552D] transition-all">
            <div className="flex items-center gap-3.5">
              <img
                src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=150&q=80"
                alt="HSR Garden PG"
                className="w-14 h-14 object-cover rounded-xl border"
              />
              <div>
                <h3 className="font-bold text-sm text-gray-900">HSR Garden PG</h3>
                <div className="text-xs text-gray-600 mt-0.5">64 Beds • 52 Occupied • HSR Layout</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-[#07552D]">81%</div>
              <span className="badge-active text-[10px]">Listed</span>
            </div>
          </div>

          <div className="p-4 bg-[#F7F9F5] border border-[#E2E8DE] rounded-xl flex items-center justify-between hover:bg-white hover:border-[#07552D] transition-all">
            <div className="flex items-center gap-3.5">
              <img
                src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=150&q=80"
                alt="Koramangala PG"
                className="w-14 h-14 object-cover rounded-xl border"
              />
              <div>
                <h3 className="font-bold text-sm text-gray-900">Koramangala PG</h3>
                <div className="text-xs text-gray-600 mt-0.5">10 Beds • 7 Occupied • Koramangala</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-[#07552D]">70%</div>
              <span className="badge-active text-[10px]">Listed</span>
            </div>
          </div>

          <div className="p-4 bg-[#F7F9F5] border border-[#E2E8DE] rounded-xl flex items-center justify-between hover:bg-white hover:border-[#07552D] transition-all">
            <div className="flex items-center gap-3.5">
              <img
                src="https://images.unsplash.com/photo-1502005229762-ee1b2b8ab98f?auto=format&fit=crop&w=150&q=80"
                alt="BTM Comfort PG"
                className="w-14 h-14 object-cover rounded-xl border"
              />
              <div>
                <h3 className="font-bold text-sm text-gray-900">BTM Comfort PG</h3>
                <div className="text-xs text-gray-600 mt-0.5">4 Beds • 2 Occupied • BTM Layout</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-amber-700">50%</div>
              <span className="badge-pending text-[10px]">Unlisted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

