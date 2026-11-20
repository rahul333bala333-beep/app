'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

type ToastListener = (toasts: ToastItem[]) => void;
const listeners = new Set<ToastListener>();
let currentToasts: ToastItem[] = [];

function notifyListeners() {
  listeners.forEach((fn) => fn([...currentToasts]));
}

export function showToast(message: string, type: ToastItem['type'] = 'success', duration = 3500) {
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const item: ToastItem = { id, message, type, duration };
  currentToasts = [item, ...currentToasts].slice(0, 5); // Keep max 5 toasts
  notifyListeners();

  if (duration > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, duration);
  }
}

export function dismissToast(id: string) {
  currentToasts = currentToasts.filter((t) => t.id !== id);
  notifyListeners();
}

export const toast = {
  success: (msg: string, dur?: number) => showToast(msg, 'success', dur),
  error: (msg: string, dur?: number) => showToast(msg, 'error', dur),
  warning: (msg: string, dur?: number) => showToast(msg, 'warning', dur),
  info: (msg: string, dur?: number) => showToast(msg, 'info', dur),
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>(currentToasts);

  useEffect(() => {
    listeners.add(setToasts);
    return () => {
      listeners.delete(setToasts);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
      {toasts.map((t) => {
        const isSuccess = t.type === 'success';
        const isError = t.type === 'error';
        const isWarning = t.type === 'warning';

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border text-sm font-medium transition-all transform animate-in slide-in-from-bottom-3 duration-200 ${
              isSuccess
                ? 'bg-[#07552D] text-white border-green-800'
                : isError
                ? 'bg-red-600 text-white border-red-700'
                : isWarning
                ? 'bg-amber-500 text-white border-amber-600'
                : 'bg-gray-900 text-white border-gray-800'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#D9F58B]" />}
              {isError && <XCircle className="w-5 h-5 text-white" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-white" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-white" />}
            </div>
            <div className="flex-1 text-xs sm:text-sm leading-snug">{t.message}</div>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-white/80 hover:text-white shrink-0 -mr-1 -mt-1 p-1 rounded-lg hover:bg-black/10 transition"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

