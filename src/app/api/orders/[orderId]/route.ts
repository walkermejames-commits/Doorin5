import { isDemoMode } from "../../../../lib/demo-mode";
import { jsonError, jsonOk } from "../../../../lib/http";
import { findDemoOrder } from "../../../../lib/mock-orders";
import { getOrderById } from "../../../../lib/order-repository";
import { getOrderPublicSummary } from "../../../../lib/order-timeline";

export async function GET(_request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  if (isDemoMode()) {
    return jsonOk({ mode: "demo", ...getOrderPublicSummary(findDemoOrder(orderId)) });
  }

  try {
    const order = await getOrderById(orderId);
    return jsonOk({ mode: "supabase", ...getOrderPublicSummary(order) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Order could not be found.";
    return jsonError(message, 404);
  }
}
