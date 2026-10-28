'use client';

import React from 'react';
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function Footer() {
  const { user } = useAuth();
  const cityName = user?.city?.name || 'Your city';

  return (
    <footer className="mt-auto w-full border-t border-slate-800 bg-slate-900 text-slate-300">
      <div className="tricolor-bar w-full" />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-white shadow-md"><Building2 className="h-4 w-4" /></div>
            <div><span className="text-base font-bold tracking-tight text-white">City<span className="text-orange-500">Nova</span></span><p className="text-[11px] text-slate-400">{cityName} &bull; {user?.state || user?.city?.state || ''}</p></div>
          </div>
          <p className="max-w-sm text-xs leading-relaxed text-slate-400">Report local problems, find nearby reports, and follow their progress.</p>
        </div>
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Quick Links</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/report" className="text-slate-300 transition-colors hover:text-orange-400">+ Report a problem</Link></li>
            <li><Link href="/#city-map" className="text-slate-300 transition-colors hover:text-orange-400">Reported issue map</Link></li>
          </ul>
        </div>
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Your city</h4>
          <p className="text-sm font-semibold text-white">{cityName}, {user?.state || user?.city?.state || ''}</p>
          <p className="text-xs leading-5 text-slate-400">Complaint activity and locations are shown for this city.</p>
        </div>
      </div>
      <div className="border-t border-slate-800 px-4 py-5 text-center text-xs text-slate-500">&copy; 2026 CityNova Citizen Portal &bull; Reports for {cityName}</div>
    </footer>
  );
}
