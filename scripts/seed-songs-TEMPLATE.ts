// scripts/seed-songs.ts - TEMPLATE for complete NIN halo catalog
// 
// SOURCE: Nine Inch Nails Discography
// https://en.wikipedia.org/wiki/Nine_Inch_Nails_discography
//
// Rules: 
// - Only include songs from halo-designated albums/singles
// - No leaks, bootlegs, or unofficial releases
// - Include Ghosts (free albums with halo numbers)
// - Sort by halo number, then chronological within album
//
// TODO: Complete this list with all 1000+ NIN songs across all halos

import { kv } from '@vercel/kv';

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
  // ... continue with other Broken tracks ...

  // HALO 3: Broken Movie Soundtrack / Other (1993)
  // 
  // HALO 4: The Downward Spiral (1994)
  { id: 'nin-4-01', name: 'Mr. Self Destruct', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 4 },
  { id: 'nin-4-02', name: 'Piggy', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 4 },
  // ... continue with other TDS tracks ...

  // HALO 5: The Fragile (1999) — add 2-disc version tracks
  // HALO 6: Further Down the Spiral (2002)
  // HALO 7: With Teeth (2005)
  // HALO 8: Year Zero (2007)
  // HALO 9: Ghosts I–IV (2008) — 36 tracks
  // HALO 10–11: Hesitation Marks (2013)
  // HALO 12–17: Add Violence (2017)
  // HALO 18–21: Cold and Black and Infinite (2018)
  // HALO 22–26: Bad Witch (2018)
  // HALO 27–29: Ghosts V–VII (2020)
  // HALO 30–32: Ghosts VIII–X (2020)
  // HALO 33–34: Ghosts XI–XII (2020)
  // HALO 35: Ghosts XIII: Locusts (2020)
  // HALO 36: COVID Benefit Compilation (2020)
  // HALO 37–48: Ghosts synth versions
  // HALO 49–: Various ambient / alternate versions

  // SINGLETS & EPs: Assign appropriate halo numbers
  { id: 'nin-sing-01', name: 'Just Like You Imagined', album: 'Single', releaseYear: 1992, haloNumber: 2 },
  { id: 'nin-sing-02', name: 'Closer to God', album: 'Single', releaseYear: 1994, haloNumber: 4 },

  // NOTES:
  // - The complete NIN catalog has 1000+ songs across Ghosts alone
  // - For streaming, you might want to limit to:
  //   a) All studio albums only (main halos 1-22)
  //   b) One song per album for a quick ranking
  //   c) Top 50 most popular NIN songs
  //   d) Full catalog (most comprehensive)
  // 
  // RECOMMENDED: Start with studio albums (Halos 1, 2, 4, 5, 7, 8, 11, 22)
  // That's ~150 songs, manageable for a stream
];

async function seedSongs() {
  try {
    // Initial state: all songs are unranked
    await kv.set('nin:songs', NIN_SONGS);
    console.log(`✓ Seeded ${NIN_SONGS.length} songs to Vercel KV`);
    console.log(`  Key: nin:songs (unranked)`);
    console.log(`  Initialize with: nin:ranked = [] (empty)`);
  } catch (error) {
    console.error('❌ Failed to seed songs:', error);
    process.exit(1);
  }
}

seedSongs();
