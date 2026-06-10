import type { ReactNode } from "react";

export function PageShell({ eyebrow, title, intro, children }: { eyebrow?: string; title: string; intro?: string; children: ReactNode }) {
  return (
    <main className="min-h-screen text-[#241124]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-6 rounded-3xl bg-[#241124] p-6 text-[#fff8ec] shadow-xl shadow-[#241124]/10 sm:p-8">
          {eyebrow && <p className="text-sm font-black uppercase tracking-wide text-[#f1c979]">{eyebrow}</p>}
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">{title}</h1>
          {intro && <p className="mt-3 max-w-3xl text-sm leading-6 text-[#f8ead5] sm:text-base">{intro}</p>}
        </section>
        {children}
      </div>
    </main>
  );
}
