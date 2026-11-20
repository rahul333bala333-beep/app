'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  MapPin,
  Wifi,
  Utensils,
  Shirt,
  Wind,
  Shield,
  Check,
  Calendar,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { getState, toggleSaveProperty } from '@/lib/store';
import { toast } from '@/components/ui/Toast';

export default function CustomerPropertyDetailPage({ params }: { params: { propertyId: string } }) {
  const state = getState();
  const property = state.properties.find((p) => p.id === params.propertyId) || state.properties[0];
  const [photoIndex, setPhotoIndex] = useState(0);
  const isSaved = state.savedPropertyIds.includes(property.id);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link
            href="/customer/explore"
            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-black text-lg sm:text-xl text-gray-900 truncate">{property.name}</h1>
            <p className="text-xs text-gray-500 hidden sm:block">{property.locality}, Bengaluru</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSaveProperty(property.id)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-gray-500'}`} />
            <span className="text-xs font-semibold hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
          </button>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                navigator.clipboard?.writeText(window.location.href);
                toast.success('Property link copied to clipboard!');
              }
            }}
            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 shadow-2xs"
            title="Share Property"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Responsive Grid Layout (Desktop 12-cols, Mobile Stacks) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: Photos, Amenities, Description (7 cols on Desktop) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Photo Gallery */}
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-card bg-black aspect-video sm:aspect-16/10">
            <img
              src={property.photos[photoIndex]?.url || property.photos[0]?.url}
              alt={property.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full">
              {photoIndex + 1}/{property.photos.length || 8}
            </div>
          </div>

          {/* Thumbnails Row */}
          {property.photos.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {property.photos.map((photo, idx) => (
                <button
                  key={photo.id || idx}
                  onClick={() => setPhotoIndex(idx)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    photoIndex === idx ? 'border-[#07552D] scale-95 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={photo.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Details & Amenities Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8DE] p-5 sm:p-6 shadow-card space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-900">{property.name}</h2>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" /> {property.address}, {property.locality}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-[#F1FCDF] border border-[#D9F58B] px-3 py-1 rounded-xl">
                <Star className="w-4 h-4 fill-[#07552D] text-[#07552D]" />
                <span className="font-black text-sm text-[#07552D]">{property.rating.toFixed(1)}</span>
                <span className="text-[11px] text-gray-500">({property.reviewCount})</span>
              </div>
            </div>

            {/* Amenities Bar */}
            <div className="grid grid-cols-5 gap-2 text-center p-3 sm:p-4 bg-[#F7F9F5] rounded-xl border border-[#E2E8DE] text-xs font-semibold text-gray-700">
              <div className="flex flex-col items-center">
                <Wifi className="w-5 h-5 text-[#07552D] mb-1" />
                <span>High-Speed Wi-Fi</span>
              </div>
              <div className="flex flex-col items-center">
                <Utensils className="w-5 h-5 text-[#07552D] mb-1" />
                <span>3x Meals</span>
              </div>
              <div className="flex flex-col items-center">
                <Shirt className="w-5 h-5 text-[#07552D] mb-1" />
                <span>Laundry</span>
              </div>
              <div className="flex flex-col items-center">
                <Wind className="w-5 h-5 text-[#07552D] mb-1" />
                <span>AC / Non-AC</span>
              </div>
              <div className="flex flex-col items-center">
                <Shield className="w-5 h-5 text-[#07552D] mb-1" />
                <span>CCTV Security</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-1">About the PG</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Stay Policies */}
            <div className="pt-3 border-t border-gray-100 text-xs space-y-2">
              <h3 className="font-bold text-gray-900">House Rules & Stay Policies</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#07552D]" />
                  <span>Minimum stay: {property.minStayDays} nights</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#07552D]" />
                  <span>Notice period: {property.noticePeriodDays} days</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#07552D]" />
                  <span>Security deposit: ₹{property.depositAmount} (Refundable)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#07552D]" />
                  <span>Main gate curfew: 10:30 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Booking & Rates Card (5 cols on Desktop) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl border border-[#E2E8DE] p-6 shadow-card sticky top-20 space-y-5">
            <div className="flex items-baseline justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-2xl font-black text-[#07552D]">₹{property.basePricePerNight}</span>
                <span className="text-xs text-gray-500 font-medium"> / night</span>
              </div>
              <div className="text-xs bg-[#F1FCDF] text-[#07552D] font-bold px-2.5 py-1 rounded-full border border-[#D9F58B]">
                Instant Confirmation
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-gray-600">
                <span>Room Sharing Options:</span>
                <span className="font-bold text-gray-800">Single, Double & 3-Sharing</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Refundable Deposit:</span>
                <span className="font-bold text-gray-800">₹{property.depositAmount}</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Food & Cleaning:</span>
                <span className="font-bold text-emerald-700">Included in Rent</span>
              </div>
            </div>

            <div className="pt-2 space-y-2.5">
              <Link
                href={`/customer/booking/select?propertyId=${property.id}`}
                className="w-full py-3.5 px-4 bg-[#07552D] hover:bg-[#054022] text-[#D9F58B] rounded-xl text-xs sm:text-sm font-bold text-center shadow-md flex items-center justify-center gap-2 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Select Dates & Available Bed</span>
              </Link>

              <Link
                href={`/customer/visits?schedulePropId=${property.id}`}
                className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2 transition-colors"
              >
                <Eye className="w-4 h-4 text-gray-500" />
                <span>Schedule a Physical Visit</span>
              </Link>
            </div>

            <div className="p-3 bg-[#F7F9F5] rounded-xl border border-gray-100 text-[11px] text-gray-500 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#07552D] shrink-0" />
              <span>Zero brokerage charged. Free cancellation within 24 hours.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
