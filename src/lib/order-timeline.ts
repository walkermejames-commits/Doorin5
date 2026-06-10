import { DeliveryOrder, OrderStatus, customerLifecycle, statusLabels } from "./local-delivery";

function effectiveTimelineStatus(order: DeliveryOrder, step: OrderStatus) {
  if (step === "paid") return order.status === "payment_pending" ? "payment_pending" : order.status;
  if (step === "shopping") return ["accepted", "shopping", "collected"].includes(order.status) ? "shopping" : order.status;
  return order.status;
}

export function getOrderTimeline(order: DeliveryOrder) {
  const currentStatus = order.status === "quote_accepted" ? "payment_pending" : order.status;
  const currentIndex = customerLifecycle.findIndex((step) => effectiveTimelineStatus(order, step) === step || step === currentStatus);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;

  return customerLifecycle.map((status, index) => ({
    status,
    label: statusLabels[status],
    done: safeIndex >= index && !["quote_rejected", "quote_expired", "cancelled"].includes(order.status),
    active: safeIndex === index && !["quote_rejected", "quote_expired", "cancelled"].includes(order.status),
  }));
}

export function getOrderPublicSummary(order: DeliveryOrder) {
  return {
    id: order.id,
    customerName: order.customerName,
    postcode: order.postcode,
    status: order.status,
    paymentStatus: order.paymentStatus ?? "unpaid",
    statusLabel: statusLabels[order.status],
    timeline: getOrderTimeline(order),
    ageCheckRequired: order.ageCheckRequired,
    quote: order.quote ?? null,
  };
}
