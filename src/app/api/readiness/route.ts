import { getHealthReport } from "../../../lib/health";
import { jsonOk } from "../../../lib/http";

export async function GET() {
  return jsonOk(getHealthReport());
}
