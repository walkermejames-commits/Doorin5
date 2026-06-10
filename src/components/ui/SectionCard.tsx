import type { ReactNode } from "react";

export function SectionCard({ title, intro, children, aside }: { title?: string; intro?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="surface-card rounded-2xl p-5 sm:p-6">
      {(title || intro || aside) && (
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            {title && <h2 className="text-xl font-black text-[#241124]">{title}</h2>}
            {intro && <p className="mt-1 text-sm leading-6 text-[#726456]">{intro}</p>}
          </div>
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}
