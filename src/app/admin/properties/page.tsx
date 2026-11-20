'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Plus, BedDouble, Check, ArrowRight } from 'lucide-react';
import { getState, subscribeToState } from '@/lib/store';

export default function AdminPropertiesPage() {
  const [state, setState] = useState(getState());
  const [viewMode, setViewMode] = useState<'rooms' | 'beds'>('rooms');

  useEffect(() => {
    return subscribeToState((newState) => {
      setState(newState);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#202820]">Properties & Bed Inventory</h1>
          <p className="text-xs text-gray-500 mt-0.5">Admin Module 06 • Comprehensive room & bed allocation oversight</p>
        </div>
        <Link
          href="/owner/properties/add"
          className="btn-primary text-xs py-2 px-3.5 self-start sm:self-auto flex items-center gap-1.5 font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Property</span>
        </Link>
      </div>

      {/* Property Summary Cards */}
      <div className="space-y-4">
        {state.properties.slice(0, 2).map((property, idx) => (
          <div key={property.id} className="bg-white rounded-xl border border-[#E2E8DE] p-5 shadow-card">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <img
                  src={property.photos[0]?.url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=150&q=80'}
                  alt={property.name}
                  className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                />
                <div>
                  <Link href={`/admin/properties/${property.id}`} className="font-bold text-sm text-[#202820] hover:text-[#07552D] hover:underline">
                    {property.name}
                  </Link>
                  <p className="text-xs text-gray-500">{property.address}, {property.locality}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 text-center text-xs">
                <div>
                  <span className="text-gray-400 block text-[11px]">Total Beds</span>
                  <span className="font-bold text-gray-900 text-sm">50</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Occupied</span>
                  <span className="font-bold text-[#07552D] text-sm">46</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Available</span>
                  <span className="font-bold text-amber-700 text-sm">4</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Occupancy</span>
                  <span className="font-bold text-[#07552D] text-sm">92%</span>
                </div>
              </div>

              <Link
                href={`/admin/properties/${property.id}`}
                className="btn-secondary text-xs py-1.5 px-3 self-end md:self-auto"
              >
                <span>Room Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Room Matrix Preview */}
            <div className="pt-4 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F7F9F5] text-gray-600 border-b">
                  <tr>
                    <th className="py-2 px-3 font-semibold w-24">Room</th>
                    <th className="py-2 px-3 font-semibold text-center">Bed 1</th>
                    <th className="py-2 px-3 font-semibold text-center">Bed 2</th>
                    <th className="py-2 px-3 font-semibold text-center">Bed 3</th>
                    <th className="py-2 px-3 font-semibold text-center">Bed 4</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50">
                    <td className="py-2.5 px-3 font-bold text-gray-900">A-101</td>
                    <td className="py-2.5 px-3 text-center"><span className="badge-active">Occupied ✓</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="badge-active">Occupied ✓</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="badge-active">Occupied ✓</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="badge-lime">Available</span></td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2.5 px-3 font-bold text-gray-900">A-102</td>
                    <td className="py-2.5 px-3 text-center"><span className="badge-active">Occupied ✓</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="badge-active">Occupied ✓</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="badge-lime">Available</span></td>
                    <td className="py-2.5 px-3 text-center"><span className="badge-lime">Available</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

