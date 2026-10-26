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
} from 'lucide-react';

export type UserRole = 'CITIZEN' | 'FIELD_STAFF' | 'MUNICIPAL_ADMIN';

export default function Navbar() {
  const pathname = usePathname();
  const [currentRole, setCurrentRole] = useState<UserRole>('CITIZEN');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('civiclens_demo_role') as UserRole | null;
    if (saved) setCurrentRole(saved);
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('civiclens_demo_role', role);
    window.dispatchEvent(new CustomEvent('civiclens_role_changed', { detail: { role } }));
    setRoleDropdownOpen(false);
  };

  const navLinks = [
    { href: '/', label: 'Map & Live Grievances', labelHi: 'मानचित्र व शिकायतें', icon: MapPin },
    { href: '/report', label: '+ Report Issue', labelHi: 'समस्या दर्ज करें', icon: FilePlus2, highlight: true },
    { href: '/field', label: 'Field Staff (Worker)', labelHi: 'कर्मचारी', icon: Wrench },
    { href: '/admin', label: 'Admin Command', labelHi: 'प्रशासन', icon: ClipboardList },
  ];

  const roleLabels: Record<UserRole, { title: string; subtitle: string; color: string }> = {
    CITIZEN: {
      title: 'Citizen View (नागरिक)',
      subtitle: 'Public Transparency',
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
    <header className="sticky top-0 z-50 w-full bg-white shadow-xs border-b border-slate-200">
      {/* Tricolor Government Hairline Accent */}
      <div className="tricolor-bar w-full" />

      {/* Top Municipal Helpline Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-8 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-orange-400 font-bold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Muncihelp &bull; Municipal Corporation</span>
          </div>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-300 text-[11px]">
            Public Services Act &bull; Time-Bound Delivery Portal
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
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform shrink-0">
            <Building2 className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">
                Munci<span className="text-orange-600">help</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                Official Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Municipal Civic Action & Citizen Grievances
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            if (link.highlight) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-105"
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-800 border border-blue-200 shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 text-slate-500" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side: Persona Switcher & Mobile Menu Toggle */}
        <div className="flex items-center gap-2.5">
          {/* Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
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
                    Switch User Persona &bull; उपयोगकर्ता बदलें
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Test citizen report, worker proof, or admin view
                  </span>
                </div>
                {(['CITIZEN', 'FIELD_STAFF', 'MUNICIPAL_ADMIN'] as UserRole[]).map((role) => (
                  <button
                    key={role}
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
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between p-3 rounded-lg text-sm font-semibold ${
                  link.highlight
                    ? 'bg-orange-600 text-white'
                    : isActive
                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
                <span className="text-xs opacity-75">{link.labelHi}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
