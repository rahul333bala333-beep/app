'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  BedDouble,
  Calendar,
  Sliders,
  CalendarCheck,
  Users,
  Eye,
  IndianRupee,
  Wrench,
  ShieldCheck,
  LogOut,
  X,
} from 'lucide-react';
import { getState } from '@/lib/store';
import { LogoutDialog } from '@/components/auth/LogoutDialog';

interface OwnerSidebarProps {
  onCloseMobile?: () => void;
  isMobileDrawer?: boolean;
}

export default function OwnerSidebar({ onCloseMobile, isMobileDrawer = false }: OwnerSidebarProps) {
  const pathname = usePathname();
  const state = getState();
  const pendingVisits = state.visits.filter(v => v.status === 'PENDING').length;
  const openMaintenance = state.supportTickets.filter(t => t.status === 'OPEN').length;
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const navItems = [
    { label: 'Portfolio Overview', href: '/owner/dashboard', icon: LayoutDashboard },
    { label: 'My PGs & Listings', href: '/owner/properties', icon: Building2 },
    { label: 'Add New PG', href: '/owner/properties/add', icon: PlusCircle },
    { label: 'Rooms & Beds', href: '/owner/rooms', icon: BedDouble },
    { label: 'Availability Calendar', href: '/owner/calendar', icon: Calendar },
    { label: 'Rates, Deposits & Rules', href: '/owner/pricing', icon: Sliders },
    { label: 'Bookings & Bed Assign', href: '/owner/bookings', icon: CalendarCheck },
    { label: 'Residents Directory', href: '/owner/residents', icon: Users },
    { label: 'Visit Requests', href: '/owner/visits', icon: Eye, badge: pendingVisits },
    { label: 'Collections & Payouts', href: '/owner/collections', icon: IndianRupee },
    { label: 'Support & Maintenance', href: '/owner/support', icon: Wrench, badge: openMaintenance },
    { label: 'Owner Verification', href: '/owner/profile', icon: ShieldCheck },
  ];

  return (
    <>
      <aside
        className={`${
          isMobileDrawer ? 'w-72 max-w-[85vw]' : 'hidden lg:flex w-64'
        } bg-[#07552D] text-white min-h-screen flex-col justify-between shrink-0 shadow-xl border-r border-[#054022] z-50`}
      >
        <div className="flex-1 overflow-y-auto">
          {/* Brand & Close button for mobile */}
          <div className="p-5 border-b border-[#0A6838] flex items-center justify-between">
            <Link
              href="/owner/dashboard"
              onClick={onCloseMobile}
              className="flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-[#D9F58B] text-[#07552D] flex items-center justify-center font-black text-xl shadow-md">
                S
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight">Stayzy</span>
                <span className="text-[10px] text-[#D9F58B] font-bold block uppercase tracking-wider">
                  PG Owner Portal
                </span>
              </div>
            </Link>

            {isMobileDrawer && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-[#0A6838] transition-colors"
                title="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/owner/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#D9F58B] text-[#07552D] shadow-sm font-bold'
                      : 'text-gray-200 hover:text-white hover:bg-[#0A6838]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#07552D]' : 'text-[#A3CFBB]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-[#D9F58B] text-[#07552D]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Profile & Logout */}
        <div className="p-4 border-t border-[#0A6838] bg-[#054022]/40 text-xs shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#D9F58B] text-[#07552D] font-bold flex items-center justify-center">
                RK
              </div>
              <div>
                <div className="font-bold text-white text-[11px]">Rakesh Kumar</div>
                <div className="text-[10px] text-[#A3CFBB] truncate max-w-[120px]">
                  owner@hsrgardenpg.com
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsLogoutOpen(true)}
              className="text-gray-300 hover:text-rose-300 hover:bg-rose-950/40 p-1.5 rounded-lg transition-colors"
              title="Log Out of Stayzy"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-1 pt-2 border-t border-[#0A6838] text-[10px] text-gray-300">
            <Link href="/admin/dashboard" className="hover:text-[#D9F58B] underline">
              Admin View →
            </Link>
            <Link href="/customer/explore" className="hover:text-[#D9F58B] underline">
              Customer App →
            </Link>
          </div>
        </div>
      </aside>

      {/* In-App Logout Confirmation Dialog */}
      <LogoutDialog
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        role="OWNER"
      />
    </>
  );
}
