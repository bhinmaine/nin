// api/admin/episodes.ts
// GET  /api/admin/episodes        — list all episodes
// POST /api/admin/episodes        — upsert { episodeNumber, youtubeUrl, twitchUrl }
// DELETE /api/admin/episodes?n=3  — delete episode

import { sql } from '@vercel/postgres';

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD ||
  process.env.ADMINPW ||
  process.env.adminpw ||
  process.env.ADMIN_PW;

export const config = { runtime: 'edge' };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-auth',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  const authHeader = request.headers.get('x-admin-auth');
  if (authHeader !== ADMIN_PASSWORD) return json({ error: 'Unauthorized' }, 401);

  try {
    if (request.method === 'GET') {
      const result = await sql`
        SELECT episode_number, youtube_url, twitch_url
        FROM episodes
        ORDER BY episode_number ASC
      `;
      return json(result.rows.map(r => ({
        episodeNumber: r.episode_number,
        youtubeUrl: r.youtube_url ?? '',
        twitchUrl: r.twitch_url ?? '',
      })));
    }

    if (request.method === 'POST') {
      const { episodeNumber, youtubeUrl, twitchUrl } = await request.json();
      if (!episodeNumber || typeof episodeNumber !== 'number') {
        return json({ error: 'episodeNumber required' }, 400);
      }
      const yt = youtubeUrl?.trim() || null;
      const tw = twitchUrl?.trim() || null;
      await sql`
        INSERT INTO episodes (episode_number, youtube_url, twitch_url, updated_at)
        VALUES (${episodeNumber}, ${yt}, ${tw}, CURRENT_TIMESTAMP)
        ON CONFLICT (episode_number) DO UPDATE
          SET youtube_url = ${yt},
              twitch_url  = ${tw},
              updated_at  = CURRENT_TIMESTAMP
      `;
      return json({ success: true });
    }

    if (request.method === 'DELETE') {
      const url = new URL(request.url);
      const n = parseInt(url.searchParams.get('n') ?? '');
      if (!n) return json({ error: 'Missing n' }, 400);
      await sql`DELETE FROM episodes WHERE episode_number = ${n}`;
      return json({ success: true });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[episodes API]', msg);
    return json({ error: 'Internal server error', message: msg }, 500);
  }
}
