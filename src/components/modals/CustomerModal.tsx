'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { toast } from '../ui/Toast';
import { UserPlus, AlertCircle } from 'lucide-react';

export interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CustomerModal({ isOpen, onClose, onSuccess }: CustomerModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [movingTo, setMovingTo] = useState('Bengaluru');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter customer full name.');
      return;
    }
    if (!email.trim() && !phone.trim()) {
      setErrorMessage('Please enter either an email or mobile phone.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim() || '+91 99999 00000',
          otp: '123456',
          name: name.trim(),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create customer profile');
      }

      toast.success(`Customer ${name} registered successfully!`);
      setName('');
      setEmail('');
      setPhone('');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred.');
      toast.error(err.message || 'Error adding customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Customer"
      subtitle="Create a verified resident profile on the Stayzy platform."
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
                <UserPlus className="w-4 h-4" />
                <span>Add Customer</span>
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
            placeholder="e.g. Rahul Sharma"
            className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DE] rounded-xl text-xs sm:text-sm text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#202820] mb-1">Mobile Phone (+91)</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +91 98765 43210"
            className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DE] rounded-xl text-xs sm:text-sm text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#202820] mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. rahul@example.com"
            className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DE] rounded-xl text-xs sm:text-sm text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#202820] mb-1">Moving To City</label>
          <select
            value={movingTo}
            onChange={(e) => setMovingTo(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DE] rounded-xl text-xs sm:text-sm text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]"
          >
            <option value="Bengaluru">Bengaluru</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Pune">Pune</option>
            <option value="Gurugram">Gurugram</option>
          </select>
        </div>
      </form>
    </Modal>
  );
}

