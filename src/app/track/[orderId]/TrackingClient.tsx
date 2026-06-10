'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Loader2, PackageCheck } from 'lucide-react';

type TimelineStep = {
  status: string;
  label: string;
  done: boolean;
  active: boolean;
};

type TrackingSummary = {
  id: string;
  customerName: string;
  postcode: string;
  status: string;
  paymentStatus?: string;
  statusLabel: string;
  ageCheckRequired: boolean;
  timeline: TimelineStep[];
};

export function TrackingClient({ orderId }: { orderId: string }) {
  const [summary, setSummary] = useState<TrackingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    async function loadTracking() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/orders/${orderId}`, { cache: 'no-store' });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? 'Tracking could not be loaded.');
        const nextSummary = payload.data?.data ?? payload.data ?? payload;
        if (!Array.isArray(nextSummary.timeline)) throw new Error('Tracking response did not include a timeline.');
        if (alive) setSummary(nextSummary);
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : 'Tracking could not be loaded.');
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadTracking();
    const refresh = window.setInterval(loadTracking, 10000);
    return () => {
      alive = false;
      window.clearInterval(refresh);
    };
  }, [orderId]);

  return (
    <main className="min-h-screen bg-[#f6f7f2] text-gray-950">
      <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-950">
          <ArrowLeft size={16} />
          Back to Doorin5
        </Link>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          {loading && !summary ? (
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 text-sm font-bold text-gray-700">
              <Loader2 className="animate-spin" size={18} />
              Loading tracking
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>
          ) : summary ? (
            <>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-green-700">Tracking</p>
                  <h1 className="mt-2 text-3xl font-black">{summary.id}</h1>
                  <p className="mt-2 text-gray-600">
                    {summary.customerName} · {summary.postcode}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="w-fit rounded-full bg-gray-950 px-4 py-2 text-sm font-bold text-white">{summary.statusLabel}</span>
                  <span className="w-fit rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-800">Payment: {summary.paymentStatus ?? 'unpaid'}</span>
                </div>
              </div>

              <div className="mt-7 space-y-3">
                {summary.timeline.map((step) => (
                  <div
                    key={step.status}
                    className={`flex items-center gap-3 rounded-lg border p-4 ${
                      step.active
                        ? 'border-green-700 bg-green-50'
                        : step.done
                          ? 'border-gray-200 bg-white'
                          : 'border-gray-200 bg-gray-50 text-gray-500'
                    }`}
                  >
                    <span
                      className={`flex size-9 items-center justify-center rounded-full ${
                        step.done ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {step.done ? <CheckCircle2 size={18} /> : <PackageCheck size={18} />}
                    </span>
                    <div>
                      <p className="font-black">{step.label}</p>
                      {step.active && <p className="text-sm font-semibold text-green-800">Current status</p>}
                    </div>
                  </div>
                ))}
              </div>

              {summary.ageCheckRequired && (
                <p className="mt-5 rounded-lg bg-amber-50 p-4 text-sm font-bold text-amber-900">
                  Valid photo ID will be checked before handover.
                </p>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/order" className="rounded-lg bg-green-700 px-5 py-3 text-center font-bold text-white">
                  Create another order
                </Link>
                <Link href="/fc" className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-center font-bold">
                  FC dashboard
                </Link>
              </div>
            </>
          ) : null}
        </section>
      </div>
    </main>
  );
}
