'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Building2,
  Smartphone,
  RotateCcw,
  Radio,
  User as UserIcon,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { getState, subscribeToState, resetStateToDefault, setCurrentUser } from '@/lib/store';
import { User } from '@/lib/types';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';
import { toast } from '../ui/Toast';

export default function RoleHeader() {
  const pathname = usePathname();
  const [state, setState] = useState(getState());
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    return subscribeToState((newState) => {
      setState(newState);
      // Trigger subtle flash on audit log update
      if (newState.auditLogs.length > 0) {
        const latest = newState.auditLogs[0];
        setNotificationMsg(`[Sync Event] ${latest.actorName}: ${latest.action} (${latest.details})`);
        setShowNotification(true);
        const timer = setTimeout(() => setShowNotification(false), 4000);
        return () => clearTimeout(timer);
      }
    });
  }, []);

  const isAdmin = pathname.startsWith('/admin');
  const isOwner = pathname.startsWith('/owner');
  const isCustomer = pathname.startsWith('/customer');

  const handleSwitchUser = (role: 'ADMIN' | 'OWNER' | 'CUSTOMER') => {
    const target = state.users.find((u) => u.role === role);
    if (target) {
      setCurrentUser(target);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#07552D] text-white shadow-md border-b border-[#053F21]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Portal Identifier */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-[#D9F58B] text-[#07552D] flex items-center justify-center font-black text-lg shadow-sm">
                S
              </div>
              <span className="font-bold text-xl tracking-tight text-white group-hover:text-[#D9F58B] transition-colors">
                Stayzy
              </span>
            </Link>

            <span className="text-[#A3CFBB] text-xs font-semibold px-2 py-0.5 rounded bg-[#0A4526] border border-[#115C33]">
              {isAdmin && 'Admin Operations'}
              {isOwner && 'PG Owner Portal'}
              {isCustomer && 'Customer Experience'}
              {!isAdmin && !isOwner && !isCustomer && 'Platform Hub'}
            </span>

            <div className="hidden md:flex items-center gap-1.5 text-xs text-[#D9F58B] bg-[#0A4526] px-2 py-0.5 rounded-full border border-[#115C33]">
              <span className="w-2 h-2 rounded-full bg-[#D9F58B] animate-pulse" />
              <span>Realtime Live</span>
            </div>
          </div>

          {/* Quick Cross-Role Portal Switcher */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/admin"
              onClick={() => handleSwitchUser('ADMIN')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                isAdmin
                  ? 'bg-[#D9F58B] text-[#07552D] shadow-sm font-semibold'
                  : 'text-gray-200 hover:text-white hover:bg-[#0A4526]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>

            <Link
              href="/owner"
              onClick={() => handleSwitchUser('OWNER')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                isOwner
                  ? 'bg-[#D9F58B] text-[#07552D] shadow-sm font-semibold'
                  : 'text-gray-200 hover:text-white hover:bg-[#0A4526]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>PG Owner</span>
            </Link>

            <Link
              href="/customer"
              onClick={() => handleSwitchUser('CUSTOMER')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                isCustomer
                  ? 'bg-[#D9F58B] text-[#07552D] shadow-sm font-semibold'
                  : 'text-gray-200 hover:text-white hover:bg-[#0A4526]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Customer</span>
            </Link>

            {/* Reset Demo Data Button */}
            <button
              onClick={() => setShowResetConfirm(true)}
              title="Reset shared state to reference demo data"
              className="p-1.5 rounded text-[#A3CFBB] hover:text-white hover:bg-[#0A4526] transition-colors ml-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Demo Reset */}
      <ConfirmationDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={() => {
          resetStateToDefault();
          setShowResetConfirm(false);
          toast.success('All demo bookings, beds, and records reset to reference state');
        }}
        title="Reset Demo State?"
        message="This will reset all bookings, bed assignments, payments, and support tickets back to the initial reference state. Are you sure?"
        confirmText="Reset State"
        type="warning"
      />

      {/* Real-time Broadcast Toast */}
      {showNotification && (
        <div className="bg-[#D9F58B] text-[#07552D] px-4 py-1.5 text-xs font-medium flex items-center justify-between shadow-inner animate-fadeIn">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#07552D] shrink-0" />
            <span className="truncate">{notificationMsg}</span>
          </div>
        </div>
      )}
    </header>
  );
}

