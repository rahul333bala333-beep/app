'use client';

import React, { useState } from 'react';
import { LogOut, Loader2, AlertTriangle } from 'lucide-react';

interface LogoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role?: 'CUSTOMER' | 'OWNER' | 'ADMIN';
}

export function LogoutDialog({ isOpen, onClose, role = 'CUSTOMER' }: LogoutDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirmLogout = async () => {
    try {
      setIsSubmitting(true);

      // 1. Invalidate active server session & delete HTTP-only cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      // 2. Clear client-side cached auth state & tokens
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('stayzy_user');
          localStorage.removeItem('stayzy_role');
          localStorage.removeItem('stayzy_token');
          sessionStorage.clear();
        } catch (e) {
          console.error('[Logout Storage Clear Error]', e);
        }
      }

      // 3. Determine target redirect portal
      let redirectUrl = '/customer/login?logged_out=true';
      if (role === 'OWNER') {
        redirectUrl = '/owner/login?logged_out=true';
      } else if (role === 'ADMIN') {
        redirectUrl = '/admin/login?logged_out=true';
      }

      // 4. Force hard navigation replacing history to purge cache & React tree
      window.location.replace(redirectUrl);
    } catch (err) {
      console.error('[Logout Execution Error]', err);
      // Fallback redirect even on network failure
      const fallbackUrl = role === 'OWNER' ? '/owner/login?logged_out=true' : role === 'ADMIN' ? '/admin/login?logged_out=true' : '/customer/login?logged_out=true';
      window.location.replace(fallbackUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={isSubmitting ? undefined : onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 z-10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3.5 mb-3">
          <div className="w-11 h-11 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 leading-tight">
              Log out of STAYZY?
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Confirm ending your active session
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed my-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
          Are you sure you want to log out of your account? Any unsaved changes in this session will be preserved on your account.
        </p>

        <div className="flex items-center justify-end gap-2.5 mt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmLogout}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Logging out...</span>
              </>
            ) : (
              <>
                <LogOut className="w-3.5 h-3.5" />
                <span>Yes, Log Out</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

