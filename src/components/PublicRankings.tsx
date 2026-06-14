import { useQuery } from '@tanstack/react-query';
import type { RankedSong } from '../types';

export function PublicRankings() {
  const { data: ranked, isLoading, error } = useQuery<RankedSong[]>({
    queryKey: ['ranked-songs'],
    queryFn: async () => {
      const res = await fetch('/api/rankings');
      if (!res.ok) throw new Error('Failed to fetch rankings');
      return res.json();
    },
    refetchInterval: 5000, // Poll every 5s for live updates
    retry: 3,
  });

  // Debug: Log state
  console.log('PublicRankings state:', { isLoading, error, rankedCount: ranked?.length });

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">NIN Album Rankings</h1>
          <p className="text-red-500">Error loading rankings: {error instanceof Error ? error.message : 'Unknown error'}</p>
          <p className="text-gray-400 mt-4">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">NIN Album Rankings</h1>
          <p className="text-gray-400">Loading rankings...</p>
        </div>
      </div>
    );
  }

  if (!ranked || ranked.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-2">NIN Album Rankings</h1>
          <p className="text-gray-400 mb-8">Live from the Twitch stream</p>
          <p className="text-gray-500">No rankings yet. Check back during the stream!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-2">NIN Album Rankings</h1>
        <p className="text-gray-400 mb-8">Live from the Twitch stream</p>

        <div className="space-y-4">
          {ranked.map((song) => (
            <div
              key={song.id}
              className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-gray-500 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    #{song.rank}
                  </div>
                  <h2 className="text-2xl font-semibold mb-1">{song.name}</h2>
                  <p className="text-gray-400">
                    {song.album} ({song.releaseYear})
                  </p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>Episode {song.episodeNumber}</div>
                  <div>{new Date(song.timestamp).toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
