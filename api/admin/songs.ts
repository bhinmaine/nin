// api/admin/songs.ts - GET and POST endpoints for admin interface

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
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    if (request.method === 'GET') {
      const unranked = await kv.get('nin:songs');
      const ranked = await kv.get('nin:ranked');
      
      return new Response(
        JSON.stringify({
          unranked: unranked || [],
          ranked: ranked || [],
        }),
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    if (request.method === 'POST') {
      const data = await request.json();
      
      if (!data.ranked || !data.unranked) {
        return new Response(
          JSON.stringify({ error: 'Missing ranked or unranked data' }),
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      await kv.set('nin:ranked', data.ranked);
      await kv.set('nin:songs', data.unranked);
      
      return new Response(
        JSON.stringify({ success: true }),
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('[API Error]', error);
    
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
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
