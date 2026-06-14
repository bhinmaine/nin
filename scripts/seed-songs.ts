// scripts/seed-songs.ts - Populate Neon database with NIN songs
// Run with: npx ts-node scripts/seed-songs.ts

import { sql } from '@vercel/postgres';

// TODO: Replace with complete NIN catalog from Wikipedia
const NIN_SONGS = [
  // HALO 1: Pretty Hate Machine (1989)
  { id: 'nin-1-01', name: 'Head Like a Hole', album: 'Pretty Hate Machine', releaseYear: 1989, haloNumber: 1 },
  { id: 'nin-1-02', name: 'Terrible Lie', album: 'Pretty Hate Machine', releaseYear: 1989, haloNumber: 1 },
  { id: 'nin-1-03', name: 'Down in It', album: 'Pretty Hate Machine', releaseYear: 1989, haloNumber: 1 },
  { id: 'nin-1-04', name: 'Sanctioned', album: 'Pretty Hate Machine', releaseYear: 1989, haloNumber: 1 },
  { id: 'nin-1-05', name: 'Something I Can Never Have', album: 'Pretty Hate Machine', releaseYear: 1989, haloNumber: 1 },
  { id: 'nin-1-06', name: 'Ringfinger', album: 'Pretty Hate Machine', releaseYear: 1989, haloNumber: 1 },
  { id: 'nin-1-07', name: 'With Teeth', album: 'Pretty Hate Machine', releaseYear: 1989, haloNumber: 1 },
  { id: 'nin-1-08', name: 'Without You', album: 'Pretty Hate Machine', releaseYear: 1989, haloNumber: 1 },
  { id: 'nin-1-09', name: 'Help Me I Am in Hell', album: 'Pretty Hate Machine', releaseYear: 1989, haloNumber: 1 },
  { id: 'nin-1-10', name: 'Heresy', album: 'Pretty Hate Machine', releaseYear: 1989, haloNumber: 1 },

  // HALO 2: Broken (1992)
  { id: 'nin-2-01', name: 'Pinion', album: 'Broken', releaseYear: 1992, haloNumber: 2 },
  { id: 'nin-2-02', name: 'Wish', album: 'Broken', releaseYear: 1992, haloNumber: 2 },
  { id: 'nin-2-03', name: 'Last', album: 'Broken', releaseYear: 1992, haloNumber: 2 },
  { id: 'nin-2-04', name: 'Ruiner', album: 'Broken', releaseYear: 1992, haloNumber: 2 },
  { id: 'nin-2-05', name: 'Scary Monsters and Nice Sprites', album: 'Broken', releaseYear: 1992, haloNumber: 2 },

  // HALO 4: The Downward Spiral (1994)
  { id: 'nin-4-01', name: 'Mr. Self Destruct', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 4 },
  { id: 'nin-4-02', name: 'Piggy', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 4 },
  { id: 'nin-4-03', name: 'Heresy', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 4 },
  { id: 'nin-4-04', name: 'March of the Pigs', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 4 },
  { id: 'nin-4-05', name: 'Closer', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 4 },

  // Add more songs as needed...
  // See SONG_DATABASE_GUIDE.md for how to populate the full catalog
];

async function seedDatabase() {
  try {
    console.log(`🌱 Seeding ${NIN_SONGS.length} NIN songs to database...`);

    for (const song of NIN_SONGS) {
      await sql`
        INSERT INTO songs (id, name, album, release_year, halo_number)
        VALUES (${song.id}, ${song.name}, ${song.album}, ${song.releaseYear}, ${song.haloNumber})
        ON CONFLICT(id) DO NOTHING
      `;
    }

    console.log(`✅ Seeded ${NIN_SONGS.length} songs successfully`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    process.exit(1);
  }
}

seedDatabase();
