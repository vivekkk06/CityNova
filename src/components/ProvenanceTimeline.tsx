'use client';

import React from 'react';
import {
  FileText,
  Sparkles,
  Building,
  CheckCircle2,
  Camera,
  AlertTriangle,
  Clock,
  Shield,
  User,
  Stamp,
} from 'lucide-react';

export interface AuditLogItem {
  id: string;
  sourceLabel: string;
  action: string;
  actorName: string;
  actorRole: string;
  details: string;
  timestamp: string | Date;
}

interface ProvenanceTimelineProps {
  logs: AuditLogItem[];
}

export default function ProvenanceTimeline({ logs }: ProvenanceTimelineProps) {
  const getBadgeStyle = (label: string) => {
    switch (label) {
      case 'Resident Input':
        return {
          icon: User,
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-600',
        };
      case 'AI Structured':
        return {
          icon: Sparkles,
          color: 'bg-purple-50 text-purple-800 border-purple-200',
          dot: 'bg-purple-600',
        };
      case 'Official Update':
        return {
          icon: Building,
          color: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-600',
        };
      case 'Proof-of-Work Submitted':
        return {
          icon: Camera,
          color: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-600',
        };
      case 'Citizen Verified':
      case 'Reviewer Verified':
        return {
          icon: CheckCircle2,
          color: 'bg-teal-50 text-teal-800 border-teal-200',
          dot: 'bg-teal-600',
        };
      case 'Citizen Disputed':
        return {
          icon: AlertTriangle,
          color: 'bg-red-50 text-red-800 border-red-200',
          dot: 'bg-red-600',
        };
      default:
        return {
          icon: Shield,
          color: 'bg-slate-50 text-slate-800 border-slate-200',
          dot: 'bg-slate-600',
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-700" />
            <span>Official Provenance &amp; Verification Audit Trail</span>
            <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full uppercase tracking-wider">
              पारदर्शिता लेखा
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Immutable, tamper-evident timeline of every official action taken under the Goa Right to Public Services Act.
          </p>
        </div>
        <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold border border-slate-200">
          {logs.length} Recorded Entries
        </span>
      </div>

      <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {logs.map((log) => {
          const style = getBadgeStyle(log.sourceLabel);
          const Icon = style.icon;
          const dateObj = new Date(log.timestamp);

          return (
            <div key={log.id} className="relative group">
              {/* Dot on line */}
              <div
                className={`absolute -left-6 top-2 w-3.5 h-3.5 rounded-full border-2 border-white ${style.dot} shadow-xs`}
              />

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Official Source Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${style.color}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {log.sourceLabel}
                    </span>

                    <span className="text-xs text-slate-600 font-medium">
                      by <strong className="text-slate-900">{log.actorName}</strong> ({log.actorRole})
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono font-medium">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {dateObj.toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}{' '}
                    &bull;{' '}
                    {dateObj.toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed font-sans">
                  {log.details}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
