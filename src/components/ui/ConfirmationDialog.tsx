'use client';

import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle, CheckCircle2, Info, Trash2 } from 'lucide-react';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'success' | 'info';
  isLoading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  isLoading = false,
}: ConfirmationDialogProps) {
  const resolvedDescription = description || message || '';
  const iconConfig = {
    danger: {
      bg: 'bg-red-50 text-red-600 border-red-100',
      btn: 'bg-red-600 hover:bg-red-700 text-white',
      icon: <Trash2 className="w-6 h-6" />,
    },
    warning: {
      bg: 'bg-amber-50 text-amber-600 border-amber-100',
      btn: 'bg-amber-600 hover:bg-amber-700 text-white',
      icon: <AlertTriangle className="w-6 h-6" />,
    },
    success: {
      bg: 'bg-green-50 text-[#07552D] border-green-100',
      btn: 'bg-[#07552D] hover:bg-[#064223] text-white',
      icon: <CheckCircle2 className="w-6 h-6" />,
    },
    info: {
      bg: 'bg-blue-50 text-blue-600 border-blue-100',
      btn: 'bg-blue-600 hover:bg-blue-700 text-white',
      icon: <Info className="w-6 h-6" />,
    },
  }[type];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${iconConfig.btn}`}
          >
            {isLoading && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {confirmText}
          </button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center py-2">
        <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-4 ${iconConfig.bg}`}>
          {iconConfig.icon}
        </div>
        <h3 className="text-base sm:text-lg font-black text-[#202820] mb-2">{title}</h3>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-sm">{resolvedDescription}</p>
      </div>
    </Modal>
  );
}
