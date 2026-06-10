import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const code = String(body.code ?? '').trim();
  const fcCode = process.env.FC_ACCESS_CODE ?? '';
  const driverCode = process.env.DRIVER_ACCESS_CODE ?? '';

  if (!code || (code !== fcCode && code !== driverCode)) {
    return Response.json({ ok: false, error: 'Invalid pilot access code.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, role: code === fcCode ? 'fc' : 'driver' });
  response.cookies.set('doorin5_pilot_access', code === fcCode ? 'fc' : 'driver', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  return response;
}
