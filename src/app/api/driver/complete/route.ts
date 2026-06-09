import { buildDeliveryProof, validateDeliveryProof } from "../../../../lib/delivery-proof";
import { isDemoMode } from "../../../../lib/demo-mode";
import { jsonError, jsonOk } from "../../../../lib/http";
import { completeDeliveryInSupabase } from "../../../../lib/order-repository";

export async function POST(request: Request) {
  const body = await request.json();
  const errors = validateDeliveryProof(body);

  if (errors.length > 0) {
    return jsonError("Completion details could not be saved.", 400, errors);
  }

  if (isDemoMode()) {
    return jsonOk({ mode: "demo", ...buildDeliveryProof(body) }, { status: 201 });
  }

  try {
    const result = await completeDeliveryInSupabase(body);
    return jsonOk({ mode: "supabase", ...result.proof, order: result.order }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Completion details could not be saved.";
    return jsonError(message, 400);
  }
}
