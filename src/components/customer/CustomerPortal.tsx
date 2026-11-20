'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Star,
  Heart,
  Share2,
  Calendar,
  BedDouble,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ChevronRight,
  Download,
  Phone,
  User,
  SlidersHorizontal,
  Wifi,
  Utensils,
  Shirt,
  Wind,
  Shield,
  Copy,
  Smartphone,
  Monitor,
  Check,
  AlertCircle,
  HelpCircle,
  LogOut,
  Sparkles,
} from 'lucide-react';
import {
  getState,
  subscribeToState,
  createCustomerBooking,
  cancelBooking,
  extendStay,
  scheduleVisit,
  updateVisitStatus,
  createSupportTicket,
  toggleSaveProperty,
  setCurrentUser,
} from '@/lib/store';
import { Booking, Property, Room, Bed } from '@/lib/types';
import { toast } from '../ui/Toast';

export default function CustomerPortal() {
  const [state, setState] = useState(getState());
  const [activeTab, setActiveTab] = useState<'all' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12'>('all');
  const [isMobileFrame, setIsMobileFrame] = useState(true);

  // Customer UI Navigation Flow States
  const [customerScreen, setCustomerScreen] = useState<'explore' | 'results' | 'details' | 'dates' | 'checkout' | 'confirmation' | 'stays' | 'visits' | 'payments' | 'account'>('explore');
  const [selectedLocality, setSelectedLocality] = useState('HSR Layout');
  const [selectedPGId, setSelectedPGId] = useState('prop-hsr-1');
  const [selectedBedType, setSelectedBedType] = useState('Single Bed – Non AC');
  const [selectedRate, setSelectedRate] = useState(700);
  const [stayNights, setStayNights] = useState(7);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD'>('UPI');
  const [lastCreatedBooking, setLastCreatedBooking] = useState<Booking | null>(null);
  const [myStaysTab, setMyStaysTab] = useState<'current' | 'upcoming' | 'past'>('current');
  const [visitsTab, setVisitsTab] = useState<'upcoming' | 'past'>('upcoming');
  const [paymentsTab, setPaymentsTab] = useState<'all' | 'receipts' | 'refunds'>('all');
  const [searchQuery, setSearchQuery] = useState('HSR Layout, Bengaluru');
  const [otpSent, setOtpSent] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('98765 43210');
  const [profileMovingTo, setProfileMovingTo] = useState('Bengaluru');

  useEffect(() => {
    return subscribeToState((newState) => {
      setState(newState);
    });
  }, []);

  const currentProperty = state.properties.find((p) => p.id === selectedPGId) || state.properties[0];
  const isSaved = state.savedPropertyIds.includes(currentProperty.id);

  const handleCheckoutSubmit = () => {
    const res = createCustomerBooking({
      propertyId: currentProperty.id,
      roomType: selectedBedType,
      checkInDate: '2024-12-12',
      checkOutDate: '2024-12-19',
      nightsCount: stayNights,
      nightlyRate: selectedRate,
      paymentMethod,
    });

    if (res.success && res.booking) {
      setLastCreatedBooking(res.booking);
      setCustomerScreen('confirmation');
      setActiveTab('8');
      toast.success('Booking completed successfully!');
    } else {
      toast.error(res.error || 'Failed to complete booking');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 12-Module Sub-navigation */}
      <div className="bg-white border-b border-[#E2E8DE] sticky top-14 z-40 px-4 py-2 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 min-w-max text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-full font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-[#07552D] text-white shadow-xs'
                  : 'text-gray-600 hover:text-[#07552D] hover:bg-gray-100'
              }`}
            >
              All 12 Modules View
            </button>
            {[
              { id: '1', label: '1. Sign-in & Profile' },
              { id: '2', label: '2. Explore PGs' },
              { id: '3', label: '3. Search & Filters' },
              { id: '4', label: '4. Saved PGs' },
              { id: '5', label: '5. PG Details' },
              { id: '6', label: '6. Dates & Bed' },
              { id: '7', label: '7. Checkout' },
              { id: '8', label: '8. Confirmation' },
              { id: '9', label: '9. My Stays' },
              { id: '10', label: '10. Visits' },
              { id: '11', label: '11. Payments' },
              { id: '12', label: '12. Account & Support' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-2.5 py-1.5 rounded-full font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#D9F58B] text-[#07552D] font-bold shadow-xs'
                    : 'text-gray-600 hover:text-[#07552D] hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Viewport switch for testing mobile vs wide layout */}
          <div className="hidden lg:flex items-center gap-1 bg-gray-100 p-1 rounded-lg shrink-0">
            <button
              onClick={() => setIsMobileFrame(true)}
              className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1 ${
                isMobileFrame ? 'bg-white text-[#07552D] shadow-xs font-semibold' : 'text-gray-600'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Mobile Mockup
            </button>
            <button
              onClick={() => setIsMobileFrame(false)}
              className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1 ${
                !isMobileFrame ? 'bg-white text-[#07552D] shadow-xs font-semibold' : 'text-gray-600'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" /> Responsive Grid
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Container: If isMobileFrame, display modules in clean native-app cards */}
        <div className={isMobileFrame ? 'max-w-md mx-auto space-y-10' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'}>

          {/* ========================================================= */}
          {/* MODULE 1: Sign in & Profile Setup                         */}
          {/* ========================================================= */}
          {(activeTab === 'all' || activeTab === '1') && (
            <div id="cust-1" className="bg-white rounded-2xl border border-[#E2E8DE] p-5 shadow-card overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">01</span>
                <span className="text-xs font-bold text-gray-500">1. Sign-in & Profile Setup</span>
              </div>

              <div className="text-center mb-5">
                <div className="text-xl font-black text-[#07552D] tracking-tight">Stayzy</div>
                <h3 className="text-base font-bold text-[#202820] mt-1">Welcome to Stayzy</h3>
                <p className="text-xs text-gray-500">Book verified PGs in Bengaluru</p>
              </div>

              <div className="space-y-3.5 mb-5">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white px-3 py-2 text-xs">
                  <span className="mr-2 text-gray-700 font-medium">🇮🇳 +91</span>
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full outline-none font-medium text-gray-900"
                  />
                </div>

                <button
                  onClick={() => setOtpSent(!otpSent)}
                  className="btn-primary w-full text-xs py-2.5 rounded-lg"
                >
                  {otpSent ? 'OTP Sent (Verify 1234)' : 'Send OTP'}
                </button>

                <div className="text-center text-xs text-gray-400">or</div>

                <button
                  onClick={() => toast.info('Initiating Google OAuth authentication...')}
                  className="w-full py-2 px-3 border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-medium flex items-center justify-center gap-2 text-gray-700"
                >
                  <span className="font-bold text-blue-600">G</span> Continue with Google
                </button>
              </div>

              {/* Profile setup progress bar */}
              <div className="bg-[#F7F9F5] p-3.5 rounded-xl border border-[#E2E8DE] text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#07552D] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#07552D]" /> Profile setup (2/3)
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-700 pt-1">
                  <span>Full name</span>
                  <span className="font-semibold text-gray-900">Aarav Sharma ✓</span>
                </div>
                <div className="flex items-center justify-between text-gray-700">
                  <span>Moving to</span>
                  <span className="font-semibold text-gray-900">{profileMovingTo} ∨</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* MODULE 2: Explore PGs with Bengaluru Locality Search       */}
          {/* ========================================================= */}
          {(activeTab === 'all' || activeTab === '2') && (
            <div id="cust-2" className="bg-white rounded-2xl border border-[#E2E8DE] p-5 shadow-card overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">02</span>
                <span className="text-xs font-bold text-gray-500">2. Explore PGs</span>
              </div>

              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base text-[#202820]">Find your PG in Bengaluru</h3>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-xs bg-gray-100 p-1.5 rounded-full">🔔</span>
                  <span className="text-xs bg-gray-100 p-1.5 rounded-full">👤</span>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative mb-3">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#07552D] outline-none"
                />
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Locality Chips */}
              <div className="flex items-center gap-1.5 mb-4 overflow-x-auto no-scrollbar pb-1">
                {['HSR Layout', 'Koramangala', 'BTM Layout'].map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setSelectedLocality(loc);
                      setSearchQuery(`${loc}, Bengaluru`);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedLocality === loc
                        ? 'bg-[#D9F58B] text-[#07552D] border border-[#c4e868]'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>

              {/* Featured PG Card */}
              <div
                onClick={() => {
                  setSelectedPGId('prop-hsr-1');
                  setCustomerScreen('details');
                  setActiveTab('5');
                }}
                className="group cursor-pointer rounded-xl overflow-hidden border border-[#E2E8DE] bg-[#F7F9F5] shadow-xs hover:shadow-md transition-all"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80"
                    alt="HSR Garden PG"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveProperty('prop-hsr-1');
                    }}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        state.savedPropertyIds.includes('prop-hsr-1')
                          ? 'fill-[#07552D] text-[#07552D]'
                          : 'text-gray-600'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#202820]">HSR Garden PG</h4>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-gray-400" /> HSR Layout, Bengaluru
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm text-[#07552D]">₹700</span>
                    <span className="text-[11px] text-gray-500"> / night</span>
                  </div>
                </div>
              </div>

              {/* Bottom Nav Simulation */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-around text-[10px] font-medium text-gray-500">
                <span className="text-[#07552D] font-bold flex flex-col items-center">
                  <span>🏠</span> Explore
                </span>
                <span className="flex flex-col items-center cursor-pointer" onClick={() => setActiveTab('9')}>
                  <span>🛏️</span> My Stays
                </span>
                <span className="flex flex-col items-center cursor-pointer" onClick={() => setActiveTab('10')}>
                  <span>📅</span> Visits
                </span>
                <span className="flex flex-col items-center cursor-pointer" onClick={() => setActiveTab('11')}>
                  <span>💳</span> Payments
                </span>
                <span className="flex flex-col items-center cursor-pointer" onClick={() => setActiveTab('12')}>
                  <span>👤</span> Account
                </span>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* MODULE 3: Search Results & Filters                         */}
          {/* ========================================================= */}
          {(activeTab === 'all' || activeTab === '3') && (
            <div id="cust-3" className="bg-white rounded-2xl border border-[#E2E8DE] p-5 shadow-card overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">03</span>
                <span className="text-xs font-bold text-gray-500">3. Search Results & Filters</span>
              </div>

              <div className="mb-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <ArrowLeft className="w-3.5 h-3.5 text-gray-700" />
                  <span className="font-bold text-gray-900">PGs in HSR Layout, Bengaluru</span>
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5 pl-5">18 PGs found</div>
              </div>

              {/* Filter Row */}
              <div className="flex items-center gap-2 mb-4 text-xs overflow-x-auto pb-1">
                <button
                  onClick={() => toast.info('Open /customer/search to interact with Filter Drawer')}
                  className="px-2.5 py-1 bg-[#D9F58B] text-[#07552D] font-bold rounded-lg border border-[#c4e868] flex items-center gap-1 shrink-0"
                >
                  <SlidersHorizontal className="w-3 h-3" /> Filters (2)
                </button>
                <button className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 shrink-0">
                  Gender ∨
                </button>
                <button className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 shrink-0">
                  ₹500 – ₹1,000 ∨
                </button>
              </div>

              {/* Result PG Cards */}
              <div className="space-y-3">
                {state.properties.slice(0, 2).map((property, idx) => (
                  <div
                    key={property.id}
                    onClick={() => {
                      setSelectedPGId(property.id);
                      setActiveTab('5');
                    }}
                    className="p-3 bg-[#F7F9F5] border border-[#E2E8DE] rounded-xl flex gap-3 cursor-pointer hover:shadow-xs transition-shadow"
                  >
                    <img
                      src={property.photos[0]?.url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=200&q=80'}
                      alt={property.name}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-xs text-[#202820] truncate">{property.name}</h4>
                          <div className="text-[11px] text-gray-500 truncate">{property.locality}, Bengaluru</div>
                        </div>
                        <Heart
                          className={`w-3.5 h-3.5 shrink-0 ${
                            state.savedPropertyIds.includes(property.id)
                              ? 'fill-[#07552D] text-[#07552D]'
                              : 'text-gray-400'
                          }`}
                        />
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-gray-600 mt-1">
                        <span className="text-amber-500">★</span>
                        <span className="font-semibold">{property.rating}</span>
                        <span className="text-gray-400">({property.reviewCount})</span>
                      </div>

                      <div className="flex items-center justify-between mt-1 pt-1 border-t border-gray-200">
                        <div className="text-[10px] text-gray-500 flex gap-2">
                          <span>Wi-Fi</span>
                          <span>Meals</span>
                          <span>Laundry</span>
                        </div>
                        <div className="text-xs font-bold text-[#07552D]">
                          ₹{property.basePricePerNight} <span className="text-[10px] font-normal text-gray-500">/ night</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* MODULE 4: Saved PGs                                       */}
          {/* ========================================================= */}
          {(activeTab === 'all' || activeTab === '4') && (
            <div id="cust-4" className="bg-white rounded-2xl border border-[#E2E8DE] p-5 shadow-card overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">04</span>
                <span className="text-xs font-bold text-gray-500">4. Saved PGs ({state.savedPropertyIds.length})</span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <ArrowLeft className="w-4 h-4 text-gray-700" />
                <h3 className="font-bold text-sm text-[#202820]">Saved PGs ({state.savedPropertyIds.length})</h3>
              </div>

              <div className="space-y-3">
                {state.properties
                  .filter((p) => state.savedPropertyIds.includes(p.id))
                  .map((prop) => (
                    <div key={prop.id} className="p-3 bg-[#F7F9F5] border border-[#E2E8DE] rounded-xl flex gap-3">
                      <img
                        src={prop.photos[0]?.url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=200&q=80'}
                        alt={prop.name}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold text-xs text-[#202820] truncate">{prop.name}</h4>
                          <button onClick={() => toggleSaveProperty(prop.id)}>
                            <Heart className="w-3.5 h-3.5 fill-[#07552D] text-[#07552D]" />
                          </button>
                        </div>
                        <div className="text-[11px] text-gray-500">{prop.locality}, Bengaluru</div>
                        <div className="flex items-center justify-between mt-1 text-xs">
                          <span className="text-gray-600">★ {prop.rating}</span>
                          <span className="font-bold text-[#07552D]">₹{prop.basePricePerNight} / night</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* MODULE 5: PG Details with Photos & Amenities              */}
          {/* ========================================================= */}
          {(activeTab === 'all' || activeTab === '5') && (
            <div id="cust-5" className="bg-white rounded-2xl border border-[#E2E8DE] p-5 shadow-card overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">05</span>
                <span className="text-xs font-bold text-gray-500">5. PG Details</span>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4 text-gray-700" />
                  <h3 className="font-bold text-sm text-[#202820]">{currentProperty.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleSaveProperty(currentProperty.id)}>
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#07552D] text-[#07552D]' : 'text-gray-400'}`} />
                  </button>
                  <Share2 className="w-4 h-4 text-gray-600" />
                </div>
              </div>

              {/* Photo Carousel Simulation */}
              <div className="relative rounded-xl overflow-hidden mb-3 border border-gray-200">
                <img
                  src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80"
                  alt="PG Room"
                  className="w-full h-40 object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  1/8
                </div>
              </div>

              {/* Title & Star Rating */}
              <div className="mb-3">
                <h4 className="font-bold text-sm text-gray-900">{currentProperty.name}</h4>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-0.5">
                  <span>{currentProperty.address}</span>
                  <span className="font-semibold text-gray-800">★ {currentProperty.rating} ({currentProperty.reviewCount})</span>
                </div>
              </div>

              {/* Amenities Bar */}
              <div className="flex items-center justify-between text-center p-3 bg-[#F7F9F5] rounded-xl border border-[#E2E8DE] mb-4 text-[10px] font-medium text-gray-700">
                <div>
                  <Wifi className="w-4 h-4 mx-auto mb-1 text-[#07552D]" />
                  <span>Wi-Fi</span>
                </div>
                <div>
                  <Utensils className="w-4 h-4 mx-auto mb-1 text-[#07552D]" />
                  <span>Meals</span>
                </div>
                <div>
                  <Shirt className="w-4 h-4 mx-auto mb-1 text-[#07552D]" />
                  <span>Laundry</span>
                </div>
                <div>
                  <Wind className="w-4 h-4 mx-auto mb-1 text-[#07552D]" />
                  <span>AC</span>
                </div>
                <div>
                  <Shield className="w-4 h-4 mx-auto mb-1 text-[#07552D]" />
                  <span>Security</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setCustomerScreen('dates');
                  setActiveTab('6');
                }}
                className="btn-primary w-full text-xs py-2.5 rounded-lg"
              >
                Select Dates & Bed
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* MODULE 6: Select Custom Dates & Available Bed             */}
          {/* ========================================================= */}
          {(activeTab === 'all' || activeTab === '6') && (
            <div id="cust-6" className="bg-white rounded-2xl border border-[#E2E8DE] p-5 shadow-card overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">06</span>
                <span className="text-xs font-bold text-gray-500">6. Select Dates & Bed</span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <ArrowLeft className="w-4 h-4 text-gray-700" />
                <h3 className="font-bold text-sm text-[#202820]">Select Dates & Bed</h3>
              </div>

              {/* Stay Dates Box */}
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-600 mb-1.5">Your stay dates</div>
                <div className="bg-[#F1FCDF] border border-[#D9F58B] p-3 rounded-xl flex items-center gap-2 text-xs font-bold text-[#07552D]">
                  <Calendar className="w-4 h-4" />
                  <span>12 Dec – 19 Dec (7 nights)</span>
                </div>
              </div>

              {/* Available Beds List */}
              <div className="space-y-2 mb-5">
                <div className="text-xs font-bold text-gray-700">Available beds at {currentProperty.name}</div>

                {[
                  { type: 'Single Bed – Non AC', avail: 1, rate: 700 },
                  { type: 'Single Bed – AC', avail: 2, rate: 900 },
                  { type: 'Sharing (Twin) – Non AC', avail: 3, rate: 750 },
                ].map((bedOpt) => (
                  <div
                    key={bedOpt.type}
                    onClick={() => {
                      setSelectedBedType(bedOpt.type);
                      setSelectedRate(bedOpt.rate);
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                      selectedBedType === bedOpt.type
                        ? 'border-[#07552D] bg-[#F1FCDF]'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedBedType === bedOpt.type ? 'border-[#07552D]' : 'border-gray-300'
                      }`}>
                        {selectedBedType === bedOpt.type && <div className="w-2 h-2 rounded-full bg-[#07552D]" />}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{bedOpt.type}</div>
                        <div className="text-[11px] text-gray-500">{bedOpt.avail} bed available</div>
                      </div>
                    </div>
                    <div className="font-bold text-[#07552D]">
                      ₹{bedOpt.rate} <span className="text-[10px] font-normal text-gray-500">/ night</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setCustomerScreen('checkout');
                  setActiveTab('7');
                }}
                className="btn-primary w-full text-xs py-2.5 rounded-lg"
              >
                Continue to Checkout
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* MODULE 7: Checkout & Payment Breakdown                    */}
          {/* ========================================================= */}
          {(activeTab === 'all' || activeTab === '7') && (
            <div id="cust-7" className="bg-white rounded-2xl border border-[#E2E8DE] p-5 shadow-card overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">07</span>
                <span className="text-xs font-bold text-gray-500">7. Checkout & Payment</span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <ArrowLeft className="w-4 h-4 text-gray-700" />
                <h3 className="font-bold text-sm text-[#202820]">Checkout</h3>
              </div>

              {/* Property Summary */}
              <div className="bg-[#F7F9F5] p-3 rounded-xl border border-[#E2E8DE] mb-4 text-xs space-y-1">
                <div className="font-bold text-sm text-gray-900">{currentProperty.name}</div>
                <div className="text-gray-500">{currentProperty.locality}, Bengaluru</div>
                <div className="pt-2 text-gray-700 flex justify-between font-medium">
                  <span>12 Dec – 19 Dec (7 nights)</span>
                  <span>{selectedBedType}</span>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="border-t border-b border-gray-100 py-3 mb-4 text-xs space-y-1.5">
                <div className="font-bold text-gray-800">Payment Breakdown</div>
                <div className="flex justify-between text-gray-600">
                  <span>₹{selectedRate} × {stayNights} nights</span>
                  <span>₹{(selectedRate * stayNights).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-gray-900 pt-1 border-t">
                  <span>Total Payable</span>
                  <span className="text-[#07552D]">₹{(selectedRate * stayNights).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2 mb-5">
                <div
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center gap-2.5 ${
                    paymentMethod === 'UPI' ? 'border-[#07552D] bg-[#F1FCDF]' : 'border-gray-200'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'UPI' ? 'border-[#07552D]' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'UPI' && <div className="w-1.5 h-1.5 rounded-full bg-[#07552D]" />}
                  </div>
                  <span className="font-medium text-gray-900">UPI (GPay, PhonePe, Paytm)</span>
                </div>

                <div
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center gap-2.5 ${
                    paymentMethod === 'CARD' ? 'border-[#07552D] bg-[#F1FCDF]' : 'border-gray-200'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'CARD' ? 'border-[#07552D]' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'CARD' && <div className="w-1.5 h-1.5 rounded-full bg-[#07552D]" />}
                  </div>
                  <span className="font-medium text-gray-900">Card (Credit / Debit)</span>
                </div>
              </div>

              <button
                onClick={handleCheckoutSubmit}
                className="btn-primary w-full text-xs py-3 rounded-lg font-bold"
              >
                Pay ₹{(selectedRate * stayNights).toLocaleString('en-IN')}
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* MODULE 8: Booking Confirmation                            */}
          {/* ========================================================= */}
          {(activeTab === 'all' || activeTab === '8') && (
            <div id="cust-8" className="bg-white rounded-2xl border border-[#E2E8DE] p-5 shadow-card overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">08</span>
                <span className="text-xs font-bold text-gray-500">8. Booking Confirmation</span>
              </div>

              <div className="text-center py-4 space-y-2">
                <div className="w-14 h-14 rounded-full bg-green-100 text-[#07552D] flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-black text-lg text-[#07552D]">Booking Confirmed!</h3>
                <p className="text-xs text-gray-600">
                  Your stay at <span className="font-bold">{currentProperty.name}</span> is confirmed.
                </p>
              </div>

              {/* Confirmed Stay Card */}
              <div className="bg-[#F7F9F5] p-3.5 rounded-xl border border-[#E2E8DE] mb-4 text-xs space-y-2">
                <div className="font-bold text-gray-900">{currentProperty.name}</div>
                <div className="text-gray-500">{currentProperty.locality}, Bengaluru</div>
                <div className="flex justify-between pt-2 border-t text-gray-700">
                  <span>📅 12 Dec – 19 Dec (7 nights)</span>
                  <span className="font-semibold">{selectedBedType}</span>
                </div>
                <div className="pt-2 border-t flex items-center justify-between text-gray-700">
                  <span>Booking ID:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-gray-900">
                    <span>{lastCreatedBooking?.bookingNumber || 'STZ872341'}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(lastCreatedBooking?.bookingNumber || 'STZ872341');
                        toast.success('Booking ID copied!');
                      }}
                    >
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setCustomerScreen('stays');
                  setActiveTab('9');
                }}
                className="btn-primary w-full text-xs py-2.5 rounded-lg"
              >
                View My Stay
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* MODULE 9: My Stays (Change Dates, Extend & Cancel)        */}
          {/* ========================================================= */}
          {(activeTab === 'all' || activeTab === '9') && (
            <div id="cust-9" className="bg-white rounded-2xl border border-[#E2E8DE] p-5 shadow-card overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">09</span>
                <span className="text-xs font-bold text-gray-500">9. My Stays</span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <ArrowLeft className="w-4 h-4 text-gray-700" />
                <h3 className="font-bold text-sm text-[#202820]">My Stays</h3>
              </div>

              {/* Stays Tabs */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg mb-4 text-xs font-semibold">
                <button
                  onClick={() => setMyStaysTab('current')}
                  className={`flex-1 py-1 rounded-md text-center ${
                    myStaysTab === 'current' ? 'bg-[#D9F58B] text-[#07552D] shadow-xs' : 'text-gray-600'
                  }`}
                >
                  Current (1)
                </button>
                <button
                  onClick={() => setMyStaysTab('upcoming')}
                  className={`flex-1 py-1 rounded-md text-center ${
                    myStaysTab === 'upcoming' ? 'bg-[#D9F58B] text-[#07552D] shadow-xs' : 'text-gray-600'
                  }`}
                >
                  Upcoming (0)
                </button>
                <button
                  onClick={() => setMyStaysTab('past')}
                  className={`flex-1 py-1 rounded-md text-center ${
                    myStaysTab === 'past' ? 'bg-[#D9F58B] text-[#07552D] shadow-xs' : 'text-gray-600'
                  }`}
                >
                  Past (2)
                </button>
              </div>

              {/* Ongoing Stay Card */}
              <div className="bg-[#F7F9F5] p-3.5 rounded-xl border border-[#E2E8DE] text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900">HSR Garden PG</span>
                  <span className="badge-active">Ongoing</span>
                </div>
                <div className="text-gray-500">HSR Layout, Bengaluru</div>
                <div className="flex items-center justify-between text-gray-700 font-medium">
                  <span>12 Dec – 19 Dec (7 nights)</span>
                  <span>Single Bed Non AC</span>
                </div>

                {/* Stays Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => toast.info('Open /customer/stays to launch interactive Date Revision Modal')}
                    className="flex-1 py-1.5 px-2 bg-white border border-gray-300 hover:bg-gray-50 rounded text-center text-gray-700 font-medium"
                  >
                    Change Dates
                  </button>
                  <button
                    onClick={() => {
                      extendStay('bkg-1', 7);
                      toast.success('Stay extended by 7 nights!');
                    }}
                    className="flex-1 py-1.5 px-2 bg-[#D9F58B] text-[#07552D] font-bold rounded text-center hover:bg-[#cbf06f]"
                  >
                    + Extend
                  </button>
                  <button
                    onClick={() => {
                      cancelBooking('bkg-1');
                      toast.success('Booking cancelled. Refund request sent to Admin.');
                    }}
                    className="py-1.5 px-2 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 rounded text-center font-medium"
                  >
                    ✕ Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* MODULE 10: Visits with Schedule / Reschedule              */}
          {/* ========================================================= */}
          {(activeTab === 'all' || activeTab === '10') && (
            <div id="cust-10" className="bg-white rounded-2xl border border-[#E2E8DE] p-5 shadow-card overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">10</span>
                <span className="text-xs font-bold text-gray-500">10. Visits</span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <ArrowLeft className="w-4 h-4 text-gray-700" />
                <h3 className="font-bold text-sm text-[#202820]">Visits</h3>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg mb-4 text-xs font-semibold">
                <button
                  onClick={() => setVisitsTab('upcoming')}
                  className={`flex-1 py-1 rounded-md text-center ${
                    visitsTab === 'upcoming' ? 'bg-[#D9F58B] text-[#07552D] shadow-xs' : 'text-gray-600'
                  }`}
                >
                  Upcoming (1)
                </button>
                <button
                  onClick={() => setVisitsTab('past')}
                  className={`flex-1 py-1 rounded-md text-center ${
                    visitsTab === 'past' ? 'bg-[#D9F58B] text-[#07552D] shadow-xs' : 'text-gray-600'
                  }`}
                >
                  Past (3)
                </button>
              </div>

              {/* Scheduled Visit Card */}
              <div className="bg-[#F7F9F5] p-3.5 rounded-xl border border-[#E2E8DE] text-xs space-y-3 mb-4">
                <div className="font-bold text-sm text-gray-900">HSR Garden PG</div>
                <div className="text-gray-500">HSR Layout, Bengaluru</div>
                <div className="flex items-center justify-between text-gray-700 font-medium">
                  <span>Visit: 10 Dec, Tue @ 3:00 PM</span>
                  <span className="badge-lime">Scheduled</span>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t">
                  <button
                    onClick={() => toast.info('Open /customer/visits to reschedule appointment with date picker')}
                    className="btn-primary flex-1 py-1.5 text-xs"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => {
                      updateVisitStatus('vis-1', 'CANCELLED', 'Aarav Sharma', 'CUSTOMER');
                      toast.success('Visit cancelled');
                    }}
                    className="btn-secondary py-1.5 px-3 text-xs text-rose-700 border-rose-200"
                  >
                    ✕ Cancel Visit
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  scheduleVisit('prop-hsr-1', '14 Dec, Sat @ 11:00 AM');
                  toast.success('Scheduled new visit for 14 Dec, 11:00 AM!');
                }}
                className="btn-secondary w-full text-xs py-2 rounded-lg"
              >
                + Schedule Another Visit
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* MODULE 11: Payments, Receipts & Refund Tracking           */}
          {/* ========================================================= */}
          {(activeTab === 'all' || activeTab === '11') && (
            <div id="cust-11" className="bg-white rounded-2xl border border-[#E2E8DE] p-5 shadow-card overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">11</span>
                <span className="text-xs font-bold text-gray-500">11. Payments & Refunds</span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <ArrowLeft className="w-4 h-4 text-gray-700" />
                <h3 className="font-bold text-sm text-[#202820]">Payments</h3>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg mb-4 text-xs font-semibold">
                <button
                  onClick={() => setPaymentsTab('all')}
                  className={`flex-1 py-1 rounded-md text-center ${
                    paymentsTab === 'all' ? 'bg-[#D9F58B] text-[#07552D] shadow-xs' : 'text-gray-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setPaymentsTab('receipts')}
                  className={`flex-1 py-1 rounded-md text-center ${
                    paymentsTab === 'receipts' ? 'bg-[#D9F58B] text-[#07552D] shadow-xs' : 'text-gray-600'
                  }`}
                >
                  Receipts
                </button>
                <button
                  onClick={() => setPaymentsTab('refunds')}
                  className={`flex-1 py-1 rounded-md text-center ${
                    paymentsTab === 'refunds' ? 'bg-[#D9F58B] text-[#07552D] shadow-xs' : 'text-gray-600'
                  }`}
                >
                  Refunds
                </button>
              </div>

              <div className="space-y-3">
                {/* Stay Payment Card */}
                <div className="p-3 bg-[#F7F9F5] rounded-xl border border-[#E2E8DE] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">Stay @ HSR Garden PG</span>
                    <span className="badge-active">₹4,900 Paid</span>
                  </div>
                  <div className="text-gray-500">12 Dec – 19 Dec (7 nights)</div>
                </div>

                {/* Receipt Download Card */}
                <div className="p-3 bg-[#F7F9F5] rounded-xl border border-[#E2E8DE] text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-900">Receipt INV-872341</div>
                    <div className="text-gray-500">Tax Invoice • PDF</div>
                  </div>
                  <button
                    onClick={() => toast.success('Downloading official tax invoice PDF for INV-872341...')}
                    className="btn-secondary py-1 px-3 text-xs flex items-center gap-1 font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>

                {/* Refund Status Card */}
                <div className="p-3 bg-[#FFFBEB] rounded-xl border border-amber-200 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-amber-950">Refund: Cancellation</div>
                    <div className="text-amber-800 text-[11px]">Processing to UPI source account</div>
                  </div>
                  <span className="badge-pending">₹4,900 Processing</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* MODULE 12: Account & Support Tickets                      */}
          {/* ========================================================= */}
          {(activeTab === 'all' || activeTab === '12') && (
            <div id="cust-12" className="bg-white rounded-2xl border border-[#E2E8DE] p-5 shadow-card overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">12</span>
                <span className="text-xs font-bold text-gray-500">12. Account & Support</span>
              </div>

              <div className="flex items-center gap-3 p-3.5 bg-[#F7F9F5] rounded-xl border border-[#E2E8DE] mb-4">
                <div className="w-12 h-12 rounded-full bg-[#D9F58B] text-[#07552D] font-bold flex items-center justify-center text-sm">
                  AS
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Aarav Sharma</h4>
                  <div className="text-xs text-gray-500">+91 98765 43210</div>
                </div>
              </div>

              {/* Menu items */}
              <div className="divide-y divide-gray-100 text-xs">
                <div
                  onClick={() => toast.info('Open /customer/account to edit profile and view KYC details')}
                  className="py-3 px-1 flex items-center justify-between cursor-pointer hover:text-[#07552D]"
                >
                  <span className="flex items-center gap-2 text-gray-800">
                    <User className="w-4 h-4 text-gray-500" /> My Profile
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>

                <div
                  onClick={() => {
                    createSupportTicket('Wi-Fi issue', 'prop-hsr-1', 'Wi-Fi slow in Room A-101', 'HIGH');
                    toast.success('Support ticket created!');
                  }}
                  className="py-3 px-1 flex items-center justify-between cursor-pointer hover:text-[#07552D]"
                >
                  <span className="flex items-center gap-2 text-gray-800">
                    <HelpCircle className="w-4 h-4 text-gray-500" /> Support Tickets
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="badge-pending">1 Open</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div
                  onClick={() => toast.info('Stayzy 24/7 Helpline: 1800-STAYZY-HELP')}
                  className="py-3 px-1 flex items-center justify-between cursor-pointer hover:text-[#07552D]"
                >
                  <span className="flex items-center gap-2 text-gray-800">
                    <HelpCircle className="w-4 h-4 text-gray-500" /> Help & Support
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>

                <div
                  onClick={() => toast.success('Signed out successfully')}
                  className="py-3 px-1 flex items-center justify-between cursor-pointer text-rose-600 font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

