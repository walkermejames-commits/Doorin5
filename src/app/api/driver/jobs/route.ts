import { demoOrders } from "../../../../lib/mock-orders";
import { getDriverDashboardRows } from "../../../../lib/demo-dashboard";
import { jsonError, jsonOk } from "../../../../lib/http";
import { isDemoMode } from "../../../../lib/demo-mode";
import { listOpenOrders } from "../../../../lib/order-repository";

export async function GET() {
  if (isDemoMode()) {
    return jsonOk({
      mode: "demo",
      orders: demoOrders,
      dashboard: getDriverDashboardRows(),
    });
  }

  try {
    const orders = await listOpenOrders();
    return jsonOk({ mode: "supabase", orders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Supabase error";
    return jsonError(message, 500);
  }
}
