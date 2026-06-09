import { createLinkResponse } from "../../../lib/api/create-link";
import { jsonOk } from "../../../lib/http";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return jsonOk(createLinkResponse(body), { status: 201 });
}
