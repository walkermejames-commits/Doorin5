import { CircleAlert } from 'lucide-react';

export function DemoBanner() {
  return (
    <div className="bg-emerald-950 px-3 py-2 text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-2 text-center text-xs font-bold uppercase leading-5 tracking-wide sm:text-sm">
        <CircleAlert size={16} className="shrink-0" />
        <span>Demo mode: no real payments</span>
      </div>
    </div>
  );
}
