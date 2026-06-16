// api/admin/talking-points.ts
// GET /api/admin/talking-points?id=nin-2-01
// POST /api/admin/talking-points  { id, talkingPoints }

import { sql } from '@vercel/postgres';

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD ||
  process.env.ADMINPW ||
  process.env.adminpw ||
  process.env.ADMIN_PW;

export const config = {
  runtime: 'edge',
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  // Auth check via cookie/header (reuse same pattern as admin/songs)
  // Vercel edge: check for auth header passed from client
  const authHeader = request.headers.get('x-admin-auth');
  if (authHeader !== ADMIN_PASSWORD) {
    return json({ error: 'Unauthorized' }, 401);
  }

  try {
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const id = url.searchParams.get('id');
      if (!id) return json({ error: 'Missing id' }, 400);

      const result = await sql`
        SELECT talking_points FROM songs WHERE id = ${id}
      `;
      const row = result.rows[0];
      return json({ talkingPoints: row?.talking_points ?? null });
    }

    if (request.method === 'POST') {
      const { id, talkingPoints } = await request.json();
      if (!id) return json({ error: 'Missing id' }, 400);

      const tp = talkingPoints ? JSON.stringify(talkingPoints) : null;
      await sql`
        UPDATE songs SET talking_points = ${tp}::jsonb WHERE id = ${id}
      `;
      return json({ success: true });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[talking-points API]', msg);
    return json({ error: 'Internal server error', message: msg }, 500);
  }
}
