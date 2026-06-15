#!/usr/bin/env node
// Find Apple Music links for all NIN songs using iTunes Search API
// Processes by album/halo to minimize API calls

const fs = require('fs');
const path = require('path');

const SONG_LINKS_PATH = path.join(__dirname, '../data/song-links.json');

// All songs from seed-songs.ts
const NIN_SONGS = [
  // HALO 1: Down in It (1989)
  { id: 'nin-1-01', name: 'Down in It - Skin', album: 'Down in It', releaseYear: 1989, haloNumber: 1 },
  { id: 'nin-1-02', name: 'Down in It - Shred', album: 'Down in It', releaseYear: 1989, haloNumber: 1 },
  { id: 'nin-1-03', name: 'Down in It - Singe', album: 'Down in It', releaseYear: 1989, haloNumber: 1 },

  // HALO 2: Pretty Hate Machine (1989)
  { id: 'nin-2-01', name: 'Head Like a Hole', album: 'Pretty Hate Machine', releaseYear: 1989, haloNumber: 2 },
  { id: 'nin-2-02', name: 'Terrible Lie', album: 'Pretty Hate Machine', releaseYear: 1989, haloNumber: 2 },
  { id: 'nin-2-03', name: 'Down in It', album: 'Pretty Hate Machine', releaseYear: 1989, haloNumber: 2 },
  { id: 'nin-2-04', name: 'Sanctified', album: 'Pretty Hate Machine', releaseYear: 1989, haloNumber: 2 },
  { id: 'nin-2-05', name: 'Something I Can Never Have', album: 'Pretty Hate Machine', releaseYear: 1989, haloNumber: 2 },
  { id: 'nin-2-06', name: 'Kinda I Want To', album: 'Pretty Hate Machine', releaseYear: 1989, haloNumber: 2 },
  { id: 'nin-2-07', name: 'Sin', album: 'Pretty Hate Machine', releaseYear: 1989, haloNumber: 2 },
  { id: 'nin-2-08', name: "That's What I Get", album: 'Pretty Hate Machine', releaseYear: 1989, haloNumber: 2 },
  { id: 'nin-2-09', name: 'The Only Time', album: 'Pretty Hate Machine', releaseYear: 1989, haloNumber: 2 },
  { id: 'nin-2-10', name: 'Ringfinger', album: 'Pretty Hate Machine', releaseYear: 1989, haloNumber: 2 },

  // HALO 3: Head Like a Hole (1990) - Single
  { id: 'nin-3-01', name: 'Head Like a Hole - Slate', album: 'Head Like a Hole', releaseYear: 1990, haloNumber: 3 },
  { id: 'nin-3-02', name: 'Head Like a Hole - Clay', album: 'Head Like a Hole', releaseYear: 1990, haloNumber: 3 },
  { id: 'nin-3-03', name: 'Terrible Lie - Sympathetic Mix', album: 'Head Like a Hole', releaseYear: 1990, haloNumber: 3 },
  { id: 'nin-3-04', name: 'Head Like a Hole - Copper', album: 'Head Like a Hole', releaseYear: 1990, haloNumber: 3 },
  { id: 'nin-3-05', name: 'You Know Who You Are', album: 'Head Like a Hole', releaseYear: 1990, haloNumber: 3 },
  { id: 'nin-3-06', name: 'Head Like a Hole - Soil', album: 'Head Like a Hole', releaseYear: 1990, haloNumber: 3 },
  { id: 'nin-3-07', name: 'Terrible Lie - Empathetic Mix', album: 'Head Like a Hole', releaseYear: 1990, haloNumber: 3 },
  { id: 'nin-3-08', name: 'Down in It - Shred', album: 'Head Like a Hole', releaseYear: 1990, haloNumber: 3 },
  { id: 'nin-3-09', name: 'Down in It - Singe', album: 'Head Like a Hole', releaseYear: 1990, haloNumber: 3 },
  { id: 'nin-3-10', name: 'Down in It - Demo', album: 'Head Like a Hole', releaseYear: 1990, haloNumber: 3 },

  // HALO 4: Sin (1990) - Single
  { id: 'nin-4-01', name: 'Sin - Long', album: 'Sin', releaseYear: 1990, haloNumber: 4 },
  { id: 'nin-4-02', name: 'Sin - Dub', album: 'Sin', releaseYear: 1990, haloNumber: 4 },
  { id: 'nin-4-03', name: 'Get Down Make Love', album: 'Sin', releaseYear: 1990, haloNumber: 4 },
  { id: 'nin-4-04', name: 'Sin - Short', album: 'Sin', releaseYear: 1990, haloNumber: 4 },

  // HALO 5: Broken (1992)
  { id: 'nin-5-01', name: 'Pinion', album: 'Broken', releaseYear: 1992, haloNumber: 5 },
  { id: 'nin-5-02', name: 'Wish', album: 'Broken', releaseYear: 1992, haloNumber: 5 },
  { id: 'nin-5-03', name: 'Last', album: 'Broken', releaseYear: 1992, haloNumber: 5 },
  { id: 'nin-5-04', name: 'Help Me I Am in Hell', album: 'Broken', releaseYear: 1992, haloNumber: 5 },
  { id: 'nin-5-05', name: 'Happiness in Slavery', album: 'Broken', releaseYear: 1992, haloNumber: 5 },
  { id: 'nin-5-06', name: 'Gave Up', album: 'Broken', releaseYear: 1992, haloNumber: 5 },
  { id: 'nin-5-07', name: "Physical (You're So)", album: 'Broken', releaseYear: 1992, haloNumber: 5 },
  { id: 'nin-5-08', name: 'Suck', album: 'Broken', releaseYear: 1992, haloNumber: 5 },

  // HALO 6: Fixed (1992)
  { id: 'nin-6-01', name: 'Gave Up - Remix', album: 'Fixed', releaseYear: 1992, haloNumber: 6 },
  { id: 'nin-6-02', name: 'Wish - Remix', album: 'Fixed', releaseYear: 1992, haloNumber: 6 },
  { id: 'nin-6-03', name: 'Happiness in Slavery - Remix', album: 'Fixed', releaseYear: 1992, haloNumber: 6 },
  { id: 'nin-6-04', name: 'Throw This Away', album: 'Fixed', releaseYear: 1992, haloNumber: 6 },
  { id: 'nin-6-05', name: 'First Fuck - Remix', album: 'Fixed', releaseYear: 1992, haloNumber: 6 },
  { id: 'nin-6-06', name: 'Screaming Slave', album: 'Fixed', releaseYear: 1992, haloNumber: 6 },

  // HALO 7: March of the Pigs (1994) - Single
  { id: 'nin-7-01', name: 'March of the Pigs', album: 'March of the Pigs', releaseYear: 1994, haloNumber: 7 },
  { id: 'nin-7-02', name: 'Reptilian', album: 'March of the Pigs', releaseYear: 1994, haloNumber: 7 },
  { id: 'nin-7-03', name: 'All the Pigs, All Lined Up', album: 'March of the Pigs', releaseYear: 1994, haloNumber: 7 },
  { id: 'nin-7-04', name: 'A Violet Fluid', album: 'March of the Pigs', releaseYear: 1994, haloNumber: 7 },
  { id: 'nin-7-05', name: 'Underneath the Skin', album: 'March of the Pigs', releaseYear: 1994, haloNumber: 7 },

  // HALO 8: The Downward Spiral (1994)
  { id: 'nin-8-01', name: 'Mr. Self Destruct', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 8 },
  { id: 'nin-8-02', name: 'Piggy', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 8 },
  { id: 'nin-8-03', name: 'Heresy', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 8 },
  { id: 'nin-8-04', name: 'March of the Pigs', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 8 },
  { id: 'nin-8-05', name: 'Closer', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 8 },
  { id: 'nin-8-06', name: 'Ruiner', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 8 },
  { id: 'nin-8-07', name: 'The Becoming', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 8 },
  { id: 'nin-8-08', name: 'I Do Not Want This', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 8 },
  { id: 'nin-8-09', name: 'Big Man with a Gun', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 8 },
  { id: 'nin-8-10', name: 'A Warm Place', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 8 },
  { id: 'nin-8-11', name: 'Eraser', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 8 },
  { id: 'nin-8-12', name: 'Reptile', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 8 },
  { id: 'nin-8-13', name: 'The Downward Spiral', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 8 },
  { id: 'nin-8-14', name: 'Hurt', album: 'The Downward Spiral', releaseYear: 1994, haloNumber: 8 },

  // HALO 9: Closer to God (1994)
  { id: 'nin-9-01', name: 'Closer to God', album: 'Closer to God', releaseYear: 1994, haloNumber: 9 },
  { id: 'nin-9-02', name: 'Closer - Precursor', album: 'Closer to God', releaseYear: 1994, haloNumber: 9 },
  { id: 'nin-9-03', name: 'Closer - Deviation', album: 'Closer to God', releaseYear: 1994, haloNumber: 9 },
  { id: 'nin-9-04', name: 'Heresy - Blind', album: 'Closer to God', releaseYear: 1994, haloNumber: 9 },
  { id: 'nin-9-05', name: 'Memorabilia', album: 'Closer to God', releaseYear: 1994, haloNumber: 9 },
  { id: 'nin-9-06', name: 'Closer - Internal', album: 'Closer to God', releaseYear: 1994, haloNumber: 9 },
  { id: 'nin-9-07', name: 'March of the Fuckheads', album: 'Closer to God', releaseYear: 1994, haloNumber: 9 },
  { id: 'nin-9-08', name: 'Closer - Further Away', album: 'Closer to God', releaseYear: 1994, haloNumber: 9 },
  { id: 'nin-9-09', name: 'Closer', album: 'Closer to God', releaseYear: 1994, haloNumber: 9 },

  // HALO 10: Further Down the Spiral (1995)
  { id: 'nin-10-01', name: 'Piggy (Nothing Can Stop Me Now)', album: 'Further Down the Spiral', releaseYear: 1995, haloNumber: 10 },
  { id: 'nin-10-02', name: 'The Art of Self Destruction, Part One', album: 'Further Down the Spiral', releaseYear: 1995, haloNumber: 10 },
  { id: 'nin-10-03', name: 'Self Destruction, Part Two', album: 'Further Down the Spiral', releaseYear: 1995, haloNumber: 10 },
  { id: 'nin-10-04', name: 'The Downward Spiral (The Bottom)', album: 'Further Down the Spiral', releaseYear: 1995, haloNumber: 10 },
  { id: 'nin-10-05', name: 'Hurt (Quiet)', album: 'Further Down the Spiral', releaseYear: 1995, haloNumber: 10 },
  { id: 'nin-10-06', name: 'Eraser (Denial: Realization)', album: 'Further Down the Spiral', releaseYear: 1995, haloNumber: 10 },
  { id: 'nin-10-07', name: 'At the Heart of It All', album: 'Further Down the Spiral', releaseYear: 1995, haloNumber: 10 },
  { id: 'nin-10-08', name: 'Eraser (Polite)', album: 'Further Down the Spiral', releaseYear: 1995, haloNumber: 10 },
  { id: 'nin-10-09', name: 'Self Destruction, Final', album: 'Further Down the Spiral', releaseYear: 1995, haloNumber: 10 },
  { id: 'nin-10-10', name: 'The Beauty of Being Numb', album: 'Further Down the Spiral', releaseYear: 1995, haloNumber: 10 },
  { id: 'nin-10-11', name: 'Erased, Over, Out', album: 'Further Down the Spiral', releaseYear: 1995, haloNumber: 10 },

  // HALO 11: The Perfect Drug Versions (1997)
  { id: 'nin-11-01', name: 'The Perfect Drug - Meat Beat Manifesto (Remix)', album: 'The Perfect Drug Versions', releaseYear: 1997, haloNumber: 11 },
  { id: 'nin-11-02', name: 'The Perfect Drug - Plug (Remix)', album: 'The Perfect Drug Versions', releaseYear: 1997, haloNumber: 11 },
  { id: 'nin-11-03', name: 'The Perfect Drug - Nine Inch Nails (Remix)', album: 'The Perfect Drug Versions', releaseYear: 1997, haloNumber: 11 },
  { id: 'nin-11-04', name: 'The Perfect Drug - Spacetime Continuum (Recreation)', album: 'The Perfect Drug Versions', releaseYear: 1997, haloNumber: 11 },
  { id: 'nin-11-05', name: 'The Perfect Drug - The Orb (Remix)', album: 'The Perfect Drug Versions', releaseYear: 1997, haloNumber: 11 },

  // HALO 12: Closure (1997) - Live
  { id: 'nin-12-01', name: 'Terrible Lie', album: 'Closure', releaseYear: 1997, haloNumber: 12 },
  { id: 'nin-12-02', name: 'Piggy', album: 'Closure', releaseYear: 1997, haloNumber: 12 },
  { id: 'nin-12-03', name: 'Down in It', album: 'Closure', releaseYear: 1997, haloNumber: 12 },
  { id: 'nin-12-04', name: 'March of the Pigs', album: 'Closure', releaseYear: 1997, haloNumber: 12 },
  { id: 'nin-12-05', name: 'The Only Time', album: 'Closure', releaseYear: 1997, haloNumber: 12 },
  { id: 'nin-12-06', name: 'Wish', album: 'Closure', releaseYear: 1997, haloNumber: 12 },
  { id: 'nin-12-07', name: 'Hurt (With David Bowie)', album: 'Closure', releaseYear: 1997, haloNumber: 12 },
  { id: 'nin-12-08', name: 'Something I Can Never Have', album: 'Closure', releaseYear: 1997, haloNumber: 12 },

  // HALO 13: The Day the World Went Away (1999)
  { id: 'nin-13-01', name: 'The Day the World Went Away (Single Version)', album: 'The Day the World Went Away', releaseYear: 1999, haloNumber: 13 },
  { id: 'nin-13-02', name: 'Starfuckers, Inc.', album: 'The Day the World Went Away', releaseYear: 1999, haloNumber: 13 },
  { id: 'nin-13-03', name: 'The Day the World Went Away (Quiet)', album: 'The Day the World Went Away', releaseYear: 1999, haloNumber: 13 },
  { id: 'nin-13-04', name: 'Where Is Everybody?', album: 'The Day the World Went Away', releaseYear: 1999, haloNumber: 13 },

  // HALO 14: The Fragile (1999)
  { id: 'nin-14-01', name: 'Somewhat Damaged', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-02', name: 'The Day the World Went Away', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-03', name: 'The Frail', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-04', name: 'The Wretched', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-05', name: "We're in This Together", album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-06', name: 'The Fragile', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-07', name: 'Just Like You Imagined', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-08', name: 'Even Deeper', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-09', name: 'Pilgrimage', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-10', name: "No, You Don't", album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-11', name: 'La Mer', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-12', name: 'The Great Below', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-13', name: 'The Way Out Is Through', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-14', name: 'Into the Void', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-15', name: 'Where Is Everybody?', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-16', name: 'The Mark Has Been Made', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-17', name: 'Please', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-18', name: 'Starfuckers, Inc.', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-19', name: 'Complication', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-20', name: "I'm Looking Forward to Joining You, Finally", album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-21', name: 'The Big Come Down', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-22', name: 'Underneath It All', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },
  { id: 'nin-14-23', name: 'Ripe (With Decay)', album: 'The Fragile', releaseYear: 1999, haloNumber: 14 },

  // HALO 15: We're in This Together (1999)
  { id: 'nin-15-01', name: "We're in This Together", album: "We're in This Together", releaseYear: 1999, haloNumber: 15 },
  { id: 'nin-15-02', name: '10 Miles High', album: "We're in This Together", releaseYear: 1999, haloNumber: 15 },
  { id: 'nin-15-03', name: 'The New Flesh', album: "We're in This Together", releaseYear: 1999, haloNumber: 15 },
  { id: 'nin-15-04', name: "We're in This Together - Radio Edit", album: "We're in This Together", releaseYear: 1999, haloNumber: 15 },
  { id: 'nin-15-05', name: 'Complications of the Flesh', album: "We're in This Together", releaseYear: 1999, haloNumber: 15 },
  { id: 'nin-15-06', name: 'The Perfect Drug', album: "We're in This Together", releaseYear: 1999, haloNumber: 15 },

  // HALO 16: Things Falling Apart (2000)
  { id: 'nin-16-01', name: 'Slipping Away - Remix', album: 'Things Falling Apart', releaseYear: 2000, haloNumber: 16 },
  { id: 'nin-16-02', name: 'The Great Collapse - Remix', album: 'Things Falling Apart', releaseYear: 2000, haloNumber: 16 },
  { id: 'nin-16-03', name: 'The Wretched - Remix', album: 'Things Falling Apart', releaseYear: 2000, haloNumber: 16 },
  { id: 'nin-16-04', name: 'Starfuckers, Inc. - Remix (AS)', album: 'Things Falling Apart', releaseYear: 2000, haloNumber: 16 },
  { id: 'nin-16-05', name: 'The Frail - Remix', album: 'Things Falling Apart', releaseYear: 2000, haloNumber: 16 },
  { id: 'nin-16-06', name: 'Starfuckers, Inc. - Remix (DO)', album: 'Things Falling Apart', releaseYear: 2000, haloNumber: 16 },
  { id: 'nin-16-07', name: 'Where Is Everybody? - Remix', album: 'Things Falling Apart', releaseYear: 2000, haloNumber: 16 },
  { id: 'nin-16-08', name: 'Metal - Remix', album: 'Things Falling Apart', releaseYear: 2000, haloNumber: 16 },
  { id: 'nin-16-09', name: '10 Miles High - Remix', album: 'Things Falling Apart', releaseYear: 2000, haloNumber: 16 },
  { id: 'nin-16-10', name: 'Starfuckers, Inc. - Remix (CC)', album: 'Things Falling Apart', releaseYear: 2000, haloNumber: 16 },

  // HALO 17: And All That Could Have Been (2002)
  { id: 'nin-17-01', name: 'Terrible Lie', album: 'And All That Could Have Been', releaseYear: 2002, haloNumber: 17 },
  { id: 'nin-17-02', name: 'Sin', album: 'And All That Could Have Been', releaseYear: 2002, haloNumber: 17 },
  { id: 'nin-17-03', name: 'March of the Pigs', album: 'And All That Could Have Been', releaseYear: 2002, haloNumber: 17 },
  { id: 'nin-17-04', name: 'Piggy', album: 'And All That Could Have Been', releaseYear: 2002, haloNumber: 17 },
  { id: 'nin-17-05', name: 'The Frail', album: 'And All That Could Have Been', releaseYear: 2002, haloNumber: 17 },
  { id: 'nin-17-06', name: 'The Wretched', album: 'And All That Could Have Been', releaseYear: 2002, haloNumber: 17 },
  { id: 'nin-17-07', name: 'Gave Up', album: 'And All That Could Have Been', releaseYear: 2002, haloNumber: 17 },
  { id: 'nin-17-08', name: 'The Great Below', album: 'And All That Could Have Been', releaseYear: 2002, haloNumber: 17 },
  { id: 'nin-17-09', name: 'The Mark Has Been Made', album: 'And All That Could Have Been', releaseYear: 2002, haloNumber: 17 },
  { id: 'nin-17-10', name: 'Wish', album: 'And All That Could Have Been', releaseYear: 2002, haloNumber: 17 },
  { id: 'nin-17-11', name: 'Suck', album: 'And All That Could Have Been', releaseYear: 2002, haloNumber: 17 },
  { id: 'nin-17-12', name: 'Closer', album: 'And All That Could Have Been', releaseYear: 2002, haloNumber: 17 },
  { id: 'nin-17-13', name: 'Head Like a Hole', album: 'And All That Could Have Been', releaseYear: 2002, haloNumber: 17 },
  { id: 'nin-17-14', name: 'The Day the World Went Away', album: 'And All That Could Have Been', releaseYear: 2002, haloNumber: 17 },
  { id: 'nin-17-15', name: 'Starfuckers, Inc.', album: 'And All That Could Have Been', releaseYear: 2002, haloNumber: 17 },
  { id: 'nin-17-16', name: 'Hurt', album: 'And All That Could Have Been', releaseYear: 2002, haloNumber: 17 },

  // HALO 17b: Still (2002)
  { id: 'nin-17b-01', name: 'Something I Can Never Have', album: 'Still', releaseYear: 2002, haloNumber: 17 },
  { id: 'nin-17b-02', name: 'Adrift & at Peace', album: 'Still', releaseYear: 2002, haloNumber: 17 },
  { id: 'nin-17b-03', name: 'The Fragile', album: 'Still', releaseYear: 2002, haloNumber: 17 },
  { id: 'nin-17b-04', name: 'The Becoming', album: 'Still', releaseYear: 2002, haloNumber: 17 },
  { id: 'nin-17b-05', name: 'Gone, Still', album: 'Still', releaseYear: 2002, haloNumber: 17 },
  { id: 'nin-17b-06', name: 'The Day the World Went Away', album: 'Still', releaseYear: 2002, haloNumber: 17 },
  { id: 'nin-17b-07', name: 'And All That Could Have Been', album: 'Still', releaseYear: 2002, haloNumber: 17 },
  { id: 'nin-17b-08', name: 'The Persistence of Loss', album: 'Still', releaseYear: 2002, haloNumber: 17 },
  { id: 'nin-17b-09', name: 'Leaving Hope', album: 'Still', releaseYear: 2002, haloNumber: 17 },

  // HALO 18: The Hand That Feeds (2005)
  { id: 'nin-18-01', name: 'The Hand That Feeds', album: 'The Hand That Feeds', releaseYear: 2005, haloNumber: 18 },
  { id: 'nin-18-02', name: 'The Hand That Feeds - DFA Remix', album: 'The Hand That Feeds', releaseYear: 2005, haloNumber: 18 },
  { id: 'nin-18-03', name: 'Love Is Not Enough - Live', album: 'The Hand That Feeds', releaseYear: 2005, haloNumber: 18 },

  // HALO 19: With Teeth (2005)
  { id: 'nin-19-01', name: 'All the Love in the World', album: 'With Teeth', releaseYear: 2005, haloNumber: 19 },
  { id: 'nin-19-02', name: 'You Know What You Are?', album: 'With Teeth', releaseYear: 2005, haloNumber: 19 },
  { id: 'nin-19-03', name: 'The Collector', album: 'With Teeth', releaseYear: 2005, haloNumber: 19 },
  { id: 'nin-19-04', name: 'The Hand That Feeds', album: 'With Teeth', releaseYear: 2005, haloNumber: 19 },
  { id: 'nin-19-05', name: 'Love Is Not Enough', album: 'With Teeth', releaseYear: 2005, haloNumber: 19 },
  { id: 'nin-19-06', name: 'Every Day Is Exactly the Same', album: 'With Teeth', releaseYear: 2005, haloNumber: 19 },
  { id: 'nin-19-07', name: 'With Teeth', album: 'With Teeth', releaseYear: 2005, haloNumber: 19 },
  { id: 'nin-19-08', name: 'Only', album: 'With Teeth', releaseYear: 2005, haloNumber: 19 },
  { id: 'nin-19-09', name: 'Getting Smaller', album: 'With Teeth', releaseYear: 2005, haloNumber: 19 },
  { id: 'nin-19-10', name: 'Sunspots', album: 'With Teeth', releaseYear: 2005, haloNumber: 19 },
  { id: 'nin-19-11', name: 'The Line Begins to Blur', album: 'With Teeth', releaseYear: 2005, haloNumber: 19 },
  { id: 'nin-19-12', name: 'Beside You in Time', album: 'With Teeth', releaseYear: 2005, haloNumber: 19 },
  { id: 'nin-19-13', name: 'Right Where It Belongs', album: 'With Teeth', releaseYear: 2005, haloNumber: 19 },

  // HALO 20: Only (2005)
  { id: 'nin-20-01', name: 'Only', album: 'Only', releaseYear: 2005, haloNumber: 20 },
  { id: 'nin-20-02', name: 'The Hand That Feeds - DFA Remix', album: 'Only', releaseYear: 2005, haloNumber: 20 },
  { id: 'nin-20-03', name: 'Love Is Not Enough - Live', album: 'Only', releaseYear: 2005, haloNumber: 20 },

  // HALO 21: Every Day Is Exactly the Same (2006)
  { id: 'nin-21-01', name: 'Every Day Is Exactly the Same', album: 'Every Day Is Exactly the Same', releaseYear: 2006, haloNumber: 21 },
  { id: 'nin-21-02', name: 'The Hand That Feeds - DFA Remix', album: 'Every Day Is Exactly the Same', releaseYear: 2006, haloNumber: 21 },
  { id: 'nin-21-03', name: 'The Hand That Feeds - Photek Straight Remix', album: 'Every Day Is Exactly the Same', releaseYear: 2006, haloNumber: 21 },
  { id: 'nin-21-04', name: 'On', album: 'Every Day Is Exactly the Same', releaseYear: 2006, haloNumber: 21 },

  // HALO 22: Beside You in Time (2007) - Live
  { id: 'nin-22-01', name: 'All the Love in the World', album: 'Beside You in Time', releaseYear: 2007, haloNumber: 22 },
  { id: 'nin-22-02', name: 'You Know What You Are?', album: 'Beside You in Time', releaseYear: 2007, haloNumber: 22 },
  { id: 'nin-22-03', name: 'Discipline', album: 'Beside You in Time', releaseYear: 2007, haloNumber: 22 },
  { id: 'nin-22-04', name: 'Every Day Is Exactly the Same', album: 'Beside You in Time', releaseYear: 2007, haloNumber: 22 },
  { id: 'nin-22-05', name: 'Echoplex', album: 'Beside You in Time', releaseYear: 2007, haloNumber: 22 },
  { id: 'nin-22-06', name: 'The Hand That Feeds', album: 'Beside You in Time', releaseYear: 2007, haloNumber: 22 },
  { id: 'nin-22-07', name: "Me, I'm Not", album: 'Beside You in Time', releaseYear: 2007, haloNumber: 22 },
  { id: 'nin-22-08', name: 'Capital G', album: 'Beside You in Time', releaseYear: 2007, haloNumber: 22 },
  { id: 'nin-22-09', name: 'The Great Destroyer', album: 'Beside You in Time', releaseYear: 2007, haloNumber: 22 },
  { id: 'nin-22-10', name: 'The Good Soldier', album: 'Beside You in Time', releaseYear: 2007, haloNumber: 22 },
  { id: 'nin-22-11', name: 'Survivalism', album: 'Beside You in Time', releaseYear: 2007, haloNumber: 22 },
  { id: 'nin-22-12', name: 'Vessel', album: 'Beside You in Time', releaseYear: 2007, haloNumber: 22 },
  { id: 'nin-22-13', name: "Now I'm Nothing", album: 'Beside You in Time', releaseYear: 2007, haloNumber: 22 },
  { id: 'nin-22-14', name: 'Hurt', album: 'Beside You in Time', releaseYear: 2007, haloNumber: 22 },

  // HALO 23: Survivalism (2007)
  { id: 'nin-23-01', name: 'Survivalism', album: 'Survivalism', releaseYear: 2007, haloNumber: 23 },
  { id: 'nin-23-02', name: 'Survivalism (Live)', album: 'Survivalism', releaseYear: 2007, haloNumber: 23 },

  // HALO 24: Year Zero (2007)
  { id: 'nin-24-01', name: 'Hyperpower!', album: 'Year Zero', releaseYear: 2007, haloNumber: 24 },
  { id: 'nin-24-02', name: 'The Beginning of the End', album: 'Year Zero', releaseYear: 2007, haloNumber: 24 },
  { id: 'nin-24-03', name: 'Survivalism', album: 'Year Zero', releaseYear: 2007, haloNumber: 24 },
  { id: 'nin-24-04', name: 'The Good Soldier', album: 'Year Zero', releaseYear: 2007, haloNumber: 24 },
  { id: 'nin-24-05', name: 'Vessel', album: 'Year Zero', releaseYear: 2007, haloNumber: 24 },
  { id: 'nin-24-06', name: "Me, I'm Not", album: 'Year Zero', releaseYear: 2007, haloNumber: 24 },
  { id: 'nin-24-07', name: 'Capital G', album: 'Year Zero', releaseYear: 2007, haloNumber: 24 },
  { id: 'nin-24-08', name: 'My Violent Heart', album: 'Year Zero', releaseYear: 2007, haloNumber: 24 },
  { id: 'nin-24-09', name: 'The Warning', album: 'Year Zero', releaseYear: 2007, haloNumber: 24 },
  { id: 'nin-24-10', name: 'God Given', album: 'Year Zero', releaseYear: 2007, haloNumber: 24 },
  { id: 'nin-24-11', name: 'Meet Your Master', album: 'Year Zero', releaseYear: 2007, haloNumber: 24 },
  { id: 'nin-24-12', name: 'The Greater Good', album: 'Year Zero', releaseYear: 2007, haloNumber: 24 },
  { id: 'nin-24-13', name: 'The Great Destroyer', album: 'Year Zero', releaseYear: 2007, haloNumber: 24 },
  { id: 'nin-24-14', name: 'Another Version of the Truth', album: 'Year Zero', releaseYear: 2007, haloNumber: 24 },
  { id: 'nin-24-15', name: 'In This Twilight', album: 'Year Zero', releaseYear: 2007, haloNumber: 24 },
  { id: 'nin-24-16', name: 'Zero Sum', album: 'Year Zero', releaseYear: 2007, haloNumber: 24 },

  // HALO 25: Year Zero Remixed (2007)
  { id: 'nin-25-01', name: 'Survivalism - Autechre Remix', album: 'Year Zero Remixed', releaseYear: 2007, haloNumber: 25 },
  { id: 'nin-25-02', name: 'The Good Soldier - Danger Mouse Remix', album: 'Year Zero Remixed', releaseYear: 2007, haloNumber: 25 },
  { id: 'nin-25-03', name: 'Vessel - Ladytron Remix', album: 'Year Zero Remixed', releaseYear: 2007, haloNumber: 25 },
  { id: 'nin-25-04', name: "Me, I'm Not - Trent Reznor Remix", album: 'Year Zero Remixed', releaseYear: 2007, haloNumber: 25 },
  { id: 'nin-25-05', name: 'Capital G - Jello Biafra Remix', album: 'Year Zero Remixed', releaseYear: 2007, haloNumber: 25 },

  // HALO 26: Ghosts I-IV (2008) - 37 tracks
  { id: 'nin-26-01', name: 'Ghosts I-1', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-02', name: 'Ghosts I-2', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-03', name: 'Ghosts I-3', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-04', name: 'Ghosts I-4', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-05', name: 'Ghosts I-5', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-06', name: 'Ghosts I-6', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-07', name: 'Ghosts I-7', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-08', name: 'Ghosts I-8', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-09', name: 'Ghosts I-9', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-10', name: 'Ghosts II-1', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-11', name: 'Ghosts II-2', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-12', name: 'Ghosts II-3', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-13', name: 'Ghosts II-4', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-14', name: 'Ghosts II-5', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-15', name: 'Ghosts II-6', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-16', name: 'Ghosts II-7', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-17', name: 'Ghosts II-8', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-18', name: 'Ghosts II-9', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-19', name: 'Ghosts III-1', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-20', name: 'Ghosts III-2', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-21', name: 'Ghosts III-3', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-22', name: 'Ghosts III-4', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-23', name: 'Ghosts III-5', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-24', name: 'Ghosts III-6', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-25', name: 'Ghosts III-7', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-26', name: 'Ghosts III-8', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-27', name: 'Ghosts III-9', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-28', name: 'Ghosts III-10', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-29', name: 'Ghosts IV-1', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-30', name: 'Ghosts IV-2', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-31', name: 'Ghosts IV-3', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-32', name: 'Ghosts IV-4', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-33', name: 'Ghosts IV-5', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-34', name: 'Ghosts IV-6', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-35', name: 'Ghosts IV-7', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-36', name: 'Ghosts IV-8', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },
  { id: 'nin-26-37', name: 'Ghosts IV-9', album: 'Ghosts I-IV', releaseYear: 2008, haloNumber: 26 },

  // HALO 27: The Slip (2008)
  { id: 'nin-27-01', name: '999,999', album: 'The Slip', releaseYear: 2008, haloNumber: 27 },
  { id: 'nin-27-02', name: '1,000,000', album: 'The Slip', releaseYear: 2008, haloNumber: 27 },
  { id: 'nin-27-03', name: 'Letting You', album: 'The Slip', releaseYear: 2008, haloNumber: 27 },
  { id: 'nin-27-04', name: 'Discipline', album: 'The Slip', releaseYear: 2008, haloNumber: 27 },
  { id: 'nin-27-05', name: 'Echoplex', album: 'The Slip', releaseYear: 2008, haloNumber: 27 },
  { id: 'nin-27-06', name: 'Head Down', album: 'The Slip', releaseYear: 2008, haloNumber: 27 },
  { id: 'nin-27-07', name: 'Lights in the Sky', album: 'The Slip', releaseYear: 2008, haloNumber: 27 },
  { id: 'nin-27-08', name: 'Corona Radiata', album: 'The Slip', releaseYear: 2008, haloNumber: 27 },
  { id: 'nin-27-09', name: 'The Four of Us Are Dying', album: 'The Slip', releaseYear: 2008, haloNumber: 27 },
  { id: 'nin-27-10', name: 'Demon Seed', album: 'The Slip', releaseYear: 2008, haloNumber: 27 },

  // HALO 28: Hesitation Marks (2013)
  { id: 'nin-28-01', name: 'The Eater of Dreams', album: 'Hesitation Marks', releaseYear: 2013, haloNumber: 28 },
  { id: 'nin-28-02', name: 'Copy of A', album: 'Hesitation Marks', releaseYear: 2013, haloNumber: 28 },
  { id: 'nin-28-03', name: 'Came Back Haunted', album: 'Hesitation Marks', releaseYear: 2013, haloNumber: 28 },
  { id: 'nin-28-04', name: 'Find My Way', album: 'Hesitation Marks', releaseYear: 2013, haloNumber: 28 },
  { id: 'nin-28-05', name: 'All Time Low', album: 'Hesitation Marks', releaseYear: 2013, haloNumber: 28 },
  { id: 'nin-28-06', name: 'Disappointed', album: 'Hesitation Marks', releaseYear: 2013, haloNumber: 28 },
  { id: 'nin-28-07', name: 'Everything', album: 'Hesitation Marks', releaseYear: 2013, haloNumber: 28 },
  { id: 'nin-28-08', name: 'Satellite', album: 'Hesitation Marks', releaseYear: 2013, haloNumber: 28 },
  { id: 'nin-28-09', name: 'Various Methods of Escape', album: 'Hesitation Marks', releaseYear: 2013, haloNumber: 28 },
  { id: 'nin-28-10', name: 'Running', album: 'Hesitation Marks', releaseYear: 2013, haloNumber: 28 },
  { id: 'nin-28-11', name: 'I Would for You', album: 'Hesitation Marks', releaseYear: 2013, haloNumber: 28 },
  { id: 'nin-28-12', name: 'In Two', album: 'Hesitation Marks', releaseYear: 2013, haloNumber: 28 },
  { id: 'nin-28-13', name: "While I'm Still Here", album: 'Hesitation Marks', releaseYear: 2013, haloNumber: 28 },
  { id: 'nin-28-14', name: 'Black Noise', album: 'Hesitation Marks', releaseYear: 2013, haloNumber: 28 },

  // HALO 29: Not the Actual Events (2016)
  { id: 'nin-29-01', name: 'Branches / Bones', album: 'Not the Actual Events', releaseYear: 2016, haloNumber: 29 },
  { id: 'nin-29-02', name: 'Dear World', album: 'Not the Actual Events', releaseYear: 2016, haloNumber: 29 },
  { id: 'nin-29-03', name: "She's Gone Away", album: 'Not the Actual Events', releaseYear: 2016, haloNumber: 29 },
  { id: 'nin-29-04', name: 'The Idea of You', album: 'Not the Actual Events', releaseYear: 2016, haloNumber: 29 },
  { id: 'nin-29-05', name: 'Burning Bright (Field on Fire)', album: 'Not the Actual Events', releaseYear: 2016, haloNumber: 29 },

  // HALO 30: The Fragile: Deviations 1 (2016)
  { id: 'nin-30-01', name: 'The Frail - Deviations 1', album: 'The Fragile: Deviations 1', releaseYear: 2016, haloNumber: 30 },
  { id: 'nin-30-02', name: 'Somewhat Damaged - Deviations 1', album: 'The Fragile: Deviations 1', releaseYear: 2016, haloNumber: 30 },
  { id: 'nin-30-03', name: 'The Wretched - Deviations 1', album: 'The Fragile: Deviations 1', releaseYear: 2016, haloNumber: 30 },
  { id: 'nin-30-04', name: "We're in This Together - Deviations 1", album: 'The Fragile: Deviations 1', releaseYear: 2016, haloNumber: 30 },
  { id: 'nin-30-05', name: 'The Fragile - Deviations 1', album: 'The Fragile: Deviations 1', releaseYear: 2016, haloNumber: 30 },

  // HALO 31: Add Violence (2017)
  { id: 'nin-31-01', name: 'Less Than', album: 'Add Violence', releaseYear: 2017, haloNumber: 31 },
  { id: 'nin-31-02', name: 'The Lovers', album: 'Add Violence', releaseYear: 2017, haloNumber: 31 },
  { id: 'nin-31-03', name: "This Isn't the Place", album: 'Add Violence', releaseYear: 2017, haloNumber: 31 },
  { id: 'nin-31-04', name: 'Not Anymore', album: 'Add Violence', releaseYear: 2017, haloNumber: 31 },
  { id: 'nin-31-05', name: 'The Background World', album: 'Add Violence', releaseYear: 2017, haloNumber: 31 },

  // HALO 32: Bad Witch (2018)
  { id: 'nin-32-01', name: 'Godless', album: 'Bad Witch', releaseYear: 2018, haloNumber: 32 },
  { id: 'nin-32-02', name: 'Sanctified', album: 'Bad Witch', releaseYear: 2018, haloNumber: 32 },
  { id: 'nin-32-03', name: 'Apple of Sodom', album: 'Bad Witch', releaseYear: 2018, haloNumber: 32 },
  { id: 'nin-32-04', name: 'Burn', album: 'Bad Witch', releaseYear: 2018, haloNumber: 32 },
  { id: 'nin-32-05', name: 'Branches', album: 'Bad Witch', releaseYear: 2018, haloNumber: 32 },
  { id: 'nin-32-06', name: 'Play the Fucking Song', album: 'Bad Witch', releaseYear: 2018, haloNumber: 32 },

  // HALO 33: Ghosts V: Together (2020)
  { id: 'nin-33-01', name: 'Letting Go While Holding On', album: 'Ghosts V: Together', releaseYear: 2020, haloNumber: 33 },
  { id: 'nin-33-02', name: 'Together', album: 'Ghosts V: Together', releaseYear: 2020, haloNumber: 33 },
  { id: 'nin-33-03', name: 'Out in the Open', album: 'Ghosts V: Together', releaseYear: 2020, haloNumber: 33 },
  { id: 'nin-33-04', name: 'With Faith', album: 'Ghosts V: Together', releaseYear: 2020, haloNumber: 33 },
  { id: 'nin-33-05', name: 'Apart', album: 'Ghosts V: Together', releaseYear: 2020, haloNumber: 33 },
  { id: 'nin-33-06', name: 'Your Touch', album: 'Ghosts V: Together', releaseYear: 2020, haloNumber: 33 },
  { id: 'nin-33-07', name: 'Hope We Can Again', album: 'Ghosts V: Together', releaseYear: 2020, haloNumber: 33 },
  { id: 'nin-33-08', name: 'Still Right Here', album: 'Ghosts V: Together', releaseYear: 2020, haloNumber: 33 },

  // HALO 34: Ghosts VI: Locusts (2020)
  { id: 'nin-34-01', name: 'The Cursed Clock', album: 'Ghosts VI: Locusts', releaseYear: 2020, haloNumber: 34 },
  { id: 'nin-34-02', name: 'Around Every Corner', album: 'Ghosts VI: Locusts', releaseYear: 2020, haloNumber: 34 },
  { id: 'nin-34-03', name: 'The Worriment Waltz', album: 'Ghosts VI: Locusts', releaseYear: 2020, haloNumber: 34 },
  { id: 'nin-34-04', name: 'Run Like Hell', album: 'Ghosts VI: Locusts', releaseYear: 2020, haloNumber: 34 },
  { id: 'nin-34-05', name: "When It Happens (Don't Mind Me)", album: 'Ghosts VI: Locusts', releaseYear: 2020, haloNumber: 34 },
  { id: 'nin-34-06', name: 'Another Crashed Car', album: 'Ghosts VI: Locusts', releaseYear: 2020, haloNumber: 34 },
  { id: 'nin-34-07', name: 'Temp Fix', album: 'Ghosts VI: Locusts', releaseYear: 2020, haloNumber: 34 },
  { id: 'nin-34-08', name: 'Trust Fades', album: 'Ghosts VI: Locusts', releaseYear: 2020, haloNumber: 34 },
  { id: 'nin-34-09', name: 'A Really Bad Night', album: 'Ghosts VI: Locusts', releaseYear: 2020, haloNumber: 34 },
  { id: 'nin-34-10', name: 'Your New Normal', album: 'Ghosts VI: Locusts', releaseYear: 2020, haloNumber: 34 },
  { id: 'nin-34-11', name: 'Just Breathe', album: 'Ghosts VI: Locusts', releaseYear: 2020, haloNumber: 34 },
  { id: 'nin-34-12', name: 'Right Behind You', album: 'Ghosts VI: Locusts', releaseYear: 2020, haloNumber: 34 },
  { id: 'nin-34-13', name: 'Turn This Off Please', album: 'Ghosts VI: Locusts', releaseYear: 2020, haloNumber: 34 },
  { id: 'nin-34-14', name: 'So Tired', album: 'Ghosts VI: Locusts', releaseYear: 2020, haloNumber: 34 },
  { id: 'nin-34-15', name: 'Almost Dawn', album: 'Ghosts VI: Locusts', releaseYear: 2020, haloNumber: 34 },

  // HALO 38: Nine Inch Noize (2026)
  { id: 'nin-38-01', name: 'Intro (Nine Inch Noize Version)', album: 'Nine Inch Noize', releaseYear: 2026, haloNumber: 38 },
  { id: 'nin-38-02', name: 'Vessel (Nine Inch Noize Version)', album: 'Nine Inch Noize', releaseYear: 2026, haloNumber: 38 },
  { id: 'nin-38-03', name: "She's Gone Away (Nine Inch Noize Version)", album: 'Nine Inch Noize', releaseYear: 2026, haloNumber: 38 },
  { id: 'nin-38-04', name: 'Heresy (Nine Inch Noize Version)', album: 'Nine Inch Noize', releaseYear: 2026, haloNumber: 38 },
  { id: 'nin-38-05', name: 'Parasite (Nine Inch Noize Version)', album: 'Nine Inch Noize', releaseYear: 2026, haloNumber: 38 },
  { id: 'nin-38-06', name: 'Copy Of A (Nine Inch Noize Version)', album: 'Nine Inch Noize', releaseYear: 2026, haloNumber: 38 },
  { id: 'nin-38-07', name: "Me I'm Not (Nine Inch Noize Version)", album: 'Nine Inch Noize', releaseYear: 2026, haloNumber: 38 },
  { id: 'nin-38-08', name: 'Closer (Nine Inch Noize Version)', album: 'Nine Inch Noize', releaseYear: 2026, haloNumber: 38 },
  { id: 'nin-38-09', name: 'The Warning (Nine Inch Noize Version)', album: 'Nine Inch Noize', releaseYear: 2026, haloNumber: 38 },
  { id: 'nin-38-10', name: 'Memorabilia (Nine Inch Noize Version)', album: 'Nine Inch Noize', releaseYear: 2026, haloNumber: 38 },
  { id: 'nin-38-11', name: 'Came Back Haunted (Nine Inch Noize Version)', album: 'Nine Inch Noize', releaseYear: 2026, haloNumber: 38 },
  { id: 'nin-38-12', name: 'As Alive As You Need Me To Be (Nine Inch Noize Version)', album: 'Nine Inch Noize', releaseYear: 2026, haloNumber: 38 },
];

// Album search queries for iTunes API - grouped by halo
const ALBUM_SEARCHES = [
  { halo: 1, query: 'nine inch nails down in it', albums: ['Down in It'] },
  { halo: 2, query: 'nine inch nails pretty hate machine', albums: ['Pretty Hate Machine'] },
  { halo: 3, query: 'nine inch nails head like a hole single', albums: ['Head Like a Hole'] },
  { halo: 4, query: 'nine inch nails sin single', albums: ['Sin'] },
  { halo: 5, query: 'nine inch nails broken', albums: ['Broken'] },
  { halo: 6, query: 'nine inch nails fixed', albums: ['Fixed'] },
  { halo: 7, query: 'nine inch nails march of the pigs single', albums: ['March of the Pigs'] },
  { halo: 8, query: 'nine inch nails the downward spiral', albums: ['The Downward Spiral'] },
  { halo: 9, query: 'nine inch nails closer to god', albums: ['Closer to God'] },
  { halo: 10, query: 'nine inch nails further down the spiral', albums: ['Further Down the Spiral'] },
  { halo: 11, query: 'nine inch nails the perfect drug versions', albums: ['The Perfect Drug Versions'] },
  { halo: 12, query: 'nine inch nails closure', albums: ['Closure'] },
  { halo: 13, query: 'nine inch nails day the world went away single', albums: ['The Day the World Went Away'] },
  { halo: 14, query: 'nine inch nails the fragile', albums: ['The Fragile'] },
  { halo: 15, query: "nine inch nails we're in this together single", albums: ["We're in This Together"] },
  { halo: 16, query: 'nine inch nails things falling apart', albums: ['Things Falling Apart'] },
  { halo: 17, query: 'nine inch nails and all that could have been', albums: ['And All That Could Have Been'] },
  { halo: '17b', query: 'nine inch nails still', albums: ['Still'] },
  { halo: 18, query: 'nine inch nails the hand that feeds single', albums: ['The Hand That Feeds'] },
  { halo: 19, query: 'nine inch nails with teeth', albums: ['With Teeth'] },
  { halo: 20, query: 'nine inch nails only single', albums: ['Only'] },
  { halo: 21, query: 'nine inch nails every day is exactly the same', albums: ['Every Day Is Exactly the Same'] },
  { halo: 22, query: 'nine inch nails beside you in time', albums: ['Beside You in Time'] },
  { halo: 23, query: 'nine inch nails survivalism single', albums: ['Survivalism'] },
  { halo: 24, query: 'nine inch nails year zero', albums: ['Year Zero'] },
  { halo: 25, query: 'nine inch nails year zero remixed', albums: ['Year Zero Remixed'] },
  { halo: 26, query: 'nine inch nails ghosts i-iv', albums: ['Ghosts I-IV'] },
  { halo: 27, query: 'nine inch nails the slip', albums: ['The Slip'] },
  { halo: 28, query: 'nine inch nails hesitation marks', albums: ['Hesitation Marks'] },
  { halo: 29, query: 'nine inch nails not the actual events', albums: ['Not the Actual Events'] },
  { halo: 30, query: 'nine inch nails the fragile deviations', albums: ['The Fragile: Deviations 1'] },
  { halo: 31, query: 'nine inch nails add violence', albums: ['Add Violence'] },
  { halo: 32, query: 'nine inch nails bad witch', albums: ['Bad Witch'] },
  { halo: 33, query: 'nine inch nails ghosts v together', albums: ['Ghosts V: Together'] },
  { halo: 34, query: 'nine inch nails ghosts vi locusts', albums: ['Ghosts VI: Locusts'] },
  { halo: 38, query: 'nine inch nails nine inch noize boys noize', albums: ['Nine Inch Noize'] },
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function normalize(str) {
  return str.toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function songNameMatchScore(itunes, seed) {
  const a = normalize(itunes);
  const b = normalize(seed);
  if (a === b) return 100;
  // Check if seed name is contained in iTunes name or vice versa
  if (a.includes(b) || b.includes(a)) return 80;
  // Strip common suffixes and try again
  const stripSuffixes = s => s
    .replace(/\s*\(.*?\)/g, '')
    .replace(/\s*-\s*(single|remaster|remastered|radio edit|album version|\d{4}).*$/i, '')
    .trim();
  const a2 = stripSuffixes(a);
  const b2 = stripSuffixes(b);
  if (a2 === b2) return 75;
  if (a2.includes(b2) || b2.includes(a2)) return 60;
  return 0;
}

async function searchITunes(query, limit = 100) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=${limit}&country=US`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`  iTunes API error: ${res.status}`);
      return [];
    }
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error(`  Fetch error: ${err.message}`);
    return [];
  }
}

async function main() {
  // Load existing links
  const songLinks = JSON.parse(fs.readFileSync(SONG_LINKS_PATH, 'utf8'));
  
  // Build index of songs needing Apple Music links
  const needsLink = new Set();
  for (const song of NIN_SONGS) {
    const entry = songLinks[song.id];
    if (!entry || !entry.appleMusicUrl) {
      needsLink.add(song.id);
    }
  }
  
  console.log(`Total songs: ${NIN_SONGS.length}`);
  console.log(`Already have Apple Music links: ${NIN_SONGS.length - needsLink.size}`);
  console.log(`Need Apple Music links: ${needsLink.size}`);
  console.log('');
  
  let found = 0;
  let skipped = 0;
  
  // Process each album group
  for (const albumSearch of ALBUM_SEARCHES) {
    const albumSongs = NIN_SONGS.filter(s => {
      const idPrefix = albumSearch.halo === '17b' ? 'nin-17b-' : `nin-${albumSearch.halo}-`;
      return s.id.startsWith(idPrefix);
    });
    
    // Check if any song in this album needs a link
    const albumNeedsLinks = albumSongs.filter(s => needsLink.has(s.id));
    
    if (albumNeedsLinks.length === 0) {
      console.log(`✓ Halo ${albumSearch.halo} (${albumSearch.albums[0]}): all links present`);
      continue;
    }
    
    console.log(`\n🔍 Halo ${albumSearch.halo} (${albumSearch.albums[0]}): searching iTunes...`);
    console.log(`  ${albumNeedsLinks.length} songs need links`);
    
    await sleep(150);
    const results = await searchITunes(albumSearch.query, 200);
    
    if (results.length === 0) {
      console.log(`  ⚠️  No results found - skipping`);
      skipped += albumNeedsLinks.length;
      continue;
    }
    
    console.log(`  Found ${results.length} iTunes tracks`);
    
    // Filter iTunes results to just this album's tracks (prefer exact collection name matches)
    const albumKeywords = albumSearch.albums.map(a => normalize(a));
    
    // Try to find the primary album version vs compilations
    const filteredResults = results.filter(r => {
      const col = normalize(r.collectionName || '');
      return albumKeywords.some(k => col.includes(k) || k.includes(col.replace(/\s*\(.*?\)/, '').trim()));
    });
    
    const searchPool = filteredResults.length > 0 ? filteredResults : results;
    console.log(`  Using ${searchPool.length} tracks from album-filtered results`);
    
    // Match each seed song to iTunes tracks
    for (const song of albumNeedsLinks) {
      let bestMatch = null;
      let bestScore = 0;
      
      for (const r of searchPool) {
        const score = songNameMatchScore(r.trackName || '', song.name);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = r;
        }
      }
      
      if (bestMatch && bestScore >= 60 && bestMatch.trackViewUrl) {
        // Ensure it's the album version (not a compilation if possible)
        if (!songLinks[song.id]) {
          songLinks[song.id] = {};
        }
        songLinks[song.id].appleMusicUrl = bestMatch.trackViewUrl;
        console.log(`  ✅ ${song.name} → ${bestMatch.trackName} (score: ${bestScore})`);
        found++;
      } else {
        console.log(`  ❌ ${song.name} → no match found (best: ${bestMatch ? bestMatch.trackName + ' score:' + bestScore : 'none'})`);
        skipped++;
      }
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`  Found: ${found} new Apple Music links`);
  console.log(`  Skipped: ${skipped} songs (not found)`);
  console.log(`  Total entries in song-links.json: ${Object.keys(songLinks).length}`);
  
  // Write updated song-links.json
  fs.writeFileSync(SONG_LINKS_PATH, JSON.stringify(songLinks, null, 2) + '\n');
  console.log(`\n✅ Written to ${SONG_LINKS_PATH}`);
  
  return songLinks;
}

main().catch(console.error);
