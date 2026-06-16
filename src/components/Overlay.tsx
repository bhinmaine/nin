// src/components/Overlay.tsx
// Twitch browser source overlay — transparent bg, live-updating
// Add as Browser Source in OBS/Twitch: URL = https://ninxcx.com/overlay

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { RankedSong } from '../types';

export function Overlay() {
  // Transparent background for OBS browser source
  useEffect(() => {
    document.body.style.background = 'transparent';
    document.documentElement.style.background = 'transparent';
    return () => {
      document.body.style.background = '';
      document.documentElement.style.background = '';
    };
  }, []);

  const { data: ranked } = useQuery<RankedSong[]>({
    queryKey: ['ranked-songs-overlay'],
    queryFn: async () => {
      const res = await fetch('/api/rankings');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    refetchInterval: 3000,
    retry: true,
  });

  const latest = ranked?.[0] ?? null;
  const list = ranked ?? [];

  return (
    <div
      className="w-full min-h-screen p-4 flex flex-col gap-3"
      style={{ background: 'transparent', fontFamily: 'sans-serif' }}
    >
      {/* Now Ranking — most recently added (highest rank number) */}
      {latest && (() => {
        const newest = [...list].sort((a, b) => b.rank - a.rank)[0];
        return (
          <div className="bg-black/80 border border-red-600 rounded-lg px-4 py-3 backdrop-blur">
            <div className="text-red-500 text-xs font-bold tracking-widest uppercase mb-1">Now Ranking</div>
            <div className="flex items-center gap-3">
              {newest.coverArtUrl && (
                <img src={newest.coverArtUrl} alt="" className="w-10 h-10 rounded flex-shrink-0 object-cover" />
              )}
              <div className="min-w-0">
                <div className="text-white font-bold text-base leading-tight truncate">{newest.name}</div>
                <div className="text-gray-400 text-xs truncate">
                  <span className="text-red-400 font-mono">#{newest.rank}</span>
                  {' · '}halo {newest.haloNumber} · {newest.album}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Full ranked list */}
      {list.length > 0 && (
        <div className="bg-black/75 border border-zinc-700 rounded-lg overflow-hidden backdrop-blur">
          <div className="text-zinc-400 text-xs font-bold tracking-widest uppercase px-3 py-2 border-b border-zinc-700">
            Rankings
          </div>
          <div className="divide-y divide-zinc-800">
            {list.map((song) => (
              <div key={song.id} className="flex items-center gap-3 px-3 py-2">
                <span className="text-red-500 font-mono font-bold text-sm w-8 flex-shrink-0">#{song.rank}</span>
                {song.coverArtUrl && (
                  <img src={song.coverArtUrl} alt="" className="w-8 h-8 rounded flex-shrink-0 object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-white text-sm font-medium truncate">{song.name}</div>
                  <div className="text-zinc-500 text-xs truncate">halo {song.haloNumber} · {song.album}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {list.length === 0 && (
        <div className="bg-black/75 border border-zinc-700 rounded-lg px-4 py-3 backdrop-blur">
          <div className="text-zinc-500 text-sm">No rankings yet.</div>
        </div>
      )}
    </div>
  );
}
