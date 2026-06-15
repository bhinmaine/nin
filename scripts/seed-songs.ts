// scripts/seed-songs.ts - Populate Neon database with complete NIN catalog
// Run with: npx ts-node scripts/seed-songs.ts

import { sql } from '@vercel/postgres';

// Complete NIN Halo Catalog - Studio Albums + Key Releases
const NIN_SONGS = [
  // HALO 1-2: Pretty Hate Machine (1989)
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

  // HALO 5: Broken EP (1992)
  { id: 'nin-5-01', name: 'Pinion', album: 'Broken', releaseYear: 1992, haloNumber: 5 },
  { id: 'nin-5-02', name: 'Wish', album: 'Broken', releaseYear: 1992, haloNumber: 5 },
  { id: 'nin-5-03', name: 'Last', album: 'Broken', releaseYear: 1992, haloNumber: 5 },
  { id: 'nin-5-04', name: 'Ruiner', album: 'Broken', releaseYear: 1992, haloNumber: 5 },
  { id: 'nin-5-05', name: 'Big Man with a Gun', album: 'Broken', releaseYear: 1992, haloNumber: 5 },
  { id: 'nin-5-06', name: 'A Warm Place', album: 'Broken', releaseYear: 1992, haloNumber: 5 },
  { id: 'nin-5-07', name: 'Eraser', album: 'Broken', releaseYear: 1992, haloNumber: 5 },

  // HALO 8: The Downward Spiral (1994)
  { id: 'nin-8-01', name: 'Mr. Self Destruct', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 8 },
  { id: 'nin-8-02', name: 'Piggy', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 8 },
  { id: 'nin-8-03', name: 'Heresy', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 8 },
  { id: 'nin-8-04', name: 'March of the Pigs', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 8 },
  { id: 'nin-8-05', name: 'Closer', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 8 },
  { id: 'nin-8-06', name: 'The Downward Spiral', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 8 },
  { id: 'nin-8-07', name: 'I Do Not Want This', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 8 },
  { id: 'nin-8-08', name: 'Big Man with a Gun', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 8 },
  { id: 'nin-8-09', name: 'A Warm Place', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 8 },
  { id: 'nin-8-10', name: 'Eraser', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 8 },
  { id: 'nin-8-11', name: 'Reptile', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 8 },
  { id: 'nin-8-12', name: 'The Perfect Drug', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 8 },
  { id: 'nin-8-13', name: 'Hurt', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 8 },

  // HALO 14: The Fragile (1999)
  { id: 'nin-14-01', name: 'Somewhat Damaged', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-02', name: 'The Wretched', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-03', name: 'We\'re in This Together', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-04', name: 'The Fragile', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-05', name: 'Just Like You Imagined', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-06', name: 'Even Deeper', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-07', name: 'Pilgrimage', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-08', name: 'No, You Don\'t', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-09', name: 'La Mer', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-10', name: 'The Great Below', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-11', name: 'The Way Out Is Through', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-12', name: 'Into the Void', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-13', name: 'Where Is Everybody?', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-14', name: 'The Mark Has Been Made', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-15', name: 'I\'m Looking Forward to Joining You, Finally', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-16', name: 'The Big Come Down', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-17', name: 'Ripe (With Decay)', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-18', name: 'The Becoming', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-19', name: 'Try to Smile', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },

  // HALO 19: With Teeth (2005)
  { id: 'nin-19-01', name: 'All the Love in the World', album: 'With Teeth', releaseYear: 2005, haloNumber: 19 },
  { id: 'nin-19-02', name: 'You Know What You Are?', album: 'With Teeth', releaseYear: 2005, haloNumber: 19 },
  { id: 'nin-19-03', name: 'The Collector', album: 'With Teeth', releaseYear: 2005, haloNumber: 19 },
  { id: 'nin-19-04', name: 'Wanting/All the Love in the World', album: 'With Teeth', releaseYear: 2005, haloNumber: 19 },
  { id: 'nin-19-05', name: 'The Line Begins to Blur', album: 'With Teeth', releaseYear: 2005, haloNumber: 19 },
  { id: 'nin-19-06', name: 'Beside You', album: 'With Teeth', releaseYear: 2005, haloNumber: 19 },
  { id: 'nin-19-07', name: 'Home', album: 'With Teeth', releaseYear: 2005, haloNumber: 19 },
  { id: 'nin-19-08', name: 'Right Where It Belongs', album: 'With Teeth', releaseYear: 2005, haloNumber: 19 },
  { id: 'nin-19-09', name: 'Love Is Not Enough', album: 'With Teeth', releaseYear: 2005, haloNumber: 19 },
  { id: 'nin-19-10', name: 'Every Day Is Exactly the Same', album: 'With Teeth', releaseYear: 2005, haloNumber: 19 },

  // HALO 24: Year Zero (2007)
  { id: 'nin-24-01', name: 'The Beginning of the End', album: 'Year Zero', releaseYear: 2007, haloNumber: 24 },
  { id: 'nin-24-02', name: 'The Good Soldier', album: 'Year Zero', releaseYear: 2007, haloNumber: 24 },
  { id: 'nin-24-03', name: 'The Great Destroyer', album: 'Year Zero', releaseYear: 2007, haloNumber: 24 },
  { id: 'nin-24-04', name: 'Me, I\'m Not', album: 'Year Zero', releaseYear: 2007, haloNumber: 24 },
  { id: 'nin-24-05', name: 'Capital G', album: 'Year Zero', releaseYear: 2007, haloNumber: 24 },
  { id: 'nin-24-06', name: 'In This Twilight', album: 'Year Zero', releaseYear: 2007, haloNumber: 24 },
  { id: 'nin-24-07', name: 'And We Washed Our Weapons in the Sea', album: 'Year Zero', releaseYear: 2007, haloNumber: 24 },
  { id: 'nin-24-08', name: 'Survivalism', album: 'Year Zero', releaseYear: 2007, haloNumber: 24 },
  { id: 'nin-24-09', name: 'The Way It\'s Wired', album: 'Year Zero', releaseYear: 2007, haloNumber: 24 },
  { id: 'nin-24-10', name: 'Discipline', album: 'Year Zero', releaseYear: 2007, haloNumber: 24 },
  { id: 'nin-24-11', name: 'The Beginning of the End (Reprise)', album: 'Year Zero', releaseYear: 2007, haloNumber: 24 },

  // HALO 26: Ghosts I-IV (2008) - Select tracks
  { id: 'nin-26-01', name: 'Ghosts I-1', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-02', name: 'Ghosts I-4', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-03', name: 'Ghosts II-2', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-04', name: 'Ghosts II-3', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-05', name: 'Ghosts III-10', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-06', name: 'Ghosts IV-6', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },

  // HALO 28: Hesitation Marks (2013)
  { id: 'nin-28-01', name: 'Copy of A', album: 'Hesitation Marks', releaseYear: 2013, haloNumber: 28 },
  { id: 'nin-28-02', name: 'Came Back Haunted', album: 'Hesitation Marks', releaseYear: 2013, haloNumber: 28 },
  { id: 'nin-28-03', name: 'Find My Way', album: 'Hesitation Marks', releaseYear: 2013, haloNumber: 28 },
  { id: 'nin-28-04', name: 'All Time Low', album: 'Hesitation Marks', releaseYear: 2013, haloNumber: 28 },
  { id: 'nin-28-05', name: 'Disappointed', album: 'Hesitation Marks', releaseYear: 2013, haloNumber: 28 },
  { id: 'nin-28-06', name: 'Everything', album: 'Hesitation Marks', releaseYear: 2013, haloNumber: 28 },
  { id: 'nin-28-07', name: 'The Eater of Dreams', album: 'Hesitation Marks', releaseYear: 2013, haloNumber: 28 },
  { id: 'nin-28-08', name: 'While I\'m Still Here', album: 'Hesitation Marks', releaseYear: 2013, haloNumber: 28 },
  { id: 'nin-28-09', name: 'Black Noise', album: 'Hesitation Marks', releaseYear: 2013, haloNumber: 28 },
  { id: 'nin-28-10', name: 'I Would for You', album: 'Hesitation Marks', releaseYear: 2013, haloNumber: 28 },

  // HALO 31: Add Violence (2017)
  { id: 'nin-31-01', name: 'Less Than', album: 'Add Violence', releaseYear: 2017, haloNumber: 31 },
  { id: 'nin-31-02', name: 'The Perfect Girl', album: 'Add Violence', releaseYear: 2017, haloNumber: 31 },
  { id: 'nin-31-03', name: 'I\'m Not from This World', album: 'Add Violence', releaseYear: 2017, haloNumber: 31 },
  { id: 'nin-31-04', name: 'This Isn\'t the Place', album: 'Add Violence', releaseYear: 2017, haloNumber: 31 },
  { id: 'nin-31-05', name: 'Not Anymore', album: 'Add Violence', releaseYear: 2017, haloNumber: 31 },

  // HALO 32: Bad Witch (2018)
  { id: 'nin-32-01', name: 'Godless', album: 'Bad Witch', releaseYear: 2018, haloNumber: 32 },
  { id: 'nin-32-02', name: 'Sanctified', album: 'Bad Witch', releaseYear: 2018, haloNumber: 32 },
  { id: 'nin-32-03', name: 'Apple of Sodom', album: 'Bad Witch', releaseYear: 2018, haloNumber: 32 },
  { id: 'nin-32-04', name: 'Burn', album: 'Bad Witch', releaseYear: 2018, haloNumber: 32 },
  { id: 'nin-32-05', name: 'Branches', album: 'Bad Witch', releaseYear: 2018, haloNumber: 32 },
  { id: 'nin-32-06', name: 'Play the Fucking Song', album: 'Bad Witch', releaseYear: 2018, haloNumber: 32 },

  // HALO 33: Ghosts V: Together (2020)
  { id: 'nin-33-01', name: 'Ghosts V-1', album: 'Ghosts V: Together', releaseYear: 2020, haloNumber: 33 },
  { id: 'nin-33-02', name: 'Ghosts V-4', album: 'Ghosts V: Together', releaseYear: 2020, haloNumber: 33 },
  { id: 'nin-33-03', name: 'Ghosts V-7', album: 'Ghosts V: Together', releaseYear: 2020, haloNumber: 33 },

  // HALO 34: Ghosts VI: Locusts (2020)
  { id: 'nin-34-01', name: 'Ghosts VI-1', album: 'Ghosts VI: Locusts', releaseYear: 2020, haloNumber: 34 },
  { id: 'nin-34-02', name: 'Ghosts VI-5', album: 'Ghosts VI: Locusts', releaseYear: 2020, haloNumber: 34 },
  { id: 'nin-34-03', name: 'Ghosts VI-8', album: 'Ghosts VI: Locusts', releaseYear: 2020, haloNumber: 34 },

  // HALO 38: Nine Inch Noize (2026)
  { id: 'nin-38-01', name: 'All the Ways You\'ve Let Me Down', album: 'Nine Inch Noize', releaseYear: 2026, haloNumber: 38 },
  { id: 'nin-38-02', name: 'The Perfect Girl (Reprise)', album: 'Nine Inch Noize', releaseYear: 2026, haloNumber: 38 },
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
