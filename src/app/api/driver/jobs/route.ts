import { demoOrders } from "../../../../lib/mock-orders";
import { getDriverDashboardRows } from "../../../../lib/demo-dashboard";
import { jsonError, jsonOk } from "../../../../lib/http";
import { isDemoMode } from "../../../../lib/demo-mode";
import { listDriverJobs, listDriverProfiles } from "../../../../lib/order-repository";

export async function GET(request: Request) {
  if (isDemoMode()) {
    return jsonOk({
      mode: "demo",
      orders: demoOrders,
      dashboard: getDriverDashboardRows(),
    });
  }

  try {
    const url = new URL(request.url);
    const driverId = url.searchParams.get("driverId") ?? undefined;
    const [orders, drivers] = await Promise.all([listDriverJobs(driverId), listDriverProfiles()]);
    return jsonOk({ mode: "supabase", orders, drivers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Supabase error";
    return jsonError(message, 500);
  }
}
