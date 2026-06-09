'use client';

import Link from 'next/link';
import type React from 'react';
import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { estimateDeliveryFee, formatMoney, isLikelyServiceArea } from '../../lib/local-delivery';

type ItemRow = {
  name: string;
  quantity: number;
  notes: string;
  ageRestricted: boolean;
};

type OrderStep = 'pickup' | 'delivery' | 'items' | 'contact' | 'summary' | 'success';

const stepOrder: OrderStep[] = ['pickup', 'delivery', 'items', 'contact', 'summary'];
const urgencyOptions = ['ASAP', 'Within 60 minutes', 'Tonight', 'Schedule with FC'];

const blankItem: ItemRow = {
  name: '',
  quantity: 1,
  notes: '',
  ageRestricted: false,
};

export default function OrderPage() {
  const [step, setStep] = useState<OrderStep>('pickup');
  const [pickupHint, setPickupHint] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [urgency, setUrgency] = useState(urgencyOptions[0]);
  const [items, setItems] = useState<ItemRow[]>([{ ...blankItem }]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [createdOrderId, setCreatedOrderId] = useState('');

  const currentIndex = stepOrder.indexOf(step);
  const ageCheckRequired = items.some((item) => item.ageRestricted);
  const estimatedFee = useMemo(() => estimateDeliveryFee(postcode || 'TN1', ageCheckRequired), [ageCheckRequired, postcode]);
  const serviceAreaOk = postcode.trim().length === 0 || isLikelyServiceArea(postcode);

  const errors = useMemo(() => {
    const result: Partial<Record<OrderStep, string[]>> = {
      pickup: [],
      delivery: [],
      items: [],
      contact: [],
      summary: [],
    };

    if (!pickupHint.trim() && !pickupAddress.trim()) result.pickup?.push('Add a shop, restaurant, or pickup instruction.');
    if (!dropoffAddress.trim()) result.delivery?.push('Add a delivery address.');
    if (!postcode.trim()) result.delivery?.push('Add a delivery postcode.');
    if (postcode.trim() && !isLikelyServiceArea(postcode)) result.delivery?.push('This postcode is outside the current demo service area.');
    if (!items.some((item) => item.name.trim())) result.items?.push('Add at least one item.');
    if (items.some((item) => item.name.trim() && (!Number.isFinite(item.quantity) || item.quantity < 1))) {
      result.items?.push('Every item needs a valid quantity.');
    }
    if (ageCheckRequired && !ageConfirmed) result.items?.push('Confirm age checks for restricted items.');
    if (!customerName.trim()) result.contact?.push('Add your name.');
    if (!customerPhone.trim()) result.contact?.push('Add your phone number.');
    if (customerPhone.trim() && customerPhone.replace(/\D/g, '').length < 10) result.contact?.push('Phone number looks too short.');

    return result;
  }, [ageCheckRequired, ageConfirmed, customerName, customerPhone, dropoffAddress, items, pickupAddress, pickupHint, postcode]);

  const visibleErrors = errors[step] ?? [];
  const canContinue = visibleErrors.length === 0;

  function updateItem(index: number, patch: Partial<ItemRow>) {
    setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function goNext() {
    if (!canContinue) return;
    const next = stepOrder[currentIndex + 1];
    if (next) setStep(next);
  }

  async function submitOrder() {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          pickupHint: [pickupHint, pickupAddress].filter(Boolean).join(' | '),
          dropoffAddress,
          postcode,
          notes: [`Urgency: ${urgency}`, customerEmail ? `Email: ${customerEmail}` : null, deliveryNotes || null]
            .filter(Boolean)
            .join('\n'),
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
        throw new Error(payload?.details?.join(' ') || payload?.errors?.join(' ') || payload?.error || 'Order could not be created.');
      }

      setCreatedOrderId(data.order?.id ?? 'demo-order');
      setStep('success');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Order could not be created.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f7f2] text-gray-950">
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-950">
          <ArrowLeft size={16} />
          Back to Doorin5
        </Link>

        <div className="grid gap-6 lg:grid-cols-[0.72fr_0.28fr]">
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
            {step !== 'success' ? (
              <>
                <div className="mb-6">
                  <p className="text-sm font-bold uppercase tracking-wide text-green-700">Step {currentIndex + 1} of 5</p>
                  <h1 className="mt-2 text-3xl font-black">Book a local delivery</h1>
                  <div className="mt-5 grid grid-cols-5 gap-2">
                    {stepOrder.map((item, index) => (
                      <div
                        key={item}
                        className={`h-2 rounded-full ${index <= currentIndex ? 'bg-green-700' : 'bg-gray-200'}`}
                        aria-label={item}
                      />
                    ))}
                  </div>
                </div>

                {step === 'pickup' && (
                  <div className="space-y-4">
                    <Field label="Pickup instruction" hint="Shop name, restaurant, pharmacy, or 'FC chooses closest open shop'.">
                      <input
                        value={pickupHint}
                        onChange={(event) => setPickupHint(event.target.value)}
                        className="input"
                        placeholder="e.g. Tesco Express, Camden Road"
                      />
                    </Field>
                    <Field label="Pickup address or area" hint="Optional if you want FC to choose the best nearby pickup.">
                      <input
                        value={pickupAddress}
                        onChange={(event) => setPickupAddress(event.target.value)}
                        className="input"
                        placeholder="e.g. High Street, Tunbridge Wells"
                      />
                    </Field>
                  </div>
                )}

                {step === 'delivery' && (
                  <div className="space-y-4">
                    <Field label="Delivery address">
                      <textarea
                        value={dropoffAddress}
                        onChange={(event) => setDropoffAddress(event.target.value)}
                        className="input min-h-28"
                        placeholder="Flat, building, street, and access details"
                      />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Postcode">
                        <input
                          value={postcode}
                          onChange={(event) => setPostcode(event.target.value.toUpperCase())}
                          className="input"
                          placeholder="TN1 1AA"
                        />
                      </Field>
                      <Field label="Delivery urgency">
                        <select value={urgency} onChange={(event) => setUrgency(event.target.value)} className="input">
                          {urgencyOptions.map((option) => (
                            <option key={option}>{option}</option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    {!serviceAreaOk && (
                      <p className="rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-900">
                        Doorin5 is currently focused on TN1, TN2, TN3, TN4, TN9, and TN10.
                      </p>
                    )}
                  </div>
                )}

                {step === 'items' && (
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="grid gap-3 sm:grid-cols-[1fr_90px]">
                          <Field label={`Item ${index + 1}`}>
                            <input
                              value={item.name}
                              onChange={(event) => updateItem(index, { name: event.target.value })}
                              className="input"
                              placeholder="e.g. Milk, prescription pickup, takeaway order"
                            />
                          </Field>
                          <Field label="Qty">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(event) => updateItem(index, { quantity: Number(event.target.value) })}
                              className="input"
                            />
                          </Field>
                        </div>
                        <Field label="Item notes" hint="Brand, size, substitutions, or collection reference.">
                          <input
                            value={item.notes}
                            onChange={(event) => updateItem(index, { notes: event.target.value })}
                            className="input"
                            placeholder="Optional"
                          />
                        </Field>
                        <label className="mt-3 flex items-center gap-3 text-sm font-semibold text-gray-700">
                          <input
                            type="checkbox"
                            checked={item.ageRestricted}
                            onChange={(event) => updateItem(index, { ageRestricted: event.target.checked })}
                          />
                          Age-restricted item
                        </label>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setItems((current) => [...current, { ...blankItem }])}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-bold hover:border-gray-500"
                    >
                      Add another item
                    </button>
                    {ageCheckRequired && (
                      <label className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
                        <input
                          type="checkbox"
                          checked={ageConfirmed}
                          onChange={(event) => setAgeConfirmed(event.target.checked)}
                          className="mt-1"
                        />
                        I understand the driver must check valid photo ID before handing over restricted items.
                      </label>
                    )}
                  </div>
                )}

                {step === 'contact' && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Your name">
                        <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="input" />
                      </Field>
                      <Field label="Phone number">
                        <input
                          value={customerPhone}
                          onChange={(event) => setCustomerPhone(event.target.value)}
                          className="input"
                          placeholder="Mobile preferred"
                        />
                      </Field>
                    </div>
                    <Field label="Email" hint="Optional for demo mode.">
                      <input value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} className="input" />
                    </Field>
                    <Field label="Delivery notes">
                      <textarea
                        value={deliveryNotes}
                        onChange={(event) => setDeliveryNotes(event.target.value)}
                        className="input min-h-28"
                        placeholder="Access code, parking, substitutions, or anything FC should know"
                      />
                    </Field>
                  </div>
                )}

                {step === 'summary' && (
                  <div className="space-y-4">
                    <SummaryRow label="Pickup" value={[pickupHint, pickupAddress].filter(Boolean).join(' | ')} />
                    <SummaryRow label="Delivery" value={`${dropoffAddress} (${postcode})`} />
                    <SummaryRow label="Urgency" value={urgency} />
                    <SummaryRow label="Contact" value={`${customerName} · ${customerPhone}`} />
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <p className="text-sm font-bold text-gray-500">Items</p>
                      <ul className="mt-2 space-y-2">
                        {items
                          .filter((item) => item.name.trim())
                          .map((item, index) => (
                            <li key={`${item.name}-${index}`} className="flex justify-between gap-4 text-sm">
                              <span>
                                {item.name}
                                {item.ageRestricted ? ' (ID check)' : ''}
                              </span>
                              <span className="font-bold">x{item.quantity}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                    {submitError && <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{submitError}</p>}
                  </div>
                )}

                {visibleErrors.length > 0 && (
                  <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700">
                    {visibleErrors.map((error) => (
                      <p key={error}>{error}</p>
                    ))}
                  </div>
                )}

                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(stepOrder[Math.max(0, currentIndex - 1)])}
                    disabled={currentIndex === 0}
                    className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-bold text-gray-700 disabled:opacity-40"
                  >
                    Back
                  </button>
                  {step === 'summary' ? (
                    <button
                      type="button"
                      onClick={submitOrder}
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-5 py-3 font-bold text-white disabled:bg-gray-400"
                    >
                      {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                      Submit order request
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={!canContinue}
                      className="rounded-lg bg-green-700 px-5 py-3 font-bold text-white disabled:bg-gray-400"
                    >
                      Continue
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                <CheckCircle2 className="mx-auto text-green-700" size={54} />
                <h1 className="mt-4 text-3xl font-black">Order request received</h1>
                <p className="mx-auto mt-3 max-w-lg text-gray-700">
                  FC can now review the request, confirm availability, and dispatch a driver. Demo mode keeps this flow
                  working without Supabase.
                </p>
                <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm font-bold text-green-800">Reference: {createdOrderId}</p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link href={`/track/${createdOrderId}`} className="rounded-lg bg-green-700 px-5 py-3 font-bold text-white">
                    Track order
                  </Link>
                  <Link href="/driver" className="rounded-lg bg-gray-950 px-5 py-3 font-bold text-white">
                    Driver board
                  </Link>
                  <Link href="/fc" className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-bold">
                    View FC dashboard
                  </Link>
                </div>
              </div>
            )}
          </section>

          <aside className="h-fit rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-wide text-green-700">Estimate</p>
            <p className="mt-2 text-4xl font-black">{formatMoney(estimatedFee)}</p>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Includes a local delivery fee estimate. FC can confirm unusual pickups, heavy items, or out-of-area
              requests before payment.
            </p>
            <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Local delivery</span>
                <span className="font-bold">{formatMoney(estimatedFee - (ageCheckRequired ? 200 : 0))}</span>
              </div>
              {ageCheckRequired && (
                <div className="mt-2 flex justify-between gap-4">
                  <span className="text-gray-600">ID check</span>
                  <span className="font-bold">{formatMoney(200)}</span>
                </div>
              )}
              <div className="mt-3 border-t border-gray-200 pt-3 text-xs font-semibold text-gray-500">
                Goods are paid or reimbursed separately unless FC confirms a combined checkout.
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <SummaryRow label="Area" value={postcode || 'TN1 demo estimate'} compact />
              <SummaryRow label="Urgency" value={urgency} compact />
              <SummaryRow label="ID check" value={ageCheckRequired ? 'Required' : 'Not required'} compact />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-gray-800">{label}</span>
      {hint && <span className="mt-1 block text-xs font-medium text-gray-500">{hint}</span>}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function SummaryRow({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-gray-50 ${compact ? 'p-3' : 'p-4'}`}>
      <p className="text-sm font-bold text-gray-500">{label}</p>
      <p className="mt-1 whitespace-pre-line font-semibold text-gray-950">{value || 'Not provided yet'}</p>
    </div>
  );
}
