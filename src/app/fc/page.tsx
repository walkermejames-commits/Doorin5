"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Bike, CheckCircle2, Clock, Loader2, PackageCheck, PoundSterling, Send } from "lucide-react";
import { DeliveryOrder, formatMoney, isDispatchable, statusLabels } from "../../lib/local-delivery";
import { DriverProfile } from "../../lib/driver-assignment";
import { ActionButton } from "../../components/ui/ActionButton";
import { MetricCard } from "../../components/ui/MetricCard";
import { PageShell } from "../../components/ui/PageShell";
import { SectionCard } from "../../components/ui/SectionCard";
import { StatusPill } from "../../components/ui/StatusPill";

type FcOrder = DeliveryOrder & { exception?: string };
type OperationsPayload = { mode: "demo" | "supabase"; orders: FcOrder[]; drivers: DriverProfile[] };
type QuoteDraft = { itemEstimatePence: string; deliveryFeePence: string; serviceFeePence: string; fcNotes: string; expiresInMinutes: string };

const defaultQuote: QuoteDraft = { itemEstimatePence: "1800", deliveryFeePence: "699", serviceFeePence: "150", fcNotes: "", expiresInMinutes: "30" };

export default function FcDashboard() {
  const [orders, setOrders] = useState<FcOrder[]>([]);
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [mode, setMode] = useState<"demo" | "supabase">("demo");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [quotes, setQuotes] = useState<Record<string, QuoteDraft>>({});

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/operations/summary", { cache: "no-store" });
      const envelope = (await response.json()) as { data?: OperationsPayload; error?: string };
      if (!response.ok) throw new Error(envelope.error ?? "Could not load FC dashboard.");
      const payload = envelope.data ?? { mode: "demo", orders: [], drivers: [] };
      setOrders((payload.orders ?? []).map((order) => ({ ...order, exception: order.ageCheckRequired ? "ID check required" : undefined })));
      setDrivers(payload.drivers ?? []);
      setMode(payload.mode ?? "demo");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load FC dashboard.");
    } finally {
      setLoading(false);
    }
  }

  const queues = useMemo(() => {
    const newRequests = orders.filter((order) => ["request_submitted", "fc_reviewing"].includes(order.status));
    const quoteSent = orders.filter((order) => order.status === "quote_sent");
    const paidReady = orders.filter((order) => isDispatchable(order));
    const active = orders.filter((order) => ["assigned", "accepted", "shopping", "collected", "en_route", "delivered"].includes(order.status));
    const completed = orders.filter((order) => order.status === "completed");
    return { newRequests, quoteSent, paidReady, active, completed };
  }, [orders]);

  const revenue = orders.reduce((total, order) => total + (order.quote?.totalPence ?? 0), 0);
  const activeDrivers = drivers.filter((driver) => driver.status === "active" || driver.status === "approved").length;

  async function fcAction(orderId: string, action: "start_review" | "cancel") {
    setBusy(`${action}:${orderId}`);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`/api/fc/orders/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const envelope = await response.json();
      if (!response.ok) throw new Error(envelope.error ?? "FC action failed.");
      setMessage(action === "start_review" ? `${orderId} is now under FC review.` : `${orderId} cancelled.`);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "FC action failed.");
    } finally {
      setBusy("");
    }
  }

  async function sendQuote(order: FcOrder) {
    const draft = quotes[order.id] ?? defaultQuote;
    setBusy(`quote:${order.id}`);
    setMessage("");
    setError("");
    try {
      const expires = new Date(Date.now() + Number(draft.expiresInMinutes || 30) * 60 * 1000).toISOString();
      const response = await fetch(`/api/quotes/${order.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          itemEstimatePence: Number(draft.itemEstimatePence),
          deliveryFeePence: Number(draft.deliveryFeePence),
          serviceFeePence: Number(draft.serviceFeePence),
          fcNotes: draft.fcNotes || "FC has checked the likely item cost and delivery details.",
          expiresAt: expires,
        }),
      });
      const envelope = await response.json();
      if (!response.ok) throw new Error(envelope.error ?? "Quote could not be sent.");
      setMessage(`Quote sent for ${order.id}.`);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Quote could not be sent.");
    } finally {
      setBusy("");
    }
  }

  async function dispatch(order: FcOrder) {
    const driver = drivers.find((candidate) => candidate.available !== false) ?? drivers[0];
    setBusy(`dispatch:${order.id}`);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, driverId: driver?.id, driverName: driver?.name }),
      });
      const envelope = await response.json();
      if (!response.ok) throw new Error(envelope.error ?? "Could not dispatch order.");
      setMessage(`${order.id} assigned to ${driver?.name ?? "Doorin5 Driver"}.`);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not dispatch order.");
    } finally {
      setBusy("");
    }
  }

  return (
    <PageShell
      eyebrow={mode === "supabase" ? "Supabase live" : "Demo FC board"}
      title="FC control centre"
      intro="Review customer requests, build quotes, wait for payment, then dispatch paid jobs to drivers."
    >
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="New requests" value={String(queues.newRequests.length)} icon={PackageCheck} />
        <MetricCard label="Paid dispatch" value={String(queues.paidReady.length)} icon={Bike} />
        <MetricCard label="Quote value" value={formatMoney(revenue)} icon={PoundSterling} />
        <MetricCard label="Active drivers" value={String(activeDrivers)} icon={CheckCircle2} />
      </section>

      {loading && <p className="mt-5 flex items-center gap-2 rounded-2xl bg-white p-4 text-sm font-bold text-[#726456]"><Loader2 className="animate-spin" size={18} /> Loading operations</p>}
      {message && <p className="mt-5 rounded-2xl bg-[#e8f4ed] p-4 text-sm font-bold text-[#0f6b4f]">{message}</p>}
      {error && <p className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <SectionCard title="New requests and quote builder" intro="Start review, price the errand, then send the quote link.">
          <div className="space-y-4">
            {queues.newRequests.length ? (
              queues.newRequests.map((order) => (
                <OrderCard key={order.id} order={order}>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <MoneyField label="Item estimate" value={quotes[order.id]?.itemEstimatePence ?? defaultQuote.itemEstimatePence} onChange={(value) => setQuotes((current) => ({ ...current, [order.id]: { ...(current[order.id] ?? defaultQuote), itemEstimatePence: value } }))} />
                    <MoneyField label="Delivery fee" value={quotes[order.id]?.deliveryFeePence ?? defaultQuote.deliveryFeePence} onChange={(value) => setQuotes((current) => ({ ...current, [order.id]: { ...(current[order.id] ?? defaultQuote), deliveryFeePence: value } }))} />
                    <MoneyField label="Service fee" value={quotes[order.id]?.serviceFeePence ?? defaultQuote.serviceFeePence} onChange={(value) => setQuotes((current) => ({ ...current, [order.id]: { ...(current[order.id] ?? defaultQuote), serviceFeePence: value } }))} />
                  </div>
                  <textarea
                    value={quotes[order.id]?.fcNotes ?? ""}
                    onChange={(event) => setQuotes((current) => ({ ...current, [order.id]: { ...(current[order.id] ?? defaultQuote), fcNotes: event.target.value } }))}
                    className="input mt-3 min-h-24"
                    placeholder="Friendly FC notes to customer"
                  />
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <ActionButton onClick={() => fcAction(order.id, "start_review")} disabled={busy === `start_review:${order.id}` || order.status === "fc_reviewing"} tone="ghost">Start review</ActionButton>
                    <ActionButton onClick={() => sendQuote(order)} disabled={busy === `quote:${order.id}`} tone="primary">Send quote <Send size={16} /></ActionButton>
                    <ActionButton onClick={() => fcAction(order.id, "cancel")} disabled={busy === `cancel:${order.id}`} tone="ghost">Cancel request</ActionButton>
                  </div>
                </OrderCard>
              ))
            ) : (
              <Empty label="No new requests waiting for FC." />
            )}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Quote sent" intro="Waiting for customer approval.">
            <OrderList orders={queues.quoteSent} empty="No quotes waiting for customers." />
          </SectionCard>
          <SectionCard title="Paid and ready to dispatch" intro="Only these jobs can be assigned.">
            <div className="space-y-3">
              {queues.paidReady.length ? queues.paidReady.map((order) => (
                <OrderCard key={order.id} order={order}>
                  <ActionButton onClick={() => dispatch(order)} disabled={busy === `dispatch:${order.id}`} tone="primary" className="mt-4 w-full">Assign driver</ActionButton>
                </OrderCard>
              )) : <Empty label="No paid jobs waiting for drivers." />}
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCard title="Active deliveries">
          <OrderList orders={queues.active} empty="No active deliveries." />
        </SectionCard>
        <SectionCard title="Completed">
          <OrderList orders={queues.completed} empty="No completed deliveries yet." />
        </SectionCard>
      </div>
    </PageShell>
  );
}

