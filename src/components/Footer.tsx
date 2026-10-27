'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  PhoneCall,
  Mail,
  MapPin,
  Scale,
  HelpCircle,
  Info,
  ShieldCheck,
  X,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  Map,
  Lock,
  AlertTriangle,
} from 'lucide-react';

type ModalType = 'about' | 'how-it-works' | 'know-your-city' | 'know-your-rights' | 'privacy' | null;

export default function Footer() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveModal(null);
    };
    if (activeModal) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [activeModal]);

  return (
    <>
      <footer className="w-full bg-slate-950 text-slate-300 border-t border-slate-800/80 mt-auto">
        {/* Tricolor Accent Bar */}
        <div className="tricolor-bar w-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pb-10 border-b border-slate-800/80">
            {/* Column 1: Identity & Official Affiliation */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-950/40">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-white text-lg font-black tracking-tight">
                    City<span className="text-orange-500">Nova</span>
                  </span>
                  <p className="text-[11px] font-medium text-slate-400">
                    Ponda Municipal Council &bull; Goa
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Official civic grievance redressal and transparent municipal service delivery ledger, enforcing statutory time limits under Goa state law.
              </p>

              <div className="pt-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>24x7 Municipal Monitoring Active</span>
                </div>
              </div>
            </div>

            {/* Column 2: Civic Knowledge & Guides */}
            <div className="space-y-3.5">
              <h4 className="text-white text-xs font-bold uppercase tracking-wider text-slate-200">
                Civic Knowledge
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('about')}
                    className="flex items-center gap-2 text-slate-300 hover:text-orange-400 transition-colors text-left w-full group py-0.5"
                  >
                    <Info className="w-3.5 h-3.5 text-slate-500 group-hover:text-orange-400 transition-colors shrink-0" />
                    <span>About Us</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('how-it-works')}
                    className="flex items-center gap-2 text-slate-300 hover:text-orange-400 transition-colors text-left w-full group py-0.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-500 group-hover:text-orange-400 transition-colors shrink-0" />
                    <span>How It Works</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('know-your-city')}
                    className="flex items-center gap-2 text-slate-300 hover:text-orange-400 transition-colors text-left w-full group py-0.5"
                  >
                    <Map className="w-3.5 h-3.5 text-slate-500 group-hover:text-orange-400 transition-colors shrink-0" />
                    <span>Know Your City</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('know-your-rights')}
                    className="flex items-center gap-2 text-slate-300 hover:text-orange-400 transition-colors text-left w-full group py-0.5"
                  >
                    <Scale className="w-3.5 h-3.5 text-slate-500 group-hover:text-orange-400 transition-colors shrink-0" />
                    <span>Know Your Rights</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Portals & Governance */}
            <div className="space-y-3.5">
              <h4 className="text-white text-xs font-bold uppercase tracking-wider text-slate-200">
                Portals &amp; Transparency
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    href="/report"
                    className="flex items-center gap-2 text-slate-300 hover:text-orange-400 transition-colors py-0.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Report a Civic Problem</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#public-ledger"
                    className="flex items-center gap-2 text-slate-300 hover:text-orange-400 transition-colors py-0.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Public Grievance Ledger</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#city-map"
                    className="flex items-center gap-2 text-slate-300 hover:text-orange-400 transition-colors py-0.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Interactive Ward GIS Map</span>
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('privacy')}
                    className="flex items-center gap-2 text-slate-300 hover:text-orange-400 transition-colors text-left w-full group py-0.5"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-500 group-hover:text-orange-400 transition-colors shrink-0" />
                    <span>Citizen Privacy Policy</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: 24x7 Emergency Contacts */}
            <div className="space-y-3.5">
              <h4 className="text-white text-xs font-bold uppercase tracking-wider text-slate-200">
                Emergency Helplines
              </h4>
              <div className="space-y-2.5 text-xs">
                <a
                  href="tel:1913"
                  className="flex items-center gap-2 text-white font-bold hover:text-orange-400 transition-colors group"
                >
                  <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <span>1913 (PMC Toll-Free Helpline)</span>
                </a>
                <div className="text-slate-400 space-y-1 text-[11px] pl-6">
                  <p>Control Room: <a href="tel:08322312148" className="text-slate-300 hover:underline">0832-2312148</a></p>
                  <p>Water Emergency: <a href="tel:08322314567" className="text-slate-300 hover:underline">0832-2314567</a></p>
                </div>
                <div className="flex items-center gap-2 text-slate-400 pt-1">
                  <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <a href="mailto:grievance.pmc@goa.gov.in" className="hover:text-white transition-colors truncate">
                    grievance.pmc@goa.gov.in
                  </a>
                </div>
                <div className="flex items-start gap-2 text-slate-400 text-[11px] pt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span>Municipal Administrative Complex, Sadar, Ponda, Goa 403401</span>
                </div>
              </div>
            </div>
          </div>

          {/* Simple Bottom Bar */}
          <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
            <div>
              &copy; 2026 Ponda Municipal Council (PMC) &bull; CityNova Civic Platform
            </div>
            <div className="text-[11px] text-slate-400 text-center sm:text-right">
              Enforcing the Goa (Right of Citizens to Time-Bound Delivery of Public Services) Act, 2013
            </div>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          INTERACTIVE FUNCTIONAL MODALS
      ========================================================================== */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6 text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                {activeModal === 'about' && (
                  <>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold mb-1.5">
                      <Building2 className="w-3.5 h-3.5 text-orange-600" />
                      <span>PONDA MUNICIPAL COUNCIL, GOA</span>
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">About CityNova</h3>
                  </>
                )}
                {activeModal === 'how-it-works' && (
                  <>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold mb-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                      <span>THE PROMISE-TO-PROOF LEDGER</span>
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">How It Works</h3>
                  </>
                )}
                {activeModal === 'know-your-city' && (
                  <>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-1.5">
                      <Map className="w-3.5 h-3.5 text-emerald-600" />
                      <span>JURISDICTIONS &amp; WARDS</span>
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Know Your City — Ponda, Goa</h3>
                  </>
                )}
                {activeModal === 'know-your-rights' && (
                  <>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold mb-1.5">
                      <Scale className="w-3.5 h-3.5 text-purple-600" />
                      <span>STATUTORY CITIZEN CHARTER</span>
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Know Your Rights</h3>
                  </>
                )}
                {activeModal === 'privacy' && (
                  <>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold mb-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-700" />
                      <span>DATA MINIMIZATION</span>
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Citizen Privacy Policy</h3>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: About Us */}
            {activeModal === 'about' && (
              <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                <p>
                  <strong>CityNova</strong> is the official civic technology operating system deployed for <strong>Ponda Municipal Council (PMC)</strong>, Goa, instituted under the Goa Municipalities Act, 1968.
                </p>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-orange-600" />
                    Zero Grievance Leakage Guarantee
                  </h5>
                  <p className="text-xs text-slate-600">
                    CityNova eliminates unaccountable paper closures. Every reported pothole, drainage overflow, water leak, or street light failure is logged with GPS coordinates and tracked against legal resolution deadlines.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-3 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900 block">Responsible Agencies</span>
                    <span className="text-slate-500">PMC Sanitation, PWD Div III (Water), PWD Div XIV (Roads), Goa Electricity Dept.</span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900 block">Governing Legislation</span>
                    <span className="text-slate-500">Goa (Right of Citizens to Time-Bound Delivery of Public Services) Act, 2013</span>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Body: How It Works */}
            {activeModal === 'how-it-works' && (
              <div className="space-y-3.5 text-xs text-slate-600">
                <div className="flex gap-3 p-3.5 rounded-xl bg-orange-50/60 border border-orange-200/60">
                  <div className="w-6 h-6 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">1</div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">Multimodal Citizen Intake</h5>
                    <p className="mt-0.5">Report in seconds using voice notes (Konkani, Marathi, English), camera photos, or text description. Smart AI structures urgency and department routing automatically.</p>
                  </div>
                </div>
                <div className="flex gap-3 p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/60">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">2</div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">50m Spatial GIS Deduplication</h5>
                    <p className="mt-0.5">High-precision polygon ray-casting matches the issue to its Ponda ward. If within 50m of an existing ticket, citizens can upvote to prevent duplicate work orders.</p>
                  </div>
                </div>
                <div className="flex gap-3 p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60">
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">3</div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">SLA Countdown &amp; Official Assignment</h5>
                    <p className="mt-0.5">The ticket is assigned to the designated junior engineer with a public commitment date and statutory turnaround countdown under Goa law.</p>
                  </div>
                </div>
                <div className="flex gap-3 p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">4</div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">Two-Stage Geo-Gated Resolution Gate</h5>
                    <p className="mt-0.5">Field staff must upload an on-site photo with verified GPS. The case only permanently closes when the resident inspects and clicks &quot;Verify &amp; Close&quot;.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Body: Know Your City */}
            {activeModal === 'know-your-city' && (
              <div className="space-y-4 text-xs text-slate-600">
                <p className="text-sm">
                  Ponda Municipal Council models the municipal zones of Ponda, Goa, with high-precision boundary polygons and real officer assignments:
                </p>
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                    <span className="font-bold text-slate-900 block text-sm">WARD 1: Upper Bazar &amp; Sadar Heritage</span>
                    <p className="text-slate-500 mt-0.5">PMC Administrative Bhavan, Old Bus Stand, Kranti Maidan, Almeida High School, Municipal Vegetable &amp; Fish Market.</p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                    <span className="font-bold text-slate-900 block text-sm">WARD 2: Khadpabandh &amp; Tisk Urban Corridor</span>
                    <p className="text-slate-500 mt-0.5">Tisk Highway Junction, Ponda Sub-District Hospital, Rajiv Gandhi Kala Mandir, Khadpabandh Housing societies.</p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                    <span className="font-bold text-slate-900 block text-sm">WARD 3: Curti &amp; Khandepar Riverfront Belt</span>
                    <p className="text-slate-500 mt-0.5">PWD Khandepar Water Works &amp; Raw Water Intake, Curti Industrial Estate, KTC Bus Stand, Betora Bypass.</p>
                  </div>
                </div>
                <div className="pt-2">
                  <Link
                    href="/#city-map"
                    onClick={() => setActiveModal(null)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition-colors"
                  >
                    <span>View Interactive GIS Ward Map</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* Modal Body: Know Your Rights */}
            {activeModal === 'know-your-rights' && (
              <div className="space-y-4 text-xs text-slate-600">
                <p className="text-sm text-slate-700">
                  Under the <strong>Goa (Right of Citizens to Time-Bound Delivery of Public Services) Act, 2013</strong>, you have the following enforceable legal rights:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200/80">
                    <span className="font-bold text-blue-950 block text-sm flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-600" />
                      8-Hour Water Emergency
                    </span>
                    <p className="mt-1 text-slate-600">Water pipeline ruptures require mandatory 8-hour containment, with free municipal tanker provision if disruption exceeds 12 hours.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/80">
                    <span className="font-bold text-amber-950 block text-sm flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      48-Hour Pothole Repair
                    </span>
                    <p className="mt-1 text-slate-600">Road potholes require 4-hour mandatory barricading and permanent mastic bitumen restoration within 48 hours.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
                    <span className="font-bold text-emerald-950 block text-sm flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      24-Hour Garbage Clearance
                    </span>
                    <p className="mt-1 text-slate-600">Residential and commercial waste dumps must be cleared within 24 hours under Clean Goa Mission directives.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-200/80">
                    <span className="font-bold text-purple-950 block text-sm flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-purple-600" />
                      Right to Dispute Substandard Work
                    </span>
                    <p className="mt-1 text-slate-600">Citizens hold 48-hour veto rights to reject substandard contractor repairs and trigger Chief Officer escalation.</p>
                  </div>
                </div>
                <div className="pt-2">
                  <Link
                    href="/#citizens-rights"
                    onClick={() => setActiveModal(null)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-colors"
                  >
                    <span>Read Full Statutory Citizen Charter</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* Modal Body: Privacy */}
            {activeModal === 'privacy' && (
              <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                <p className="text-sm">
                  CityNova implements <strong>strict data minimization</strong> to ensure resident safety and prevent harassment while preserving complete municipal accountability:
                </p>
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="font-bold text-slate-900 block text-xs">Public Identity Masking</span>
                    <p className="mt-0.5">Citizen names (e.g. <code>R***n B****r</code>) and mobile numbers (e.g. <code>+91-98****667</code>) are masked on all public dockets and feeds.</p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="font-bold text-slate-900 block text-xs">Restricted Field Staff Access</span>
                    <p className="mt-0.5">Full phone numbers are only disclosed to the specific verified field crew member dispatched to your location for repair coordination.</p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="font-bold text-slate-900 block text-xs">Immutable Audit Logs</span>
                    <p className="mt-0.5">All officer reassignments, status transitions, and dispute submissions are permanently logged on the tamper-evident audit ledger.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
