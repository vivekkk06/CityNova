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
          color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-500',
        };
      case 'AI Structured':
        return {
          icon: Sparkles,
          color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30',
          dot: 'bg-purple-500',
        };
      case 'Official Update':
        return {
          icon: Building,
          color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30',
          dot: 'bg-blue-500',
        };
      case 'Proof-of-Work Submitted':
        return {
          icon: Camera,
          color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
          dot: 'bg-amber-500',
        };
      case 'Citizen Verified':
      case 'Reviewer Verified':
        return {
          icon: CheckCircle2,
          color: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30',
          dot: 'bg-teal-500',
        };
      case 'Citizen Disputed':
        return {
          icon: AlertTriangle,
          color: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30',
          dot: 'bg-red-500',
        };
      default:
        return {
          icon: Shield,
          color: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30',
          dot: 'bg-slate-500',
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Provenance Audit Trail
          </h3>
          <p className="text-xs text-slate-500">
            Immutable timeline with cryptographically verified source origins.
          </p>
        </div>
        <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full font-medium">
          {logs.length} Verification Events
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {logs.map((log) => {
          const style = getBadgeStyle(log.sourceLabel);
          const Icon = style.icon;
          const dateObj = new Date(log.timestamp);

          return (
            <div key={log.id} className="relative group">
              {/* Dot on line */}
              <div
                className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-950 ${style.dot} shadow-xs`}
              />

              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {/* Official Source Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${style.color}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {log.sourceLabel}
                    </span>

                    <span className="text-xs text-slate-500 font-medium">
                      by <strong className="text-slate-800 dark:text-slate-200">{log.actorName}</strong> ({log.actorRole})
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {dateObj.toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}{' '}
                    {dateObj.toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
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
