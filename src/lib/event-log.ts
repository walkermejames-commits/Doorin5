export type EventLogEntry = {
  actor: "system" | "driver" | "customer" | "fc";
  action: string;
  targetType: "order" | "payment" | "driver" | "link";
  targetId: string;
  details?: Record<string, unknown>;
  createdAt: string;
};

export function buildEventLogEntry(input: Omit<EventLogEntry, "createdAt">): EventLogEntry {
  return {
    ...input,
    createdAt: new Date().toISOString(),
  };
}

export function paymentConfirmedEntry(orderId: string, details: Record<string, unknown> = {}) {
  return buildEventLogEntry({
    actor: "system",
    action: "payment_confirmed",
    targetType: "order",
    targetId: orderId,
    details,
  });
}

export function driverAssignedEntry(orderId: string, driverId: string) {
  return buildEventLogEntry({
    actor: "fc",
    action: "driver_assigned",
    targetType: "order",
    targetId: orderId,
    details: { driverId },
  });
}
