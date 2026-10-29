/**
 * Privacy Filter & Data Minimization Utilities
 * Automatically masks citizen personal identifiable information (PII)
 * on public complaint maps and dockets.
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

export function sanitizeTicketForPublic<T extends { citizenName: string; citizenPhone: string }>(ticket: T) {
  const { reporterId: _reporterId, ...publicTicket } = ticket as T & Record<string, unknown>;
  void _reporterId;
  return {
    ...publicTicket,
    addressDescription: typeof publicTicket.addressDescription === 'string'
      ? publicTicket.addressDescription.replace(/\s*\(Ward\s+\d+\)/gi, '')
      : publicTicket.addressDescription,
    plainLanguageRights: 'Status updates are provided by the CityNova reporting workflow.',
    citizenName: maskCitizenName(ticket.citizenName),
    citizenPhone: maskPhoneNumber(ticket.citizenPhone),
  };
}
