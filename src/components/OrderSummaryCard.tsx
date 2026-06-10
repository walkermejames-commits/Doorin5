import { DeliveryOrder, formatMoney, statusLabels } from "../lib/local-delivery";

export function OrderSummaryCard({ order }: { order: DeliveryOrder }) {
  return (
    <article className="rounded-2xl border border-[#eadfce] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#726456]">{order.id}</p>
          <h2 className="text-xl font-black text-[#241124]">{order.customerName}</h2>
          <p className="mt-1 text-sm text-[#726456]">{order.dropoffAddress}</p>
        </div>
        <span className="rounded-full bg-[#241124] px-3 py-1 text-xs font-bold text-white">
          {statusLabels[order.status]}
        </span>
      </div>

      <ul className="mt-4 space-y-2 text-sm text-[#4f4050]">
        {order.items.map((item) => (
          <li key={`${order.id}-${item.name}`} className="flex justify-between gap-4 rounded-xl bg-[#fff8ec] px-3 py-2">
            <span>{item.name}</span>
            <span className="font-bold">x{item.quantity}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-sm text-[#726456]">{order.quote ? "Quote total" : "Awaiting FC quote"}</span>
        <span className="font-black text-[#241124]">{order.quote ? formatMoney(order.quote.totalPence) : "Not priced yet"}</span>
      </div>

      {order.ageCheckRequired ? (
        <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
          Age check required before handover.
        </p>
      ) : null}
    </article>
  );
}
