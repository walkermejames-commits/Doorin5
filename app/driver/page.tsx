'use client';

import { useState } from 'react';

export default function DriverDashboard() {
  const [orders, setOrders] = useState([
    { id: 1, status: 'paid', address: '123 High St, TN1 1AA', items: 'Cigarettes + Snacks', restricted: true }
  ]);

  const updateStatus = (id: number, newStatus: string) => {
    setOrders(orders.map(o => o.id === id ? {...o, status: newStatus} : o));
    alert(`Order #${id} → ${newStatus}`);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">🚛 Driver Dashboard</h1>
      
      <div className="space-y-6">
        {orders.map(order => (
          <div key={order.id} className="border-2 border-gray-200 p-6 rounded-3xl bg-white">
            <div className="flex justify-between mb-4">
              <div>
                <p className="font-semibold">Order #{order.id}</p>
                <p className="text-sm text-gray-600">{order.address}</p>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">New</span>
            </div>

            <p><strong>Items:</strong> {order.items}</p>
            
            {order.restricted && (
              <div className="mt-3 text-red-600 text-sm font-medium">⚠️ Age/ID Check Required</div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => updateStatus(order.id, 'accepted')} className="bg-green-600 text-white py-3 rounded-xl">Accept</button>
              <button onClick={() => updateStatus(order.id, 'shopping')} className="bg-blue-600 text-white py-3 rounded-xl">Shopping</button>
              <button onClick={() => updateStatus(order.id, 'on_the_way')} className="bg-purple-600 text-white py-3 rounded-xl">On The Way</button>
              <button onClick={() => updateStatus(order.id, 'delivered')} className="bg-emerald-600 text-white py-3 rounded-xl">Delivered + ID ✅</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}