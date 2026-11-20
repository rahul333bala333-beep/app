'use client';

import React, { useState } from 'react';
import { Settings, Shield, Sliders, Database, Bell, Save } from 'lucide-react';
import { resetStateToDefault } from '@/lib/store';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { toast } from '@/components/ui/Toast';

export default function AdminSettingsPage() {
  const [antiDoubleBooking, setAntiDoubleBooking] = useState(true);
  const [requireIdDoc, setRequireIdDoc] = useState(true);
  const [autoAllocation, setAutoAllocation] = useState(true);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anti_double_booking: antiDoubleBooking,
          require_id_doc: requireIdDoc,
          auto_allocation: autoAllocation,
        }),
      });
      toast.success('System settings saved and applied across platform!');
    } catch {
      toast.error('Failed to save settings to server.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-[#202820]">System Settings & Platform Policy</h1>
          <p className="text-xs text-gray-500 mt-0.5">Admin Configuration • Global PG booking rules & verification triggers</p>
        </div>
        <button
          onClick={() => setIsResetConfirmOpen(true)}
          className="btn-secondary text-xs py-1.5 px-3"
        >
          Reset Demo Data
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card space-y-6 text-xs">
        <div>
          <h2 className="text-sm font-bold text-[#202820] mb-3">Booking Engine Controls</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-[#F7F9F5] rounded-xl border">
              <div>
                <div className="font-bold text-gray-900">Strict ACID Double-Booking Prevention</div>
                <div className="text-gray-500 text-[11px]">Enforce database lock upon bed checkout and auto-route collisions to unassigned triage.</div>
              </div>
              <input
                type="checkbox"
                checked={antiDoubleBooking}
                onChange={(e) => setAntiDoubleBooking(e.target.checked)}
                className="w-4 h-4 accent-[#07552D]"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#F7F9F5] rounded-xl border">
              <div>
                <div className="font-bold text-gray-900">Mandatory KYC Verification Before Move-In</div>
                <div className="text-gray-500 text-[11px]">Residents must have verified identification before property owners can perform check-in.</div>
              </div>
              <input
                type="checkbox"
                checked={requireIdDoc}
                onChange={(e) => setRequireIdDoc(e.target.checked)}
                className="w-4 h-4 accent-[#07552D]"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#F7F9F5] rounded-xl border">
              <div>
                <div className="font-bold text-gray-900">Instant Smart Bed Auto-Assignment</div>
                <div className="text-gray-500 text-[11px]">Automatically assign the next optimal vacant bed matching room sharing tier upon payment success.</div>
              </div>
              <input
                type="checkbox"
                checked={autoAllocation}
                onChange={(e) => setAutoAllocation(e.target.checked)}
                className="w-4 h-4 accent-[#07552D]"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="btn-primary text-xs py-2 px-5 font-bold shadow-sm flex items-center gap-2"
          >
            {isSaving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            <span>Save System Settings</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        title="Reset Platform Demo Data?"
        description="This will restore all properties, rooms, bookings, and audit records back to the original reference mockup dataset."
        type="warning"
        confirmText="Confirm Reset"
        onConfirm={() => {
          resetStateToDefault();
          toast.success('Platform state reset to initial reference data!');
          setIsResetConfirmOpen(false);
        }}
      />
    </div>
  );
}
