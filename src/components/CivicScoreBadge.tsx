'use client';

import React from 'react';
import { ShieldCheck, ShieldAlert, Award, Star } from 'lucide-react';
import { getCivicScoreTier } from '@/lib/civic-score';

interface CivicScoreBadgeProps {
  score: number;
  isBanned?: boolean;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function CivicScoreBadge({
  score,
  isBanned = false,
  showDetails = false,
  size = 'sm',
  className = '',
}: CivicScoreBadgeProps) {
  const tier = getCivicScoreTier(score, isBanned);

  if (tier.tier === 'BANNED') {
    return (
      <span
        title={tier.description}
        className={`inline-flex items-center gap-1.5 rounded-full font-extrabold uppercase tracking-wide border border-red-300 bg-red-50 text-red-700 ${
          size === 'lg'
            ? 'px-4 py-1.5 text-xs sm:text-sm'
            : size === 'md'
            ? 'px-2.5 py-1 text-[11px]'
            : 'px-2 py-0.5 text-[10px]'
        } ${className}`}
      >
        <ShieldAlert className={size === 'lg' ? 'w-4 h-4 text-red-600' : 'w-3 h-3 text-red-600'} />
        <span>Restricted (0 Pts)</span>
        {showDetails && <span className="opacity-75 font-normal">&bull; Banned</span>}
      </span>
    );
  }

  const icon = tier.tier === 'GUARDIAN' ? (
    <Award className={size === 'lg' ? 'w-4 h-4 text-emerald-600' : 'w-3 h-3 text-emerald-600'} />
  ) : tier.tier === 'SENIOR' || tier.tier === 'TRUSTED' ? (
    <ShieldCheck className={size === 'lg' ? 'w-4 h-4 text-blue-600' : 'w-3 h-3 text-blue-600'} />
  ) : (
    <Star className={size === 'lg' ? 'w-4 h-4 text-slate-500' : 'w-3 h-3 text-slate-500'} />
  );

  return (
    <span
      title={`Civic Score: ${score} (${tier.label} - ${tier.trustLevel})`}
      className={`inline-flex items-center gap-1.5 rounded-full font-extrabold border ${tier.badgeBorder} ${tier.badgeBg} ${tier.badgeText} ${
        size === 'lg'
          ? 'px-4 py-1.5 text-xs sm:text-sm'
          : size === 'md'
          ? 'px-2.5 py-1 text-[11px]'
          : 'px-2 py-0.5 text-[10px]'
      } ${className}`}
    >
      {icon}
      <span>{score} pts</span>
      <span className="opacity-75 font-semibold">&bull; {tier.label}</span>
      {showDetails && <span className="opacity-75 font-normal">&bull; {tier.trustLevel}</span>}
    </span>
  );
}

