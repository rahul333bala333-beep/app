'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Upload, Plus, Check } from 'lucide-react';
import { getState, recordAuditLog } from '@/lib/store';
import { toast } from '@/components/ui/Toast';

export default function OwnerAddPropertyPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [locality, setLocality] = useState('HSR Layout');
  const [address, setAddress] = useState('');
  const [basePrice, setBasePrice] = useState(700);
  const [deposit, setDeposit] = useState(5000);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoCount, setPhotoCount] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordAuditLog('Rakesh Kumar', 'OWNER', 'Submitted PG for verification', 'Property', 'new', `${name} in ${locality}`);
    toast.success(`Property "${name}" submitted to Stayzy Admin for verification!`);
    router.push('/owner/properties');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/owner/properties" className="hover:text-black flex items-center gap-1 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My PGs
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-bold">Add New PG</span>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card">
        <div className="pb-4 border-b border-gray-100 mb-6">
          <h1 className="text-xl font-bold text-[#202820]">Add New PG Property</h1>
          <p className="text-xs text-gray-500 mt-0.5">Submit new PG details, location, and amenity checklist for verification</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">PG Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Green Valley Luxury PG"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-[#07552D]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Locality in Bengaluru</label>
              <select
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none"
              >
                <option value="HSR Layout">HSR Layout</option>
                <option value="Koramangala">Koramangala</option>
                <option value="BTM Layout">BTM Layout</option>
                <option value="Indiranagar">Indiranagar</option>
                <option value="Whitefield">Whitefield</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Base Price / Night (₹)</label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Full Physical Address</label>
            <textarea
              rows={2}
              required
              placeholder="Building number, Cross, Sector, Landmark"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg outline-none"
            />
          </div>

          <div className="p-4 bg-[#F7F9F5] rounded-xl border border-dashed border-gray-300 text-center">
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const count = e.target.files?.length || 0;
                if (count > 0) {
                  setPhotoCount(count);
                  toast.success(`${count} photo(s) selected and attached to verification packet`);
                }
              }}
            />
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <div className="font-semibold text-gray-700">Upload Property & Room Photos</div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              {photoCount > 0 ? `${photoCount} file(s) attached` : 'High-resolution exterior, room, and bathroom images'}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary text-xs py-1 px-3 mt-3 shadow-xs"
            >
              Browse Files
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Link href="/owner/properties" className="btn-secondary py-2 px-4 text-xs">
              Cancel
            </Link>
            <button type="submit" className="btn-primary py-2 px-5 text-xs font-bold shadow-sm">
              Submit PG for Verification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

