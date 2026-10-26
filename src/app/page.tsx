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
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { formatSlaTimeRemaining } from '@/lib/sla';
import type { MapTicket, MapWard } from '@/components/CivicMap';

// Dynamically import Leaflet CivicMap to prevent SSR window issues
const CivicMap = dynamic(() => import('@/components/CivicMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 border border-slate-200">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
        <span className="font-medium text-xs">Loading Municipal GIS Ward Map...</span>
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

  // View Mode: 'MAP' | 'ISSUES' | 'OFFICIALS'
  const [viewMode, setViewMode] = useState<'MAP' | 'ISSUES' | 'OFFICIALS'>('MAP');

  useEffect(() => {
    fetchData();
  }, [selectedWard, selectedCategory, selectedStatus]);

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

  const categories = [
    'Pothole & Road Damage',
    'Garbage & Waste Accumulation',
    'Water Leakage / Pipe Burst',
    'Streetlight Outage',
    'Drainage & Sewer Overflow',
  ];

  // Client side search filter
  const filteredTickets = tickets.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title?.toLowerCase().includes(q) ||
      t.caseId?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q) ||
      t.addressDescription?.toLowerCase().includes(q)
    );
  });

  const activeReportsCount = stats ? (stats.inProgress + stats.open) : 7792;
  const totalReportsCount = stats ? stats.total : 8077;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-20">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Government Portal Hero Banner */}
        <div className="govt-card p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl relative overflow-hidden shadow-lg border border-slate-800">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/30 text-orange-300 border border-orange-500/40 text-xs font-bold">
              <Building2 className="w-3.5 h-3.5" />
              <span>Official Municipal Citizen Grievance Redressal System &bull; Muncihelp</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              City Civic Action & Promise-to-Proof Public Ledger
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Report potholes, garbage dumps, water leakages, and broken streetlights in <strong>1 minute</strong>. 
              Enforcing time-bound statutory action under the <strong>Right of Citizens to Time-Bound Delivery of Public Services Act</strong>. 
              Every complaint is sealed with a public deadline, photo proof of repair, and citizen verification.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/report"
                className="btn-saffron inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md hover:scale-105 transition-all"
              >
                <FilePlus2 className="w-4 h-4" />
                <span>+ Report Problem / नई समस्या दर्ज करें</span>
              </Link>

              <button
                onClick={() => setViewMode('MAP')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition-colors"
              >
                <MapPin className="w-4 h-4 text-orange-400" />
                <span>View Ward Map & Officials</span>
              </button>
            </div>
          </div>
        </div>

        {/* JANTRA & NAGARIKA STYLE LIVE MUNICIPAL METRICS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          <div className="govt-card p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Total Reported &bull; कुल शिकायतें
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats?.total ?? 8077}
            </p>
            <span className="text-[11px] text-blue-700 font-semibold flex items-center gap-1 mt-1">
              <Sparkles className="w-3 h-3" /> Public Registry
            </span>
          </div>

          <div className="govt-card p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Active / Under Repair &bull; कार्य जारी
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
              {stats ? (stats.inProgress + stats.open) : 7792}
            </p>
            <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" /> SLA Countdown Active
            </span>
          </div>

          <div className="govt-card p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Verified Resolved &bull; समाधान हुआ
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
              {stats?.resolved ?? 285}
            </p>
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> 100% Photo Proof
            </span>
          </div>

          <div className="govt-card p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Published Wards &bull; वार्ड
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
              Time-Bound SLA Rate
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-700 tracking-tight">
              {stats?.slaComplianceRate ?? 96.4}%
            </p>
            <span className="text-[11px] text-slate-600 font-medium block mt-1">
              Avg Fix: {stats?.avgResolutionHours ?? 32} hrs
            </span>
          </div>
        </div>

        {/* CONTROLS & NAGARIKA-STYLE TABS */}
        <div className="govt-card p-4 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* View Mode Switcher (Map, Issues Feed, Ward Officials) */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('MAP')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'MAP'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Compass className="w-4 h-4 text-orange-600" />
                <span>Map View (मानचित्र)</span>
              </button>

              <button
                onClick={() => setViewMode('ISSUES')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'ISSUES'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-4 h-4 text-blue-600" />
                <span>Issues Feed ({filteredTickets.length})</span>
              </button>

              <button
                onClick={() => setViewMode('OFFICIALS')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'OFFICIALS'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Ward Officials & Contacts</span>
              </button>
            </div>

            {/* Filter Dropdowns (Nagarika style: All Severity, All Status, All Wards) */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search grievance or landmark..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs py-2 pl-8 pr-3 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 w-44 sm:w-56"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="text-xs p-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium"
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
                className="text-xs p-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium"
              >
                <option value="all">All Categories (समस्या प्रकार)</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs p-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium"
              >
                <option value="all">All Status (स्थिति)</option>
                <option value="OPEN">Open (Urgent)</option>
                <option value="IN_PROGRESS">In Progress (कार्य जारी)</option>
                <option value="PROVISIONALLY_RESOLVED">Pending Citizen Sign-off</option>
                <option value="RESOLVED">Verified & Closed (समाधान)</option>
              </select>
            </div>
          </div>
        </div>

        {/* TAB 1: INTERACTIVE GIS WARD MAP */}
        {viewMode === 'MAP' && (
          <div className="govt-card p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-600" />
                  <span>Municipal Ward GIS Layer & Live Incident Map</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Click on any ward or cluster bubble to view assigned Ward Engineers, phone numbers, and active cases.
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-red-800"></span>
                <span>Nagarika Cluster Bubbles Active</span>
              </div>
            </div>

            <div className="h-[480px] sm:h-[540px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner">
              <CivicMap
                tickets={filteredTickets}
                wards={wards}
                activeWardId={selectedWard !== 'all' ? selectedWard : undefined}
              />
            </div>
          </div>
        )}

        {/* TAB 2: ISSUES FEED WITH PHOTO PREVIEWS */}
        {viewMode === 'ISSUES' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Public Grievance Feed & Proof-of-Work</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Every issue is logged publicly with statutory SLA deadline and before/after photo evidence.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-full text-slate-700">
                {filteredTickets.length} Complaints Found
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
                      className="govt-card p-5 flex flex-col justify-between space-y-4 hover:border-orange-300 transition-all"
                    >
                      <div className="space-y-3">
                        {/* Header: Case ID and Status */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-blue-700">
                            {ticket.caseId}
                          </span>
                          <span
                            className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                              isClosed
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : isPendingCheck
                                ? 'bg-purple-100 text-purple-800 border border-purple-200 animate-pulse'
                                : ticket.status === 'IN_PROGRESS'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}
                          >
                            {ticket.status.replace(/_/g, ' ')}
                          </span>
                        </div>

                        {/* Title & Category */}
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 line-clamp-2 hover:text-orange-600 transition-colors">
                            {ticket.title}
                          </h3>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                            <span className="font-semibold text-slate-700">{ticket.category}</span>
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
                              <div className="absolute bottom-2 left-2 bg-emerald-800/90 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                ✅ Repaired Photo Proof
                              </div>
                            ) : (
                              <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                📸 Citizen Photo
                              </div>
                            )}
                          </div>
                        )}

                        {/* Simple Info Row */}
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1 text-xs">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">Reported by:</span>
                            <strong className="text-slate-700 font-mono">{ticket.citizenName}</strong>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">Legal SLA Time:</span>
                            <span className={`px-1.5 py-0.5 rounded font-bold ${sla.badgeClass}`}>
                              {isClosed ? 'Resolved & Verified' : sla.text}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer: View Ledger Button */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          {ticket.addressDescription?.slice(0, 24)}...
                        </span>

                        <Link
                          href={`/ticket/${ticket.caseId}`}
                          className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline"
                        >
                          <span>View Proof Ledger</span>
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-orange-600" />
                  <span>Municipal Ward Officers Directory &bull; वार्ड व अधिकारी सूची</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Official contact information for Junior Engineers, Health Inspectors, and Chief Officers.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {wards.map((ward) => (
                <div key={ward.id} className="govt-card p-5 space-y-4 border border-slate-200">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-mono font-bold text-orange-600 uppercase tracking-wider block">
                      {ward.code} &bull; {ward.zone}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {ward.name}
                    </h3>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">
                        Assigned Ward Officer
                      </span>
                      <strong className="text-slate-900 text-sm font-bold block">
                        {ward.officerName || 'Er. Pradeep Naik (Chief Officer)'}
                      </strong>
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                      <a
                        href={`tel:${ward.officerPhone || '08322312148'}`}
                        className="flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Call Officer: {ward.officerPhone || '0832-2312148'}</span>
                      </a>

                      <a
                        href={`mailto:${ward.officerEmail || 'grievance.pmc@goa.gov.in'}`}
                        className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs shadow-xs transition-colors"
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
                        <span>Total Wards Cases:</span>
                        <strong className="text-orange-600">{ward.stats?.total || 12} Cases</strong>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/report?ward=${ward.id}`}
                    className="block text-center py-2 px-3 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 rounded-lg text-xs font-bold transition-colors"
                  >
                    + File Complaint in {ward.code}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* NAGARIKA-STYLE STICKY BOTTOM REPORT BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl flex justify-center">
        <div className="max-w-4xl w-full flex items-center justify-between gap-3">
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-700">
              Statutory 24h-48h Containment SLA Guaranteed
            </span>
          </div>

          <Link
            href="/report"
            className="w-full sm:w-auto flex-1 sm:flex-initial flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl nagarika-sticky-bar font-bold text-sm sm:text-base shadow-lg hover:scale-102 transition-transform cursor-pointer"
          >
            <FilePlus2 className="w-5 h-5" />
            <span>+ Report Civic Problem &bull; समस्या दर्ज करें</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-mono font-bold">
              {activeReportsCount} Active
            </span>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
