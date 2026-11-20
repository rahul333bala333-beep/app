'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  Heart,
  BedDouble,
  Calendar,
  CreditCard,
  User,
  Bell,
  ShieldCheck,
  Building2,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { getState } from '@/lib/store';
import { LogoutDialog } from '@/components/auth/LogoutDialog';

export default function CustomerNav() {
  const pathname = usePathname();
  const state = getState();
  const savedCount = state.savedPropertyIds.length;
  const activeStays = state.bookings.filter(b => b.status === 'CONFIRMED').length;

  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Explore', href: '/customer/explore', icon: Compass },
    { label: 'Saved', href: '/customer/saved', icon: Heart, badge: savedCount },
    { label: 'My Stays', href: '/customer/stays', icon: BedDouble, badge: activeStays },
    { label: 'Visits', href: '/customer/visits', icon: Calendar },
    { label: 'Payments', href: '/customer/payments', icon: CreditCard },
    { label: 'Account', href: '/customer/account', icon: User },
  ];

  return (
    <>
      {/* =========================================================================
          1. DESKTOP & TABLET TOP HEADER BAR (Hidden on Mobile)
      ========================================================================= */}
      <header className="hidden md:block sticky top-0 z-50 bg-[#07552D] text-white shadow-md border-b border-[#054022]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link href="/customer/explore" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#D9F58B] text-[#07552D] flex items-center justify-center font-black text-lg shadow-sm">
                  S
                </div>
                <div>
                  <span className="font-extrabold text-xl tracking-tight text-white">Stayzy</span>
                  <span className="hidden lg:inline-block ml-2 text-[10px] text-[#D9F58B] bg-[#0A4526] px-2 py-0.5 rounded border border-[#115C33] font-semibold">
                    Bengaluru PGs
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links (All 6 Items) */}
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/customer/explore' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-[#D9F58B] text-[#07552D] shadow-sm font-bold'
                        : 'text-gray-200 hover:text-white hover:bg-[#0A4526]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isActive
                            ? 'bg-[#07552D] text-white'
                            : 'bg-[#D9F58B] text-[#07552D]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Right Actions: Role Portals & Profile Menu */}
            <div className="flex items-center gap-3">
              <Link
                href="/admin/dashboard"
                className="hidden xl:flex items-center gap-1.5 text-xs text-[#A3CFBB] hover:text-white bg-[#0A4526] px-2.5 py-1 rounded-md border border-[#115C33] transition-colors"
                title="Admin Staff Dashboard"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>

              <Link
                href="/owner/dashboard"
                className="hidden xl:flex items-center gap-1.5 text-xs text-[#A3CFBB] hover:text-white bg-[#0A4526] px-2.5 py-1 rounded-md border border-[#115C33] transition-colors"
                title="PG Owner Partner Portal"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>PG Owner</span>
              </Link>

              {/* Profile / Account Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full bg-[#0A4526] hover:bg-[#0d542e] border border-[#115C33] transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-[#D9F58B] text-[#07552D] font-black text-xs flex items-center justify-center shadow-xs">
                    AS
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-300 pr-1" />
                </button>

                {isProfileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsProfileMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white text-gray-900 rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95">
                      <div className="px-3.5 py-2 border-b border-gray-100">
                        <div className="font-bold text-gray-900">Aarav Sharma</div>
                        <div className="text-[11px] text-gray-500 truncate">+91 98765 43210</div>
                      </div>

                      <Link
                        href="/customer/account"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="px-3.5 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                      >
                        <User className="w-4 h-4 text-gray-500" />
                        <span>Profile & Settings</span>
                      </Link>

                      <Link
                        href="/customer/stays"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="px-3.5 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                      >
                        <BedDouble className="w-4 h-4 text-gray-500" />
                        <span>My Active Stays</span>
                      </Link>

                      <div className="border-t border-gray-100 my-1" />

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setIsLogoutOpen(true);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 font-semibold flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. MOBILE TOP HEADER (Native App Inspired Header, <768px only)
      ========================================================================= */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-2.5 flex items-center justify-between shadow-2xs">
        <Link href="/customer/explore" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#D9F58B] text-[#07552D] font-black text-xs flex items-center justify-center shadow-xs">
            SZ
          </div>
          <div>
            <span className="font-black text-base text-[#07552D] tracking-tight">Stayzy</span>
            <span className="ml-1.5 text-[9px] bg-[#F1FCDF] text-[#07552D] font-bold px-1.5 py-0.2 rounded-full border border-[#D9F58B]">
              Bengaluru
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/customer/account"
            className="p-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </Link>

          <Link
            href="/customer/account"
            className="w-7 h-7 rounded-full bg-[#D9F58B] text-[#07552D] font-black text-xs flex items-center justify-center border border-[#c4e868] shadow-xs"
          >
            AS
          </Link>
        </div>
      </header>

      {/* =========================================================================
          3. MOBILE FIXED BOTTOM NAVIGATION BAR (<768px only)
          Contains ALL 6 items: Explore, Saved, My Stays, Visits, Payments, Account
      ========================================================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200/90 shadow-2xl flex items-center justify-around py-1.5 px-0.5 safe-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/customer/explore' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-1 rounded-lg text-[9px] font-semibold transition-all relative ${
                isActive ? 'text-[#07552D] font-black' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-4.5 h-4.5 mb-0.5 transition-transform ${
                    isActive ? 'text-[#07552D] scale-110' : 'text-gray-400'
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-3.5 h-3.5 px-0.5 bg-rose-600 text-white rounded-full text-[8px] flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="truncate max-w-[54px]">{item.label}</span>
              {isActive && (
                <span className="w-3.5 h-0.5 rounded-full bg-[#07552D] mt-0.5" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* In-App Logout Confirmation Dialog */}
      <LogoutDialog
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        role="CUSTOMER"
      />
    </>
  );
}
