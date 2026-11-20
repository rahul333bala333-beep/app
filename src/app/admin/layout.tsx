'use client';

import React, { useState } from 'react';
import AdminSidebar from '@/components/navigation/AdminSidebar';
import { Menu, ShieldCheck, LogOut } from 'lucide-react';
import { LogoutDialog } from '@/components/auth/LogoutDialog';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F9F5] flex flex-col lg:flex-row overflow-x-hidden">
      {/* 1. Desktop Left Sidebar */}
      <AdminSidebar />

      {/* 2. Mobile Drawer & Backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative flex-1 max-w-xs animate-in slide-in-from-left duration-300">
            <AdminSidebar
              isMobileDrawer={true}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 3. Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Responsive Header Bar */}
        <header className="h-14 sm:h-16 bg-white border-b border-[#E2E8DE] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
              title="Open Admin Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#07552D] bg-[#F1FCDF] px-2.5 py-1 rounded-full border border-[#D9F58B] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#07552D]" />
                <span className="truncate max-w-[150px] sm:max-w-none">Operations Command</span>
              </span>
            </div>
          </div>

          {/* Right Header Status & Actions */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#07552D] bg-[#F1FCDF] px-2.5 py-1 rounded-full border border-[#D9F58B]">
              <span className="w-2 h-2 rounded-full bg-[#07552D] animate-pulse" />
              <span className="font-semibold">Live Real-time Sync</span>
            </div>

            <button
              type="button"
              onClick={() => setIsLogoutOpen(true)}
              className="flex lg:hidden items-center gap-1.5 text-xs text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-xl border border-rose-200 transition-colors font-semibold"
              title="Log Out of Stayzy"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-3.5 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* In-App Logout Confirmation Dialog */}
      <LogoutDialog
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        role="ADMIN"
      />
    </div>
  );
}
