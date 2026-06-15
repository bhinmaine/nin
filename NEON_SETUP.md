# Neon Database Setup Guide

## What is Neon?

Neon is a serverless PostgreSQL database with a **free tier** perfect for our ranking app:
- 3 projects free
- Unlimited projects on free tier
- Instant provisioning
- Built-in Vercel integration

## Setup Steps

### 1. Create Neon Account & Project

1. Go to: https://neon.tech
2. Sign up (free)
3. Create a new project → "NIN Rankings" or similar
4. Select region (any region works)
5. Choose PostgreSQL version (latest is fine)
6. Click "Create Project"

### 2. Get Connection String

1. In Neon dashboard, go to your project
2. Click "Connection string" tab
3. Copy the connection string (starts with `postgresql://`)
4. Keep it safe (contains password)

### 3. Link to Vercel

**Option A: Automatic (Recommended)**
```
1. Vercel Dashboard → nineinchnails project
2. Settings → Integrations
3. Search "Neon"
4. Click "Add Integration"
5. Authorize Neon
6. Select your Neon project
7. Auto-populates: POSTGRES_PRISMA_URL and POSTGRES_URL_NON_POOLING
```

**Option B: Manual**
```
1. Vercel Dashboard → Settings → Environment Variables
2. Add: POSTGRES_PRISMA_URL = <your-connection-string>
3. Click "Save"
4. Redeploy project
```

### 4. Initialize Database Schema

```bash
# Install dependencies
npm install @vercel/postgres

# Create tables
npx ts-node scripts/init-db.ts

# Output should show:
# ✓ Created songs table
# ✓ Created ranked_songs table
# ✓ Created indexes
# ✅ Database initialized successfully
```

### 5. Seed Songs

```bash
# Fill scripts/seed-songs.ts with NIN catalog from Wikipedia
# Then run:
npx ts-node scripts/seed-songs.ts

# Output should show:
# 🌱 Seeding XX NIN songs to database...
# ✅ Seeded XX songs successfully
```

### 6. Verify Connection

Test the API endpoints:
```bash
curl https://ninxcx.com/api/rankings
# Should return: [...]  (array of songs)

curl https://ninxcx.com/api/admin/songs
# Should return: { "unranked": [...], "ranked": [] }
```

## Database Schema

### `songs` table
```sql
CREATE TABLE songs (
  id VARCHAR(20) PRIMARY KEY,           -- 'nin-1-01'
  name VARCHAR(255) NOT NULL,           -- 'Head Like a Hole'
  album VARCHAR(255) NOT NULL,          -- 'Pretty Hate Machine'
  release_year INTEGER NOT NULL,        -- 1989
  halo_number INTEGER NOT NULL,         -- 1
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `ranked_songs` table
```sql
CREATE TABLE ranked_songs (
  id SERIAL PRIMARY KEY,
  song_id VARCHAR(20) NOT NULL REFERENCES songs(id),
  rank INTEGER NOT NULL UNIQUE,         -- 1, 2, 3, ...
  episode_number INTEGER NOT NULL,      -- Which stream episode
  timestamp VARCHAR(30) NOT NULL,       -- ISO 8601
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "relation 'songs' does not exist" | Run: `npx ts-node scripts/init-db.ts` |
| Connection refused | Check POSTGRES_URL in Settings → Environment Variables |
| Songs not loading in admin | Run: `npx ts-node scripts/seed-songs.ts` |
| Empty rankings on public page | That's normal - no songs ranked yet |

## Free Tier Limits

- **Compute:** 0.25 vCPU
- **Storage:** Up to 10GB
- **Data transfer:** 1GB/month
- **Backups:** 7 days retention

For NIN rankings, you'll use maybe 1MB. No problem!

## Neon Console

View your data anytime:
1. Go to Neon dashboard
2. Select your project
3. Click "SQL Editor"
4. Query directly:

```sql
-- See all songs
SELECT * FROM songs;

-- See ranked songs
SELECT s.name, r.rank FROM ranked_songs r
JOIN songs s ON r.song_id = s.id
ORDER BY r.rank;

-- See unranked count
SELECT COUNT(*) FROM songs
WHERE id NOT IN (SELECT song_id FROM ranked_songs);
```

## Backup & Data Safety

Neon automatically backs up data. Your rankings are safe even if something goes wrong.

To manually export:
```sql
-- In Neon SQL Editor, select all and download as CSV
SELECT * FROM ranked_songs;
```

---

That's it! Your database is now fully configured. 🎉
