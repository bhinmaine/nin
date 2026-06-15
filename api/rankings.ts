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
      SELECT s.id, s.name, s.album, s.release_year, s.halo_number,
             s.cover_art_url, s.apple_music_url, s.youtube_url,
             r.rank, r.episode_number, r.timestamp,
             e.youtube_url AS episode_youtube_url,
             e.twitch_url  AS episode_twitch_url
      FROM ranked_songs r
      JOIN songs s ON r.song_id = s.id
      LEFT JOIN episodes e ON r.episode_number = e.episode_number
      ORDER BY r.rank ASC
    `;

    const mapped = (result.rows || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      album: row.album,
      releaseYear: row.release_year,
      haloNumber: row.halo_number,
      coverArtUrl: row.cover_art_url || null,
      appleMusicUrl: row.apple_music_url || null,
      youtubeUrl: row.youtube_url || null,
      rank: row.rank,
      episodeNumber: row.episode_number,
      timestamp: row.timestamp,
      episodeYoutubeUrl: row.episode_youtube_url || null,
      episodeTwitchUrl: row.episode_twitch_url || null,
    }));

    return new Response(JSON.stringify(mapped), {
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
