import { prisma } from '@/lib/prisma';

export interface CivicScoreTier {
  tier: 'BANNED' | 'ACTIVE' | 'TRUSTED' | 'SENIOR' | 'GUARDIAN';
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  trustLevel: string;
  description: string;
  minScore: number;
}

export const CIVIC_SCORE_TIERS: Record<CivicScoreTier['tier'], CivicScoreTier> = {
  BANNED: {
    tier: 'BANNED',
    label: 'Restricted Account',
    badgeBg: 'bg-red-50',
    badgeText: 'text-red-700',
    badgeBorder: 'border-red-200',
    trustLevel: 'Banned / Untrusted',
    description: 'Account restricted by Municipal Authority from filing reports or comments due to flagged fake or duplicate complaints.',
    minScore: 0,
  },
  ACTIVE: {
    tier: 'ACTIVE',
    label: 'Active Citizen',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-300',
    trustLevel: 'Baseline Trust',
    description: 'New or active citizen starting their civic contributions.',
    minScore: 50,
  },
  TRUSTED: {
    tier: 'TRUSTED',
    label: 'Trusted Reporter',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    trustLevel: 'High Credibility',
    description: 'Proven community reporter with verified civic reports under municipal resolution.',
    minScore: 100,
  },
  SENIOR: {
    tier: 'SENIOR',
    label: 'Senior Contributor',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
    trustLevel: 'Very High Credibility',
    description: 'Active community stakeholder with consistently inspected and resolved issues.',
    minScore: 200,
  },
  GUARDIAN: {
    tier: 'GUARDIAN',
    label: 'Civic Guardian',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-300',
    trustLevel: 'Exemplary Credibility',
    description: 'Exemplary citizen leader with multiple confirmed and resolved civic reports.',
    minScore: 350,
  },
};

export function getCivicScoreTier(score: number, isBanned: boolean = false): CivicScoreTier {
  if (isBanned || score <= 0) {
    return CIVIC_SCORE_TIERS.BANNED;
  }
  if (score >= CIVIC_SCORE_TIERS.GUARDIAN.minScore) {
    return CIVIC_SCORE_TIERS.GUARDIAN;
  }
  if (score >= CIVIC_SCORE_TIERS.SENIOR.minScore) {
    return CIVIC_SCORE_TIERS.SENIOR;
  }
  if (score >= CIVIC_SCORE_TIERS.TRUSTED.minScore) {
    return CIVIC_SCORE_TIERS.TRUSTED;
  }
  return CIVIC_SCORE_TIERS.ACTIVE;
}

/**
 * Calculates a citizen's dynamic civic score based on their reporting contribution history:
 * - Base starting score: 50
 * - True report filed: +10 per report
 * - Progress initiated (IN_PROGRESS, ASSIGNED, PROVISIONALLY_RESOLVED): +15 per report
 * - Issue resolved & signed off (RESOLVED, CLOSED): +35 per report
 * - If banned: strictly 0
 */
export async function calculateCivicScore(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isBanned: true,
      tickets: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  if (!user) return 50;
  if (user.isBanned) return 0;

  let score = 50; // Starting baseline score

  for (const ticket of user.tickets) {
    // 1. True report contribution
    score += 10;

    // 2. Progress started (ASSIGNED, IN_PROGRESS, PROVISIONALLY_RESOLVED)
    const isProgressStarted = ['ASSIGNED', 'IN_PROGRESS', 'PROVISIONALLY_RESOLVED', 'RESOLVED', 'CLOSED'].includes(ticket.status);
    if (isProgressStarted) {
      score += 15;
    }

    // 3. Resolved / Closed
    const isResolved = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';
    if (isResolved) {
      score += 35;
    }
  }

  return score;
}

/**
 * Recalculates and persists the updated score into the database.
 */
export async function syncUserCivicScore(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isBanned: true },
  });

  if (!user) return 50;

  if (user.isBanned) {
    await prisma.user.update({
      where: { id: userId },
      data: { civicScore: 0 },
    });
    return 0;
  }

  const score = await calculateCivicScore(userId);

  await prisma.user.update({
    where: { id: userId },
    data: { civicScore: score },
  });

  return score;
}

