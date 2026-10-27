'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  PhoneCall,
  Mail,
  MapPin,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      {/* Tricolor Accent Bar */}
      <div className="tricolor-bar w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start border-b border-slate-800 pb-8">
          {/* Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-white text-base font-bold tracking-tight">
                  City<span className="text-orange-500">Nova</span>
                </span>
                <p className="text-[11px] text-slate-400">
                  Ponda Municipal Council &bull; पोंडा नगरपालिका, Goa
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Official public grievance redressal and transparent service delivery platform backed by statutory turnaround time limits under the Goa Right to Public Services Act 2013.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">
              Quick Portals &bull; त्वरित लिंक
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/report" className="text-slate-300 hover:text-orange-400 transition-colors">
                  + Report Civic Problem (समस्या नोंदवा)
                </Link>
              </li>
              <li>
                <Link href="/#city-map" className="text-slate-300 hover:text-orange-400 transition-colors">
                  🗺️ City GIS &amp; Google Map
                </Link>
              </li>
              <li>
                <Link href="/#citizens-rights" className="text-slate-300 hover:text-orange-400 transition-colors">
                  ⚖️ Citizens&apos; Statutory Rights
                </Link>
              </li>
              <li>
                <Link href="/#public-ledger" className="text-slate-300 hover:text-orange-400 transition-colors">
                  📋 Public Promise-to-Proof Ledger
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency & Contact */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">
              24x7 Citizen Helpline &bull; संपर्क
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="tel:1913" className="text-white font-bold hover:text-orange-400 text-sm">
                  1913 (Toll Free) &bull; 0832-2312148
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a href="mailto:grievance.pmc@goa.gov.in" className="hover:text-white transition-colors">
                  grievance.pmc@goa.gov.in
                </a>
              </div>
              <div className="flex items-start gap-2 text-slate-400 text-[11px] pt-1">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>Municipal Administrative Complex, Sadar, Ponda, Goa 403401</span>
              </div>
            </div>
          </div>
        </div>

        {/* Simple Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <div>
            &copy; 2026 Ponda Municipal Council &bull; CityNova Civic OS
          </div>
          <div className="text-[11px] text-slate-400">
            Goa Right to Public Services Act 2013 &bull; Time-Bound Service Guarantee
          </div>
        </div>
      </div>
    </footer>
  );
}
