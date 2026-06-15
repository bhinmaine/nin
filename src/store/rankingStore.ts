import { create } from 'zustand';
import type { Song, RankedSong } from '../types';

const STORAGE_KEY = 'nin-unranked-order';

function saveUnrankedOrder(songs: Song[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(songs.map(s => s.id)));
  } catch {}
}

function loadUnrankedOrder(): string[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function applyStoredOrder(songs: Song[]): Song[] {
  const order = loadUnrankedOrder();
  if (!order) return songs;
  const map = new Map(songs.map(s => [s.id, s]));
  const ordered = order.flatMap(id => map.has(id) ? [map.get(id)!] : []);
  // Append any songs not in the stored order (newly unranked, etc.)
  const inOrder = new Set(order);
  const remainder = songs.filter(s => !inOrder.has(s.id));
  return [...ordered, ...remainder];
}

interface RankingStore {
  unranked: Song[];
  ranked: RankedSong[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setUnranked: (songs: Song[]) => void;
  setRanked: (songs: RankedSong[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Rank a song: move from unranked to ranked at a specific position
  rankSong: (song: Song, position: number, episodeNumber: number) => void;
  
  // Unrank a song: move from ranked back to unranked
  unrankSong: (songId: string) => void;
  
  // Reorder a ranked song
  reorderRanked: (songId: string, newPosition: number) => void;
  
  // Shuffle unranked for randomization
  shuffleUnranked: () => void;
}

export const useRankingStore = create<RankingStore>((set) => ({
  unranked: [],
  ranked: [],
  loading: false,
  error: null,
  
  setUnranked: (songs) => {
    const ordered = applyStoredOrder(songs);
    saveUnrankedOrder(ordered);
    set({ unranked: ordered });
  },
  setRanked: (songs) => set({ ranked: songs }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  rankSong: (song, position, episodeNumber) => set((state) => {
    const newUnranked = state.unranked.filter(s => s.id !== song.id);
    const newRanked = [...state.ranked];
    
    const rankedSong: RankedSong = {
      ...song,
      rank: position + 1,
      episodeNumber,
      timestamp: new Date().toISOString(),
    };
    
    newRanked.splice(position, 0, rankedSong);
    // Re-index ranks after insertion
    newRanked.forEach((s, i) => { s.rank = i + 1; });
    
    return { unranked: newUnranked, ranked: newRanked };
  }),
  
  unrankSong: (songId) => set((state) => {
    const song = state.ranked.find(s => s.id === songId);
    if (!song) return state;
    
    const newRanked = state.ranked.filter(s => s.id !== songId);
    newRanked.forEach((s, i) => { s.rank = i + 1; });
    
    const { rank, episodeNumber, timestamp, ...songData } = song;
    const newUnranked = [...state.unranked, songData as Song];
    saveUnrankedOrder(newUnranked);
    return {
      ranked: newRanked,
      unranked: newUnranked,
    };
  }),
  
  reorderRanked: (songId, newPosition) => set((state) => {
    const songIndex = state.ranked.findIndex(s => s.id === songId);
    if (songIndex === -1) return state;
    
    const newRanked = [...state.ranked];
    const [song] = newRanked.splice(songIndex, 1);
    newRanked.splice(newPosition, 0, song);
    
    // Re-index ranks
    newRanked.forEach((s, i) => { s.rank = i + 1; });
    
    return { ranked: newRanked };
  }),
  
  shuffleUnranked: () => set((state) => {
    const shuffled = [...state.unranked].sort(() => Math.random() - 0.5);
    saveUnrankedOrder(shuffled);
    return { unranked: shuffled };
  }),
}));
