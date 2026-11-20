'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  LifeBuoy,
  HelpCircle,
  LogOut,
  ChevronRight,
  Phone,
  Mail,
  ShieldCheck,
  MapPin,
  Clock,
  MessageCircle,
  CheckCircle2,
} from 'lucide-react';
import { getState, recordAuditLog } from '@/lib/store';
import { Modal } from '@/components/ui/Modal';
import { LogoutDialog } from '@/components/auth/LogoutDialog';
import { toast } from '@/components/ui/Toast';

export default function CustomerAccountPage() {
  const router = useRouter();
  const state = getState();
  const customer = state.users.find((u) => u.role === 'CUSTOMER') || state.users[6];
  const openTicketCount = state.supportTickets.filter((t) => t.status === 'OPEN').length;

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // Profile form state
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone || '+91 98765 43210');
  const [email, setEmail] = useState(customer.email || 'aarav.sharma@example.com');
  const [movingTo, setMovingTo] = useState('Bengaluru');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    recordAuditLog(name, 'CUSTOMER', 'Updated personal profile', 'User', customer.id, `Moving to ${movingTo}`);
    toast.success('Profile details updated successfully!');
    setIsProfileModalOpen(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-4 sm:py-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[#202820]">Account & Support</h1>
        <p className="text-xs text-gray-500 mt-0.5">Customer Module 12 • Profile settings, active complaints & help centre</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl border border-[#E2E8DE] p-5 sm:p-6 shadow-card space-y-5">
        {/* Profile Card Header (Exact to Reference Image 2 Module 12) */}
        <div className="flex items-center gap-3.5 p-4 bg-[#F7F9F5] rounded-xl border border-[#E2E8DE]">
          <div className="w-14 h-14 rounded-full bg-[#D9F58B] text-[#07552D] font-black text-lg flex items-center justify-center shadow-xs">
            {customer.avatar || 'AS'}
          </div>
          <div>
            <h2 className="font-bold text-base text-gray-900">{customer.name}</h2>
            <div className="text-xs text-gray-500">{customer.phone || '+91 98765 43210'}</div>
          </div>
        </div>

        {/* Menu Navigation List (Exact to Reference Image 2 Module 12) */}
        <div className="divide-y divide-gray-100 text-xs">
          <div
            onClick={() => setIsProfileModalOpen(true)}
            className="py-3.5 px-1 flex items-center justify-between cursor-pointer hover:text-[#07552D] transition-colors"
          >
            <span className="flex items-center gap-3 text-gray-800 font-medium">
              <User className="w-4 h-4 text-gray-500" />
              <span>My Profile</span>
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          <Link
            href="/customer/support"
            className="py-3.5 px-1 flex items-center justify-between cursor-pointer hover:text-[#07552D] transition-colors"
          >
            <span className="flex items-center gap-3 text-gray-800 font-medium">
              <LifeBuoy className="w-4 h-4 text-gray-500" />
              <span>Support Tickets</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="badge-pending font-bold">{openTicketCount} Open</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </Link>

          <div
            onClick={() => setIsHelpModalOpen(true)}
            className="py-3.5 px-1 flex items-center justify-between cursor-pointer hover:text-[#07552D] transition-colors"
          >
            <span className="flex items-center gap-3 text-gray-800 font-medium">
              <HelpCircle className="w-4 h-4 text-gray-500" />
              <span>Help & Support</span>
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          <div
            onClick={() => setIsLogoutDialogOpen(true)}
            className="py-3.5 px-1 flex items-center justify-between cursor-pointer text-rose-600 font-bold hover:bg-rose-50/50 rounded-lg transition-colors"
          >
            <span className="flex items-center gap-3">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Desktop Sidebar Column */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E2E8DE] p-5 shadow-card space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">Resident Safety & Trust</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-gray-700">
                <span className="w-2 h-2 rounded-full bg-[#07552D]" />
                <span>100% Aadhaar Verified PGs</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="w-2 h-2 rounded-full bg-[#07552D]" />
                <span>Zero Brokerage Promise</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="w-2 h-2 rounded-full bg-[#07552D]" />
                <span>Instant Online Refund Desk</span>
              </div>
            </div>
          </div>

          <div className="bg-[#07552D] text-white rounded-2xl p-5 shadow-card space-y-3">
            <h3 className="font-bold text-xs text-[#D9F58B] uppercase tracking-wider">Need Help in Bengaluru?</h3>
            <p className="text-xs text-gray-200 leading-relaxed">
              Our 24x7 resident care team is available to help with room issues, Wi-Fi maintenance, or food feedback.
            </p>
            <div className="pt-2 border-t border-[#0A6838] flex items-center justify-between text-xs">
              <span className="text-[#A3CFBB]">Toll Free</span>
              <span className="font-bold text-white">1800-STAYZY</span>
            </div>
          </div>
        </div>
      </div>

      {/* In-App Profile Modal */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="My Profile"
        subtitle="Manage personal identification & relocation preferences"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="btn-secondary text-xs py-2 px-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="profile-edit-form"
              className="btn-primary text-xs py-2 px-4 font-bold"
            >
              Save Profile
            </button>
          </div>
        }
      >
        <form id="profile-edit-form" onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="flex items-center gap-3 p-3 bg-[#F1FCDF] rounded-xl border border-[#D9F58B]">
            <ShieldCheck className="w-5 h-5 text-[#07552D] shrink-0" />
            <div>
              <div className="font-bold text-[#07552D]">Aadhaar / Government KYC Verified</div>
              <div className="text-[11px] text-[#07552D]/80">Verified resident status on Stayzy platform</div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl font-medium outline-none focus:border-[#07552D]"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Mobile Phone</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl font-medium outline-none focus:border-[#07552D]"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl font-medium outline-none focus:border-[#07552D]"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Target Moving Locality</label>
            <div className="flex items-center gap-2 px-3 py-2 border rounded-xl">
              <MapPin className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={movingTo}
                onChange={(e) => setMovingTo(e.target.value)}
                className="w-full font-medium outline-none"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* In-App Help & Support Modal */}
      <Modal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="Stayzy Help & Support Centre"
        subtitle="24/7 dedicated tenant assistance & resident hotline"
        size="md"
        footer={
          <button
            type="button"
            onClick={() => setIsHelpModalOpen(false)}
            className="btn-primary w-full text-xs py-2 font-bold"
          >
            Close Support Centre
          </button>
        }
      >
        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl border border-gray-200 bg-[#F7F9F5] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#07552D] text-white flex items-center justify-center font-bold">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-gray-900">24/7 Toll-Free Helpline</div>
                <div className="text-gray-500 font-mono">1800-STAYZY-HELP (1800-782999)</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText('1800-782999');
                toast.success('Helpline number copied to clipboard');
              }}
              className="btn-secondary py-1 px-2.5 text-[11px]"
            >
              Copy
            </button>
          </div>

          <div className="p-3.5 rounded-xl border border-gray-200 bg-[#F7F9F5] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-gray-900">WhatsApp Resident Concierge</div>
                <div className="text-gray-500 font-mono">+91 98765 00112</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText('+91 98765 00112');
                toast.success('WhatsApp number copied');
              }}
              className="btn-secondary py-1 px-2.5 text-[11px]"
            >
              Copy
            </button>
          </div>

          <div className="p-3.5 rounded-xl border border-gray-200 bg-[#F7F9F5] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-gray-900">Customer Grievance Desk</div>
                <div className="text-gray-500 font-mono">support@stayzy.in</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText('support@stayzy.in');
                toast.success('Support email copied');
              }}
              className="btn-secondary py-1 px-2.5 text-[11px]"
            >
              Copy
            </button>
          </div>
        </div>
      </Modal>

      {/* In-App Logout Confirmation Dialog */}
      <LogoutDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        role="CUSTOMER"
      />
    </div>
  );
}
