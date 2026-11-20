'use client';

import React, { useState } from 'react';
import { ShieldCheck, Plus, User, Check, AlertCircle } from 'lucide-react';
import { getState, updateStaffPermissions, syncWithDatabase } from '@/lib/store';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';

export default function AdminStaffPage() {
  const [state, setState] = useState(getState());
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState<'OPS' | 'SUPPORT' | 'ADMIN'>('OPS');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !staffEmail.trim()) {
      toast.error('Please enter name and email');
      return;
    }

    setIsSubmitting(true);
    try {
      toast.success(`Staff member ${staffName} added as ${staffRole}!`);
      setStaffName('');
      setStaffEmail('');
      setIsAddStaffOpen(false);
    } catch {
      toast.error('Failed to add staff member');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-[#202820]">Staff & Permissions Matrix</h1>
          <p className="text-xs text-gray-500 mt-0.5">Admin Module 01 Extended • Granular role assignments across internal teams</p>
        </div>
        <button
          onClick={() => setIsAddStaffOpen(true)}
          className="btn-primary text-xs py-2 px-3.5 font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" /> <span>Add Staff Member</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8DE] p-6 shadow-card space-y-6 text-xs">
        <div>
          <h2 className="text-sm font-bold text-[#202820] mb-3">Internal Operational Team</h2>
          <div className="divide-y border rounded-xl overflow-hidden">
            {state.users.filter(u => u.role === 'ADMIN' || u.role === 'OPS' || u.role === 'SUPPORT').map((staff) => (
              <div key={staff.id} className="p-3.5 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#07552D] text-white font-bold flex items-center justify-center text-xs">
                    {staff.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{staff.name}</div>
                    <div className="text-gray-500 text-[11px]">{staff.email}</div>
                  </div>
                </div>
                <span className="badge-lime font-bold">{staff.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Matrix */}
        <div>
          <h2 className="text-sm font-bold text-[#202820] mb-3">Granular Permission Matrix</h2>
          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F7F9F5] text-gray-700 border-b">
                <tr>
                  <th className="py-3 px-4 font-semibold">Permission Item</th>
                  <th className="py-3 px-4 font-semibold text-center">Admin</th>
                  <th className="py-3 px-4 font-semibold text-center">Ops Team</th>
                  <th className="py-3 px-4 font-semibold text-center">Support Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {state.staffPermissions.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/80">
                    <td className="py-3 px-4 font-medium text-gray-900">{item.permission}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[#07552D] font-bold">✓</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={item.ops ? 'text-[#07552D] font-bold' : 'text-gray-300'}>
                        {item.ops ? '✓' : '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={item.support ? 'text-[#07552D] font-bold' : 'text-gray-300'}>
                        {item.support ? '✓' : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        title="Invite Internal Staff Member"
        subtitle="Provision platform administrative access for operational or support personnel."
        footer={
          <>
            <button
              onClick={() => setIsAddStaffOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddStaff}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#07552D] hover:bg-[#064223] text-white"
            >
              Send Invitation
            </button>
          </>
        }
      >
        <form onSubmit={handleAddStaff} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#202820] mb-1">Full Name</label>
            <input
              type="text"
              required
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              placeholder="e.g. Megha Kulkarni"
              className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DE] rounded-xl text-xs text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#202820] mb-1">Company Email</label>
            <input
              type="email"
              required
              value={staffEmail}
              onChange={(e) => setStaffEmail(e.target.value)}
              placeholder="e.g. megha@stayzy.in"
              className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DE] rounded-xl text-xs text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#202820] mb-1">Assign Role</label>
            <select
              value={staffRole}
              onChange={(e) => setStaffRole(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DE] rounded-xl text-xs text-[#202820] focus:outline-none focus:ring-2 focus:ring-[#07552D]/20 focus:border-[#07552D]"
            >
              <option value="OPS">Operations Team (Ops)</option>
              <option value="SUPPORT">Customer Support Team</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
