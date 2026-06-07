import { getOperationsSummary } from "../operations-board";
import { demoOrders } from "../mock-orders";
import { DriverProfile } from "../driver-assignment";

const demoDrivers: DriverProfile[] = [
  {
    id: "demo-driver-1",
    name: "Doorin5 Driver",
    status: "active",
    available: true,
    activeJobs: 1,
  },
];

export function operationsSummaryResponse() {
  return getOperationsSummary(demoOrders, demoDrivers);
}
