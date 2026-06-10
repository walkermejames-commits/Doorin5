import { MonitorCheck } from 'lucide-react';

export function DemoModePill({ label = 'Local demo mode' }: { label?: string }) {
  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black uppercase text-emerald-900">
      <MonitorCheck size={15} />
      {label}
    </span>
  );
}
