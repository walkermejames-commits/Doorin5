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
      setSelectedItems(selectedItems.filter(i => i !== cat));
    } else {
      setSelectedItems([...selectedItems, cat]);
    }
  };

  const handleCheckout = () => {
    const total = 26 + (selectedItems.length * 2); // mock
    alert(`✅ Order placed! Total ~£${total}. Mock Stripe checkout complete.\n\nDriver has been notified.`);
    // Real Stripe would go here
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-20">
      <h1 className="text-3xl font-bold mb-2">New Delivery</h1>
      <p className="text-gray-600 mb-8">Tunbridge Wells Area</p>

      {step === 1 && (
        <div>
          <label className="block text-sm mb-2">Delivery Address</label>
          <input
            type="text"
            placeholder="e.g. 123 High Street, Tunbridge Wells, TN1 1AA"
            className="w-full p-4 border rounded-2xl mb-6"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <button 
            onClick={() => setStep(2)} 
            disabled={!address}
            className="w-full bg-green-600 disabled:bg-gray-300 text-white py-4 rounded-2xl text-lg"
          >
            Next: Choose Items
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">What do you need?</h2>
          <div className="space-y-3 mb-6">
            {categories.map(cat => (
              <div 
                key={cat.name}
                onClick={() => toggleItem(cat.name)}
                className={`p-4 border rounded-2xl flex justify-between items-center cursor-pointer ${selectedItems.includes(cat.name) ? 'border-green-600 bg-green-50' : ''}`}
              >
                <div>
                  <span className="font-medium">{cat.name}</span>
                  {cat.restricted && <span className="text-red-600 text-sm ml-2">(18+ ID required)</span>}
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedItems.includes(cat.name) ? 'bg-green-600 border-green-600' : 'border-gray-300'}`}>
                  {selectedItems.includes(cat.name) && '✓'}
                </div>
              </div>
            ))}
          </div>

          <textarea
            placeholder="Additional details... e.g. Benson & Hedges Blue, Ham & Cheese no mayo, etc."
            className="w-full h-24 p-4 border rounded-2xl mb-6"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <button 
            onClick={() => {
              if (selectedItems.some(item => categories.find(c => c.name === item)?.restricted)) {
                if (!isAgeConfirmed) {
                  alert("Age-restricted items selected. You must confirm you are 18+.");
                  return;
                }
              }
              setStep(3);
            }}
            className="w-full bg-green-600 text-white py-4 rounded-2xl text-lg"
          >
            Review & Pay
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
          <div className="bg-white p-6 rounded-2xl shadow mb-8 text-left">
            <p><strong>Address:</strong> {address}</p>
            <p className="mt-3"><strong>Items:</strong> {selectedItems.join(', ')}</p>
            {notes && <p className="mt-3"><strong>Notes:</strong> {notes}</p>}
            <div className="border-t my-4"></div>
            <p>Estimated Goods: £18</p>
            <p>Delivery Fee: £5</p>
            <p>Service Fee: £3</p>
            <p className="text-xl font-bold mt-4">Total: £26</p>
          </div>

          <button 
            onClick={handleCheckout}
            className="w-full bg-green-600 text-white py-5 rounded-2xl text-xl font-medium"
          >
            Pay with Stripe &amp; Confirm
          </button>
          
          <button onClick={() => setStep(2)} className="mt-4 text-gray-500">← Back</button>
        </div>
      )}
    </div>
  );
}