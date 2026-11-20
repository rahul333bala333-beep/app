'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BedDouble, Plus, Users, Shield, ArrowRight } from 'lucide-react';
import { getState, subscribeToState, syncWithDatabase } from '@/lib/store';
import { AddRoomModal } from '@/components/modals/RoomBedModal';

export default function OwnerRoomsPage() {
  const [state, setState] = useState(getState());
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);

  useEffect(() => {
    return subscribeToState((newState) => {
      setState(newState);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#202820]">HSR Garden PG – Rooms & Beds</h1>
          <p className="text-xs text-gray-500 mt-0.5">PG Owner Module 05 • Granular bed occupancy, sharing categories & vacancy tracking</p>
        </div>
        <button
          onClick={() => setIsAddRoomOpen(true)}
          className="btn-primary text-xs py-2 px-3.5 self-start sm:self-auto font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Room</span>
        </button>
      </div>

      {/* KPI Stats (Exact to Reference Image 3 Module 5) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E2E8DE] shadow-card text-center">
          <div className="text-xs text-gray-500 font-medium">Rooms</div>
          <div className="text-2xl font-black text-gray-900 mt-1">{state.rooms.length || 16}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E2E8DE] shadow-card text-center">
          <div className="text-xs text-gray-500 font-medium">Total Beds</div>
          <div className="text-2xl font-black text-gray-900 mt-1">64</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E2E8DE] shadow-card text-center">
          <div className="text-xs text-gray-500 font-medium">Occupied Beds</div>
          <div className="text-2xl font-black text-[#07552D] mt-1">52</div>
        </div>
        <div className="bg-[#F1FCDF] p-4 rounded-xl border border-[#D9F58B] shadow-card text-center">
          <div className="text-xs text-[#07552D] font-bold">Available Beds</div>
          <div className="text-2xl font-black text-[#07552D] mt-1">12</div>
        </div>
      </div>

      {/* Inventory Table (Exact to Image 3 Module 5) */}
      <div className="bg-white rounded-xl border border-[#E2E8DE] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F7F9F5] text-gray-700 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Room</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Total Beds</th>
                <th className="py-3 px-4 font-semibold">Occupied</th>
                <th className="py-3 px-4 font-semibold">Available</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {state.rooms.map((room) => {
                const occupiedCount = room.beds.filter((b) => b.status === 'OCCUPIED').length;
                const availableCount = room.beds.filter((b) => b.status === 'AVAILABLE').length;

                return (
                  <tr key={room.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{room.roomNumber}</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-800">
                      {room.sharingType} Sharing {room.isAc ? '• AC' : '• Non-AC'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-800">{room.beds.length}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-800">{occupiedCount}</td>
                    <td className="py-3.5 px-4">
                      <span className={availableCount > 0 ? 'badge-lime' : 'badge-issue'}>
                        {availableCount}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* In-App Add Room Modal */}
      <AddRoomModal
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
        propertyId="prop-hsr-1"
        onSuccess={() => {
          syncWithDatabase();
        }}
      />
    </div>
  );
}
