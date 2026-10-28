'use client';

import Link from 'next/link';
import { Home, PlusCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border-2 border-amber-300 bg-amber-100 text-4xl font-black text-amber-800">404</div>
        <h1 className="mb-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Page or complaint not found</h1>
        <p className="mb-8 max-w-md text-sm leading-6 text-slate-600">Check the address or complaint case ID, or return to your city reports.</p>
        <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <Link href="/" className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-800 hover:bg-slate-50"><Home className="h-4 w-4" />City reports</Link>
          <Link href="/report" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-xs font-bold text-white hover:bg-orange-700"><PlusCircle className="h-4 w-4" />Report a problem</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
