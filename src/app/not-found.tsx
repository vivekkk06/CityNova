'use client';

import React from 'react';
import Link from 'next/link';
import { Home, PlusCircle, Search, Phone, ShieldAlert, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        {/* Tricolor Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold mb-4">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          GOVERNMENT OF GOA &bull; PONDA MUNICIPAL COUNCIL
        </div>

        {/* 404 Large Badge */}
        <div className="w-24 h-24 rounded-3xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-800 font-black text-4xl shadow-xs mb-6">
          404
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Municipal Page or Docket Not Found
        </h1>
        <p className="text-sm font-semibold text-slate-600 mb-2">
          पृष्ठ नहीं मिला &bull; The requested URL or grievance docket does not exist.
        </p>
        <p className="text-xs text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
          The civic docket number may have been entered incorrectly, or the public notice may have expired. Please verify your tracking number or navigate using the official links below.
        </p>

        {/* Quick Nav Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md mb-8">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-blue-500 rounded-xl text-slate-800 text-xs font-bold shadow-xs transition-all"
          >
            <Home className="w-4 h-4 text-blue-700" />
            <span>Public Grievance Portal</span>
          </Link>

          <Link
            href="/report"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Report Civic Problem</span>
          </Link>
        </div>

        {/* Official Helpline Assistance */}
        <div className="w-full max-w-md p-4 bg-white rounded-2xl border border-slate-200 shadow-xs text-left">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
            <Phone className="w-4 h-4 text-emerald-600" />
            <span>Need Help Finding Your Grievance?</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-2">
            Call our 24x7 Municipal Control Room with your registered mobile phone number.
          </p>
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700">Toll-Free Control Room:</span>
            <a href="tel:1913" className="text-blue-700 hover:underline font-mono">
              1913
            </a>
          </div>
          <div className="flex items-center justify-between text-xs font-bold mt-1">
            <span className="text-slate-700">WhatsApp Helpdesk:</span>
            <a href="https://wa.me/919822155667" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline font-mono">
              +91 98221 55667
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
