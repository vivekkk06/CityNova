'use client';

import React from 'react';
import Link from 'next/link';
import { History, CheckCircle2, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

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
    <div className="bg-amber-50/60 rounded-2xl p-6 border-2 border-amber-200/80 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shadow-xs">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Civic Memory &amp; Past Ward History</span>
              <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full uppercase tracking-wider">
                स्थानिक इतिहास
              </span>
            </h3>
            <p className="text-xs text-slate-600">
              {pastFixes.length} earlier repair(s) documented within 150 meters of this location. Helps prevent recurring issues.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {pastFixes.map((ticket) => (
          <Link
            key={ticket.id}
            href={`/ticket/${ticket.caseId}`}
            className="group block p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-mono font-bold text-blue-700">
                {ticket.caseId}
              </span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 text-[11px] border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Resolved ({ticket.distanceMeters}m away)
              </span>
            </div>

            <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-blue-700 transition-colors">
              {ticket.title}
            </h4>

            <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="font-medium text-slate-600">{ticket.category}</span>
              <span className="text-blue-700 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold text-xs">
                View Past Resolution <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
