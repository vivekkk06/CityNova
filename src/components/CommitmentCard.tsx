'use client';

import React from 'react';
import {
  Clock,
  ShieldCheck,
  Calendar,
  User,
  Building,
  AlertTriangle,
  Scale,
  Sparkles,
  Building2,
  FileCheck2,
} from 'lucide-react';
import { formatSlaTimeRemaining } from '@/lib/sla';

interface CommitmentCardProps {
  caseId: string;
  legacyGrievanceNumber?: string;
  departmentName: string;
  departmentCode: string;
  assignedOfficerName?: string | null;
  publicCommitmentDate: string | Date;
  slaDeadline: string | Date;
  urgency: string;
  status: string;
  plainLanguageRights: string;
  wardName: string;
  wardZone: string;
}

export default function CommitmentCard({
  caseId,
  legacyGrievanceNumber,
  departmentName,
  departmentCode,
  assignedOfficerName,
  publicCommitmentDate,
  slaDeadline,
  urgency,
  status,
  plainLanguageRights,
  wardName,
  wardZone,
}: CommitmentCardProps) {
  const slaRemaining = formatSlaTimeRemaining(slaDeadline);
  const commitmentDateObj = new Date(publicCommitmentDate);
  const deadlineDateObj = new Date(slaDeadline);

  const isClosed = status === 'RESOLVED' || status === 'CLOSED';

  return (
    <div className="govt-card bg-white rounded-2xl p-6 shadow-md border-2 border-slate-200 relative overflow-hidden">
      {/* Top Tricolor Accent Line */}
      <div className="tricolor-bar absolute top-0 left-0 right-0 h-1.5" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-5 pt-1">
        <div>
          <div className="flex items-center gap-1.5 text-orange-600 text-[11px] font-bold uppercase tracking-wider mb-0.5">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Official Statutory Commitment &bull; सरकारी संकल्प पत्र</span>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">{caseId}</h2>
            {legacyGrievanceNumber && (
              <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono">
                Municipal Ref: {legacyGrievanceNumber}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              urgency === 'CRITICAL'
                ? 'bg-red-100 text-red-800 border border-red-300 animate-pulse'
                : urgency === 'HIGH'
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-blue-100 text-blue-800 border border-blue-300'
            }`}
          >
            {urgency} Priority
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              isClosed
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : status === 'PROVISIONALLY_RESOLVED'
                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                : 'bg-blue-100 text-blue-800 border border-blue-300'
            }`}
          >
            {status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Grid of Key Commitments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Ward & Zone */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1 font-semibold">
            <Building className="w-3.5 h-3.5 text-blue-600" />
            <span>Ward Jurisdiction</span>
          </div>
          <p className="text-sm font-bold text-slate-900 truncate">{wardName}</p>
          <p className="text-[11px] text-slate-500">{wardZone}</p>
        </div>

        {/* Assigned Agency & Officer */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1 font-semibold">
            <User className="w-3.5 h-3.5 text-orange-600" />
            <span>Responsible Officer</span>
          </div>
          <p className="text-sm font-bold text-slate-900 truncate">
            {assignedOfficerName || 'Ward Rapid Dispatch Squad'}
          </p>
          <p className="text-[11px] text-slate-500 truncate">{departmentName}</p>
        </div>

        {/* Public Commitment Date */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1 font-semibold">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Complaint Logged Date</span>
          </div>
          <p className="text-sm font-bold text-slate-900">
            {commitmentDateObj.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
          <p className="text-[11px] text-slate-500">
            {commitmentDateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Statutory SLA Countdown */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1 font-semibold">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Legal Time Limit (SLA)</span>
          </div>
          <p className="text-sm font-bold text-slate-900">
            {deadlineDateObj.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <div className="mt-1">
            {isClosed ? (
              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Resolved within SLA
              </span>
            ) : (
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${slaRemaining.badgeClass}`}>
                {slaRemaining.text}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Plain Language Citizen Charter Rights */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
        <Scale className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-orange-950 uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <span>Statutory Citizen Charter Guarantee &bull; नागरिक अधिकार गारंटी</span>
          </h4>
          <p className="text-xs text-orange-900 leading-relaxed font-medium">{plainLanguageRights}</p>
        </div>
      </div>
    </div>
  );
}
