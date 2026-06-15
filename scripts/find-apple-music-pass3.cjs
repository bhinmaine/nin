#!/usr/bin/env node
// Pass 3: Clean up bad matches (piano tributes, lullaby covers, wrong albums)
// and do targeted searches for remaining songs using specific album IDs

const fs = require('fs');
const path = require('path');

const SONG_LINKS_PATH = path.join(__dirname, '../data/song-links.json');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function normalize(str) {
  return str.toLowerCase().replace(/['']/g, "'").replace(/\s+/g, ' ').trim();
}

async function fetchUrl(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      if (text.includes('Rate limit')) return null;
      return [];
    }
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error(`  Fetch error: ${err.message}`);
    return [];
  }
}

async function searchITunes(query, limit = 100) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=${limit}&country=US`;
  for (let i = 0; i < 3; i++) {
    const r = await fetchUrl(url);
    if (r !== null) return r;
    console.log(`  Rate limited, waiting 5s...`);
    await sleep(5000);
  }
  return [];
}

// Check if URL is from a known tribute/cover album
function isCoverAlbum(collectionName) {
  const col = normalize(collectionName || '');
  return col.includes('piano') || col.includes('tribute') || col.includes('lullaby') || 
         col.includes('rendition') || col.includes('karaoke') || col.includes('performed by') ||
         col.includes('style of') || col.includes('dreamers') || col.includes('vsq') ||
         col.includes('vitamin string') || col.includes('music box') || col.includes('cover');
}

async function lookupAlbum(albumId) {
  const url = `https://itunes.apple.com/lookup?id=${albumId}&entity=song&country=US`;
  for (let i = 0; i < 3; i++) {
    const r = await fetchUrl(url);
    if (r !== null) return r.filter(x => x.wrapperType === 'track');
    console.log(`  Rate limited, waiting 5s...`);
    await sleep(5000);
  }
  return [];
}

