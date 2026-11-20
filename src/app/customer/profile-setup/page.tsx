'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Building2,
  ArrowRight,
  Briefcase,
  Sparkles,
  Lock,
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { getState, setCurrentUser } from '@/lib/store';

export default function CustomerProfileSetupPage() {
  const router = useRouter();
  const state = getState();

  const [name, setName] = useState('Aarav Sharma');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('aarav.sharma@gmail.com');
  const [movingTo, setMovingTo] = useState('Bengaluru');
  const [preferredLocality, setPreferredLocality] = useState('HSR Layout');
  const [genderPreference, setGenderPreference] = useState<'MALE' | 'FEMALE' | 'UNISEX'>('MALE');
  const [occupation, setOccupation] = useState('Working IT Professional');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing session details if available
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            if (data.user.name && data.user.name !== 'Stayzy Guest') setName(data.user.name);
            if (data.user.phone) setPhone(data.user.phone);
            if (data.user.email) setEmail(data.user.email);
            if (data.user.movingTo) setMovingTo(data.user.movingTo);
          }
        }
      } catch {}
    }
    fetchSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          movingTo,
          preferredLocality,
          genderPreference,
          occupation,
          profileCompleted: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update profile');
      }

      toast.success('Profile created successfully! Finding verified PGs for you.');

      // Sync state in store
      if (data.user) {
        setCurrentUser(data.user);
      }

      router.push('/customer/explore');
    } catch (err: any) {
      toast.error(err.message || 'Error saving profile');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl border border-[#E2E8DE] p-6 sm:p-10 shadow-card space-y-6">
        {/* Step Progress Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D9F58B] text-[#07552D] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step 2 of 2 • Instant Resident Profile</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#202820]">
              Welcome to Stayzy, {name.split(' ')[0]}!
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Customise your accommodation preferences to discover matched beds in Bengaluru.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Identity Verification Details */}
          <div className="p-4 bg-[#F7F9F5] rounded-2xl border border-[#E2E8DE] space-y-4">
            <div className="flex items-center gap-2 font-bold text-gray-900 pb-2 border-b border-gray-200">
              <ShieldCheck className="w-4 h-4 text-[#07552D]" />
              <span>Verified Account Credentials</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Legal Name</label>
                <div className="flex items-center bg-white border border-gray-300 rounded-xl px-3 py-2">
                  <User className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full font-bold text-gray-900 outline-none"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Verified Mobile Number</label>
                <div className="flex items-center bg-gray-100/80 border border-gray-200 rounded-xl px-3 py-2 cursor-not-allowed">
                  <Lock className="w-3.5 h-3.5 text-gray-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    readOnly
                    value={phone}
                    className="w-full font-bold text-gray-700 outline-none bg-transparent cursor-not-allowed"
                  />
                  <CheckCircle2 className="w-4 h-4 text-[#07552D] shrink-0" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
                <div className="flex items-center bg-white border border-gray-300 rounded-xl px-3 py-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full font-bold text-gray-900 outline-none"
                    placeholder="name@gmail.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Relocation & Accommodation Preferences */}
          <div className="space-y-4">
            <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#07552D]" />
              <span>Relocation & Stay Preferences</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Target City</label>
                <select
                  value={movingTo}
                  onChange={(e) => setMovingTo(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl font-bold text-gray-900 outline-none focus:border-[#07552D]"
                >
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Pune">Pune</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Preferred Locality in Bengaluru</label>
                <select
                  value={preferredLocality}
                  onChange={(e) => setPreferredLocality(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl font-bold text-gray-900 outline-none focus:border-[#07552D]"
                >
                  <option value="HSR Layout">HSR Layout (Sectors 1-7)</option>
                  <option value="Koramangala">Koramangala (Blocks 1-8)</option>
                  <option value="BTM Layout">BTM Layout (Stages 1-2)</option>
                  <option value="Whitefield">Whitefield (ITPB Corridor)</option>
                  <option value="Electronic City">Electronic City (Phases 1-2)</option>
                  <option value="Indiranagar">Indiranagar (100ft Road)</option>
                </select>
              </div>
            </div>

            {/* Gender / PG Type Preference */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1.5">PG Type Category</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'MALE', label: 'Boys PG' },
                  { id: 'FEMALE', label: 'Girls PG' },
                  { id: 'UNISEX', label: 'Coliving Space' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGenderPreference(item.id as any)}
                    className={`py-2.5 px-3 rounded-xl border text-center font-bold transition-all ${
                      genderPreference === item.id
                        ? 'bg-[#07552D] text-[#D9F58B] border-[#07552D] shadow-xs'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Profession */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Profession / Status</label>
              <div className="flex items-center bg-white border border-gray-300 rounded-xl px-3 py-2">
                <Briefcase className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  required
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full font-medium text-gray-900 outline-none"
                  placeholder="e.g. Software Engineer, Design Student, Relocating"
                />
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push('/customer/explore')}
              className="text-gray-500 hover:text-black font-semibold text-xs underline"
            >
              Skip for now
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-xs py-3 px-6 rounded-xl font-bold shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <span>Complete Profile & Explore PGs</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

