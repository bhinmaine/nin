# NIN Song Rankings

A real-time ranking application for Nine Inch Nails albums during a Twitch stream.

Live at: **https://ninxcx.com/**

## Features

### 🌐 Public Interface (`/`)
- Real-time ranked display of NIN albums
- Auto-refreshes every 5 seconds
- Dark theme optimized for stream overlay
- Shows: Rank, Song, Album, Year, Episode #, Timestamp
- Read-only (no auth needed)

### ⚙️ Admin Interface (`/admin`)
- **Password protected** (secure login)
- Two-bucket ranking system:
  - **Unranked:** Randomized song list (left side)
  - **Ranked:** Ordered by position #1 → #N (right side)
- Quick ranking workflow:
  1. Click song to select (highlights blue)
  2. Green "Insert at #X" buttons appear
  3. Click to rank instantly
  4. Public page updates in real-time (<5 seconds)
- Features:
  - Shuffle button (randomize unranked)
  - Episode number tracking
  - Remove button (move ranked back to unranked)
  - Logout button

## Tech Stack
\n- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **State:** Zustand (client) + TanStack Query (polling)
- **Backend:** Vercel Edge Functions
- **Database:** Neon PostgreSQL (free tier)
- **Auth:** Password-protected admin panel
- **Deployment:** Vercel (auto-deploy on main push)

## Getting Started

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

- Public: http://localhost:5173
- Admin: http://localhost:5173/admin (requires ADMIN_PASSWORD env var)

### Build

```bash
npm run build
```

Outputs to `dist/` for Vercel deployment.

### Database Setup

#### Initialize Schema

```bash
npm install @vercel/postgres
npx ts-node scripts/init-db.ts
```

Creates two tables:
- `songs` — NIN songs (id, name, album, releaseYear, haloNumber)
- `ranked_songs` — Rankings (songId, rank, episodeNumber, timestamp)

#### Seed Songs

```bash
# 1. Update scripts/seed-songs.ts with NIN catalog from Wikipedia
# 2. Run:
npx ts-node scripts/seed-songs.ts
```

## Architecture

### Data Flow

```
Admin selects song
  ↓
rankSong() updates Zustand state (instant)
  ↓
saveSongs() POSTs to /api/admin/songs
  ↓
Edge Function queries Neon PostgreSQL
  ↓
Public page polls /api/rankings every 5s
  ↓
Display updates (<5 second lag)
```

### API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/rankings` | Public: fetch ranked songs |
| GET | `/api/admin/songs` | Admin: fetch ranked + unranked |
| POST | `/api/admin/songs` | Admin: save rankings |
| POST | `/api/admin/auth` | Verify admin password |
| GET | `/api/health` | Health check |

## Environment Variables

### Required (Neon)

```
POSTGRES_PRISMA_URL=postgresql://...
```

Auto-populated when linking Neon in Vercel.

### Required (Admin Auth)

```
ADMIN_PASSWORD=<your-password>
```

Set in Vercel Dashboard → Settings → Environment Variables (as secret).

## Project Structure

```
nin/
├── README.md                      # This file
├── GETTING_STARTED.md            # Setup guide
├── NEON_SETUP.md                 # Database setup
├── ARCHITECTURE.md               # System design
├── SONG_DATABASE_GUIDE.md        # How to gather songs
├── TROUBLESHOOTING.md            # Diagnostics
├── vercel.json                   # Deployment config
├── package.json
├── vite.config.ts
├── index.html
├── src/
│   ├── App.tsx                   # Router
│   ├── main.tsx                  # Entry point
│   ├── index.css                 # Tailwind styles
│   ├── components/
│   │   ├── PublicRankings.tsx    # Public display
│   │   └── AdminInterface.tsx    # Admin with auth
│   ├── store/
│   │   └── rankingStore.ts       # Zustand state
│   └── types/
│       └── index.ts              # TypeScript defs
├── api/
│   ├── rankings.ts               # GET /api/rankings
│   ├── health.ts                 # GET /api/health
│   └── admin/
│       ├── auth.ts               # POST /api/admin/auth
│       └── songs.ts              # GET/POST /api/admin/songs
└── scripts/
    ├── init-db.ts                # Initialize database schema
    ├── seed-songs.ts             # Populate songs
    └── seed-songs-TEMPLATE.ts    # Example format
```

