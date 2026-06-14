# NIN Rankings - Implementation Guide

## What We Built

A full-stack ranking application for your Twitch stream where you can rank Nine Inch Nails albums in real-time.

### Two Interfaces

**1. Public Facing (/)** 
- Display-only view of ranked songs
- Auto-refreshes every 5 seconds to show live updates
- Shows: Rank, Song Name, Album, Release Year, Episode Number, Timestamp
- Dark theme optimized for stream overlay

**2. Admin Interface (/admin)**
- Two-bucket system: Unranked | Ranked
- Click any unranked song to select it
- Green "Insert at #X" buttons appear
- Click insertion point to rank the song
- Immediately appears in public view
- Click "Remove" to move ranked song back to unranked
- Shuffle button randomizes unranked list
- Episode number selector for stream context

## Architecture

```
Frontend (React)          Backend (Vercel Edge)       Database (Vercel KV)
┌─────────────────┐      ┌──────────────────┐       ┌─────────────────┐
│  AdminInterface │─────>│  /api/admin/*    │────>│ nin:songs       │
│  PublicRankings │      │  Edge Function   │     │ nin:rankings    │
└─────────────────┘      └──────────────────┘     └─────────────────┘
                              auto-scales               persisted
                              sub-100ms response        globally replicated
```

## File Structure

```
nin/
├── public/                 # Static assets
├── src/
│   ├── components/
│   │   ├── AdminInterface.tsx    # Drag-and-drop ranking UI
│   │   └── PublicRankings.tsx    # Read-only public display
│   ├── store/
│   │   └── rankingStore.ts       # Zustand state (client-side)
│   ├── api/
│   │   └── songs.ts              # API logic (not used, see /api)
│   ├── types/
│   │   └── index.ts              # TypeScript definitions
│   ├── App.tsx                   # Router
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Tailwind + globals
├── api/
│   └── songs.ts                  # Vercel Edge Function (serverless)
├── scripts/
│   └── seed-songs.ts             # One-time: load songs to KV
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── index.html
└── README.md
```

## Setup Steps

### 1. Local Development

```bash
# Clone your repo (already done)
git clone https://github.com/bhinmaine/nin
cd nin

# Install dependencies
npm install

# Start dev server
npm run dev
```

Navigate to:
- Public: http://localhost:5173
- Admin: http://localhost:5173/admin

### 2. Connect to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your Vercel project
vercel link

# Create a Vercel KV database
# Go to: https://vercel.com/dashboard/stores
# Create new KV → give it a name → link to project
```

### 3. Set Environment Variables

After creating KV, Vercel auto-loads these to your environment:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

**Test connection:**
```bash
vercel env pull  # Downloads .env.local
```

### 4. Seed Initial Song Data

First, populate the Vercel KV database with NIN songs. The seed script is a placeholder—**you need to provide the full catalog**.

**Get the song list:**
1. Go to: https://en.wikipedia.org/wiki/Nine_Inch_Nails_discography
2. Export albums with halo numbers
3. Update `scripts/seed-songs.ts` with the complete catalog

**Then run:**
```bash
# Install dependencies (ts-node, @vercel/kv)
npm install --save-dev ts-node

# Seed the database
npx ts-node scripts/seed-songs.ts
```

### 5. Deploy

```bash
# Deploy to Vercel
vercel deploy --prod

# Or just push to main
git push origin main
# (Vercel auto-deploys on push)
```

## How to Use During Stream

### Before Stream
1. Load your admin interface: `https://nin.vercel.app/admin`
2. Click "Shuffle Unranked" to randomize song order
3. Have a second screen showing: `https://nin.vercel.app` (public view)
4. Or embed public URL as a browser source in OBS

