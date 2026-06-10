import { DeliveryOrder, OrderStatus } from "./local-delivery";
import { buildStatusEvent } from "./status-events";
import { driverAssignedEntry } from "./event-log";

export type DriverProfile = {
  id: string;
  name: string;
  status?: "pending" | "approved" | "active" | "paused" | "rejected";
  available?: boolean;
  activeJobs?: number;
};

export type AssignDriverResult = {
  order: DeliveryOrder & { driverId: string; driverName: string };
  statusEvent: ReturnType<typeof buildStatusEvent>;
  eventLogEntry: ReturnType<typeof driverAssignedEntry>;
};

const assignableStatuses: OrderStatus[] = ["paid"];

export function canAssignDriver(order: Pick<DeliveryOrder, "status">, driver: DriverProfile) {
  if (!assignableStatuses.includes(order.status)) {
    return { ok: false, reason: "Order must be paid before driver assignment." };
  }

  if (driver.status && !["approved", "active", "pending"].includes(driver.status)) {
    return { ok: false, reason: "Driver is not eligible for assignment." };
  }

  if (driver.available === false) {
    return { ok: false, reason: "Driver is not currently available." };
  }

  return { ok: true, reason: null };
}

export function assignDriver(order: DeliveryOrder, driver: DriverProfile): AssignDriverResult {
  const allowed = canAssignDriver(order, driver);
  if (!allowed.ok) throw new Error(allowed.reason ?? "Could not assign driver.");

  const assignedOrder = {
    ...order,
    status: "assigned" as OrderStatus,
    driverId: driver.id,
    driverName: driver.name,
  };

  return {
    order: assignedOrder,
    statusEvent: buildStatusEvent(order.id, order.status, "fc"),
    eventLogEntry: driverAssignedEntry(order.id, driver.id),
  };
}
