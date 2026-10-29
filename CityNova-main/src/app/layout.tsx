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
    'CityNova is a civic issue reporting platform. Report potholes, waste dumps, water leakages, and streetlights, view reported issue locations on the city map, and track complaint resolution.',
  keywords: [
    'CityNova',
    'CityNova Civic Platform',
    'Municipal Civic Action',
    'Citizen Grievance Redressal',
    'Reported Issue Map',
    'Public Grievance Docket',
    'Civic Technology',
  ],
};

import { LanguageProvider } from '@/lib/i18n';
import { AuthProvider } from '@/lib/auth-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 selection:bg-orange-100 selection:text-orange-900">
        <AuthProvider><LanguageProvider>{children}</LanguageProvider></AuthProvider>
      </body>
    </html>
  );
}
