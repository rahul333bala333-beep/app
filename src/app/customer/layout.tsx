import React from 'react';
import CustomerNav from '@/components/navigation/CustomerNav';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7F9F5] flex flex-col pb-16 md:pb-6">
      <CustomerNav />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
