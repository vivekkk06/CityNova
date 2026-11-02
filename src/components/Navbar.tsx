'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, Menu, X, HelpCircle, LogOut, MessageSquare, User } from 'lucide-react';
import AiCivicChatbot from '@/components/AiCivicChatbot';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user, logout, loading: authLoading } = useAuth();
  const isAuthority = user?.role === 'AUTHORITY';
  const showReportAction = !isAuthority && !authLoading;
  const showGeneralActions = !authLoading;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openAiChat = () => {
    window.dispatchEvent(new CustomEvent('open_ai_civic_chat'));
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200">
        <div className="tricolor-bar w-full" />

        <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-8 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-white font-bold">
              <Image src="/citynova-icon.png" alt="CityNova" width={16} height={16} unoptimized className="w-4 h-4 rounded-full object-cover inline-block" />
              <span>CityNova &bull; {isAuthority ? 'Authority Employee Portal' : 'Citizen Civic Portal'}</span>
            </div>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline text-slate-300 text-[11px]">
              {user?.city?.name || 'Your city'} &bull; {user?.state || user?.city?.state || ''}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Link href="/profile" className="hover:text-emerald-300 transition-colors flex items-center gap-1 group" title="View your profile">
              <span>Signed in as <span className="font-bold text-white group-hover:underline underline-offset-2">{user?.username || 'citizen'}</span></span>
            </Link>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-amber-300 border border-slate-700">
              {isAuthority ? 'Authority' : 'Citizen'}
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0 overflow-hidden">
              <Image
                src="/citynova-icon.png"
                alt="CityNova"
                width={40}
                height={40}
                unoptimized
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl text-slate-900 tracking-tight">
                  City<span className="text-teal-600">Nova</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {user?.city?.name || 'Your city'} &bull; {user?.state || user?.city?.state || ''}
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs border hover:scale-105 ${
                pathname === '/' || pathname === '/home'
                  ? 'bg-slate-900 text-white border-slate-700/80 ring-1 ring-amber-400/30'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-white border-slate-700/60'
              }`}
            >
              <Home className="w-4 h-4 text-amber-400" />
              <span>Home</span>
            </Link>

            <Link
              href="/posts"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs border hover:scale-105 ${
                pathname === '/posts'
                  ? 'bg-slate-900 text-white border-slate-700/80 ring-1 ring-sky-400/30'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-white border-slate-700/60'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <span>Posts</span>
            </Link>

            {showGeneralActions && (
              <button
                type="button"
                onClick={openAiChat}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900/90 hover:bg-slate-800 text-white shadow-xs border border-slate-700/60 transition-all hover:scale-105 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-purple-400" />
                <span>Enquiry</span>
              </button>
            )}

            <Link
              href="/profile"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs border hover:scale-105 ${
                pathname === '/profile'
                  ? 'bg-slate-900 text-white border-slate-700/80 ring-1 ring-emerald-400/30'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-white border-slate-700/60'
              }`}
            >
              <User className="w-4 h-4 text-emerald-400" />
              <span>Profile</span>
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {showGeneralActions && <LanguageSelector variant="compact" />}
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
            {showGeneralActions && <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Select Language
              </span>
              <LanguageSelector variant="full" />
            </div>}

            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl text-sm font-bold bg-slate-900 text-white shadow-xs border border-slate-700/60"
            >
              <span className="flex items-center gap-2.5">
                <Home className="w-4 h-4 text-amber-400" />
                Home
              </span>
            </Link>

            <Link
              href="/posts"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl text-sm font-bold bg-slate-900 text-white shadow-xs border border-slate-700/60"
            >
              <span className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-sky-400" />
                Posts
              </span>
            </Link>

            {showGeneralActions && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAiChat();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl text-sm font-bold bg-slate-900 text-white shadow-xs border border-slate-700/60 cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                  Enquiry
                </span>
              </button>
            )}

            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl text-sm font-bold bg-slate-900 text-white shadow-xs border border-slate-700/60"
            >
              <span className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-emerald-400" />
                Profile
              </span>
            </Link>
            <button type="button" onClick={() => void logout()} className="flex w-full items-center gap-2.5 rounded-xl p-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"><LogOut className="h-4 w-4" /> Sign out</button>
          </div>
        )}
      </header>

      {showGeneralActions && <AiCivicChatbot />}
    </>
  );
}
