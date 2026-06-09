'use client';

import { useState } from 'react';

export default function DriverDashboard() {
  const [orders, setOrders] = useState([
    { id: 1, status: 'paid', address: '123 High St, TN1 1AA', items: 'Cigarettes + Snacks', restricted: true },
  ]);

  const updateStatus = (id: number, newStatus: string) => {
    setOrders(orders.map((order) => (order.id === id ? { ...order, status: newStatus } : order)));
    alert(`Order #${id} -> ${newStatus}`);
  };

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-6">
      <h1 className="mb-6 text-3xl font-bold">Driver Dashboard</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <section key={order.id} className="rounded-3xl border-2 border-gray-200 bg-white p-6">
            <div className="mb-4 flex justify-between gap-4">
              <div>
                <p className="font-semibold">Order #{order.id}</p>
                <p className="text-sm text-gray-600">{order.address}</p>
              </div>
              <span className="h-fit rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700">New</span>
            </div>

            <p>
              <strong>Items:</strong> {order.items}
            </p>

            {order.restricted && <div className="mt-3 text-sm font-medium text-red-600">Age/ID check required</div>}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => updateStatus(order.id, 'accepted')} className="rounded-xl bg-green-600 py-3 text-white">
                Accept
              </button>
              <button onClick={() => updateStatus(order.id, 'shopping')} className="rounded-xl bg-blue-600 py-3 text-white">
                Shopping
              </button>
              <button
                onClick={() => updateStatus(order.id, 'on_the_way')}
                className="rounded-xl bg-purple-600 py-3 text-white"
              >
                On The Way
              </button>
              <button
                onClick={() => updateStatus(order.id, 'delivered')}
                className="rounded-xl bg-emerald-600 py-3 text-white"
              >
                Delivered + ID
              </button>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
