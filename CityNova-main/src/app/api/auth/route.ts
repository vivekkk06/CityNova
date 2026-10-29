import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { hashCredential, normalizePhone, normalizeUsername, createLoginSession, getAuthSession, publicUser, setSessionCookie, clearSessionCookie, SESSION_COOKIE } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

let geocodeQueue = Promise.resolve();
let nextGeocodeRequestAt = 0;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILURES_PER_USERNAME = 8;
const LOGIN_MAX_FAILURES_PER_ADDRESS = 30;
const loginFailures = new Map<string, { count: number; resetAt: number }>();

const jsonError = (error: string, status: number) => NextResponse.json({ error }, { status });

function loginRateLimitKeys(request: NextRequest, username: string) {
  const forwardedAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const address = forwardedAddress || request.headers.get('x-real-ip') || 'unknown';
  const addressKey = createHash('sha256').update(address).digest('hex');
  return [`username:${username}`, `address:${addressKey}`];
}

function isLoginRateLimited(keys: string[]) {
  const now = Date.now();
  for (const [key, bucket] of loginFailures) {
    if (bucket.resetAt <= now) loginFailures.delete(key);
  }
  return keys.some((key) => {
    const bucket = loginFailures.get(key);
    if (!bucket || bucket.resetAt <= now) return false;
    const limit = key.startsWith('address:') ? LOGIN_MAX_FAILURES_PER_ADDRESS : LOGIN_MAX_FAILURES_PER_USERNAME;
    return bucket.count >= limit;
  });
}

function recordLoginFailure(keys: string[]) {
  const now = Date.now();
  for (const key of keys) {
    const current = loginFailures.get(key);
    if (!current || current.resetAt <= now) loginFailures.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    else current.count += 1;
  }
  if (loginFailures.size > 20000) {
    const firstKey = loginFailures.keys().next().value;
    if (firstKey) loginFailures.delete(firstKey);
  }
}

