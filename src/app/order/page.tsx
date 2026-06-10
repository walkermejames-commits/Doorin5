"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Plus, Sparkles, Trash2 } from "lucide-react";
import { isLikelyServiceArea } from "../../lib/local-delivery";
import { ActionButton } from "../../components/ui/ActionButton";
import { PageShell } from "../../components/ui/PageShell";
import { SectionCard } from "../../components/ui/SectionCard";
import { StatusPill } from "../../components/ui/StatusPill";

type ItemRow = {
  name: string;
  quantity: number;
  notes: string;
  ageRestricted: boolean;
};

const blankItem: ItemRow = { name: "", quantity: 1, notes: "", ageRestricted: false };
const urgencyOptions = ["ASAP", "Within 60 minutes", "Tonight", "Schedule with FC"];

export default function OrderPage() {
  const [pickupHint, setPickupHint] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [urgency, setUrgency] = useState(urgencyOptions[0]);
  const [items, setItems] = useState<ItemRow[]>([{ ...blankItem }]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [createdOrderId, setCreatedOrderId] = useState("");

  const ageCheckRequired = items.some((item) => item.ageRestricted);
  const serviceAreaOk = postcode.trim().length === 0 || isLikelyServiceArea(postcode);
  const canSubmit = useMemo(
    () =>
      customerName.trim() &&
      customerPhone.trim() &&
      (pickupHint.trim() || pickupAddress.trim()) &&
      dropoffAddress.trim() &&
      postcode.trim() &&
      serviceAreaOk &&
      items.some((item) => item.name.trim()),
    [customerName, customerPhone, dropoffAddress, items, pickupAddress, pickupHint, postcode, serviceAreaOk]
  );

  function updateItem(index: number, patch: Partial<ItemRow>) {
    setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  async function submitOrder() {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          pickupHint,
          pickupAddress,
          dropoffAddress,
          postcode,
          urgency,
          notes: deliveryNotes,
          items: items
            .filter((item) => item.name.trim())
            .map((item) => ({
              name: item.name,
              quantity: item.quantity,
              notes: item.notes,
              ageRestricted: item.ageRestricted,
            })),
        }),
      });

      const payload = await response.json();
      const data = payload.data ?? payload;
      if (!response.ok) {
        throw new Error(payload?.details?.join(" ") || payload?.errors?.join(" ") || payload?.error || "Request could not be created.");
      }

      setCreatedOrderId(data.order?.id ?? "demo-order");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Request could not be created.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (createdOrderId) {
    return (
      <PageShell eyebrow="Request sent to FC" title="You will get a quote before you pay." intro="No payment has been taken yet. FC will review the request, price the items and delivery, then send a quote link for approval.">
        <SectionCard>
          <div className="text-center">
            <CheckCircle2 className="mx-auto text-[#0f6b4f]" size={58} />
            <h2 className="mt-4 text-3xl font-black">Request sent to FC</h2>
            <p className="mx-auto mt-3 max-w-xl leading-7 text-[#726456]">
              You will get a quote to approve before payment. The driver only sees this job after the quote is accepted and paid.
            </p>
            <p className="mx-auto mt-5 max-w-md rounded-2xl bg-[#e8f4ed] p-4 text-sm font-black text-[#0f6b4f]">Reference: {createdOrderId}</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <ActionButton href={`/quote/${createdOrderId}`} tone="primary">
                Open quote page <Sparkles size={18} />
              </ActionButton>
              <ActionButton href="/fc" tone="ghost">
                View FC board
              </ActionButton>
            </div>
          </div>
        </SectionCard>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Customer request"
      title="Tell us what you need. FC will confirm your price before you pay."
      intro="No instant checkout, no mystery totals. Share the errand details and FC will send a clear quote with item estimate, delivery fee and notes."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_0.38fr]">
        <SectionCard title="Delivery request" intro="Give FC enough detail to price it properly.">
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Pickup shop/place">
                <input value={pickupHint} onChange={(event) => setPickupHint(event.target.value)} className="input" placeholder="e.g. Boots, Chapel Place, closest open shop" />
              </Field>
              <Field label="Pickup address if known">
                <input value={pickupAddress} onChange={(event) => setPickupAddress(event.target.value)} className="input" placeholder="Optional" />
              </Field>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-black">Items/products wanted</h2>
                <button type="button" onClick={() => setItems((current) => [...current, { ...blankItem }])} className="inline-flex items-center gap-2 rounded-xl border border-[#d8cdbd] bg-white px-3 py-2 text-sm font-black">
                  <Plus size={16} /> Add item
                </button>
              </div>
              {items.map((item, index) => (
                <div key={index} className="rounded-2xl border border-[#eadfce] bg-[#fffaf1] p-4">
                  <div className="grid gap-3 sm:grid-cols-[1fr_96px_44px]">
                    <Field label={`Item ${index + 1}`}>
                      <input value={item.name} onChange={(event) => updateItem(index, { name: event.target.value })} className="input" placeholder="Milk, prescription, takeaway order" />
                    </Field>
                    <Field label="Qty">
                      <input type="number" min={1} value={item.quantity} onChange={(event) => updateItem(index, { quantity: Number(event.target.value) })} className="input" />
                    </Field>
                    <button type="button" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="mt-7 flex h-12 items-center justify-center rounded-xl border border-[#eadfce] bg-white text-[#7a294f]" aria-label="Remove item">
                      <Trash2 size={17} />
                    </button>
                  </div>
                  <Field label="Substitution notes">
                    <input value={item.notes} onChange={(event) => updateItem(index, { notes: event.target.value })} className="input" placeholder="Brand, size, backup choice, collection reference" />
                  </Field>
                  <label className="mt-3 flex items-center gap-3 text-sm font-bold text-[#5f5260]">
                    <input type="checkbox" checked={item.ageRestricted} onChange={(event) => updateItem(index, { ageRestricted: event.target.checked })} />
                    Age-restricted item
                  </label>
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Dropoff address">
                <textarea value={dropoffAddress} onChange={(event) => setDropoffAddress(event.target.value)} className="input min-h-28" placeholder="Flat, building, street and access details" />
              </Field>
              <div className="space-y-4">
                <Field label="Postcode">
                  <input value={postcode} onChange={(event) => setPostcode(event.target.value.toUpperCase())} className="input" placeholder="TN1 1AA" />
                </Field>
                <Field label="Urgency">
                  <select value={urgency} onChange={(event) => setUrgency(event.target.value)} className="input">
                    {urgencyOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
            {!serviceAreaOk && <p className="rounded-2xl bg-[#fff2d5] p-4 text-sm font-bold text-[#7a4f00]">Doorin5 is currently focused on TN1, TN2, TN3, TN4, TN9 and TN10.</p>}

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Name">
                <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="input" />
              </Field>
              <Field label="Phone">
                <input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} className="input" placeholder="Mobile preferred" />
              </Field>
              <Field label="Email">
                <input value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} className="input" placeholder="For quote link" />
              </Field>
            </div>

            <Field label="Delivery notes">
              <textarea value={deliveryNotes} onChange={(event) => setDeliveryNotes(event.target.value)} className="input min-h-28" placeholder="Access code, parking, allergies, substitutions, budget ceiling, anything FC should know" />
            </Field>

            {submitError && <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{submitError}</p>}
            <ActionButton onClick={submitOrder} disabled={!canSubmit || isSubmitting} tone="primary" className="w-full sm:w-fit">
              {isSubmitting ? "Sending request..." : "Send request to FC"} <ArrowRight size={18} />
            </ActionButton>
          </div>
        </SectionCard>

        <aside className="space-y-4">
          <SectionCard title="What happens next">
            <div className="space-y-3 text-sm leading-6 text-[#726456]">
              <StatusPill label="No payment yet" />
              <p>FC reviews pickup, items, urgency, distance, likely product cost and any age checks.</p>
              <p>You receive a quote showing item estimate, delivery fee, service fee, total and FC notes.</p>
              <p>Only after you accept the quote will checkout open.</p>
            </div>
          </SectionCard>
          <SectionCard title="Service feel">
            <p className="text-sm leading-6 text-[#726456]">
              Premium local errand handling for Tunbridge Wells, Southborough, Rusthall, Pembury and nearby.
            </p>
            {ageCheckRequired && <p className="mt-4 rounded-2xl bg-[#fff2d5] p-4 text-sm font-black text-[#7a4f00]">FC will include ID-check handling in the quote.</p>}
          </SectionCard>
        </aside>
      </div>
    </PageShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-[#4f4050]">{label}</span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}
