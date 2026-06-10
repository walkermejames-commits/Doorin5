import {
  ArrowRight,
  BadgeCheck,
  Bike,
  ClipboardList,
  Clock,
  MapPin,
  PackageCheck,
  Route,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import Link from 'next/link';
import { serviceAreas } from '../lib/local-delivery';

const trustSignals = [
  { label: 'Pilot area', value: 'TN1/TN2/TN4' },
  { label: 'Service window', value: '5pm - 11pm' },
  { label: 'Demo order', value: 'demo-1002' },
];

const demoFlow = [
  {
    href: '/order',
    title: 'Place a request',
    copy: 'Customer flow with pickup, dropoff, items, contact details, and a demo-safe order reference.',
    icon: ClipboardList,
  },
  {
    href: '/fc',
    title: 'Dispatch from FC',
    copy: 'Review payment state, exceptions, active drivers, and assign the next available courier.',
    icon: PackageCheck,
  },
  {
    href: '/driver',
    title: 'Run the delivery',
    copy: 'Accept the job, move through live statuses, open maps, and capture proof of delivery.',
    icon: Bike,
  },
  {
    href: '/track/demo-1002',
    title: 'Track the order',
    copy: 'Show the customer-facing timeline for the demo order without touching real payments.',
    icon: Route,
  },
];

const pricingRows = [
  { label: 'Core Tunbridge Wells run', value: 'from £5.99' },
  { label: 'Wider local run', value: 'from £8.99' },
  { label: 'Restricted-item ID check', value: '+£2.00' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen text-slate-950">
      <section className="relative isolate min-h-[72vh] overflow-hidden">
        <img
          src="/pantiles-hero.jpg"
          alt="The Pantiles in Royal Tunbridge Wells"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/88 via-slate-950/60 to-slate-950/20" />

        <div className="relative mx-auto flex min-h-[72vh] max-w-7xl flex-col justify-end px-4 pb-12 pt-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl pb-6">
            <p className="mb-4 inline-flex items-center gap-2 rounded-lg bg-white/12 px-3 py-2 text-sm font-black uppercase text-emerald-100 ring-1 ring-white/20">
              <MapPin size={16} />
              Tunbridge Wells local courier demo
            </p>
            <h1 className="text-5xl font-black leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
              Doorin5
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-100 sm:text-xl sm:leading-8">
              A polished local-delivery pilot for customer ordering, FC dispatch, driver progress, and customer tracking.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/order"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-6 py-4 font-black text-emerald-950 shadow-lg shadow-emerald-950/20 hover:bg-emerald-400"
              >
                Start demo order
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/track/demo-1002"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/35 bg-white/10 px-6 py-4 font-black text-white backdrop-blur hover:bg-white/18"
              >
                Open demo tracking
                <Route size={18} />
              </Link>
            </div>
          </div>

          <div className="grid max-w-4xl gap-3 sm:grid-cols-3">
            {trustSignals.map((signal) => (
              <div key={signal.label} className="rounded-lg border border-white/18 bg-white/12 p-4 text-white backdrop-blur">
                <p className="text-xs font-black uppercase text-emerald-100">{signal.label}</p>
                <p className="mt-1 text-lg font-black">{signal.value}</p>
              </div>
            ))}
          </div>

          <p className="hero-image-credit mt-4 text-xs font-semibold text-white/75">
            Image: Wikimedia Commons, public domain.
          </p>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-7 sm:grid-cols-3 sm:px-6 lg:px-8">
          <Signal icon={Clock} label="Fast walkthrough" value="Five key routes are ready for demo." />
          <Signal icon={Truck} label="Operational loop" value="Order, dispatch, drive, complete, track." />
          <Signal icon={ShieldCheck} label="Safe mode" value="No real payments or writes required locally." />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-emerald-700">Demo flow</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Everything James needs in one loop.</h2>
          </div>
          <p className="max-w-2xl leading-7 text-slate-600">
            The zip's quick-start structure is now folded into the real app routes, with the current Supabase fallback and
            lifecycle code preserved.
          </p>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {demoFlow.map((item, index) => (
            <Link key={item.href} href={item.href} className="interactive-card surface-card rounded-lg p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white">
                  <item.icon size={21} />
                </span>
                <span className="font-mono text-sm font-black text-slate-400">0{index + 1}</span>
              </div>
              <h3 className="mt-5 text-xl font-black">{item.title}</h3>
              <p className="mt-2 min-h-20 text-sm leading-6 text-slate-600">{item.copy}</p>
              <p className="mt-4 inline-flex items-center gap-2 text-sm font-black text-emerald-800">
                Open route <ArrowRight size={16} />
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-emerald-200">Service area</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">Built for Tunbridge Wells first.</h2>
            <p className="mt-4 leading-7 text-slate-300">
              FC can keep the pilot controlled, price local runs clearly, and manually review wider jobs before payment.
            </p>
            <div className="mt-6 rounded-lg border border-emerald-300/30 bg-emerald-300/10 p-4">
              <p className="flex items-center gap-2 text-sm font-black text-emerald-100">
                <Route size={18} />
                Fastest demo pricing is available for TN1, TN2, and TN4.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {serviceAreas.map((area) => (
              <div key={area} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/8 p-4">
                <BadgeCheck className="text-emerald-300" size={20} />
                <span className="font-bold">{area}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
        <div className="surface-card rounded-lg p-6">
          <p className="text-sm font-black uppercase tracking-wide text-emerald-700">Pricing</p>
          <h2 className="mt-2 text-3xl font-black">Simple fees before FC confirms.</h2>
          <div className="mt-5 divide-y divide-slate-100 rounded-lg border border-slate-200">
            {pricingRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 p-4">
                <span className="font-bold text-slate-700">{row.label}</span>
                <span className="font-black">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card rounded-lg p-6">
          <p className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-amber-700">
            <Sparkles size={17} />
            Demo access
          </p>
          <h2 className="mt-2 text-3xl font-black">Ready to run locally.</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <CodeBlock label="FC code" value="fc-demo" />
            <CodeBlock label="Driver code" value="driver-demo" />
          </div>
        </div>
      </section>
    </main>
  );
}

function Signal({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-900">
        <Icon size={21} />
      </span>
      <span>
        <span className="block text-sm font-black text-slate-950">{label}</span>
        <span className="block text-sm font-semibold text-slate-500">{value}</span>
      </span>
    </div>
  );
}

function CodeBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
      <code className="mt-2 block rounded-lg bg-white px-3 py-2 font-mono text-sm font-black text-slate-950">{value}</code>
    </div>
  );
}
