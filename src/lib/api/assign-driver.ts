import { assignDriver, DriverProfile } from "../driver-assignment";
import { findDemoOrder } from "../mock-orders";

const defaultDriver: DriverProfile = {
  id: "demo-driver-1",
  name: "Doorin5 Driver",
  status: "active",
  available: true,
  activeJobs: 0,
};

export function assignDemoDriverResponse(input: { orderId?: string; driver?: Partial<DriverProfile> }) {
  const order = findDemoOrder(input.orderId ?? "demo-1001");
  const driver = { ...defaultDriver, ...input.driver };
  return assignDriver(order, driver);
}
