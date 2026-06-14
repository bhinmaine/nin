// api/rankings.ts - GET endpoint for public rankings

import { kv } from '@vercel/kv';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const rankings = await kv.get('nin:ranked');
    
    return new Response(JSON.stringify(rankings || []), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    // If KV isn't configured yet, return empty array (graceful degradation)
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMsg.includes('Missing required environment variables') || 
        errorMsg.includes('KV_REST_API')) {
      // KV not configured yet - return empty but valid response
      console.warn('[KV Not Configured] Returning empty rankings');
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Other errors - return 500
    console.error('[API Error]', errorMsg);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch rankings',
        message: errorMsg,
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
