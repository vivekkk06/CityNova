'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  Filter,
  ArrowRight,
  ShieldAlert,
  Flame,
  Search,
  ExternalLink,
  Download,
  Printer,
  FileSpreadsheet,
  Users,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { formatSlaTimeRemaining } from '@/lib/sla';

export default function AdminDashboardPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active tab: 'ALL' | 'CRITICAL_SLA' | 'DISPUTED_ESCALATIONS' | 'PENDING_DISPATCH'
  const [activeTab, setActiveTab] = useState<'ALL' | 'CRITICAL_SLA' | 'DISPUTED_ESCALATIONS' | 'PENDING_DISPATCH'>('ALL');

  const loadData = async () => {
    try {
      const [ticketsRes, wardsRes, statsRes] = await Promise.all([
        fetch('/api/tickets?isPublic=false'),
        fetch('/api/wards'),
        fetch('/api/stats'),
      ]);

      const tData = await ticketsRes.json();
      const wData = await wardsRes.json();
      const sData = await statsRes.json();

      if (tData.tickets) setTickets(tData.tickets);
      if (wData.wards) setWards(wData.wards);
      if (sData.stats) setStats(sData.stats);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quick Status Transition (Assign or mark In Progress)
  const handleStatusChange = async (ticketId: string, newStatus: string, officerName?: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          assignedOfficerName: officerName,
          adminNotes: `Zonal Supervisor transitioned status to ${newStatus}.`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        loadData();
      }
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  // Export CSV Report
  const handleExportCsv = () => {
    if (tickets.length === 0) return;
    const headers = ['Case ID', 'Title', 'Ward', 'Category', 'Urgency', 'Status', 'Assigned Officer', 'SLA Deadline'];
    const rows = filteredTickets.map((t) => [
      `"${t.caseId}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.ward?.name || 'Central'}"`,
      `"${t.category}"`,
      `"${t.urgency}"`,
      `"${t.status}"`,
      `"${t.assignedOfficerName || 'Unassigned'}"`,
      `"${new Date(t.slaDeadline).toISOString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ponda_Municipal_Grievances_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    if (selectedWard !== 'all' && t.wardId !== selectedWard) return false;
    if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        t.caseId.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.assignedOfficerName && t.assignedOfficerName.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (activeTab === 'CRITICAL_SLA') {
      return (
        (t.urgency === 'CRITICAL' || t.urgency === 'HIGH') &&
        t.status !== 'RESOLVED' &&
        t.status !== 'CLOSED'
      );
    }

    if (activeTab === 'DISPUTED_ESCALATIONS') {
      return t.status === 'DISPUTED' || t.escalatedToSupervisor;
    }

    if (activeTab === 'PENDING_DISPATCH') {
      return t.status === 'OPEN' || !t.assignedOfficerName;
    }

    return true;
  });

  const disputedCount = tickets.filter((t) => t.status === 'DISPUTED' || t.escalatedToSupervisor).length;
  const criticalSlaCount = tickets.filter(
    (t) => (t.urgency === 'CRITICAL' || t.urgency === 'HIGH') && t.status !== 'RESOLVED' && t.status !== 'CLOSED'
  ).length;
  const pendingDispatchCount = tickets.filter((t) => t.status === 'OPEN' || !t.assignedOfficerName).length;
  const provisionalCount = tickets.filter((t) => t.status === 'PROVISIONALLY_RESOLVED').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Title & Department Crest */}
        <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold mb-2">
              <Building2 className="w-3.5 h-3.5 text-blue-700" />
              GOVERNMENT OF GOA &bull; PONDA MUNICIPAL COUNCIL (PMC)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Chief Officer &amp; Zonal Command Matrix
            </h1>
            <p className="text-xs font-medium text-slate-600 mt-1 max-w-3xl">
              अधिकारी नियंत्रण कक्ष &bull; Real-time statutory SLA monitoring under the Goa Right to Public Services Act 2013 across Upper Bazar (Ward 1), Tisk (Ward 2), and Curti (Ward 3).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs cursor-pointer transition-all"
            >
              <Download className="w-3.5 h-3.5 text-blue-700" />
              <span>Export CSV Dossier</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Ledger</span>
            </button>
          </div>
        </div>

        {/* 5-Card Operational Metrics Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Grievances
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{tickets.length}</div>
            <span className="text-[10px] text-slate-500 mt-1 block">Registered in council</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
              Pending Dispatch
            </span>
            <div className="text-2xl font-black text-blue-700 mt-1">{pendingDispatchCount}</div>
            <span className="text-[10px] text-blue-700 mt-1 block">Awaiting crew assignment</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
              Urgent SLA Countdown
            </span>
            <div className="text-2xl font-black text-amber-600 mt-1">{criticalSlaCount}</div>
            <span className="text-[10px] text-amber-700 mt-1 block">Near or over SLA limit</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-xs">
            <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">
              Photo Proof Ready
            </span>
            <div className="text-2xl font-black text-purple-700 mt-1">{provisionalCount}</div>
            <span className="text-[10px] text-purple-700 mt-1 block">Awaiting citizen sign-off</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Verified Closed
            </span>
            <div className="text-2xl font-black text-emerald-700 mt-1">{resolvedCount}</div>
            <span className="text-[10px] text-emerald-700 mt-1 block">SLA guaranteed &amp; closed</span>
          </div>
        </div>

        {/* Tab Switcher & Urgent Escalations Pill */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'ALL'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                All Grievances ({tickets.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('PENDING_DISPATCH')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'PENDING_DISPATCH'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Needs Dispatch ({pendingDispatchCount})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('CRITICAL_SLA')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'CRITICAL_SLA'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Urgent SLA ({criticalSlaCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('DISPUTED_ESCALATIONS')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'DISPUTED_ESCALATIONS'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-red-50 hover:bg-red-100 text-red-800 border border-red-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Disputed Re-Work ({disputedCount})</span>
              </button>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Case ID, title, officer..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 outline-hidden w-56 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="text-xs p-2 rounded-xl border border-slate-300 bg-white text-slate-800 outline-hidden font-bold cursor-pointer"
              >
                <option value="all">All Jurisdictions / Wards</option>
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.code} - {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tickets Matrix Table */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[11px] font-extrabold border-b-2 border-slate-200">
                <tr>
                  <th className="p-4">Case ID &amp; Ward</th>
                  <th className="p-4">Grievance &amp; Category</th>
                  <th className="p-4">SLA Clock &amp; Deadline</th>
                  <th className="p-4">Assigned Field Unit</th>
                  <th className="p-4">Two-Stage Verification</th>
                  <th className="p-4 text-right">Zonal Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500 font-medium">
                      No civic tickets match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => {
                    const sla = formatSlaTimeRemaining(t.slaDeadline);
                    const isClosed = t.status === 'RESOLVED' || t.status === 'CLOSED';
                    const isDisputed = t.status === 'DISPUTED' || t.escalatedToSupervisor;

                    return (
                      <tr
                        key={t.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isDisputed ? 'bg-red-50/40' : ''
                        }`}
                      >
                        {/* Case ID */}
                        <td className="p-4 align-top">
                          <Link
                            href={`/ticket/${t.caseId}`}
                            className="font-mono font-bold text-blue-700 hover:underline flex items-center gap-1"
                          >
                            <span>{t.caseId}</span>
                            <ExternalLink className="w-3 h-3 opacity-70" />
                          </Link>
                          <span className="text-[11px] font-semibold text-slate-600 block mt-0.5">
                            {t.ward?.name || 'Central Ward'}
                          </span>
                        </td>

                        {/* Grievance Details */}
                        <td className="p-4 align-top max-w-xs">
                          <span className="font-bold text-slate-900 line-clamp-1 block">
                            {t.title}
                          </span>
                          <span className="text-[11px] text-slate-600 block mt-0.5">
                            {t.category} &bull; Urgency:{' '}
                            <strong
                              className={
                                t.urgency === 'CRITICAL'
                                  ? 'text-red-700'
                                  : t.urgency === 'HIGH'
                                  ? 'text-amber-700'
                                  : 'text-slate-700'
                              }
                            >
                              {t.urgency}
                            </strong>
                          </span>
                          {isDisputed && t.disputeReason && (
                            <span className="text-[11px] text-red-700 font-bold block mt-1 line-clamp-1 bg-red-100/60 px-1.5 py-0.5 rounded border border-red-200">
                              Dispute Reason: {t.disputeReason}
                            </span>
                          )}
                        </td>

                        {/* SLA Countdown Matrix */}
                        <td className="p-4 align-top">
                          {isClosed ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> SLA Guaranteed
                            </span>
                          ) : (
                            <div className="space-y-1">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${sla.badgeClass}`}>
                                {sla.text}
                              </span>
                              <span className="text-[10px] text-slate-500 block font-mono">
                                Deadline: {new Date(t.slaDeadline).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })},{' '}
                                {new Date(t.slaDeadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Assigned Officer */}
                        <td className="p-4 align-top">
                          <span className="text-slate-900 font-bold block">
                            {t.assignedOfficerName || (
                              <span className="text-red-600 italic">Pending Dispatch</span>
                            )}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {t.department?.name || 'Public Works Dept'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="p-4 align-top">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isClosed
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : t.status === 'PROVISIONALLY_RESOLVED'
                                ? 'bg-purple-100 text-purple-800 border-purple-300 animate-pulse'
                                : isDisputed
                                ? 'bg-red-100 text-red-800 border-red-300'
                                : t.status === 'IN_PROGRESS'
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                          >
                            {t.status.replace(/_/g, ' ')}
                          </span>
                        </td>

                        {/* Quick Supervisor Actions */}
                        <td className="p-4 align-top text-right space-x-1.5 whitespace-nowrap">
                          {(!t.assignedOfficerName || t.status === 'OPEN') && (
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(t.id, 'IN_PROGRESS', 'Er. Santosh Shinde (Ward Crew 1)')
                              }
                              className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-[11px] font-bold cursor-pointer transition-all shadow-2xs"
                            >
                              Dispatch Crew
                            </button>
                          )}

                          {isDisputed && (
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(
                                  t.id,
                                  'IN_PROGRESS',
                                  'Er. Senior Supervisor Re-inspection'
                                )
                              }
                              className="px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white rounded-md text-[11px] font-bold cursor-pointer transition-all shadow-2xs"
                            >
                              Order Re-Work
                            </button>
                          )}

                          <Link
                            href={`/ticket/${t.caseId}`}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-[11px] font-bold border border-slate-300"
                          >
                            Audit
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
