/**
 * Privacy Filter & Data Minimization Utilities
 * Automatically masks citizen personal identifiable information (PII)
 * on public transparency dashboards and ledger views.
 */

export function maskCitizenName(name: string | null | undefined): string {
  if (!name || name.trim() === '') return 'Anonymous Resident';
  
  const parts = name.trim().split(/\s+/);
  return parts
    .map((part) => {
      if (part.length <= 1) return part;
      if (part.length === 2) return `${part[0]}*`;
      return `${part[0]}${'*'.repeat(part.length - 2)}${part[part.length - 1]}`;
    })
    .join(' ');
}

export function maskPhoneNumber(phone: string | null | undefined): string {
  if (!phone || phone.trim() === '') return 'Not Provided';
  
  const clean = phone.trim();
  // Example: +91-98220-44556 -> +91-98****556
  if (clean.length < 6) return '****';
  
  const visiblePrefix = clean.slice(0, clean.startsWith('+') ? 6 : 3);
  const visibleSuffix = clean.slice(-3);
  return `${visiblePrefix}****${visibleSuffix}`;
}

export function sanitizeTicketForPublic<T extends { citizenName: string; citizenPhone: string }>(ticket: T): T {
  return {
    ...ticket,
    citizenName: maskCitizenName(ticket.citizenName),
    citizenPhone: maskPhoneNumber(ticket.citizenPhone),
  };
}
