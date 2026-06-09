import Link from 'next/link';

const steps = ['Tell us what you need', 'A local driver shops nearby', 'Track delivery to your door'];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f6f7f2] text-gray-950">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-10 md:grid-cols-[1.08fr_0.92fr] md:px-8">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-green-700">Tunbridge Wells local delivery</p>
          <h1 className="max-w-3xl text-5xl font-bold leading-tight sm:text-6xl">Doorin5 gets essentials to your door fast.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-700">
            A simple single-driver MVP for groceries, pharmacy runs, takeaway pickups, and restricted-item deliveries
            with clear ID checks.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/order"
              className="inline-flex items-center justify-center rounded-lg bg-green-700 px-6 py-4 font-semibold text-white shadow-sm hover:bg-green-800"
            >
              Place an order
            </Link>
            <Link
              href="/driver"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-4 font-semibold text-gray-900 hover:border-gray-400"
            >
              Driver dashboard
            </Link>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step} className="rounded-lg border border-green-100 bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-green-700">0{index + 1}</p>
                <p className="mt-2 text-sm font-medium text-gray-800">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-2xl bg-gray-950 p-6 text-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div>
              <p className="text-sm text-green-200">Live demo board</p>
              <h2 className="text-2xl font-bold">Tonight's run</h2>
            </div>
            <span className="rounded-full bg-green-400 px-3 py-1 text-sm font-semibold text-gray-950">Open</span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-lg bg-white/10 p-4">
              <p className="text-sm text-gray-300">Order window</p>
              <p className="mt-1 text-xl font-semibold">5pm - 11pm</p>
            </div>
            <div className="rounded-lg bg-white/10 p-4">
              <p className="text-sm text-gray-300">Service area</p>
              <p className="mt-1 text-xl font-semibold">Tunbridge Wells + nearby towns</p>
            </div>
            <div className="rounded-lg bg-white/10 p-4">
              <p className="text-sm text-gray-300">Demo flow</p>
              <p className="mt-1 text-xl font-semibold">Order, checkout, dispatch, complete</p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
