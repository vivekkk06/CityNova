'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Building2, CircleCheck, CircleHelp, ExternalLink, Lightbulb, Scale, X, PlusCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function Footer() {
  const { user } = useAuth();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [rightsOpen, setRightsOpen] = useState(false);
  const cityName = user?.city?.name || 'Your city';
  const stateName = user?.state || user?.city?.state || '';

  useEffect(() => {
    if (!aboutOpen && !howOpen && !rightsOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAboutOpen(false);
        setHowOpen(false);
        setRightsOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [aboutOpen, howOpen, rightsOpen]);

  return (
    <footer className="mt-auto w-full border-t border-slate-800/80 bg-slate-950 text-slate-300">
      <div className="tricolor-bar w-full" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Section 1: CityNova Branding & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-700/80 shadow-md overflow-hidden shrink-0">
                <Image src="/citynova-icon.png" alt="CityNova Logo" width={36} height={36} unoptimized className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-white">
                  City<span className="text-teal-400">Nova</span>
                </span>
                <p className="text-xs text-slate-400 font-medium">
                  {cityName}{stateName ? ` • ${stateName}` : ''}
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-400 max-w-sm">
              Empowering citizens and municipal authorities with transparent grievance redressal, verifiable repair milestones, and geotagged civic accountability.
            </p>
          </div>

          {/* Section 2: Citizen Services & Resources (All 4 links in 1 row) */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              Citizen Services
            </h4>
            <div className="p-3 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 shadow-sm">
              <div className="grid grid-cols-4 gap-2">
                <Link
                  href="/report"
                  className="flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-emerald-500/40 text-center transition-all group hover:scale-105 min-h-[96px]"
                >
                  <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform mb-2 flex items-center justify-center shrink-0">
                    <PlusCircle className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-200 group-hover:text-white leading-tight">
                    Report a Problem
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => setAboutOpen(true)}
                  className="flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-blue-500/40 text-center transition-all group hover:scale-105 min-h-[96px] cursor-pointer"
                >
                  <span className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform mb-2 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-200 group-hover:text-white leading-tight">
                    About CityNova
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setHowOpen(true)}
                  className="flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-amber-500/40 text-center transition-all group hover:scale-105 min-h-[96px] cursor-pointer"
                >
                  <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform mb-2 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-200 group-hover:text-white leading-tight">
                    How it works
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRightsOpen(true)}
                  className="flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-purple-500/40 text-center transition-all group hover:scale-105 min-h-[96px] cursor-pointer"
                >
                  <span className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform mb-2 flex items-center justify-center shrink-0">
                    <Scale className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-200 group-hover:text-white leading-tight">
                    Citizen&apos;s Rights
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Your City */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              Your City
            </h4>
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-2.5 shadow-sm">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Building2 className="w-4 h-4 text-orange-400 shrink-0" />
                <span>{cityName}{stateName ? `, ${stateName}` : ''}</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                Complaint activity and geotagged civic locations are actively monitored for this jurisdiction.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Line */}
      <div className="border-t border-slate-800/80 bg-slate-950/80 px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>&copy; 2026 CityNova Citizen Portal &bull; Official Reports for {cityName}</p>
          <p className="text-[11px] text-slate-500">Public Municipal Grievance Redressal Platform</p>
        </div>
      </div>

      {aboutOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setAboutOpen(false); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="about-citynova-title" className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl sm:p-8">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3.5 py-2 text-xs font-bold uppercase tracking-wide text-orange-800"><Building2 className="h-4 w-4" />{cityName}{stateName ? `, ${stateName}` : ''}</span>
              <h2 id="about-citynova-title" className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">About CityNova</h2>
            </div>
            <button type="button" onClick={() => setAboutOpen(false)} aria-label="Close About CityNova" className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"><X className="h-6 w-6" /></button>
          </div>

          <div className="space-y-4 py-6 text-sm leading-6 text-slate-600 sm:text-base">
            <p><strong className="text-slate-800">CityNova</strong> is a civic reporting and accountability platform configured for <strong className="text-slate-800">{cityName}{stateName ? `, ${stateName}` : ''}</strong>. Residents can report local problems and follow their progress.</p>
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="font-bold text-slate-900">Core Mission</h3>
              <p>Make civic issue reporting and follow-up clearer through transparent status tracking, location details, repair evidence, and citizen sign-off.</p>
            </div>
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="font-bold text-slate-900">Public Service Commitments</h3>
              <p>Complaints are tracked with status updates and service timelines. Applicable local service rules and timelines depend on the selected city.</p>
            </div>
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="font-bold text-slate-900">Responsible Departments</h3>
              <p>Complaints may concern the local departments responsible for roads, water, sanitation, electricity, and other civic services.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 text-sm">
            <p className="text-slate-400">{cityName}{stateName ? `, ${stateName}` : ''} &bull; Citizen Empowerment</p>
            <button type="button" onClick={() => setAboutOpen(false)} className="rounded-xl bg-slate-100 px-5 py-2.5 font-bold text-slate-700 transition-colors hover:bg-slate-200">Close</button>
          </div>
        </section>
      </div>}

      {howOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setHowOpen(false); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="how-citynova-title" className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl sm:p-8">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold uppercase tracking-wide text-blue-800"><CircleHelp className="h-4 w-4" />How it works</span>
              <h2 id="how-citynova-title" className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">How CityNova Works</h2>
            </div>
            <button type="button" onClick={() => setHowOpen(false)} aria-label="Close How it works" className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"><X className="h-6 w-6" /></button>
          </div>

          <div className="space-y-5 py-6 text-sm leading-7 text-slate-600 sm:text-base">
            <div className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-5 sm:p-7">
              <p className="text-base font-semibold leading-8 text-slate-800 sm:text-lg">Citizens in <strong>{cityName}</strong> can report local issues, share evidence, engage with their community, and track responses and progress in one place. CityNova makes each report easier to follow and helps residents participate in building cleaner, safer, and smarter cities.</p>
              <p className="font-bold text-blue-900">Your city, your voice, your future.</p>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-7">
              <p>Citizens submit a description, photos, and the issue location. They can browse reports in {cityName}, support and comment on posts, and follow status updates. When repair proof is posted, the reporting citizen can review it, sign off, or escalate the complaint back to In Progress.</p>
              <p className="font-semibold text-slate-800">Authority Employees review city reports, update complaint status, add comments, and provide an after-repair photo when marking work as repaired.</p>
              <p>Together, residents and Authority Employees can make local problems visible and encourage transparent, accountable civic services.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 text-sm">
            <p className="text-slate-400">{cityName}{stateName ? `, ${stateName}` : ''} &bull; Citizen Empowerment</p>
            <button type="button" onClick={() => setHowOpen(false)} className="rounded-xl bg-slate-100 px-5 py-2.5 font-bold text-slate-700 transition-colors hover:bg-slate-200">Close</button>
          </div>
        </section>
      </div>}

      {rightsOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setRightsOpen(false); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="citizen-rights-title" className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl sm:p-7">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3.5 py-2 text-xs font-bold uppercase tracking-wide text-purple-800"><Scale className="h-4 w-4" />Citizen Legal Charter</span>
              <h2 id="citizen-rights-title" className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">Essential Citizen Rights Every Indian Should Know</h2>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">Fundamental legal protections, complaint mechanisms, and practical safeguards for everyday citizens.</p>
            </div>
            <button type="button" onClick={() => setRightsOpen(false)} aria-label="Close Citizen's Rights" className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"><X className="h-6 w-6" /></button>
          </div>

          <div className="space-y-5 py-6">
            <article className="rounded-2xl border border-purple-200 p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-black text-white">1</span>
                <h3 className="text-lg font-extrabold sm:text-xl">Right to Information (RTI): Ask the Government for Records</h3>
              </div>
              <p className="mt-3 inline-flex rounded-md bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-800">RTI Act, 2005 (Sections 3, 6, 7 &amp; 19)</p>
              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">Indian citizens can request information and records held by public authorities without explaining why. You can inspect public works, project progress, expenditure, and administrative decisions. If rejected, an official appeal process is provided.</p>
              <a href="https://rtionline.gov.in/" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-purple-700 hover:text-purple-900">RTI Online <ExternalLink className="h-4 w-4" /></a>
              <p className="mt-2 text-xs leading-5 text-slate-500">The central RTI Online portal accepts requests for Central Government public authorities. For state or local authorities, use the applicable state process.</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-black text-white">2</span>
                <h3 className="text-lg font-extrabold sm:text-xl">Freedom of Speech &amp; Peaceful Assembly</h3>
                <span className="rounded-md bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-800">Constitution of India, Article 19(1)(a) &amp; 19(1)(b)</span>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">Citizens have the constitutional right to express opinions, question government policies, and assemble peacefully without arms, subject to lawful conditions and public order requirements.</p>
              <a href="https://www.legislative.gov.in/static/uploads/2025/07/88cca69e868e50b217f855be2fb8bdba.pdf" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-purple-700 hover:text-purple-900">Constitution of India, Article 19 <ExternalLink className="h-4 w-4" /></a>
            </article>

            <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
              <h3 className="flex items-center gap-2 text-lg font-extrabold text-amber-950"><Lightbulb className="h-5 w-5 text-amber-600" />Practical Knowledge Citizens Should Remember</h3>
              <ul className="mt-4 space-y-3">
                {[
                  'Ask for an acknowledgment and always keep the complaint number, filing date, and receiving office details.',
                  'Preserve relevant physical and digital evidence: photographs, receipts, messages, and official correspondence.',
                  'Ask for written reasons and the statutory rule or procedure relied upon whenever an official decision affects you.',
                  'Use the correct escalation route: municipal grievance, police complaint, RTI application, and consumer court are distinct processes.',
                  'Check deadlines: statutory appeals and review petitions have strict legal time limits.',
                ].map((tip) => <li key={tip} className="flex gap-3 rounded-xl border border-amber-100 bg-white/80 p-3.5 text-sm leading-6 text-slate-700 sm:text-base"><CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />{tip}</li>)}
              </ul>
            </aside>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 text-sm">
            <p className="text-slate-400">{cityName}{stateName ? `, ${stateName}` : ''} &bull; Citizen Empowerment</p>
            <button type="button" onClick={() => setRightsOpen(false)} className="rounded-xl bg-slate-100 px-5 py-2.5 font-bold text-slate-700 transition-colors hover:bg-slate-200">Close</button>
          </div>
        </section>
      </div>}
    </footer>
  );
}
