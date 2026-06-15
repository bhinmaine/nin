import { readFileSync } from 'fs';
import pg from 'pg';

const { Client } = pg;
const client = new Client({ connectionString: process.env.POSTGRES_URL });
await client.connect();

const links = JSON.parse(readFileSync(new URL('../data/song-links.json', import.meta.url)));

let updated = 0;
for (const [id, { appleMusicUrl, youtubeUrl }] of Object.entries(links)) {
  const res = await client.query(
    `UPDATE songs SET apple_music_url = $1, youtube_url = $2 WHERE id = $3`,
    [appleMusicUrl || null, youtubeUrl || null, id]
  );
  if (res.rowCount > 0) updated++;
}

console.log(`Updated ${updated} songs with Apple Music / YouTube links`);
await client.end();
