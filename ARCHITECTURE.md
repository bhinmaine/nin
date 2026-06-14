# NIN Rankings Architecture Diagram

## Real-Time Data Flow

```
ADMIN INTERFACE
┌─────────────────────────────────┐
│ Admin selects song              │
│ Clicks "Insert at #2"           │
│                                 │
│ rankSong() → Zustand state ←────┼─── Local state update (instant)
└─────────────────────────────────┘
                ↓
        fetch POST /api/admin/songs
                ↓
        ┌───────────────────┐
        │ Vercel Edge Fn    │
        │ /api/songs.ts     │
        └───────────────────┘
                ↓
        ┌───────────────────┐
        │  Vercel KV        │
        │ (storage)         │
        │                   │
        │ nin:ranked ←──────┼─── Ranked songs
        │ nin:songs  ←──────┼─── Unranked songs
        └───────────────────┘


PUBLIC INTERFACE (polls every 5s)
┌─────────────────────────────────┐
│ fetch GET /api/rankings         │
│                                 │
│ TanStack Query polls            │
│ refetchInterval: 5000ms         │
└─────────────────────────────────┘
                ↓
        ┌───────────────────┐
        │ Vercel Edge Fn    │
        │ /api/songs.ts     │
        └───────────────────┘
                ↓
        ┌───────────────────┐
        │  Vercel KV        │
        │ GET nin:ranked    │
        └───────────────────┘
                ↓
        PublicRankings renders
        ranked songs in order
```

## Component Tree

```
App
├── Router
│   ├── Route: / → PublicRankings
│   │   ├── useQuery() → polls API every 5s
│   │   ├── maps ranked songs → display
│   │   └── auto-refresh on data change
│   │
│   └── Route: /admin → AdminInterface
│       ├── useRankingStore() → Zustand
│       ├── Left: UnrankedBucket
│       │   ├── shuffleUnranked() button
│       │   ├── clickable songs
│       │   └── highlights selected song
│       ├── Right: RankedBucket
│       │   ├── ordered list (rank #1 → #N)
│       │   ├── insertion buttons (when song selected)
│       │   ├── "Remove" button per song
│       │   └── re-indexes ranks on change
│       └── saveSongs() → POST to Edge Fn
```

## Data Model

```typescript
interface Song {
  id: string              // 'nin-001'
  name: string            // 'Head Like a Hole'
  album: string           // 'Pretty Hate Machine'
  releaseYear: number     // 1989
  haloNumber: number      // Halo #1
}

interface RankedSong extends Song {
  rank: number            // 1 (position in ranking)
  episodeNumber: number   // 1 (which stream episode)
  timestamp: string       // '2026-06-14T23:25:11Z'
}

// Stored in Vercel KV:
nin:songs → Song[]        // unranked songs
nin:ranked → RankedSong[] // ranked songs (ordered by rank #)
```

## Deployment Topology

```
┌──────────────────┐
│   GitHub         │
│ /main branch     │
│ (your code)      │
└────────┬─────────┘
         │ git push
         ↓
┌──────────────────┐
│    Vercel        │
│ (auto-deploy)    │
│                  │
│ ┌──────────────┐ │
│ │ Frontend     │ │  Vite build → dist/
│ │ (React)      │ │
│ └──────────────┘ │
│                  │
│ ┌──────────────┐ │
│ │ API Routes   │ │  /api/songs.ts → Edge Fn
│ │ (Edge)       │ │  <100ms globally
│ └──────────────┘ │
│                  │
│ ┌──────────────┐ │
│ │ KV Database  │ │  Persistent storage
│ │ (Redis-like) │ │  Globally replicated
│ └──────────────┘ │
└──────────────────┘
    ↑       ↑
    │       │
    │       └─ Public accesses:
    │          https://nin.vercel.app
    │
    └─ Admin accesses:
       https://nin.vercel.app/admin
```

## Performance Timeline

```
ADMIN SIDE (instantaneous)
────────────────────────────
User clicks "Insert at #2"
  ↓ (0ms) Store update
rankSong() mutates Zustand state
  ↓ (instantly visible in UI)
"Ranked" bucket updates
  ↓ (user sees green buttons)
saveSongs() posts to API (background)
  ↓ (10-50ms) Vercel Edge Fn executes
KV store updates
  ↓ (KV write completes)
Admin UI is now persisted


PUBLIC SIDE (5 second lag)
──────────────────────────
Next 5s poll fires
  ↓ fetch /api/rankings
Vercel Edge Fn retrieves nin:ranked
  ↓ (<100ms globally)
JSON response arrives
  ↓ TanStack Query processes
PublicRankings re-renders
  ↓ (user sees new ranked song)
Display updates with new rank
```

## Scaling Characteristics

```
Edge Functions (Vercel)
• Auto-scales globally (100+ regions)
• Cold start: ~50-100ms first request
• Warm: <10ms
• No server to manage
• Per-function pricing

KV Database (Vercel)
• Redis-compatible
• Globally replicated
• Low latency worldwide
• Atomic operations
• TTL support (optional)

Frontend (React)
• Static site (client-side)
• Vite optimized build
• CDN-delivered
• Auto-incremental builds
```

## Live Stream Scenario

```
Time    Admin                          Public                     KV
────────────────────────────────────────────────────────────────────────
14:00   (refresh /admin)              (https://nin.vercel.app)   
        Loads 200 unranked songs       Shows: "Rankings pending"

14:02   Selects "Head Like a Hole"
        Clicks "Insert at #1"
        ↓ Zustand updates (instant)

14:02   Ranked list shows:
+0.05s  #1 Head Like a Hole           (still polling...)
        
14:02   saveSongs() posts to API      
+0.1s   
        Edge Fn stores to KV ✓

14:02   (nothing new)                 (waiting for 5s poll...)
+3s

14:02   (stream continues              User #2 polls at T+5s
+5s    ranking more songs)            → Fetches /api/rankings
                                       → Gets nin:ranked from KV
                                       → Shows ranked songs:
                                       
                                       #1 Head Like a Hole
                                          Pretty Hate Machine (1989)
                                          Ep 1 @ 14:02 UTC
                                       
                                       (chat can see live!)
```

---

## Quick Reference

| What | Where | Speed | Persistence |
|------|-------|-------|-------------|
| State changes | Zustand (client) | Instant | None (reload loses it) |
| Saving changes | POST /api/admin | 10-50ms | Yes (KV) |
| Public updates | GET /api/rankings | <5s | Yes (KV) |
| DB operations | Vercel KV | <100ms | Forever |
| Deploy | git push → Vercel | ~2min | Auto |
