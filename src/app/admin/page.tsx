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

  // Active tab: 'ALL' | 'CRITICAL_SLA' | 'DISPUTED_ESCALATIONS'
  const [activeTab, setActiveTab] = useState<'ALL' | 'CRITICAL_SLA' | 'DISPUTED_ESCALATIONS'>(
    'ALL'
  );

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

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    if (selectedWard !== 'all' && t.wardId !== selectedWard) return false;
    if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        t.caseId.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q);
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

    return true;
  });

  const disputedCount = tickets.filter((t) => t.status === 'DISPUTED' || t.escalatedToSupervisor)
    .length;
  const criticalSlaCount = tickets.filter(
    (t) =>
      (t.urgency === 'CRITICAL' || t.urgency === 'HIGH') &&
      t.status !== 'RESOLVED' &&
      t.status !== 'CLOSED'
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Title */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold mb-1">
              <Building2 className="w-3.5 h-3.5" />
              Ponda Municipal Council (PMC), Goa &bull; पोंडा नगरपालिका
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Chief Officer & Zonal Command Matrix
            </h1>
            <p className="text-xs text-slate-500">
              Statutory SLA surveillance under the Goa Right to Public Services Act 2013 across Upper Bazar, Tisk, and Curti.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Active Wards: <strong>{wards.length} Zones</strong>
            </span>
          </div>
        </div>

        {/* Tab Switcher & Urgent Escalations Pill */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              All Grievances ({tickets.length})
            </button>

            <button
              onClick={() => setActiveTab('CRITICAL_SLA')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'CRITICAL_SLA'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Active SLA Countdown ({criticalSlaCount})
            </button>

            <button
              onClick={() => setActiveTab('DISPUTED_ESCALATIONS')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'DISPUTED_ESCALATIONS'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Supervisor Escalation Queue ({disputedCount})
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
                placeholder="Search Case ID or title..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-hidden w-48"
              />
            </div>

            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-hidden font-medium"
            >
              <option value="all">All Wards</option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.code} - {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tickets Matrix Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Case ID & Jurisdiction</th>
                  <th className="p-4">Grievance & Category</th>
                  <th className="p-4">SLA Countdown Matrix</th>
                  <th className="p-4">Assigned Field Unit</th>
                  <th className="p-4">Status & Two-Stage Gate</th>
                  <th className="p-4 text-right">Operational Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
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
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                          isDisputed ? 'bg-red-50/30 dark:bg-red-950/20' : ''
                        }`}
                      >
                        {/* Case ID */}
                        <td className="p-4 align-top">
                          <Link
                            href={`/ticket/${t.caseId}`}
                            className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <span>{t.caseId}</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </Link>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {t.ward?.name || 'Central Ward'}
                          </span>
                        </td>

                        {/* Grievance Details */}
                        <td className="p-4 align-top max-w-xs">
                          <span className="font-semibold text-slate-900 dark:text-white line-clamp-1 block">
                            {t.title}
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            {t.category} &bull; Urgency: <strong>{t.urgency}</strong>
                          </span>
                          {isDisputed && t.disputeReason && (
                            <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold block mt-1 line-clamp-1">
                              Dispute Reason: {t.disputeReason}
                            </span>
                          )}
                        </td>

                        {/* SLA Countdown Matrix */}
                        <td className="p-4 align-top">
                          {isClosed ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                              <CheckCircle2 className="w-3 h-3" /> SLA Met
                            </span>
                          ) : (
                            <div className="space-y-1">
                              <span className={`px-2 py-0.5 rounded text-[10px] ${sla.badgeClass}`}>
                                {sla.text}
                              </span>
                              <span className="text-[10px] text-slate-400 block font-mono">
                                Deadline: {new Date(t.slaDeadline).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Assigned Officer */}
                        <td className="p-4 align-top">
                          <span className="text-slate-800 dark:text-slate-200 font-medium block">
                            {t.assignedOfficerName || 'Unassigned Dispatch'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {t.department?.name || 'Public Works'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="p-4 align-top">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isClosed
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : t.status === 'PROVISIONALLY_RESOLVED'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 animate-pulse'
                                : isDisputed
                                ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}
                          >
                            {t.status.replace(/_/g, ' ')}
                          </span>
                        </td>

                        {/* Quick Supervisor Actions */}
                        <td className="p-4 align-top text-right space-x-1.5 whitespace-nowrap">
                          {t.status === 'OPEN' && (
                            <button
                              onClick={() =>
                                handleStatusChange(t.id, 'IN_PROGRESS', 'Er. Santosh Shinde (Ward Crew)')
                              }
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-bold cursor-pointer"
                            >
                              Dispatch Crew
                            </button>
                          )}

                          {isDisputed && (
                            <button
                              onClick={() =>
                                handleStatusChange(
                                  t.id,
                                  'IN_PROGRESS',
                                  'Er. Senior Supervisor Re-inspection'
                                )
                              }
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-[11px] font-bold cursor-pointer"
                            >
                              Order Re-Work
                            </button>
                          )}

                          <Link
                            href={`/ticket/${t.caseId}`}
                            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-md text-[11px] font-semibold"
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
