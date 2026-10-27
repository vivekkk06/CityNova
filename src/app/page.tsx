'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  FilePlus2,
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Building,
  TrendingUp,
  Filter,
  ArrowRight,
  Eye,
  ThumbsUp,
  Sparkles,
  Search,
  PhoneCall,
  Mail,
  UserCheck,
  Building2,
  Layers,
  List,
  Compass,
  Scale,
  Flag,
  Copy,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CitizensRightsSection from '@/components/CitizensRightsSection';
import { formatSlaTimeRemaining } from '@/lib/sla';
import type { MapTicket, MapWard } from '@/components/CivicMap';

// Dynamically import Leaflet CivicMap to prevent SSR window issues
const CivicMap = dynamic(() => import('@/components/CivicMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 border border-slate-200">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
        <span className="font-bold text-xs">Loading Municipal GIS Ward Map...</span>
      </div>
    </div>
  ),
});

export default function HomePage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [wards, setWards] = useState<MapWard[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // View Mode: 'MAP' | 'LEDGER' | 'OFFICIALS' | 'RIGHTS'
  const [viewMode, setViewMode] = useState<'MAP' | 'LEDGER' | 'OFFICIALS' | 'RIGHTS'>('MAP');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (caseId: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/ticket/${caseId}`);
      setCopiedId(caseId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleUpvote = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, upvoteCount: (t.upvoteCount || 0) + 1 } : t))
    );
  };

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedWard !== 'all') params.append('wardId', selectedWard);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);

      const [ticketsRes, wardsRes, statsRes] = await Promise.all([
        fetch(`/api/tickets?${params.toString()}`),
        fetch('/api/wards'),
        fetch('/api/stats'),
      ]);

      const ticketsData = await ticketsRes.json();
      const wardsData = await wardsRes.json();
      const statsData = await statsRes.json();

      if (ticketsData.tickets) setTickets(ticketsData.tickets);
      if (wardsData.wards) setWards(wardsData.wards);
      if (statsData.stats) setStats(statsData.stats);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedWard, selectedCategory, selectedStatus]);

  // Handle URL hash navigation on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash === '#citizens-rights') setViewMode('RIGHTS');
      else if (hash === '#ward-directory') setViewMode('OFFICIALS');
      else if (hash === '#public-ledger') setViewMode('LEDGER');
      else if (hash === '#city-map') setViewMode('MAP');
    }
  }, []);

  const categories = [
    'Pothole & Road Damage',
    'Garbage & Waste Accumulation',
    'Water Leakage / Pipe Burst',
    'Streetlight Outage',
    'Drainage & Sewer Overflow',
  ];

  const filteredTickets = tickets.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.caseId.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.addressDescription.toLowerCase().includes(q) ||
      (t.ward?.name && t.ward.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      {/* NAGARIKA / CITYNOVA CIVIC HERO BANNER */}
      <section className="bg-gradient-to-b from-white via-slate-50/50 to-white border-b border-slate-200">
        {/* Live Municipal Dispatch Ticker */}
        <div className="bg-slate-900 text-slate-300 py-1.5 px-4 text-[11px] font-medium border-b border-slate-800 flex items-center justify-between overflow-hidden">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 truncate">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">CityNova Telemetry</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300 truncate">
                Ward 2: 4 High-mast LED luminaires restored 10h ahead of SLA &bull; Ward 3: Khandepar water feeder line isolated &bull; 100% Geo-verified Proof of Work active
              </span>
            </div>
            <div className="hidden md:flex items-center gap-3 shrink-0 text-slate-400 text-[10px]">
              <span>Resolution Rate: <strong className="text-emerald-400 font-bold">96.4%</strong></span>
              <span>&bull;</span>
              <span>Avg Turnaround: <strong className="text-cyan-400 font-bold">32 hrs</strong></span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              {/* Official Tricolor Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                GOVERNMENT OF GOA &bull; PONDA MUNICIPAL COUNCIL (PMC) &bull; CITYNOVA
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Public Grievance Map &amp;{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-600">
                  Promise-to-Proof
                </span>{' '}
                Ledger
              </h1>

              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                नागरिक तक्रार व सेवा हमी मंच &bull; Powered by <strong>CityNova</strong>. Every civic issue is recorded publicly with statutory turnaround countdowns under the <strong>Goa Right to Public Services Act 2013</strong>. No docket can be resolved without verified GPS photo proof and resident sign-off.
              </p>

              {/* Quick Category Filter Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                  Quick Topics:
                </span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setViewMode('LEDGER');
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300 hover:bg-orange-50/50'
                    }`}
                  >
                    {cat.split(' ')[0]} {cat.includes('Water') ? 'Leak' : cat.includes('Road') ? 'Pothole' : ''}
                  </button>
                ))}
                {selectedCategory !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className="text-xs text-orange-600 font-bold hover:underline ml-1"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            </div>

            {/* Quick CTAs */}
            <div className="flex flex-wrap sm:flex-col gap-3 shrink-0">
              <Link
                href="/report"
                className="btn-saffron flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all hover:scale-105"
              >
                <FilePlus2 className="w-5 h-5" />
                <span>+ Report Civic Problem</span>
              </Link>

              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open_ai_civic_chat'))}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Ask CityNova Copilot</span>
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
              Total Reported
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats?.total ?? 8077}+
            </p>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              Cumulative Registered
            </span>
          </div>

          <div className="govt-card p-4">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
              Active Under Work
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
              {stats?.inProgress ?? 7792}
            </p>
            <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
              SLA Countdown Active
            </span>
          </div>

          <div className="govt-card p-4">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
              Verified Resolved
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
              {stats?.resolved ?? 285}
            </p>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
              With Photo Proof
            </span>
          </div>

          <div className="govt-card p-4">
            <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block mb-1">
              Published Wards
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {wards.length || 3} Wards
            </p>
            <span className="text-[11px] text-purple-700 font-semibold mt-1 block">
              100% Geo-Fenced
            </span>
          </div>

          <div className="govt-card p-4 col-span-2 md:col-span-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Statutory SLA Rate
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-700 tracking-tight">
              {stats?.slaComplianceRate ?? 96.4}%
            </p>
            <span className="text-[11px] text-slate-600 font-medium block mt-1">
              Avg Fix: {stats?.avgResolutionHours ?? 32} hrs
            </span>
          </div>
        </div>

        {/* CONTROLS & 4-TAB SECTION SWITCHER */}
        <div className="govt-card p-4 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* 4-in-1 View Switcher */}
            <div className="flex flex-wrap items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('MAP')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'MAP'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Compass className="w-4 h-4 text-orange-600" />
                <span>Map View (मानचित्र)</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('LEDGER')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'LEDGER'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-4 h-4 text-blue-600" />
                <span>Promise Ledger ({filteredTickets.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('OFFICIALS')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'OFFICIALS'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Ward Officials</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('RIGHTS')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'RIGHTS'
                    ? 'bg-white text-blue-900 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Scale className="w-4 h-4 text-purple-600" />
                <span>Citizens&apos; Rights</span>
              </button>
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search case, landmark, title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs py-2 pl-8 pr-3 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500 w-44 sm:w-56 font-medium"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="text-xs p-2 rounded-lg border border-slate-300 bg-white text-slate-800 font-bold cursor-pointer"
              >
                <option value="all">All Wards (सभी वार्ड)</option>
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs p-2 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs p-2 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="OPEN">Open (Urgent)</option>
                <option value="IN_PROGRESS">In Progress (कार्य जारी)</option>
                <option value="PROVISIONALLY_RESOLVED">Pending Citizen Sign-off</option>
                <option value="RESOLVED">Verified Closed (समाधान)</option>
              </select>
            </div>
          </div>
        </div>

        {/* TAB 1: INTERACTIVE GIS WARD MAP */}
        {viewMode === 'MAP' && (
          <div id="city-map" className="govt-card p-4 sm:p-5 space-y-3 scroll-mt-20">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-600" />
                  <span>Municipal Ward GIS Layer &amp; Live Incident Map</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Terracotta cluster bubbles depict the total report volume from every corner of Ponda city. Click any ward to call the Nodal Officer.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <span className="w-2.5 h-2.5 rounded-full bg-red-700 animate-pulse"></span>
                <span>Nagarika Ward Clusters Active</span>
              </div>
            </div>

            <div className="h-[480px] sm:h-[540px] w-full rounded-xl overflow-hidden border-2 border-slate-200 shadow-inner">
              <CivicMap
                tickets={filteredTickets}
                wards={wards}
                activeWardId={selectedWard !== 'all' ? selectedWard : undefined}
              />
            </div>
          </div>
        )}

        {/* TAB 2: PROMISE-TO-PROOF PUBLIC LEDGER WITH PHOTO COMPARISONS & COMMUNITY REVIEWS */}
        {viewMode === 'LEDGER' && (
          <div id="public-ledger" className="space-y-4 scroll-mt-20">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Public Promise-to-Proof Grievance Ledger &bull; सार्वजनिक लेखा बही</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Every issue is logged publicly with statutory SLA clock, community verification, and before/after photo evidence.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-700 shadow-2xs">
                {filteredTickets.length} Ledger Dockets Found
              </span>
            </div>

            {filteredTickets.length === 0 ? (
              <div className="govt-card p-12 text-center text-slate-500 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="font-bold text-slate-800">No Complaints Match Your Filter</h3>
                <p className="text-xs">All civic services in this category are currently functioning normally.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTickets.map((ticket) => {
                  const sla = formatSlaTimeRemaining(ticket.slaDeadline);
                  const isClosed = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';
                  const isPendingCheck = ticket.status === 'PROVISIONALLY_RESOLVED';
                  const photoUrl = ticket.resolutionPhotoUrl || ticket.initialPhotoUrl;

                  return (
                    <div
                      key={ticket.id}
                      className="govt-card p-5 flex flex-col justify-between space-y-4 hover:border-orange-300 transition-all text-left"
                    >
                      <div className="space-y-3">
                        {/* Header: Case ID and Status */}
                        <div className="flex items-center justify-between">
                          <Link
                            href={`/ticket/${ticket.caseId}`}
                            className="text-xs font-mono font-black text-blue-700 hover:underline"
                          >
                            {ticket.caseId}
                          </Link>
                          <span
                            className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                              isClosed
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : isPendingCheck
                                ? 'bg-purple-100 text-purple-800 border-purple-300 animate-pulse'
                                : ticket.status === 'IN_PROGRESS'
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-red-100 text-red-800 border-red-300'
                            }`}
                          >
                            {ticket.status.replace(/_/g, ' ')}
                          </span>
                        </div>

                        {/* Title & Category */}
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-900 line-clamp-2 hover:text-orange-600 transition-colors">
                            <Link href={`/ticket/${ticket.caseId}`}>{ticket.title}</Link>
                          </h3>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                            <span className="font-bold text-slate-700">{ticket.category}</span>
                            <span>&bull;</span>
                            <span>{ticket.ward?.name || 'Central Ward'}</span>
                          </div>
                        </div>

                        {/* Photo Thumbnail if present */}
                        {photoUrl && (
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                            <img
                              src={photoUrl}
                              alt="Grievance photograph"
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            {isClosed ? (
                              <div className="absolute bottom-2 left-2 bg-emerald-800/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                                ✅ Repaired Photo Proof
                              </div>
                            ) : (
                              <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                                📸 Citizen Photo
                              </div>
                            )}
                          </div>
                        )}

                        {/* Simple Info Row */}
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">Reported by:</span>
                            <strong className="text-slate-800 font-mono">{ticket.citizenName}</strong>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">SLA Guarantee:</span>
                            <span className={`px-1.5 py-0.5 rounded font-bold ${sla.badgeClass}`}>
                              {isClosed ? 'SLA Met & Verified' : sla.text}
                            </span>
                          </div>
                        </div>

                        {/* Community Proof Row: Genuine Confirmations + Copy Link + Flag */}
                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <button
                            type="button"
                            onClick={() => handleUpvote(ticket.id)}
                            className="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold transition-transform active:scale-95 cursor-pointer shadow-2xs"
                            title="Click to confirm and upvote this civic issue"
                          >
                            <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{ticket.upvoteCount || 1} Confirmed Genuine</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopyLink(ticket.caseId)}
                              className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-700 font-medium p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Copy link to this docket"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[10px]">{copiedId === ticket.caseId ? 'Copied!' : 'Share'}</span>
                            </button>

                            <Link
                              href={`/ticket/${ticket.caseId}`}
                              className="inline-flex items-center gap-1 text-slate-400 hover:text-red-700 font-medium p-1 rounded hover:bg-slate-100 transition-colors"
                              title="Report discrepancy"
                            >
                              <Flag className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Footer: View Ledger Button */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 truncate max-w-[140px]">
                          {ticket.addressDescription}
                        </span>

                        <Link
                          href={`/ticket/${ticket.caseId}`}
                          className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline"
                        >
                          <span>Inspect Full Docket</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WARD OFFICIALS & CONTACTS DIRECTORY */}
        {viewMode === 'OFFICIALS' && (
          <div id="ward-directory" className="space-y-4 scroll-mt-20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-orange-600" />
                  <span>Municipal Ward Officers Directory &bull; वार्ड व अधिकारी सूची</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Official contact information for Junior Engineers, Health Inspectors, and Chief Officers across Ponda.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {wards.map((ward) => (
                <div key={ward.id} className="govt-card p-5 space-y-4 border-2 border-slate-200 text-left">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-mono font-bold text-orange-600 uppercase tracking-wider block">
                      {ward.code} &bull; {ward.zone}
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-1">
                      {ward.name}
                    </h3>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">
                        Assigned Ward Nodal Officer
                      </span>
                      <strong className="text-slate-900 text-sm font-bold block mt-0.5">
                        {ward.officerName || 'Er. Pradeep Naik (Chief Officer)'}
                      </strong>
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                      <a
                        href={`tel:${ward.officerPhone || '08322312148'}`}
                        className="flex items-center justify-center gap-2 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Call Officer: {ward.officerPhone || '0832-2312148'}</span>
                      </a>

                      <a
                        href={`mailto:${ward.officerEmail || 'grievance.pmc@goa.gov.in'}`}
                        className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email Officer</span>
                      </a>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span>24x7 Ward Control Line:</span>
                        <strong className="text-slate-900">{ward.emergencyContact || '1913'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Grievances:</span>
                        <strong className="text-orange-600">{ward.stats?.total || 12} Cases</strong>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/report?ward=${ward.id}`}
                    className="block text-center py-2.5 px-3 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 rounded-xl text-xs font-bold transition-colors"
                  >
                    + File Complaint in {ward.code}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CITIZENS' LEGAL RIGHTS & SLA CHARTER */}
        {viewMode === 'RIGHTS' && <CitizensRightsSection />}

        {/* ALWAYS VISIBLE CITIZENS' RIGHTS COMPONENT AT BOTTOM (Point 6 of Hackathon Spec) */}
        {viewMode !== 'RIGHTS' && <CitizensRightsSection />}
      </main>

      {/* CITYNOVA STICKY BOTTOM REPORT BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl flex justify-center">
        <div className="max-w-4xl w-full flex items-center justify-between gap-3">
          <div className="hidden sm:block">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              CityNova Civic Operating System &bull; Ponda Municipal Council
            </span>
            <span className="text-[11px] text-slate-500 block">
              100% Guaranteed SLA under Goa Right to Public Services Act 2013
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
