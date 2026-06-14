# Song Database Guide

## What You Need

A list of all NIN songs you want to rank. Format:

```typescript
{
  id: "nin-1-01",           // unique identifier
  name: "Head Like a Hole", // song title
  album: "Pretty Hate Machine", // album name
  releaseYear: 1989,        // year released
  haloNumber: 1             // halo number (1-50+)
}
```

## Source: Wikipedia Discography

Official NIN discography page has all halo-designated albums:
https://en.wikipedia.org/wiki/Nine_Inch_Nails_discography

**Key points:**
- Halo numbers are Trent's official designations
- Each album/EP/single has a halo number
- Ghosts series (I-XIII) are each their own halo
- We ignore: leaks, bootlegs, collaborations not designated

## Scope Recommendations

### Option 1: Studio Albums Only (RECOMMENDED FOR STREAM)
**~120 songs, manageable for 1-2 hour ranking session**

Include halos:
- 1: Pretty Hate Machine (1989)
- 2: Broken (1992)
- 4: The Downward Spiral (1994)
- 5: The Fragile (1999)
- 7: With Teeth (2005)
- 8: Year Zero (2007)
- 11: Hesitation Marks (2013)
- 22: Bad Witch (2018)

### Option 2: Full Catalog
**1000+ songs (very comprehensive)**

Include all halos 1-50+ (Ghosts series alone = 36+ songs)

Best for: 
- Marathon ranking session
- Complete reference
- Archive/documentation

### Option 3: Curated Top NIN Songs
**~50 songs (quick ranking)**

Manually select 50 "essential" NIN tracks
Great for: Quick stream, new listeners

---

## How to Populate

### Step 1: Gather Song List

**Method A: Manual copy from Wikipedia**
1. Go to: https://en.wikipedia.org/wiki/Nine_Inch_Nails_discography
2. For each album:
   - Copy album name, year, halo number
   - Copy all track titles from tracklist
3. Create CSV or JSON

**Method B: Use existing NIN database**
- Search GitHub: "nine inch nails discography json"
- Some fans maintain complete JSON databases
- Validate against Wikipedia before using

**Method C: Spotify API**
- Fetch all NIN tracks from Spotify
- Filter to halo-designated albums only
- Note: Spotify may have slightly different tracklists

### Step 2: Format as JavaScript Array

```typescript
const NIN_SONGS = [
  { id: 'nin-1-01', name: 'Head Like a Hole', album: 'Pretty Hate Machine', releaseYear: 1989, haloNumber: 1 },
  { id: 'nin-1-02', name: 'Terrible Lie', album: 'Pretty Hate Machine', releaseYear: 1989, haloNumber: 1 },
  // ... etc
];
```

**ID Naming Convention:**
- Format: `nin-{HALO}-{TRACK_NUMBER}`
- Example: `nin-4-07` = Halo 4, Track 7
- Purpose: Unique, human-readable, sortable

### Step 3: Update scripts/seed-songs.ts

1. Replace `const NIN_SONGS = [...]` with your full list
2. Save file
3. Commit to GitHub

### Step 4: Run Seed Script

```bash
# After deploying to Vercel
npx ts-node scripts/seed-songs.ts
```

This populates:
- `nin:songs` → all unranked songs (in KV)
- `nin:ranked` → empty array (ready for rankings)

---

## Validation Checklist

Before running seed script:

- [ ] All songs have unique `id`
- [ ] All songs have `name` (not empty)
- [ ] All songs have `album` (not empty)
- [ ] All songs have `releaseYear` (valid 4-digit year)
- [ ] All songs have `haloNumber` (1-50+, matches Wikipedia)
- [ ] No duplicate `id` values
- [ ] Names match Wikipedia (for consistency)
- [ ] Years are accurate
- [ ] Halo numbers are official designations

**Quick validation command:**
```javascript
// Copy into browser console on nin.vercel.app/admin
const ids = new Set(NIN_SONGS.map(s => s.id));
const dups = NIN_SONGS.filter(s => ids.size < NIN_SONGS.length);
console.log(`Duplicates: ${dups.length}`);
console.log(`Total: ${NIN_SONGS.length}, Unique: ${ids.size}`);
```

---

## Example: Pretty Hate Machine (Halo 1)

From Wikipedia, Pretty Hate Machine has 10 tracks:

```typescript
const PHM = [
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
];
```

---

## Timeline to Launch

**Sunday (today):** You gather song list
**Monday:** I help format + seed to KV
**Tuesday:** Test on deployed site
**Wednesday:** Go live for stream!

---

## Questions?

- **Where to find halo numbers?** Wikipedia discography page
- **Do we need remaster editions?** No (1 song per track)
- **Include B-sides?** Only if they have halo designation
- **What about EPs?** Include (halos 2, 3, etc.)
- **How many songs?** Recommend 100-150 for manageable stream ranking

See `scripts/seed-songs-TEMPLATE.ts` for full template with examples.
