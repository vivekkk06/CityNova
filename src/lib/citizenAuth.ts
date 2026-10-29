'use client';

export interface CitizenProfile {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  ward?: string;
  isLoggedIn: boolean;
}

const PROFILE_STORAGE_KEY = 'citynova_citizen_profile';
const PROFILE_EVENT_NAME = 'citynova_profile_changed';

/**
 * Returns the currently active citizen profile from localStorage.
 * If user is not logged in or no profile exists, returns null.
 */
export function getCitizenProfile(): CitizenProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const profile: CitizenProfile = JSON.parse(raw);
    return profile.isLoggedIn ? profile : null;
  } catch (e) {
    console.error('Failed to parse citizen profile from localStorage', e);
    return null;
  }
}

/**
 * Saves or updates the citizen profile and notifies active components.
 */
export function saveCitizenProfile(profile: CitizenProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    window.dispatchEvent(
      new CustomEvent(PROFILE_EVENT_NAME, { detail: { profile } })
    );
  } catch (e) {
    console.error('Failed to save citizen profile to localStorage', e);
  }
}

/**
 * Logs in a citizen with their profile details.
 */
export function loginCitizen(params: {
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  ward?: string;
}): CitizenProfile {
  const profile: CitizenProfile = {
    id: `CIT-${Date.now().toString(36)}`,
    name: params.name || 'Citizen Resident',
    email: params.email || '',
    phone: params.phone || '',
    city: params.city || '',
    state: params.state || '',
    ward: params.ward || '',
    isLoggedIn: true,
  };
  saveCitizenProfile(profile);
  return profile;
}

/**
 * Updates just the city and state of the current citizen profile.
 */
export function updateCitizenCity(city: string, state?: string): CitizenProfile | null {
  const current = getCitizenProfile();
  if (!current) return null;
  const updated: CitizenProfile = {
    ...current,
    city,
    state: state || current.state || '',
  };
  saveCitizenProfile(updated);
  return updated;
}

/**
 * Logs out the citizen and resets the profile.
 */
export function logoutCitizen(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent(PROFILE_EVENT_NAME, { detail: { profile: null } })
    );
  } catch (e) {
    console.error('Failed to logout citizen', e);
  }
}

/**
 * Adds an event listener for profile updates.
 */
export function onCitizenProfileChange(
  callback: (profile: CitizenProfile | null) => void
): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (event: any) => {
    callback(event.detail?.profile ?? null);
  };
  window.addEventListener(PROFILE_EVENT_NAME, handler);
  return () => window.removeEventListener(PROFILE_EVENT_NAME, handler);
}

