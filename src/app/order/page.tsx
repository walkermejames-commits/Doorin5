'use client';

import { useState } from 'react';

const categories = [
  { name: 'Snacks', restricted: false },
  { name: 'Alcohol', restricted: true },
  { name: 'Cigarettes', restricted: true },
  { name: 'Sandwiches', restricted: false },
  { name: 'Supermarket', restricted: false },
  { name: 'Pharmacy', restricted: false },
  { name: 'Takeaway', restricted: false },
  { name: 'Household', restricted: false },
];

export default function OrderPage() {
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);

  const toggleItem = (cat: string) => {
    if (selectedItems.includes(cat)) {
      setSelectedItems(selectedItems.filter((item) => item !== cat));
    } else {
      setSelectedItems([...selectedItems, cat]);
    }
  };

  const handleCheckout = () => {
    const total = 26 + selectedItems.length * 2;
    alert(`Order placed. Total ~£${total}. Mock Stripe checkout complete.\n\nDriver has been notified.`);
  };

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-6 pb-20">
      <h1 className="mb-2 text-3xl font-bold">New Delivery</h1>
      <p className="mb-8 text-gray-600">Tunbridge Wells Area</p>

      {step === 1 && (
        <section>
          <label className="mb-2 block text-sm" htmlFor="address">
            Delivery Address
          </label>
          <input
            id="address"
            type="text"
            placeholder="e.g. 123 High Street, Tunbridge Wells, TN1 1AA"
            className="mb-6 w-full rounded-2xl border p-4"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />
          <button
            onClick={() => setStep(2)}
            disabled={!address}
            className="w-full rounded-2xl bg-green-600 py-4 text-lg text-white disabled:bg-gray-300"
          >
            Next: Choose Items
          </button>
        </section>
      )}

      {step === 2 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">What do you need?</h2>
          <div className="mb-6 space-y-3">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat.name}
                onClick={() => toggleItem(cat.name)}
                className={`flex w-full cursor-pointer items-center justify-between rounded-2xl border p-4 text-left ${
                  selectedItems.includes(cat.name) ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-white'
                }`}
              >
                <span>
                  <span className="font-medium">{cat.name}</span>
                  {cat.restricted && <span className="ml-2 text-sm text-red-600">(18+ ID required)</span>}
                </span>
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                    selectedItems.includes(cat.name) ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300'
                  }`}
                >
                  {selectedItems.includes(cat.name) && '✓'}
                </span>
              </button>
            ))}
          </div>

          {selectedItems.some((item) => categories.find((cat) => cat.name === item)?.restricted) && (
            <label className="mb-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <input
                type="checkbox"
                checked={isAgeConfirmed}
                onChange={(event) => setIsAgeConfirmed(event.target.checked)}
                className="mt-1"
              />
              I am 18 or over and can show ID at delivery.
            </label>
          )}

          <textarea
            placeholder="Additional details... e.g. brand, shop preference, substitutions"
            className="mb-6 h-24 w-full rounded-2xl border p-4"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />

          <button
            onClick={() => {
              if (
                selectedItems.some((item) => categories.find((cat) => cat.name === item)?.restricted) &&
                !isAgeConfirmed
              ) {
                alert('Age-restricted items selected. You must confirm you are 18+.');
                return;
              }
              setStep(3);
            }}
            disabled={selectedItems.length === 0}
            className="w-full rounded-2xl bg-green-600 py-4 text-lg text-white disabled:bg-gray-300"
          >
            Review & Pay
          </button>
        </section>
      )}

      {step === 3 && (
        <section className="text-center">
          <h2 className="mb-6 text-2xl font-bold">Order Summary</h2>
          <div className="mb-8 rounded-2xl bg-white p-6 text-left shadow">
            <p>
              <strong>Address:</strong> {address}
            </p>
            <p className="mt-3">
              <strong>Items:</strong> {selectedItems.join(', ')}
            </p>
            {notes && (
              <p className="mt-3">
                <strong>Notes:</strong> {notes}
              </p>
            )}
            <div className="my-4 border-t" />
            <p>Estimated Goods: £18</p>
            <p>Delivery Fee: £5</p>
            <p>Service Fee: £3</p>
            <p className="mt-4 text-xl font-bold">Total: £26</p>
          </div>

          <button onClick={handleCheckout} className="w-full rounded-2xl bg-green-600 py-5 text-xl font-medium text-white">
            Pay with Stripe & Confirm
          </button>

          <button onClick={() => setStep(2)} className="mt-4 text-gray-500">
            Back
          </button>
        </section>
      )}
    </main>
  );
}
