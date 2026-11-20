'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  CalendarDays,
  CreditCard,
  RotateCcw,
  MapPin,
  LifeBuoy,
  ShieldCheck,
  History,
  Settings,
  CheckCircle2,
  LogOut,
  X,
} from 'lucide-react';
import { getState } from '@/lib/store';
import { LogoutDialog } from '@/components/auth/LogoutDialog';

interface AdminSidebarProps {
  onCloseMobile?: () => void;
  isMobileDrawer?: boolean;
}

export default function AdminSidebar({ onCloseMobile, isMobileDrawer = false }: AdminSidebarProps) {
  const pathname = usePathname();
  const state = getState();
  const pendingVerification = state.properties.filter(p => p.status === 'PENDING_VERIFICATION').length;
  const openTickets = state.supportTickets.filter(t => t.status === 'OPEN').length;
  const unassignedCount = state.bookings.filter(b => b.status === 'PAID_UNASSIGNED').length;
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const navItems = [
    { label: 'Operations Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'PG Verification', href: '/admin/pg-verification', icon: CheckCircle2, badge: pendingVerification },
    { label: 'Owner Directory', href: '/admin/owners', icon: Building2 },
    { label: 'Customer Directory', href: '/admin/customers', icon: Users },
    { label: 'Properties & Inventory', href: '/admin/properties', icon: CalendarDays },
    { label: 'All Bookings', href: '/admin/bookings', icon: CalendarDays, badge: unassignedCount ? `! ${unassignedCount}` : undefined, badgeColor: 'bg-amber-500' },
    { label: 'Payments & Ledger', href: '/admin/payments', icon: CreditCard },
    { label: 'Refund Requests', href: '/admin/refunds', icon: RotateCcw },
    { label: 'Visits & Escalations', href: '/admin/visits', icon: MapPin },
    { label: 'Support Tickets', href: '/admin/support', icon: LifeBuoy, badge: openTickets },
    { label: 'Staff & Roles', href: '/admin/staff', icon: ShieldCheck },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: History },
    { label: 'System Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <>
      <aside
        className={`${
          isMobileDrawer ? 'w-72 max-w-[85vw]' : 'hidden lg:flex w-64'
        } bg-[#07552D] text-white min-h-screen flex-col justify-between shrink-0 shadow-xl border-r border-[#054022] z-50`}
      >
        {/* Brand & Platform Header */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 border-b border-[#0A6838] flex items-center justify-between">
            <Link
              href="/admin/dashboard"
              onClick={onCloseMobile}
              className="flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-[#D9F58B] text-[#07552D] flex items-center justify-center font-black text-xl shadow-md">
                S
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight">Stayzy</span>
                <span className="text-[10px] text-[#D9F58B] font-bold block uppercase tracking-wider">
                  Platform Admin
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

          {/* Module Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
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
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        item.badgeColor || 'bg-[#D9F58B] text-[#07552D]'
                      }`}
                    >
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
                AD
              </div>
              <div>
                <div className="font-bold text-white text-[11px]">Platform Admin</div>
                <div className="text-[10px] text-[#A3CFBB] truncate max-w-[120px]">
                  admin@stayzy.in
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

          {/* Global Quick Switcher */}
          <div className="flex items-center justify-between gap-1 pt-2 border-t border-[#0A6838] text-[10px] text-gray-300">
            <Link href="/owner/dashboard" className="hover:text-[#D9F58B] underline">
              Owner App →
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
        role="ADMIN"
      />
    </>
  );
}
