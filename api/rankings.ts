// api/rankings.ts - GET endpoint for public rankings

import { sql } from '@vercel/postgres';

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
    // Query ranked songs from database, ordered by rank
    const result = await sql`
      SELECT * FROM ranked_songs
      ORDER BY rank ASC
    `;
    
    return new Response(JSON.stringify(result.rows || []), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    
    // If DB not set up yet, return empty array (graceful degradation)
    if (errorMsg.includes('POSTGRES_URLPROVIDERS') || 
        errorMsg.includes('relation') || 
        errorMsg.includes('does not exist')) {
      console.warn('[DB Not Ready] Returning empty rankings');
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
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
