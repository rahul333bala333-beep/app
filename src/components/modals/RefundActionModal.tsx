'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { toast } from '../ui/Toast';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export interface RefundActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  refund: {
    id: string;
    bookingNumber: string;
    customerName: string;
    amount: number;
    reason: string;
  } | null;
}

export function RefundActionModal({ isOpen, onClose, onSuccess, refund }: RefundActionModalProps) {
  const [action, setAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!refund) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/refunds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refundId: refund.id,
          action,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to process refund');

      toast.success(
        action === 'APPROVE'
          ? `Refund of ₹${refund.amount.toLocaleString('en-IN')} approved for ${refund.customerName}!`
          : `Refund request for ${refund.bookingNumber} has been rejected.`
      );

      setNotes('');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing refund request.');
      toast.error(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review Refund Request"
      subtitle={`Booking: ${refund.bookingNumber} • Guest: ${refund.customerName}`}
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
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white transition flex items-center gap-2 shadow-sm ${
              action === 'APPROVE' ? 'bg-[#07552D] hover:bg-[#064223]' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : action === 'APPROVE' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            <span>{action === 'APPROVE' ? 'Approve & Refund' : 'Reject Request'}</span>
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

        {/* Claim Summary Box */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs sm:text-sm space-y-1.5">
          <div className="flex justify-between text-gray-500">
            <span>Refund Amount:</span>
            <span className="font-bold text-[#202820] text-sm">₹{refund.amount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Stated Reason:</span>
            <span className="font-medium text-[#202820] text-right max-w-[200px]">{refund.reason}</span>
          </div>
        </div>

        {/* Action Choice */}
        <div>
          <label className="block text-xs font-bold text-[#202820] mb-1.5">Administrative Decision</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAction('APPROVE')}
              className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                action === 'APPROVE'
                  ? 'bg-green-100 text-green-800 border-green-300 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              Approve Refund
            </button>
            <button
              type="button"
              onClick={() => setAction('REJECT')}
              className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                action === 'REJECT'
                  ? 'bg-red-100 text-red-800 border-red-300 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              Reject Refund
            </button>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-[#202820] mb-1">
            Resolution Notes (Visible to Customer)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              action === 'APPROVE'
                ? 'e.g. Approved per 24-hour advance cancellation policy.'
                : 'e.g. Booking non-refundable after standard check-in window.'
            }
            className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DE] rounded-xl text-xs sm:text-sm text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]"
          />
        </div>
      </form>
    </Modal>
  );
}

