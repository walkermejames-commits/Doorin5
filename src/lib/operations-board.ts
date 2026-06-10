import { DeliveryOrder, formatMoney, isDispatchable, statusLabels } from "./local-delivery";
import { DriverProfile } from "./driver-assignment";

export type OperationsJobCard = {
  id: string;
  customerName: string;
  postcode: string;
  statusLabel: string;
  feeLabel: string;
  ageCheckRequired: boolean;
  assignedDriverName: string | null;
  itemCount: number;
};

export function toOperationsJobCard(order: DeliveryOrder & { driverName?: string | null }): OperationsJobCard {
  return {
    id: order.id,
    customerName: order.customerName,
    postcode: order.postcode,
    statusLabel: statusLabels[order.status],
    feeLabel: order.quote ? formatMoney(order.quote.totalPence) : "Awaiting quote",
    ageCheckRequired: order.ageCheckRequired,
    assignedDriverName: order.driverName ?? null,
    itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
  };
}

export function getOperationsSummary(orders: Array<DeliveryOrder & { driverId?: string | null; driverName?: string | null }>, drivers: DriverProfile[] = []) {
  const paidOrders = orders.filter((order) => ["paid", "assigned", "accepted", "shopping", "collected", "en_route", "delivered"].includes(order.status));
  const assignedOrders = orders.filter((order) => Boolean(order.driverId));
  const unassignedPaidOrders = paidOrders.filter((order) => isDispatchable(order));
  const quotedRevenue = orders.reduce((total, order) => total + (order.quote?.totalPence ?? 0), 0);

  return {
    visibleJobs: orders.length,
    paidCount: paidOrders.length,
    assignedCount: assignedOrders.length,
    unassignedPaidCount: unassignedPaidOrders.length,
    totalEstimatedFeesPence: quotedRevenue,
    totalEstimatedFeesLabel: formatMoney(quotedRevenue),
    availableDrivers: drivers.filter((driver) => driver.available !== false).length,
    busyDrivers: drivers.filter((driver) => (driver.activeJobs ?? 0) > 0).length,
    cards: orders.map(toOperationsJobCard),
  };
}
