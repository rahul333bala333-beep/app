'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BedDouble, Building2, Check, Shield } from 'lucide-react';
import { getState } from '@/lib/store';

export default function AdminPropertyDetailPage({ params }: { params: { propertyId: string } }) {
  const state = getState();
  const property = state.properties.find((p) => p.id === params.propertyId) || state.properties[0];
  const rooms = state.rooms.filter((r) => r.propertyId === property.id);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/admin/properties" className="hover:text-black flex items-center gap-1 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Properties
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-bold">{property.name}</span>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
          <div className="flex items-center gap-4">
            <img
              src={property.photos[0]?.url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=300&q=80'}
              alt={property.name}
              className="w-16 h-16 object-cover rounded-xl border"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#202820]">{property.name}</h1>
                <span className={property.status === 'LISTED' ? 'badge-active' : 'badge-pending'}>
                  {property.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{property.address}, {property.locality}, Bengaluru</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#07552D] bg-[#D9F58B] px-3 py-1 rounded-full">
              ★ {property.rating} ({property.reviewCount} reviews)
            </span>
          </div>
        </div>

        {/* Room & Bed Allocation Breakdown */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#202820]">Room & Bed Layout Matrix</h2>
            <span className="text-xs text-gray-500">Auto-synchronized with owner roster</span>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F7F9F5] text-gray-700 border-b">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Room Number</th>
                  <th className="py-2.5 px-4 font-semibold">Sharing Type</th>
                  <th className="py-2.5 px-4 font-semibold">AC Status</th>
                  <th className="py-2.5 px-4 font-semibold">Bed Breakdown</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Base Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(rooms.length > 0 ? rooms : state.rooms.slice(0, 4)).map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold text-gray-900">Room {r.roomNumber}</td>
                    <td className="py-3 px-4 text-gray-700">{r.sharingType} Sharing</td>
                    <td className="py-3 px-4">
                      <span className={r.isAc ? 'badge-active' : 'bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[11px]'}>
                        {r.isAc ? 'AC' : 'Non-AC'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {r.beds.map((b) => (
                          <span
                            key={b.id}
                            className={b.status === 'OCCUPIED' ? 'badge-active' : 'badge-lime'}
                          >
                            {b.bedNumber}: {b.status === 'OCCUPIED' ? 'Occupied' : 'Available'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#07552D]">₹{r.basePricePerNight} / night</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

