'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, Check, AlertCircle, ArrowRight, ShieldAlert, KeyRound, CheckCircle2 } from 'lucide-react';
import { getState, setCurrentUser } from '@/lib/store';
import { toast } from '@/components/ui/Toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const state = getState();

  const [email, setEmail] = useState('admin@stayzy.in');
  const [password, setPassword] = useState('••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successBanner, setSuccessBanner] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('logged_out') === 'true') {
        setSuccessBanner('You have been successfully logged out.');
      } else if (params.get('expired') === 'true') {
        setSessionExpired(true);
      }
    }
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          role: 'ADMIN',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication rejected. Staff credentials required.');
      }

      toast.success(`Welcome ${data.user.name}! Authenticated to Stayzy Administration.`);

      if (data.user) {
        setCurrentUser(data.user);
      }

      router.push('/admin/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Access Denied: Invalid staff credentials');
      toast.error(err.message || 'Admin authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202820]">STAYZY Administration</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Secure access to the STAYZY management platform.
          </p>
        </div>
        <span className="text-xs bg-gray-900 text-white font-mono px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
          <KeyRound className="w-3 h-3 text-[#D9F58B]" />
          <span>Privileged Access</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sign In Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8DE] p-6 sm:p-7 shadow-card space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#07552D] flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#202820]">Staff Sign In</h2>
              <p className="text-xs text-gray-500">Access Stayzy Operations Hub</p>
            </div>
          </div>

          {/* Security Alert if Error */}
          {/* Success / Logout Banner */}
          {successBanner && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successBanner}</span>
            </div>
          )}

          {/* Expired Session Banner */}
          {sessionExpired && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-semibold">Your session has expired. Please log in again.</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-rose-900">
                <ShieldAlert className="w-4 h-4 text-rose-600" /> Access Authorization Error
              </div>
              <p>{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Authorized Staff Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-xl focus:border-[#07552D] font-medium outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-xl focus:border-[#07552D] font-medium outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-500">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-[#07552D] rounded"
                />
                <span>Remember staff session</span>
              </label>
              <button
                type="button"
                onClick={() => toast.info('Staff credential recovery: contact IT security at security@stayzy.in')}
                className="text-gray-500 hover:text-black"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full text-xs py-2.5 font-bold shadow-sm rounded-xl flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Authorization...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
            Note: Public registrations are disabled for administrator interfaces. All access attempts are recorded in the security audit ledger.
          </div>
        </div>

        {/* Role Permissions Matrix (Exact match to Reference Image 1 Module 1) */}
        <div className="bg-white rounded-2xl border border-[#E2E8DE] p-6 sm:p-7 shadow-card space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#07552D]" />
            <h2 className="text-base font-bold text-[#202820]">Role Permissions</h2>
          </div>
          <p className="text-xs text-gray-500">
            Multi-tiered RBAC operational matrix across Admin, Operations and Support personnel
          </p>

          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F7F9F5] text-gray-700 border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Permission</th>
                  <th className="py-2.5 px-2 font-semibold text-center text-[#07552D]">Admin</th>
                  <th className="py-2.5 px-2 font-semibold text-center text-gray-700">Ops</th>
                  <th className="py-2.5 px-2 font-semibold text-center text-gray-700">Support</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {state.staffPermissions.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/80">
                    <td className="py-2.5 px-3 font-medium text-gray-800">{item.permission}</td>
                    <td className="py-2.5 px-2 text-center">
                      {item.admin ? <span className="text-[#07552D] font-bold">✓</span> : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {item.ops ? <span className="text-[#07552D] font-bold">✓</span> : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {item.support ? <span className="text-[#07552D] font-bold">✓</span> : <span className="text-gray-300">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
