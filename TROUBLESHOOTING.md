# Troubleshooting Vercel Deployment

## Latest Fixes (2026-06-14)

✅ **API routing fixed** — Vercel now recognizes `/api/` endpoints
- Split monolithic `api/songs.ts` into explicit route files
- Each endpoint gets its own handler: `rankings.ts`, `admin/songs.ts`
- Added `/api/health` health check endpoint

---

## Current Issues Fixed

✅ **TypeScript build errors** — Removed unused variables
✅ **Missing @vercel/kv dependency** — Added to package.json
✅ **Edge Function path matching** — Now uses explicit files
✅ **CORS headers** — Added proper CORS support
✅ **Error handling** — Detailed error messages in API responses
✅ **API routing (404 errors)** — Explicit route files recognized by Vercel

---

## What You Need to Check in Vercel Dashboard

### 1. KV Database Configuration

**Verify in Vercel Dashboard:**
```
1. Go to: https://vercel.com/dashboard
2. Select your project: nineinchnails
3. Go to: Settings → Storage
4. Check: Is there a "KV" database linked?
```

**Expected:**
- At least one KV database should be listed
- Status should be "Connected" or "Active"

**If missing:**
```
Settings → Storage → Create Database → KV
Select region → Create → Link to project
Redeploy after linking
```

### 2. Environment Variables

**Vercel should auto-populate:**
```
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=***
```

**Verify:**
```
1. Settings → Environment Variables
2. Look for: KV_REST_API_URL and KV_REST_API_TOKEN
3. Both should be populated (values hidden, just check they exist)
```

### 3. Deployment Status

**Check build logs:**
```
1. Go to: Deployments tab
2. Click the latest deployment
3. Look for: "Build" section
4. Should say: "✓ Built successfully"
```

---

## Testing the Deployment

### Test 1: Health Check

```
Navigate to: https://nineinchnails.vercel.app/api/health
Expected: JSON with { status: "ok", timestamp: "...", service: "nin-rankings-api" }
```

### Test 2: Admin Songs Endpoint

```
Navigate to: https://nineinchnails.vercel.app/api/admin/songs
Expected: JSON { unranked: [], ranked: [] }
If KV not set up yet, that's OK — empty arrays are correct
```

### Test 3: Public Rankings Endpoint

```
Navigate to: https://nineinchnails.vercel.app/api/rankings
Expected: JSON [] (empty array)
If KV not set up yet, that's OK — empty array is correct
```

### Test 4: Frontend Loading

```
Navigate to: https://nineinchnails.vercel.app/
Expected: Should see NIN Song Rankings page
          "No rankings yet. Check back during the stream!" message
          NO "Error loading rankings" message
```

### Test 5: Admin Page

```
Navigate to: https://nineinchnails.vercel.app/admin
Expected: Should see two empty buckets (Unranked | Ranked)
          "Shuffle Unranked" button visible
          Episode number input field
          NO loading errors
```

---

## API Endpoints

### GET /api/rankings
Returns ranked songs (public, read-only)
```
Response: RankedSong[]
[
  {
    id: "nin-1-01",
    name: "Head Like a Hole",
    album: "Pretty Hate Machine",
    releaseYear: 1989,
    haloNumber: 1,
    rank: 1,
    episodeNumber: 1,
    timestamp: "2026-06-14T19:40:00Z"
  },
  ...
]
```

### GET /api/admin/songs
Returns all songs (admin use)
```
Response: { unranked: Song[], ranked: RankedSong[] }
```

### POST /api/admin/songs
Saves ranked and unranked songs
```
Request body: { ranked: RankedSong[], unranked: Song[] }
Response: { success: true }
```

### GET /api/health
Health check endpoint
```
Response: { status: "ok", timestamp: "...", service: "nin-rankings-api" }
```

---

## Common Errors & Solutions

| Error | Cause | Fix |
|-------|-------|-----|
| "Error loading rankings" | API endpoint returning 404 or 500 | Check if deployment is current (commit: e5734d7) |
| "Cannot find API" | /api/ routes not recognized | Verify deployment updated, check Deployments tab |
| 500 Error on /api/admin/songs | KV connection failed | Link KV database in Settings → Storage, redeploy |
| 500 Error with "Unknown error" | KV env vars missing | Check KV_REST_API_TOKEN in Settings → Environment Variables |
| API works but no data persists | KV database not linked | Seed songs with: npx ts-node scripts/seed-songs.ts |

---

## Fix Summary (Timeline)

1. ✅ **8db2b19** — TypeScript build errors fixed
2. ✅ **e2709c2** — @vercel/kv added, default export fixed
3. ✅ **8e7f304** — Edge Function error handling improved
4. ✅ **64b33b3** — Troubleshooting guide added
5. ✅ **ca78ca3** — **API routing FIXED** (explicit route files)
6. ✅ **e5734d7** — Health check endpoint added

**Current deployment:** Ready for production
**Blocking issue:** KV database must be linked in Vercel (data won't persist without it)

---

## Next Steps

1. **Link KV database in Vercel Dashboard**
   - Settings → Storage → Create KV database
   - Auto-populates environment variables
   - Redeploy

2. **Test API endpoints** (should all work now)
   - /api/health
   - /api/admin/songs
   - /api/rankings

3. **Populate songs**
   - Fill scripts/seed-songs.ts
   - Run: npx ts-node scripts/seed-songs.ts

4. **Verify everything works**
   - Admin page loads
   - Public page loads
   - Both show correct empty state

---

## Manual Testing in Admin UI

Once songs are loaded:

1. **Click "Shuffle Unranked"** — list should randomize
2. **Click a song** — should highlight in blue
3. **Click "Insert at #1"** — song should move to Ranked bucket
4. **Go to public page** — check within 5 seconds
   - Song should appear in ranked display
5. **Set episode number** — then rank another song
   - Verify episode # appears on public page

---

## Fast Rollback

If issues persist:

```bash
git log --oneline          # See recent commits
git revert <commit-hash>   # Revert specific commit
git push origin main       # Vercel auto-redeploys
```

**Safe to revert to:** commit `ca78ca3` (latest working)
