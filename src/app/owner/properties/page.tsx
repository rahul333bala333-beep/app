'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Plus, Edit2, Eye, ToggleLeft, ToggleRight, ArrowRight } from 'lucide-react';
import { getState, subscribeToState, togglePropertyListing } from '@/lib/store';

export default function OwnerPropertiesPage() {
  const [state, setState] = useState(getState());

  useEffect(() => {
    return subscribeToState((newState) => {
      setState(newState);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#202820]">My PGs ({state.properties.length})</h1>
          <p className="text-xs text-gray-500 mt-0.5">PG Owner Module 03 • Manage listings, photo galleries & discovery status</p>
        </div>
        <Link href="/owner/properties/add" className="btn-primary text-xs py-2 px-3.5 self-start sm:self-auto font-bold shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Add New PG</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8DE] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F7F9F5] text-gray-700 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 font-semibold">PG Name</th>
                <th className="py-3 px-4 font-semibold">Locality</th>
                <th className="py-3 px-4 font-semibold">Beds</th>
                <th className="py-3 px-4 font-semibold">Occupancy</th>
                <th className="py-3 px-4 font-semibold">Listing Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {state.properties.map((property, idx) => {
                const bedsCount = idx === 0 ? 64 : idx === 1 ? 10 : 4;
                const occRate = idx === 0 ? '81%' : idx === 1 ? '70%' : '50%';
                return (
                  <tr key={property.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={property.photos[0]?.url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=150&q=80'}
                          alt={property.name}
                          className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                        />
                        <div>
                          <div className="font-bold text-gray-900 text-sm">{property.name}</div>
                          <div className="text-gray-500 text-[11px]">{property.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-700">{property.locality}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">{bedsCount}</td>
                    <td className="py-3.5 px-4 font-bold text-[#07552D]">{occRate}</td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => togglePropertyListing(property.id)}
                        className={`cursor-pointer ${property.status === 'LISTED' ? 'badge-active' : 'badge-pending'}`}
                      >
                        {property.status === 'LISTED' ? 'Listed (Live)' : 'Unlisted (Hidden)'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/owner/properties/${property.id}/edit`}
                          className="px-2.5 py-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded text-gray-800 inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </Link>
                        <Link
                          href={`/owner/rooms`}
                          className="px-2.5 py-1 text-xs font-semibold bg-[#F1FCDF] hover:bg-[#EBFCC0] text-[#07552D] rounded"
                        >
                          Inventory
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

