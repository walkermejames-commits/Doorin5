import { buildAgeCheck, validateAgeCheck } from "../../../../lib/age-check";
import { jsonError, jsonOk } from "../../../../lib/http";

export async function POST(request: Request) {
  const body = await request.json();
  const errors = validateAgeCheck(body);

  if (errors.length > 0) {
    return jsonError("Verification could not be saved.", 400, errors);
  }

  return jsonOk(buildAgeCheck(body), { status: 201 });
}
