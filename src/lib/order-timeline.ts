import { DeliveryOrder, OrderStatus, statusLabels } from "./local-delivery";

const steps: OrderStatus[] = ["draft", "assigned", "accepted", "shopping", "collected", "en_route", "delivered", "completed"];

export function getOrderTimeline(order: DeliveryOrder) {
  const currentIndex = steps.indexOf(order.status);
  return steps.map((status, index) => ({
    status,
    label: statusLabels[status],
    done: currentIndex >= index,
    active: currentIndex === index,
  }));
}

export function getOrderPublicSummary(order: DeliveryOrder) {
  return {
    id: order.id,
    customerName: order.customerName,
    postcode: order.postcode,
    status: order.status,
    statusLabel: statusLabels[order.status],
    timeline: getOrderTimeline(order),
    ageCheckRequired: order.ageCheckRequired,
  };
}
