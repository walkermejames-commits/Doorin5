'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

export default function PilotLoginPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const next = useMemo(() => {
    if (typeof window === 'undefined') return '/fc';
    return new URLSearchParams(window.location.search).get('next') ?? '/fc';
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setOk('');

    const response = await fetch('/api/pilot/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? 'Invalid code.');
      return;
    }

    setOk('Access granted. Redirecting…');
    window.location.assign(next || '/fc');
  }

  return (
    <main className="min-h-screen bg-[#f6f7f2] p-6 text-gray-950">
      <div className="mx-auto flex max-w-xl flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">Pilot access</p>
          <h1 className="mt-2 text-3xl font-black">Enter the pilot passcode</h1>
          <p className="mt-2 text-gray-600">Use the FC or driver access code to enter the pilot dashboards.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-bold text-gray-700">Access code</label>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            type="password"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm"
            placeholder="Enter passcode"
          />
          <button type="submit" className="w-full rounded-lg bg-green-700 px-5 py-3 text-sm font-black text-white">Enter pilot</button>
        </form>

        {error && <p className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
        {ok && <p className="rounded-lg bg-green-50 p-3 text-sm font-bold text-green-800">{ok}</p>}

        <Link href="/" className="text-sm font-bold text-gray-700 hover:text-gray-950">Return to home</Link>
      </div>
    </main>
  );
}
