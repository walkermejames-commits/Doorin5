import { createMockCheckoutSession } from "../../../lib/checkout";
import { findDemoOrder } from "../../../lib/mock-orders";
import { jsonError, jsonOk } from "../../../lib/http";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.orderId) {
    return jsonError("orderId is required.");
  }

  const order = findDemoOrder(body.orderId);
  return jsonOk(createMockCheckoutSession(order), { status: 201 });
}
