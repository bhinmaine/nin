import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRankingStore } from '../store/rankingStore';
import { ChevronRight, Shuffle } from 'lucide-react';
import type { Song } from '../types';

export function AdminInterface() {
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [selectedUnrankedId, setSelectedUnrankedId] = useState<string | null>(null);

  const store = useRankingStore();

  // Load initial data
  useQuery({
    queryKey: ['admin-songs'],
    queryFn: async () => {
      const res = await fetch('/api/admin/songs');
      if (!res.ok) throw new Error('Failed to fetch songs');
      const data = await res.json();
      store.setUnranked(data.unranked);
      store.setRanked(data.ranked);
      return data;
    },
  });

  const handleRankSong = (song: Song, position: number) => {
    store.rankSong(song, position, episodeNumber);
    setSelectedUnrankedId(null);
    saveSongs();
  };

  const handleUnrankSong = (songId: string) => {
    store.unrankSong(songId);
    saveSongs();
  };

  // const handleReorderRanked = (songId: string, newPosition: number) => {
  //   store.reorderRanked(songId, newPosition);
  //   saveSongs();
  // };
  // Future feature: drag-to-reorder ranked songs

  const saveSongs = async () => {
    await fetch('/api/admin/songs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        unranked: store.unranked,
        ranked: store.ranked,
      }),
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin: NIN Rankings</h1>

        <div className="mb-6 flex gap-4 items-center">
          <label className="font-semibold">
            Episode Number:
            <input
              type="number"
              min="1"
              value={episodeNumber}
              onChange={(e) => setEpisodeNumber(parseInt(e.target.value))}
              className="ml-2 px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white"
            />
          </label>
          <button
            onClick={() => store.shuffleUnranked()}
            className="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-2"
          >
            <Shuffle size={18} /> Shuffle Unranked
          </button>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* UNRANKED BUCKET */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4">Unranked ({store.unranked.length})</h2>
            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {store.unranked.map((song) => (
                <div
                  key={song.id}
                  onClick={() => setSelectedUnrankedId(song.id)}
                  className={`p-3 rounded cursor-pointer transition ${
                    selectedUnrankedId === song.id
                      ? 'bg-blue-700'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <div className="font-semibold">{song.name}</div>
                  <div className="text-sm text-gray-400">
                    {song.album} • {song.releaseYear}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RANKED BUCKET */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4">Ranked ({store.ranked.length})</h2>
            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {store.ranked.map((song) => (
                <div
                  key={song.id}
                  className="flex items-center gap-3 p-3 bg-gray-800 rounded hover:bg-gray-700 transition group"
                >
                  <div className="flex-shrink-0 w-8 font-bold text-red-500">
                    #{song.rank}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{song.name}</div>
                    <div className="text-xs text-gray-400">
                      {song.album} • {song.releaseYear}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnrankSong(song.id)}
                    className="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs bg-red-700 hover:bg-red-800 rounded transition"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {/* INSERTION POINTS */}
              {selectedUnrankedId && (
                <>
                  <button
                    onClick={() => {
                      const song = store.unranked.find(s => s.id === selectedUnrankedId);
                      if (song) handleRankSong(song, 0);
                    }}
                    className="w-full py-2 text-center text-sm bg-green-700 hover:bg-green-600 rounded transition font-semibold"
                  >
                    <ChevronRight className="inline mr-2" size={16} />
                    Insert at #1
                  </button>

                  {store.ranked.map((_, idx) => (
                    <button
                      key={`insert-${idx}`}
                      onClick={() => {
                        const song = store.unranked.find(s => s.id === selectedUnrankedId);
                        if (song) handleRankSong(song, idx + 1);
                      }}
                      className="w-full py-2 text-center text-sm bg-green-700 hover:bg-green-600 rounded transition font-semibold"
                    >
                      <ChevronRight className="inline mr-2" size={16} />
                      Insert after #{idx + 1}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
