'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

export interface OtpVerificationCardProps {
  destination: string;
  type: 'PHONE' | 'EMAIL';
  onVerify: (otp: string) => Promise<boolean | void>;
  onResend: () => Promise<void>;
  onChangeDestination: () => void;
  isLoading?: boolean;
}

export function OtpVerificationCard({
  destination,
  type,
  onVerify,
  onResend,
  onChangeDestination,
  isLoading = false,
}: OtpVerificationCardProps) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(60);
  const [errorMessage, setErrorMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    const char = cleaned.slice(-1);

    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setErrorMessage('');

    // Advance to next input box if typed
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify if all 6 digits are populated
    const fullOtp = newDigits.join('');
    if (fullOtp.length === 6 && !newDigits.includes('')) {
      onVerify(fullOtp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...digits];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setDigits(newDigits);
    setErrorMessage('');

    // Focus last filled digit or the next empty box
    const nextIndex = Math.min(5, pastedData.length);
    inputRefs.current[nextIndex]?.focus();

    if (pastedData.length === 6) {
      onVerify(pastedData);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = digits.join('');
    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }
    onVerify(fullOtp);
  };

  const handleResendClick = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setErrorMessage('');
    try {
      await onResend();
      setCooldown(60);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      toast.success('New verification code sent!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  const maskedDestination =
    type === 'PHONE'
      ? destination.replace(/(\+?\d{2,3})(\d{2})\d{4}(\d{4})/, '$1 $2•••• $3')
      : destination.replace(/^(.{2})(.*)(@.*)$/, '$1••••$3');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={onChangeDestination}
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#07552D] font-medium mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Change {type === 'PHONE' ? 'Mobile Number' : 'Email Address'}</span>
        </button>

        <h2 className="text-xl font-bold text-[#202820]">
          {type === 'PHONE' ? 'Verify Your Mobile Number' : 'Verify Your Email'}
        </h2>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          We sent a 6-digit verification code to{' '}
          <span className="font-bold text-gray-900 font-mono">{maskedDestination}</span>
        </p>
      </div>

      {/* Error alert banner */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 6-Box OTP Input Form */}
      <form onSubmit={handleManualSubmit} className="space-y-6">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              disabled={isLoading}
              className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black rounded-xl border-2 transition-all outline-none ${
                digit
                  ? 'border-[#07552D] bg-[#F1FCDF] text-[#07552D]'
                  : 'border-gray-200 bg-white text-gray-900 focus:border-[#07552D] focus:bg-gray-50/50'
              } disabled:opacity-50 shadow-xs`}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading || digits.join('').length !== 6}
          className="btn-primary w-full text-xs py-3 rounded-xl font-bold shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Verifying Code...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Verify & Continue</span>
            </>
          )}
        </button>

        {/* Resend Cooldown Footer */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
          <div className="text-gray-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            {cooldown > 0 ? (
              <span>Resend code in <strong className="text-gray-800">{cooldown}s</strong></span>
            ) : (
              <span>Did not receive the code?</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleResendClick}
            disabled={cooldown > 0 || isResending}
            className={`font-bold transition-colors ${
              cooldown > 0 || isResending
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-[#07552D] hover:underline cursor-pointer'
            }`}
          >
            {isResending ? 'Sending...' : 'Resend OTP'}
          </button>
        </div>
      </form>
    </div>
  );
}
