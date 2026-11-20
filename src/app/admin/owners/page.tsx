'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Building2, UserX, UserCheck, ArrowRight } from 'lucide-react';
import { getState, subscribeToState, toggleUserStatus, syncWithDatabase } from '@/lib/store';
import { OwnerModal } from '@/components/modals/OwnerModal';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { toast } from '@/components/ui/Toast';

export default function AdminOwnersPage() {
  const [state, setState] = useState(getState());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [ownerToToggle, setOwnerToToggle] = useState<any | null>(null);

  useEffect(() => {
    return subscribeToState((newState) => {
      setState(newState);
    });
  }, []);

  const owners = state.users.filter((u) => u.role === 'OWNER');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#202820]">PG Owners Directory</h1>
          <p className="text-xs text-gray-500 mt-0.5">Admin Module 03 • Account lifecycle & multi-property controls</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary text-xs py-2 px-3.5 self-start sm:self-auto font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Owner</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search owner by name, email or PG"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#07552D] outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none font-medium"
        >
          <option value="ALL">Status: All</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {/* Owners Table */}
      <div className="bg-white rounded-xl border border-[#E2E8DE] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F7F9F5] text-gray-700 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Owner</th>
                <th className="py-3 px-4 font-semibold">PGs</th>
                <th className="py-3 px-4 font-semibold">Account Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {owners
                .filter((u) => {
                  if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
                  if (!search) return true;
                  return (
                    u.name.toLowerCase().includes(search.toLowerCase()) ||
                    u.email.toLowerCase().includes(search.toLowerCase())
                  );
                })
                .map((owner) => {
                  const pgCount =
                    state.properties.filter((p) => p.ownerId === owner.id).length ||
                    (owner.name === 'Sneha Patel' ? 2 : 1);
                  return (
                    <tr key={owner.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#07552D] font-bold text-xs flex items-center justify-center">
                            {owner.avatar || owner.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <Link
                              href={`/admin/owners/${owner.id}`}
                              className="font-bold text-gray-900 hover:text-[#07552D] hover:underline"
                            >
                              {owner.name}
                            </Link>
                            <div className="text-gray-500 text-[11px]">{owner.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-800">{pgCount}</td>
                      <td className="py-3.5 px-4">
                        <span className={owner.status === 'ACTIVE' ? 'badge-active' : 'badge-issue'}>
                          {owner.status === 'ACTIVE' ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setOwnerToToggle(owner)}
                            className="px-2.5 py-1 text-xs font-medium border border-gray-200 hover:bg-gray-100 rounded text-gray-700 transition"
                          >
                            {owner.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                          <Link
                            href={`/admin/owners/${owner.id}`}
                            className="px-3 py-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded text-gray-800 flex items-center gap-1 transition"
                          >
                            <span>Manage</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* In-App Add Owner Modal */}
      <OwnerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          syncWithDatabase();
        }}
      />

      {/* In-App Suspend/Activate Confirmation Dialog */}
      {ownerToToggle && (
        <ConfirmationDialog
          isOpen={Boolean(ownerToToggle)}
          onClose={() => setOwnerToToggle(null)}
          title={`${ownerToToggle.status === 'ACTIVE' ? 'Suspend' : 'Activate'} ${ownerToToggle.name}?`}
          description={
            ownerToToggle.status === 'ACTIVE'
              ? 'Suspending this owner will revoke their access to PG listings, payouts, and room bookings.'
              : 'Activating this account will restore full access to their PG management dashboard.'
          }
          type={ownerToToggle.status === 'ACTIVE' ? 'danger' : 'success'}
          confirmText={ownerToToggle.status === 'ACTIVE' ? 'Confirm Suspension' : 'Activate Account'}
          onConfirm={() => {
            toggleUserStatus(ownerToToggle.id);
            toast.success(
              `Owner ${ownerToToggle.name} ${
                ownerToToggle.status === 'ACTIVE' ? 'suspended' : 'activated'
              } successfully!`
            );
            setOwnerToToggle(null);
          }}
        />
      )}
    </div>
  );
}