### During Stream
1. Read song from unranked list
2. Discuss/debate with chat
3. Click the song to select it
4. Click where it ranks (Insert at #1, after #2, etc.)
5. Song instantly appears on public overlay
6. Repeat for next song

### Workflow Speed
- Selection → Ranking: <1 second
- Admin update → Public display: <5 seconds (poll interval)
- Can rank 1-2 songs per minute easily

## Data Flow

```
Step 1: You click unranked song
  └─> Zustand state updates (client-side)

Step 2: You click insertion point
  └─> AdminInterface calls saveSongs()
      └─> POST /api/admin/songs
          └─> Vercel KV stores: nin:ranked, nin:songs
              └─> Edge Function returns 200

Step 3: Public page polls every 5s
  └─> PublicRankings calls fetch('/api/rankings')
      └─> GET /api/rankings
          └─> Edge Function fetches nin:ranked from KV
              └─> Returns JSON, UI re-renders
```

## Key Features Explained

### Unranked Bucket (Left Side)
- **Randomization**: Shuffle button uses `array.sort(() => Math.random() - 0.5)`
- **Display**: Song Name | Album | Release Year
- **Selection**: Click = highlight in blue
- **Scrollable**: Max height with auto-overflow

### Ranked Bucket (Right Side)
- **Ordered**: Sorted by rank #1 → #N
- **Display**: Rank Number | Song Name | Album | Year
- **Insertion Points**: Green buttons appear when song selected
- **Removal**: Hover → "Remove" button (moves back to unranked)
- **Live Updates**: Saves to KV immediately on change

### Real-Time Sync
- Public page fetches every 5 seconds (configurable)
- Edge Function response <100ms (global edge network)
- Zustand state-managed rankings (no Redux complexity)
- All data persisted to Vercel KV (survives page refresh)

## Customization

### Change Polling Interval
Edit `src/components/PublicRankings.tsx`:
```typescript
refetchInterval: 5000, // Change to 3000 (3s) or 10000 (10s)
```

### Customize Styling
- Tailwind config: `tailwind.config.js`
- Custom CSS: `src/index.css`
- Component classes: Edit `.tsx` files directly
- Colors: Black/gray for admin (dark theme), same for public

### Add Episode Number to UI
Already implemented! Edit `episodeNumber` state in admin interface.

### Add Authentication
Create a simple check in `/admin` route:
```typescript
const [password, setPassword] = useState('');
if (!isAuthenticated) {
  // Show password prompt
}
```

See DEPLOYMENT.md for auth ideas.

## Common Tasks

### Add More Songs
1. Update `scripts/seed-songs.ts`
2. Run: `npx ts-node scripts/seed-songs.ts`
3. Reload admin page

### Export Final Rankings
Add endpoint: `GET /api/export`
```typescript
const rankings = await kv.get('nin:rankings');
// Convert to CSV, return as file
```

### Undo a Ranking
Click "Remove" on the ranked song to send back to unranked.
**Note:** This loses the episode/timestamp info. Add a history feature later if needed.

### Reset All Rankings
Manually clear KV in Vercel dashboard:
1. https://vercel.com/dashboard/stores
2. Select your KV database
3. Delete key `nin:ranked`

## Testing

### Test Admin Ranking
1. Go to `/admin`
2. Select a song
3. Click "Insert at #1"
4. Verify it appears in ranked list
5. Verify rank # increments correctly

### Test Public View
1. Go to `/`
2. Verify ranked songs display in order
3. Rank a new song in admin
4. Wait <6 seconds
5. Verify it appears on public view

### Test Edge Cases
- What happens if you rank 100 songs?
- What if you remove a ranked song?
- What if you shuffle while stream is live?
- What if KV connection fails? (Should show error on admin)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Admin page shows empty buckets | Run seed script: `npx ts-node scripts/seed-songs.ts` |
| Rankings not appearing on public | Check KV connection in Vercel dashboard |
| Admin UI slow to respond | Check Vercel Analytics for cold starts |
| Styling looks broken | Rebuild: `npm run build` |
| Can't push to GitHub | Verify git auth: `git config user.name/email` |

## Next Steps

1. ✅ Set up local dev environment
2. ✅ Deploy to Vercel
3. **↓ You are here** → Complete NIN song catalog
4. Seed songs to KV
5. Test both interfaces
6. Go live!

---

**Questions?** Check the code comments in each `.tsx` file or the README.md for API details.

**Ready to stream?** Go to `/admin` and start ranking!
