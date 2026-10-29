'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Info,
  HelpCircle,
  Compass,
  Scale,
  X,
  PhoneCall,
  MapPin,
  ArrowRight,
  Building2,
  ExternalLink,
  CheckCircle2,
  Lightbulb,
  FilePlus2,
} from 'lucide-react';
import KnowYourCityModal from '@/components/KnowYourCityModal';

type ModalType = 'about' | 'how-it-works' | 'know-your-city' | 'know-your-rights' | null;

const CITIZEN_RIGHTS = [
  {
    num: 1,
    title: 'Right to Information (RTI): Ask the Government for Records',
    law: 'RTI Act, 2005 (Sections 3, 6, 7 & 19)',
    summary: 'Indian citizens can request information and records held by public authorities without explaining why. You can inspect public works, project progress, expenditure, and administrative decisions. If rejected, an official appeal process is provided.',
    linkText: 'rtionline.gov.in',
    linkUrl: 'https://rtionline.gov.in/',
  },
  {
    num: 2,
    title: 'Freedom of Speech & Peaceful Assembly',
    law: 'Constitution of India, Article 19(1)(a) & 19(1)(b)',
    summary: 'Citizens have the constitutional right to express opinions, question government policies, and assemble peacefully without arms, subject to lawful conditions and public order requirements.',
    linkText: 'legislative.gov.in',
    linkUrl: 'https://legislative.gov.in/constitution-of-india/',
  },
  {
    num: 3,
    title: 'Equality Before the Law',
    law: 'Constitution of India, Article 14',
    summary: 'The State must ensure equality before the law and equal protection of laws. Government decisions must be non-arbitrary. If a public service is denied, you have the right to demand written reasons and the legal rule relied upon.',
    linkText: 'legislative.gov.in',
    linkUrl: 'https://legislative.gov.in/constitution-of-india/',
  },
  {
    num: 4,
    title: 'Reporting a Crime & Seeking Registration of an FIR (Zero FIR)',
    law: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS Section 173)',
    summary: 'Information about a cognizable offence can be reported at any police station regardless of area, in person or electronically. You are entitled by law to a free copy of the recorded FIR. Refusals can be escalated directly to the Superintendent of Police or Magistrate.',
    linkText: 'indiacode.nic.in',
    linkUrl: 'https://www.indiacode.nic.in/',
  },
  {
    num: 5,
    title: 'Rights When Arrested by Police',
    law: 'Constitution Articles 21 & 22; BNSS Sections 36–38, 47 & 48',
    summary: 'An arrested person must be promptly informed of the grounds of arrest, the right to bail (where applicable), and has the right to have a nominated relative or friend notified immediately and meet an advocate of their choice.',
    linkText: 'mha.gov.in',
    linkUrl: 'https://www.mha.gov.in/',
  },
  {
    num: 6,
    title: 'Access to Free Legal Aid',
    law: 'Legal Services Authorities Act, 1987',
    summary: 'Eligible citizens—including women, children, members of Scheduled Castes and Scheduled Tribes, persons in custody, and low-income groups—have a statutory right to free legal aid through NALSA, State, and District Legal Services Authorities.',
    linkText: 'National Helpline: 15100',
    linkUrl: 'https://nalsa.gov.in/',
  },
  {
    num: 7,
    title: 'Complaints About Alleged Human-Rights Violations',
    law: 'Protection of Human Rights Act, 1993',
    summary: 'Citizens may submit complaints regarding alleged human rights abuses, custodial mistreatment, unlawful detention, or systemic official failure to protect fundamental rights to the National or State Human Rights Commission.',
    linkText: 'nhrc.nic.in',
    linkUrl: 'https://nhrc.nic.in/',
  },
  {
    num: 8,
    title: 'Government-Service Grievances (CPGRAMS)',
    law: 'Centralised Public Grievance Redress & Monitoring System',
    summary: 'Citizens can lodge eligible grievances regarding government service delivery delays and track resolution status with a unique registration number, with dedicated feedback and appeal mechanisms.',
    linkText: 'pgportal.gov.in',
    linkUrl: 'https://pgportal.gov.in/',
  },
  {
    num: 9,
    title: 'Seeking Help for Violence or Discrimination Against Women',
    law: 'National Commission for Women (NCW) & Special Laws',
    summary: 'Women can report domestic violence, sexual harassment, stalking, or police inaction through specialized channels. The NCW accepts formal complaints and takes them up directly with administrative and law enforcement authorities.',
    linkText: 'ncwapps.nic.in',
    linkUrl: 'https://ncwapps.nic.in/',
  },
  {
    num: 10,
    title: 'Consumer Grievance and Redress',
    law: 'Consumer Protection Act, 2019',
    summary: 'Consumers may challenge unfair trade practices, defective products, and deficient contractor or municipal services through the National Consumer Helpline and approach Consumer Commissions for compensation.',
    linkText: 'National Consumer Helpline: 1915',
    linkUrl: 'https://consumerhelpline.gov.in/',
  },
];

