'use client';

import React, { useState } from 'react';
import { Drawer } from '../ui/Drawer';
import { toast } from '../ui/Toast';
import { getState, subscribeToState } from '@/lib/store';
import { LifeBuoy, AlertCircle } from 'lucide-react';

export interface TicketDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultPropertyId?: string;
  defaultRoomNumber?: string;
}

export function TicketDrawer({
  isOpen,
  onClose,
  onSuccess,
  defaultPropertyId,
  defaultRoomNumber,
}: TicketDrawerProps) {
  const [properties, setProperties] = useState(getState().properties);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [propertyId, setPropertyId] = useState(defaultPropertyId || properties[0]?.id || 'prop-hsr-1');
  const [roomNumber, setRoomNumber] = useState(defaultRoomNumber || '');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [category, setCategory] = useState('Wi-Fi / Internet');
  const [assignee, setAssignee] = useState('');
  const [status, setStatus] = useState('OPEN');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  React.useEffect(() => {
    return subscribeToState((s) => {
      setProperties(s.properties);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setErrorMessage('Please enter a ticket subject.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const fullDescription = `${category ? `[${category}] ` : ''}${roomNumber ? `(Room: ${roomNumber}) ` : ''}${description}`;

      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          description: fullDescription.trim(),
          propertyId,
          priority,
          assigneeName: assignee.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create support ticket');
      }

      toast.success(`Ticket ${data.data?.ticketNumber || 'created'} successfully!`);
      // Reset form
      setSubject('');
      setDescription('');
      setRoomNumber('');
      setAssignee('');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
      toast.error(err.message || 'Error creating ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Create Support & Maintenance Ticket"
      subtitle="Report an issue or maintenance requirement for immediate operational triage."
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
                <LifeBuoy className="w-4 h-4" />
                <span>Create Ticket</span>
              </>
            )}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Ticket Subject */}
        <div>
          <label className="block text-xs font-bold text-[#202820] mb-1">
            Ticket Subject <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Wi-Fi router rebooting on 3rd floor"
            className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DE] rounded-xl text-xs sm:text-sm text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]"
          />
        </div>

        {/* Category & Property in 2 cols */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-[#202820] mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DE] rounded-xl text-xs sm:text-sm text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]"
            >
              <option value="Wi-Fi / Internet">Wi-Fi / Internet</option>
              <option value="Plumbing / Water">Plumbing / Water</option>
              <option value="Electrical / Power">Electrical / Power</option>
              <option value="AC / Cooling">AC / Cooling</option>
              <option value="Housekeeping">Housekeeping</option>
              <option value="Security / Access">Security / Access</option>
              <option value="Billing / Rent">Billing / Rent</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#202820] mb-1">Property</label>
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
        </div>

        {/* Room Number & Assignee in 2 cols */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-[#202820] mb-1">Room / Bed (Optional)</label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="e.g. Room 102 - Bed B"
              className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DE] rounded-xl text-xs sm:text-sm text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#202820] mb-1">Assignee / Technician</label>
            <input
              type="text"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="e.g. Ramesh (Electrician)"
              className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DE] rounded-xl text-xs sm:text-sm text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]"
            />
          </div>
        </div>

        {/* Priority Selector */}
        <div>
          <label className="block text-xs font-bold text-[#202820] mb-1.5">Priority Level</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'LOW', label: 'Low', color: 'border-blue-200 text-blue-700 active:bg-blue-50' },
              { id: 'MEDIUM', label: 'Medium', color: 'border-amber-200 text-amber-700 active:bg-amber-50' },
              { id: 'HIGH', label: 'High / Urgent', color: 'border-red-200 text-red-700 active:bg-red-50' },
            ].map((p) => {
              const selected = priority === p.id;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPriority(p.id as any)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition text-center ${
                    selected
                      ? 'bg-[#07552D] text-white border-[#07552D] shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-[#202820] mb-1">Detailed Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide context, resident comments, or troubleshooting steps already attempted..."
            className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DE] rounded-xl text-xs sm:text-sm text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]"
          />
        </div>
      </form>
    </Drawer>
  );
}

