import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Muncihelp | Municipal Civic Action & Citizen Grievance Portal',
  description:
    'Official Municipal Civic Action Portal & Citizen Grievance Redressal System. Report potholes, waste, water leakage, or streetlights with time-bound statutory SLA, live ward map, officer directory, and transparent photo proof of work.',
  keywords: [
    'Muncihelp',
    'Municipal Civic Action',
    'Citizen Grievance Redressal',
    'Ponda Municipal Council',
    'Ward Map',
    'Ward Officer Directory',
    'Time-Bound Public Services Act',
    'Civic Grievances',
    'Nagarika',
    'Jantra',
    'Promise to Proof Ledger',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 selection:bg-orange-100 selection:text-orange-900">
        {children}
      </body>
    </html>
  );
}
