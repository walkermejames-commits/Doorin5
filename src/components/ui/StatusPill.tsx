import { statusLabels, type OrderStatus, quoteStatusLabels, type QuoteStatus } from "../../lib/local-delivery";

export function StatusPill({ status, label }: { status?: OrderStatus | QuoteStatus | string; label?: string }) {
  const display = label ?? (status && status in statusLabels ? statusLabels[status as OrderStatus] : status && status in quoteStatusLabels ? quoteStatusLabels[status as QuoteStatus] : status);
  return (
    <span className="inline-flex w-fit items-center rounded-full border border-[#d8cdbd] bg-[#fff8ec] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#0f6b4f]">
      {display}
    </span>
  );
}
