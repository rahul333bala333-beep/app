'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Heart,
  Star,
  Bell,
  ArrowRight,
  Wifi,
  Utensils,
  Shirt,
  Wind,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { getState, subscribeToState, toggleSaveProperty } from '@/lib/store';

export default function CustomerExplorePage() {
  const router = useRouter();
  const [state, setState] = useState(getState());
  const [locality, setLocality] = useState('HSR Layout');
  const [search, setSearch] = useState('HSR Layout, Bengaluru');

  useEffect(() => {
    return subscribeToState((newState) => {
      setState(newState);
    });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/customer/search?locality=${encodeURIComponent(locality)}`);
  };

  const localities = [
    { name: 'HSR Layout', count: '18 PGs' },
    { name: 'Koramangala', count: '24 PGs' },
    { name: 'BTM Layout', count: '15 PGs' },
    { name: 'Indiranagar', count: '12 PGs' },
    { name: 'Whitefield', count: '20 PGs' },
    { name: 'Electronic City', count: '16 PGs' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* =========================================================================
          HERO & SEARCH SECTION (Responsive Mobile & Desktop)
      ========================================================================= */}
      <div className="bg-gradient-to-br from-[#07552D] to-[#0A4526] rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#D9F58B]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-[#D9F58B] text-xs font-bold border border-white/15">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Aadhaar Verified Accommodations</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
            Find your perfect PG in Bengaluru
          </h1>
          <p className="text-xs sm:text-sm text-gray-200 max-w-xl leading-relaxed">
            Discover verified co-living spaces with home-cooked meals, high-speed Wi-Fi, air conditioning, and daily housekeeping.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="pt-2">
            <div className="relative flex items-center max-w-2xl bg-white rounded-2xl shadow-lg border border-white/20 p-1.5 text-gray-900">
              <Search className="w-5 h-5 text-gray-400 ml-3 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search locality, tech park, or landmark in Bengaluru..."
                className="w-full px-3 py-2.5 text-xs sm:text-sm bg-transparent outline-none font-medium placeholder-gray-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="px-2 text-gray-400 hover:text-gray-600 text-xs font-bold shrink-0"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                className="bg-[#07552D] hover:bg-[#054022] text-[#D9F58B] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-colors shadow-xs flex items-center gap-1.5"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4 hidden sm:inline-block" />
              </button>
            </div>
          </form>

          {/* Locality Quick Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 text-xs">
            <span className="text-xs text-gray-300 font-semibold shrink-0 hidden sm:inline">Popular:</span>
            {localities.slice(0, 4).map((loc) => (
              <button
                key={loc.name}
                type="button"
                onClick={() => {
                  setLocality(loc.name);
                  setSearch(`${loc.name}, Bengaluru`);
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  locality === loc.name
                    ? 'bg-[#D9F58B] text-[#07552D] shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                }`}
              >
                {loc.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
          FEATURED PG SPOTLIGHT & BENGALURU LOCALITIES
      ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#202820]">
              Featured PGs in {locality}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Verified single & sharing rooms with real-time bed availability
            </p>
          </div>
          <Link
            href={`/customer/search?locality=${encodeURIComponent(locality)}`}
            className="text-xs font-bold text-[#07552D] hover:text-[#054022] flex items-center gap-1 hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Responsive Grid: 1 col on Mobile, 2 on Tablet, 3 on Desktop, 4 on Ultrawide */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {state.properties.map((property) => {
            const isSaved = state.savedPropertyIds.includes(property.id);
            const coverPhoto =
              property.photos[0]?.url ||
              'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80';

            return (
              <div
                key={property.id}
                className="bg-white rounded-2xl border border-[#E2E8DE] shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden flex flex-col group"
              >
                {/* Photo Header */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-100">
                  <img
                    src={coverPhoto}
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Heart / Save Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleSaveProperty(property.id);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-md active:scale-90 transition-transform"
                    title={isSaved ? 'Remove from Saved' : 'Save PG'}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isSaved ? 'fill-rose-500 text-rose-500' : 'text-gray-600'
                      }`}
                    />
                  </button>

                  {/* Verified Badge */}
                  <div className="absolute bottom-2.5 left-2.5 bg-black/65 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#D9F58B]" />
                    <span>Stayzy Verified</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/customer/pg/${property.id}`}
                        className="font-bold text-sm sm:text-base text-[#202820] hover:text-[#07552D] transition-colors line-clamp-1"
                      >
                        {property.name}
                      </Link>
                      <div className="flex items-center gap-1 text-xs shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-gray-800">{property.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{property.locality}, Bengaluru</span>
                    </p>

                    {/* Amenities Row */}
                    <div className="flex items-center gap-2 mt-3 text-[11px] text-gray-600">
                      <span className="inline-flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                        <Wifi className="w-3 h-3 text-[#07552D]" /> Wi-Fi
                      </span>
                      <span className="inline-flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                        <Utensils className="w-3 h-3 text-[#07552D]" /> Meals
                      </span>
                      <span className="inline-flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                        <Shirt className="w-3 h-3 text-[#07552D]" /> Laundry
                      </span>
                    </div>
                  </div>

                  {/* Card Footer: Pricing & Action */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base sm:text-lg font-black text-[#07552D]">
                          ₹{property.basePricePerNight}
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium">/ night</span>
                      </div>
                      <div className="text-[10px] text-gray-400">₹{property.basePricePerNight * 30}/month approx</div>
                    </div>

                    <Link
                      href={`/customer/pg/${property.id}`}
                      className="px-3.5 py-1.5 bg-[#07552D] hover:bg-[#054022] text-[#D9F58B] rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1"
                    >
                      <span>View PG</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          POPULAR BENGALURU LOCALITIES GRID (Desktop & Tablet)
      ========================================================================= */}
      <div className="bg-white rounded-2xl border border-[#E2E8DE] p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Explore PGs by Locality</h3>
            <p className="text-xs text-gray-500">Popular tech corridors and residential hubs in Bengaluru</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {localities.map((loc) => (
            <button
              key={loc.name}
              type="button"
              onClick={() => {
                setLocality(loc.name);
                router.push(`/customer/search?locality=${encodeURIComponent(loc.name)}`);
              }}
              className="p-3 rounded-xl border border-gray-200 hover:border-[#07552D] hover:bg-[#F1FCDF] transition-all text-left group"
            >
              <div className="font-bold text-xs text-gray-800 group-hover:text-[#07552D]">
                {loc.name}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">{loc.count}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
