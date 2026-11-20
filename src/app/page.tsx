'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  BedDouble,
  CreditCard,
  Users,
  Calendar,
  Layers,
  Database,
  RefreshCw,
} from 'lucide-react';
import { getState, subscribeToState, createCustomerBooking, resetStateToDefault } from '@/lib/store';
import { toast } from '@/components/ui/Toast';

export default function HomePage() {
  const [state, setState] = useState(getState());

  useEffect(() => {
    return subscribeToState((newState) => {
      setState(newState);
    });
  }, []);

  const totalOccupied = state.rooms.reduce((acc, r) => acc + r.beds.filter((b) => b.status === 'OCCUPIED').length, 0);
  const totalBeds = state.rooms.reduce((acc, r) => acc + r.beds.length, 0);
  const occupancyPercent = totalBeds > 0 ? Math.round((totalOccupied / totalBeds) * 100) : 81;
  const unassignedCount = state.bookings.filter((b) => b.status === 'PAID_UNASSIGNED').length;

  return (
    <div className="min-h-screen bg-[#F7F9F5]">
      {/* Top Banner */}
      <header className="bg-[#07552D] text-white py-4 px-6 border-b border-[#054022]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D9F58B] text-[#07552D] flex items-center justify-center font-black text-xl shadow-md">
              S
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white">Stayzy</span>
              <span className="text-xs text-[#D9F58B] font-semibold ml-2 bg-[#0A4526] px-2 py-0.5 rounded border border-[#115C33]">
                Multi-Page Enterprise Architecture
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="btn-lime text-xs py-1.5 px-3 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> Admin Portal
            </Link>
            <Link href="/owner/dashboard" className="btn-secondary text-xs py-1.5 px-3 font-semibold">
              <Building2 className="w-3.5 h-3.5" /> PG Owner
            </Link>
            <Link href="/customer/explore" className="btn-secondary text-xs py-1.5 px-3 font-semibold">
              <Smartphone className="w-3.5 h-3.5" /> Customer App
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-[#07552D] to-[#0A6838] text-white py-12 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D9F58B] text-[#07552D] text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>True Multi-Page Application • 48 Dedicated Routes</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                STAYZY PG Management Ecosystem
              </h1>
              <p className="text-sm sm:text-base text-[#D4E8DC] leading-relaxed">
                Three completely separated role-based applications (Admin Portal, PG Owner Portal, and Customer Experience) operating on independent routes and synchronized in real-time through a single centralized database.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-5 flex items-center gap-6 self-start md:self-auto">
              <div>
                <div className="text-xs text-[#D9F58B] font-medium">Occupancy</div>
                <div className="text-2xl font-black text-white">{occupancyPercent}%</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <div className="text-xs text-[#D9F58B] font-medium">Active Bookings</div>
                <div className="text-2xl font-black text-white">{state.bookings.length}</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <div className="text-xs text-rose-300 font-medium">Exceptions</div>
                <div className="text-2xl font-black text-rose-300">{unassignedCount}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portals Gateway Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admin Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8DE] p-6 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-green-100 text-[#07552D] flex items-center justify-center font-bold mb-4">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <span className="badge-lime text-xs px-2.5 py-0.5 font-bold">14 Dedicated Pages</span>
              <h2 className="text-xl font-bold text-[#202820] mt-2">1. Admin Portal</h2>
              <p className="text-xs text-gray-600 mt-1 mb-4">
                Multi-page operations console for platform management, PG approvals, bed allocation issue resolution, and financial audit logs.
              </p>
              <div className="text-xs text-gray-600 space-y-1.5 mb-6">
                <div>• <Link href="/admin/dashboard" className="text-[#07552D] hover:underline font-medium">/admin/dashboard</Link> — Operations & Triage</div>
                <div>• <Link href="/admin/pg-verification" className="text-[#07552D] hover:underline font-medium">/admin/pg-verification</Link> — PG Verifications</div>
                <div>• <Link href="/admin/owners" className="text-[#07552D] hover:underline font-medium">/admin/owners</Link> — Owners Directory</div>
                <div>• <Link href="/admin/customers" className="text-[#07552D] hover:underline font-medium">/admin/customers</Link> — Customer Profiles</div>
                <div>• <Link href="/admin/bookings" className="text-[#07552D] hover:underline font-medium">/admin/bookings</Link> — Bookings & Exceptions</div>
                <div>• <Link href="/admin/payments" className="text-[#07552D] hover:underline font-medium">/admin/payments</Link> — Financial Ledger</div>
                <div>• <Link href="/admin/refunds" className="text-[#07552D] hover:underline font-medium">/admin/refunds</Link> — Gateway Refund Review</div>
                <div>• <Link href="/admin/visits" className="text-[#07552D] hover:underline font-medium">/admin/visits</Link> — Visits & Escalations</div>
                <div>• <Link href="/admin/support" className="text-[#07552D] hover:underline font-medium">/admin/support</Link> — Support Tickets</div>
                <div>• <Link href="/admin/audit-logs" className="text-[#07552D] hover:underline font-medium">/admin/audit-logs</Link> — Immutable Audit Log</div>
              </div>
            </div>

            <Link href="/admin/dashboard" className="btn-primary w-full text-xs py-2.5 rounded-xl font-bold">
              <span>Open Admin Dashboard →</span>
            </Link>
          </div>

          {/* PG Owner Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8DE] p-6 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#EBFCC0] text-[#07552D] flex items-center justify-center font-bold mb-4">
                <Building2 className="w-7 h-7" />
              </div>
              <span className="badge-lime text-xs px-2.5 py-0.5 font-bold">17 Dedicated Pages</span>
              <h2 className="text-xl font-bold text-[#202820] mt-2">2. PG Owner Portal</h2>
              <p className="text-xs text-gray-600 mt-1 mb-4">
                Property management console with room/bed inventories, maintenance calendar blocking, stay rules, bed reassignments, and collections.
              </p>
              <div className="text-xs text-gray-600 space-y-1.5 mb-6">
                <div>• <Link href="/owner/dashboard" className="text-[#07552D] hover:underline font-medium">/owner/dashboard</Link> — Portfolio & Occupancy</div>
                <div>• <Link href="/owner/properties" className="text-[#07552D] hover:underline font-medium">/owner/properties</Link> — My PGs & Listing Status</div>
                <div>• <Link href="/owner/properties/add" className="text-[#07552D] hover:underline font-medium">/owner/properties/add</Link> — Add New PG</div>
                <div>• <Link href="/owner/rooms" className="text-[#07552D] hover:underline font-medium">/owner/rooms</Link> — Rooms & Beds Inventory</div>
                <div>• <Link href="/owner/calendar" className="text-[#07552D] hover:underline font-medium">/owner/calendar</Link> — Maintenance Blocks</div>
                <div>• <Link href="/owner/pricing" className="text-[#07552D] hover:underline font-medium">/owner/pricing</Link> — Rates, Deposits & Rules</div>
                <div>• <Link href="/owner/bookings" className="text-[#07552D] hover:underline font-medium">/owner/bookings</Link> — Move Bed & Bookings</div>
                <div>• <Link href="/owner/residents" className="text-[#07552D] hover:underline font-medium">/owner/residents</Link> — Resident Check-in / Out</div>
                <div>• <Link href="/owner/visits" className="text-[#07552D] hover:underline font-medium">/owner/visits</Link> — Visit Approvals</div>
                <div>• <Link href="/owner/collections" className="text-[#07552D] hover:underline font-medium">/owner/collections</Link> — Payout Transfers</div>
                <div>• <Link href="/owner/support" className="text-[#07552D] hover:underline font-medium">/owner/support</Link> — Maintenance Tickets</div>
              </div>
            </div>

            <Link href="/owner/dashboard" className="btn-primary w-full text-xs py-2.5 rounded-xl font-bold">
              <span>Open Owner Dashboard →</span>
            </Link>
          </div>

          {/* Customer Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8DE] p-6 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#07552D] flex items-center justify-center font-bold mb-4">
                <Smartphone className="w-7 h-7" />
              </div>
              <span className="badge-lime text-xs px-2.5 py-0.5 font-bold">16 Dedicated Pages</span>
              <h2 className="text-xl font-bold text-[#202820] mt-2">3. Customer Application</h2>
              <p className="text-xs text-gray-600 mt-1 mb-4">
                Mobile-first PG discovery in Bengaluru, multi-criteria filtering, bed selection, checkout, stay extensions, cancellations, and visit scheduling.
              </p>
              <div className="text-xs text-gray-600 space-y-1.5 mb-6">
                <div>• <Link href="/customer/explore" className="text-[#07552D] hover:underline font-medium">/customer/explore</Link> — Bengaluru Discovery</div>
                <div>• <Link href="/customer/search" className="text-[#07552D] hover:underline font-medium">/customer/search</Link> — Results & Filters</div>
                <div>• <Link href="/customer/saved" className="text-[#07552D] hover:underline font-medium">/customer/saved</Link> — Wishlist PGs</div>
                <div>• <Link href="/customer/pg/prop-hsr-1" className="text-[#07552D] hover:underline font-medium">/customer/pg/prop-hsr-1</Link> — PG Photo Gallery</div>
                <div>• <Link href="/customer/booking/select" className="text-[#07552D] hover:underline font-medium">/customer/booking/select</Link> — Dates & Bed Pick</div>
                <div>• <Link href="/customer/checkout" className="text-[#07552D] hover:underline font-medium">/customer/checkout</Link> — UPI & Card Checkout</div>
                <div>• <Link href="/customer/stays" className="text-[#07552D] hover:underline font-medium">/customer/stays</Link> — Live Stay Management</div>
                <div>• <Link href="/customer/visits" className="text-[#07552D] hover:underline font-medium">/customer/visits</Link> — Schedule Walkthroughs</div>
                <div>• <Link href="/customer/payments" className="text-[#07552D] hover:underline font-medium">/customer/payments</Link> — Invoices & Refunds</div>
                <div>• <Link href="/customer/account" className="text-[#07552D] hover:underline font-medium">/customer/account</Link> — Profile & Support</div>
              </div>
            </div>

            <Link href="/customer/explore" className="btn-primary w-full text-xs py-2.5 rounded-xl font-bold">
              <span>Open Customer App →</span>
            </Link>
          </div>
        </section>

        {/* Master Route Registry Table */}
        <section className="bg-white rounded-2xl border border-[#E2E8DE] p-6 sm:p-8 shadow-card">
          <div className="flex items-center justify-between pb-4 border-b mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#202820]">Complete Multi-Page Route Registry</h2>
              <p className="text-xs text-gray-500">Every link below navigates to its own dedicated Next.js App Router page.</p>
            </div>
            <button
              onClick={() => {
                resetStateToDefault();
                toast.success('State reset back to reference demo data!');
              }}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset State
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Admin Routes */}
            <div className="space-y-2">
              <div className="font-bold text-[#07552D] pb-1 border-b flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Admin Portal Routes
              </div>
              <ul className="space-y-1.5 font-mono text-gray-700">
                <li><Link href="/admin/login" className="hover:text-[#07552D] hover:underline">/admin/login</Link></li>
                <li><Link href="/admin/dashboard" className="hover:text-[#07552D] hover:underline">/admin/dashboard</Link></li>
                <li><Link href="/admin/owners" className="hover:text-[#07552D] hover:underline">/admin/owners</Link></li>
                <li><Link href="/admin/owners/user-owner-1" className="hover:text-[#07552D] hover:underline">/admin/owners/[ownerId]</Link></li>
                <li><Link href="/admin/customers" className="hover:text-[#07552D] hover:underline">/admin/customers</Link></li>
                <li><Link href="/admin/customers/user-customer-1" className="hover:text-[#07552D] hover:underline">/admin/customers/[customerId]</Link></li>
                <li><Link href="/admin/pg-verification" className="hover:text-[#07552D] hover:underline">/admin/pg-verification</Link></li>
                <li><Link href="/admin/properties" className="hover:text-[#07552D] hover:underline">/admin/properties</Link></li>
                <li><Link href="/admin/properties/prop-hsr-1" className="hover:text-[#07552D] hover:underline">/admin/properties/[propertyId]</Link></li>
                <li><Link href="/admin/bookings" className="hover:text-[#07552D] hover:underline">/admin/bookings</Link></li>
                <li><Link href="/admin/bookings/bkg-4" className="hover:text-[#07552D] hover:underline">/admin/bookings/[bookingId]</Link></li>
                <li><Link href="/admin/payments" className="hover:text-[#07552D] hover:underline">/admin/payments</Link></li>
                <li><Link href="/admin/refunds" className="hover:text-[#07552D] hover:underline">/admin/refunds</Link></li>
                <li><Link href="/admin/visits" className="hover:text-[#07552D] hover:underline">/admin/visits</Link></li>
                <li><Link href="/admin/support" className="hover:text-[#07552D] hover:underline">/admin/support</Link></li>
                <li><Link href="/admin/support/tick-1" className="hover:text-[#07552D] hover:underline">/admin/support/[ticketId]</Link></li>
                <li><Link href="/admin/staff" className="hover:text-[#07552D] hover:underline">/admin/staff</Link></li>
                <li><Link href="/admin/audit-logs" className="hover:text-[#07552D] hover:underline">/admin/audit-logs</Link></li>
                <li><Link href="/admin/settings" className="hover:text-[#07552D] hover:underline">/admin/settings</Link></li>
              </ul>
            </div>

            {/* PG Owner Routes */}
            <div className="space-y-2">
              <div className="font-bold text-[#07552D] pb-1 border-b flex items-center gap-2">
                <Building2 className="w-4 h-4" /> PG Owner Routes
              </div>
              <ul className="space-y-1.5 font-mono text-gray-700">
                <li><Link href="/owner/login" className="hover:text-[#07552D] hover:underline">/owner/login</Link></li>
                <li><Link href="/owner/dashboard" className="hover:text-[#07552D] hover:underline">/owner/dashboard</Link></li>
                <li><Link href="/owner/properties" className="hover:text-[#07552D] hover:underline">/owner/properties</Link></li>
                <li><Link href="/owner/properties/add" className="hover:text-[#07552D] hover:underline">/owner/properties/add</Link></li>
                <li><Link href="/owner/properties/prop-hsr-1/edit" className="hover:text-[#07552D] hover:underline">/owner/properties/[id]/edit</Link></li>
                <li><Link href="/owner/rooms" className="hover:text-[#07552D] hover:underline">/owner/rooms</Link></li>
                <li><Link href="/owner/calendar" className="hover:text-[#07552D] hover:underline">/owner/calendar</Link></li>
                <li><Link href="/owner/pricing" className="hover:text-[#07552D] hover:underline">/owner/pricing</Link></li>
                <li><Link href="/owner/bookings" className="hover:text-[#07552D] hover:underline">/owner/bookings</Link></li>
                <li><Link href="/owner/bookings/bkg-5" className="hover:text-[#07552D] hover:underline">/owner/bookings/[bookingId]</Link></li>
                <li><Link href="/owner/residents" className="hover:text-[#07552D] hover:underline">/owner/residents</Link></li>
                <li><Link href="/owner/visits" className="hover:text-[#07552D] hover:underline">/owner/visits</Link></li>
                <li><Link href="/owner/collections" className="hover:text-[#07552D] hover:underline">/owner/collections</Link></li>
                <li><Link href="/owner/support" className="hover:text-[#07552D] hover:underline">/owner/support</Link></li>
                <li><Link href="/owner/profile" className="hover:text-[#07552D] hover:underline">/owner/profile</Link></li>
              </ul>
            </div>

            {/* Customer Routes */}
            <div className="space-y-2">
              <div className="font-bold text-[#07552D] pb-1 border-b flex items-center gap-2">
                <Smartphone className="w-4 h-4" /> Customer App Routes
              </div>
              <ul className="space-y-1.5 font-mono text-gray-700">
                <li><Link href="/customer/login" className="hover:text-[#07552D] hover:underline">/customer/login</Link></li>
                <li><Link href="/customer/explore" className="hover:text-[#07552D] hover:underline">/customer/explore</Link></li>
                <li><Link href="/customer/search" className="hover:text-[#07552D] hover:underline">/customer/search</Link></li>
                <li><Link href="/customer/saved" className="hover:text-[#07552D] hover:underline">/customer/saved</Link></li>
                <li><Link href="/customer/pg/prop-hsr-1" className="hover:text-[#07552D] hover:underline">/customer/pg/[propertyId]</Link></li>
                <li><Link href="/customer/booking/select" className="hover:text-[#07552D] hover:underline">/customer/booking/select</Link></li>
                <li><Link href="/customer/checkout" className="hover:text-[#07552D] hover:underline">/customer/checkout</Link></li>
                <li><Link href="/customer/booking/confirmation/bkg-1" className="hover:text-[#07552D] hover:underline">/customer/booking/confirmation/[id]</Link></li>
                <li><Link href="/customer/stays" className="hover:text-[#07552D] hover:underline">/customer/stays</Link></li>
                <li><Link href="/customer/stays/bkg-1" className="hover:text-[#07552D] hover:underline">/customer/stays/[bookingId]</Link></li>
                <li><Link href="/customer/visits" className="hover:text-[#07552D] hover:underline">/customer/visits</Link></li>
                <li><Link href="/customer/payments" className="hover:text-[#07552D] hover:underline">/customer/payments</Link></li>
                <li><Link href="/customer/account" className="hover:text-[#07552D] hover:underline">/customer/account</Link></li>
                <li><Link href="/customer/support" className="hover:text-[#07552D] hover:underline">/customer/support</Link></li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
