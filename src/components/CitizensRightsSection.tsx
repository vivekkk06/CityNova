'use client';

import React from 'react';
import Link from 'next/link';
import {
  Scale,
  ShieldCheck,
  Clock,
  Camera,
  Coins,
  AlertTriangle,
  Download,
  CheckCircle2,
  Building2,
  FileText,
  PhoneCall,
} from 'lucide-react';

export default function CitizensRightsSection() {
  const rights = [
    {
      step: '01',
      title: 'Right to Time-Bound Public Delivery',
      titleHi: 'समयबद्ध सेवा हक्क',
      sla: '24 to 72 Hours Guaranteed',
      icon: Clock,
      color: 'bg-blue-50 text-blue-800 border-blue-200',
      desc: 'Under the Goa Right to Public Services Act 2013, municipal services cannot be delayed indefinitely. Potholes, streetlights, and sanitation have legally binding SLA deadlines with a public countdown timer.',
    },
    {
      step: '02',
      title: 'Right to Geo-Tagged Photo Proof',
      titleHi: 'भौगोलिक छायाचित्र पुरावा',
      sla: 'Zero Paper-Only Closures',
      icon: Camera,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      desc: 'No municipal officer or contractor can mark a grievance resolved without uploading a tamper-evident, GPS-matched "After" photo taken physically within 150m of the reported site.',
    },
    {
      step: '03',
      title: 'Right to Citizen Verification & Dispute',
      titleHi: 'नागरिक पडताळणी व पुनर्तक्रार हक्क',
      sla: '48-Hour Citizen Review Window',
      icon: ShieldCheck,
      color: 'bg-purple-50 text-purple-800 border-purple-200',
      desc: 'Work is marked "Provisionally Resolved" first. You and your ward neighbors have the legal right to confirm satisfaction or dispute poor-quality work, triggering an automatic supervisor re-inspection.',
    },
    {
      step: '04',
      title: 'Right to Statutory Delay Penalty',
      titleHi: 'विलंब भरपाई अधिकार',
      sla: '₹250 / Day Deduction',
      icon: Coins,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      desc: 'If an active grievance breaches its statutory SLA deadline without a documented force majeure reason, the designated engineer is subject to a ₹250/day salary deduction credited toward municipal remediation funds.',
    },
  ];

  const serviceStandards = [
    { service: 'Water Main Pipe Rupture (Khandepar Feeder)', sla: '8 Hours', dept: 'PWD Division III (Water)' },
    { service: 'Dangerous Road Asphalt Pothole / Crater', sla: '48 Hours', dept: 'PWD Division XIV (Roads)' },
    { service: 'Critical Streetlight Outage (Hospital Corridors)', sla: '24 Hours', dept: 'Goa Electricity Dept' },
    { service: 'Commercial Market Garbage Dump Clearance', sla: '24 Hours', dept: 'PMC Sanitation Division' },
    { service: 'Open Stormwater Drain / Missing Manhole Cover', sla: '4 Hours (Barricade) / 24h (Slab)', dept: 'PMC Civil Works' },
  ];

  return (
    <section id="citizens-rights" className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xs space-y-8 scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold mb-2">
            <Scale className="w-3.5 h-3.5 text-blue-700" />
            <span>STATUTORY CITIZEN CHARTER &bull; गोवा लोकसेवा हक्क कायदा २०१३</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Citizens&apos; Legal Rights &amp; Service Delivery Guarantee
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
            You are not a passive petitioner. Under Goa Law, every municipal service in Ponda is an enforceable legal right backed by time-bound SLAs, physical photo proof, and financial accountability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="tel:1913"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
            <span>Grievance Cell: 1913</span>
          </a>
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {rights.map((r) => {
          const Icon = r.icon;
          return (
            <div
              key={r.step}
              className="bg-slate-50/70 p-5 rounded-2xl border-2 border-slate-200 space-y-3 hover:border-blue-400 hover:bg-white transition-all shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-slate-400">
                  RIGHT {r.step}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${r.color}`}>
                  {r.sla}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-700 shadow-2xs">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 leading-snug">
                    {r.title}
                  </h3>
                  <span className="text-[10px] font-bold text-slate-500 block">
                    {r.titleHi}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                {r.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Statutory SLA Service Standards Table */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-700" />
            <span>Statutory Delivery Schedule &bull; सेवा हमी वेळापत्रक</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">Standard SLA Limits</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="pb-2">Municipal Civic Service</th>
                <th className="pb-2">Statutory Resolution Limit</th>
                <th className="pb-2">Responsible Agency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {serviceStandards.map((s, idx) => (
                <tr key={idx} className="hover:bg-white/80 transition-colors">
                  <td className="py-2.5 font-bold text-slate-900">{s.service}</td>
                  <td className="py-2.5 font-mono font-bold text-blue-700">
                    <span className="px-2 py-0.5 rounded-md bg-blue-100/70 border border-blue-200 text-blue-800">
                      {s.sla}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-600 font-medium">{s.dept}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
