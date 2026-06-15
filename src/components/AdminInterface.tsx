import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRankingStore } from '../store/rankingStore';
import { ChevronRight, Shuffle, Lock } from 'lucide-react';
import type { Song } from '../types';

export function AdminInterface() {
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [selectedUnrankedId, setSelectedUnrankedId] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const store = useRankingStore();

  // Check localStorage on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('nin-admin-auth') === 'true';
    setIsAuthenticated(savedAuth);
    setIsHydrated(true);
  }, []);

  // Check if password is correct (via API)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      
      if (res.ok) {
        setIsAuthenticated(true);
        localStorage.setItem('nin-admin-auth', 'true');
        setPassword('');
      } else {
        alert('Incorrect password');
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Authentication failed');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('nin-admin-auth');
  };

  // Load initial data
  useQuery({
    queryKey: ['admin-songs'],
    enabled: isAuthenticated && isHydrated,
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

  // Show nothing until hydrated (prevents flash of login screen)
  if (!isHydrated) {
    return null;
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
            <div className="flex items-center justify-center mb-6">
              <Lock size={32} className="text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-center mb-2">Admin Access</h1>
            <p className="text-gray-400 text-center mb-6">Enter password to manage rankings</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                autoFocus
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
              >
                Unlock
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold">Admin: NIN Rankings</h1>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition flex-shrink-0 ml-4"
          >
            Logout
          </button>
        </div>

        <div className="mb-4 md:mb-6 flex flex-wrap gap-3 items-center">
          <label className="font-semibold flex items-center gap-2">
            Episode Number:
            <input
              type="number"
              min="1"
              value={episodeNumber}
              onChange={(e) => setEpisodeNumber(parseInt(e.target.value))}
              className="w-20 px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white"
            />
          </label>
          <button
            onClick={() => store.shuffleUnranked()}
            className="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-2 text-sm md:text-base"
          >
            <Shuffle size={16} /> Shuffle Unranked
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {/* UNRANKED BUCKET */}
          <div className="bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-700">
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Unranked ({store.unranked.length})</h2>
            <div className="space-y-2 max-h-[50vh] md:max-h-[calc(100vh-300px)] overflow-y-auto">
              {store.unranked.map((song) => (
                <div
                  key={song.id}
                  onClick={() => setSelectedUnrankedId(song.id)}
                  className={`flex items-center gap-3 p-3 rounded cursor-pointer transition ${
                    selectedUnrankedId === song.id
                      ? 'bg-blue-700'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {song.coverArtUrl ? (
                    <img src={song.coverArtUrl} alt={song.album} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-gray-700 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold text-sm md:text-base truncate">{song.name}</div>
                    <div className="text-xs md:text-sm text-gray-400 truncate">
                      {song.album} • {song.releaseYear}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RANKED BUCKET */}
          <div className="bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-700">
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Ranked ({store.ranked.length})</h2>
            <div className="space-y-2 max-h-[50vh] md:max-h-[calc(100vh-300px)] overflow-y-auto">
              {store.ranked.map((song) => (
                <div
                  key={song.id}
                  className="flex items-center gap-3 p-3 bg-gray-800 rounded hover:bg-gray-700 transition group"
                >
                  <div className="flex-shrink-0 w-8 font-bold text-red-500 text-center">
                    #{song.rank}
                  </div>
                  {song.coverArtUrl ? (
                    <img src={song.coverArtUrl} alt={song.album} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-gray-700 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm md:text-base truncate">{song.name}</div>
                    <div className="text-xs text-gray-400 truncate">
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
