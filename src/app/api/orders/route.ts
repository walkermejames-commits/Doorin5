import { buildDraftOrder, validateOrderInput } from "../../../lib/order-actions";
import { jsonError, jsonOk } from "../../../lib/http";

export async function POST(request: Request) {
  const body = await request.json();
  const errors = validateOrderInput(body);

  if (errors.length > 0) {
    return jsonError("Order could not be created.", 400, errors);
  }

  const order = buildDraftOrder(body);
  return jsonOk({ ...order, status: "paid" }, { status: 201 });
}
