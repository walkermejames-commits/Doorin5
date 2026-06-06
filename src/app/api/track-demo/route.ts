import { findDemoOrder } from "../../../lib/mock-orders";
import { getOrderPublicSummary } from "../../../lib/order-timeline";
import { jsonOk } from "../../../lib/http";

export async function GET() {
  const order = findDemoOrder("demo-1001");
  return jsonOk(getOrderPublicSummary(order));
}