function OrderCard({ order, children }: { order: FcOrder; children?: React.ReactNode }) {
  return (
    <article className="rounded-2xl border border-[#eadfce] bg-[#fffaf1] p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-black uppercase text-[#726456]">{order.id}</p>
          <h3 className="text-lg font-black">{order.customerName}</h3>
          <p className="mt-1 text-sm text-[#726456]">{order.pickupHint}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill status={order.status} />
          <StatusPill label={`Payment: ${order.paymentStatus ?? "unpaid"}`} />
        </div>
      </div>
      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <Info label="Dropoff" value={`${order.dropoffAddress} (${order.postcode})`} />
        <Info label="Urgency" value={order.urgency ?? "ASAP"} />
        <Info label="Total" value={order.quote ? formatMoney(order.quote.totalPence) : "Awaiting quote"} />
      </div>
      <ul className="mt-3 space-y-2">
        {order.items.map((item) => (
          <li key={`${order.id}-${item.name}`} className="rounded-xl bg-white p-3 text-sm font-semibold">
            {item.name} x{item.quantity}{item.ageRestricted ? " - ID check" : ""}
            {item.notes ? <span className="block text-xs text-[#726456]">{item.notes}</span> : null}
          </li>
        ))}
      </ul>
      {order.ageCheckRequired && <p className="mt-3 flex items-center gap-2 rounded-xl bg-[#fff2d5] p-3 text-sm font-black text-[#7a4f00]"><AlertTriangle size={16} /> Age restriction warning</p>}
      {children}
    </article>
  );
}

function OrderList({ orders, empty }: { orders: FcOrder[]; empty: string }) {
  return <div className="space-y-3">{orders.length ? orders.map((order) => <OrderCard key={order.id} order={order} />) : <Empty label={empty} />}</div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-3">
      <p className="text-xs font-black uppercase tracking-wide text-[#726456]">{label}</p>
      <p className="mt-1 font-semibold text-[#241124]">{value}</p>
    </div>
  );
}

function MoneyField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase text-[#726456]">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} type="number" min={0} className="input mt-1" />
    </label>
  );
}

function Empty({ label }: { label: string }) {
  return <p className="rounded-2xl border border-dashed border-[#d8cdbd] bg-white/70 p-4 text-sm font-bold text-[#726456]">{label}</p>;
}
