// api/songs.ts - Vercel Edge Function
// This runs on Vercel's Edge Network and handles all song/ranking data

import { kv } from '@vercel/kv';

const SONGS_KEY = 'nin:songs';
const RANKINGS_KEY = 'nin:ranked';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const method = req.method;

  // GET /api/rankings - Public: fetch ranked songs only
  if (method === 'GET' && req.url.includes('/api/rankings')) {
    try {
      const rankings = await kv.get(RANKINGS_KEY);
      return new Response(
        JSON.stringify(rankings || []),
        { headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch rankings' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // POST /api/rankings - Admin: save ranked and unranked songs
  if (method === 'POST' && req.url.includes('/api/admin/songs')) {
    const data = await req.json();
    try {
      // Separate ranked from unranked
      await kv.set(RANKINGS_KEY, data.ranked);
      await kv.set(SONGS_KEY, data.unranked);
      
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to save rankings' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // GET /api/admin/songs - Admin: fetch all songs (ranked + unranked)
  if (method === 'GET' && req.url.includes('/api/admin/songs')) {
    try {
      const unranked = await kv.get(SONGS_KEY);
      const ranked = await kv.get(RANKINGS_KEY);
      
      return new Response(
        JSON.stringify({
          unranked: unranked || [],
          ranked: ranked || [],
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch songs' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: 'Not found' }),
    { status: 404, headers: { 'Content-Type': 'application/json' } }
  );
}
