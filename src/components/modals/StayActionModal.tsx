'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { toast } from '../ui/Toast';
import { CalendarPlus, AlertTriangle, AlertCircle } from 'lucide-react';

export interface StayActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  booking: {
    id: string;
    bookingNumber: string;
    propertyName: string;
    nightlyRate: number;
    nightsCount: number;
  } | null;
  mode: 'EXTEND' | 'CANCEL';
}

export function StayActionModal({ isOpen, onClose, onSuccess, booking, mode }: StayActionModalProps) {
  const [additionalNights, setAdditionalNights] = useState('7');
  const [cancelReason, setCancelReason] = useState('Change of travel / relocation plans');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!booking) return null;

  const isExtend = mode === 'EXTEND';
  const additionalCost = parseInt(additionalNights, 10) * booking.nightlyRate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (isExtend) {
        const res = await fetch(`/api/bookings/${booking.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'EXTEND_STAY',
            additionalNights: parseInt(additionalNights, 10),
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to extend stay');
        toast.success(`Stay extended by ${additionalNights} nights!`);
      } else {
        const res = await fetch(`/api/bookings/${booking.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'CANCEL',
            reason: cancelReason.trim(),
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to cancel booking');
        toast.success(`Booking ${booking.bookingNumber} cancelled. Refund request initiated.`);
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Operation failed.');
      toast.error(err.message || 'Error processing request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isExtend ? 'Extend Your Stay' : 'Cancel Reservation'}
      subtitle={`Booking: ${booking.bookingNumber} • ${booking.propertyName}`}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition"
          >
            Keep Stay
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white transition flex items-center gap-2 shadow-sm ${
              isExtend ? 'bg-[#07552D] hover:bg-[#064223]' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isExtend ? (
              <CalendarPlus className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span>{isExtend ? `Extend Stay (+₹${additionalCost.toLocaleString('en-IN')})` : 'Confirm Cancellation'}</span>
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

        {isExtend ? (
          <>
            <div>
              <label className="block text-xs font-bold text-[#202820] mb-1.5">Extend Duration</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { days: '7', label: '+7 Nights (1 Wk)' },
                  { days: '14', label: '+14 Nights (2 Wks)' },
                  { days: '30', label: '+30 Nights (1 Mo)' },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.days}
                    onClick={() => setAdditionalNights(opt.days)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition ${
                      additionalNights === opt.days
                        ? 'bg-[#07552D] text-white border-[#07552D] shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs sm:text-sm space-y-2">
              <div className="flex justify-between text-gray-500">
                <span>Nightly Rate:</span>
                <span className="font-bold text-[#202820]">₹{booking.nightlyRate}/night</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Additional Duration:</span>
                <span className="font-bold text-[#202820]">{additionalNights} nights</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-black text-[#202820] text-sm">
                <span>Total Extension Payable:</span>
                <span className="text-[#07552D]">₹{additionalCost.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-900 leading-relaxed">
              <p className="font-bold mb-1">Cancellation Policy Notice</p>
              <p>
                Cancellations requested 24 hours prior to scheduled check-in qualify for a full refund minus a 5% platform handling fee.
                Your assigned bed will be freed for other prospective residents immediately.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#202820] mb-1">
                Reason for Cancellation <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Help us understand why you are cancelling..."
                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DE] rounded-xl text-xs sm:text-sm text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]"
              />
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}

