'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  ShieldCheck,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Smartphone,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { getState, setCurrentUser } from '@/lib/store';
import { toast } from '@/components/ui/Toast';
import { OtpVerificationCard } from '@/components/auth/OtpVerificationCard';

export default function OwnerLoginPage() {
  const router = useRouter();
  const state = getState();

  // Mode: 'PASSWORD' | 'OTP'
  const [loginMethod, setLoginMethod] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [otpStep, setOtpStep] = useState<'INPUT' | 'VERIFY'>('INPUT');

  // Input states
  const [email, setEmail] = useState('owner@hsrgardenpg.com');
  const [password, setPassword] = useState('••••••••');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [showPassword, setShowPassword] = useState(false);

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [suspendedError, setSuspendedError] = useState(false);
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

  // Email & Password Submit
  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuspendedError(false);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          role: 'OWNER',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (res.status === 403 && data.error?.includes('suspended')) {
          setSuspendedError(true);
        }
        throw new Error(data.error || 'Authentication failed');
      }

      toast.success('Welcome back! Signed in to PG Owner Portal.');
      if (data.user) {
        setCurrentUser(data.user);
      }
      router.push('/owner/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify credentials.');
      toast.error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // SMS OTP Request
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: phone.trim(),
          type: 'PHONE',
          purpose: 'OWNER_LOGIN',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send OTP to owner phone number');
      }

      toast.success(`Owner verification code sent to ${phone}`);
      setOtpStep('VERIFY');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send code');
      toast.error(err.message || 'OTP dispatch failed');
    } finally {
      setIsLoading(false);
    }
  };

  // SMS OTP Verify
  const handleVerifyOtp = async (otpCode: string) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: phone.trim(),
          otp: otpCode,
          type: 'PHONE',
          role: 'OWNER',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid OTP code');
      }

      toast.success('Owner identity confirmed!');
      if (data.user) {
        setCurrentUser(data.user);
      }
      router.push('/owner/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed');
      toast.error(err.message || 'Verification error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202820]">Welcome Back, PG Owner</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your properties, bookings, residents and earnings with STAYZY.
          </p>
        </div>
        <span className="text-xs bg-gray-100 text-gray-700 font-mono px-3 py-1 rounded-lg font-bold">
          Stayzy / Partner Portal
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sign In Box */}
        <div className="bg-white rounded-2xl border border-[#E2E8DE] p-6 sm:p-7 shadow-card space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBFCC0] text-[#07552D] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#202820]">Owner Sign In</h2>
              <p className="text-xs text-gray-500">Access your property dashboard</p>
            </div>
          </div>

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

          {/* Account Restriction Banner if Suspended */}
          {suspendedError && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-rose-900">
                <ShieldAlert className="w-4 h-4 text-rose-600" /> Account Restriction Notice
              </div>
              <p>Your property partner account is suspended. Please contact Stayzy Compliance at partner-compliance@stayzy.in.</p>
            </div>
          )}

          {errorMessage && !suspendedError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Switcher Tabs */}
          <div className="flex rounded-xl bg-gray-100 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('PASSWORD');
                setErrorMessage('');
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                loginMethod === 'PASSWORD'
                  ? 'bg-[#07552D] text-[#D9F58B] shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Email & Password
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('OTP');
                setOtpStep('INPUT');
                setErrorMessage('');
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                loginMethod === 'OTP'
                  ? 'bg-[#07552D] text-[#D9F58B] shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Registered Mobile OTP
            </button>
          </div>

          {/* METHOD 1: Password Form */}
          {loginMethod === 'PASSWORD' && (
            <form onSubmit={handlePasswordSignIn} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Registered Owner Email</label>
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
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 bg-white border border-gray-300 rounded-xl focus:border-[#07552D] font-medium outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-[#07552D] rounded" />
                  <span>Remember this device</span>
                </label>
                <button
                  type="button"
                  onClick={() => toast.info('Password reset instructions sent to registered email')}
                  className="text-[#07552D] hover:underline font-semibold"
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
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* METHOD 2: SMS OTP Flow */}
          {loginMethod === 'OTP' && (
            <div>
              {otpStep === 'INPUT' ? (
                <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Registered Mobile Number
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 bg-white focus-within:border-[#07552D]">
                      <Smartphone className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full font-bold text-gray-900 outline-none"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Must match the mobile number registered on your PG Owner account.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !phone.trim()}
                    className="btn-primary w-full text-xs py-2.5 font-bold shadow-sm rounded-xl flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending SMS OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Owner OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <OtpVerificationCard
                  destination={phone}
                  type="PHONE"
                  onVerify={handleVerifyOtp}
                  onResend={handleRequestOtp}
                  onChangeDestination={() => setOtpStep('INPUT')}
                  isLoading={isLoading}
                />
              )}
            </div>
          )}
        </div>

        {/* Verification Status Card (Exact match to Reference Image 3 Module 1) */}
        <div className="bg-[#F1FCDF] border border-[#D9F58B] p-6 rounded-2xl flex flex-col justify-between shadow-card">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#07552D] text-[#D9F58B] flex items-center justify-center font-bold">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#07552D]">Owner Verified</h3>
                <div className="text-xs text-gray-700 font-semibold">HSR Garden PG</div>
              </div>
            </div>

            <div className="space-y-2.5 pt-2 text-xs">
              <div className="flex items-center gap-2 text-gray-800">
                <div className="w-4 h-4 rounded-full bg-[#07552D] text-white flex items-center justify-center text-[10px]">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="font-semibold">Identity Verified (Aadhaar & PAN)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-800">
                <div className="w-4 h-4 rounded-full bg-[#07552D] text-white flex items-center justify-center text-[10px]">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="font-semibold">Property Ownership Documents</span>
              </div>
              <div className="flex items-center gap-2 text-gray-800">
                <div className="w-4 h-4 rounded-full bg-[#07552D] text-white flex items-center justify-center text-[10px]">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="font-semibold">Bank Payout Account Linked</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#c6e872] mt-6 text-xs text-[#07552D] font-medium flex items-center justify-between">
            <span>Verified on 10 Dec 2024</span>
            <span className="font-bold">Active Partner</span>
          </div>
        </div>
      </div>
    </div>
  );
}
