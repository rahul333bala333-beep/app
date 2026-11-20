'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, Clock, Check, ArrowRight, Eye } from 'lucide-react';
import { getState, subscribeToState, syncWithDatabase } from '@/lib/store';
import { VerificationActionModal } from '@/components/modals/VerificationActionModal';
import { Modal } from '@/components/ui/Modal';

export default function AdminPGVerificationPage() {
  const [state, setState] = useState(getState());
  const [activeModalProperty, setActiveModalProperty] = useState<any | null>(null);
  const [modalMode, setModalMode] = useState<'APPROVE' | 'REQUEST_CHANGES' | 'REJECT'>('APPROVE');
  const [viewingDocsProperty, setViewingDocsProperty] = useState<any | null>(null);

  useEffect(() => {
    return subscribeToState((newState) => {
      setState(newState);
    });
  }, []);

  const pendingProperties = state.properties.filter(
    (p) => p.status === 'PENDING_VERIFICATION' || p.status === 'LISTED'
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-2">
        <div>
          <h1 className="text-xl font-bold text-[#202820]">
            PG Verification Requests ({pendingProperties.length})
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Admin Module 05 • Regulatory compliance, owner identification & property asset audit
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {pendingProperties.map((property) => (
          <div
            key={property.id}
            className="bg-white p-5 rounded-xl border border-[#E2E8DE] shadow-card space-y-4"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Property Details with Thumbnail */}
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                  <img
                    src={property.photos[0]?.url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80'}
                    alt={property.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[#202820]">{property.name}</h2>
                    <span className={property.status === 'LISTED' ? 'badge-confirmed' : 'badge-pending'}>
                      {property.status === 'LISTED' ? 'Verified & Listed' : 'Pending Verification'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{property.address}</div>
                  <div className="text-xs text-gray-500">Owner: {(property as any).ownerName || 'Rakesh Kumar'}</div>
                  <div className="text-[11px] text-gray-400 mt-1">Submitted: 10 Dec, 9:05 AM</div>
                </div>
              </div>

              {/* Documents checklist */}
              <div className="flex flex-wrap items-center gap-3 text-xs bg-[#F7F9F5] px-4 py-2.5 rounded-xl border border-gray-200">
                <span className="flex items-center gap-1.5 text-[#07552D] font-bold">
                  <CheckCircle2 className="w-4 h-4 text-[#07552D]" /> Owner ID
                </span>
                <span className="flex items-center gap-1.5 text-[#07552D] font-bold">
                  <CheckCircle2 className="w-4 h-4 text-[#07552D]" /> Property License
                </span>
                <span className="flex items-center gap-1.5 text-[#07552D] font-bold">
                  <CheckCircle2 className="w-4 h-4 text-[#07552D]" /> Photos ({property.photos?.length || 8})
                </span>
                <button
                  type="button"
                  onClick={() => setViewingDocsProperty(property)}
                  className="text-xs font-bold text-[#07552D] hover:underline ml-1 inline-flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModalProperty(property);
                    setModalMode('APPROVE');
                  }}
                  className="btn-primary text-xs py-2 px-4 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve PG</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModalProperty(property);
                    setModalMode('REQUEST_CHANGES');
                  }}
                  className="btn-secondary text-xs py-2 px-3.5"
                >
                  Request Changes
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* In-App Verification Modal */}
      {activeModalProperty && (
        <VerificationActionModal
          isOpen={Boolean(activeModalProperty)}
          onClose={() => setActiveModalProperty(null)}
          property={activeModalProperty}
          mode={modalMode}
          onSuccess={() => {
            syncWithDatabase();
          }}
        />
      )}

      {/* In-App Document Inspection Modal */}
      {viewingDocsProperty && (
        <Modal
          isOpen={Boolean(viewingDocsProperty)}
          onClose={() => setViewingDocsProperty(null)}
          title={`Verification Documents: ${viewingDocsProperty.name}`}
          subtitle={`Owner: ${(viewingDocsProperty as any).ownerName || 'Rakesh Kumar'} • ${viewingDocsProperty.locality}`}
          maxWidth="lg"
          footer={
            <button
              onClick={() => setViewingDocsProperty(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#07552D] text-white"
            >
              Close Inspector
            </button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <div className="font-bold text-gray-800">1. Government Identity Verification (Aadhaar / PAN)</div>
              <p className="text-gray-500">Document No: ••••••••4892 (Verified with UIDAI checksum match)</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <div className="font-bold text-gray-800">2. Municipal Corporation Trade & Commercial License</div>
              <p className="text-gray-500">License Reference: BBMP/COMM/2024/98418 (Status: Active & Valid)</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <div className="font-bold text-gray-800">3. Uploaded High-Resolution Property Photographs</div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {(viewingDocsProperty.photos || []).slice(0, 3).map((ph: any, idx: number) => (
                  <img
                    key={idx}
                    src={typeof ph === 'string' ? ph : ph?.url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80'}
                    alt={`Audit photo ${idx + 1}`}
                    className="w-full h-20 object-cover rounded-lg border border-gray-200"
                  />
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
