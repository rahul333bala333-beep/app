'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { toast } from '../ui/Toast';
import { UserCheck, AlertCircle } from 'lucide-react';

export interface OwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  ownerToEdit?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    status: string;
  } | null;
}

export function OwnerModal({ isOpen, onClose, onSuccess, ownerToEdit }: OwnerModalProps) {
  const isEditing = Boolean(ownerToEdit);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (ownerToEdit) {
      setName(ownerToEdit.name || '');
      setEmail(ownerToEdit.email || '');
      setPhone(ownerToEdit.phone || '');
      setStatus((ownerToEdit.status as any) || 'ACTIVE');
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setStatus('ACTIVE');
    }
    setErrorMessage('');
  }, [ownerToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter owner name.');
      return;
    }
    if (!email.trim() && !isEditing) {
      setErrorMessage('Please enter owner email.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (isEditing && ownerToEdit) {
        // Edit owner status
        const res = await fetch('/api/users/owners', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ownerId: ownerToEdit.id, status }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to update owner');
        toast.success(`Owner ${name} updated successfully!`);
      } else {
        // Add new owner
        const res = await fetch('/api/users/owners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim() }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to add owner');
        toast.success(`Owner ${name} added successfully!`);
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred.');
      toast.error(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit PG Owner Account' : 'Add New PG Owner'}
      subtitle={
        isEditing
          ? 'Manage owner verification status and access controls.'
          : 'Register a property owner to onboard PGs on Stayzy.'
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
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>{isEditing ? 'Save Changes' : 'Add Owner'}</span>
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

        <div>
          <label className="block text-xs font-bold text-[#202820] mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rakesh Kumar"
            className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DE] rounded-xl text-xs sm:text-sm text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#202820] mb-1">
            Email Address {!isEditing && <span className="text-red-500">*</span>}
          </label>
          <input
            type="email"
            required={!isEditing}
            disabled={isEditing}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. rakesh@hsrgarden.in"
            className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border ${
              isEditing
                ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                : 'bg-white border-[#E2E8DE] text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]'
            }`}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#202820] mb-1">Mobile Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +91 98765 43210"
            className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DE] rounded-xl text-xs sm:text-sm text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]"
          />
        </div>

        {isEditing && (
          <div>
            <label className="block text-xs font-bold text-[#202820] mb-1">Account Status</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('ACTIVE')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                  status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setStatus('SUSPENDED')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                  status === 'SUSPENDED'
                    ? 'bg-red-100 text-red-800 border-red-300'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                Suspended
              </button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}

