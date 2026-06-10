import { cookies } from 'next/headers';

export const PILOT_COOKIE_NAME = 'doorin5_pilot_access';

export async function isPilotSessionValid() {
  const cookieStore = await cookies();
  const value = cookieStore.get(PILOT_COOKIE_NAME)?.value;
  if (!value) return false;

  return value === 'fc' || value === 'driver' || value === 'pilot';
}

export async function getPilotRole() {
  const cookieStore = await cookies();
  const value = cookieStore.get(PILOT_COOKIE_NAME)?.value;
  return value === 'fc' || value === 'driver' || value === 'pilot' ? value : 'guest';
}
