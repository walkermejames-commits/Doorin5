'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, Bike, CheckCircle2, Loader2, PackageSearch, PoundSterling, ShieldAlert } from 'lucide-react';
import { DeliveryOrder, formatMoney, statusLabels } from '../../lib/local-delivery';
import { DriverProfile } from '../../lib/driver-assignment';
import { DemoModePill } from '../../components/DemoModePill';

type FcOrder = DeliveryOrder & {
  exception?: string;
};

type OperationsPayload = {
  mode: 'demo' | 'supabase';
  orders: FcOrder[];
  drivers: DriverProfile[];
};

export default function FcDashboard() {
  const [orders, setOrders] = useState<FcOrder[]>([]);
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [mode, setMode] = useState<'demo' | 'supabase'>('demo');
  const [isLoading, setIsLoading] = useState(true);
  const [isDispatching, setIsDispatching] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [readiness, setReadiness] = useState<{ status?: string; warnings?: string[]; blockers?: string[]; deploymentMode?: string } | null>(null);

  const activeDrivers = drivers.filter((driver) => driver.status === 'active' || driver.status === 'approved').length;
  const revenue = orders.reduce((total, order) => total + order.estimatedFeePence, 0);
  const exceptions = orders.filter((order) => order.exception || order.ageCheckRequired);
  const dispatchQueue = orders.filter((order) => !order.driverId && !order.driverName && ['draft', 'paid'].includes(order.status));
  const activeDeliveries = orders.filter((order) =>
    ['assigned', 'accepted', 'shopping', 'collected', 'en_route', 'delivered'].includes(order.status)
  );
  const completedDeliveries = orders.filter((order) => order.status === 'completed');

  const cards = useMemo(
    () => [
      { label: "Today's orders", value: String(orders.length), icon: PackageSearch },
      { label: 'Active drivers', value: String(activeDrivers), icon: Bike },
      { label: 'Est. revenue', value: formatMoney(revenue), icon: PoundSterling },
      { label: 'Exceptions', value: String(exceptions.length), icon: AlertTriangle },
    ],
    [activeDrivers, exceptions.length, orders.length, revenue]
  );

  useEffect(() => {
    loadDashboard();
    loadReadiness();
  }, []);

  async function loadReadiness() {
    try {
      const response = await fetch('/api/health', { cache: 'no-store' });
      const envelope = await response.json();
      if (response.ok) setReadiness(envelope.data ?? envelope);
    } catch {
      setReadiness(null);
    }
  }

  async function loadDashboard() {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/operations/summary', { cache: 'no-store' });
      const envelope = (await response.json()) as { data?: OperationsPayload; error?: string };
      if (!response.ok) throw new Error(envelope.error ?? 'Could not load FC dashboard.');
      const payload = envelope.data ?? { mode: 'demo', orders: [], drivers: [] };

      setOrders(
        (payload.orders ?? []).map((order) => ({
          ...order,
          exception: order.ageCheckRequired ? 'ID check required' : undefined,
        }))
      );
      setDrivers(payload.drivers ?? []);
      setMode(payload.mode ?? 'demo');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load FC dashboard.');
    } finally {
      setIsLoading(false);
    }
  }

  async function dispatch(order: FcOrder) {
    const driver = drivers.find((candidate) => candidate.available !== false) ?? drivers[0];
    setIsDispatching(order.id);
    setMessage('');
    setError('');

    const response = await fetch('/api/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id, driverId: driver?.id, driverName: driver?.name }),
    });
    const envelope = await response.json();
    const payload = envelope.data ?? envelope;
    setIsDispatching('');

    if (!response.ok) {
      setError(envelope.error ?? payload.error ?? 'Could not dispatch order.');
      return;
    }

    if (payload.order) {
      setOrders((current) => current.map((item) => (item.id === order.id ? { ...item, ...payload.order } : item)));
    }

    setMessage(`${order.id} assigned to ${payload.order?.driverName ?? driver?.name ?? 'Doorin5 Driver'}.`);
    await loadDashboard();
  }

  return (
    <main className="min-h-screen text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 overflow-hidden rounded-lg bg-slate-950 p-5 text-white shadow-xl shadow-slate-950/10 sm:p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white">
              <ArrowLeft size={16} />
              Back to Doorin5
            </Link>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">FC command centre</h1>
            <p className="mt-2 w-[calc(100vw-4rem)] text-sm leading-6 text-slate-300 sm:w-auto sm:max-w-2xl sm:text-base">
              Dispatch, drivers, payments, and exceptions in one safe demo view.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <DemoModePill label={mode === 'supabase' ? 'Supabase live' : 'Demo FC board'} />
            <Link href="/order" className="rounded-lg bg-emerald-500 px-4 py-3 text-sm font-black text-emerald-950 hover:bg-emerald-400">
              Create customer order
            </Link>
            <Link href="/driver" className="rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm font-black text-white hover:bg-white/18">
              Driver board
            </Link>
          </div>
          </div>
        </div>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="surface-card interactive-card rounded-lg p-5">
              <card.icon className="text-emerald-700" size={22} />
              <p className="mt-4 text-sm font-bold text-slate-500">{card.label}</p>
              <p className="mt-1 text-3xl font-black">{card.value}</p>
            </div>
          ))}
        </section>

        {isLoading && (
          <p className="mt-5 flex items-center gap-2 rounded-lg bg-gray-50 p-4 text-sm font-bold text-gray-700">
            <Loader2 className="animate-spin" size={18} />
            Loading operations
          </p>
        )}
        {message && <p className="mt-5 rounded-lg bg-green-50 p-4 text-sm font-bold text-green-800">{message}</p>}
        {error && <p className="mt-5 rounded-lg bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
        {readiness && (readiness.warnings?.length || readiness.blockers?.length) ? (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <p className="flex items-center gap-2 font-black"><ShieldAlert size={16} /> Pilot readiness</p>
            <p className="mt-1">Mode: {readiness.deploymentMode ?? 'local'} / Status: {readiness.status ?? 'warning'}</p>
            {(readiness.warnings ?? []).map((item) => <p key={item} className="mt-1">- {item}</p>)}
            {(readiness.blockers ?? []).map((item) => <p key={item} className="mt-1 font-semibold">- {item}</p>)}
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="surface-card rounded-lg p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">Dispatch queue</h2>
                <p className="text-sm text-gray-600">Orders waiting for a driver assignment.</p>
              </div>
              <span className="rounded-lg bg-slate-950 px-3 py-1 text-sm font-bold text-white">{dispatchQueue.length} waiting</span>
            </div>

            <div className="mt-4 space-y-4">
              {dispatchQueue.length > 0 ? (
                dispatchQueue.map((order) => {
                  const requiresManualOverride = order.status === 'draft' && order.paymentStatus !== 'paid';
                  return (
                  <article key={order.id} className="interactive-card rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-sm font-bold text-gray-500">{order.id}</p>
                        <h3 className="text-lg font-black">{order.customerName}</h3>
                        <p className="mt-1 text-sm text-gray-600">{order.pickupHint}</p>
                      </div>
                      <span className="w-fit rounded-lg bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                        {statusLabels[order.status]}
                      </span>
                      <span className="w-fit rounded-lg bg-slate-950 px-3 py-1 text-xs font-bold text-white">Payment: {order.paymentStatus ?? 'unpaid'}</span>
                    </div>
                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                      <Info label="Dropoff" value={order.postcode} />
                      <Info label="Fee" value={formatMoney(order.estimatedFeePence)} />
                      <Info label="Items" value={String(order.items.length)} />
                    </div>
                    {requiresManualOverride && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs font-bold text-amber-900">Unpaid draft order - manual FC override required before dispatch.</p>}
                    <button
                      type="button"
                      onClick={() => dispatch(order)}
                      disabled={isDispatching === order.id || drivers.length === 0 || requiresManualOverride}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-3 text-sm font-black text-white disabled:bg-slate-400"
                    >
                      {isDispatching === order.id ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                      {requiresManualOverride ? 'Manual FC override' : 'Assign driver'}
                    </button>
                  </article>
                  );
                })
              ) : (
                <p className="rounded-lg bg-gray-50 p-4 text-sm font-semibold text-gray-600">Dispatch queue is empty.</p>
              )}
            </div>
          </section>

          <OrderTable title="Active deliveries" orders={activeDeliveries} empty="No active deliveries." />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="surface-card rounded-lg p-5">
            <h2 className="text-xl font-black">Active drivers</h2>
            <div className="mt-4 space-y-3">
              {drivers.length > 0 ? (
                drivers.map((driver) => (
                  <div key={driver.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div>
                      <p className="font-black">{driver.name}</p>
                      <p className="text-sm text-gray-600">
                        {driver.status ?? 'pending'} · {driver.activeJobs ?? 0} active jobs
                      </p>
                    </div>
                    <span className="text-sm font-black">{driver.available === false ? 'Paused' : 'Available'}</span>
                  </div>
                ))
              ) : (
                <p className="rounded-lg bg-gray-50 p-4 text-sm font-semibold text-gray-600">No driver profiles available.</p>
              )}
            </div>
          </section>

          <section className="surface-card rounded-lg p-5">
            <h2 className="text-xl font-black">Exceptions</h2>
            <div className="mt-4 space-y-3">
              {exceptions.length > 0 ? (
                exceptions.map((order) => (
                  <div key={order.id} className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="font-black">{order.id}</p>
                    <p className="text-sm font-semibold text-amber-900">{order.exception ?? 'Review required'}</p>
                    <p className="mt-1 text-sm text-gray-700">{order.notes}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-lg bg-gray-50 p-4 text-sm font-semibold text-gray-600">No exceptions currently.</p>
              )}
            </div>
          </section>
        </div>

        <div className="mt-6">
          <OrderTable title="Completed deliveries" orders={completedDeliveries} empty="No completed deliveries yet." />
        </div>
      </div>
    </main>
  );
}

function OrderTable({ title, orders, empty }: { title: string; orders: FcOrder[]; empty: string }) {
  return (
    <section className="surface-card rounded-lg p-5">
      <h2 className="text-xl font-black">{title}</h2>
      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
        <div className="grid grid-cols-[1fr_0.8fr_0.8fr] bg-gray-950 px-4 py-3 text-sm font-bold text-white">
          <span>Order</span>
          <span>Status</span>
          <span>Driver</span>
        </div>
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className="grid grid-cols-[1fr_0.8fr_0.8fr] gap-3 border-t border-gray-200 px-4 py-3 text-sm">
              <span>
                <strong>{order.id}</strong>
                <br />
                <span className="text-gray-600">{order.postcode}</span>
              </span>
              <span>{statusLabels[order.status]}</span>
              <span>{order.driverName ?? 'Unassigned'}</span>
            </div>
          ))
        ) : (
          <p className="border-t border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600">{empty}</p>
        )}
      </div>
    </section>
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
