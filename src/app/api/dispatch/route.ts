import { assignDemoDriverResponse } from "../../../lib/api/assign-driver";
import { isDemoMode } from "../../../lib/demo-mode";
import { jsonError, jsonOk } from "../../../lib/http";
import { assignDriverToOrder } from "../../../lib/order-repository";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  try {
    if (isDemoMode()) {
      return jsonOk({ mode: "demo", ...assignDemoDriverResponse(body) }, { status: 201 });
    }

    const order = await assignDriverToOrder({
      orderId: body.orderId,
      driverId: body.driverId ?? body.driver?.id,
      driverName: body.driverName ?? body.driver?.name,
    });

    return jsonOk({ mode: "supabase", order }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not dispatch job.";
    return jsonError(message, 400);
  }
}
