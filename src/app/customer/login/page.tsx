'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Smartphone,
  Mail,
  CheckCircle2,
  ArrowRight,
  Star,
  MapPin,
  Building2,
  Lock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { OtpVerificationCard } from '@/components/auth/OtpVerificationCard';
import { setCurrentUser } from '@/lib/store';

export default function CustomerLoginPage() {
  const router = useRouter();

  // Auth Mode State: 'PHONE' | 'EMAIL'
  const [authMethod, setAuthMethod] = useState<'PHONE' | 'EMAIL'>('PHONE');

  // Input States
  const [phoneNumber, setPhoneNumber] = useState('98765 43210');
  const [emailAddress, setEmailAddress] = useState('aarav.sharma@gmail.com');
  const [countryCode, setCountryCode] = useState('+91');

  // Flow State: 'ENTRY' | 'OTP_SENT'
  const [step, setStep] = useState<'ENTRY' | 'OTP_SENT'>('ENTRY');

  // Loading & Error States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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

  // 1. Send OTP Handler (Phone SMS or Email)
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const destination = authMethod === 'PHONE' ? `${countryCode} ${phoneNumber.trim()}` : emailAddress.trim();

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          type: authMethod,
          purpose: 'CUSTOMER_LOGIN',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch verification code');
      }

      toast.success(
        authMethod === 'PHONE'
          ? `SMS verification code dispatched to ${destination}`
          : `Email OTP sent to ${destination}`
      );
      setStep('OTP_SENT');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error sending code. Please try again.');
      toast.error(err.message || 'Dispatch failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Verify OTP Handler
  const handleVerifyOtp = async (otpCode: string) => {
    setErrorMessage('');
    setIsSubmitting(true);

    const destination = authMethod === 'PHONE' ? `${countryCode} ${phoneNumber.trim()}` : emailAddress.trim();

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          otp: otpCode,
          type: authMethod,
          role: 'CUSTOMER',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Verification failed. Please check your code.');
      }

      toast.success('Signed in successfully! Welcome to Stayzy.');

      // Update client store state
      if (data.user) {
        setCurrentUser(data.user);
      }

      // Route to profile setup if new customer, otherwise directly to explore
      const destinationUrl = data.redirectTo || (data.isNewUser ? '/customer/profile-setup' : '/customer/explore');
      router.push(destinationUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired verification code');
      toast.error(err.message || 'Verification error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage('');

    try {
      // In production with Google Client ID configured, redirect to Google OAuth consent
      const res = await fetch('/api/auth/google?format=json');
      const data = await res.json();

      if (data.success && data.url && !data.url.includes('stayzy-dev-google-client-id')) {
        window.location.href = data.url;
        return;
      }

      // Development / Fallback Simulation: Verified Google Identity payload
      const verifyRes = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleProfile: {
            googleId: 'google-oauth-sub-10293847',
            email: 'aarav.google@gmail.com',
            name: 'Aarav Sharma',
            picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          },
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error || 'Google authentication failed');
      }

      toast.success('Signed in with Google!');
      if (verifyData.user) {
        setCurrentUser(verifyData.user);
      }

      const destinationUrl = verifyData.redirectTo || (verifyData.isNewUser ? '/customer/profile-setup' : '/customer/explore');
      router.push(destinationUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Google Sign-In failed');
      toast.error(err.message || 'Google authentication error');
      setIsGoogleLoading(false);
    }
  };

  const activeDestination = authMethod === 'PHONE' ? `${countryCode} ${phoneNumber.trim()}` : emailAddress.trim();

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4">
      <div className="max-w-5xl w-full bg-white rounded-3xl border border-[#E2E8DE] shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Desktop Visual Banner (5 cols) */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-br from-[#07552D] via-[#054021] to-[#032815] text-white p-8 flex-col justify-between overflow-hidden">
          {/* Subtle background overlay */}
          <div
            className="absolute inset-0 opacity-20 mix-blend-overlay bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80')`,
            }}
          />

          {/* Top Brand Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#D9F58B] text-[#07552D] font-black text-sm flex items-center justify-center shadow-xs">
                SZ
              </span>
              <span className="font-black text-xl tracking-tight text-white">Stayzy</span>
            </div>
            <div className="mt-8 space-y-2">
              <span className="inline-block px-3 py-1 bg-[#D9F58B]/20 text-[#D9F58B] border border-[#D9F58B]/30 rounded-full text-xs font-bold">
                Bengaluru Tech Corridors
              </span>
              <h2 className="text-2xl font-black text-white leading-tight">
                Find your perfect stay. Book verified PGs with confidence.
              </h2>
              <p className="text-xs text-gray-300 leading-relaxed pt-1">
                Zero brokerage, transparent pricing, and instant bed allotments across HSR Layout, Koramangala, BTM Layout & Whitefield.
              </p>
            </div>
          </div>

          {/* Key Trust Pillars */}
          <div className="relative z-10 space-y-3 my-6 text-xs">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
              <ShieldCheck className="w-4 h-4 text-[#D9F58B] shrink-0" />
              <span className="font-medium text-gray-100">100% In-Person Physical Verification</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-[#D9F58B] shrink-0" />
              <span className="font-medium text-gray-100">Live Bed Inventory & Instant Confirmation</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
              <Sparkles className="w-4 h-4 text-[#D9F58B] shrink-0" />
              <span className="font-medium text-gray-100">Complimentary 3-Time Meals, Wi-Fi & AC</span>
            </div>
          </div>

          {/* Resident Social Proof Footer */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-300">
            <div className="flex items-center gap-1 text-[#D9F58B]">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#D9F58B]" />
              ))}
            </div>
            <span>Trusted by 10,000+ happy residents</span>
          </div>
        </div>

        {/* Right Authentication Card (7 cols) */}
        <div className="col-span-1 lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div className="max-w-md mx-auto w-full space-y-6">
            {/* Mobile Branding Bar */}
            <div className="lg:hidden flex items-center justify-between pb-3 border-b border-gray-100 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#D9F58B] text-[#07552D] font-black text-xs flex items-center justify-center">
                  SZ
                </span>
                <span className="font-black text-lg tracking-tight text-[#07552D]">Stayzy</span>
              </div>
              <span className="text-[11px] text-gray-500 font-semibold">Resident Portal</span>
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

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* VIEW 1: Entry Screen (Phone / Google / Email) */}
            {step === 'ENTRY' ? (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-[#202820] tracking-tight">Welcome to Stayzy</h1>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Sign in to discover verified PGs, manage bed bookings, and track your stay.
                  </p>
                </div>

                {/* Google Sign-In Primary Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || isSubmitting}
                  className="w-full py-3 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 text-xs font-bold text-gray-800 flex items-center justify-center gap-3 shadow-xs transition-colors disabled:opacity-50"
                >
                  {isGoogleLoading ? (
                    <span className="w-4 h-4 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>Continue with Google</span>
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-gray-200 w-full" />
                  <span className="bg-white px-3 text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                    or continue with
                  </span>
                </div>

                {/* Authentication Method Selector Tabs */}
                <div className="flex rounded-xl bg-gray-100 p-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod('PHONE');
                      setErrorMessage('');
                    }}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      authMethod === 'PHONE'
                        ? 'bg-[#07552D] text-[#D9F58B] shadow-sm'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile SMS OTP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod('EMAIL');
                      setErrorMessage('');
                    }}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      authMethod === 'EMAIL'
                        ? 'bg-[#07552D] text-[#D9F58B] shadow-sm'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Gmail Email OTP</span>
                  </button>
                </div>

                {/* Method A: Mobile Phone Form */}
                {authMethod === 'PHONE' && (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Mobile Phone Number
                      </label>
                      <div className="flex rounded-xl border border-gray-300 focus-within:border-[#07552D] focus-within:ring-1 focus-within:ring-[#07552D] overflow-hidden bg-white">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="px-3 py-2.5 bg-gray-50 border-r border-gray-200 text-xs font-bold text-gray-800 outline-none"
                        >
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                        </select>
                        <input
                          type="tel"
                          required
                          placeholder="98765 43210"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full px-3 py-2.5 text-xs font-bold text-gray-900 outline-none"
                        />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">
                        We will deliver a 6-digit verification code through SMS.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !phoneNumber.trim()}
                      className="btn-primary w-full text-xs py-3 rounded-xl font-bold shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Requesting SMS OTP...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Verification OTP</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Method B: Email OTP Form */}
                {authMethod === 'EMAIL' && (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Gmail or Work Email Address
                      </label>
                      <div className="flex items-center rounded-xl border border-gray-300 focus-within:border-[#07552D] focus-within:ring-1 focus-within:ring-[#07552D] px-3 py-2.5 bg-white">
                        <Mail className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                        <input
                          type="email"
                          required
                          placeholder="name@gmail.com"
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                          className="w-full text-xs font-bold text-gray-900 outline-none"
                        />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">
                        A secure 6-digit magic code will be dispatched to your inbox.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !emailAddress.trim()}
                      className="btn-primary w-full text-xs py-3 rounded-xl font-bold shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Sending Email Code...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Email OTP</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              /* VIEW 2: 6-Box OTP Verification Screen */
              <OtpVerificationCard
                destination={activeDestination}
                type={authMethod}
                onVerify={handleVerifyOtp}
                onResend={handleSendOtp}
                onChangeDestination={() => {
                  setStep('ENTRY');
                  setErrorMessage('');
                }}
                isLoading={isSubmitting}
              />
            )}
          </div>

          {/* Legal and Portal Switcher Footer */}
          <div className="pt-8 border-t border-gray-100 mt-6 text-center text-[11px] text-gray-500 space-y-2">
            <p>
              By continuing, you agree to Stayzy&apos;s{' '}
              <a href="#" className="text-[#07552D] underline font-medium">Terms of Service</a> and{' '}
              <a href="#" className="text-[#07552D] underline font-medium">Privacy Policy</a>.
            </p>
            <div className="flex items-center justify-center gap-4 pt-1 font-semibold text-gray-600">
              <Link href="/owner/login" className="hover:text-[#07552D] flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>PG Owner Login</span>
              </Link>
              <span>•</span>
              <Link href="/admin/login" className="hover:text-[#07552D] flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Staff Sign-In</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
