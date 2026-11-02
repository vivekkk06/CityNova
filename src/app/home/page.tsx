'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  PlusCircle,
  MapPin,
  HelpCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ShieldAlert,
  FileText,
  ArrowRight,
  Layers,
  X,
  ExternalLink,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import type { ClickedLocationInfo } from '@/components/CivicMap';

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
  const { user, loading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  // In-memory interactive search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [clickedLocation, setClickedLocation] = useState<ClickedLocationInfo | null>(null);

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
    if (authLoading) return;
    fetchData();
  }, [authLoading]);

  // Filter tickets in memory for real-time map and list exploration
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // Category filter
      let matchesCat = true;
      if (selectedCategory !== 'all') {
        const cat = (ticket.category || '').toLowerCase();
        if (selectedCategory === 'roads') {
          matchesCat = cat.includes('road') || cat.includes('pothole');
        } else if (selectedCategory === 'water') {
          matchesCat = cat.includes('water') || cat.includes('leak') || cat.includes('pipe') || cat.includes('drain');
        } else if (selectedCategory === 'sanitation') {
          matchesCat = cat.includes('garbage') || cat.includes('waste') || cat.includes('sanitat');
        } else if (selectedCategory === 'lights') {
          matchesCat = cat.includes('light') || cat.includes('electric') || cat.includes('power');
        }
      }

      // Status filter
      let matchesStat = true;
      if (selectedStatus === 'in_progress') {
        matchesStat = ticket.status === 'IN_PROGRESS' || ticket.status === 'ASSIGNED' || ticket.status === 'OPEN';
      } else if (selectedStatus === 'pending_approval') {
        matchesStat = ticket.status === 'PROVISIONALLY_RESOLVED' || ticket.status === 'PENDING_APPROVAL';
      } else if (selectedStatus === 'resolved') {
        matchesStat = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';
      }

      // Search query filter
      let matchesQuery = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        matchesQuery =
          (ticket.title && ticket.title.toLowerCase().includes(q)) ||
          (ticket.caseId && ticket.caseId.toLowerCase().includes(q)) ||
          (ticket.addressDescription && ticket.addressDescription.toLowerCase().includes(q)) ||
          (ticket.category && ticket.category.toLowerCase().includes(q));
      }

      return matchesCat && matchesStat && matchesQuery;
    });
  }, [tickets, selectedCategory, selectedStatus, searchQuery]);

  const hasActiveFilters = selectedCategory !== 'all' || selectedStatus !== 'all' || searchQuery.trim() !== '';

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSearchQuery('');
  };

  if (authLoading) return null;

  const cityName = user?.city?.name || 'your city';
  const stateName = user?.state || user?.city?.state || '';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      {/* NAGARIKA / CITYNOVA CIVIC HERO BANNER */}
      <section className="bg-gradient-to-b from-white via-slate-50/50 to-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  Official Municipal Grievance Redressal &bull; <strong>{cityName}{stateName ? `, ${stateName}` : ''}</strong>
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {t('hero_title_part1')}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-teal-600">
                  {t('hero_title_accent')}
                </span>{' '}
                in {cityName}
              </h1>

              <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
                {user?.role === 'AUTHORITY'
                  ? `Review reported civic issues in ${cityName}, verify departmental repairs, and update grievance dockets.`
                  : `Report local problems, track resolution milestones with verified photographic evidence, and follow each grievance through its Public Docket.`}
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-col gap-3 shrink-0">
              {user?.role !== 'AUTHORITY' && (
                <Link
                  href="/report"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all hover:scale-105 border border-slate-700"
                >
                  <PlusCircle className="w-5 h-5 text-emerald-400" />
                  <span>{t('btn_report_problem')}</span>
                </Link>
              )}

              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open_ai_civic_chat'))}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-slate-400 text-xs font-bold transition-all shadow-xs hover:shadow cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span>{t('btn_ask_copilot')}</span>
              </button>

              <a
                href="#city-map"
                className="hidden sm:inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors text-center"
              >
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                <span>Explore Map &bull; {filteredTickets.length} issues</span>
              </a>
            </div>
          </div>

          {/* CITIZEN PARTICIPATION LIFECYCLE BANNER */}
          <div className="mt-8 pt-6 border-t border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700 font-bold text-xs shrink-0 border border-blue-100">
                1
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Geotag &amp; Submit</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Snap a photo, add landmarks, and pinpoint exact coordinates on the map.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-700 font-bold text-xs shrink-0 border border-amber-100">
                2
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Department Action</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Assigned to the responsible municipal department with SLA resolution tracking.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs shrink-0 border border-emerald-100">
                3
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Citizen Sign-Off</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Inspect after-repair photographic proof before verifying ticket closure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-12 space-y-8">
        {/* COMPLAINT STATISTICS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="govt-card p-4 sm:p-5 relative overflow-hidden border-t-4 border-t-blue-600">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {t('stats_total')}
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
              {stats?.total ?? '-'}
            </p>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              {t('stats_total_sub')}
            </span>
          </div>

          <div className="govt-card p-4 sm:p-5 relative overflow-hidden border-t-4 border-t-amber-500">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                {t('stats_active')}
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight mt-2">
              {stats?.inProgress ?? '-'}
            </p>
            <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
              {t('stats_active_sub')}
            </span>
          </div>

          <div className="govt-card p-4 sm:p-5 relative overflow-hidden border-t-4 border-t-emerald-600">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                {t('stats_resolved')}
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight mt-2">
              {stats?.resolved ?? '-'}
            </p>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
              {t('stats_resolved_sub')}
            </span>
          </div>

          <div className="govt-card p-4 sm:p-5 relative overflow-hidden border-t-4 border-t-purple-600">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">
                Pending Approval
              </span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
              {stats?.pendingApproval ?? '-'}
            </p>
            <span className="text-[11px] text-purple-700 font-semibold mt-1 block">
              Awaiting citizen sign-off
            </span>
          </div>
        </div>

        {/* INTERACTIVE MAP PRESENTATION & ISSUE DISCOVERY */}
        <div id="city-map" className="govt-card p-4 sm:p-6 space-y-4 scroll-mt-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-600 shrink-0" />
                <span>Reported Issues &amp; Grievance Map in {cityName}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Each dot marks a reported complaint. Select a dot to open its Public Grievance Docket.
              </p>
            </div>

            {/* Quick Map Legend */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-[11px] text-slate-600 shrink-0 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80">
              <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Legend:</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" /> Open
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> In Progress
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> Pending Sign-off
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Resolved
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-orange-700">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-600 ring-2 ring-orange-200" /> Pinned Location
              </span>
            </div>
          </div>

          {/* 2-Column Dashboard Layout: Left Controls + Right Map */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* LEFT CONTROL SIDEBAR: Categories, Statuses, Search */}
            <div className="lg:col-span-4 flex flex-col justify-between bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 sm:p-5 space-y-4">
              {/* CLICKED LOCATION BANNER (Auto-written when map is clicked) */}
              {clickedLocation && (
                <div className="rounded-xl border-2 border-orange-400 bg-orange-50/90 p-3.5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-orange-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                      <span>Pinned Location</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setClickedLocation(null)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 leading-snug">
                      {clickedLocation.shortAddress}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                      {clickedLocation.displayName}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      {clickedLocation.lat.toFixed(5)}° N, {clickedLocation.lng.toFixed(5)}° E
                    </span>
                  </div>
                </div>
              )}

              {/* Search Box */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Search Complaints
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter by title, landmark, ID..."
                    className="w-full text-xs pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 shadow-2xs transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Status Filter Menu */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Status Menu
                  </label>
                  {selectedStatus !== 'all' && (
                    <button
                      type="button"
                      onClick={() => setSelectedStatus('all')}
                      className="text-[10px] font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'all', label: 'All Statuses', dot: 'bg-slate-700' },
                    { id: 'in_progress', label: 'Active Work', dot: 'bg-amber-500' },
                    { id: 'pending_approval', label: 'Pending Sign-off', dot: 'bg-purple-600' },
                    { id: 'resolved', label: 'Resolved', dot: 'bg-emerald-600' },
                  ].map((st) => {
                    const isSelected = selectedStatus === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setSelectedStatus(st.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full shrink-0 ${st.dot}`} />
                        <span className="truncate">{st.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Categories Menu */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Categories
                  </label>
                  {selectedCategory !== 'all' && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('all')}
                      className="text-[10px] font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  {[
                    { id: 'all', label: 'All Issues', icon: '🏛️' },
                    { id: 'roads', label: 'Roads & Potholes', icon: '🕳️' },
                    { id: 'water', label: 'Water & Drainage', icon: '💧' },
                    { id: 'sanitation', label: 'Garbage & Sanitation', icon: '🗑️' },
                    { id: 'lights', label: 'Streetlights', icon: '💡' },
                  ].map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span className="text-sm shrink-0">{cat.icon}</span>
                          <span className="truncate">{cat.label}</span>
                        </span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Filter Summary & Reset Action */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Showing <span className="font-bold text-slate-900">{filteredTickets.length}</span> of {tickets.length} issues
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs text-orange-600 hover:text-orange-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    <span>Reset All</span>
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT MAP: Smaller, Right-Aligned */}
            <div className="lg:col-span-8 min-h-[440px] h-[480px] sm:h-[500px] lg:h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-xs relative bg-slate-100">
              <CivicMap
                tickets={filteredTickets}
                center={user?.city ? [user.city.centerLat, user.city.centerLng] : [20.5937, 78.9629]}
                zoom={user?.city ? 14 : 5}
                className="w-full h-full min-h-full rounded-2xl"
                onLocationClick={setClickedLocation}
                clickedLocation={clickedLocation}
              />
            </div>
          </div>

          {/* RECENT GRIEVANCE DOCKETS DISCOVERY GRID */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Recent Grievance Dockets in {cityName} ({filteredTickets.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select any complaint docket to view timeline, photos, and resolution proof.
                </p>
              </div>

              <Link
                href="/posts"
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 group"
              >
                <span>View Community Posts</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <p className="text-sm font-bold text-slate-700">No reported complaints match your filters.</p>
                <p className="text-xs text-slate-500">Try adjusting your search keyword, category, or status filter.</p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredTickets.slice(0, 6).map((ticket) => {
                  const isResolved = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';
                  const isPending = ticket.status === 'PROVISIONALLY_RESOLVED' || ticket.status === 'PENDING_APPROVAL';

                  return (
                    <Link
                      key={ticket.id || ticket.caseId}
                      href={`/ticket/${ticket.caseId}`}
                      className="group p-4 rounded-xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 truncate">
                            {ticket.category || 'General Civic'}
                          </span>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isResolved
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : isPending
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {isResolved ? 'Resolved' : isPending ? 'Pending Sign-off' : 'In Progress'}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                          {ticket.title}
                        </h4>

                        {ticket.addressDescription && (
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 line-clamp-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{ticket.addressDescription}</span>
                          </p>
                        )}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="font-mono text-slate-400 text-[10px]">#{ticket.caseId}</span>
                        <span className="font-bold text-blue-700 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                          View Docket &rarr;
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
