import type { Metadata } from 'next';
import './globals.css';
import { ToastContainer } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'Stayzy | Complete PG Booking & Property Management Platform',
  description: 'Production-ready centralized PG accommodation platform connecting Admin, PG Owner, and Customer experiences in real time.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F7F9F5] text-[#202820]">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}

