// scripts/migrate-talking-points.ts
// Adds talking_points JSONB column to songs table
// Run with: npx ts-node scripts/migrate-talking-points.ts

import { sql } from '@vercel/postgres';

async function migrate() {
  try {
    console.log('🗄️  Adding talking_points column...');

    await sql`
      ALTER TABLE songs
      ADD COLUMN IF NOT EXISTS talking_points JSONB DEFAULT NULL
    `;
    console.log('✓ Added talking_points column');

    // Add cover_art_url and link columns too in case they're missing
    await sql`
      ALTER TABLE songs
      ADD COLUMN IF NOT EXISTS cover_art_url TEXT DEFAULT NULL
    `;
    await sql`
      ALTER TABLE songs
      ADD COLUMN IF NOT EXISTS apple_music_url TEXT DEFAULT NULL
    `;
    await sql`
      ALTER TABLE songs
      ADD COLUMN IF NOT EXISTS youtube_url TEXT DEFAULT NULL
    `;
    console.log('✓ Ensured link columns exist');

    console.log('✅ Migration complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
