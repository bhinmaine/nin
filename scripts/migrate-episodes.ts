// scripts/migrate-episodes.ts
// Adds episodes table for YouTube + Twitch links per episode
// Run with: POSTGRES_URL="..." npx ts-node scripts/migrate-episodes.ts

import { sql } from '@vercel/postgres';

async function migrate() {
  try {
    console.log('🗄️  Creating episodes table...');

    await sql`
      CREATE TABLE IF NOT EXISTS episodes (
        episode_number INTEGER PRIMARY KEY,
        youtube_url    TEXT,
        twitch_url     TEXT,
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ Created episodes table');

    // Note: FK constraint on ranked_songs.episode_number is optional;
    // episodes may not exist for older ranked songs.
    console.log('✓ Episodes table ready (FK constraint omitted for compatibility)');

    console.log('✅ Migration complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
