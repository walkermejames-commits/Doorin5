import { demoOrders } from "./mock-orders";
import { nextStatuses, statusLabels } from "./local-delivery";

export function getDriverDashboardRows() {
  return demoOrders.map((order) => {
    const next = nextStatuses[order.status];
    return {
      id: order.id,
      customerName: order.customerName,
      postcode: order.postcode,
      status: order.status,
      statusLabel: statusLabels[order.status],
      nextStatus: next ?? null,
      nextStatusLabel: next ? statusLabels[next] : null,
      ageCheckRequired: order.ageCheckRequired,
      itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
      estimatedFeePence: order.estimatedFeePence,
    };
  });
}
