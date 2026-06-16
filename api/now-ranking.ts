// api/now-ranking.ts
// GET /api/now-ranking — returns the top song from the unranked pile

import { sql } from '@vercel/postgres';

export const config = { runtime: 'edge' };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  try {
    // Get the stored unranked order
    const orderResult = await sql`SELECT song_ids FROM unranked_order WHERE id = 1`;
    const songIds: string[] | null = orderResult.rows[0]?.song_ids ?? null;

    if (!songIds || songIds.length === 0) return json({ song: null });

    // Find first non-hidden song from the ordered list
    const placeholders = songIds.map((_, i) => `$${i + 1}`).join(',');
    const result = await sql.query(
      `SELECT id, name, album, release_year, halo_number, cover_art_url, hidden
       FROM songs
       WHERE id = ANY($1::text[]) AND hidden = FALSE`,
      [songIds]
    );

    const map = new Map(result.rows.map((r: any) => [r.id, r]));
    const topId = songIds.find(id => map.has(id));
    if (!topId) return json({ song: null });

    const row = map.get(topId);
    return json({
      song: {
        id: row.id,
        name: row.name,
        album: row.album,
        releaseYear: row.release_year,
        haloNumber: row.halo_number,
        coverArtUrl: row.cover_art_url ?? null,
      }
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[now-ranking API]', msg);
    return json({ song: null });
  }
}
