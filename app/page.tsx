'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-green-50 p-4 flex flex-col items-center justify-center text-center">
      <div className="max-w-md w-full">
        <h1 className="text-6xl font-bold text-green-800 mb-2">Doran Local</h1>
        <p className="text-2xl text-green-700 mb-8">Tunbridge Wells Delivery</p>
        
        <div className="space-y-4">
          <Link 
            href="/order" 
            className="block bg-green-600 hover:bg-green-700 text-white px-8 py-6 rounded-2xl text-xl font-medium shadow-lg"
          >
            Place an Order Now
          </Link>
          
          <Link 
            href="/driver" 
            className="block bg-gray-800 hover:bg-gray-900 text-white px-8 py-6 rounded-2xl text-xl font-medium shadow-lg"
          >
            Driver Dashboard
          </Link>
        </div>

        <p className="mt-12 text-sm text-gray-600">
          Fast local delivery • Tunbridge Wells &amp; nearby towns
        </p>
      </div>
    </div>
  );
}