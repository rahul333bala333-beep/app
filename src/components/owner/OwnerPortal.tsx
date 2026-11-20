'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  BedDouble,
  Users,
  Calendar,
  CreditCard,
  Wrench,
  CheckCircle2,
  Clock,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  Eye,
  EyeOff,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  Check,
  AlertCircle,
} from 'lucide-react';
import {
  getState,
  subscribeToState,
  togglePropertyListing,
  savePropertyDetails,
  checkInResident,
  checkOutResident,
  assignBedToBooking,
  updateVisitStatus,
  assignTicket,
  updateTicketResolution,
  createMaintenanceBlock,
  requestOwnerPayout,
  recordAuditLog,
} from '@/lib/store';
import { Booking, Property, Room, Bed } from '@/lib/types';
import { toast } from '../ui/Toast';

export default function OwnerPortal() {
  const [state, setState] = useState(getState());
  const [activeTab, setActiveTab] = useState<'all' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12'>('all');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('prop-hsr-1');

  // Interactive Form & Modal States
  const [showPassword, setShowPassword] = useState(false);
  const [editPGTab, setEditPGTab] = useState<'info' | 'photos' | 'amenities' | 'listing'>('photos');
  const [moveBedBooking, setMoveBedBooking] = useState<Booking | null>(null);
  const [targetRoomId, setTargetRoomId] = useState<string>('');
  const [targetBedId, setTargetBedId] = useState<string>('');
  const [residentTab, setResidentTab] = useState<'inhouse' | 'past'>('inhouse');
  const [visitTab, setVisitTab] = useState<'pending' | 'approved' | 'rescheduled'>('pending');
  const [collectionsTab, setCollectionsTab] = useState<'collections' | 'payouts'>('collections');
  const [supportTab, setSupportTab] = useState<'open' | 'assigned' | 'closed'>('open');
  const [assignTechnicianTicketId, setAssignTechnicianTicketId] = useState<string | null>(null);
  const [technicianName, setTechnicianName] = useState('Ramesh Sharma (Plumber)');

  useEffect(() => {
    return subscribeToState((newState) => {
      setState(newState);
    });
  }, []);

  const currentPG = state.properties.find((p) => p.id === selectedPropertyId) || state.properties[0];
  const pgRooms = state.rooms.filter((r) => r.propertyId === currentPG.id);
  const totalPGBeds = pgRooms.reduce((acc, r) => acc + r.beds.length, 0);
  const occupiedPGBeds = pgRooms.reduce((acc, r) => acc + r.beds.filter((b) => b.status === 'OCCUPIED').length, 0);
  const availablePGBeds = totalPGBeds - occupiedPGBeds;
  const occupancyPercentage = totalPGBeds > 0 ? Math.round((occupiedPGBeds / totalPGBeds) * 100) : 81;

  const handleMoveBedSubmit = () => {
    if (!moveBedBooking || !targetRoomId || !targetBedId) return;
    const res = assignBedToBooking(moveBedBooking.id, targetRoomId, targetBedId, 'Rakesh Kumar', 'OWNER');
    if (res.success) {
      setMoveBedBooking(null);
      setTargetRoomId('');
      setTargetBedId('');
      toast.success('Bed assignment moved successfully');
    } else {
      toast.error(res.error || 'Failed to move bed');
    }
  };

  return (
    <div className="space-y-8 pb-16">
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
              { id: '1', label: '1. Sign-in & Verify' },
              { id: '2', label: '2. Portfolio' },
              { id: '3', label: '3. My PGs' },
              { id: '4', label: '4. Add/Edit PG' },
              { id: '5', label: '5. Rooms & Beds' },
              { id: '6', label: '6. Calendar' },
              { id: '7', label: '7. Rates & Rules' },
              { id: '8', label: '8. Booking Details' },
              { id: '9', label: '9. Residents' },
              { id: '10', label: '10. Visit Requests' },
              { id: '11', label: '11. Collections' },
              { id: '12', label: '12. Maintenance' },
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* ========================================================= */}
        {/* MODULE 1: Owner Sign-in & Verification                   */}
        {/* ========================================================= */}
        {(activeTab === 'all' || activeTab === '1') && (
          <section id="owner-mod-1" className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">01</span>
                <h2 className="text-lg font-bold text-[#202820]">1. Owner Sign-in & Verification</h2>
              </div>
              <span className="text-xs bg-gray-100 text-gray-600 font-mono px-2 py-0.5 rounded">Stayzy / PG Owner</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Sign In Box */}
              <div className="bg-[#F7F9F5] p-5 rounded-lg border border-[#E2E8DE]">
                <h3 className="text-base font-bold text-[#202820] mb-0.5">Owner Sign In</h3>
                <p className="text-xs text-gray-500 mb-4">Manage your PGs on Stayzy</p>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-3.5">
                  <div>
                    <input
                      type="email"
                      defaultValue="owner@hsrgardenpg.com"
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-[#07552D] outline-none"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      defaultValue="••••••••"
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-[#07552D] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button type="button" className="btn-primary w-full text-xs py-2">
                    Sign In
                  </button>
                  <div className="text-center">
                    <button type="button" className="text-xs text-gray-500 hover:text-gray-800">
                      or Continue with OTP
                    </button>
                  </div>
                </form>
              </div>

              {/* Verified Status Card */}
              <div className="bg-[#F1FCDF] border border-[#D9F58B] p-5 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#07552D] text-[#D9F58B] flex items-center justify-center font-bold">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#07552D]">Owner Verified</div>
                      <div className="text-xs text-gray-700 font-medium">{currentPG.name}</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-gray-700 bg-white/70 p-3.5 rounded-lg border border-[#D9F58B]">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#07552D] font-bold" />
                      <span>Identity Verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#07552D] font-bold" />
                      <span>Property Ownership</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#07552D] font-bold" />
                      <span>Business Details</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-[#07552D] font-medium mt-3">
                  Verified on 10 Dec 2024
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* MODULE 2: Portfolio Overview with Occupancy              */}
        {/* ========================================================= */}
        {(activeTab === 'all' || activeTab === '2') && (
          <section id="owner-mod-2" className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 mb-6 gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">02</span>
                <h2 className="text-lg font-bold text-[#202820]">2. Portfolio Overview with Occupancy</h2>
              </div>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none"
              >
                <option value="prop-hsr-1">All PGs (3)</option>
                {state.properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#F7F9F5] p-4 rounded-lg border border-[#E2E8DE]">
                <div className="text-xs text-gray-500">Total PGs</div>
                <div className="text-2xl font-black text-gray-900 mt-1">3 <span className="text-xs font-normal text-gray-500">PGs</span></div>
              </div>
              <div className="bg-[#F7F9F5] p-4 rounded-lg border border-[#E2E8DE]">
                <div className="text-xs text-gray-500">Total Beds</div>
                <div className="text-2xl font-black text-gray-900 mt-1">78 <span className="text-xs font-normal text-gray-500">Beds</span></div>
              </div>
              <div className="bg-[#F7F9F5] p-4 rounded-lg border border-[#E2E8DE]">
                <div className="text-xs text-gray-500">Occupied</div>
                <div className="text-2xl font-black text-[#07552D] mt-1">63 <span className="text-xs font-normal text-gray-500">Beds</span></div>
              </div>
              <div className="bg-[#F1FCDF] p-4 rounded-lg border border-[#D9F58B]">
                <div className="text-xs text-[#07552D] font-semibold">Occupancy Rate</div>
                <div className="text-2xl font-black text-[#07552D] mt-1">81%</div>
              </div>
            </div>

            {/* Property Row Preview */}
            <div className="border border-[#E2E8DE] rounded-lg p-4 bg-[#F7F9F5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=150&q=80"
                  alt="HSR Garden PG"
                  className="w-14 h-14 object-cover rounded-md border"
                />
                <div>
                  <h4 className="font-bold text-sm text-gray-900">HSR Garden PG</h4>
                  <div className="text-xs text-gray-600 mt-0.5">64 Beds • 52 Occupied</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-[#07552D]">81%</span>
                <span className="text-xs text-gray-500 block">Occupancy</span>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* MODULE 3: My PGs & Listing Status                        */}
        {/* ========================================================= */}
        {(activeTab === 'all' || activeTab === '3') && (
          <section id="owner-mod-3" className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 mb-6 gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">03</span>
                <h2 className="text-lg font-bold text-[#202820]">3. My PGs & Listing Status</h2>
              </div>
              <button onClick={() => toast.info('Navigate to /owner/properties/add to add new PG')} className="btn-primary text-xs py-1.5 px-3">
                <Plus className="w-3.5 h-3.5" /> Add PG
              </button>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F7F9F5] text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">PG Name</th>
                    <th className="py-2.5 px-4 font-semibold">Beds</th>
                    <th className="py-2.5 px-4 font-semibold">Occupancy</th>
                    <th className="py-2.5 px-4 font-semibold">Listing</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {state.properties.slice(0, 3).map((property, idx) => {
                    const bedsCount = idx === 0 ? 64 : idx === 1 ? 10 : 4;
                    const occRate = idx === 0 ? '81%' : idx === 1 ? '70%' : '50%';
                    return (
                      <tr key={property.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-bold text-gray-900">{property.name}</td>
                        <td className="py-3 px-4 text-gray-700">{bedsCount}</td>
                        <td className="py-3 px-4 font-semibold text-[#07552D]">{occRate}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => togglePropertyListing(property.id)}
                            className={property.status === 'LISTED' ? 'badge-active' : 'badge-pending'}
                          >
                            {property.status === 'LISTED' ? 'Listed' : 'Unlisted'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => toast.info(`Settings for ${property.name}`)}
                            className="p-1 hover:bg-gray-100 rounded text-gray-600"
                          >
                            •••
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* MODULE 4: Add or Edit PG (Photos & Amenities)            */}
        {/* ========================================================= */}
        {(activeTab === 'all' || activeTab === '4') && (
          <section id="owner-mod-4" className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">04</span>
                <h2 className="text-lg font-bold text-[#202820]">4. Add or Edit PG – Photos & Amenities</h2>
              </div>
              <span className="text-xs font-semibold text-[#07552D]">Edit PG – {currentPG.name}</span>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-200 mb-5">
              {[
                { id: 'info', label: 'Basic Info' },
                { id: 'photos', label: 'Photos' },
                { id: 'amenities', label: 'Amenities' },
                { id: 'listing', label: 'Listing' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setEditPGTab(tab.id as any)}
                  className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-all ${
                    editPGTab === tab.id
                      ? 'border-[#07552D] text-[#07552D]'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Photos Tab */}
            {editPGTab === 'photos' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {currentPG.photos.slice(0, 3).map((ph, idx) => (
                    <div key={ph.id} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-video">
                      <img src={ph.url} alt={ph.caption || 'PG'} className="w-full h-full object-cover" />
                      <button
                        onClick={() => toast.success('Photo removed')}
                        className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => toast.info('Open /owner/properties/[id]/edit to manage photos')}
                    className="border-2 border-dashed border-gray-300 hover:border-[#07552D] rounded-lg aspect-video flex flex-col items-center justify-center text-xs text-gray-500 hover:text-[#07552D] transition-colors"
                  >
                    <Plus className="w-5 h-5 mb-1" />
                    <span>Add Photo</span>
                  </button>
                </div>

                {/* Amenities checklist */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-xs font-bold text-gray-700 mb-2">Amenities (selected)</div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {['Wi-Fi', 'Meals', 'Laundry', 'AC', 'Housekeeping', '24x7 Security'].map((am) => (
                      <span key={am} className="badge-lime font-medium">
                        ✓ {am}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4">
                  <button type="button" className="btn-secondary text-xs py-1.5 px-4">Cancel</button>
                  <button
                    type="button"
                    onClick={() => toast.success('Property photos & amenities saved!')}
                    className="btn-primary text-xs py-1.5 px-4"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Basic Info Tab */}
            {editPGTab === 'info' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">PG Title</label>
                  <input
                    type="text"
                    defaultValue={currentPG.name}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    defaultValue={currentPG.address}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            )}
          </section>
        )}

        {/* ========================================================= */}
        {/* MODULE 5: Rooms & Beds Inventory                         */}
        {/* ========================================================= */}
        {(activeTab === 'all' || activeTab === '5') && (
          <section id="owner-mod-5" className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 mb-6 gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">05</span>
                <h2 className="text-lg font-bold text-[#202820]">5. Rooms & Beds Inventory</h2>
              </div>
              <span className="text-xs text-gray-600 font-semibold">{currentPG.name} – Rooms & Beds</span>
            </div>

            {/* Metric statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#F7F9F5] p-3.5 rounded-lg border text-center">
                <div className="text-xs text-gray-500">Rooms</div>
                <div className="text-xl font-black text-gray-900 mt-0.5">16</div>
              </div>
              <div className="bg-[#F7F9F5] p-3.5 rounded-lg border text-center">
                <div className="text-xs text-gray-500">Total Beds</div>
                <div className="text-xl font-black text-gray-900 mt-0.5">64</div>
              </div>
              <div className="bg-[#F7F9F5] p-3.5 rounded-lg border text-center">
                <div className="text-xs text-gray-500">Occupied</div>
                <div className="text-xl font-black text-[#07552D] mt-0.5">52</div>
              </div>
              <div className="bg-[#F1FCDF] p-3.5 rounded-lg border text-center">
                <div className="text-xs text-[#07552D] font-semibold">Available</div>
                <div className="text-xl font-black text-[#07552D] mt-0.5">12</div>
              </div>
            </div>

            {/* Room Breakdown Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F7F9F5] text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Room</th>
                    <th className="py-2.5 px-4 font-semibold">Type</th>
                    <th className="py-2.5 px-4 font-semibold">Total Beds</th>
                    <th className="py-2.5 px-4 font-semibold">Occupied</th>
                    <th className="py-2.5 px-4 font-semibold">Available</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold text-gray-900">101</td>
                    <td className="py-3 px-4 text-gray-600">3 Sharing</td>
                    <td className="py-3 px-4">3</td>
                    <td className="py-3 px-4 font-semibold text-[#07552D]">3</td>
                    <td className="py-3 px-4 font-semibold text-gray-400">0</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold text-gray-900">102</td>
                    <td className="py-3 px-4 text-gray-600">3 Sharing</td>
                    <td className="py-3 px-4">3</td>
                    <td className="py-3 px-4 font-semibold text-[#07552D]">2</td>
                    <td className="py-3 px-4 font-semibold text-amber-700">1</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold text-gray-900">103</td>
                    <td className="py-3 px-4 text-gray-600">2 Sharing</td>
                    <td className="py-3 px-4">2</td>
                    <td className="py-3 px-4 font-semibold text-[#07552D]">2</td>
                    <td className="py-3 px-4 font-semibold text-gray-400">0</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold text-gray-900">104</td>
                    <td className="py-3 px-4 text-gray-600">4 Sharing</td>
                    <td className="py-3 px-4">4</td>
                    <td className="py-3 px-4 font-semibold text-[#07552D]">3</td>
                    <td className="py-3 px-4 font-semibold text-amber-700">1</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* MODULE 6: Availability Calendar (Maintenance Block)      */}
        {/* ========================================================= */}
        {(activeTab === 'all' || activeTab === '6') && (
          <section id="owner-mod-6" className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">06</span>
                <h2 className="text-lg font-bold text-[#202820]">6. Availability Calendar (Maintenance Block)</h2>
              </div>
              <span className="text-xs text-gray-600 font-semibold">{currentPG.name} – Availability</span>
            </div>

            {/* Calendar Widget */}
            <div className="bg-[#F7F9F5] p-5 rounded-lg border border-[#E2E8DE] mb-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-gray-900">Dec 2024</h3>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-white border border-gray-300"></span> Available</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#07552D]"></span> Booked</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Maintenance</span>
                </div>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <div key={d} className="font-bold text-gray-400 py-1">{d}</div>
                ))}
                {/* Blank days leading up to Dec 1 */}
                <div className="py-2 text-gray-300">25</div>
                <div className="py-2 text-gray-300">26</div>
                <div className="py-2 text-gray-300">27</div>
                <div className="py-2 text-gray-300">28</div>
                <div className="py-2 text-gray-300">29</div>
                <div className="py-2 text-gray-300">30</div>
                <div className="py-2 font-medium bg-white rounded border">1</div>

                {Array.from({ length: 30 }, (_, i) => i + 2).map((day) => {
                  const isMaintenance = day >= 12 && day <= 18;
                  const isBooked = day === 5 || day === 6 || day === 7 || day === 19 || day === 20;
                  return (
                    <div
                      key={day}
                      className={`py-2 rounded font-medium text-xs transition-colors ${
                        isMaintenance
                          ? 'bg-rose-100 text-rose-800 border border-rose-300 font-bold'
                          : isBooked
                          ? 'bg-[#07552D] text-white font-bold'
                          : 'bg-white hover:bg-gray-100 border text-gray-800'
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Maintenance Banner */}
            <div className="bg-[#FFF5F5] border border-rose-200 rounded-lg p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Wrench className="w-4 h-4 text-rose-600" />
                <div className="text-xs">
                  <span className="font-bold text-rose-900">Maintenance Block:</span>{' '}
                  <span className="text-rose-800">12 – 18 Dec 2024 (7 nights)</span>
                </div>
              </div>
              <button
                onClick={() => toast.info('Open /owner/calendar to manage maintenance blocks')}
                className="btn-secondary text-xs py-1 px-3"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* MODULE 7: Rates, Deposits & Stay Rules                   */}
        {/* ========================================================= */}
        {(activeTab === 'all' || activeTab === '7') && (
          <section id="owner-mod-7" className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">07</span>
                <h2 className="text-lg font-bold text-[#202820]">7. Rates, Deposits & Stay Rules</h2>
              </div>
              <button onClick={() => toast.info('Open /owner/pricing to edit rates and rules')} className="btn-secondary text-xs py-1 px-3">
                <Edit2 className="w-3.5 h-3.5" /> Edit Rules
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-4">
                <div className="bg-[#F7F9F5] p-4 rounded-lg border border-[#E2E8DE]">
                  <div className="text-gray-500 font-medium">Stay Rate</div>
                  <div className="text-sm font-bold text-gray-900 mt-1">12 – 19 Dec (7 nights) • ₹700 / night</div>
                  <div className="text-base font-black text-[#07552D] mt-1">Total (7 nights): ₹4,900</div>
                </div>

                <div className="bg-[#F7F9F5] p-4 rounded-lg border border-[#E2E8DE]">
                  <div className="text-gray-500 font-medium">Security Deposit</div>
                  <div className="text-base font-bold text-gray-900 mt-1">₹5,000 (Refundable at move-out)</div>
                </div>
              </div>

              {/* Stay Rules */}
              <div className="bg-[#F7F9F5] p-4 rounded-lg border border-[#E2E8DE]">
                <div className="text-gray-700 font-bold mb-3">Stay Rules & Policies</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-800">
                    <Check className="w-4 h-4 text-[#07552D]" />
                    <span>Minimum stay: 7 nights</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-800">
                    <Check className="w-4 h-4 text-[#07552D]" />
                    <span>Notice period: 7 days</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-800">
                    <Check className="w-4 h-4 text-[#07552D]" />
                    <span>No smoking inside premises</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-800">
                    <Check className="w-4 h-4 text-[#07552D]" />
                    <span>No outside guests after 9:30 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* MODULE 8: Booking Detail (Assign or Move Bed)             */}
        {/* ========================================================= */}
        {(activeTab === 'all' || activeTab === '8') && (
          <section id="owner-mod-8" className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">08</span>
                <h2 className="text-lg font-bold text-[#202820]">8. Booking Detail (Assign or Move Bed)</h2>
              </div>
              <span className="badge-active">Confirmed</span>
            </div>

            <div className="border border-[#E2E8DE] rounded-lg p-5 bg-[#F7F9F5] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-gray-900">Booking – #BK98421</h3>
                <span className="text-xs text-gray-500 font-mono">STZ-SYNC-ACTIVE</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-white p-4 rounded-lg border border-gray-200">
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-500">Customer</span>
                    <div className="font-bold text-sm text-gray-900">Rohan Kumar</div>
                    <div className="text-gray-500">rohan.k@gmail.com • +91 98765 43210</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Property</span>
                    <div className="font-semibold text-gray-800">HSR Garden PG</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-gray-500">Dates</span>
                    <div className="font-semibold text-gray-900">12 – 19 Dec 2024 (7 nights)</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Rate & Payment</span>
                    <div className="text-gray-800">₹700 / night • <span className="font-bold text-[#07552D]">Total: ₹4,900</span></div>
                  </div>
                </div>
              </div>

              {/* Bed Assignment Box */}
              <div className="bg-[#F1FCDF] border border-[#D9F58B] p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-[#07552D] font-medium">Bed Assignment</div>
                  <div className="text-sm font-bold text-[#07552D] mt-0.5">Room 102 – Bed B</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const bkg = state.bookings.find((b) => b.bookingNumber === 'BK98421') || state.bookings[4];
                      setMoveBedBooking(bkg);
                    }}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    Move Bed
                  </button>
                  <button
                    onClick={() => {
                      const bkg = state.bookings.find((b) => b.bookingNumber === 'BK98421') || state.bookings[4];
                      setMoveBedBooking(bkg);
                    }}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    Assign / Reassign
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* MODULE 9: Residents (Check-in & Check-out)               */}
        {/* ========================================================= */}
        {(activeTab === 'all' || activeTab === '9') && (
          <section id="owner-mod-9" className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 mb-6 gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">09</span>
                <h2 className="text-lg font-bold text-[#202820]">9. Residents – Check-in & Check-out</h2>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setResidentTab('inhouse')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md ${
                    residentTab === 'inhouse' ? 'bg-[#D9F58B] text-[#07552D] shadow-xs' : 'text-gray-600'
                  }`}
                >
                  In-house (52)
                </button>
                <button
                  onClick={() => setResidentTab('past')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md ${
                    residentTab === 'past' ? 'bg-[#D9F58B] text-[#07552D] shadow-xs' : 'text-gray-600'
                  }`}
                >
                  Past (108)
                </button>
              </div>
            </div>

            {/* Residents Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg mb-4">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F7F9F5] text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Resident</th>
                    <th className="py-2.5 px-4 font-semibold">Room / Bed</th>
                    <th className="py-2.5 px-4 font-semibold">Stay Dates</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-gray-900">Rohan Kumar</td>
                    <td className="py-3 px-4 text-gray-700 font-mono">102 – B</td>
                    <td className="py-3 px-4 text-gray-600">12 – 19 Dec</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          const bkg = state.bookings.find((b) => b.customerName === 'Rohan Kumar');
                          if (bkg) checkOutResident(bkg.id);
                        }}
                        className="px-2.5 py-1 text-xs font-medium border border-gray-300 hover:bg-gray-100 rounded text-gray-700"
                      >
                        Check-out
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-gray-900">Ankit Sharma</td>
                    <td className="py-3 px-4 text-gray-700 font-mono">103 – A</td>
                    <td className="py-3 px-4 text-gray-600">01 – 31 Dec</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => toast.success('Checked out Ankit Sharma')}
                        className="px-2.5 py-1 text-xs font-medium border border-gray-300 hover:bg-gray-100 rounded text-gray-700"
                      >
                        Check-out
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-gray-900">Priya Nair</td>
                    <td className="py-3 px-4 text-gray-700 font-mono">104 – C</td>
                    <td className="py-3 px-4 text-gray-600">05 – 28 Dec</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => toast.success('Checked out Priya Nair')}
                        className="px-2.5 py-1 text-xs font-medium border border-gray-300 hover:bg-gray-100 rounded text-gray-700"
                      >
                        Check-out
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const bkg = state.bookings.find((b) => !b.isCheckedIn);
                  if (bkg) {
                    checkInResident(bkg.id);
                    toast.success(`Checked in ${bkg.customerName}!`);
                  } else {
                    toast.info('All active guests are already checked in.');
                  }
                }}
                className="btn-primary text-xs py-1.5 px-4"
              >
                + Check-in Resident
              </button>
              <button onClick={() => toast.info('Open /owner/residents to perform bulk actions')} className="btn-secondary text-xs py-1.5 px-4">
                Check-out Selected
              </button>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* MODULE 10: Visit Requests (Approve or Reschedule)         */}
        {/* ========================================================= */}
        {(activeTab === 'all' || activeTab === '10') && (
          <section id="owner-mod-10" className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 mb-6 gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">10</span>
                <h2 className="text-lg font-bold text-[#202820]">10. Visit Requests (Approve or Reschedule)</h2>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setVisitTab('pending')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md ${
                    visitTab === 'pending' ? 'bg-[#D9F58B] text-[#07552D] shadow-xs' : 'text-gray-600'
                  }`}
                >
                  Pending (2)
                </button>
                <button
                  onClick={() => setVisitTab('approved')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md ${
                    visitTab === 'approved' ? 'bg-[#D9F58B] text-[#07552D] shadow-xs' : 'text-gray-600'
                  }`}
                >
                  Approved (1)
                </button>
                <button
                  onClick={() => setVisitTab('rescheduled')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md ${
                    visitTab === 'rescheduled' ? 'bg-[#D9F58B] text-[#07552D] shadow-xs' : 'text-gray-600'
                  }`}
                >
                  Rescheduled (1)
                </button>
              </div>
            </div>

            {/* Visit Cards */}
            <div className="space-y-3">
              {state.visits.slice(1, 3).map((vis) => (
                <div key={vis.id} className="border border-[#E2E8DE] rounded-lg p-4 bg-[#F7F9F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{vis.customerName}</h4>
                    <p className="text-xs text-gray-600 mt-0.5">{vis.scheduledTime}</p>
                    <p className="text-xs text-gray-500">{vis.propertyName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateVisitStatus(vis.id, 'APPROVED')}
                      className="btn-primary text-xs py-1.5 px-4"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => {
                        updateVisitStatus(vis.id, 'RESCHEDULED');
                        toast.success('Visit marked for rescheduling. Open /owner/visits for specific time slot');
                      }}
                      className="btn-secondary text-xs py-1.5 px-4"
                    >
                      Reschedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* MODULE 11: Collections & Payouts                          */}
        {/* ========================================================= */}
        {(activeTab === 'all' || activeTab === '11') && (
          <section id="owner-mod-11" className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 mb-6 gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">11</span>
                <h2 className="text-lg font-bold text-[#202820]">11. Collections & Payouts</h2>
              </div>
              <button
                onClick={() => {
                  requestOwnerPayout('user-owner-1', currentPG.id, 15000);
                  toast.success('Payout request of ₹15,000 submitted to Admin!');
                }}
                className="btn-primary text-xs py-1.5 px-4"
              >
                Request Payout
              </button>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#F7F9F5] p-4 rounded-lg border border-[#E2E8DE]">
                <div className="text-xs text-gray-500">Collected (Dec)</div>
                <div className="text-2xl font-black text-[#07552D] mt-1">₹3,43,000</div>
              </div>
              <div className="bg-[#F7F9F5] p-4 rounded-lg border border-[#E2E8DE]">
                <div className="text-xs text-gray-500">Total Payouts</div>
                <div className="text-2xl font-black text-gray-900 mt-1">₹3,28,000</div>
              </div>
              <div className="bg-[#FFFBEB] p-4 rounded-lg border border-amber-200">
                <div className="text-xs text-amber-800 font-medium">Pending Payout</div>
                <div className="text-2xl font-black text-amber-900 mt-1">₹15,000</div>
              </div>
            </div>

            {/* Collections Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F7F9F5] text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Date</th>
                    <th className="py-2.5 px-4 font-semibold">Particulars</th>
                    <th className="py-2.5 px-4 font-semibold">Amount</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {state.payouts.map((pay) => (
                    <tr key={pay.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-500">{pay.date}</td>
                      <td className="py-3 px-4 font-medium text-gray-800">{pay.particulars}</td>
                      <td className="py-3 px-4 font-bold text-gray-900">₹{pay.amount.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="badge-active">Collected</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* MODULE 12: Support & Maintenance (Assign & Close Ticket)   */}
        {/* ========================================================= */}
        {(activeTab === 'all' || activeTab === '12') && (
          <section id="owner-mod-12" className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 mb-6 gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">12</span>
                <h2 className="text-lg font-bold text-[#202820]">12. Support & Maintenance (Assign & Close Ticket)</h2>
              </div>
              <button onClick={() => toast.info('Open /owner/support to submit new maintenance ticket')} className="btn-primary text-xs py-1.5 px-3">
                <Plus className="w-3.5 h-3.5" /> New Ticket
              </button>
            </div>

            {/* Tickets Feed */}
            <div className="space-y-4">
              {state.supportTickets.slice(1, 3).map((tkt) => (
                <div key={tkt.id} className="border border-[#E2E8DE] rounded-lg p-4 bg-[#F7F9F5] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-xs text-gray-900">{tkt.ticketNumber}</span>
                      <h4 className="font-bold text-sm text-gray-900">{tkt.subject}</h4>
                      <span className={tkt.priority === 'HIGH' ? 'badge-issue' : 'badge-pending'}>
                        {tkt.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {tkt.propertyName} • 12 Dec 2024, 10:20 AM
                    </p>
                    {tkt.assigneeName && (
                      <p className="text-xs text-[#07552D] font-medium mt-1">
                        Assigned to: {tkt.assigneeName}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAssignTechnicianTicketId(tkt.id)}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      <Users className="w-3.5 h-3.5" /> Assign
                    </button>
                    <button
                      onClick={() => {
                        updateTicketResolution(tkt.id, 'Issue verified and repaired on site by staff.', true);
                        toast.success(`Ticket ${tkt.ticketNumber} marked closed!`);
                      }}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      <Check className="w-3.5 h-3.5" /> Close Ticket
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* ========================================================= */}
      {/* MODAL: Move Bed Dialog                                    */}
      {/* ========================================================= */}
      {moveBedBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-gray-200 overflow-hidden animate-fadeIn">
            <div className="bg-[#07552D] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Move / Reassign Bed: {moveBedBooking.customerName}</h3>
              <button onClick={() => setMoveBedBooking(null)} className="text-white text-lg font-bold">✕</button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="bg-gray-50 p-3 rounded border">
                <div>Current Assignment: <span className="font-bold">{moveBedBooking.roomNumber || '102'} – {moveBedBooking.bedName || 'Bed B'}</span></div>
                <div className="text-gray-500">Booking: {moveBedBooking.bookingNumber}</div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Select New Room</label>
                <select
                  value={targetRoomId}
                  onChange={(e) => {
                    setTargetRoomId(e.target.value);
                    setTargetBedId('');
                  }}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">-- Choose Room --</option>
                  {state.rooms.map((r) => (
                    <option key={r.id} value={r.id}>Room {r.roomNumber}</option>
                  ))}
                </select>
              </div>

              {targetRoomId && (
                <div>
                  <label className="block font-semibold mb-1">Select Available Bed</label>
                  <div className="grid grid-cols-2 gap-2">
                    {state.rooms.find((r) => r.id === targetRoomId)?.beds.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        disabled={b.status !== 'AVAILABLE'}
                        onClick={() => setTargetBedId(b.id)}
                        className={`p-2 rounded border text-left ${
                          targetBedId === b.id
                            ? 'bg-[#D9F58B] border-[#07552D] text-[#07552D] font-bold'
                            : b.status === 'AVAILABLE'
                            ? 'bg-white hover:bg-gray-50'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {b.bedNumber} ({b.status})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button onClick={() => setMoveBedBooking(null)} className="btn-secondary py-1.5 px-3 text-xs">Cancel</button>
                <button
                  disabled={!targetBedId}
                  onClick={handleMoveBedSubmit}
                  className="btn-primary py-1.5 px-4 text-xs disabled:opacity-50"
                >
                  Move Bed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Assign Technician */}
      {assignTechnicianTicketId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full border border-gray-200 overflow-hidden p-5 space-y-4">
            <h3 className="font-bold text-sm text-[#07552D]">Assign Maintenance Technician</h3>
            <div className="text-xs space-y-2">
              <label className="block font-medium text-gray-700">Technician / Specialist</label>
              <select
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className="w-full p-2 border rounded text-xs"
              >
                <option value="Ramesh Sharma (Plumber)">Ramesh Sharma (Plumber)</option>
                <option value="Kiran Gowda (Electrician)">Kiran Gowda (Electrician)</option>
                <option value="Suresh AC Specialist">Suresh (AC Specialist)</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setAssignTechnicianTicketId(null)} className="btn-secondary py-1 px-3 text-xs">Cancel</button>
              <button
                onClick={() => {
                  assignTicket(assignTechnicianTicketId, technicianName);
                  setAssignTechnicianTicketId(null);
                  toast.success(`Assigned to ${technicianName}!`);
                }}
                className="btn-primary py-1 px-3 text-xs"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

