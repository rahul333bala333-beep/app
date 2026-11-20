'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CreditCard, ShieldCheck, Lock } from 'lucide-react';
import { getState, createCustomerBooking } from '@/lib/store';
import { toast } from '@/components/ui/Toast';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const state = getState();

  const propertyId = searchParams.get('propertyId') || 'prop-hsr-1';
  const bedType = searchParams.get('bedType') || 'Single Bed – Non AC';
  const rate = Number(searchParams.get('rate') || 700);
  const nights = Number(searchParams.get('nights') || 7);
  const property = state.properties.find((p) => p.id === propertyId) || state.properties[0];

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);

  const totalAmount = rate * nights;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const res = createCustomerBooking({
        propertyId: property.id,
        roomType: bedType,
        checkInDate: '2024-12-12',
        checkOutDate: '2024-12-19',
        nightsCount: nights,
        nightlyRate: rate,
        paymentMethod,
      });

      if (res.success && res.booking) {
        toast.success('Payment authorized & booking confirmed!');
        router.push(`/customer/booking/confirmation/${res.booking.id}`);
      } else {
        setIsProcessing(false);
        toast.error(res.error || 'Payment failed. Please retry.');
      }
    }, 1000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/customer/booking/select?propertyId=${property.id}`} className="p-1 rounded-full hover:bg-gray-200 text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-base font-bold text-gray-900">Checkout</h1>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8DE] p-5 shadow-card space-y-5">
        <div className="p-4 bg-[#F7F9F5] rounded-xl border border-[#E2E8DE] text-xs space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-bold text-sm text-gray-900">{property.name}</div>
              <div className="text-gray-500">{property.address}, {property.locality}</div>
            </div>
            <img
              src={property.photos[0]?.url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=150&q=80'}
              alt={property.name}
              className="w-12 h-12 object-cover rounded-lg border"
            />
          </div>
          <div className="pt-2 border-t flex justify-between font-semibold text-gray-800">
            <span>📅 12 Dec – 19 Dec ({nights} nights)</span>
            <span className="text-[#07552D]">{bedType}</span>
          </div>
        </div>

        <div className="border-t border-b border-gray-100 py-3 text-xs space-y-2">
          <div className="font-bold text-gray-800">Payment Breakdown</div>
          <div className="flex justify-between text-gray-600">
            <span>₹{rate} × {nights} nights</span>
            <span>₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between font-black text-sm text-gray-900 pt-2 border-t">
            <span>Total Payable</span>
            <span className="text-[#07552D]">₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="space-y-2.5">
          <div
            onClick={() => setPaymentMethod('UPI')}
            className={`p-3.5 rounded-xl border text-xs cursor-pointer flex items-center gap-3 transition-all ${
              paymentMethod === 'UPI' ? 'border-[#07552D] bg-[#F1FCDF]' : 'border-gray-200 bg-white'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                paymentMethod === 'UPI' ? 'border-[#07552D]' : 'border-gray-300'
              }`}
            >
              {paymentMethod === 'UPI' && <div className="w-2 h-2 rounded-full bg-[#07552D]" />}
            </div>
            <span className="font-bold text-gray-900">UPI (GPay, PhonePe, Paytm)</span>
          </div>

          <div
            onClick={() => setPaymentMethod('CARD')}
            className={`p-3.5 rounded-xl border text-xs cursor-pointer flex items-center gap-3 transition-all ${
              paymentMethod === 'CARD' ? 'border-[#07552D] bg-[#F1FCDF]' : 'border-gray-200 bg-white'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                paymentMethod === 'CARD' ? 'border-[#07552D]' : 'border-gray-300'
              }`}
            >
              {paymentMethod === 'CARD' && <div className="w-2 h-2 rounded-full bg-[#07552D]" />}
            </div>
            <span className="font-bold text-gray-900">Card (Credit / Debit)</span>
          </div>
        </div>

        <button
          disabled={isProcessing}
          onClick={handlePay}
          className="btn-primary w-full text-xs py-3 rounded-xl font-black text-sm shadow-md disabled:opacity-50"
        >
          {isProcessing ? 'Verifying payment on server...' : `Pay ₹${totalAmount.toLocaleString('en-IN')}`}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
          <Lock className="w-3 h-3" />
          <span>256-bit SSL encrypted & authenticated payment</span>
        </div>
      </div>
    </div>
  );
}

export default function CustomerCheckoutPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
