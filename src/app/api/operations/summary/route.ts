import { operationsSummaryResponse } from "../../../../lib/api/operations-summary";
import { jsonOk } from "../../../../lib/http";

export async function GET() {
  return jsonOk(operationsSummaryResponse());
}
