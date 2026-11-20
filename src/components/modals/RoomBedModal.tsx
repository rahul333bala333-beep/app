'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { toast } from '../ui/Toast';
import { BedDouble, AlertCircle } from 'lucide-react';
import { getState } from '@/lib/store';

export interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  propertyId?: string;
}

export function AddRoomModal({ isOpen, onClose, onSuccess, propertyId = 'prop-hsr-1' }: AddRoomModalProps) {
  const [roomNumber, setRoomNumber] = useState('');
  const [sharingType, setSharingType] = useState('2');
  const [floor, setFloor] = useState('1');
  const [isAc, setIsAc] = useState(false);
  const [basePricePerNight, setBasePricePerNight] = useState('750');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim()) {
      setErrorMessage('Please enter a room number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          roomNumber: roomNumber.trim(),
          sharingType: parseInt(sharingType, 10),
          floor: parseInt(floor, 10),
          isAc,
          basePricePerNight: parseInt(basePricePerNight, 10),
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to add room');

      toast.success(`Room ${roomNumber} added with ${sharingType} beds!`);
      setRoomNumber('');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating room.');
      toast.error(err.message || 'Failed to add room');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Room & Bed Inventory"
      subtitle="Creates a room and automatically sets up beds based on sharing capacity."
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#07552D] hover:bg-[#064223] text-white transition flex items-center gap-2 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <BedDouble className="w-4 h-4" />
                <span>Add Room</span>
              </>
            )}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#202820] mb-1">
              Room Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="e.g. 105 or A-201"
              className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DE] rounded-xl text-xs sm:text-sm text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#202820] mb-1">Floor</label>
            <input
              type="number"
              min="0"
              max="10"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DE] rounded-xl text-xs sm:text-sm text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#202820] mb-1">Sharing Type</label>
            <select
              value={sharingType}
              onChange={(e) => setSharingType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DE] rounded-xl text-xs sm:text-sm text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]"
            >
              <option value="1">1 Sharing (Private)</option>
              <option value="2">2 Sharing (Twin)</option>
              <option value="3">3 Sharing</option>
              <option value="4">4 Sharing</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#202820] mb-1">Price / Night (₹)</label>
            <input
              type="number"
              value={basePricePerNight}
              onChange={(e) => setBasePricePerNight(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DE] rounded-xl text-xs sm:text-sm text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2.5 cursor-pointer mt-1">
            <input
              type="checkbox"
              checked={isAc}
              onChange={(e) => setIsAc(e.target.checked)}
              className="w-4 h-4 rounded text-[#07552D] focus:ring-[#07552D]"
            />
            <span className="text-xs sm:text-sm font-bold text-[#202820]">Equipped with Air Conditioning (AC)</span>
          </label>
        </div>
      </form>
    </Modal>
  );
}

