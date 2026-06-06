export function jsonOk<T>(data: T, init?: ResponseInit) {
  return Response.json({ ok: true, data }, init);
}

export function jsonError(message: string, status = 400, details?: string[]) {
  return Response.json({ ok: false, error: message, details }, { status });
}
