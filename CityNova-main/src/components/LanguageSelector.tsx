'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage, LANGUAGES } from '@/lib/i18n';

interface LanguageSelectorProps {
  variant?: 'compact' | 'full';
}

export default function LanguageSelector({ variant = 'compact' }: LanguageSelectorProps) {
  const { language, setLanguage, currentLanguageInfo } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all shadow-2xs hover:border-slate-400 cursor-pointer"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-base leading-none">{currentLanguageInfo.flag}</span>
        <span className="font-bold">
          {variant === 'compact' ? currentLanguageInfo.nativeLabel : currentLanguageInfo.label}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400 transition-transform duration-200" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95">
          <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Select Language &bull; भाषा निवडा
          </div>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-colors cursor-pointer text-left ${
                language === lang.code
                  ? 'bg-blue-50 text-blue-900 font-bold'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{lang.flag}</span>
                <div>
                  <span className="block font-bold">{lang.nativeLabel}</span>
                  <span className="block text-[10px] text-slate-500">{lang.label}</span>
                </div>
              </div>
              {language === lang.code && <Check className="w-4 h-4 text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
