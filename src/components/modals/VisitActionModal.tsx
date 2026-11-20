'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { toast } from '../ui/Toast';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { getState } from '@/lib/store';

export interface VisitActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  visitToReschedule?: {
    id: string;
    propertyName?: string;
    scheduledTime?: string;
  } | null;
  defaultPropertyId?: string;
}

export function VisitActionModal({
  isOpen,
  onClose,
  onSuccess,
  visitToReschedule,
  defaultPropertyId,
}: VisitActionModalProps) {
  const isRescheduling = Boolean(visitToReschedule);
  const properties = getState().properties;

  const [propertyId, setPropertyId] = useState(defaultPropertyId || properties[0]?.id || 'prop-hsr-1');
  const [date, setDate] = useState('2024-12-12');
  const [time, setTime] = useState('15:00');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const scheduledTime = new Date(`${date}T${time}:00`).toISOString();

      if (isRescheduling && visitToReschedule) {
        const res = await fetch(`/api/visits/${visitToReschedule.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'RESCHEDULED',
            scheduledTime,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to reschedule visit');
        toast.success('Visit rescheduled successfully!');
      } else {
        const res = await fetch('/api/visits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyId,
            scheduledTime,
            note: notes.trim(),
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to schedule visit');
        toast.success('Property visit request submitted!');
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error updating visit.');
      toast.error(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isRescheduling ? 'Reschedule Property Visit' : 'Schedule a Property Visit'}
      subtitle={
        isRescheduling
          ? `Visit for: ${visitToReschedule?.propertyName || 'PG Accommodation'}`
          : 'Meet the property manager and inspect rooms in person.'
      }
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
              <Calendar className="w-4 h-4" />
            )}
            <span>{isRescheduling ? 'Save New Appointment' : 'Confirm Visit'}</span>
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

        {!isRescheduling && (
          <div>
            <label className="block text-xs font-bold text-[#202820] mb-1">Select Property</label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DE] rounded-xl text-xs sm:text-sm text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.locality})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#202820] mb-1">Visit Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DE] rounded-xl text-xs sm:text-sm text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#202820] mb-1">Time Slot</label>
            <input
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DE] rounded-xl text-xs sm:text-sm text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]"
            />
          </div>
        </div>

        {!isRescheduling && (
          <div>
            <label className="block text-xs font-bold text-[#202820] mb-1">Notes / Preferences</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Interested in seeing 1st floor single rooms and meal facilities..."
              className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DE] rounded-xl text-xs sm:text-sm text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]"
            />
          </div>
        )}
      </form>
    </Modal>
  );
}

