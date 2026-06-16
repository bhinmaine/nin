import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRankingStore } from '../store/rankingStore';
import { Shuffle, Lock, GripVertical, StickyNote, ChevronDown } from 'lucide-react';
import { TalkingPointsModal } from './TalkingPointsModal';
import { EpisodeManager } from './EpisodeManager';
import type { Song } from '../types';

// What's being dragged and from where
type DragSource =
  | { kind: 'unranked'; songId: string }
  | { kind: 'ranked'; songId: string };

// Thin drop target between ranked items — expands green when active
function DropZone({
  active,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  active: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`rounded transition-all duration-100 ${
        active
          ? 'h-8 bg-green-500/30 border-2 border-green-400 border-dashed my-1'
          : 'h-1.5'
      }`}
    />
  );
}

export function AdminInterface() {
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [selectedUnrankedId, setSelectedUnrankedId] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [authedPassword, setAuthedPassword] = useState(() => localStorage.getItem('nin-admin-pw') ?? '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [talkingPointsSong, setTalkingPointsSong] = useState<Song | null>(null);
  const [showEpisodeManager, setShowEpisodeManager] = useState(false);

  // Drag state
  const dragSource = useRef<DragSource | null>(null);
  const [dragOverRankedIdx, setDragOverRankedIdx] = useState<number | null>(null);
  const [dragOverUnranked, setDragOverUnranked] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);

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
        setAuthedPassword(password);
        localStorage.setItem('nin-admin-auth', 'true');
        localStorage.setItem('nin-admin-pw', password);
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
    setAuthedPassword('');
    localStorage.removeItem('nin-admin-auth');
    localStorage.removeItem('nin-admin-pw');
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
    const newUnranked = store.unranked.filter(s => s.id !== song.id);
    const newRanked = [...store.ranked];
    const rankedSong = { ...song, rank: position + 1, episodeNumber, timestamp: new Date().toISOString() };
    newRanked.splice(position, 0, rankedSong);
    newRanked.forEach((s, i) => { s.rank = i + 1; });
    saveSongs(newUnranked, newRanked);
  };

  const handleUnrankSong = (songId: string) => {
    store.unrankSong(songId);
    const song = store.ranked.find(s => s.id === songId);
    if (!song) return;
    const newRanked = store.ranked.filter(s => s.id !== songId);
    newRanked.forEach((s, i) => { s.rank = i + 1; });
    const { rank, episodeNumber: ep, timestamp, ...songData } = song;
    saveSongs([...store.unranked, songData as Song], newRanked);
  };

  const handleReorder = (songId: string, newPosition: number) => {
    store.reorderRanked(songId, newPosition);
    // compute new state inline to avoid stale closure
    const idx = store.ranked.findIndex(s => s.id === songId);
    const newRanked = [...store.ranked];
    const [moved] = newRanked.splice(idx, 1);
    newRanked.splice(newPosition, 0, moved);
    newRanked.forEach((s, i) => { s.rank = i + 1; });
    saveSongs(store.unranked, newRanked);
  };

  // ── Drag handlers ──────────────────────────────────────────────

  const onDragStartUnranked = (e: React.DragEvent, songId: string) => {
    dragSource.current = { kind: 'unranked', songId };
    setDraggingId(songId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragStartRanked = (e: React.DragEvent, songId: string) => {
    dragSource.current = { kind: 'ranked', songId };
    setDraggingId(songId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragEnd = () => {
    dragSource.current = null;
    setDraggingId(null);
    setDragOverRankedIdx(null);
    setDragOverUnranked(false);
  };

  // Drop onto ranked list — index is the insert-before position
  const onDropOnRanked = (e: React.DragEvent, insertBefore: number) => {
    e.preventDefault();
    setDragOverRankedIdx(null);
    const src = dragSource.current;
    if (!src) return;

    if (src.kind === 'unranked') {
      const song = store.unranked.find(s => s.id === src.songId);
      if (song) handleRankSong(song, insertBefore);
    } else {
      // reranking: adjust target index if moving down
      const fromIdx = store.ranked.findIndex(s => s.id === src.songId);
      if (fromIdx === -1) return;
      let target = insertBefore;
      if (fromIdx < insertBefore) target = insertBefore - 1;
      if (target !== fromIdx) handleReorder(src.songId, target);
    }
  };

  // Drop onto unranked bucket — unranks a ranked song
  const onDropOnUnranked = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverUnranked(false);
    const src = dragSource.current;
    if (src?.kind === 'ranked') handleUnrankSong(src.songId);
  };

  const onDragOverRanked = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverRankedIdx(idx);
    setDragOverUnranked(false);
  };

  const onDragOverUnranked = (e: React.DragEvent) => {
    if (dragSource.current?.kind !== 'ranked') return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverUnranked(true);
    setDragOverRankedIdx(null);
  };
  // ───────────────────────────────────────────────────────────────

  const saveSongs = async (unranked = store.unranked, ranked = store.ranked) => {
    await fetch('/api/admin/songs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unranked, ranked }),
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
    <>
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold">Admin: NIN Rankings</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEpisodeManager(v => !v)}
              className="px-3 py-1.5 md:px-4 md:py-2 bg-zinc-700 hover:bg-zinc-600 rounded text-sm transition flex-shrink-0 flex items-center gap-1.5"
            >
              Episode Links <ChevronDown size={14} className={`transition-transform ${showEpisodeManager ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition flex-shrink-0 ml-4"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Episode Manager Panel */}
        {showEpisodeManager && (
          <div className="mb-6 bg-zinc-900 border border-zinc-700 rounded-lg p-4 md:p-6">
            <EpisodeManager adminPassword={authedPassword} />
          </div>
        )}

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
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => {
                const sorted = [...store.unranked].sort((a, b) =>
                  a.releaseYear !== b.releaseYear
                    ? a.releaseYear - b.releaseYear
                    : a.haloNumber !== b.haloNumber
                    ? a.haloNumber - b.haloNumber
                    : a.id.localeCompare(b.id)
                );
                store.setUnranked(sorted);
                saveSongs(sorted, store.ranked);
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded flex items-center gap-2 text-sm md:text-base"
            >
              ⏱ Release Order
            </button>
            <button
              onClick={() => {
                const shuffled = [...store.unranked].sort(() => Math.random() - 0.5);
                store.setUnranked(shuffled);
                saveSongs(shuffled, store.ranked);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-2 text-sm md:text-base"
            >
              <Shuffle size={16} /> Shuffle
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {/* UNRANKED BUCKET */}
          <div
            className={`bg-gray-900 rounded-lg p-4 md:p-6 border transition ${
              dragOverUnranked ? 'border-blue-400 bg-gray-800' : 'border-gray-700'
            }`}
            onDragOver={onDragOverUnranked}
            onDragLeave={() => setDragOverUnranked(false)}
            onDrop={onDropOnUnranked}
          >
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">
              Unranked ({store.unranked.length})
              {dragOverUnranked && <span className="ml-2 text-sm text-blue-400 font-normal">Drop to unrank</span>}
            </h2>
            <div className="space-y-2 max-h-[50vh] md:max-h-[calc(100vh-300px)] overflow-y-auto">
              {store.unranked.map((song) => (
                <div
                  key={song.id}
                  draggable
                  onDragStart={(e) => onDragStartUnranked(e, song.id)}
                  onDragEnd={onDragEnd}
                  onClick={() => setSelectedUnrankedId(song.id)}
                  className={`flex items-center gap-3 p-3 rounded cursor-grab active:cursor-grabbing transition ${
                    draggingId === song.id
                      ? 'opacity-40'
                      : selectedUnrankedId === song.id
                      ? 'bg-blue-700'
                      : song.hidden
                      ? 'bg-gray-800/50 opacity-40 hover:opacity-70'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <GripVertical size={14} className="text-gray-600 flex-shrink-0" />
                  {song.coverArtUrl ? (
                    <img src={song.coverArtUrl} alt={song.album} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-gray-700 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold text-sm md:text-base truncate">
                      {song.name}
                      {song.hidden && <span className="ml-2 text-xs text-gray-500 font-normal">(hidden)</span>}
                    </div>
                    <div className="text-xs md:text-sm text-gray-400 truncate flex items-center gap-1.5">
                      <span className="text-red-500 font-mono flex-shrink-0">halo {song.haloNumber}</span>
                      <span>·</span>
                      <span className="truncate">{song.album} · {song.releaseYear}</span>
                      {song.appleMusicUrl && <a href={song.appleMusicUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-pink-400 hover:text-pink-300 flex-shrink-0" title="Apple Music">♫</a>}
                      {song.youtubeUrl && <a href={song.youtubeUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-red-400 hover:text-red-300 flex-shrink-0" title="YouTube">▶</a>}
                      <button
                        onClick={e => { e.stopPropagation(); setTalkingPointsSong(song); }}
                        title="Talking points"
                        className={`flex-shrink-0 transition-colors ${
                          song.talkingPoints && Object.values(song.talkingPoints).some(v => v?.trim())
                            ? 'text-amber-400 hover:text-amber-300'
                            : 'text-zinc-600 hover:text-zinc-400'
                        }`}
                      >
                        <StickyNote size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RANKED BUCKET */}
          <div className="bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-700">
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Ranked ({store.ranked.length})</h2>
            <div
              className={`max-h-[50vh] md:max-h-[calc(100vh-300px)] overflow-y-auto rounded transition ${
                store.ranked.length === 0 && dragOverRankedIdx === 0
                  ? 'bg-green-500/10 border-2 border-green-400 border-dashed'
                  : ''
              }`}
              onDragOver={store.ranked.length === 0 ? (e) => onDragOverRanked(e, 0) : undefined}
              onDragLeave={store.ranked.length === 0 ? () => setDragOverRankedIdx(null) : undefined}
              onDrop={store.ranked.length === 0 ? (e) => onDropOnRanked(e, 0) : undefined}
            >

              {/* Drop zone before #1 — always present */}
              {store.ranked.length > 0 && (
                <DropZone
                  active={dragOverRankedIdx === 0}
                  onDragOver={(e) => onDragOverRanked(e, 0)}
                  onDragLeave={() => setDragOverRankedIdx(null)}
                  onDrop={(e) => onDropOnRanked(e, 0)}
                />
              )}
              {store.ranked.map((song, idx) => (
                <div key={song.id}>
                  <div
                    draggable
                    onDragStart={(e) => onDragStartRanked(e, song.id)}
                    onDragEnd={onDragEnd}
                    className={`flex items-center gap-3 p-3 rounded transition group mb-0.5 ${
                      draggingId === song.id
                        ? 'opacity-40 bg-gray-800'
                        : 'bg-gray-800 hover:bg-gray-700 cursor-grab active:cursor-grabbing'
                    }`}
                  >
                    <GripVertical size={14} className="text-gray-600 flex-shrink-0" />
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
                      <div className="text-xs text-gray-400 truncate flex items-center gap-1.5">
                        <span className="text-red-500 font-mono flex-shrink-0">halo {song.haloNumber}</span>
                        <span>·</span>
                        <span className="truncate">{song.album} · {song.releaseYear}</span>
                        {song.appleMusicUrl && <a href={song.appleMusicUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-pink-400 hover:text-pink-300 flex-shrink-0" title="Apple Music">♫</a>}
                        {song.youtubeUrl && <a href={song.youtubeUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-red-400 hover:text-red-300 flex-shrink-0" title="YouTube">▶</a>}
                        <button
                          onClick={e => { e.stopPropagation(); setTalkingPointsSong(song); }}
                          title="Talking points"
                          className={`flex-shrink-0 transition-colors ${
                            song.talkingPoints && Object.values(song.talkingPoints).some(v => v?.trim())
                              ? 'text-amber-400 hover:text-amber-300'
                              : 'text-zinc-600 hover:text-zinc-400'
                          }`}
                        >
                          <StickyNote size={13} />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnrankSong(song.id)}
                      className="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs bg-red-700 hover:bg-red-800 rounded transition"
                    >
                      Remove
                    </button>
                  </div>
                  <DropZone
                    active={dragOverRankedIdx === idx + 1}
                    onDragOver={(e) => onDragOverRanked(e, idx + 1)}
                    onDragLeave={() => setDragOverRankedIdx(null)}
                    onDrop={(e) => onDropOnRanked(e, idx + 1)}
                  />
                </div>
              ))}

              {/* Empty state prompt */}
              {store.ranked.length === 0 && (
                <div className="text-center text-gray-500 py-12 text-sm pointer-events-none">
                  {dragOverRankedIdx === 0 ? '📍 Drop here' : 'Drag a song here to start ranking'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Talking Points Modal */}
    {talkingPointsSong && (
      <TalkingPointsModal
        song={talkingPointsSong}
        onClose={() => setTalkingPointsSong(null)}
        adminPassword={authedPassword}
      />
    )}
    </>
  );
}
