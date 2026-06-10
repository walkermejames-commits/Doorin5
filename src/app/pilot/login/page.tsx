'use client';

import { KeyRound } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { useMemo, useState } from 'react';
import { DemoModePill } from '../../../components/DemoModePill';

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

    setOk('Access granted. Redirecting...');
    window.location.assign(next || '/fc');
  }

  return (
    <main className="min-h-screen text-gray-950">
      <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
        <section className="surface-card rounded-lg p-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-green-700">Pilot access</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight">Enter the pilot passcode</h1>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Use the FC or driver demo code to enter the pilot dashboards.
              </p>
            </div>
            <DemoModePill label="Access check" />
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-bold text-gray-700">Access code</span>
              <input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                type="password"
                className="input mt-2"
                placeholder="fc-demo or driver-demo"
              />
            </label>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-700 px-5 py-3 text-sm font-black text-white hover:bg-green-800"
            >
              <KeyRound size={17} />
              Enter pilot
            </button>
          </form>

          {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
          {ok && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm font-bold text-green-800">{ok}</p>}

          <div className="mt-6 grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm sm:grid-cols-2">
            <div>
              <p className="font-black text-gray-900">FC demo</p>
              <code className="mt-1 block font-mono font-bold text-gray-700">fc-demo</code>
            </div>
            <div>
              <p className="font-black text-gray-900">Driver demo</p>
              <code className="mt-1 block font-mono font-bold text-gray-700">driver-demo</code>
            </div>
          </div>

          <Link href="/" className="mt-6 inline-flex text-sm font-bold text-gray-700 hover:text-gray-950">
            Return to home
          </Link>
        </section>
      </div>
    </main>
  );
}
