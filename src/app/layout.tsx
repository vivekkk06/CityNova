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
  title: 'CityNova | Next-Gen AI Civic Action & Municipal Governance Platform',
  description:
    'CityNova is the official municipal civic action and transparent governance platform. Report potholes, waste dumps, water leakages, and streetlights with time-bound statutory SLA countdowns, live GIS ward maps, municipal officer directories, and cryptographic-grade photo proof of work.',
  keywords: [
    'CityNova',
    'CityNova Civic Platform',
    'Municipal Civic Action',
    'Citizen Grievance Redressal',
    'Ponda Municipal Council',
    'Ward GIS Map',
    'Ward Officer Directory',
    'Time-Bound Public Services Act',
    'Promise to Proof Ledger',
    'Civic Technology',
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
