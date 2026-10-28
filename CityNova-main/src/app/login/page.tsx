'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, ArrowRight, ShieldCheck, UserRound, LockKeyhole } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const { user, refresh } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', aadhaar: '', state: '', city: '', username: '' });

  useEffect(() => {
    if (user) router.replace('/');
  }, [user, router]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: mode === 'register' ? 'register' : 'login', ...form }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not sign in.');
      await refresh();
      const destination = new URLSearchParams(window.location.search).get('returnTo');
      router.replace(destination?.startsWith('/') && !destination.startsWith('//') ? destination : '/');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  };

  const field = (key: keyof typeof form, label: string, type = 'text', autoComplete?: string) => (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        required
        type={type}
        autoComplete={autoComplete}
        value={form[key]}
        onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
        maxLength={key === 'aadhaar' ? 12 : key === 'phone' ? 16 : undefined}
        inputMode={key === 'phone' || key === 'aadhaar' ? 'numeric' : undefined}
        pattern={key === 'aadhaar' ? '[0-9]{12}' : undefined}
        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
      />
    </label>
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-orange-100 via-slate-50 to-blue-100 px-4 py-10 sm:py-16">
      <div className="mx-auto grid min-h-[650px] max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-900/10 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-10 text-white lg:flex">
          <div className="absolute -right-28 -top-24 h-80 w-80 rounded-full bg-orange-500/20 blur-3xl" />
          <Link href="/login" className="relative inline-flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10"><Building2 className="h-6 w-6 text-orange-300" /></span>
            <span className="text-2xl font-black">CityNova</span>
          </Link>
          <div className="relative max-w-sm space-y-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">Civic reporting for every city</p>
            <h1 className="text-4xl font-black leading-tight">Make your city work better.</h1>
            <p className="text-sm leading-6 text-slate-300">Sign in to report local problems, see reports near you, and follow each complaint through its public docket.</p>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
              <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-300" />
              <span>Your reports and map are scoped to the city on your account.</span>
            </div>
          </div>
          <p className="relative text-xs text-slate-500">CityNova Citizen Portal</p>
        </aside>

        <section className="flex items-center justify-center p-5 sm:p-10">
          <div className="w-full max-w-md">
            <Link href="/login" className="mb-8 inline-flex items-center gap-2 text-xl font-black text-slate-900 lg:hidden"><Building2 className="h-6 w-6 text-orange-600" />CityNova</Link>
            <div className="mb-7">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-700">Citizen account</p>
              <h2 className="mt-2 text-3xl font-black text-slate-900">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
              <p className="mt-2 text-sm text-slate-500">{mode === 'login' ? 'Sign in with your unique username and phone number.' : 'Set up your profile to use CityNova in your city.'}</p>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              <button type="button" onClick={() => { setMode('login'); setError(''); }} className={`rounded-lg py-2.5 text-sm font-bold ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}><LockKeyhole className="mr-2 inline h-4 w-4" />Sign in</button>
              <button type="button" onClick={() => { setMode('register'); setError(''); }} className={`rounded-lg py-2.5 text-sm font-bold ${mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}><UserRound className="mr-2 inline h-4 w-4" />Create account</button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {mode === 'register' && <>{field('name', 'Full name', 'text', 'name')}</>}
              {field('username', 'Unique username', 'text', 'username')}
              {field('phone', 'Phone number', 'tel', 'tel')}
              {mode === 'register' && <>
                {field('aadhaar', 'Aadhaar number', 'text', 'off')}
                <p className="-mt-2 text-xs leading-5 text-slate-500">Used to prevent duplicate accounts. CityNova stores a keyed hash and does not verify Aadhaar with UIDAI.</p>
                <div className="grid gap-4 sm:grid-cols-2">{field('state', 'State', 'text', 'address-level1')}{field('city', 'City', 'text', 'address-level2')}</div>
                <p className="-mt-2 text-xs leading-5 text-slate-500">City center lookup uses data from <a className="underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>.</p>
              </>}
              {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-medium text-red-700">{error}</p>}
              <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 disabled:cursor-wait disabled:opacity-60">
                {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-6 text-center text-xs leading-5 text-slate-500">Login currently checks your username and phone number. Add OTP verification before using this for sensitive or official services.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
