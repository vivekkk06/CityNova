'use client';

import React from 'react';
import {
  Scale,
  ExternalLink,
  PhoneCall,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function CitizensRightsSection() {
  const { language } = useLanguage();

  const bulletRights = [
    {
      title: 'Time-Bound Service Delivery (24 to 72 Hours Guaranteed)',
      titleHi: 'समयबद्ध सेवा की गारंटी (२४ से ७२ घंटे)',
      titleKok: 'वेळार सेवा मेळपाची हमी (२४ ते ७२ वरां)',
      detail:
        'All reported civic issues—including dangerous potholes, pipeline leaks, dark streetlights, and garbage dumps—have legally binding SLA turnaround countdowns under Goa state law.',
    },
    {
      title: 'Mandatory Geo-Tagged Photo Proof (Zero Paper Closures)',
      titleHi: 'जीपीएस फोटो प्रमाण अनिवार्य (कागजी खानापूर्ति बंद)',
      titleKok: 'प्रत्यक्ष जीपीएस फोटो पुरावो सक्तीचो',
      detail:
        'No municipal contractor or official can close a complaint without uploading GPS-matched "Before & After" photos taken physically within 150 meters of the reported location.',
    },
    {
      title: 'Resident Sign-Off & Right to Dispute (48-Hour Review Window)',
      titleHi: 'नागरिक सत्यापन एवं पुनर्तक्रार का अधिकार (४८ घंटे)',
      titleKok: 'नागरीक पडताळणी आनी फेर-तक्रार हक्क (४८ वरां)',
      detail:
        'Issues are marked "Provisionally Resolved" first. You and your ward neighbors have the legal right to confirm satisfaction or dispute substandard work for an immediate supervisor audit.',
    },
    {
      title: 'Statutory Delay Penalty (₹250 / Day Financial Compensation)',
      titleHi: 'कानूनी विलंब हर्ज़ाना (₹२५० प्रति दिन वेतन कटौती)',
      titleKok: 'वेळ पाळिना जाल्यार दर दिसाक ₹२५० भरपाय',
      detail:
        'If a ticket breaches its statutory SLA deadline without a certified natural calamity reason, the responsible department engineer is subject to a ₹250/day deduction credited toward city remediation.',
    },
  ];

  return (
    <section
      id="citizens-rights"
      className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 scroll-mt-20"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold mb-2">
            <Scale className="w-3.5 h-3.5 text-blue-700" />
            <span>STATUTORY CITIZEN CHARTER &bull; गोवा लोकसेवा हक्क कायदा २०१३</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {language === 'kok'
              ? 'नागरीकांचे कायदेशीर हक्क आनी सेवा हमी'
              : language === 'hi'
              ? 'नागरिक कानूनी अधिकार एवं सेवा गारंटी'
              : "Citizens' Legal Rights & Service Delivery Guarantee"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl font-medium">
            Under Goa state law, municipal service delivery in Ponda is an enforceable legal right backed by fixed statutory deadlines and physical photo proof.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="tel:1913"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
            <span>Grievance Cell: 1913</span>
          </a>
        </div>
      </div>

      {/* Simplified Bullet Points */}
      <ul className="space-y-4">
        {bulletRights.map((item, index) => (
          <li
            key={index}
            className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-50 transition-colors"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="text-sm font-bold text-slate-900 block">
                {language === 'kok' ? item.titleKok : language === 'hi' ? item.titleHi : item.title}
              </strong>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {item.detail}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {/* Clear Reference Link Box */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-blue-50/60 p-4 rounded-xl border border-blue-200">
        <div className="flex items-center gap-2 text-slate-800">
          <FileText className="w-4 h-4 text-blue-700 shrink-0" />
          <span>
            <strong>Official Statutory Reference:</strong> The Goa (Right of Citizens to Time-Bound Delivery of Public Services) Act, 2013 (Act No. 20 of 2013).
          </span>
        </div>

        <a
          href="https://www.goa.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-bold text-blue-700 hover:text-blue-900 hover:underline shrink-0"
        >
          <span>View Gazette Reference ↗</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </section>
  );
}
