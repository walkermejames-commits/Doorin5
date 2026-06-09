import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = [
  '/fc',
  '/driver',
  '/api/dispatch',
  '/api/operations/summary',
  '/api/driver/jobs',
  '/api/driver/progress',
  '/api/driver/complete',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasCodes = Boolean(process.env.FC_ACCESS_CODE && process.env.DRIVER_ACCESS_CODE);

  if (!hasCodes) {
    return NextResponse.next();
  }

  const isProtected = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  if (!isProtected) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get('doorin5_pilot_access')?.value;
  if (cookie === 'fc' || cookie === 'driver') {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ ok: false, error: 'Pilot access required.' }, { status: 401 });
  }

  const loginUrl = new URL('/pilot/login', request.url);
  loginUrl.searchParams.set('next', pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/fc/:path*', '/driver/:path*', '/api/dispatch', '/api/operations/summary', '/api/driver/jobs', '/api/driver/progress', '/api/driver/complete'],
};
