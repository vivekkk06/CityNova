'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  PhoneCall,
  FilePlus2,
  MapPin,
  ClipboardList,
  Wrench,
  UserCheck,
  ChevronDown,
  ShieldCheck,
  HelpCircle,
  Menu,
  X,
  Bot,
  Scale,
  Users,
  Compass,
} from 'lucide-react';
import AiCivicChatbot from '@/components/AiCivicChatbot';

export type UserRole = 'CITIZEN' | 'FIELD_STAFF' | 'MUNICIPAL_ADMIN';

export default function Navbar() {
  const pathname = usePathname();
  const [currentRole, setCurrentRole] = useState<UserRole>('CITIZEN');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authorityDropdownOpen, setAuthorityDropdownOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem('citynova_demo_role') || localStorage.getItem('civiclens_demo_role')) as UserRole | null;
    if (saved) setCurrentRole(saved);

    const onRoleChange = (e: any) => {
      if (e.detail?.role) setCurrentRole(e.detail.role);
    };

    window.addEventListener('citynova_role_changed', onRoleChange);
    window.addEventListener('civiclens_role_changed', onRoleChange);
    return () => {
      window.removeEventListener('citynova_role_changed', onRoleChange);
      window.removeEventListener('civiclens_role_changed', onRoleChange);
    };
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('citynova_demo_role', role);
    localStorage.setItem('civiclens_demo_role', role);
    window.dispatchEvent(new CustomEvent('citynova_role_changed', { detail: { role } }));
    window.dispatchEvent(new CustomEvent('civiclens_role_changed', { detail: { role } }));
    setRoleDropdownOpen(false);
  };

  const openAiChat = () => {
    window.dispatchEvent(new CustomEvent('open_ai_civic_chat'));
  };

  const roleLabels: Record<UserRole, { title: string; subtitle: string; color: string }> = {
    CITIZEN: {
      title: 'Citizen View (नागरिक)',
      subtitle: 'Public Grievance Portal',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    },
    FIELD_STAFF: {
      title: 'Field Worker (कर्मचारी)',
      subtitle: 'Photo Proof of Work',
      color: 'bg-blue-50 text-blue-800 border-blue-300',
    },
    MUNICIPAL_ADMIN: {
      title: 'Chief Officer (प्रशासक)',
      subtitle: 'Zonal SLA Supervisor',
      color: 'bg-purple-50 text-purple-800 border-purple-300',
    },
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white shadow-xs border-b border-slate-200">
        {/* Tricolor Government Hairline Accent */}
        <div className="tricolor-bar w-full" />

        {/* Top Municipal Helpline Bar */}
        <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-8 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Building2 className="w-3.5 h-3.5" />
              <span>CityNova &bull; Municipal Civic Operating System</span>
            </div>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline text-slate-300 text-[11px]">
              Goa Right to Public Services Act 2013 &bull; Time-Bound Delivery
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="tel:1913"
              className="flex items-center gap-1.5 text-slate-200 hover:text-white transition-colors"
            >
              <PhoneCall className="w-3 h-3 text-emerald-400" />
              <span className="hidden sm:inline text-[11px] text-slate-400">24x7 Citizen Helpline:</span>
              <span className="font-bold text-white text-xs">1913 (Toll Free)</span>
            </a>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Government Emblem & Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 border border-slate-700/80 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 via-amber-500/20 to-transparent pointer-events-none" />
              <Building2 className="w-5 h-5 text-amber-400 group-hover:rotate-6 transition-transform" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl text-slate-900 tracking-tight">
                  City<span className="text-orange-600">Nova</span>
                </span>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200 shadow-2xs">
                  Civic OS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Ponda Municipal Council &bull; पोंडा नगरपालिका
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links with Clear Sections: Citizens, Authority, City, AI Agent */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {/* Section 1: Citizens */}
            <Link
              href="/report"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-bold shadow-xs transition-all hover:scale-105"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>+ Report Issue</span>
            </Link>

            <Link
              href="/#citizens-rights"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-800 hover:bg-slate-100 transition-colors"
            >
              <Scale className="w-4 h-4 text-slate-500" />
              <span>Citizens&apos; Rights</span>
            </Link>

            {/* Section 2: City Section Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setCityDropdownOpen(!cityDropdownOpen);
                  setAuthorityDropdownOpen(false);
                }}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                  pathname === '/'
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Compass className="w-4 h-4 text-slate-500" />
                <span>City &amp; Wards</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {cityDropdownOpen && (
                <div
                  onMouseLeave={() => setCityDropdownOpen(false)}
                  className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95"
                >
                  <Link
                    href="/#city-map"
                    onClick={() => setCityDropdownOpen(false)}
                    className="block px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-700"
                  >
                    🗺️ Interactive GIS Ward Map
                  </Link>
                  <Link
                    href="/#ward-directory"
                    onClick={() => setCityDropdownOpen(false)}
                    className="block px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-700"
                  >
                    🏛️ Ward Nodal Officers Directory
                  </Link>
                  <Link
                    href="/#public-ledger"
                    onClick={() => setCityDropdownOpen(false)}
                    className="block px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-700"
                  >
                    📋 Public Promise-to-Proof Ledger
                  </Link>
                </div>
              )}
            </div>

            {/* Section 3: Authority Section Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setAuthorityDropdownOpen(!authorityDropdownOpen);
                  setCityDropdownOpen(false);
                }}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                  pathname.startsWith('/admin') || pathname.startsWith('/field')
                    ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-slate-500" />
                <span>Authority</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {authorityDropdownOpen && (
                <div
                  onMouseLeave={() => setAuthorityDropdownOpen(false)}
                  className="absolute left-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95"
                >
                  <Link
                    href="/admin"
                    onClick={() => setAuthorityDropdownOpen(false)}
                    className="block px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-700"
                  >
                    <div className="font-bold text-slate-900">Chief Officer Command Matrix</div>
                    <span className="text-[10px] text-slate-500">Zonal SLA Surveillance (/admin)</span>
                  </Link>
                  <Link
                    href="/field"
                    onClick={() => setAuthorityDropdownOpen(false)}
                    className="block px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-700 border-t border-slate-100"
                  >
                    <div className="font-bold text-slate-900">Field Worker Operations</div>
                    <span className="text-[10px] text-slate-500">Mobile Work Orders &amp; Photo Proof (/field)</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Section 4: AI Agent for General Enquiry */}
            <button
              type="button"
              onClick={openAiChat}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all hover:scale-105 cursor-pointer shadow-2xs"
            >
              <Bot className="w-4 h-4 text-blue-700" />
              <span>AI Civic Enquiry</span>
            </button>
          </nav>

          {/* Right side: Persona Switcher & Mobile Menu Toggle */}
          <div className="flex items-center gap-2.5">
            {/* Persona Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                  roleLabels[currentRole].color
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <div className="text-left hidden sm:block">
                  <span className="block leading-tight font-bold">
                    {roleLabels[currentRole].title}
                  </span>
                  <span className="text-[9px] opacity-80 leading-tight block">
                    {roleLabels[currentRole].subtitle}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                      Switch User Persona &bull; भूमिका बदला
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Toggle citizen, worker, or municipal officer
                    </span>
                  </div>
                  {(['CITIZEN', 'FIELD_STAFF', 'MUNICIPAL_ADMIN'] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleSelect(role)}
                      className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-slate-50 transition-colors ${
                        currentRole === role ? 'bg-orange-50 font-bold' : ''
                      }`}
                    >
                      <span className="text-slate-900 font-semibold flex items-center justify-between">
                        {roleLabels[role].title}
                        {currentRole === role && (
                          <span className="text-[10px] text-orange-600 font-bold">
                            ACTIVE
                          </span>
                        )}
                      </span>
                      <span className="text-slate-500 text-[10px]">
                        {roleLabels[role].subtitle}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
            <Link
              href="/report"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl text-sm font-bold bg-orange-600 text-white"
            >
              <div className="flex items-center gap-2.5">
                <FilePlus2 className="w-4 h-4" />
                <span>+ Report Civic Issue</span>
              </div>
              <span className="text-xs opacity-80">समस्या नोंदवा</span>
            </Link>

            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-blue-700" />
                <span>City Map &amp; Grievances</span>
              </div>
            </Link>

            <Link
              href="/#citizens-rights"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              <div className="flex items-center gap-2.5">
                <Scale className="w-4 h-4 text-purple-700" />
                <span>Citizens&apos; Legal Rights</span>
              </div>
            </Link>

            <Link
              href="/field"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              <div className="flex items-center gap-2.5">
                <Wrench className="w-4 h-4 text-emerald-700" />
                <span>Field Worker Terminal</span>
              </div>
            </Link>

            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              <div className="flex items-center gap-2.5">
                <ClipboardList className="w-4 h-4 text-indigo-700" />
                <span>Chief Officer Matrix</span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openAiChat();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl text-sm font-bold bg-blue-50 text-blue-800 border border-blue-200"
            >
              <div className="flex items-center gap-2.5">
                <Bot className="w-4 h-4 text-blue-700" />
                <span>AI Civic Enquiry (Chatbot)</span>
              </div>
              <span className="text-xs">24x7</span>
            </button>
          </div>
        )}
      </header>

      {/* Persistent AI Civic Chatbot Widget mounted site-wide */}
      <AiCivicChatbot />
    </>
  );
}
