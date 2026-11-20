'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Calendar, BedDouble, CheckCircle2, ArrowRight } from 'lucide-react';
import { getState } from '@/lib/store';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';

function SelectBedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const state = getState();
  const propertyId = searchParams.get('propertyId') || 'prop-hsr-1';
  const property = state.properties.find((p) => p.id === propertyId) || state.properties[0];

  const [selectedBedType, setSelectedBedType] = useState('Single Bed – Non AC');
  const [selectedRate, setSelectedRate] = useState(700);
  const [nights, setNights] = useState(7);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [tempNights, setTempNights] = useState('7');

  const bedOptions = [
    { type: 'Single Bed – Non AC', avail: 1, rate: 700 },
    { type: 'Single Bed – AC', avail: 2, rate: 900 },
    { type: 'Sharing (Twin) – Non AC', avail: 3, rate: 750 },
  ];

  const handleContinue = () => {
    router.push(
      `/customer/checkout?propertyId=${property.id}&bedType=${encodeURIComponent(selectedBedType)}&rate=${selectedRate}&nights=${nights}`
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/customer/pg/${property.id}`} className="p-1 rounded-full hover:bg-gray-200 text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-base font-bold text-gray-900">Select Dates & Bed</h1>
          <p className="text-xs text-gray-500">{property.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8DE] p-5 shadow-card space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Your stay dates</label>
          <div className="bg-[#F1FCDF] border border-[#D9F58B] p-3.5 rounded-xl flex items-center justify-between text-xs font-bold text-[#07552D]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#07552D]" />
              <span>12 Dec – 19 Dec ({nights} nights)</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setTempNights(String(nights));
                setIsDateModalOpen(true);
              }}
              className="text-[11px] underline text-[#07552D] hover:opacity-80"
            >
              Change
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="text-xs font-bold text-gray-800">Available beds at {property.name}</div>

          {bedOptions.map((opt) => {
            const isSelected = selectedBedType === opt.type;
            return (
              <div
                key={opt.type}
                onClick={() => {
                  setSelectedBedType(opt.type);
                  setSelectedRate(opt.rate);
                }}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-[#07552D] bg-[#F1FCDF] shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-[#07552D]' : 'border-gray-300'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-[#07552D]" />}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{opt.type}</div>
                    <div className="text-[11px] text-gray-500">{opt.avail} bed available</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-black text-sm text-[#07552D]">₹{opt.rate}</span>
                  <span className="text-[10px] text-gray-500"> / night</span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleContinue}
          className="btn-primary w-full text-xs py-3 rounded-xl font-bold shadow-md flex items-center justify-center gap-2"
        >
          <span>Continue to Checkout</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Select Stay Duration Modal */}
      <Modal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        title="Select Stay Duration"
        subtitle="Choose how long you plan to stay at this PG"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setIsDateModalOpen(false)}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                const val = parseInt(tempNights, 10);
                if (val && val >= 1) {
                  setNights(val);
                  setIsDateModalOpen(false);
                  toast.success(`Stay duration set to ${val} nights`);
                }
              }}
              className="btn-primary text-xs py-1.5 px-4 font-bold"
            >
              Apply Dates
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-2">Preset Durations</label>
            <div className="grid grid-cols-3 gap-2">
              {[7, 14, 30].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setTempNights(String(num))}
                  className={`py-2 rounded-xl font-bold border transition-colors ${
                    tempNights === String(num)
                      ? 'bg-[#07552D] text-[#D9F58B] border-[#07552D]'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {num} Nights
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Custom Number of Nights</label>
            <input
              type="number"
              min={1}
              max={365}
              value={tempNights}
              onChange={(e) => setTempNights(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl font-bold text-gray-900 outline-none focus:border-[#07552D]"
              placeholder="e.g. 7"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function CustomerSelectBedPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Loading bed options...</div>}>
      <SelectBedContent />
    </Suspense>
  );
}
