// api/songs.ts - Vercel Edge Function
// This runs on Vercel's Edge Network and handles all song/ranking data

import { kv } from '@vercel/kv';

const SONGS_KEY = 'nin:songs';
const RANKINGS_KEY = 'nin:ranked';

export const config = {
  runtime: 'edge',
};

async function getCORSHeaders(request: Request) {
  const origin = request.headers.get('origin') || '*';
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default async function handler(request: Request): Promise<Response> {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: await getCORSHeaders(request),
    });
  }

  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method;
  const corsHeaders = await getCORSHeaders(request);

  try {
    // GET /api/rankings - Public: fetch ranked songs only
    if (method === 'GET' && pathname === '/api/rankings') {
      const rankings = await kv.get(RANKINGS_KEY);
      return new Response(
        JSON.stringify(rankings || []),
        { headers: corsHeaders }
      );
    }

    // POST /api/admin/songs - Admin: save ranked and unranked songs
    if (method === 'POST' && pathname === '/api/admin/songs') {
      const data = await request.json();
      
      if (!data.ranked || !data.unranked) {
        return new Response(
          JSON.stringify({ error: 'Missing ranked or unranked data' }),
          { status: 400, headers: corsHeaders }
        );
      }

      await kv.set(RANKINGS_KEY, data.ranked);
      await kv.set(SONGS_KEY, data.unranked);
      
      return new Response(
        JSON.stringify({ success: true }),
        { headers: corsHeaders }
      );
    }

    // GET /api/admin/songs - Admin: fetch all songs (ranked + unranked)
    if (method === 'GET' && pathname === '/api/admin/songs') {
      const unranked = await kv.get(SONGS_KEY);
      const ranked = await kv.get(RANKINGS_KEY);
      
      return new Response(
        JSON.stringify({
          unranked: unranked || [],
          ranked: ranked || [],
        }),
        { headers: corsHeaders }
      );
    }

    // Health check endpoint
    if (method === 'GET' && pathname === '/api/health') {
      return new Response(
        JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }),
        { headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found', path: pathname, method }),
      { status: 404, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[API Error]', error);
    
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: errorMsg,
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}
