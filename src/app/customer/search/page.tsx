'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, SlidersHorizontal, Heart, Star, MapPin } from 'lucide-react';
import { getState, subscribeToState, toggleSaveProperty } from '@/lib/store';
import { Drawer } from '@/components/ui/Drawer';
import { toast } from '@/components/ui/Toast';

export default function CustomerSearchPage() {
  const [state, setState] = useState(getState());
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [priceRange, setPriceRange] = useState('500-1000');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [foodFilter, setFoodFilter] = useState('ALL');
  const [roomFilter, setRoomFilter] = useState('ALL');

  useEffect(() => {
    return subscribeToState((newState) => {
      setState(newState);
    });
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link
            href="/customer/explore"
            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-gray-900 leading-tight">
              PGs in HSR Layout, Bengaluru
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              18 verified co-living spaces with real-time bed availability
            </p>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-600 bg-[#F1FCDF] text-[#07552D] px-3 py-1.5 rounded-xl border border-[#D9F58B] font-bold">
          <span>₹700 – ₹1,200 avg. nightly</span>
        </div>
      </div>

      {/* Filter Row (Adaptive Desktop & Mobile) */}
      <div className="flex items-center gap-2 text-xs overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setIsFilterDrawerOpen(true)}
          className="px-3.5 py-2 bg-[#D9F58B] text-[#07552D] font-bold rounded-xl border border-[#c4e868] flex items-center gap-1.5 shrink-0 shadow-xs hover:bg-[#cbf06f] transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters (2)</span>
        </button>

        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none font-semibold text-gray-700 shrink-0 shadow-2xs focus:border-[#07552D]"
        >
          <option value="ALL">Gender: Any</option>
          <option value="MALE">Boys PG</option>
          <option value="FEMALE">Girls PG</option>
          <option value="UNISEX">Coliving / Unisex</option>
        </select>

        <select
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none font-semibold text-gray-700 shrink-0 shadow-2xs focus:border-[#07552D]"
        >
          <option value="500-1000">₹500 – ₹1,000 / night</option>
          <option value="1000-1500">₹1,000 – ₹1,500 / night</option>
          <option value="ALL">All Price Ranges</option>
        </select>
      </div>

      {/* Result Cards: Responsive Feed (Compact list on Mobile, Grid on Tablet/Desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {state.properties.map((property) => (
          <div
            key={property.id}
            className="bg-white rounded-2xl border border-[#E2E8DE] p-3.5 shadow-card hover:shadow-card-hover transition-all flex gap-3.5"
          >
            <Link href={`/customer/pg/${property.id}`} className="shrink-0">
              <img
                src={property.photos[0]?.url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=300&q=80'}
                alt={property.name}
                className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl border border-gray-200"
              />
            </Link>

            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <Link href={`/customer/pg/${property.id}`} className="font-bold text-sm text-[#202820] hover:text-[#07552D] truncate">
                    {property.name}
                  </Link>
                  <button
                    onClick={() => toggleSaveProperty(property.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        state.savedPropertyIds.includes(property.id)
                          ? 'fill-[#07552D] text-[#07552D]'
                          : 'text-gray-400'
                      }`}
                    />
                  </button>
                </div>
                <div className="text-xs text-gray-500 truncate">{property.locality}, Bengaluru</div>

                <div className="flex items-center gap-1 text-xs text-gray-700 mt-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="font-bold">{property.rating}</span>
                  <span className="text-gray-400 text-[11px]">({property.reviewCount})</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 text-[10px] text-gray-600 font-medium">
                  <span>Wi-Fi</span>
                  <span>•</span>
                  <span>Meals</span>
                  <span>•</span>
                  <span>Laundry</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-sm text-[#07552D]">₹{property.basePricePerNight}</span>
                  <span className="text-[10px] text-gray-500"> / night</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* In-App Filter Drawer */}
      <Drawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        title="Filter PGs"
        subtitle="Customise accommodation search in Bengaluru"
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => {
                setGenderFilter('ALL');
                setPriceRange('ALL');
                setFoodFilter('ALL');
                setRoomFilter('ALL');
                toast.info('Search filters reset to defaults');
              }}
              className="text-xs text-gray-500 hover:text-gray-900 underline font-medium"
            >
              Reset All
            </button>
            <button
              type="button"
              onClick={() => {
                setIsFilterDrawerOpen(false);
                toast.success('Search filters applied!');
              }}
              className="btn-primary text-xs py-2 px-5 font-bold"
            >
              Apply Filters
            </button>
          </div>
        }
      >
        <div className="space-y-5 text-xs">
          <div>
            <label className="block font-bold text-gray-800 mb-2">Gender Category</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'MALE', label: 'Boys PG' },
                { id: 'FEMALE', label: 'Girls PG' },
                { id: 'UNISEX', label: 'Coliving' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGenderFilter(g.id)}
                  className={`py-2 px-1 rounded-xl font-bold border transition-colors ${
                    genderFilter === g.id
                      ? 'bg-[#07552D] text-[#D9F58B] border-[#07552D]'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-2">Price Range per Night</label>
            <div className="space-y-1.5">
              {[
                { id: 'ALL', label: 'Any Budget' },
                { id: '500-1000', label: '₹500 – ₹1,000 / night' },
                { id: '1000-1500', label: '₹1,000 – ₹1,500 / night' },
              ].map((p) => (
                <label key={p.id} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-100 bg-[#F7F9F5] cursor-pointer hover:bg-gray-100">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={priceRange === p.id}
                    onChange={() => setPriceRange(p.id)}
                    className="accent-[#07552D]"
                  />
                  <span className="font-medium text-gray-800">{p.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-2">Room Sharing</label>
            <div className="grid grid-cols-3 gap-2">
              {['ALL', 'Single Room', 'Sharing (Twin)'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoomFilter(r)}
                  className={`py-2 px-1 rounded-xl font-bold border transition-colors ${
                    roomFilter === r
                      ? 'bg-[#07552D] text-[#D9F58B] border-[#07552D]'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {r === 'ALL' ? 'Any Sharing' : r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-2">Food / Meals</label>
            <div className="grid grid-cols-2 gap-2">
              {['ALL', '3 Meals Included'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFoodFilter(f)}
                  className={`py-2 px-2 rounded-xl font-bold border transition-colors ${
                    foodFilter === f
                      ? 'bg-[#07552D] text-[#D9F58B] border-[#07552D]'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {f === 'ALL' ? 'Any' : f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

