// scripts/seed-talking-points.mjs
// Seeds talking points from data/talking-points-raw.json into the database
// Run: POSTGRES_URL="..." node scripts/seed-talking-points.mjs

import { readFileSync } from 'fs';
import pg from 'pg';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Client } = pg;
const client = new Client({ connectionString: process.env.POSTGRES_URL });
await client.connect();

const raw = JSON.parse(readFileSync(path.join(__dirname, '../data/talking-points-raw.json'), 'utf8'));

let updated = 0;
let skipped = 0;
const entries = Object.entries(raw);

console.log(`Seeding talking points for ${entries.length} songs...`);

for (const [id, tp] of entries) {
  const res = await client.query(
    `UPDATE songs SET talking_points = $1::jsonb WHERE id = $2`,
    [JSON.stringify(tp), id]
  );
  if (res.rowCount > 0) {
    updated++;
  } else {
    skipped++;
    if (skipped <= 5) console.warn(`  Skipped (not in DB): ${id}`);
  }
}

console.log(`✅ Updated ${updated} songs with talking points`);
if (skipped > 0) console.log(`⚠️  Skipped ${skipped} (song IDs not found in DB)`);

await client.end();
