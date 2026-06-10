import { operationsSummaryResponse } from "../../../../lib/api/operations-summary";
import { isDemoMode } from "../../../../lib/demo-mode";
import { jsonError, jsonOk } from "../../../../lib/http";
import { demoDrivers } from "../../../../lib/mock-drivers";
import { demoOrders } from "../../../../lib/mock-orders";
import { getOperationsSummary } from "../../../../lib/operations-board";
import { listDriverProfiles, listOperationalOrders } from "../../../../lib/order-repository";

export async function GET() {
  if (isDemoMode()) {
    const summary = operationsSummaryResponse();
    return jsonOk({
      mode: "demo",
      summary,
      orders: demoOrders,
      drivers: demoDrivers,
      queues: buildQueues(demoOrders),
    });
  }

  try {
    const [orders, drivers] = await Promise.all([listOperationalOrders(), listDriverProfiles()]);
    const summary = getOperationsSummary(orders, drivers);
    return jsonOk({ mode: "supabase", summary, orders, drivers, queues: buildQueues(orders) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load operations summary.";
    return jsonError(message, 500);
  }
}

function buildQueues(orders: Array<{ status: string; driverId?: string | null; driverName?: string | null }>) {
  return {
    newRequests: orders.filter((order) => ["request_submitted", "fc_reviewing"].includes(order.status)).length,
    quoteSent: orders.filter((order) => order.status === "quote_sent").length,
    paidReady: orders.filter((order) => order.status === "paid" && !order.driverId && !order.driverName).length,
    unassigned: orders.filter((order) => order.status === "paid" && !order.driverId && !order.driverName).length,
    active: orders.filter((order) => ["assigned", "accepted", "shopping", "collected", "en_route", "delivered"].includes(order.status)).length,
    completed: orders.filter((order) => order.status === "completed").length,
  };
}
