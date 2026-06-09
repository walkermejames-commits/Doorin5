'use client';

import Link from 'next/link';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Camera, CheckCircle2, Clock, Loader2, MapPinned, PackageCheck, PoundSterling } from 'lucide-react';
import { DeliveryOrder, formatMoney, nextStatuses, statusLabels } from '../../lib/local-delivery';

type DriverOrder = DeliveryOrder & {
  distanceMiles?: number;
  pickupEta?: string;
};

type DriverPayload = {
  mode: 'demo' | 'supabase';
  orders: DriverOrder[];
  error?: string;
};

export default function DriverDashboard() {
  const [orders, setOrders] = useState<DriverOrder[]>([]);
  const [mode, setMode] = useState<'demo' | 'supabase'>('demo');
  const [selectedProofOrder, setSelectedProofOrder] = useState('');
  const [proofNote, setProofNote] = useState('');
  const [recipientConfirmed, setRecipientConfirmed] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyOrderId, setBusyOrderId] = useState('');

  const assignedJobs = orders.filter((order) => order.status === 'assigned');
  const activeJobs = orders.filter((order) => ['accepted', 'shopping', 'collected', 'en_route', 'delivered'].includes(order.status));
  const completedJobs = orders.filter((order) => order.status === 'completed');
  const earnings = [...activeJobs, ...completedJobs].reduce((total, order) => total + order.estimatedFeePence, 0);
  const selectedProof = orders.find((order) => order.id === selectedProofOrder) ?? activeJobs[0];

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (!selectedProofOrder && activeJobs[0]) setSelectedProofOrder(activeJobs[0].id);
  }, [activeJobs, selectedProofOrder]);

  async function loadJobs() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/driver/jobs', { cache: 'no-store' });
      const envelope = (await response.json()) as { data?: DriverPayload; error?: string };
      if (!response.ok) throw new Error(envelope.error ?? 'Could not load driver jobs.');
      const payload = envelope.data ?? { mode: 'demo', orders: [] };
      setOrders((payload.orders ?? []).map(addRouteHints));
      setMode(payload.mode ?? 'demo');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load driver jobs.');
    } finally {
      setLoading(false);
    }
  }

  async function progressOrder(order: DriverOrder) {
    const nextStatus = nextStatuses[order.status];
    if (!nextStatus) return;

    setBusyOrderId(order.id);
    setMessage('');
    setError('');

    const response = await fetch('/api/driver/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id, status: order.status }),
    });
    const envelope = await response.json();
    const payload = envelope.data ?? envelope;
    setBusyOrderId('');

    if (!response.ok) {
      setError(envelope.error ?? payload.error ?? 'Could not update status.');
      return;
    }

    if (payload.order) {
      setOrders((current) => current.map((item) => (item.id === order.id ? addRouteHints(payload.order) : item)));
    } else {
      setOrders((current) => current.map((item) => (item.id === order.id ? { ...item, status: payload.status ?? nextStatus } : item)));
    }

    setMessage(`${order.id} moved to ${statusLabels[payload.status as keyof typeof statusLabels] ?? 'next status'}.`);
    await loadJobs();
  }

  async function saveProof() {
    if (!selectedProof) return;
    setIsSaving(true);
    setMessage('');
    setError('');

    const response = await fetch('/api/driver/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: selectedProof.id,
        proofNote,
        recipientConfirmed,
      }),
    });
    const envelope = await response.json();
    const payload = envelope.data ?? envelope;
    setIsSaving(false);

    if (!response.ok) {
      setError(envelope.details?.join(' ') ?? envelope.error ?? payload.errors?.join(' ') ?? payload.error ?? 'Proof details could not be saved.');
      return;
    }

    setProofNote('');
    setRecipientConfirmed(false);
    setMessage(`Delivery completed for ${payload.order?.id ?? payload.orderId}.`);
    await loadJobs();
  }

  const summaryCards = useMemo(
    () => [
      { label: 'Assigned jobs', value: String(assignedJobs.length), icon: Clock },
      { label: 'Active jobs', value: String(activeJobs.length), icon: PackageCheck },
      { label: 'Est. earnings', value: formatMoney(earnings), icon: PoundSterling },
    ],
    [activeJobs.length, assignedJobs.length, earnings]
  );

  return (
    <main className="min-h-screen bg-[#f6f7f2] text-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-950">
              <ArrowLeft size={16} />
              Back to Doorin5
            </Link>
            <h1 className="mt-3 text-3xl font-black">Driver dashboard</h1>
            <p className="mt-1 text-gray-600">Assigned jobs, live status updates, and delivery proof capture.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <span className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-700">
              {mode === 'supabase' ? 'Supabase live' : 'Demo fallback'}
            </span>
            <Link href="/fc" className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-bold hover:border-gray-500">
              FC view
            </Link>
          </div>
        </div>

        <section className="grid gap-3 sm:grid-cols-3">
          {summaryCards.map((card) => (
            <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <card.icon className="text-green-700" size={22} />
              <p className="mt-4 text-sm font-bold text-gray-500">{card.label}</p>
              <p className="mt-1 text-3xl font-black">{card.value}</p>
            </div>
          ))}
        </section>

        {loading && (
          <p className="mt-5 flex items-center gap-2 rounded-lg bg-gray-50 p-4 text-sm font-bold text-gray-700">
            <Loader2 className="animate-spin" size={18} />
            Loading jobs
          </p>
        )}
        {message && <p className="mt-5 rounded-lg bg-green-50 p-4 text-sm font-bold text-green-800">{message}</p>}
        {error && <p className="mt-5 rounded-lg bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.82fr]">
          <section className="space-y-5">
            <DashboardPanel title="Assigned jobs" empty="No assigned jobs waiting for acceptance.">
              {assignedJobs.map((order) => (
                <JobCard
                  key={order.id}
                  order={order}
                  actionLabel="Accept job"
                  busy={busyOrderId === order.id}
                  onAction={() => progressOrder(order)}
                />
              ))}
            </DashboardPanel>

            <DashboardPanel title="Active jobs" empty="No active jobs yet. Accept an assigned job to start.">
              {activeJobs.map((order) => (
                <JobCard
                  key={order.id}
                  order={order}
                  actionLabel={order.status === 'delivered' ? 'Save proof to complete' : 'Move status'}
                  busy={busyOrderId === order.id}
                  onAction={() => {
                    if (order.status === 'delivered') {
                      setSelectedProofOrder(order.id);
                      setMessage('Add proof details to complete this delivery.');
                      return;
                    }
                    progressOrder(order);
                  }}
                />
              ))}
            </DashboardPanel>
          </section>

          <aside className="h-fit rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
              <p className="flex items-center gap-2 text-sm font-black text-gray-900">
                <MapPinned size={18} className="text-green-700" />
                Navigation placeholder
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Real driver launch should add pickup and dropoff map links here. The operational status workflow now persists first.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Camera className="text-green-700" size={22} />
              <div>
                <h2 className="text-xl font-black">Proof of delivery</h2>
                <p className="text-sm text-gray-600">Save handover evidence and complete the order.</p>
              </div>
            </div>

            {activeJobs.length > 0 ? (
              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="text-sm font-bold">Job</span>
                  <select value={selectedProofOrder} onChange={(event) => setSelectedProofOrder(event.target.value)} className="input mt-2">
                    {activeJobs.map((order) => (
                      <option key={order.id} value={order.id}>
                        {order.id} - {order.postcode}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-bold">Proof note</span>
                  <textarea
                    value={proofNote}
                    onChange={(event) => setProofNote(event.target.value)}
                    className="input mt-2 min-h-28"
                    placeholder="e.g. Handed to customer at front door. ID checked."
                  />
                </label>
                <label className="flex items-start gap-3 text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={recipientConfirmed}
                    onChange={(event) => setRecipientConfirmed(event.target.checked)}
                    className="mt-1"
                  />
                  Recipient confirmed handover
                </label>
                <button
                  type="button"
                  onClick={saveProof}
                  disabled={isSaving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-950 px-5 py-3 font-bold text-white disabled:bg-gray-400"
                >
                  {isSaving && <Loader2 className="animate-spin" size={18} />}
                  Complete delivery
                </button>
              </div>
            ) : (
              <p className="mt-5 rounded-lg bg-gray-50 p-4 text-sm font-semibold text-gray-600">
                Proof capture appears after a driver accepts a job.
              </p>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

function addRouteHints(order: DriverOrder, index = 0): DriverOrder {
  return {
    ...order,
    distanceMiles: order.distanceMiles ?? (index % 2 === 0 ? 1.4 : 2.1),
    pickupEta: order.pickupEta ?? (index % 2 === 0 ? '8 min' : '14 min'),
  };
}

function DashboardPanel({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black">{title}</h2>
      <div className="mt-4 space-y-4">
        {hasChildren ? children : <p className="rounded-lg bg-gray-50 p-4 text-sm font-semibold text-gray-600">{empty}</p>}
      </div>
    </section>
  );
}

function JobCard({
  order,
  actionLabel,
  busy,
  onAction,
}: {
  order: DriverOrder;
  actionLabel: string;
  busy: boolean;
  onAction: () => void;
}) {
  const isComplete = order.status === 'completed' || order.status === 'cancelled';

  return (
    <article className="rounded-lg border border-gray-200 bg-[#f6f7f2] p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-bold text-gray-500">{order.id}</p>
          <h3 className="text-lg font-black">{order.customerName}</h3>
          <p className="mt-1 text-sm text-gray-600">{order.dropoffAddress}</p>
        </div>
        <span className="w-fit rounded-full bg-gray-950 px-3 py-1 text-xs font-bold text-white">{statusLabels[order.status]}</span>
      </div>
      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <Info label="Pickup" value={order.pickupHint} />
        <Info label="ETA" value={order.pickupEta ?? '8 min'} />
        <Info label="Fee" value={formatMoney(order.estimatedFeePence)} />
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {order.items.map((item) => (
          <li key={`${order.id}-${item.name}`} className="flex justify-between rounded-lg bg-white px-3 py-2">
            <span>
              {item.name}
              {item.ageRestricted ? ' (ID)' : ''}
            </span>
            <span className="font-bold">x{item.quantity}</span>
          </li>
        ))}
      </ul>
      {order.ageCheckRequired && (
        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm font-bold text-amber-900">Check valid photo ID before handover.</p>
      )}
      <button
        type="button"
        onClick={onAction}
        disabled={isComplete || busy}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-3 text-sm font-bold text-white disabled:bg-gray-400"
      >
        {busy ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
        {isComplete ? 'No further action' : actionLabel}
      </button>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