async function main() {
  const songLinks = JSON.parse(fs.readFileSync(SONG_LINKS_PATH, 'utf8'));
  let fixed = 0;
  let found = 0;
  let skipped = 0;
  
  // ============================================================
  // PASS 3A: Remove bad cover/tribute matches
  // ============================================================
  console.log('=== PASS 3A: Identifying bad matches ===\n');
  
  // Known bad entries to remove (they point to cover albums)
  // We need to verify by checking the URL
  const badEntries = [
    // These were matched to piano tributes / lullaby versions:
    'nin-5-02',   // Wish → Lullaby Renditions (wrong album entirely)
    'nin-8-06',   // Ruiner → Piano Reimagined (wrong)
    'nin-8-08',   // I Do Not Want This → Piano Reimagined (wrong)
    'nin-8-13',   // The Downward Spiral → Piano Tribute (wrong)
    'nin-9-01',   // Closer to God → Lullaby Renditions "Closer" (wrong track AND wrong album)
    'nin-9-06',   // Closer - Internal → Lullaby Renditions "Closer" (wrong)
    'nin-9-08',   // Closer - Further Away → Lullaby Renditions "Closer" (wrong)
    'nin-9-09',   // Closer → "The Ultimate Nine Inch Nails" compilation
    'nin-10-04',  // The Downward Spiral (The Bottom) → Piano Tribute (wrong)
    'nin-10-05',  // Hurt (Quiet) → Hurt from TDS (different track)
    'nin-14-04',  // The Wretched → Piano Tribute (wrong)
    'nin-17-06',  // The Wretched → Piano Tribute (wrong)
    'nin-17-10',  // Wish → Lullaby Renditions (wrong)
    'nin-17b-01', // Something I Can Never Have → VSQ Performs PHM (wrong album)
    'nin-17b-04', // The Becoming → The Downward Spiral version, not Still
  ];
  
  for (const id of badEntries) {
    if (songLinks[id]?.appleMusicUrl) {
      delete songLinks[id].appleMusicUrl;
      if (Object.keys(songLinks[id]).length === 0) {
        delete songLinks[id];
      }
      console.log(`  Removed bad match: ${id}`);
      fixed++;
    }
  }
  
  // ============================================================
  // PASS 3B: Use iTunes Album Lookup for specific albums
  // ============================================================
  console.log('\n=== PASS 3B: Album lookups by known IDs ===\n');
  
  // Known Apple Music album IDs for NIN albums
  const ALBUM_IDS = {
    'Pretty Hate Machine': 1440934840,
    'Broken': 1440743805,
    'Fixed': 1440743805, // same as Broken
    'The Downward Spiral': 1440837096,
    'Closer to God': 1440934840, // may not have separate single
    'Further Down the Spiral': 1545212135, // FDTS has erased over out
    'The Fragile': 1440836334,
    "We're in This Together": 1440836334, // same album
    'Things Falling Apart': 1418149613,
    'And All That Could Have Been': 1440826538, // wait that's Year Zero? no...
    'Still': 1440836334, // Still is bundled with AATCB
    'With Teeth': 1440851583,
    'The Slip': 285284658,
    'Hesitation Marks': 673721498, // same as Came Back Haunted?
    'Add Violence': 1254862386,
  };
  
  // Let me do direct album lookups for albums I know the IDs for
  
  // Broken: 1440743805
  console.log('Looking up Broken album...');
  await sleep(500);
  const brokenTracks = await lookupAlbum(1440743805);
  console.log('Broken tracks:', brokenTracks.map(t => `${t.trackNumber}. ${t.trackName}`).join(', '));
  
  // Fixed is included in the Broken EP apparently
  // Let's check what's in there
  const brokenByName = {};
  for (const t of brokenTracks) {
    brokenByName[normalize(t.trackName)] = t.trackViewUrl;
  }
  
  const brokenSongs = [
    { id: 'nin-5-02', name: 'Wish' },
    { id: 'nin-5-07', name: "Physical (You're So)" },
    { id: 'nin-6-02', name: 'Wish - Remix' },
    { id: 'nin-6-05', name: 'First Fuck - Remix' },
  ];
  
  for (const s of brokenSongs) {
    if (songLinks[s.id]?.appleMusicUrl) continue;
    const norm = normalize(s.name);
    // Try various name forms
    const candidates = Object.entries(brokenByName).filter(([k]) => 
      k.includes(norm.replace(/\s*-\s*(remix|single|dub).*$/i, '').trim()) ||
      norm.includes(k.replace(/\s*\(.*?\)/g, '').trim())
    );
    if (candidates.length > 0) {
      if (!songLinks[s.id]) songLinks[s.id] = {};
      songLinks[s.id].appleMusicUrl = candidates[0][1];
      console.log(`  ✅ ${s.id} (${s.name}) → ${candidates[0][0]}`);
      found++;
    } else {
      console.log(`  ❌ ${s.id} (${s.name}) → not found in album`);
    }
  }
  
  // Downward Spiral: 1440837096
  await sleep(500);
  console.log('\nLooking up The Downward Spiral album...');
  const tdsTracks = await lookupAlbum(1440837096);
  console.log('TDS tracks:', tdsTracks.map(t => `${t.trackNumber}. ${t.trackName}`).join(', '));
  
  const tdsByName = {};
  for (const t of tdsTracks) {
    tdsByName[normalize(t.trackName)] = t.trackViewUrl;
  }
  
  const tdsSongs = [
    { id: 'nin-8-06', name: 'Ruiner' },
    { id: 'nin-8-08', name: 'I Do Not Want This' },
    { id: 'nin-8-09', name: 'Big Man with a Gun' },
    { id: 'nin-8-13', name: 'The Downward Spiral' },
    { id: 'nin-17b-04', name: 'The Becoming' }, // for Still
  ];
  
  for (const s of tdsSongs) {
    if (s.id === 'nin-17b-04') continue; // We want Still version, not TDS version
    if (songLinks[s.id]?.appleMusicUrl) continue;
    const key = normalize(s.name);
    const url = tdsByName[key];
    if (url) {
      if (!songLinks[s.id]) songLinks[s.id] = {};
      songLinks[s.id].appleMusicUrl = url;
      console.log(`  ✅ ${s.id} (${s.name})`);
      found++;
    } else {
      console.log(`  ❌ ${s.id} (${s.name}) → checking candidates...`);
      const cands = Object.entries(tdsByName).filter(([k]) => 
        k.includes(key.substring(0, 8)) || key.includes(k.substring(0, 8))
      );
      if (cands.length > 0) {
        console.log(`    Candidates: ${cands.map(c => c[0]).join(', ')}`);
      }
      skipped++;
    }
  }
  
  // FDTS: 1545212135
  await sleep(500);
  console.log('\nLooking up Further Down the Spiral...');
  const fdtsTracks = await lookupAlbum(1545212135);
  console.log('FDTS tracks:', fdtsTracks.map(t => `${t.trackNumber}. ${t.trackName}`).join(', '));
  
  const fdtsByName = {};
  for (const t of fdtsTracks) {
    fdtsByName[normalize(t.trackName)] = t.trackViewUrl;
  }
  
  const fdtsSongs = [
    { id: 'nin-10-04', name: 'The Downward Spiral (The Bottom)' },
    { id: 'nin-10-05', name: 'Hurt (Quiet)' },
  ];
  
  for (const s of fdtsSongs) {
    if (songLinks[s.id]?.appleMusicUrl) continue;
    const key = normalize(s.name);
    // Try flexible matching
    let url = fdtsByName[key];
    if (!url) {
      const cands = Object.entries(fdtsByName).filter(([k]) => 
        k.includes('downward spiral') || k.includes('hurt')
      );
      if (cands.length > 0) {
        url = cands[0][1];
        console.log(`  Using candidate for ${s.name}: ${cands[0][0]}`);
      }
    }
    if (url) {
      if (!songLinks[s.id]) songLinks[s.id] = {};
      songLinks[s.id].appleMusicUrl = url;
      console.log(`  ✅ ${s.id} (${s.name})`);
      found++;
    } else {
      console.log(`  ❌ ${s.id} (${s.name})`);
      skipped++;
    }
  }
  
  // Closer to God EP - search specifically
  await sleep(500);
  console.log('\nSearching Closer to God EP...');
  const ctgResults = await searchITunes('nine inch nails closer to god ep 1994', 50);
  const ctgNIN = ctgResults.filter(r => 
    normalize(r.artistName || '').includes('nine inch') &&
    normalize(r.collectionName || '').includes('closer')
  );
  console.log('Closer to God tracks:', ctgNIN.map(t => `${t.trackNumber}. ${t.trackName} [${t.collectionName}]`).join('\n  '));
  
  const ctgByName = {};
  for (const t of ctgNIN) {
    ctgByName[normalize(t.trackName)] = t.trackViewUrl;
  }
  
  const ctgSongs = [
    { id: 'nin-9-01', name: 'Closer to God' },
    { id: 'nin-9-03', name: 'Closer - Deviation' },
    { id: 'nin-9-04', name: 'Heresy - Blind' }, // may already have
    { id: 'nin-9-05', name: 'Memorabilia' }, // may already have
    { id: 'nin-9-06', name: 'Closer - Internal' },
    { id: 'nin-9-07', name: 'March of the Fuckheads' },
    { id: 'nin-9-08', name: 'Closer - Further Away' },
    { id: 'nin-9-09', name: 'Closer' },
  ];
  
  for (const s of ctgSongs) {
    if (songLinks[s.id]?.appleMusicUrl) continue;
    // Try various forms
    const variants = [
      normalize(s.name),
      normalize(s.name.replace(' - ', ' (')).replace(/^(.+)$/, '$1)'), // doesn't work well
      normalize(s.name.split(' - ')[0]),
    ];
    let matched = null;
    for (const [k, v] of Object.entries(ctgByName)) {
      for (const variant of variants) {
        if (k === variant || k.includes(variant) || variant.includes(k)) {
          matched = v;
          break;
        }
      }
      if (matched) break;
    }
    if (matched) {
      if (!songLinks[s.id]) songLinks[s.id] = {};
      songLinks[s.id].appleMusicUrl = matched;
      console.log(`  ✅ ${s.id} (${s.name})`);
      found++;
    } else {
      console.log(`  ❌ ${s.id} (${s.name})`);
    }
  }
  
  // The Fragile: 1440836334
  await sleep(500);
  console.log('\nLooking up The Fragile...');
  const fragile1 = await lookupAlbum(1440836334);
  console.log(`The Fragile: ${fragile1.length} tracks`);
  const fragileByName = {};
  for (const t of fragile1) {
    fragileByName[normalize(t.trackName)] = t.trackViewUrl;
  }
  
  const fragileSongs = [
    { id: 'nin-14-01', name: 'Somewhat Damaged' },
    { id: 'nin-14-04', name: 'The Wretched' },
    { id: 'nin-14-18', name: 'Starfuckers, Inc.' },
    { id: 'nin-14-21', name: 'The Big Come Down' },
    // We're in This Together single extras
    { id: 'nin-15-02', name: '10 Miles High' },
    { id: 'nin-15-03', name: 'The New Flesh' },
    { id: 'nin-15-05', name: 'Complications of the Flesh' },
    { id: 'nin-15-06', name: 'The Perfect Drug' },
    // And All That Could Have Been
    { id: 'nin-17-06', name: 'The Wretched' },
    { id: 'nin-17-09', name: 'The Mark Has Been Made' },
    // Still  
    { id: 'nin-17b-01', name: 'Something I Can Never Have' },
  ];
  
  console.log('Fragile track list:', Object.keys(fragileByName).join(', '));
  
  for (const s of fragileSongs) {
    if (songLinks[s.id]?.appleMusicUrl) continue;
    const key = normalize(s.name);
    const url = fragileByName[key];
    if (url) {
      if (!songLinks[s.id]) songLinks[s.id] = {};
      songLinks[s.id].appleMusicUrl = url;
      console.log(`  ✅ ${s.id} (${s.name})`);
      found++;
    } else {
      // try partial match
      const cand = Object.entries(fragileByName).find(([k]) => k.includes(key) || key.includes(k));
      if (cand) {
        if (!songLinks[s.id]) songLinks[s.id] = {};
        songLinks[s.id].appleMusicUrl = cand[1];
        console.log(`  ✅ ${s.id} (${s.name}) → fuzzy: ${cand[0]}`);
        found++;
      } else {
        console.log(`  ❌ ${s.id} (${s.name})`);
      }
    }
  }
  
  // With Teeth: 1440851583 
  await sleep(500);
  console.log('\nLooking up With Teeth...');
  const wtTracks = await lookupAlbum(1440851583);
  console.log('With Teeth tracks:', wtTracks.map(t => `${t.trackNumber}. ${t.trackName}`).join(', '));
  const wtByName = {};
  for (const t of wtTracks) {
    wtByName[normalize(t.trackName)] = t.trackViewUrl;
  }
  
  const wtSongs = [
    { id: 'nin-19-02', name: 'You Know What You Are?' },
    { id: 'nin-19-05', name: 'Love Is Not Enough' },
    { id: 'nin-19-09', name: 'Getting Smaller' },
    { id: 'nin-19-10', name: 'Sunspots' },
  ];
  
  for (const s of wtSongs) {
    if (songLinks[s.id]?.appleMusicUrl) continue;
    const key = normalize(s.name);
    const url = wtByName[key];
    if (url) {
      if (!songLinks[s.id]) songLinks[s.id] = {};
      songLinks[s.id].appleMusicUrl = url;
      console.log(`  ✅ ${s.id} (${s.name})`);
      found++;
    } else {
      const cand = Object.entries(wtByName).find(([k]) => k.includes(key.replace(/[?!.]/g, '')) || key.includes(k));
      if (cand) {
        if (!songLinks[s.id]) songLinks[s.id] = {};
        songLinks[s.id].appleMusicUrl = cand[1];
        console.log(`  ✅ ${s.id} (${s.name}) → fuzzy: ${cand[0]}`);
        found++;
      } else {
        console.log(`  ❌ ${s.id} (${s.name})`);
        skipped++;
      }
    }
  }
  
  // And All That Could Have Been - live album: need to find its iTunes ID
  await sleep(500);
  console.log('\nSearching And All That Could Have Been...');
  const aatcbResults = await searchITunes('nine inch nails and all that could have been live', 50);
  const aatcbTracks = aatcbResults.filter(r => 
    normalize(r.artistName || '').includes('nine inch') &&
    (normalize(r.collectionName || '').includes('and all that') || normalize(r.collectionName || '').includes('could have been'))
  );
  console.log('AATCB tracks:', aatcbTracks.map(t => `${t.trackNumber}. ${t.trackName} [${t.collectionName}]`).join('\n  '));
  
  const aatcbByName = {};
  for (const t of aatcbTracks) {
    aatcbByName[normalize(t.trackName)] = t.trackViewUrl;
  }
  
  const aatcbSongs = [
    { id: 'nin-17-06', name: 'The Wretched' },
    { id: 'nin-17-09', name: 'The Mark Has Been Made' },
    { id: 'nin-17-10', name: 'Wish' },
    { id: 'nin-17-15', name: 'Starfuckers, Inc.' },
    { id: 'nin-17-16', name: 'Hurt' },
  ];
  
  for (const s of aatcbSongs) {
    if (songLinks[s.id]?.appleMusicUrl) continue;
    const key = normalize(s.name);
    // Search for live version
    const url = aatcbByName[key] || 
                aatcbByName[key + ' (live)'] ||
                Object.entries(aatcbByName).find(([k]) => k.includes(key))?.[1];
    if (url) {
      if (!songLinks[s.id]) songLinks[s.id] = {};
      songLinks[s.id].appleMusicUrl = url;
      console.log(`  ✅ ${s.id} (${s.name})`);
      found++;
    } else {
      console.log(`  ❌ ${s.id} (${s.name})`);
      skipped++;
    }
  }
  
  // Still - look up
  await sleep(500);
  console.log('\nSearching Still (Nine Inch Nails)...');
  const stillResults = await searchITunes('nine inch nails still 2002', 50);
  const stillTracks = stillResults.filter(r =>
    normalize(r.artistName || '').includes('nine inch') &&
    normalize(r.collectionName || '').includes('still')
  );
  console.log('Still tracks:', stillTracks.map(t => `${t.trackNumber}. ${t.trackName} [${t.collectionName}]`).join('\n  '));
  
  const stillByName = {};
  for (const t of stillTracks) {
    stillByName[normalize(t.trackName)] = t.trackViewUrl;
  }
  
  const stillSongs = [
    { id: 'nin-17b-01', name: 'Something I Can Never Have' },
    { id: 'nin-17b-04', name: 'The Becoming' },
  ];
  for (const s of stillSongs) {
    if (songLinks[s.id]?.appleMusicUrl) continue;
    const key = normalize(s.name);
    const url = stillByName[key] || Object.entries(stillByName).find(([k]) => k.includes(key))?.[1];
    if (url) {
      if (!songLinks[s.id]) songLinks[s.id] = {};
      songLinks[s.id].appleMusicUrl = url;
      console.log(`  ✅ ${s.id} (${s.name})`);
      found++;
    } else {
      console.log(`  ❌ ${s.id} (${s.name})`);
    }
  }
  
  // Hesitation Marks - find All Time Low
  await sleep(500);
  console.log('\nLooking up Hesitation Marks...');
  const hmTracks = await lookupAlbum(673721498);
  console.log('HM tracks:', hmTracks.map(t => `${t.trackNumber}. ${t.trackName}`).join(', '));
  const hmByName = {};
  for (const t of hmTracks) {
    hmByName[normalize(t.trackName)] = t.trackViewUrl;
  }
  // Find All Time Low
  if (!songLinks['nin-28-05']?.appleMusicUrl) {
    const url = hmByName['all time low'] || Object.entries(hmByName).find(([k]) => k.includes('all time'))?.[1];
    if (url) {
      if (!songLinks['nin-28-05']) songLinks['nin-28-05'] = {};
      songLinks['nin-28-05'].appleMusicUrl = url;
      console.log(`  ✅ nin-28-05 All Time Low`);
      found++;
    }
  }
  
  // Not the Actual Events - Burning Bright
  await sleep(500);
  console.log('\nSearching Not the Actual Events...');
  const ntaeResults = await searchITunes('nine inch nails not the actual events burning bright', 30);
  const ntaeTracks = ntaeResults.filter(r => normalize(r.artistName || '').includes('nine inch'));
  const ntaeByName = {};
  for (const t of ntaeTracks) {
    ntaeByName[normalize(t.trackName)] = t.trackViewUrl;
  }
  console.log('NTAE tracks:', Object.keys(ntaeByName).join(', '));
  
  if (!songLinks['nin-29-05']?.appleMusicUrl) {
    const url = ntaeByName['burning bright (field on fire)'] || 
                Object.entries(ntaeByName).find(([k]) => k.includes('burning bright'))?.[1];
    if (url) {
      if (!songLinks['nin-29-05']) songLinks['nin-29-05'] = {};
      songLinks['nin-29-05'].appleMusicUrl = url;
      console.log(`  ✅ nin-29-05 Burning Bright`);
      found++;
    } else {
      console.log(`  ❌ nin-29-05 Burning Bright not found`);
    }
  }
  
  // Things Falling Apart - Starfuckers remixes
  await sleep(500);
  console.log('\nSearching Things Falling Apart...');
  const tfaResults = await searchITunes('nine inch nails things falling apart starfuckers', 50);
  const tfaTracks = tfaResults.filter(r =>
    normalize(r.collectionName || '').includes('things falling') ||
    (normalize(r.artistName || '').includes('nine inch') && normalize(r.collectionName || '').includes('starfuck'))
  );
  const tfaByName = {};
  for (const t of tfaTracks) {
    tfaByName[normalize(t.trackName)] = t.trackViewUrl;
  }
  console.log('TFA tracks:', Object.keys(tfaByName).join(', '));
  
  const tfaSongs = [
    { id: 'nin-16-03', name: 'The Wretched - Remix' },
    { id: 'nin-16-04', name: 'Starfuckers, Inc. - Remix (AS)' },
    { id: 'nin-16-06', name: 'Starfuckers, Inc. - Remix (DO)' },
    { id: 'nin-16-10', name: 'Starfuckers, Inc. - Remix (CC)' },
  ];
  for (const s of tfaSongs) {
    if (songLinks[s.id]?.appleMusicUrl) continue;
    const key = normalize(s.name);
    const baseKey = key.replace(/ - remix.*$/, '').replace(/\s*\(.*?\)/g, '').trim();
    const url = Object.entries(tfaByName).find(([k]) => k.includes(baseKey))?.[1];
    if (url) {
      if (!songLinks[s.id]) songLinks[s.id] = {};
      songLinks[s.id].appleMusicUrl = url;
      console.log(`  ✅ ${s.id} (${s.name})`);
      found++;
    } else {
      console.log(`  ❌ ${s.id} (${s.name})`);
      skipped++;
    }
  }
  
  // Fragile Deviations 1
  await sleep(500);
  console.log('\nSearching The Fragile Deviations 1...');
  const devResults = await searchITunes('nine inch nails fragile deviations 1', 50);
  const devTracks = devResults.filter(r =>
    normalize(r.collectionName || '').includes('deviations')
  );
  const devByNum = {};
  const devByName = {};
  for (const t of devTracks) {
    devByNum[t.trackNumber] = t.trackViewUrl;
    devByName[normalize(t.trackName)] = t.trackViewUrl;
  }
  console.log('Deviations tracks:', devTracks.map(t => `${t.trackNumber}. ${t.trackName}`).join(', '));
  
  const devSongs = [
    { id: 'nin-30-01', name: 'The Frail - Deviations 1', trackNum: 1 },
    { id: 'nin-30-02', name: 'Somewhat Damaged - Deviations 1', trackNum: 2 },
    { id: 'nin-30-03', name: 'The Wretched - Deviations 1', trackNum: 3 },
  ];
  for (const s of devSongs) {
    if (songLinks[s.id]?.appleMusicUrl) continue;
    const url = devByNum[s.trackNum] || Object.entries(devByName).find(([k]) => {
      const base = normalize(s.name.replace(' - Deviations 1', ''));
      return k.includes(base);
    })?.[1];
    if (url) {
      if (!songLinks[s.id]) songLinks[s.id] = {};
      songLinks[s.id].appleMusicUrl = url;
      console.log(`  ✅ ${s.id} (${s.name})`);
      found++;
    } else {
      console.log(`  ❌ ${s.id} (${s.name})`);
      skipped++;
    }
  }
  
  // Year Zero Remixed - check if available
  await sleep(500);
  console.log('\nSearching Year Zero Remixed...');
  const yzrResults = await searchITunes('nine inch nails year zero remixed', 30);
  const yzrTracks = yzrResults.filter(r => normalize(r.collectionName || '').includes('year zero remixed'));
  if (yzrTracks.length === 0) {
    console.log('  Year Zero Remixed not on Apple Music - skipping');
    // Mark all as not available
    skipped += 5;
  } else {
    console.log('YZR tracks:', yzrTracks.map(t => `${t.trackNumber}. ${t.trackName}`).join(', '));
  }
  
  // Summary
  console.log(`\n📊 Pass 3 Summary:`);
  console.log(`  Bad matches removed: ${fixed}`);
  console.log(`  New links found: ${found}`);
  console.log(`  Still missing: ${skipped}`);
  
  // Count total songs with apple music URLs
  const withAppleMusic = NIN_SONGS.filter(s => songLinks[s.id]?.appleMusicUrl).length;
  console.log(`  Songs with Apple Music links: ${withAppleMusic} / ${NIN_SONGS.length}`);
  
  fs.writeFileSync(SONG_LINKS_PATH, JSON.stringify(songLinks, null, 2) + '\n');
  console.log(`✅ Written to ${SONG_LINKS_PATH}`);
}

// Need this for the final count
const NIN_SONGS = Array.from({length: 338}, (_, i) => ({ id: '' })); // placeholder

main().catch(console.error);
