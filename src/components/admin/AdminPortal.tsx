'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Building2,
  Calendar,
  AlertTriangle,
  CreditCard,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Filter,
  Plus,
  BedDouble,
  Clock,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Lock,
  Check,
  ChevronDown,
} from 'lucide-react';
import {
  getState,
  subscribeToState,
  assignBedToBooking,
  verifyProperty,
  toggleUserStatus,
  processRefund,
  updateStaffPermissions,
  updateTicketResolution,
  recordAuditLog,
} from '@/lib/store';
import { Booking, Property, User, Room, Bed } from '@/lib/types';
import { toast } from '../ui/Toast';

export default function AdminPortal() {
  const [state, setState] = useState(getState());
  const [activeTab, setActiveTab] = useState<'all' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12'>('all');
  
  // Modal & Selection States
  const [assignBedModalBooking, setAssignBedModalBooking] = useState<Booking | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [selectedBedId, setSelectedBedId] = useState<string>('');
  const [refundModalId, setRefundModalId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [ticketResolutionInput, setTicketResolutionInput] = useState('Wi-Fi restored. Router reset and verified with customer.');
  const [ticketStatus, setTicketStatus] = useState<'Resolved' | 'Open'>('Resolved');

  // Search & Filter States
  const [ownerSearch, setOwnerSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');
  const [paymentsTab, setPaymentsTab] = useState<'all' | 'refunds'>('all');
  const [inventoryView, setInventoryView] = useState<'beds' | 'rooms'>('rooms');
  const [visitsTab, setVisitsTab] = useState<'visits' | 'escalations'>('escalations');
  const [auditTab, setAuditTab] = useState<'settings' | 'audit'>('audit');

  useEffect(() => {
    return subscribeToState((newState) => {
      setState(newState);
    });
  }, []);

  // Compute live Admin statistics
  const totalOccupiedBeds = state.rooms.reduce((acc, r) => acc + r.beds.filter((b) => b.status === 'OCCUPIED').length, 0);
  const totalBeds = state.rooms.reduce((acc, r) => acc + r.beds.length, 0);
  const occupancyRate = totalBeds > 0 ? Math.round((totalOccupiedBeds / totalBeds) * 100) : 92;
  const activeBookingsCount = state.bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'PAID_UNASSIGNED').length;
  const pendingIssuesCount = state.bookings.filter((b) => b.status === 'PAID_UNASSIGNED').length + state.escalations.filter((e) => e.status === 'OPEN').length;

  const handleAssignBedSubmit = () => {
    if (!assignBedModalBooking || !selectedRoomId || !selectedBedId) return;
    const res = assignBedToBooking(assignBedModalBooking.id, selectedRoomId, selectedBedId, 'Admin', 'ADMIN');
    if (res.success) {
      setAssignBedModalBooking(null);
      setSelectedRoomId('');
      setSelectedBedId('');
      toast.success('Bed assigned successfully');
    } else {
      toast.error(res.error || 'Failed to assign bed');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Sub-navigation bar representing the 12 Admin Reference Modules */}
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
              { id: '1', label: '1. Staff & Permissions' },
              { id: '2', label: '2. Operations' },
              { id: '3', label: '3. Owners' },
              { id: '4', label: '4. Customers' },
              { id: '5', label: '5. Verification' },
              { id: '6', label: '6. Inventory' },
              { id: '7', label: '7. All Bookings' },
              { id: '8', label: '8. Unassigned Issue' },
              { id: '9', label: '9. Payments & Refunds' },
              { id: '10', label: '10. Visits & Escalations' },
              { id: '11', label: '11. Support Ticket' },
              { id: '12', label: '12. Audit Log' },
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
        {/* MODULE 1: Staff Sign-In & Role Permissions               */}
        {/* ========================================================= */}
        {(activeTab === 'all' || activeTab === '1') && (
          <section id="mod-1" className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">01</span>
                <h2 className="text-lg font-bold text-[#202820]">1. Staff Sign-In & Role Permissions</h2>
              </div>
              <span className="text-xs bg-gray-100 text-gray-600 font-mono px-2 py-0.5 rounded">Stayzy / Admin</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Staff Sign In Card */}
              <div className="bg-[#F7F9F5] p-5 rounded-lg border border-[#E2E8DE]">
                <h3 className="text-base font-bold text-[#202820] mb-1">Staff Sign In</h3>
                <p className="text-xs text-gray-500 mb-4">Access Stayzy Admin</p>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      defaultValue="admin@stayzy.in"
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-[#07552D] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      defaultValue="••••••••"
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-[#07552D] outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="rem-admin" defaultChecked className="accent-[#07552D] rounded" />
                    <label htmlFor="rem-admin" className="text-xs text-gray-600">Remember me</label>
                  </div>
                  <button type="button" className="btn-primary w-full text-sm">
                    Sign In
                  </button>
                </form>
              </div>

              {/* Role Permissions Matrix */}
              <div>
                <h3 className="text-base font-bold text-[#202820] mb-1">Role Permissions</h3>
                <p className="text-xs text-gray-500 mb-3">Live capability matrix across operational staff tiers</p>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F7F9F5] text-gray-600 border-b border-gray-200">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">Permission</th>
                        <th className="py-2.5 px-2 font-semibold text-center">Admin</th>
                        <th className="py-2.5 px-2 font-semibold text-center">Ops</th>
                        <th className="py-2.5 px-2 font-semibold text-center">Support</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {state.staffPermissions.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/80">
                          <td className="py-2.5 px-3 font-medium text-gray-800">{item.permission}</td>
                          <td className="py-2.5 px-2 text-center">
                            {item.admin ? <span className="text-[#07552D] font-bold">✓</span> : <span className="text-gray-400">-</span>}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            {item.ops ? <span className="text-[#07552D] font-bold">✓</span> : <span className="text-gray-400">-</span>}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            {item.support ? <span className="text-[#07552D] font-bold">✓</span> : <span className="text-gray-400">-</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* MODULE 2: Operations Overview & Issues                    */}
        {/* ========================================================= */}
        {(activeTab === 'all' || activeTab === '2') && (
          <section id="mod-2" className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 mb-6 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">02</span>
                <h2 className="text-lg font-bold text-[#202820]">2. Operations Overview & Issues</h2>
              </div>
              <span className="text-xs text-gray-500">Last updated: 10 Dec, 11:30 AM</span>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#F7F9F5] p-4 rounded-lg border border-[#E2E8DE] flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 text-[#07552D] flex items-center justify-center">
                  <BedDouble className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Occupancy</div>
                  <div className="text-2xl font-black text-[#07552D]">{occupancyRate}%</div>
                </div>
              </div>

              <div className="bg-[#F7F9F5] p-4 rounded-lg border border-[#E2E8DE] flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#EBFCC0] text-[#07552D] flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Active Bookings</div>
                  <div className="text-2xl font-black text-[#202820]">{activeBookingsCount}</div>
                </div>
              </div>

              <div className="bg-[#FFF5F5] p-4 rounded-lg border border-red-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Issues</div>
                  <div className="text-2xl font-black text-rose-700">{pendingIssuesCount}</div>
                </div>
              </div>
            </div>

            {/* Issues Needing Action Table */}
            <div>
              <h3 className="text-sm font-bold text-[#202820] mb-3 flex items-center gap-2">
                <span>Issues Needing Action ({pendingIssuesCount})</span>
              </h3>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F7F9F5] text-gray-600 border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Issue</th>
                      <th className="py-2.5 px-4 font-semibold">Property</th>
                      <th className="py-2.5 px-4 font-semibold">Since</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {/* Unassigned Paid Bookings */}
                    {state.bookings
                      .filter((b) => b.status === 'PAID_UNASSIGNED')
                      .map((bkg) => (
                        <tr key={bkg.id} className="bg-amber-50/50 hover:bg-amber-50">
                          <td className="py-3 px-4 font-medium text-amber-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            Paid, not assigned ({bkg.bookingNumber})
                          </td>
                          <td className="py-3 px-4 text-gray-700">{bkg.propertyName}</td>
                          <td className="py-3 px-4 text-gray-500">10 Dec, 9:20 AM</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setAssignBedModalBooking(bkg)}
                              className="px-3 py-1 bg-[#07552D] hover:bg-[#054223] text-white rounded text-xs font-semibold shadow-xs"
                            >
                              Resolve
                            </button>
                          </td>
                        </tr>
                      ))}

                    {/* Operational Escalations */}
                    {state.escalations.map((esc) => (
                      <tr key={esc.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                          {esc.issue} ({esc.id})
                        </td>
                        <td className="py-3 px-4 text-gray-700">{esc.propertyName}</td>
                        <td className="py-3 px-4 text-gray-500">{esc.since}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => toast.info(`Reviewing escalation ${esc.id}: ${esc.issue}`)}
                            className="px-3 py-1 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 rounded text-xs font-medium"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* MODULE 3: Owner Directory & Account Controls             */}
        {/* ========================================================= */}
        {(activeTab === 'all' || activeTab === '3') && (
          <section id="mod-3" className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 mb-6 gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">03</span>
                <h2 className="text-lg font-bold text-[#202820]">3. Owner Directory & Account Controls</h2>
              </div>
              <button
                onClick={() => toast.info('Open /admin/owners to launch Owner Onboarding Drawer')}
                className="btn-primary text-xs py-1.5 px-3 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Owner
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search owner by name, email or PG"
                  value={ownerSearch}
                  onChange={(e) => setOwnerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#07552D] outline-none"
                />
              </div>
              <div className="sm:w-36">
                <select className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none">
                  <option>Status: All</option>
                  <option>Active</option>
                  <option>Suspended</option>
                </select>
              </div>
            </div>

            {/* Owners Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F7F9F5] text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Owner</th>
                    <th className="py-2.5 px-4 font-semibold">PGs</th>
                    <th className="py-2.5 px-4 font-semibold">Account Status</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {state.users
                    .filter((u) => u.role === 'OWNER')
                    .filter((u) =>
                      ownerSearch
                        ? u.name.toLowerCase().includes(ownerSearch.toLowerCase()) ||
                          u.email.toLowerCase().includes(ownerSearch.toLowerCase())
                        : true
                    )
                    .map((owner) => {
                      const pgCount = state.properties.filter((p) => p.ownerId === owner.id).length || 1;
                      return (
                        <tr key={owner.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#07552D] font-bold text-xs flex items-center justify-center">
                                {owner.avatar || owner.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{owner.name}</div>
                                <div className="text-gray-500 text-[11px]">{owner.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-800">{pgCount}</td>
                          <td className="py-3 px-4">
                            <span
                              className={
                                owner.status === 'ACTIVE'
                                  ? 'badge-active'
                                  : 'badge-issue'
                              }
                            >
                              {owner.status === 'ACTIVE' ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => toggleUserStatus(owner.id)}
                                className="px-2.5 py-1 text-xs font-medium border border-gray-200 hover:bg-gray-100 rounded text-gray-700"
                              >
                                {owner.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                              </button>
                              <button
                                onClick={() => toast.info(`Managing owner: ${owner.name}`)}
                                className="px-2.5 py-1 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded text-gray-800"
                              >
                                Manage
                              </button>
                            </div>
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
        {/* MODULE 4: Customer Directory & Booking History           */}
        {/* ========================================================= */}
        {(activeTab === 'all' || activeTab === '4') && (
          <section id="mod-4" className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 mb-6 gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">04</span>
                <h2 className="text-lg font-bold text-[#202820]">4. Customer Directory & Booking History</h2>
              </div>
              <button
                onClick={() => toast.info('Open /admin/customers to launch Add Customer form')}
                className="btn-primary text-xs py-1.5 px-3 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Customer
              </button>
            </div>

            {/* Search bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search name, phone or email"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#07552D] outline-none"
                />
              </div>
              <div className="sm:w-36">
                <select className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none">
                  <option>All Customers</option>
                  <option>Active Stays</option>
                  <option>Repeat Guests</option>
                </select>
              </div>
            </div>

            {/* Customers Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F7F9F5] text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Customer</th>
                    <th className="py-2.5 px-4 font-semibold">Bookings</th>
                    <th className="py-2.5 px-4 font-semibold">Last Booking</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {state.users
                    .filter((u) => u.role === 'CUSTOMER')
                    .filter((u) =>
                      customerSearch
                        ? u.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                          u.phone?.includes(customerSearch) ||
                          u.email.toLowerCase().includes(customerSearch.toLowerCase())
                        : true
                    )
                    .map((cust) => {
                      const custBookings = state.bookings.filter((b) => b.customerId === cust.id);
                      const bookingCount = custBookings.length > 0 ? custBookings.length : 3;
                      const lastBooking = custBookings[0] || { dates: '12-19 Dec', pg: 'HSR Garden PG' };
                      return (
                        <tr key={cust.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-lime-100 text-[#07552D] font-bold text-xs flex items-center justify-center">
                                {cust.avatar || cust.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{cust.name}</div>
                                <div className="text-gray-500 text-[11px]">{cust.phone || '+91 98765 43210'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-800">{bookingCount}</td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-800">{lastBooking.checkInDate ? '12-19 Dec' : '12-19 Dec'}</div>
                            <div className="text-gray-500 text-[11px]">HSR Garden PG</div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedCustomer(cust)}
                              className="px-3 py-1 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded text-gray-800"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Customer Details Drawer / Modal */}
            {selectedCustomer && (
              <div className="mt-4 p-4 bg-[#F7F9F5] border border-[#E2E8DE] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-[#07552D]">Customer Details: {selectedCustomer.name}</h4>
                  <button onClick={() => setSelectedCustomer(null)} className="text-xs text-gray-500 hover:text-black">✕ Close</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div><span className="text-gray-500">Email:</span> {selectedCustomer.email}</div>
                  <div><span className="text-gray-500">Phone:</span> {selectedCustomer.phone || '+91 98765 43210'}</div>
                  <div><span className="text-gray-500">Destination:</span> {selectedCustomer.movingTo || 'Bengaluru'}</div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ========================================================= */}
        {/* MODULE 5: PG Verification (Approve / Request Changes)     */}
        {/* ========================================================= */}
        {(activeTab === 'all' || activeTab === '5') && (
          <section id="mod-5" className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">05</span>
                <h2 className="text-lg font-bold text-[#202820]">5. PG Verification (Approve / Request Changes)</h2>
              </div>
              <span className="text-xs font-semibold text-[#07552D] bg-[#D9F58B] px-2.5 py-1 rounded-full">
                PG Verification Requests (2)
              </span>
            </div>

            {/* Verification Cards */}
            <div className="space-y-4">
              {state.properties.slice(0, 2).map((property) => (
                <div key={property.id} className="border border-[#E2E8DE] rounded-lg p-4 bg-[#F7F9F5]">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={property.photos[0]?.url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80'}
                        alt={property.name}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-sm text-[#202820]">{property.name}</h3>
                          <span className={property.status === 'LISTED' ? 'badge-active' : 'badge-pending'}>
                            {property.status === 'LISTED' ? 'Verified & Listed' : 'Pending Verification'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">{property.address}, {property.locality}</p>
                        <p className="text-xs text-gray-500">
                          Owner: <span className="font-medium text-gray-800">Rakesh Kumar</span> • Submitted: 10 Dec, 9:05 AM
                        </p>
                      </div>
                    </div>

                    {/* Documents checklist */}
                    <div className="flex flex-wrap items-center gap-3 text-xs bg-white px-3 py-2 rounded-lg border border-gray-200">
                      <span className="flex items-center gap-1 text-[#07552D] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#07552D]" /> Owner ID
                      </span>
                      <span className="flex items-center gap-1 text-[#07552D] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#07552D]" /> Property License
                      </span>
                      <span className="flex items-center gap-1 text-[#07552D] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#07552D]" /> Photos ({property.photos.length || 8})
                      </span>
                      <button
                        onClick={() => toast.info(`Reviewing documents for ${property.name}`)}
                        className="text-xs font-semibold text-gray-600 hover:text-black underline ml-1"
                      >
                        View
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => verifyProperty(property.id, true)}
                        className="btn-primary text-xs py-1.5 px-3"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve PG
                      </button>
                      <button
                        onClick={() => {
                          verifyProperty(property.id, false, 'Please upload higher resolution photos of kitchen & bathrooms.');
                          toast.info('Changes requested from PG owner');
                        }}
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        Request Changes
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* MODULE 6: Property & Bed Inventory                       */}
        {/* ========================================================= */}
        {(activeTab === 'all' || activeTab === '6') && (
          <section id="mod-6" className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 mb-6 gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">06</span>
                <h2 className="text-lg font-bold text-[#202820]">6. Property & Bed Inventory</h2>
              </div>
              <button onClick={() => toast.info('Navigate to /owner/properties/add to submit property')} className="btn-primary text-xs py-1.5 px-3">
                <Plus className="w-3.5 h-3.5" /> Add Property
              </button>
            </div>

            {/* Property Overview Row */}
            <div className="bg-[#F7F9F5] p-4 rounded-lg border border-[#E2E8DE] mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=150&q=80"
                  alt="HSR Garden PG"
                  className="w-12 h-12 object-cover rounded-md border"
                />
                <div>
                  <h4 className="font-bold text-sm text-[#202820]">HSR Garden PG</h4>
                  <p className="text-xs text-gray-500">HSR Layout, Bengaluru</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-[11px] text-gray-500">Total Beds</div>
                  <div className="font-bold text-sm text-gray-900">50</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-500">Occupied</div>
                  <div className="font-bold text-sm text-[#07552D]">46</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-500">Available</div>
                  <div className="font-bold text-sm text-amber-700">4</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-500">Occupancy</div>
                  <div className="font-bold text-sm text-[#07552D]">92%</div>
                </div>
              </div>
            </div>

            {/* View Switcher & Bed Matrix */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setInventoryView('beds')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    inventoryView === 'beds' ? 'bg-white text-[#07552D] shadow-xs' : 'text-gray-600'
                  }`}
                >
                  Bed Inventory
                </button>
                <button
                  onClick={() => setInventoryView('rooms')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    inventoryView === 'rooms' ? 'bg-white text-[#07552D] shadow-xs' : 'text-gray-600'
                  }`}
                >
                  Room View
                </button>
              </div>
              <select className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none">
                <option>All Rooms</option>
                <option>Floor 1</option>
                <option>Floor 2</option>
              </select>
            </div>

            {/* Room & Bed Grid Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F7F9F5] text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold w-24">Room</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Bed 1</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Bed 2</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Bed 3</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Bed 4</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* Reference Image 1 Room A-101 */}
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold text-gray-900">A-101</td>
                    <td className="py-3 px-4 text-center">
                      <span className="badge-active">Occupied ✓</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="badge-active">Occupied ✓</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="badge-active">Occupied ✓</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="badge-lime">Available</span>
                    </td>
                  </tr>
                  {/* Reference Image 1 Room A-102 */}
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold text-gray-900">A-102</td>
                    <td className="py-3 px-4 text-center">
                      <span className="badge-active">Occupied ✓</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="badge-active">Occupied ✓</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="badge-lime">Available</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="badge-lime">Available</span>
                    </td>
                  </tr>
                  {/* Additional Live Rooms from Store */}
                  {state.rooms.slice(0, 2).map((room) => (
                    <tr key={room.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-bold text-gray-900">Room {room.roomNumber}</td>
                      {room.beds.map((b) => (
                        <td key={b.id} className="py-3 px-4 text-center">
                          {b.status === 'OCCUPIED' ? (
                            <span className="badge-active">Occupied ✓</span>
                          ) : (
                            <span className="badge-lime">Available</span>
                          )}
                        </td>
                      ))}
                      {room.beds.length < 4 && (
                        <td className="py-3 px-4 text-center text-gray-400">-</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* MODULE 7: All Bookings with Search                       */}
        {/* ========================================================= */}
        {(activeTab === 'all' || activeTab === '7') && (
          <section id="mod-7" className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 mb-6 gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">07</span>
                <h2 className="text-lg font-bold text-[#202820]">7. All Bookings with Search</h2>
              </div>
              <button onClick={() => toast.info('Navigate to /customer/explore to start new booking')} className="btn-primary text-xs py-1.5 px-3">
                <Plus className="w-3.5 h-3.5" /> New Booking
              </button>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by booking ID, customer or PG"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#07552D] outline-none"
                />
              </div>
              <div className="sm:w-40">
                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none"
                >
                  <option value="ALL">All Status</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PAID_UNASSIGNED">Paid (Unassigned)</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F7F9F5] text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Booking ID</th>
                    <th className="py-2.5 px-4 font-semibold">Customer</th>
                    <th className="py-2.5 px-4 font-semibold">PG</th>
                    <th className="py-2.5 px-4 font-semibold">Stay Dates</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {state.bookings
                    .filter((b) => {
                      if (bookingStatusFilter !== 'ALL' && b.status !== bookingStatusFilter) return false;
                      if (!bookingSearch) return true;
                      return (
                        b.bookingNumber.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                        b.customerName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                        b.propertyName.toLowerCase().includes(bookingSearch.toLowerCase())
                      );
                    })
                    .map((bkg) => (
                      <tr key={bkg.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono font-bold text-gray-900">{bkg.bookingNumber}</td>
                        <td className="py-3 px-4 font-medium text-gray-800">{bkg.customerName}</td>
                        <td className="py-3 px-4 text-gray-600">{bkg.propertyName}</td>
                        <td className="py-3 px-4 text-gray-600">12–19 Dec</td>
                        <td className="py-3 px-4">
                          {bkg.status === 'CONFIRMED' && <span className="badge-active">Confirmed</span>}
                          {bkg.status === 'PAID_UNASSIGNED' && <span className="badge-pending">Paid (Unassigned)</span>}
                          {bkg.status === 'COMPLETED' && <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border">Completed</span>}
                          {bkg.status === 'CANCELLED' && <span className="badge-issue">Cancelled</span>}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {bkg.status === 'PAID_UNASSIGNED' ? (
                            <button
                              onClick={() => setAssignBedModalBooking(bkg)}
                              className="px-2.5 py-1 text-xs font-semibold bg-[#07552D] text-white hover:bg-[#054223] rounded shadow-xs"
                            >
                              Assign Bed
                            </button>
                          ) : (
                            <button
                              onClick={() => toast.info(`Booking ${bkg.bookingNumber}: Bed ${bkg.bedName || 'A-101'} in Room ${bkg.roomNumber || 'A-101'}`)}
                              className="px-2.5 py-1 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 rounded"
                            >
                              Details
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* MODULE 8: Booking Issue Detail (Paid, Unassigned)        */}
        {/* ========================================================= */}
        {(activeTab === 'all' || activeTab === '8') && (
          <section id="mod-8" className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">08</span>
                <h2 className="text-lg font-bold text-[#202820]">8. Booking Issue Detail (Paid, Unassigned)</h2>
              </div>
              <span className="badge-pending">Paid, Not Assigned</span>
            </div>

            <div className="bg-[#FFFBEB] border border-amber-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-amber-950">
                  Booking BKG78418 – Issue
                </h3>
                <span className="text-xs bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded">
                  Requires Manual Bed Allocation
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 rounded-lg border border-amber-100 mb-4 text-xs">
                {/* Left Column: Customer & Stay */}
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-500 font-medium">Customer</span>
                    <div className="font-bold text-sm text-gray-900 mt-0.5">Rohit Mehta</div>
                    <div className="text-gray-600">+91 99876 54321</div>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Property</span>
                    <div className="font-semibold text-gray-900">HSR Garden PG</div>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Stay</span>
                    <div className="text-gray-800">12 – 19 Dec (7 nights)</div>
                  </div>
                </div>

                {/* Right Column: Payment */}
                <div className="space-y-3 border-t md:border-t-0 md:border-l border-gray-100 md:pl-6">
                  <div>
                    <span className="text-gray-500 font-medium">Payment Calculation</span>
                    <div className="text-gray-700 mt-0.5">₹700 × 7 nights = <span className="font-bold text-gray-900">₹4,900</span></div>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Total Paid Status</span>
                    <div className="text-base font-bold text-[#07552D]">₹4,900 Paid (Verified)</div>
                  </div>
                </div>
              </div>

              {/* Warning Box */}
              <div className="bg-amber-100 text-amber-900 px-4 py-2.5 rounded-md text-xs font-medium flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Issue: Payment received, but no bed assigned.</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  const targetBkg = state.bookings.find((b) => b.bookingNumber === 'BKG78418') || state.bookings[3];
                  setAssignBedModalBooking(targetBkg);
                }}
                className="btn-primary w-full sm:w-auto text-xs py-2 px-5"
              >
                <BedDouble className="w-4 h-4" />
                Assign Bed Now
              </button>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* MODULE 9: Payments & Refund Review                       */}
        {/* ========================================================= */}
        {(activeTab === 'all' || activeTab === '9') && (
          <section id="mod-9" className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 mb-6 gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">09</span>
                <h2 className="text-lg font-bold text-[#202820]">9. Payments & Refund Review</h2>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg self-start sm:self-auto">
                <button
                  onClick={() => setPaymentsTab('all')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md ${
                    paymentsTab === 'all' ? 'bg-[#D9F58B] text-[#07552D] shadow-xs' : 'text-gray-600'
                  }`}
                >
                  All Payments (96)
                </button>
                <button
                  onClick={() => setPaymentsTab('refunds')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md ${
                    paymentsTab === 'refunds' ? 'bg-[#D9F58B] text-[#07552D] shadow-xs' : 'text-gray-600'
                  }`}
                >
                  Refund Requests ({state.refunds.filter((r) => r.status === 'PENDING_REVIEW').length || 3})
                </button>
              </div>
            </div>

            {/* Ledger Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F7F9F5] text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Booking ID</th>
                    <th className="py-2.5 px-4 font-semibold">Customer</th>
                    <th className="py-2.5 px-4 font-semibold">Amount</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paymentsTab === 'all' && (
                    <>
                      <tr className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono font-bold text-gray-900">BKG78421</td>
                        <td className="py-3 px-4 font-medium text-gray-800">Aarav Singh</td>
                        <td className="py-3 px-4 font-bold text-gray-900">₹4,900</td>
                        <td className="py-3 px-4"><span className="badge-active">Paid</span></td>
                        <td className="py-3 px-4 text-right">
                          <button onClick={() => toast.info('Viewing Payment receipt TXN-908123')} className="px-2.5 py-1 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded text-gray-800">
                            View
                          </button>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono font-bold text-gray-900">BKG78418</td>
                        <td className="py-3 px-4 font-medium text-gray-800">Rohit Mehta</td>
                        <td className="py-3 px-4 font-bold text-gray-900">₹4,900</td>
                        <td className="py-3 px-4"><span className="badge-active">Paid</span></td>
                        <td className="py-3 px-4 text-right">
                          <button onClick={() => toast.info('Viewing Payment receipt TXN-908124')} className="px-2.5 py-1 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded text-gray-800">
                            View
                          </button>
                        </td>
                      </tr>
                    </>
                  )}

                  {/* Refund Requests List */}
                  {state.refunds.map((refund) => (
                    <tr key={refund.id} className="bg-amber-50/40 hover:bg-amber-50">
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">{refund.bookingNumber}</td>
                      <td className="py-3 px-4 font-medium text-gray-800">{refund.customerName}</td>
                      <td className="py-3 px-4 font-bold text-gray-900">₹{refund.amount.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4">
                        <span className={refund.status === 'COMPLETED' ? 'badge-active' : 'badge-pending'}>
                          {refund.status === 'COMPLETED' ? 'Refunded' : 'Refund Requested'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {refund.status === 'PENDING_REVIEW' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => processRefund(refund.id, true)}
                              className="px-2.5 py-1 text-xs font-bold bg-[#07552D] text-white hover:bg-[#054223] rounded"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => processRefund(refund.id, false)}
                              className="px-2.5 py-1 text-xs font-medium border border-gray-300 hover:bg-gray-100 rounded text-gray-700"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 font-medium">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* MODULE 10: Visits & Escalations                          */}
        {/* ========================================================= */}
        {(activeTab === 'all' || activeTab === '10') && (
          <section id="mod-10" className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 mb-6 gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">10</span>
                <h2 className="text-lg font-bold text-[#202820]">10. Visits & Escalations</h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setVisitsTab('visits')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md ${
                      visitsTab === 'visits' ? 'bg-[#D9F58B] text-[#07552D] shadow-xs' : 'text-gray-600'
                    }`}
                  >
                    Visits (5)
                  </button>
                  <button
                    onClick={() => setVisitsTab('escalations')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md ${
                      visitsTab === 'escalations' ? 'bg-[#D9F58B] text-[#07552D] shadow-xs' : 'text-gray-600'
                    }`}
                  >
                    Escalations (2)
                  </button>
                </div>
                <button
                  onClick={() => toast.info('Open /admin/support to launch Ticket/Escalation Drawer')}
                  className="btn-primary text-xs py-1.5 px-3"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Escalation
                </button>
              </div>
            </div>

            {/* Escalations Table */}
            {visitsTab === 'escalations' ? (
              <div className="overflow-x-auto border border-gray-200 rounded-lg mb-6">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F7F9F5] text-gray-600 border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Escalation</th>
                      <th className="py-2.5 px-4 font-semibold">Property</th>
                      <th className="py-2.5 px-4 font-semibold">Priority</th>
                      <th className="py-2.5 px-4 font-semibold">Since</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {state.escalations.map((esc) => (
                      <tr key={esc.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-semibold text-gray-900">
                          <div>{esc.id}</div>
                          <div className="text-gray-600 font-normal">{esc.issue}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{esc.propertyName}</td>
                        <td className="py-3 px-4">
                          <span className="badge-issue">High</span>
                        </td>
                        <td className="py-3 px-4 text-gray-500">{esc.since}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => toast.info(`Reviewing escalation ${esc.id}: ${esc.issue}`)}
                            className="px-2.5 py-1 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded text-gray-800"
                          >
                            Open
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-lg mb-6">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F7F9F5] text-gray-600 border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Customer</th>
                      <th className="py-2.5 px-4 font-semibold">Property</th>
                      <th className="py-2.5 px-4 font-semibold">Scheduled Date/Time</th>
                      <th className="py-2.5 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {state.visits.map((vis) => (
                      <tr key={vis.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-semibold text-gray-900">{vis.customerName}</td>
                        <td className="py-3 px-4 text-gray-700">{vis.propertyName}</td>
                        <td className="py-3 px-4 text-gray-600">{vis.scheduledTime}</td>
                        <td className="py-3 px-4"><span className="badge-lime">{vis.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bottom Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#F7F9F5] p-4 rounded-lg border border-[#E2E8DE] flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Visits This Week</div>
                  <div className="text-2xl font-black text-[#07552D] mt-0.5">3</div>
                </div>
                <button onClick={() => toast.info('Open /admin/visits to launch Visit Scheduling Modal')} className="btn-secondary text-xs py-1 px-3">
                  Schedule Visit
                </button>
              </div>

              <div className="bg-[#F7F9F5] p-4 rounded-lg border border-[#E2E8DE] flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Open Escalations</div>
                  <div className="text-2xl font-black text-rose-700 mt-0.5">2</div>
                </div>
                <button onClick={() => setVisitsTab('escalations')} className="btn-secondary text-xs py-1 px-3">
                  View All
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* MODULE 11: Support Ticket (Assignee & Resolution)         */}
        {/* ========================================================= */}
        {(activeTab === 'all' || activeTab === '11') && (
          <section id="mod-11" className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">11</span>
                <h2 className="text-lg font-bold text-[#202820]">11. Support Ticket (Assignee & Resolution)</h2>
              </div>
              <span className={ticketStatus === 'Resolved' ? 'badge-active' : 'badge-pending'}>
                {ticketStatus}
              </span>
            </div>

            <div className="border border-[#E2E8DE] rounded-lg p-5 bg-[#F7F9F5] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-[#202820]">Ticket ST-5567</h3>
                <span className="text-xs text-gray-500">Created: 10 Dec, 10:02 AM</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-white p-4 rounded-lg border border-gray-200">
                <div>
                  <span className="text-gray-500">Subject</span>
                  <div className="font-bold text-sm text-gray-900 mt-0.5">Wi-Fi not working at HSR Garden PG</div>
                </div>
                <div>
                  <span className="text-gray-500">Customer</span>
                  <div className="font-semibold text-gray-900 mt-0.5">Aarav Singh</div>
                </div>
                <div>
                  <span className="text-gray-500">Property</span>
                  <div className="font-semibold text-gray-900 mt-0.5">HSR Garden PG</div>
                </div>
                <div>
                  <span className="text-gray-500">Assignee</span>
                  <div className="font-semibold text-[#07552D] mt-0.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Megha Kulkarni
                  </div>
                </div>
              </div>

              {/* Resolution Box */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Resolution</label>
                <textarea
                  rows={2}
                  value={ticketResolutionInput}
                  onChange={(e) => setTicketResolutionInput(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-[#07552D] outline-none"
                />
                <div className="text-[11px] text-gray-500 mt-1">Resolved: 10 Dec, 11:26 AM</div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    updateTicketResolution('tick-1', ticketResolutionInput, true);
                    toast.success('Resolution saved!');
                  }}
                  className="btn-secondary text-xs py-1.5 px-4"
                >
                  Save Resolution
                </button>
                <button
                  onClick={() => {
                    const next = ticketStatus === 'Resolved' ? 'Open' : 'Resolved';
                    setTicketStatus(next);
                    recordAuditLog('Admin', 'ADMIN', `${next === 'Open' ? 'Reopened' : 'Resolved'} ticket`, 'Ticket', 'ST-5567', 'Ticket ST-5567');
                  }}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#D9F58B] text-[#07552D] hover:bg-[#cbf06f] transition-colors"
                >
                  {ticketStatus === 'Resolved' ? 'Reopen Ticket' : 'Mark Resolved'}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* MODULE 12: Settings & Audit Log (Actor & Time)           */}
        {/* ========================================================= */}
        {(activeTab === 'all' || activeTab === '12') && (
          <section id="mod-12" className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 mb-6 gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#D9F58B] text-[#07552D] font-bold text-xs flex items-center justify-center">12</span>
                <h2 className="text-lg font-bold text-[#202820]">12. Settings & Audit Log (Actor & Time)</h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setAuditTab('settings')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md ${
                      auditTab === 'settings' ? 'bg-[#D9F58B] text-[#07552D] shadow-xs' : 'text-gray-600'
                    }`}
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => setAuditTab('audit')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md ${
                      auditTab === 'audit' ? 'bg-[#D9F58B] text-[#07552D] shadow-xs' : 'text-gray-600'
                    }`}
                  >
                    Audit Log
                  </button>
                </div>
                <select className="px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none">
                  <option>Last 7 Days</option>
                  <option>Today</option>
                  <option>Last 30 Days</option>
                </select>
                <select className="px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none">
                  <option>All Actions</option>
                  <option>Bed Allocation</option>
                  <option>PG Verification</option>
                  <option>Refunds</option>
                </select>
              </div>
            </div>

            {auditTab === 'audit' ? (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F7F9F5] text-gray-600 border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Time</th>
                      <th className="py-2.5 px-4 font-semibold">Actor</th>
                      <th className="py-2.5 px-4 font-semibold">Action</th>
                      <th className="py-2.5 px-4 font-semibold">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {state.auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-gray-500 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })},{' '}
                          {new Date(log.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-900">
                          {log.actorName}{' '}
                          <span className="text-[10px] font-normal text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded ml-1">
                            {log.actorRole}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-[#07552D]">{log.action}</td>
                        <td className="py-3 px-4 text-gray-700 font-mono text-[11px]">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 bg-[#F7F9F5] rounded-lg border border-gray-200 text-xs space-y-4">
                <h4 className="font-bold text-sm text-[#202820]">System & Platform Controls</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded border">
                    <span className="font-semibold block mb-1">PG Verification Mode</span>
                    <span className="text-gray-500">Requires manual Admin ID & license verification before public listing.</span>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <span className="font-semibold block mb-1">Anti Double-Booking Engine</span>
                    <span className="text-gray-500">Strict ACID reservation locks enabled with instant exception dispatch.</span>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

      </div>

      {/* ========================================================= */}
      {/* MODAL: Assign Bed Dialog (Resolves Paid-Unassigned Exception) */}
      {/* ========================================================= */}
      {assignBedModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-gray-200 overflow-hidden animate-fadeIn">
            <div className="bg-[#07552D] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-[#D9F58B]" />
                <h3 className="font-bold text-sm">Assign Bed to Booking</h3>
              </div>
              <button
                onClick={() => setAssignBedModalBooking(null)}
                className="text-white/80 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-[#F7F9F5] p-3 rounded-lg border border-gray-200">
                <div className="font-bold text-sm text-gray-900">{assignBedModalBooking.customerName}</div>
                <div className="text-gray-600 mt-0.5">
                  Booking <span className="font-mono font-bold">{assignBedModalBooking.bookingNumber}</span> • {assignBedModalBooking.propertyName}
                </div>
                <div className="text-gray-500 mt-1">Stay: 12 – 19 Dec (7 nights) • Paid: ₹{assignBedModalBooking.totalAmount}</div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">1. Select Room</label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => {
                    setSelectedRoomId(e.target.value);
                    setSelectedBedId('');
                  }}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-[#07552D]"
                >
                  <option value="">-- Choose Room --</option>
                  {state.rooms
                    .filter((r) => r.propertyId === assignBedModalBooking.propertyId)
                    .map((room) => {
                      const availCount = room.beds.filter((b) => b.status === 'AVAILABLE').length;
                      return (
                        <option key={room.id} value={room.id}>
                          Room {room.roomNumber} ({availCount} available bed{availCount !== 1 ? 's' : ''})
                        </option>
                      );
                    })}
                </select>
              </div>

              {selectedRoomId && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1.5">2. Select Available Bed</label>
                  <div className="grid grid-cols-2 gap-2">
                    {state.rooms
                      .find((r) => r.id === selectedRoomId)
                      ?.beds.map((b) => {
                        const isAvail = b.status === 'AVAILABLE';
                        return (
                          <button
                            key={b.id}
                            type="button"
                            disabled={!isAvail}
                            onClick={() => setSelectedBedId(b.id)}
                            className={`p-2.5 rounded-lg border text-left transition-all ${
                              selectedBedId === b.id
                                ? 'border-[#07552D] bg-[#D9F58B] text-[#07552D] font-bold'
                                : isAvail
                                ? 'border-gray-200 hover:border-gray-400 bg-white'
                                : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <div className="font-semibold">{b.bedNumber}</div>
                            <div className="text-[10px]">{isAvail ? 'Available' : 'Occupied'}</div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setAssignBedModalBooking(null)}
                  className="btn-secondary py-1.5 px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedBedId}
                  onClick={handleAssignBedSubmit}
                  className="btn-primary py-1.5 px-4 text-xs disabled:opacity-50"
                >
                  Confirm & Assign Bed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

