import { buildStatusEvent } from "../../../../lib/status-events";
import { progressStatus } from "../../../../lib/order-actions";
import { jsonError, jsonOk } from "../../../../lib/http";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.orderId || !body.status) {
    return jsonError("orderId and status are required.");
  }

  const nextStatus = progressStatus(body.status);
  const event = buildStatusEvent(body.orderId, body.status);

  return jsonOk({
    orderId: body.orderId,
    status: nextStatus,
    event,
  });
}
