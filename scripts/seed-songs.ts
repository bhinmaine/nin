// scripts/seed-songs.ts - One-time script to load NIN songs into Vercel KV
// Run with: npx ts-node scripts/seed-songs.ts

import { kv } from '@vercel/kv';

const NIN_SONGS = [
  // These are placeholder IDs - you'll need the actual NIN halo catalog
  // Format: { id, name, album, releaseYear, haloNumber }
  
  // PHM (1994)
  { id: 'nin-001', name: 'Head Like a Hole', album: 'Pretty Hate Machine', releaseYear: 1989, haloNumber: 1 },
  { id: 'nin-002', name: 'Terrible Lie', album: 'Pretty Hate Machine', releaseYear: 1989, haloNumber: 1 },
  { id: 'nin-003', name: 'Down in It', album: 'Pretty Hate Machine', releaseYear: 1989, haloNumber: 1 },
  
  // TDS (1994)
  { id: 'nin-004', name: 'Mr. Self Destruct', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 5 },
  { id: 'nin-005', name: 'Terrible Lie', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 5 },
  
  // This list needs to be completed with the actual NIN catalog
  // See: https://en.wikipedia.org/wiki/Nine_Inch_Nails_discography
];

async function seedSongs() {
  try {
    await kv.set('nin:songs', NIN_SONGS);
    console.log(`✓ Seeded ${NIN_SONGS.length} songs to Vercel KV`);
  } catch (error) {
    console.error('Failed to seed songs:', error);
    process.exit(1);
  }
}

seedSongs();
