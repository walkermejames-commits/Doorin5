import { assignDemoDriverResponse } from "../../../lib/api/assign-driver";
import { jsonError, jsonOk } from "../../../lib/http";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  try {
    return jsonOk(assignDemoDriverResponse(body), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not dispatch job.";
    return jsonError(message, 400);
  }
}
