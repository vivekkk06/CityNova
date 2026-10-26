'use client';

import React from 'react';
import Link from 'next/link';
import { History, CheckCircle2, MapPin, ArrowRight, Sparkles } from 'lucide-react';

interface CivicMemoryTicket {
  id: string;
  caseId: string;
  title: string;
  category: string;
  status: string;
  distanceMeters: number;
  assignedOfficerName?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface CivicMemorySectionProps {
  pastFixes: CivicMemoryTicket[];
}

export default function CivicMemorySection({ pastFixes }: CivicMemorySectionProps) {
  if (pastFixes.length === 0) return null;

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Civic Memory Ledger</span>
              <span className="text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                Recurring Spotter
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              {pastFixes.length} past resolution(s) documented within 150 meters of this exact location.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {pastFixes.map((ticket) => (
          <Link
            key={ticket.id}
            href={`/ticket/${ticket.caseId}`}
            className="group block p-3.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-all shadow-2xs"
          >
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                {ticket.caseId}
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 text-[10px]">
                <CheckCircle2 className="w-3 h-3" /> Resolved ({ticket.distanceMeters}m away)
              </span>
            </div>

            <h4 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
              {ticket.title}
            </h4>

            <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>{ticket.category}</span>
              <span className="text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5 font-medium text-[10px]">
                Inspect Fix <ArrowRight className="w-3 h-3" />
              </span>
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
