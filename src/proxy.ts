import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const hasSessionCookie = Boolean(request.cookies.get('citynova_session')?.value);
  const isAuthEndpoint = request.nextUrl.pathname.startsWith('/api/auth');
  if (isAuthEndpoint || hasSessionCookie) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });
  }

  const loginUrl = new URL('/login', request.url);
  if (request.nextUrl.pathname !== '/') loginUrl.searchParams.set('returnTo', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!login|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