async function getOrCreateCity(name: string, state: string) {
  const normalizedKey = `${name.trim().toLocaleLowerCase('en')},${state.trim().toLocaleLowerCase('en')},india`;
  const existing = await prisma.city.findUnique({ where: { normalizedKey } });
  if (existing) return existing;

  const query = new URLSearchParams({ city: name, state, country: 'India', format: 'jsonv2', limit: '1' });
  const requestGeocode = async () => {
    const waitMs = Math.max(0, nextGeocodeRequestAt - Date.now());
    if (waitMs) await new Promise((resolve) => setTimeout(resolve, waitMs));
    nextGeocodeRequestAt = Date.now() + 1100;
    return fetch(`https://nominatim.openstreetmap.org/search?${query}`, {
      headers: { 'User-Agent': 'CityNovaCivic/1.0 (city center lookup for account setup)' },
      signal: AbortSignal.timeout(12000),
      cache: 'no-store',
    });
  };
  const geocodedPromise = geocodeQueue.then(requestGeocode, requestGeocode);
  geocodeQueue = geocodedPromise.then(() => undefined, () => undefined);
  const geocoded = await geocodedPromise;
  if (!geocoded.ok) throw new Error('CITY_LOOKUP_UNAVAILABLE');
  const results = await geocoded.json();
  const match = Array.isArray(results) ? results[0] : null;
  if (!match || !Number.isFinite(Number(match.lat)) || !Number.isFinite(Number(match.lon))) throw new Error('CITY_NOT_FOUND');

  return prisma.city.upsert({
    where: { normalizedKey },
    update: {},
    create: {
      name: name.trim(),
      state: state.trim(),
      normalizedKey,
      centerLat: Number(match.lat),
      centerLng: Number(match.lon),
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession(request);
    return NextResponse.json({ user: session ? publicUser(session.user) : null });
  } catch {
    return jsonError('Could not load the signed-in account.', 500);
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonError('Enter valid account details.', 400);
  }

  const action = body.action;
  const username = typeof body.username === 'string' ? normalizeUsername(body.username) : '';
  const phone = typeof body.phone === 'string' ? normalizePhone(body.phone) : null;
  if (!/^[a-z0-9_]{3,24}$/.test(username)) return jsonError('Username must be 3-24 characters using letters, numbers, or underscores.', 400);
  if (!phone) return jsonError('Enter a valid 10-digit Indian mobile number.', 400);

  const rateLimitKeys = action === 'login' ? loginRateLimitKeys(request, username) : [];
  if (rateLimitKeys.length && isLoginRateLimited(rateLimitKeys)) {
    return NextResponse.json(
      { error: 'Too many sign-in attempts. Wait 15 minutes before trying again.' },
      { status: 429, headers: { 'Retry-After': '900' } }
    );
  }

  try {
    let user;
    if (action === 'register') {
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      const state = typeof body.state === 'string' ? body.state.trim() : '';
      const cityName = typeof body.city === 'string' ? body.city.trim() : '';
      const aadhaar = typeof body.aadhaar === 'string' ? body.aadhaar.replace(/\D/g, '') : '';
      if (name.length < 2 || name.length > 100) return jsonError('Enter your full name.', 400);
      if (state.length < 2 || state.length > 80 || cityName.length < 2 || cityName.length > 100) return jsonError('Enter a valid state and city.', 400);
      if (!/^\d{12}$/.test(aadhaar)) return jsonError('Aadhaar number must contain 12 digits.', 400);
      if (!['CITIZEN', undefined].includes(body.role as string | undefined)) return jsonError('Account registration is only available for citizens.', 400);

      const [existingUsername, existingAadhaar] = await Promise.all([
        prisma.user.findUnique({ where: { username } }),
        prisma.user.findUnique({ where: { aadhaarHash: hashCredential(`aadhaar:${aadhaar}`) } }),
      ]);
      if (existingUsername) return jsonError('That username is already in use.', 409);
      if (existingAadhaar) return jsonError('An account already exists for this Aadhaar number.', 409);

      let city;
      try {
        city = await getOrCreateCity(cityName, state);
      } catch (error) {
        if (error instanceof Error && error.message === 'CITY_NOT_FOUND') return jsonError('We could not find that city in the selected state. Check the spelling and try again.', 422);
        return jsonError('City lookup is temporarily unavailable. Please try again shortly.', 503);
      }

      user = await prisma.user.create({
        data: {
          name,
          phone,
          username,
          phoneHash: hashCredential(`phone:${phone}`),
          aadhaarHash: hashCredential(`aadhaar:${aadhaar}`),
          state: state,
          cityId: city.id,
          role: 'CITIZEN',
        },
        include: { city: true },
      });
    } else if (action === 'login') {
      user = await prisma.user.findFirst({
        where: { username, phoneHash: hashCredential(`phone:${phone}`), role: 'CITIZEN' },
        include: { city: true },
      });
      if (!user || !user.city) {
        recordLoginFailure(rateLimitKeys);
        return jsonError('Username or phone number did not match an account.', 401);
      }
      for (const key of rateLimitKeys) loginFailures.delete(key);
    } else {
      return jsonError('Choose sign in or create account.', 400);
    }

    const loginSession = await createLoginSession(user.id);
    const response = NextResponse.json({ success: true, user: publicUser(user) });
    setSessionCookie(response, loginSession.token, loginSession.expiresAt);
    return response;
  } catch (error) {
    console.error('Account request failed:', error);
    if (error instanceof Error && error.message.includes('CITYNOVA_AUTH_SECRET')) return jsonError('Account security is not configured. Set CITYNOVA_AUTH_SECRET on the server.', 503);
    return jsonError('Could not complete the account request. Please try again.', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (token) await prisma.session.deleteMany({ where: { tokenHash: hashCredential(token) } });
    return clearSessionCookie(NextResponse.json({ success: true }));
  } catch {
    return clearSessionCookie(NextResponse.json({ success: true }));
  }
}
