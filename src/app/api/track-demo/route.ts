import { findDemoOrder } from "../../../lib/mock-orders";
import { getOrderPublicSummary } from "../../../lib/order-timeline";
import { jsonOk } from "../../../lib/http";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const order = findDemoOrder(url.searchParams.get("orderId") ?? "demo-1001");
  return jsonOk(getOrderPublicSummary(order));
}
