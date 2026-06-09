import { ArrowRight, BadgeCheck, Clock, MapPin, ShieldCheck, Truck } from 'lucide-react';
import Link from 'next/link';
import { serviceAreas } from '../lib/local-delivery';

const trustSignals = [
  { label: 'Local FC dispatch', value: 'Human checked' },
  { label: 'Service window', value: '5pm - 11pm' },
  { label: 'Age checks', value: 'ID required' },
];

const services = ['Shop runs', 'Takeaway pickup', 'Pharmacy essentials', 'Restricted items with ID checks'];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f6f7f2] text-gray-950">
      <header className="border-b border-gray-200 bg-white/85 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-3 font-black tracking-tight">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-950 text-white">FC</span>
            <span>Doorin5</span>
          </Link>
          <div className="hidden items-center gap-5 text-sm font-semibold text-gray-600 sm:flex">
            <Link href="/order" className="hover:text-gray-950">
              Order
            </Link>
            <Link href="/driver" className="hover:text-gray-950">
              Driver
            </Link>
            <Link href="/fc" className="hover:text-gray-950">
              FC dashboard
            </Link>
          </div>
        </nav>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-10 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:py-16">
        <div className="flex flex-col justify-center">
          <p className="mb-4 flex w-fit items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-800">
            <MapPin size={16} />
            Tunbridge Wells courier MVP
          </p>
          <h1 className="max-w-3xl text-5xl font-black leading-tight sm:text-6xl">
            Fast local pickup and delivery, coordinated by FC.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-700">
            Doorin5 helps customers request essentials, food, pharmacy items, and local pickups with a clear dispatcher,
            a real driver workflow, and demo-safe order tracking.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/order"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-6 py-4 font-bold text-white shadow-sm hover:bg-green-800"
            >
              Book a delivery
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/fc"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-4 font-bold text-gray-900 hover:border-gray-400"
            >
              View FC dashboard
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {trustSignals.map((signal) => (
              <div key={signal.label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-gray-500">{signal.label}</p>
                <p className="mt-1 text-lg font-black text-gray-950">{signal.value}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-2xl bg-gray-950 p-6 text-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div>
              <p className="text-sm font-semibold text-green-200">Live MVP mode</p>
              <h2 className="text-2xl font-black">Tonight's courier board</h2>
            </div>
            <span className="rounded-full bg-green-400 px-3 py-1 text-sm font-bold text-gray-950">Taking orders</span>
          </div>

          <div className="mt-6 grid gap-4">
            <div className="rounded-lg bg-white/10 p-4">
              <p className="flex items-center gap-2 text-sm text-gray-300">
                <Clock size={16} />
                Average response
              </p>
              <p className="mt-1 text-2xl font-black">Under 5 min</p>
            </div>
            <div className="rounded-lg bg-white/10 p-4">
              <p className="flex items-center gap-2 text-sm text-gray-300">
                <Truck size={16} />
                Best for
              </p>
              <p className="mt-1 font-semibold">{services.join(' · ')}</p>
            </div>
            <div className="rounded-lg bg-white/10 p-4">
              <p className="flex items-center gap-2 text-sm text-gray-300">
                <ShieldCheck size={16} />
                Customer safeguards
              </p>
              <p className="mt-1 font-semibold">Status updates, ID checks, proof of delivery placeholder.</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="border-y border-gray-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-[0.85fr_1.15fr] md:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-green-700">Service area</p>
            <h2 className="mt-2 text-3xl font-black">Built for Tunbridge Wells first.</h2>
            <p className="mt-4 leading-7 text-gray-700">
              Doorin5 starts small so FC can manually dispatch orders, protect service quality, and learn which local
              runs customers actually need.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {serviceAreas.map((area) => (
              <div key={area} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-[#f6f7f2] p-4">
                <BadgeCheck className="text-green-700" size={20} />
                <span className="font-semibold">{area}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
