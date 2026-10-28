import { createHmac, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const SESSION_COOKIE = 'citynova_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function secret() {
  const value = process.env.CITYNOVA_AUTH_SECRET;
  if (!value || value.length < 32) throw new Error('CITYNOVA_AUTH_SECRET must be set to a random value of at least 32 characters.');
  return value;
}

export function hashCredential(value: string) {
  return createHmac('sha256', secret()).update(value).digest('hex');
}

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '');
  const local = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  return /^[6-9]\d{9}$/.test(local) ? `+91${local}` : null;
}

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export async function getAuthSession(request?: NextRequest) {
  const token = request?.cookies.get(SESSION_COOKIE)?.value ?? (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  let tokenHash: string;
  try {
    tokenHash = hashCredential(token);
  } catch {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: { include: { city: true } } },
  });
  if (!session) return null;
  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }
  return session;
}

export async function createLoginSession(userId: string) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({ data: { tokenHash: hashCredential(token), userId, expiresAt } });
  return { token, expiresAt };
}

export function setSessionCookie(response: Response, token: string, expiresAt: Date) {
  const secure = process.env.NODE_ENV === 'production';
  const value = `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}${secure ? '; Secure' : ''}`;
  response.headers.append('Set-Cookie', value);
  return response;
}

export function clearSessionCookie(response: Response) {
  response.headers.append('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
  return response;
}

export function publicUser(user: NonNullable<Awaited<ReturnType<typeof getAuthSession>>>['user']) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    phone: user.phone,
    state: user.state,
    city: user.city ? {
      id: user.city.id,
      name: user.city.name,
      state: user.city.state,
      centerLat: user.city.centerLat,
      centerLng: user.city.centerLng,
    } : null,
  };
}
