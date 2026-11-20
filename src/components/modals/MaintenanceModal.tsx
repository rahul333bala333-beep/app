'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { toast } from '../ui/Toast';
import { Wrench, AlertCircle } from 'lucide-react';
import { getState } from '@/lib/store';

export interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  propertyId?: string;
}

export function MaintenanceModal({
  isOpen,
  onClose,
  onSuccess,
  propertyId = 'prop-hsr-1',
}: MaintenanceModalProps) {
  const rooms = getState().rooms.filter((r) => r.propertyId === propertyId);
  const [roomId, setRoomId] = useState(rooms[0]?.id || '');
  const [startDate, setStartDate] = useState('2024-12-12');
  const [endDate, setEndDate] = useState('2024-12-18');
  const [reason, setReason] = useState('Annual AC duct servicing & deep cleaning');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMessage('Please state the maintenance reason.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          roomId: roomId || undefined,
          startDate,
          endDate,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to block maintenance dates');

      toast.success('Maintenance block scheduled! Dates blacked out from booking.');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating maintenance block.');
      toast.error(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Room Maintenance Block"
      subtitle="Blocks availability on the calendar to prevent customer reservations."
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
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Wrench className="w-4 h-4" />
            )}
            <span>Confirm Maintenance Block</span>
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

        <div>
          <label className="block text-xs font-bold text-[#202820] mb-1">Target Room</label>
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DE] rounded-xl text-xs sm:text-sm text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]"
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                Room {r.roomNumber} ({r.sharingType} Sharing {r.isAc ? '• AC' : ''})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#202820] mb-1">Start Date</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DE] rounded-xl text-xs sm:text-sm text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#202820] mb-1">End Date</label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DE] rounded-xl text-xs sm:text-sm text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#202820] mb-1">
            Reason / Work Description <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Annual AC duct servicing & deep cleaning"
            className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DE] rounded-xl text-xs sm:text-sm text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]"
          />
        </div>
      </form>
    </Modal>
  );
}

