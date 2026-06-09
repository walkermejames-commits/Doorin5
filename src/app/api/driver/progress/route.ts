import { buildStatusEvent } from "../../../../lib/status-events";
import { isDemoMode } from "../../../../lib/demo-mode";
import { progressStatus } from "../../../../lib/order-actions";
import { jsonError, jsonOk } from "../../../../lib/http";
import { progressOrderInSupabase } from "../../../../lib/order-repository";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.orderId || !body.status) {
    return jsonError("orderId and status are required.");
  }

  if (isDemoMode()) {
    const nextStatus = progressStatus(body.status);
    const event = buildStatusEvent(body.orderId, body.status);

    return jsonOk({
      mode: "demo",
      orderId: body.orderId,
      status: nextStatus,
      event,
    });
  }

  try {
    const order = await progressOrderInSupabase({ orderId: body.orderId, actor: "driver" });
    return jsonOk({ mode: "supabase", orderId: order.id, status: order.status, order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update status.";
    return jsonError(message, 400);
  }
}
