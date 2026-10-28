'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, FilePlus2, MapPin, ChevronDown, Menu, X, Bot, Compass, LogOut } from 'lucide-react';
import AiCivicChatbot from '@/components/AiCivicChatbot';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  const openAiChat = () => {
    window.dispatchEvent(new CustomEvent('open_ai_civic_chat'));
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white shadow-xs border-b border-slate-200">
        <div className="tricolor-bar w-full" />

        <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-8 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Building2 className="w-3.5 h-3.5" />
              <span>CityNova &bull; Citizen Civic Portal</span>
            </div>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline text-slate-300 text-[11px]">
              {user?.city?.name || 'Your city'} &bull; {user?.state || user?.city?.state || ''}
            </span>
          </div>

          <span className="text-[11px] text-slate-400">Signed in as <span className="font-bold text-white">{user?.username || 'citizen'}</span></span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
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
                {user?.city?.name || 'Your city'} &bull; {user?.state || user?.city?.state || ''}
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link
              href="/report"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-bold shadow-xs transition-all hover:scale-105"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>{t('nav_report')}</span>
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                  pathname === '/' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Compass className="w-4 h-4 text-slate-500" />
                <span>City Map</span>
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
                    Interactive GIS &amp; Google Map
                  </Link>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={openAiChat}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all hover:scale-105 cursor-pointer shadow-2xs"
            >
              <Bot className="w-4 h-4 text-blue-700" />
              <span>{t('nav_ai_assistant')}</span>
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <LanguageSelector variant="compact" />
            <button type="button" onClick={() => void logout()} className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50" title="Sign out">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
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

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2.5">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Select Language
              </span>
              <LanguageSelector variant="full" />
            </div>

            <Link
              href="/report"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl text-sm font-bold bg-orange-600 text-white shadow-xs"
            >
              <span className="flex items-center gap-2.5">
                <FilePlus2 className="w-4 h-4" />
                {t('nav_report')}
              </span>
            </Link>

            <Link
              href="/#city-map"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-3 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              <MapPin className="w-4 h-4 text-blue-700" />
              <span>City Map</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openAiChat();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl text-sm font-bold bg-blue-50 text-blue-800 border border-blue-200"
            >
              <span className="flex items-center gap-2.5">
                <Bot className="w-4 h-4 text-blue-700" />
                {t('nav_ai_assistant')}
              </span>
            </button>
            <button type="button" onClick={() => void logout()} className="flex w-full items-center gap-2.5 rounded-xl p-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"><LogOut className="h-4 w-4" /> Sign out</button>
          </div>
        )}
      </header>

      <AiCivicChatbot />
    </>
  );
}