## Admin Workflow

### Before Stream
1. Go to https://ninxcx.com/admin
2. Enter admin password
3. Click "Shuffle Unranked"
4. Open public page in separate window/OBS source

### During Stream
1. Read song from unranked list
2. Discuss with chat
3. Click song to select (blue highlight)
4. Click "Insert at #1" (or desired position)
5. Song instantly ranks
6. Public page updates within 5 seconds
7. Repeat for next song
8. Adjust episode number as needed
9. Click "Logout" when done

### Performance
- Selection → ranking: <1 second
- Admin → public display: <5 seconds
- Can rank 1-2 songs per minute easily

## Deployment

### Vercel Auto-Deploy

Simply push to main branch:

```bash
git push origin main
```

Vercel automatically:
1. Builds with `npm run build`
2. Outputs to `dist/`
3. Deploys Edge Functions
4. Updates live site

### Environment Setup

1. **Link Neon Database**
   - Vercel Dashboard → Integrations → Neon
   - Auto-populates `POSTGRES_PRISMA_URL`

2. **Add Admin Password**
   - Settings → Environment Variables
   - Create secret: `ADMIN_PASSWORD=<your-password>`
   - Redeploy after adding

## Database Schema

### songs table
```sql
CREATE TABLE songs (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  album VARCHAR(255) NOT NULL,
  release_year INTEGER NOT NULL,
  halo_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### ranked_songs table
```sql
CREATE TABLE ranked_songs (
  id SERIAL PRIMARY KEY,
  song_id VARCHAR(20) NOT NULL REFERENCES songs(id),
  rank INTEGER NOT NULL UNIQUE,
  episode_number INTEGER NOT NULL,
  timestamp VARCHAR(30) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Song Data Format

Each song must have:

```typescript
{
  id: "nin-1-01",              // Unique ID
  name: "Head Like a Hole",    // Song title
  album: "Pretty Hate Machine",// Album name
  releaseYear: 1989,           // Year released
  haloNumber: 1                // NIN halo number
}
```

See `SONG_DATABASE_GUIDE.md` for how to gather from Wikipedia.

## Troubleshooting

### Admin page shows "Server not configured"
- Check `ADMIN_PASSWORD` in Vercel Settings → Environment Variables
- Ensure it's set as a secret (not regular env var)
- Redeploy project

### "relation 'songs' does not exist"
- Run: `npx ts-node scripts/init-db.ts`

### Rankings not persisting
- Check Neon connection: `POSTGRES_PRISMA_URL` must be set
- Verify database schema: check Neon SQL editor

### Public page not updating
- Verify `/api/rankings` returns data: `curl https://ninxcx.com/api/rankings`
- Check browser console for errors

See `TROUBLESHOOTING.md` for more diagnostics.

## Neon Free Tier

- **Compute:** 0.25 vCPU
- **Storage:** Up to 10GB
- **Data transfer:** 1GB/month
- **Backups:** 7 days retention

Perfect for NIN rankings (uses <1MB storage).

## Future Enhancements

- [ ] Drag-to-reorder ranked songs
- [ ] Undo/redo for rankings
- [ ] Export rankings as CSV
- [ ] Song search/filter
- [ ] Halo number filtering
- [ ] Multi-stream support
- [ ] Webhook notifications (Discord alerts)
- [ ] Ranking history/timeline
- [ ] Rate limiting (prevent API abuse)

## License

MIT

## Contributing

Push to main. Vercel auto-deploys.

---

**Ready to stream?** Go to `/admin`, enter your password, and start ranking! 🎸
