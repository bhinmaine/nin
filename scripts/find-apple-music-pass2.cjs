#!/usr/bin/env node
// Second pass: Handle special cases and remaining misses
// 1. Ghosts I-IV (different naming: "01 Ghosts I" vs "Ghosts I-1")
// 2. Bad Witch (different track names on iTunes)  
// 3. Songs that need score-60 deduplication / better matching
// 4. Songs that failed first pass

const fs = require('fs');
const path = require('path');

const SONG_LINKS_PATH = path.join(__dirname, '../data/song-links.json');

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

async function searchITunes(query, limit = 200) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=${limit}&country=US`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      console.error(`  iTunes API error: ${res.status} - ${text.substring(0, 100)}`);
      return null; // null = rate limited / error
    }
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error(`  Fetch error: ${err.message}`);
    return null;
  }
}

async function searchWithRetry(query, limit = 200, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const results = await searchITunes(query, limit);
    if (results !== null) return results;
    console.log(`  Rate limited, waiting 5s...`);
    await sleep(5000);
  }
  return [];
}

async function main() {
  const songLinks = JSON.parse(fs.readFileSync(SONG_LINKS_PATH, 'utf8'));
  
  let found = 0;
  let skipped = 0;
  
  // ============================================================
  // SECTION 1: Fix bad score-60 matches that are wrong
  // Songs where - Shred, - Singe etc. all got same URL
  // ============================================================
  console.log('\n=== SECTION 1: Fix Ghosts I-IV ===');
  
  // Ghosts I-IV: iTunes uses "01 Ghosts I", "02 Ghosts I", "10 Ghosts II", "19 Ghosts III" etc.
  // Seed uses: Ghosts I-1 through I-9, II-1 through II-9, III-1 through III-10, IV-1 through IV-9
  // Total 37 tracks. Track numbers are sequential: 01-09 = Ghosts I, 10-18 = Ghosts II, 19-28 = Ghosts III, 29-37 = Ghosts IV
  
  await sleep(1000);
  console.log('Fetching Ghosts I-IV from iTunes...');
  const ghostsResults = await searchWithRetry('nine inch nails ghosts i-iv', 200);
  
  if (ghostsResults && ghostsResults.length > 0) {
    // Filter to just Ghosts I-IV collection
    const ghostsTracks = ghostsResults.filter(r => 
      normalize(r.collectionName || '').includes('ghosts i-iv') ||
      normalize(r.collectionName || '').includes('ghosts 1-4')
    );
    console.log(`Found ${ghostsTracks.length} Ghosts I-IV tracks`);
    
    // Build mapping from track number to URL
    // iTunes: "01 Ghosts I" → track 1, "10 Ghosts II" → track 10, etc.
    const trackNumToUrl = {};
    for (const r of ghostsTracks) {
      const match = r.trackName.match(/^(\d+)\s+Ghosts/i);
      if (match) {
        const num = parseInt(match[1], 10);
        trackNumToUrl[num] = r.trackViewUrl;
      }
    }
    
    // Seed numbering: I-1..I-9 = sequential 1-9, II-1..II-9 = 10-18, III-1..III-10 = 19-28, IV-1..IV-9 = 29-37
    const ghostsSeedIds = [];
    // I-1 through I-9
    for (let i = 1; i <= 9; i++) ghostsSeedIds.push({ id: `nin-26-0${i}`, num: i });
    // II-1 through II-9
    for (let i = 1; i <= 9; i++) ghostsSeedIds.push({ id: `nin-26-${9+i}`, num: 9+i });
    // III-1 through III-10
    for (let i = 1; i <= 10; i++) ghostsSeedIds.push({ id: `nin-26-${18+i}`, num: 18+i });
    // IV-1 through IV-9
    for (let i = 1; i <= 9; i++) ghostsSeedIds.push({ id: `nin-26-${28+i}`, num: 28+i });
    
    for (const { id, num } of ghostsSeedIds) {
      const url = trackNumToUrl[num];
      if (url) {
        if (!songLinks[id]) songLinks[id] = {};
        songLinks[id].appleMusicUrl = url;
        console.log(`  ✅ ${id} → track ${num} → ${url.substring(0, 60)}...`);
        found++;
      } else {
        console.log(`  ❌ ${id} → no track ${num} found`);
        skipped++;
      }
    }
  }
  
  // ============================================================
  // SECTION 2: Bad Witch - different track names on iTunes
  // ============================================================
  console.log('\n=== SECTION 2: Bad Witch ===');
  await sleep(1000);
  
  const badWitchMap = {
    'nin-32-01': 'Shit Mirror',           // Godless → actually might be first track
    'nin-32-02': 'Ahead of Ourselves',    // Sanctified
    'nin-32-03': "I'm Not from This World", // Apple of Sodom
    'nin-32-04': 'God Break Down the Door', // Burn (already has link)
    'nin-32-05': 'Play the Goddamned Part', // Branches
    'nin-32-06': 'Over and Out',           // Play the Fucking Song
  };
  // Actually wait - nin-32-04 already has a link (God Break Down the Door)
  // The seed names are creative/alternate names. Let me search and match by position.
  
  const badWitchResults = await searchWithRetry('nine inch nails bad witch', 50);
  if (badWitchResults && badWitchResults.length > 0) {
    const bwTracks = badWitchResults.filter(r => 
      normalize(r.collectionName || '').includes('bad witch')
    ).sort((a, b) => (a.trackNumber || 0) - (b.trackNumber || 0));
    
    console.log('Bad Witch tracks on iTunes:');
    bwTracks.forEach(t => console.log(`  ${t.trackNumber}. ${t.trackName}`));
    
    // Map by track number (seed order matches iTunes order)
    // Seed: nin-32-01=Godless(1), nin-32-02=Sanctified(2), nin-32-03=Apple of Sodom(3), nin-32-04=Burn(4, already linked), nin-32-05=Branches(5), nin-32-06=Play the Fucking Song(6)
    const bwByNum = {};
    for (const t of bwTracks) {
      if (t.trackNumber) bwByNum[t.trackNumber] = t.trackViewUrl;
    }
    
    const bwSeedMap = [
      { id: 'nin-32-01', trackNum: 1 },
      { id: 'nin-32-02', trackNum: 2 },
      { id: 'nin-32-03', trackNum: 3 },
      { id: 'nin-32-04', trackNum: 4 }, // already has link but let's use correct one
      { id: 'nin-32-05', trackNum: 5 },
      { id: 'nin-32-06', trackNum: 6 },
    ];
    
    for (const { id, trackNum } of bwSeedMap) {
      const url = bwByNum[trackNum];
      const existing = songLinks[id]?.appleMusicUrl;
      if (url && !existing) {
        if (!songLinks[id]) songLinks[id] = {};
        songLinks[id].appleMusicUrl = url;
        console.log(`  ✅ ${id} → track ${trackNum} → ${url.substring(0, 60)}...`);
        found++;
      } else if (url && existing) {
        console.log(`  ~ ${id} already has link (keeping existing)`);
      } else {
        console.log(`  ❌ ${id} → no track ${trackNum}`);
        skipped++;
      }
    }
  }
  
  // ============================================================
  // SECTION 3: Missing songs that need individual searches or specific album IDs
  // ============================================================
  console.log('\n=== SECTION 3: Individual song searches ===');
  
  // These songs failed because the iTunes collection name didn't match well
  // or the track name needed fuzzy matching
  const individualSearches = [
    // Broken tracks missing
    { id: 'nin-5-02', query: 'nine inch nails wish broken', trackName: 'Wish' },
    { id: 'nin-5-07', query: "nine inch nails physical you're so broken", trackName: "Physical (You're So)" },
    // Fixed tracks missing
    { id: 'nin-6-02', query: 'nine inch nails wish remix fixed', trackName: 'Wish' },
    { id: 'nin-6-05', query: 'nine inch nails first fuck fixed', trackName: 'First Fuck' },
    // Downward Spiral missing
    { id: 'nin-8-06', query: 'nine inch nails ruiner downward spiral', trackName: 'Ruiner' },
    { id: 'nin-8-08', query: 'nine inch nails i do not want this downward spiral', trackName: 'I Do Not Want This' },
    { id: 'nin-8-09', query: 'nine inch nails big man with a gun downward spiral', trackName: 'Big Man with a Gun' },
    { id: 'nin-8-13', query: 'nine inch nails the downward spiral song', trackName: 'The Downward Spiral' },
    // Closer to God missing
    { id: 'nin-9-01', query: 'nine inch nails closer to god track', trackName: 'Closer to God' },
    { id: 'nin-9-03', query: 'nine inch nails closer deviation', trackName: 'Closer - Deviation' },
    { id: 'nin-9-06', query: 'nine inch nails closer internal', trackName: 'Closer - Internal' },
    { id: 'nin-9-07', query: 'nine inch nails march of the fuckheads', trackName: 'March of the Fuckheads' },
    { id: 'nin-9-08', query: 'nine inch nails closer further away', trackName: 'Closer - Further Away' },
    { id: 'nin-9-09', query: 'nine inch nails closer', trackName: 'Closer' },
    // Further Down the Spiral missing  
    { id: 'nin-10-04', query: 'nine inch nails downward spiral the bottom', trackName: 'The Downward Spiral (The Bottom)' },
    { id: 'nin-10-05', query: 'nine inch nails hurt quiet further down spiral', trackName: 'Hurt (Quiet)' },
    // The Fragile missing
    { id: 'nin-14-01', query: 'nine inch nails somewhat damaged', trackName: 'Somewhat Damaged' },
    { id: 'nin-14-04', query: 'nine inch nails the wretched', trackName: 'The Wretched' },
    { id: 'nin-14-18', query: 'nine inch nails starfuckers inc fragile', trackName: 'Starfuckers, Inc.' },
    { id: 'nin-14-21', query: 'nine inch nails the big come down', trackName: 'The Big Come Down' },
    // We're in This Together single missing
    { id: 'nin-15-02', query: 'nine inch nails 10 miles high', trackName: '10 Miles High' },
    { id: 'nin-15-03', query: 'nine inch nails the new flesh', trackName: 'The New Flesh' },
    { id: 'nin-15-05', query: 'nine inch nails complications of the flesh', trackName: 'Complications of the Flesh' },
    { id: 'nin-15-06', query: 'nine inch nails the perfect drug', trackName: 'The Perfect Drug' },
    // Things Falling Apart missing
    { id: 'nin-16-03', query: 'nine inch nails the wretched remix things falling apart', trackName: 'The Wretched' },
    { id: 'nin-16-04', query: 'nine inch nails starfuckers inc remix things falling apart', trackName: 'Starfuckers, Inc.' },
    { id: 'nin-16-06', query: 'nine inch nails starfuckers do remix', trackName: "Starfuckers, Inc. - Remix (DO)" },
    { id: 'nin-16-10', query: 'nine inch nails starfuckers cc remix', trackName: "Starfuckers, Inc. - Remix (CC)" },
    // And All That Could Have Been missing
    { id: 'nin-17-06', query: 'nine inch nails the wretched live', trackName: 'The Wretched' },
    { id: 'nin-17-09', query: 'nine inch nails mark has been made live', trackName: 'The Mark Has Been Made' },
    { id: 'nin-17-10', query: 'nine inch nails wish live and all that could have been', trackName: 'Wish' },
    { id: 'nin-17-15', query: 'nine inch nails starfuckers inc live', trackName: 'Starfuckers, Inc.' },
    { id: 'nin-17-16', query: 'nine inch nails hurt live and all that could have been', trackName: 'Hurt' },
    // Still missing
    { id: 'nin-17b-01', query: 'nine inch nails something i can never have still', trackName: 'Something I Can Never Have' },
    { id: 'nin-17b-04', query: 'nine inch nails the becoming still', trackName: 'The Becoming' },
    // Hand That Feeds missing
    { id: 'nin-18-03', query: 'nine inch nails love is not enough live', trackName: 'Love Is Not Enough - Live' },
    // With Teeth missing
    { id: 'nin-19-02', query: 'nine inch nails you know what you are with teeth', trackName: 'You Know What You Are?' },
    { id: 'nin-19-05', query: 'nine inch nails love is not enough with teeth', trackName: 'Love Is Not Enough' },
    { id: 'nin-19-09', query: 'nine inch nails getting smaller with teeth', trackName: 'Getting Smaller' },
    { id: 'nin-19-10', query: 'nine inch nails sunspots with teeth', trackName: 'Sunspots' },
    // Only single missing
    { id: 'nin-20-03', query: 'nine inch nails love is not enough live only', trackName: 'Love Is Not Enough - Live' },
    // Beside You in Time live missing (not on Apple Music apparently)
    // Year Zero Remixed missing (not on streaming)
    // Not the Actual Events missing
    { id: 'nin-29-05', query: 'nine inch nails burning bright field on fire', trackName: 'Burning Bright (Field on Fire)' },
    // Fragile Deviations missing
    { id: 'nin-30-01', query: 'nine inch nails the frail deviations', trackName: 'The Frail' },
    { id: 'nin-30-02', query: 'nine inch nails somewhat damaged deviations', trackName: 'Somewhat Damaged' },
    { id: 'nin-30-03', query: 'nine inch nails the wretched deviations', trackName: 'The Wretched' },
    // Hesitation Marks
    { id: 'nin-28-05', query: 'nine inch nails all time low hesitation marks', trackName: 'All Time Low' },
  ];
  
  for (const search of individualSearches) {
    // Skip if already has a link
    if (songLinks[search.id]?.appleMusicUrl) {
      console.log(`  ~ ${search.id} (${search.trackName}) already has link`);
      continue;
    }
    
    await sleep(200);
    console.log(`  Searching: ${search.trackName} (${search.id})`);
    
    const results = await searchWithRetry(search.query, 50);
    if (!results || results.length === 0) {
      console.log(`    ❌ No results`);
      skipped++;
      continue;
    }
    
    // Find best match
    let bestMatch = null;
    let bestScore = 0;
    for (const r of results) {
      const nameNorm = normalize(r.trackName || '');
      const searchNorm = normalize(search.trackName);
      // For these individual searches, be more flexible
      let score = 0;
      if (nameNorm === searchNorm) score = 100;
      else if (nameNorm.includes(searchNorm) || searchNorm.includes(nameNorm)) score = 80;
      else {
        // Strip parenthetical suffixes
        const cleanSearch = searchNorm.replace(/\s*\(.*?\)/g, '').replace(/\s*-\s*(long|dub|short|remix|live).*$/i, '').trim();
        const cleanName = nameNorm.replace(/\s*\(.*?\)/g, '').replace(/\s*-\s*(long|dub|short|remix|live).*$/i, '').trim();
        if (cleanSearch === cleanName) score = 75;
        else if (cleanSearch.length > 3 && (cleanName.includes(cleanSearch) || cleanSearch.includes(cleanName))) score = 65;
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = r;
      }
    }
    
    if (bestMatch && bestScore >= 65 && bestMatch.trackViewUrl) {
      if (!songLinks[search.id]) songLinks[search.id] = {};
      songLinks[search.id].appleMusicUrl = bestMatch.trackViewUrl;
      console.log(`    ✅ → ${bestMatch.trackName} [${bestMatch.collectionName}] (score: ${bestScore})`);
      found++;
    } else {
      console.log(`    ❌ no good match (best: ${bestMatch ? bestMatch.trackName + ' score:' + bestScore : 'none'})`);
      skipped++;
    }
  }
  
  // ============================================================
  // SECTION 4: Fix some bad score-60 matches from pass 1
  // The Halo 11 songs all got mapped to same URL - need individual per-remix
  // Also fix Halo 3 songs that all got the same URL
  // ============================================================
  console.log('\n=== SECTION 4: Fix The Perfect Drug Versions ===');
  await sleep(500);
  
  // Search specifically for Perfect Drug Versions
  const pdvResults = await searchWithRetry('nine inch nails the perfect drug versions', 50);
  if (pdvResults && pdvResults.length > 0) {
    const pdvTracks = pdvResults.filter(r => 
      normalize(r.collectionName || '').includes('perfect drug')
    ).sort((a, b) => (a.trackNumber || 0) - (b.trackNumber || 0));
    
    console.log('Perfect Drug Versions tracks:');
    pdvTracks.forEach(t => console.log(`  ${t.trackNumber}. ${t.trackName} | ${t.collectionName}`));
    
    // Map by track number to seed IDs
    const pdvSeedMap = [
      { id: 'nin-11-01', trackNum: 1 },
      { id: 'nin-11-02', trackNum: 2 },
      { id: 'nin-11-03', trackNum: 3 },
      { id: 'nin-11-04', trackNum: 4 },
      { id: 'nin-11-05', trackNum: 5 },
    ];
    
    const pdvByNum = {};
    for (const t of pdvTracks) {
      if (t.trackNumber) pdvByNum[t.trackNumber] = t.trackViewUrl;
    }
    
    for (const { id, trackNum } of pdvSeedMap) {
      const url = pdvByNum[trackNum];
      if (url) {
        if (!songLinks[id]) songLinks[id] = {};
        songLinks[id].appleMusicUrl = url;
        console.log(`  ✅ ${id} → track ${trackNum}`);
        found++;
      } else {
        console.log(`  ❌ ${id} → no track ${trackNum}`);
      }
    }
  }
  
  console.log('\n=== SECTION 5: Fix Halo 3 Down in It variants ===');
  await sleep(500);
  
  // Halo 3 songs that incorrectly got same URL - fix by getting actual per-track URLs
  const downInItSingleResults = await searchWithRetry('nine inch nails down in it single', 50);
  if (downInItSingleResults && downInItSingleResults.length > 0) {
    const diiTracks = downInItSingleResults.filter(r => {
      const col = normalize(r.collectionName || '');
      return col.includes('down in it') || col.includes('head like a hole');
    });
    
    console.log('Down in It single tracks:');
    diiTracks.forEach(t => console.log(`  ${t.trackNumber}. ${t.trackName} | ${t.collectionName} | ${t.trackViewUrl?.substring(0, 60)}`));
    
    // Find Shred and Singe individually
    const shredTrack = diiTracks.find(r => normalize(r.trackName).includes('shred'));
    const singeTrack = diiTracks.find(r => normalize(r.trackName).includes('singe'));
    
    if (shredTrack) {
      ['nin-1-02', 'nin-3-08'].forEach(id => {
        if (!songLinks[id]) songLinks[id] = {};
        songLinks[id].appleMusicUrl = shredTrack.trackViewUrl;
        console.log(`  ✅ ${id} → ${shredTrack.trackName}`);
        found++;
      });
    }
    if (singeTrack) {
      ['nin-1-03', 'nin-3-09'].forEach(id => {
        if (!songLinks[id]) songLinks[id] = {};
        songLinks[id].appleMusicUrl = singeTrack.trackViewUrl;
        console.log(`  ✅ ${id} → ${singeTrack.trackName}`);
        found++;
      });
    }
  }
  
  // Summary
  console.log(`\n📊 Pass 2 Summary:`);
  console.log(`  New links found: ${found}`);
  console.log(`  Still missing: ${skipped}`);
  console.log(`  Total entries: ${Object.keys(songLinks).length}`);
  
  fs.writeFileSync(SONG_LINKS_PATH, JSON.stringify(songLinks, null, 2) + '\n');
  console.log(`✅ Written to ${SONG_LINKS_PATH}`);
  
  return songLinks;
}

main().catch(console.error);
