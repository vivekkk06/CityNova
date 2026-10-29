'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export interface SignedInUser {
  id: string;
  name: string;
  username: string | null;
  phone: string | null;
  state: string | null;
  city: { id: string; name: string; state: string; centerLat: number; centerLng: number } | null;
}

interface AuthContextValue {
  user: SignedInUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SignedInUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/auth');
      const data = await response.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const logout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    try { sessionStorage.removeItem('citynova-copilot-conversation'); } catch {}
    setUser(null);
    window.location.assign('/login');
  };

  return <AuthContext.Provider value={{ user, loading, refresh, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
