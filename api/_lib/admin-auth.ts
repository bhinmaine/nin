// api/_lib/admin-auth.ts
// Shared auth + response helpers for the /api/admin/* edge functions.
//
// The admin password is whatever of these env vars is set (the project uses
// `adminpw`, older names kept for compatibility). Clients send it as the
// `x-admin-auth` header after a successful POST /api/admin/auth.
//
// NOTE: the leading underscore keeps Vercel from turning this into a route.

export const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-auth',
};

export function getAdminPassword(): string | undefined {
  return (
    process.env.ADMIN_PASSWORD ||
    process.env.ADMINPW ||
    process.env.adminpw ||
    process.env.ADMIN_PW
  );
}

/**
 * True only when a password is configured AND the request carries it.
 * A missing env var must never mean "open to everyone".
 */
export function isAuthorized(request: Request): boolean {
  const expected = getAdminPassword();
  if (!expected) return false;
  const provided = request.headers.get('x-admin-auth');
  return provided === expected;
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

export function preflight(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export function unauthorized(): Response {
  return json({ error: 'Unauthorized' }, 401);
}
