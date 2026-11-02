'use client';

import { useEffect, useState, useMemo, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, UserRound, LockKeyhole, CheckCircle2, AlertCircle, MapPin } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { INDIAN_STATES, normalizeIndianState, isIndianState, getCitiesForState } from '@/data/india-states-cities';

type Mode = 'login' | 'register';
type AccountType = 'citizen' | 'authority';

export default function LoginPage() {
  const router = useRouter();
  const { user, refresh } = useAuth();
  const [accountType, setAccountType] = useState<AccountType>('citizen');
  const [mode, setMode] = useState<Mode>('login');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    aadhaar: '',
    state: '',
    city: '',
    username: '',
    employeeId: '',
    designation: '',
  });

  const [isCustomCity, setIsCustomCity] = useState(false);
  const [customCityText, setCustomCityText] = useState('');

  // Validate state in real time
  const canonicalState = useMemo(() => {
    return normalizeIndianState(form.state);
  }, [form.state]);

  const isValidState = Boolean(canonicalState);

  // Available cities for the verified state
  const stateCities = useMemo(() => {
    if (!canonicalState) return [];
    return getCitiesForState(canonicalState);
  }, [canonicalState]);

  // When state changes, update state and reset city so user can pick from the dropdown
  const handleStateChange = (inputVal: string) => {
    setForm((current) => ({
      ...current,
      state: inputVal,
      city: '',
    }));
    setIsCustomCity(false);
    setCustomCityText('');
  };

  const handleCitySelect = (selected: string) => {
    if (selected === '__custom__') {
      setIsCustomCity(true);
      setForm((current) => ({ ...current, city: customCityText }));
    } else {
      setIsCustomCity(false);
      setForm((current) => ({ ...current, city: selected }));
    }
  };

  useEffect(() => {
    if (user) router.replace('/');
  }, [user, router]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    // Check state validity if provided
    if (form.state && !isValidState) {
      setError(`"${form.state}" is not a recognized Indian State or Union Territory. Please enter a valid Indian State.`);
      setBusy(false);
      return;
    }

    const finalCity = isCustomCity ? customCityText.trim() : form.city.trim();
    if (mode === 'register') {
      if (!form.state.trim() || !isValidState) {
        setError('Please enter a valid State or Union Territory of India.');
        setBusy(false);
        return;
      }
      if (!finalCity) {
        setError('Please select your city from the dropdown list.');
        setBusy(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: mode === 'register' ? 'register' : 'login',
          accountType,
          ...form,
          state: canonicalState || form.state,
          city: finalCity || form.city,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not sign in.');
      await refresh();
      const destination = new URLSearchParams(window.location.search).get('returnTo');
      const nextPath = destination?.startsWith('/') && !destination.startsWith('//') ? destination : '/';
      router.replace(nextPath);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  };

  const field = (key: keyof typeof form, label: string, type = 'text', autoComplete?: string, placeholder?: string) => (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold text-slate-700">{label}</span>
      <input
        required
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={form[key]}
        onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
        maxLength={key === 'aadhaar' ? 12 : key === 'phone' ? 16 : undefined}
        inputMode={key === 'phone' || key === 'aadhaar' ? 'numeric' : undefined}
        pattern={key === 'aadhaar' ? '[0-9]{12}' : undefined}
        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
      />
    </label>
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-orange-100 via-slate-50 to-blue-100 px-4 py-8 sm:py-12">
      <div className="mx-auto grid min-h-[650px] max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-900/10 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-10 text-white lg:flex">
          <div className="absolute -right-28 -top-24 h-80 w-80 rounded-full bg-orange-500/20 blur-3xl" />
          <Link href="/login" className="relative inline-flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 overflow-hidden shadow-lg border border-slate-800">
              <Image src="/citynova-icon.png" alt="CityNova Logo" width={48} height={48} unoptimized className="w-full h-full object-contain" priority />
            </span>
            <span className="text-2xl font-black">CityNova</span>
          </Link>
          <div className="relative max-w-sm space-y-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">Civic Redressal Platform</p>
            <h1 className="text-4xl font-black leading-tight">Make your city work better.</h1>
            <p className="text-sm leading-6 text-slate-300">Sign in to report local problems, see reports near you, and follow each grievance through its public docket.</p>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
              <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" />
              <span>Verified across 28 Indian States &amp; 8 Union Territories with pinpoint municipal scoping.</span>
            </div>
          </div>
          <p className="relative text-xs text-slate-500">CityNova Citizen Portal &copy; 2026</p>
        </aside>

        <section className="flex items-center justify-center p-5 sm:p-10">
          <div className="w-full max-w-md">
            <Link href="/login" className="mb-6 inline-flex items-center gap-2.5 text-xl font-black text-slate-900 lg:hidden">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 overflow-hidden shadow-sm shrink-0 border border-slate-800">
                <Image src="/citynova-icon.png" alt="CityNova Logo" width={36} height={36} unoptimized className="w-full h-full object-contain" />
              </span>
              CityNova
            </Link>

            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-700">Choose account type</p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">{mode === 'login' ? 'Sign in to continue to CityNova in your jurisdiction.' : 'Create an account to report and track issues in your city.'}</p>
            </div>

            <div className="mb-3 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => { setAccountType('citizen'); setError(''); }}
                className={`rounded-lg py-2 text-xs font-bold transition-all ${accountType === 'citizen' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <UserRound className="mr-1.5 inline h-3.5 w-3.5" />Citizen
              </button>
              <button
                type="button"
                onClick={() => { setAccountType('authority'); setError(''); }}
                className={`rounded-lg py-2 text-xs font-bold transition-all ${accountType === 'authority' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <ShieldCheck className="mr-1.5 inline h-3.5 w-3.5" />Authority Employee
              </button>
            </div>

            <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className={`rounded-lg py-2 text-xs font-bold transition-all ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <LockKeyhole className="mr-1.5 inline h-3.5 w-3.5" />Sign in
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                className={`rounded-lg py-2 text-xs font-bold transition-all ${mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <UserRound className="mr-1.5 inline h-3.5 w-3.5" />Create account
              </button>
            </div>

            <form onSubmit={submit} className="space-y-3.5">
              {mode === 'register' && field('name', 'Full Name', 'text', 'name', 'e.g. Ramesh Kumar')}
              {field('username', 'Username', 'text', 'username', 'e.g. ramesh_k')}
              {field('phone', 'Phone Number', 'tel', 'tel', '10-digit Indian Mobile Number')}
              {accountType === 'authority' && (
                <>
                  {field('employeeId', 'Employee ID', 'text', 'off', 'e.g. EMP-UP-1029')}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-700 block">
                      Authority Designation {mode === 'register' && <span className="text-red-500">*</span>}
                    </span>
                    <select
                      value={form.designation}
                      onChange={(e) => setForm((c) => ({ ...c, designation: e.target.value }))}
                      required={mode === 'register'}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    >
                      <option value="">-- Choose Designation --</option>
                      <option value="District Magistrate (DM)">District Magistrate (DM)</option>
                      <option value="Sub-divisional Magistrate (SDM)">Sub-divisional Magistrate (SDM)</option>
                      <option value="Mayor">Mayor</option>
                      <option value="Commissioner of Police (CP)">Commissioner of Police (CP)</option>
                    </select>
                  </div>
                </>
              )}

              {mode === 'register' && accountType === 'citizen' && (
                <>
                  {field('aadhaar', 'Aadhaar Number (12 Digits)', 'text', 'off', '12-digit UIDAI number')}
                  <p className="-mt-2 text-[11px] leading-4 text-slate-500">Aadhaar is hashed locally for duplicate prevention; never stored in plaintext.</p>
                </>
              )}

              {/* STATE & CITY SECTION */}
              <div className="pt-1">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* State Input with Datalist of Indian States & Verification */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700 block">
                          State of India {mode === 'register' && <span className="text-red-500">*</span>}
                        </label>
                        {isValidState ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verified State
                          </span>
                        ) : form.state.trim() ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            Invalid State
                          </span>
                        ) : null}
                      </div>

                      <input
                        type="text"
                        list="indian-states-datalist"
                        value={form.state}
                        onChange={(e) => handleStateChange(e.target.value)}
                        placeholder="Enter any Indian state..."
                        required={mode === 'register'}
                        className={`w-full rounded-xl border px-3 py-2 text-xs text-slate-900 bg-white outline-none transition focus:ring-2 ${
                          isValidState
                            ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-100'
                            : form.state.trim()
                            ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-100'
                            : 'border-slate-300 focus:border-orange-500 focus:ring-orange-100'
                        }`}
                      />
                      <datalist id="indian-states-datalist">
                        {INDIAN_STATES.map((state) => (
                          <option key={state} value={state} />
                        ))}
                      </datalist>
                    </div>

                    {/* City Dropdown: Populates automatically once state is entered/verified */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">
                        City / District {mode === 'register' && <span className="text-red-500">*</span>}
                      </label>

                      {isValidState ? (
                        <select
                          value={isCustomCity ? '__custom__' : form.city}
                          onChange={(e) => handleCitySelect(e.target.value)}
                          required={mode === 'register'}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        >
                          <option value="">-- Choose City ({stateCities.length}) --</option>
                          {stateCities.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                          <option value="__custom__">➕ Other city in {canonicalState}...</option>
                        </select>
                      ) : (
                        <select
                          disabled
                          className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs text-slate-400 outline-none cursor-not-allowed"
                        >
                          <option>
                            {form.state.trim() ? 'Enter a valid Indian State first...' : 'Enter state first...'}
                          </option>
                        </select>
                      )}
                    </div>
                  </div>

                  {/* If user picked "Other city in state", show custom text input */}
                  {isCustomCity && isValidState && (
                    <div className="pt-1 space-y-1">
                      <label className="text-[11px] font-bold text-orange-800 block">
                        Enter town / tehsil in {canonicalState}:
                      </label>
                      <input
                        type="text"
                        required
                        value={customCityText}
                        onChange={(e) => {
                          setCustomCityText(e.target.value);
                          setForm((current) => ({ ...current, city: e.target.value }));
                        }}
                        placeholder={`e.g. Specific Nagar Panchayat in ${canonicalState}`}
                        className="w-full rounded-xl border border-orange-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                  )}

                  {!isValidState && form.state.trim() && (
                    <p className="text-[11px] text-amber-700 font-medium">
                      ⚠️ Please enter an official Indian State or UT (e.g. Uttar Pradesh, Maharashtra, Delhi, Goa).
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700">
                  {error}
                </p>
              )}

              <button
                disabled={busy}
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 disabled:cursor-wait disabled:opacity-60 cursor-pointer"
              >
                {busy ? 'Please wait…' : mode === 'login' ? 'Sign in to CityNova' : 'Create CityNova Account'} <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-5 text-center text-[11px] leading-4 text-slate-400">
              Citizen sign-in verifies your username and phone for your city jurisdiction.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
