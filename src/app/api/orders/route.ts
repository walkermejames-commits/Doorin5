import { buildDraftOrder, validateOrderInput } from "../../../lib/order-actions";
import { jsonError, jsonOk } from "../../../lib/http";
import { isDemoMode } from "../../../lib/demo-mode";
import { createOrderWithItems } from "../../../lib/order-repository";

export async function POST(request: Request) {
  const body = await request.json();
  const errors = validateOrderInput(body);

  if (errors.length > 0) {
    return jsonError("Order could not be created.", 400, errors);
  }

  if (isDemoMode()) {
    const order = buildDraftOrder(body);
    return jsonOk({ mode: "demo", order }, { status: 201 });
  }

  try {
    const order = await createOrderWithItems(body);
    return jsonOk({ mode: "supabase", order }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Supabase error";
    return jsonError(message, 500);
  }
}
