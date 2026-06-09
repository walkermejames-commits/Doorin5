import { completeDemoPaymentResponse } from "../../../lib/api/complete-payment";
import { jsonOk } from "../../../lib/http";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return jsonOk(completeDemoPaymentResponse(body), { status: 201 });
}
