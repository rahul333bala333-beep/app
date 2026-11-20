'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Check, Image as ImageIcon } from 'lucide-react';
import { getState, savePropertyDetails } from '@/lib/store';
import { toast } from '@/components/ui/Toast';

export default function OwnerEditPropertyPage({ params }: { params: { propertyId: string } }) {
  const router = useRouter();
  const state = getState();
  const property = state.properties.find((p) => p.id === params.propertyId) || state.properties[0];
  const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'amenities' | 'listing'>('photos');
  const [name, setName] = useState(property.name);
  const [address, setAddress] = useState(property.address);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    savePropertyDetails(property.id, { name, address });
    toast.success(`Changes saved for ${name}!`);
    router.push('/owner/properties');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/owner/properties" className="hover:text-black flex items-center gap-1 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My PGs
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-bold">Edit {property.name}</span>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-[#202820]">Edit PG – {property.name}</h1>
            <p className="text-xs text-gray-500 mt-0.5">PG Owner Module 04 • High-resolution gallery management & amenity verification</p>
          </div>
        </div>

        {/* Edit Sub-tabs (Exact match to Reference Image 3 Module 4) */}
        <div className="flex items-center gap-2 border-b border-gray-200">
          {[
            { id: 'info', label: 'Basic Info' },
            { id: 'photos', label: 'Photos' },
            { id: 'amenities', label: 'Amenities' },
            { id: 'listing', label: 'Listing' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 px-3.5 text-xs font-semibold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-[#07552D] text-[#07552D]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div className="space-y-6">
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const count = e.target.files?.length || 0;
                if (count > 0) {
                  toast.success(`${count} image(s) uploaded to ${property.name} gallery`);
                }
              }}
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {property.photos.slice(0, 3).map((ph, idx) => (
                <div key={ph.id} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-video shadow-xs">
                  <img src={ph.url} alt={ph.caption || 'PG'} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => toast.success('Photo removed from property gallery')}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1 rounded-full text-xs transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-[#07552D] rounded-xl aspect-video flex flex-col items-center justify-center text-xs text-gray-500 hover:text-[#07552D] transition-colors"
              >
                <Plus className="w-5 h-5 mb-1" />
                <span>Add Photo</span>
              </button>
            </div>

            {/* Amenities Selected Chips */}
            <div className="pt-4 border-t border-gray-100">
              <div className="text-xs font-bold text-gray-800 mb-2.5">Amenities (selected)</div>
              <div className="flex flex-wrap gap-2 text-xs">
                {['Wi-Fi', 'Meals', 'Laundry', 'AC', 'Housekeeping', '24x7 Security'].map((am) => (
                  <span key={am} className="badge-lime font-medium px-3 py-1">
                    ✓ {am}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Basic Info Tab */}
        {activeTab === 'info' && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">PG Title</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Link href="/owner/properties" className="btn-secondary text-xs py-2 px-4">
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSave}
            className="btn-primary text-xs py-2 px-5 font-bold shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

