'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { toast } from '../ui/Toast';
import { IndianRupee, AlertCircle } from 'lucide-react';

export interface PayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  pendingAmount?: number;
}

export function PayoutModal({ isOpen, onClose, onSuccess, pendingAmount = 15000 }: PayoutModalProps) {
  const [amount, setAmount] = useState(String(pendingAmount));
  const [bankAccount, setBankAccount] = useState('HDFC Bank •••• 4892 (IFSC: HDFC0001234)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount, 10);
    if (!numAmount || numAmount <= 0) {
      setErrorMessage('Please enter a valid payout amount.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numAmount,
          propertyId: 'prop-hsr-1',
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to submit payout request');

      toast.success(`Payout request of ₹${numAmount.toLocaleString('en-IN')} submitted!`);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error submitting payout.');
      toast.error(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Payout Withdrawal"
      subtitle="Withdraw rent collections directly to your registered business bank account."
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
              <IndianRupee className="w-4 h-4" />
            )}
            <span>Submit Payout Request</span>
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
          <label className="block text-xs font-bold text-[#202820] mb-1">
            Withdrawal Amount (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1000"
            max={pendingAmount}
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DE] rounded-xl text-xs sm:text-sm text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]"
          />
          <span className="text-[11px] text-gray-500 mt-1 block">
            Maximum eligible balance: ₹{pendingAmount.toLocaleString('en-IN')}
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#202820] mb-1">Destination Bank Account</label>
          <input
            type="text"
            disabled
            value={bankAccount}
            className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-600 cursor-not-allowed"
          />
        </div>

        <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl text-xs text-green-900 leading-relaxed">
          Payouts are processed through NEFT/RTGS within 24 business hours directly by the platform finance operations team.
        </div>
      </form>
    </Modal>
  );
}

