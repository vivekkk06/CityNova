'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  FileCheck2,
  FileText,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      {/* Tricolor Government Accent Bar */}
      <div className="tricolor-bar w-full" />

      {/* Primary Municipal Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* 1. ABOUT US */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-white text-base font-bold tracking-tight">
                  Muncihelp Portal
                </h3>
                <p className="text-[11px] text-amber-400 font-medium">
                  Municipal Civic Action System
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Muncihelp is the official, citizen-first civic grievance redressal portal. 
              We empower every resident to report potholes, garbage dumps, water bursts, and dark streetlights with legal time-bound resolution guarantees.
            </p>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Statutory Service Guarantee</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Enforcing the <strong>Right of Citizens to Time-Bound Delivery of Public Services Act</strong>. Every ticket comes with a fixed legal deadline.
              </p>
            </div>
          </div>

          {/* 2. CONTACT US */}
          <div className="space-y-4">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-orange-400" />
              <span>Contact Us &bull; संपर्क करें</span>
            </h4>

            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">
                  Municipal Administrative Complex, Sadar, Ponda, Goa &ndash; 403401, India
                </span>
              </li>

              <li className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase font-bold">24x7 Control Room (Toll-Free)</span>
                  <a
                    href="tel:1913"
                    className="text-white font-bold hover:text-orange-400 text-sm transition-colors"
                  >
                    1913 / 0832-2312148
                  </a>
                </div>
              </li>

              <li className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-green-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase font-bold">WhatsApp Grievance Bot</span>
                  <a
                    href="https://wa.me/919822155667?text=Hi%20Muncihelp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-200 hover:text-white transition-colors"
                  >
                    +91-98221-55667 (24h Chat)
                  </a>
                </div>
              </li>

              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase font-bold">Official Grievance Email</span>
                  <a
                    href="mailto:grievance.pmc@goa.gov.in"
                    className="text-slate-300 hover:text-white transition-colors underline"
                  >
                    grievance.pmc@goa.gov.in
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* 3. WARD MAP & OFFICIALS */}
          <div className="space-y-4">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-400" />
              <span>Ward Map & Officials &bull; वार्ड व अधिकारी</span>
            </h4>

            <p className="text-xs text-slate-400 leading-relaxed">
              Explore your ward boundaries on our live GIS map and directly reach your designated Ward Engineer:
            </p>

            <div className="space-y-2 text-xs">
              <Link
                href="/#map"
                className="block p-2.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <strong className="text-white text-xs">Ward 1 &ndash; Upper Bazar & Sadar</strong>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                    Active
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Er. Pradeep Naik &bull; 0832-2312148
                </span>
              </Link>

              <Link
                href="/#map"
                className="block p-2.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <strong className="text-white text-xs">Ward 2 &ndash; Tisk & Khadpabandh</strong>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                    Active
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Er. S. Kerkar &bull; +91-98220-44556
                </span>
              </Link>

              <Link
                href="/#map"
                className="block p-2.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <strong className="text-white text-xs">Ward 3 &ndash; Curti & Khandepar</strong>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                    Active
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Er. Nilesh Gaonkar &bull; +91-94220-78901
                </span>
              </Link>
            </div>
          </div>

          {/* 4. PROMISE TO PROOF LEDGER */}
          <div className="space-y-4">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-orange-400" />
              <span>Promise-to-Proof Ledger &bull; बहीखाता</span>
            </h4>

            <p className="text-xs text-slate-400 leading-relaxed">
              Every complaint moves through a transparent 4-stage verified public cycle:
            </p>

            <ol className="space-y-2 text-[11px] text-slate-300">
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  <strong>Citizen Reports:</strong> Photo, description & GPS pin recorded.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  <strong>Public SLA Commitment:</strong> Legal countdown starts for ward engineer.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  <strong>Photo Proof of Work:</strong> Field team uploads geo-tagged repaired photo.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  4
                </span>
                <span>
                  <strong>Resident Verification:</strong> Ticket only closes after you confirm!
                </span>
              </li>
            </ol>

            <div className="pt-2">
              <Link
                href="/report"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-md"
              >
                <span>+ Report a Problem Now</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Compliance & Copyright Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-3">
            <span>&copy; 2026 Municipal Corporation &bull; All Rights Reserved.</span>
            <span className="hidden sm:inline">&bull;</span>
            <span>Muncihelp Civic Transparency Portal</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">
              Citizen Charter
            </Link>
            <Link href="/" className="hover:text-white transition-colors">
              Right to Public Services
            </Link>
            <Link href="/" className="hover:text-white transition-colors">
              Privacy & Masking
            </Link>
            <Link href="/" className="hover:text-white transition-colors">
              Open Data API
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
