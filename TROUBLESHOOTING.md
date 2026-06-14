# Troubleshooting Vercel Deployment

## Current Issues Fixed

✅ **TypeScript build errors** — Removed unused variables
✅ **Missing @vercel/kv dependency** — Added to package.json
✅ **Edge Function path matching** — Now uses exact pathname comparison
✅ **CORS headers** — Added proper CORS support
✅ **Error handling** — Detailed error messages in API responses

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
```

### 2. Environment Variables

**Vercel should auto-populate:**
```
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
```

**Verify:**
```
1. Settings → Environment Variables
2. Look for: KV_REST_API_URL and KV_REST_API_TOKEN
3. Both should be populated (values hidden, just check they exist)
```

**If missing:**
- Re-link the KV database from Storage tab
- Redeploy: `git push origin main`

### 3. Deployment Status

**Check build logs:**
```
1. Go to: Deployments tab
2. Click the latest deployment
3. Look for: "Build" section
4. Should say: "✓ Built successfully"
```

**If build failed:**
- Check error message in logs
- Most likely: KV_REST_API_TOKEN missing (environment variable)

---

## Testing the Deployment

### Test 1: Frontend Loading

```
Navigate to: https://nineinchnails.vercel.app/
Expected: Should see NIN Album Rankings page
          "No rankings yet. Check back during the stream!" message
```

### Test 2: Admin Page

```
Navigate to: https://nineinchnails.vercel.app/admin
Expected: Should see two empty buckets (Unranked | Ranked)
          "Shuffle Unranked" button visible
          Episode number input field
```

### Test 3: API Health

```
Navigate to: https://nineinchnails.vercel.app/api/health
Expected: JSON response with status: "ok" and timestamp
```

### Test 4: API Endpoints

**Fetch rankings (public):**
```bash
curl https://nineinchnails.vercel.app/api/rankings
# Should return: []  (empty array if no songs ranked yet)
```

**Fetch admin songs:**
```bash
curl https://nineinchnails.vercel.app/api/admin/songs
# Should return: { "unranked": [], "ranked": [] }
```

---

## Common Errors & Solutions

| Error | Cause | Fix |
|-------|-------|-----|
| 404 DEPLOYMENT_NOT_FOUND | Deployment hasn't finished | Wait 2-3 minutes, refresh |
| 500 Internal Server Error | KV connection failed | Check KV_REST_API_TOKEN in Settings |
| Empty UI / Nothing Loads | Missing frontend build | Check Deployment logs for build errors |
| "Cannot find KV" | Environment variable not set | Go to Settings → Storage, re-link KV database |
| CORS errors in console | Browser blocking requests | Already fixed in latest code |

---

## Next Step: Seed the Database

Once the site is loading (you see the empty "No rankings yet" page):

1. **Gather your NIN song list** (from Wikipedia)
2. **Fill in `scripts/seed-songs.ts`** with all songs
3. **Run the seed script:**
   ```bash
   npm install @vercel/kv ts-node typescript
   npx ts-node scripts/seed-songs.ts
   ```
4. **Verify songs in KV:**
   - Go back to admin interface
   - Should see unranked songs in left bucket

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

## Contact Support

If issues persist:

1. **Check Vercel logs:** Dashboard → Deployments → Latest → Logs
2. **Copy full error message**
3. **Verify:**
   - KV database is created and linked
   - Environment variables are populated
   - All dependencies installed (`npm install` locally)
4. **Try:**
   - `npm run build` locally to reproduce error
   - Redeploy: `git push origin main` (force rebuild)

---

## Fast Rollback

If something's broken and you need to revert:

```bash
git log --oneline          # See recent commits
git revert <commit-hash>   # Revert specific commit
git push origin main       # Vercel auto-redeploys
```

Recent commits:
- `8e7f304` - Improve Edge Function (CORS, error handling)
- `e2709c2` - Add @vercel/kv, fix defaults
- `8db2b19` - Fix TypeScript errors (initial working build)
