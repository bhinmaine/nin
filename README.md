# NIN Album Rankings

A real-time ranking application for Nine Inch Nails albums during a Twitch stream.

## Features

- **Public Interface**: Real-time display of ranked songs sorted by position
- **Admin Interface**: Two-bucket UI for quick ranking
  - Unranked songs displayed in randomized order
  - Click to select, then choose insertion point
  - Instant public updates
  - Episode number tracking and timestamps

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **State**: Zustand + TanStack Query
- **Styling**: Tailwind CSS
- **Backend**: Vercel Edge Functions + Vercel KV
- **Hosting**: Vercel

## Project Structure

```
src/
  components/
    AdminInterface.tsx    - Two-bucket ranking UI
    PublicRankings.tsx    - Real-time public display
  store/
    rankingStore.ts       - Zustand state management
  api/
    songs.ts              - Ranking/fetching logic
  types/
    index.ts              - TypeScript interfaces
  App.tsx                 - Router setup
  main.tsx                - Entry point
```

## Getting Started

### Local Development

```bash
npm install
npm run dev
```

- Public: http://localhost:5173
- Admin: http://localhost:5173/admin

### Build & Deploy

```bash
npm run build
git push origin main  # Vercel auto-deploys
```

## Environment Setup

1. Create a Vercel KV database: https://vercel.com/docs/storage/vercel-kv
2. Link to your Vercel project
3. Environment variables are auto-loaded

## Admin Workflow

1. Go to `/admin`
2. Set the current episode number
3. Click "Shuffle Unranked" to randomize the list
4. Click a song to select it
5. Click an insertion point (Insert at #1, #2, etc.)
6. Song moves to ranked bucket instantly
7. Public page updates in real-time (5s poll)
8. Click "Remove" to move song back to unranked

## Song Database Seed

Songs need to be loaded into Vercel KV initially. Use `npm run seed` to load the NIN Halo catalog.

See `scripts/seed-songs.ts` for the complete catalog.

## URLs

- **Public**: https://nin.vercel.app
- **Admin**: https://nin.vercel.app/admin (add auth later if needed)
