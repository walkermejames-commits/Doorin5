"use client";

import { useEffect, useState } from "react";
import { Clock, CreditCard, Loader2, Sparkles, XCircle } from "lucide-react";
import { DeliveryOrder, DeliveryQuote, formatMoney } from "../../../lib/local-delivery";
import { ActionButton } from "../../../components/ui/ActionButton";
import { PageShell } from "../../../components/ui/PageShell";
import { SectionCard } from "../../../components/ui/SectionCard";
import { StatusPill } from "../../../components/ui/StatusPill";

type QuotePayload = {
  mode: "demo" | "supabase";
  order: DeliveryOrder;
  quote: DeliveryQuote | null;
};

export function QuoteClient({ orderId }: { orderId: string }) {
  const [payload, setPayload] = useState<QuotePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadQuote();
  }, [orderId]);

  async function loadQuote() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/quotes/${orderId}`, { cache: "no-store" });
      const envelope = await response.json();
      if (!response.ok) throw new Error(envelope.error ?? "Quote could not be loaded.");
      setPayload(envelope.data ?? envelope);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Quote could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  async function quoteAction(action: "accept" | "reject") {
    setBusy(action);
    setError("");
    try {
      const response = await fetch(`/api/quotes/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const envelope = await response.json();
      if (!response.ok) throw new Error(envelope.error ?? "Quote could not be updated.");
      const nextPayload = envelope.data ?? envelope;
      setPayload((current) => ({
        mode: nextPayload.mode ?? current?.mode ?? "demo",
        order: nextPayload.order,
        quote: nextPayload.quote ?? nextPayload.order?.quote ?? null,
      }));

      if (action === "accept") {
        const checkout = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        const checkoutEnvelope = await checkout.json();
        const checkoutData = checkoutEnvelope.data ?? checkoutEnvelope;
        if (!checkout.ok) throw new Error(checkoutEnvelope.error ?? "Checkout could not be created.");
        if (checkoutData.checkoutUrl) window.location.assign(checkoutData.checkoutUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Quote action failed.");
    } finally {
      setBusy("");
    }
  }

  const order = payload?.order;
  const quote = payload?.quote ?? order?.quote ?? null;
  const isReviewing = !quote || quote.quoteStatus === "draft";

  return (
    <PageShell
      eyebrow="Customer quote"
      title={isReviewing ? "FC is reviewing your request." : "Your Doorin5 quote is ready."}
      intro={isReviewing ? "We are checking item costs, delivery distance, urgency and notes before asking you to pay." : "Review the item estimate, delivery fee and FC notes. You only pay after accepting."}
    >
      {loading ? (
        <SectionCard>
          <p className="flex items-center gap-2 font-bold text-[#726456]">
            <Loader2 className="animate-spin" size={18} /> Loading quote
          </p>
        </SectionCard>
      ) : error ? (
        <SectionCard>
          <p className="font-bold text-red-700">{error}</p>
        </SectionCard>
      ) : order ? (
        <div className="grid gap-6 lg:grid-cols-[0.7fr_0.3fr]">
          <SectionCard
            title={isReviewing ? "Request summary" : "Quote summary"}
            aside={<StatusPill status={quote?.quoteStatus ?? order.status} />}
          >
            {isReviewing ? (
              <div className="rounded-2xl border border-[#eadfce] bg-[#fffaf1] p-5">
                <p className="flex items-center gap-2 text-lg font-black">
                  <Clock className="text-[#0f6b4f]" size={22} />
                  FC is reviewing your request
                </p>
                <p className="mt-2 text-sm leading-6 text-[#726456]">
                  You will see item/product estimate, delivery fee, service fee and FC notes here once the quote is ready.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <PriceRow label="Item/product estimate" value={formatMoney(quote.itemEstimatePence)} />
                <PriceRow label="Delivery fee" value={formatMoney(quote.deliveryFeePence)} />
                <PriceRow label="Service fee" value={formatMoney(quote.serviceFeePence)} />
                <div className="rounded-2xl bg-[#241124] p-5 text-[#fff8ec]">
                  <p className="text-sm font-black uppercase tracking-wide text-[#f1c979]">Total to pay</p>
                  <p className="mt-1 text-4xl font-black">{formatMoney(quote.totalPence)}</p>
                </div>
                {quote.fcNotes && <p className="rounded-2xl bg-[#e8f4ed] p-4 text-sm font-bold leading-6 text-[#0f6b4f]">{quote.fcNotes}</p>}
                {quote.expiresAt && <p className="text-sm font-bold text-[#726456]">Expires: {new Date(quote.expiresAt).toLocaleString("en-GB")}</p>}
                {quote.quoteStatus === "sent" && (
                  <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                    <ActionButton onClick={() => quoteAction("accept")} disabled={Boolean(busy)} tone="primary">
                      {busy === "accept" ? "Preparing checkout..." : "Accept quote and pay"} <CreditCard size={18} />
                    </ActionButton>
                    <ActionButton onClick={() => quoteAction("reject")} disabled={Boolean(busy)} tone="ghost">
                      Reject quote <XCircle size={18} />
                    </ActionButton>
                  </div>
                )}
                {quote.quoteStatus === "accepted" && <ActionButton onClick={() => quoteAction("accept")} tone="primary">Continue to payment</ActionButton>}
              </div>
            )}
          </SectionCard>

          <aside className="space-y-4">
            <SectionCard title="Your request">
              <div className="space-y-3 text-sm leading-6 text-[#726456]">
                <p><strong className="text-[#241124]">Pickup:</strong> {order.pickupHint}</p>
                <p><strong className="text-[#241124]">Dropoff:</strong> {order.dropoffAddress} ({order.postcode})</p>
                <p><strong className="text-[#241124]">Urgency:</strong> {order.urgency ?? "ASAP"}</p>
                <ul className="space-y-2">
                  {order.items.map((item) => (
                    <li key={`${item.name}-${item.quantity}`} className="rounded-xl bg-white p-3 font-semibold text-[#241124]">
                      {item.name} x{item.quantity}
                      {item.notes ? <span className="block text-xs font-bold text-[#726456]">{item.notes}</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            </SectionCard>
            <SectionCard title="Promise">
              <p className="text-sm leading-6 text-[#726456]">
                Payment opens only after you accept FC's quote. Paid requests then move to dispatch and live tracking.
              </p>
              <Sparkles className="mt-4 text-[#f1c979]" />
            </SectionCard>
          </aside>
        </div>
      ) : null}
    </PageShell>
  );
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#eadfce] bg-white p-4">
      <span className="font-bold text-[#726456]">{label}</span>
      <span className="text-lg font-black text-[#241124]">{value}</span>
    </div>
  );
}
