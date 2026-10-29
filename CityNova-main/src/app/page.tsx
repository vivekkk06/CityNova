'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { FilePlus2, MapPin, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';

// Dynamically import Leaflet CivicMap to prevent SSR window issues
const CivicMap = dynamic(() => import('@/components/CivicMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 border border-slate-200">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
        <span className="font-bold text-xs">Loading reported issue map...</span>
      </div>
    </div>
  ),
});

export default function HomePage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [ticketsRes, statsRes] = await Promise.all([
        fetch('/api/tickets'),
        fetch('/api/stats'),
      ]);
      const ticketsData = await ticketsRes.json();
      const statsData = await statsRes.json();
      if (ticketsData.tickets) setTickets(ticketsData.tickets);
      if (statsData.stats) setStats(statsData.stats);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      {/* NAGARIKA / CITYNOVA CIVIC HERO BANNER */}
      <section className="bg-gradient-to-b from-white via-slate-50/50 to-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                CITYNOVA &bull; CIVIC REPORTING FOR {user?.city?.name || 'YOUR CITY'}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {t('hero_title_part1')}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-600">
                  {t('hero_title_accent')}
                </span>{' '}
                in {user?.city?.name || 'your city'}
              </h1>

              <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
                Report local civic problems, explore reported issues in {user?.city?.name || 'your city'}, and follow each complaint&apos;s progress.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-col gap-3 shrink-0">
              <Link
                href="/report"
                className="btn-saffron flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all hover:scale-105"
              >
                <FilePlus2 className="w-5 h-5" />
                <span>{t('btn_report_problem')}</span>
              </Link>

              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open_ai_civic_chat'))}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>{t('btn_ask_copilot')}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 space-y-8">
        {/* JANTRA & NAGARIKA PUBLIC LIVE METRICS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          <div className="govt-card p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              {t('stats_total')}
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats?.total ?? '-'}
            </p>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              {t('stats_total_sub')}
            </span>
          </div>

          <div className="govt-card p-4">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
              {t('stats_active')}
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
              {stats?.inProgress ?? '-'}
            </p>
            <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
              {t('stats_active_sub')}
            </span>
          </div>

          <div className="govt-card p-4">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
              {t('stats_resolved')}
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
              {stats?.resolved ?? '-'}
            </p>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
              {t('stats_resolved_sub')}
            </span>
          </div>

          <div className="govt-card p-4">
            <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block mb-1">Disputed</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{stats?.disputed ?? '-'}</p>
            <span className="text-[11px] text-purple-700 font-semibold mt-1 block">Needs follow-up</span>
          </div>

          <div className="govt-card p-4 col-span-2 md:col-span-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              On-time Resolution
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-700 tracking-tight">
              {stats?.slaComplianceRate ?? '-'}{stats?.slaComplianceRate != null ? '%' : ''}
            </p>
            <span className="text-[11px] text-slate-600 font-medium block mt-1">
              Average resolution time: {stats?.avgResolutionHours ?? '-'}{stats?.avgResolutionHours != null ? 'h' : ''}
            </span>
          </div>
        </div>

        <div id="city-map" className="govt-card p-4 sm:p-5 space-y-3 scroll-mt-20">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-600" />
                  <span>Reported Issues in {user?.city?.name || 'your city'}</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Each dot marks a reported issue. Select a dot to open its Public Grievance Docket.
                </p>
              </div>
            </div>

            <div className="h-[480px] sm:h-[540px] w-full rounded-xl overflow-hidden border-2 border-slate-200 shadow-inner">
              <CivicMap tickets={tickets} center={user?.city ? [user.city.centerLat, user.city.centerLng] : [20.5937, 78.9629]} zoom={user?.city ? 14 : 5} />
            </div>
          </div>

      </main>

      {/* CITYNOVA STICKY BOTTOM REPORT BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl flex justify-center">
        <div className="max-w-4xl w-full flex items-center justify-between gap-3">
          <div className="hidden sm:block">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              CityNova Civic Portal &bull; {user?.city?.name || 'Your city'}
            </span>
            <span className="text-[11px] text-slate-500 block">
              Local complaint reports for {user?.city?.name || 'your city'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open_ai_civic_chat'))}
              className="px-4 py-2.5 bg-blue-50 text-blue-900 border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors shadow-2xs cursor-pointer"
            >
              🤖 Ask Copilot
            </button>

            <Link
              href="/report"
              className="flex-1 sm:flex-initial btn-saffron text-center px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>+ Report Civic Problem Now</span>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
