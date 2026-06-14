// scripts/init-db.ts - Initialize Neon database schema
// Run with: npx ts-node scripts/init-db.ts

import { sql } from '@vercel/postgres';

async function initializeDatabase() {
  try {
    console.log('🗄️  Initializing database schema...');

    // Create songs table
    await sql`
      CREATE TABLE IF NOT EXISTS songs (
        id VARCHAR(20) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        album VARCHAR(255) NOT NULL,
        release_year INTEGER NOT NULL,
        halo_number INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ Created songs table');

    // Create ranked_songs table
    await sql`
      CREATE TABLE IF NOT EXISTS ranked_songs (
        id SERIAL PRIMARY KEY,
        song_id VARCHAR(20) NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
        rank INTEGER NOT NULL UNIQUE,
        episode_number INTEGER NOT NULL,
        timestamp VARCHAR(30) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ Created ranked_songs table');

    // Create indexes for performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_ranked_songs_rank ON ranked_songs(rank)
    `;
    console.log('✓ Created indexes');

    console.log('✅ Database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
