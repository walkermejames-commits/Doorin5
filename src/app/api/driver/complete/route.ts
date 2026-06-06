import { buildDeliveryProof, validateDeliveryProof } from "../../../../lib/delivery-proof";
import { jsonError, jsonOk } from "../../../../lib/http";

export async function POST(request: Request) {
  const body = await request.json();
  const errors = validateDeliveryProof(body);

  if (errors.length > 0) {
    return jsonError("Completion details could not be saved.", 400, errors);
  }

  return jsonOk(buildDeliveryProof(body), { status: 201 });
}
