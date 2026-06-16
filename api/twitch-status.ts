// api/twitch-status.ts
// GET /api/twitch-status — returns whether possiblyben is live on Twitch

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

const TWITCH_USER = 'possiblyben';

async function getAppAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: 'POST' }
  );
  if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return json({ live: false, error: 'Twitch credentials not configured' }, 500);
  }

  try {
    const token = await getAppAccessToken(clientId, clientSecret);

    const res = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${TWITCH_USER}`,
      {
        headers: {
          'Client-ID': clientId,
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) throw new Error(`Twitch API error: ${res.status}`);

    const data = await res.json() as { data: { type: string; title: string; viewer_count: number }[] };
    const stream = data.data[0];
    const live = stream?.type === 'live';

    return json({
      live,
      title: live ? stream.title : null,
      viewerCount: live ? stream.viewer_count : null,
      url: live ? `https://www.twitch.tv/${TWITCH_USER}` : null,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[twitch-status API]', msg);
    return json({ live: false, error: msg }, 500);
  }
}
