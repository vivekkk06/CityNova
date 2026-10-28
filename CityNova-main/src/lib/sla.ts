export function calculateSlaDeadline(
  baseDate: Date,
  slaHoursNormal: number,
  slaHoursUrgent: number,
  urgency: string
): Date {
  const isUrgent = urgency === 'HIGH' || urgency === 'CRITICAL';
  const hours = isUrgent ? slaHoursUrgent : slaHoursNormal;
  return new Date(baseDate.getTime() + hours * 3600 * 1000);
}

export function formatSlaTimeRemaining(deadline: Date | string): {
  isOverdue: boolean;
  text: string;
  badgeClass: string;
} {
  const target = new Date(deadline).getTime();
  const now = Date.now();
  const diffMs = target - now;

  if (diffMs <= 0) {
    const overdueHours = Math.abs(Math.floor(diffMs / (3600 * 1000)));
    return {
      isOverdue: true,
      text: `${overdueHours}h overdue SLA`,
      badgeClass: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-semibold',
    };
  }

  const hours = Math.floor(diffMs / (3600 * 1000));
  const minutes = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));

  if (hours < 4) {
    return {
      isOverdue: false,
      text: `${hours}h ${minutes}m left`,
      badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold animate-pulse',
    };
  }

  return {
    isOverdue: false,
    text: `${hours}h remaining`,
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium',
  };
}
