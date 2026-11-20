'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, Star, MapPin } from 'lucide-react';
import { getState, subscribeToState, toggleSaveProperty } from '@/lib/store';

export default function CustomerSavedPage() {
  const [state, setState] = useState(getState());

  useEffect(() => {
    return subscribeToState((newState) => {
      setState(newState);
    });
  }, []);

  const savedList = state.properties.filter((p) => state.savedPropertyIds.includes(p.id));

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
        <Link href="/customer/explore" className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 shadow-2xs">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-gray-900">Saved PGs ({savedList.length})</h1>
          <p className="text-xs text-gray-500">Your short-listed Bengaluru co-living spaces</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {savedList.map((prop) => (
          <div
            key={prop.id}
            className="bg-white rounded-2xl border border-[#E2E8DE] p-3.5 shadow-card flex gap-3.5"
          >
            <Link href={`/customer/pg/${prop.id}`} className="shrink-0">
              <img
                src={prop.photos[0]?.url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=300&q=80'}
                alt={prop.name}
                className="w-24 h-24 object-cover rounded-xl border border-gray-200"
              />
            </Link>

            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <Link href={`/customer/pg/${prop.id}`} className="font-bold text-sm text-[#202820] hover:text-[#07552D] truncate">
                    {prop.name}
                  </Link>
                  <button onClick={() => toggleSaveProperty(prop.id)} className="p-1">
                    <Heart className="w-4 h-4 fill-[#07552D] text-[#07552D]" />
                  </button>
                </div>
                <div className="text-xs text-gray-500 truncate">{prop.locality}, Bengaluru</div>

                <div className="flex items-center gap-1 text-xs text-gray-700 mt-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="font-bold">{prop.rating}</span>
                  <span className="text-gray-400 text-[11px]">({prop.reviewCount})</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs font-bold text-[#07552D]">₹{prop.basePricePerNight} / night</span>
                <Link
                  href={`/customer/pg/${prop.id}`}
                  className="btn-primary text-xs py-1 px-3"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

