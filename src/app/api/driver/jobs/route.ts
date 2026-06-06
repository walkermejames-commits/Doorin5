import { demoOrders } from "../../../../lib/mock-orders";
import { getDriverDashboardRows } from "../../../../lib/demo-dashboard";
import { jsonOk } from "../../../../lib/http";

export async function GET() {
  return jsonOk({
    orders: demoOrders,
    dashboard: getDriverDashboardRows(),
  });
}