const PRACTICAL_TIPS = [
  'Ask for an acknowledgment and always keep the complaint number, filing date, and receiving office details.',
  'Preserve relevant physical and digital evidence: photographs, receipts, messages, and official correspondence.',
  'Ask for written reasons and the statutory rule or procedure relied upon whenever an official decision affects you.',
  'Use the correct escalation route: municipal grievance, police complaint, RTI application, and consumer court are distinct processes.',
  'Check deadlines: statutory appeals and review petitions have strict legal time limits.',
];

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
      <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
        {/* Tricolor Government Hairline Accent */}
        <div className="tricolor-bar w-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Centered Clickables: About Us, How It Works, Know Your City, Know Your Rights */}
          <nav aria-label="Footer Navigation" className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-semibold">
            <button
              type="button"
              onClick={() => setActiveModal('about')}
              className="flex items-center gap-2 text-slate-300 hover:text-orange-400 transition-colors cursor-pointer group py-1"
            >
              <Info className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
              <span>About Us</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('how-it-works')}
              className="flex items-center gap-2 text-slate-300 hover:text-orange-400 transition-colors cursor-pointer group py-1"
            >
              <HelpCircle className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span>How It Works</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('know-your-city')}
              className="flex items-center gap-2 text-slate-300 hover:text-orange-400 transition-colors cursor-pointer group py-1"
            >
              <Compass className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Know Your City</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('know-your-rights')}
              className="flex items-center gap-2 text-slate-300 hover:text-orange-400 transition-colors cursor-pointer group py-1"
            >
              <Scale className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span>Know Your Rights</span>
            </button>
          </nav>

          {/* Simple Bottom Line */}
          <div className="mt-5 pt-4 border-t border-slate-800/70 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-slate-400">
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
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div
            className={`bg-white rounded-2xl w-full max-h-[88vh] overflow-y-auto shadow-2xl border border-slate-200 p-5 sm:p-7 space-y-6 text-slate-800 ${
              activeModal === 'know-your-city'
                ? 'max-w-4xl'
                : activeModal === 'know-your-rights'
                ? 'max-w-3xl'
                : 'max-w-2xl'
            }`}
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
                      <span>HOW IT WORKS</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      How CityNova Works
                    </h3>
                  </>
                )}
                {activeModal === 'know-your-city' && (
                  <>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-1.5">
                      <Compass className="w-3.5 h-3.5 text-emerald-600" />
                      <span>CIVIC INFORMATION HUB</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      Know Your City
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Essential services, important contacts, and local information for your city.
                    </p>
                  </>
                )}
                {activeModal === 'know-your-rights' && (
                  <>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold mb-1.5">
                      <Scale className="w-3.5 h-3.5 text-purple-600" />
                      <span>CITIZEN LEGAL CHARTER</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      Essential Citizen Rights Every Indian Should Know
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Fundamental legal protections, complaint mechanisms, and practical safeguards for everyday citizens.
                    </p>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: About Us */}
            {activeModal === 'about' && (
              <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                <p className="text-sm">
                  <strong>CityNova</strong> is an official civic reporting and accountable municipal governance platform deployed for <strong>Ponda Municipal Council (PMC), Goa</strong>.
                </p>
                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <span className="font-bold text-slate-900 block text-xs">Core Mission</span>
                    <p className="mt-0.5">Eliminate accountability gaps between citizens and municipal engineers through transparent tracking, GPS-verified proof of resolution, and citizen sign-off gates.</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <span className="font-bold text-slate-900 block text-xs">Statutory Legal Mandate</span>
                    <p className="mt-0.5">Enforces statutory turnaround time limits under the <em>Goa (Right of Citizens to Time-Bound Delivery of Public Services) Act, 2013</em> and the <em>Goa Municipalities Act, 1968</em>.</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <span className="font-bold text-slate-900 block text-xs">Responsible Departments</span>
                    <p className="mt-0.5">Ponda Municipal Council Sanitation, PWD Division III (Khandepar Water Works), PWD Works Division XIV (Roads &amp; Bridges), and Goa Electricity Department.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Body: How It Works */}
            {activeModal === 'how-it-works' && (
              <div className="space-y-4 text-slate-700 leading-relaxed text-sm sm:text-base">
                <div className="p-4 sm:p-5 rounded-2xl border border-blue-100 bg-blue-50/50 space-y-3">
                  <p className="leading-relaxed text-slate-800 font-medium">
                    Citizens can report local issues, share evidence, engage with their community, and track official responses and progress in one place. By making every report more visible and every commitment easier to follow, CityNova empowers citizens to participate in building cleaner, safer, and smarter cities.
                  </p>
                  <p className="text-blue-900 font-bold text-sm tracking-wide">
                    Your city, your voice, your future.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <p className="leading-relaxed text-slate-700">
                    Reporting local issues with photos, descriptions, and location details, sharing evidence, commenting on reports, confirming genuine problems, and flagging duplicates. They can track official responses, monitor progress, provide feedback on completed work, and use the Know Your Rights section to understand how to seek help.
                  </p>
                  <p className="leading-relaxed text-slate-700 font-medium">
                    Together, citizens can bring recurring problems to attention and encourage transparent, accountable local governance.
                  </p>
                </div>

                {/* Quick Action Links */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <Link
                    href="/report"
                    onClick={() => setActiveModal(null)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
                  >
                    <FilePlus2 className="w-4 h-4" />
                    <span>Report a Civic Problem Now</span>
                  </Link>

                  <Link
                    href="/#public-ledger"
                    onClick={() => setActiveModal(null)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
                  >
                    <span>View Public Grievance Ledger</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* Modal Body: Know Your City (Personalized, Dynamic Information Hub) */}
            {activeModal === 'know-your-city' && (
              <KnowYourCityModal onClose={() => setActiveModal(null)} />
            )}

            {/* Modal Body: Know Your Rights (Essential Citizen Rights - Single Column with Enhanced Font Size) */}
            {activeModal === 'know-your-rights' && (
              <div className="space-y-6">
                {/* Single Column List of 10 Rights */}
                <div className="flex flex-col space-y-4">
                  {CITIZEN_RIGHTS.map((right) => (
                    <div
                      key={right.num}
                      className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-purple-300 hover:shadow-xs transition-all space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {right.num}
                          </span>
                          <h4 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                            {right.title}
                          </h4>
                        </div>

                        <span className="inline-block text-xs font-semibold text-purple-700 bg-purple-100/80 px-2.5 py-1 rounded">
                          {right.law}
                        </span>
                      </div>

                      {/* Increased Font Size for Clear Readability */}
                      <p className="text-sm sm:text-base text-slate-700 leading-relaxed pt-1">
                        {right.summary}
                      </p>

                      {right.linkUrl && (
                        <div className="pt-1.5 flex items-center justify-end">
                          <a
                            href={right.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-purple-700 hover:text-purple-900 hover:underline"
                          >
                            <span>{right.linkText}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Practical Rules Callout - Single Column with Enhanced Font Size */}
                <div className="p-4 sm:p-5 rounded-xl border border-amber-200 bg-amber-50/70 space-y-3">
                  <div className="flex items-center gap-2.5 text-amber-950 font-bold text-sm sm:text-base">
                    <Lightbulb className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>Practical Knowledge Citizens Should Remember</span>
                  </div>
                  <ul className="flex flex-col space-y-2.5">
                    {PRACTICAL_TIPS.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 bg-white/80 p-3 rounded-lg border border-amber-200/60">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm leading-relaxed text-slate-800 font-medium">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs text-slate-400">
                Ponda Municipal Council &bull; Citizen Empowerment
              </span>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
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
