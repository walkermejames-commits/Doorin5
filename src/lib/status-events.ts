import { OrderStatus, nextStatuses, statusLabels } from "./local-delivery";

export type StatusEvent = {
  orderId: string;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  actor: "driver" | "system" | "customer";
  note?: string;
  createdAt: string;
};

export function buildStatusEvent(orderId: string, fromStatus: OrderStatus, actor: StatusEvent["actor"] = "driver"): StatusEvent {
  const toStatus = nextStatuses[fromStatus] ?? fromStatus;
  return {
    orderId,
    fromStatus,
    toStatus,
    actor,
    note: `Moved from ${statusLabels[fromStatus]} to ${statusLabels[toStatus]}`,
    createdAt: new Date().toISOString(),
  };
}

export function canProgress(status: OrderStatus) {
  return Boolean(nextStatuses[status]);
}
