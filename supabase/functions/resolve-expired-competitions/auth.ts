// Esta función solo la debe poder disparar el cron interno (pg_cron llamando
// con la service_role key), nunca la app ni un usuario con la anon key.

export const SERVICE_ROLE = "service_role";

function base64UrlDecode(segment: string): string {
  const padded = segment.padEnd(segment.length + ((4 - (segment.length % 4)) % 4), "=");
  return atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
}

export function callerRole(req: Request): string | null {
  const bearer = req.headers.get("Authorization") ?? "";
  const token = bearer.replace(/^Bearer\s+/i, "");
  const payloadSegment = token.split(".")[1];
  if (!payloadSegment) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(payloadSegment)) as { role?: unknown };
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}
