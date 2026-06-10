import type { LucideIcon } from "lucide-react";

export function MetricCard({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="surface-card rounded-2xl p-5">
      <Icon className="text-[#0f6b4f]" size={22} />
      <p className="mt-4 text-sm font-bold text-[#726456]">{label}</p>
      <p className="mt-1 text-3xl font-black text-[#241124]">{value}</p>
    </div>
  );
}
