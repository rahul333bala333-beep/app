'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { toast } from '../ui/Toast';
import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export interface VerificationActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  property: {
    id: string;
    name: string;
    locality: string;
    ownerName?: string;
  } | null;
  mode: 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT';
}

export function VerificationActionModal({
  isOpen,
  onClose,
  onSuccess,
  property,
  mode,
}: VerificationActionModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!property) return null;

  const isApprove = mode === 'APPROVE';
  const isRequestChanges = mode === 'REQUEST_CHANGES';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApprove && !reason.trim()) {
      setErrorMessage('Please state the specific reason or required document changes.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch(`/api/properties/${property.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isApprove ? 'APPROVE' : isRequestChanges ? 'REQUEST_CHANGES' : 'REJECT',
          reason: reason.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Verification action failed');

      toast.success(
        isApprove
          ? `${property.name} has been approved and listed!`
          : `Requested changes for ${property.name}. Owner notified.`
      );

      setReason('');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error updating verification status.');
      toast.error(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isApprove
          ? 'Approve PG Verification'
          : isRequestChanges
          ? 'Request Changes from Owner'
          : 'Reject PG Listing'
      }
      subtitle={`Property: ${property.name} (${property.locality})`}
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
              isApprove
                ? 'bg-[#07552D] hover:bg-[#064223]'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isApprove ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span>
              {isApprove ? 'Confirm Approval' : isRequestChanges ? 'Submit Request' : 'Confirm Rejection'}
            </span>
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

        {isApprove ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-xs sm:text-sm text-green-900 leading-relaxed">
            <p className="font-bold mb-1">Ready to publish listing?</p>
            <p>
              Approving <strong>{property.name}</strong> will flip its status to <strong>LISTED</strong>.
              It will immediately become visible to customers across Bengaluru exploration and search feeds.
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold text-[#202820] mb-1.5">
              Reason / Instructions for Owner <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Please provide a clearer property trade license scan and at least 3 photos of the dining area..."
              className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DE] rounded-xl text-xs sm:text-sm text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]"
            />
          </div>
        )}
      </form>
    </Modal>
  );
}

