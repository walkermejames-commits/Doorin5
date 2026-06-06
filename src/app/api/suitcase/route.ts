import { getSuitcaseConfig } from "../../../lib/suitcase";
import { jsonOk } from "../../../lib/http";

export async function GET() {
  return jsonOk(getSuitcaseConfig());
}
