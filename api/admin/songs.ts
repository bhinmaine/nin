// api/admin/songs.ts - GET and POST endpoints for admin interface

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
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    if (request.method === 'GET') {
      // Fetch unranked songs
      const unrankedResult = await sql`
        SELECT * FROM songs
        WHERE id NOT IN (SELECT song_id FROM ranked_songs)
        ORDER BY RANDOM()
      `;

      // Fetch ranked songs
      const rankedResult = await sql`
        SELECT s.*, r.rank, r.episode_number, r.timestamp
        FROM ranked_songs r
        JOIN songs s ON r.song_id = s.id
        ORDER BY r.rank ASC
      `;
      
      return new Response(
        JSON.stringify({
          unranked: unrankedResult.rows || [],
          ranked: rankedResult.rows || [],
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

      // Clear existing rankings
      await sql`DELETE FROM ranked_songs`;

      // Insert new rankings
      for (const song of data.ranked) {
        await sql`
          INSERT INTO ranked_songs (song_id, rank, episode_number, timestamp)
          VALUES (${song.id}, ${song.rank}, ${song.episodeNumber}, ${song.timestamp})
        `;
      }

      // Ensure all unranked songs exist (upsert)
      for (const song of data.unranked) {
        await sql`
          INSERT INTO songs (id, name, album, release_year, halo_number)
          VALUES (${song.id}, ${song.name}, ${song.album}, ${song.releaseYear}, ${song.haloNumber})
          ON CONFLICT(id) DO NOTHING
        `;
      }
      
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
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    
    // If DB not set up yet, return empty state
    if (errorMsg.includes('POSTGRES_URLPROVIDERS') || 
        errorMsg.includes('relation') || 
        errorMsg.includes('does not exist')) {
      console.warn('[DB Not Ready] Returning empty songs state');
      return new Response(
        JSON.stringify({
          unranked: [],
          ranked: [],
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
    
    console.error('[API Error]', errorMsg);
    
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
