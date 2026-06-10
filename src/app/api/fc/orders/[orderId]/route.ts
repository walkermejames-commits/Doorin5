import { isDemoMode } from "../../../../../lib/demo-mode";
import { jsonError, jsonOk } from "../../../../../lib/http";
import { findDemoOrder } from "../../../../../lib/mock-orders";
import { cancelOrderByFc, startFcReview } from "../../../../../lib/order-repository";

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const body = await request.json().catch(() => ({}));
  const action = body.action as string | undefined;

  if (isDemoMode()) {
    const order = findDemoOrder(orderId);
    if (action === "start_review") return jsonOk({ mode: "demo", order: { ...order, status: "fc_reviewing" } });
    if (action === "cancel") return jsonOk({ mode: "demo", order: { ...order, status: "cancelled" } });
    return jsonError("Unsupported FC action.", 400);
  }

  try {
    if (action === "start_review") {
      const order = await startFcReview(orderId);
      return jsonOk({ mode: "supabase", order });
    }

    if (action === "cancel") {
      const order = await cancelOrderByFc(orderId, body.note);
      return jsonOk({ mode: "supabase", order });
    }

    return jsonError("Unsupported FC action.", 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "FC action failed.";
    return jsonError(message, 400);
  }
}
