import { assignDriver, DriverProfile } from "../driver-assignment";
import { demoDrivers } from "../mock-drivers";
import { findDemoOrder } from "../mock-orders";

export function assignDemoDriverResponse(input: { orderId?: string; driver?: Partial<DriverProfile> }) {
  const order = findDemoOrder(input.orderId ?? "demo-1001");
  const defaultDriver = demoDrivers[0];
  const driver = { ...defaultDriver, ...input.driver };
  return assignDriver(order, driver);
}
