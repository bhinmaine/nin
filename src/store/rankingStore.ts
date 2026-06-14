import { create } from 'zustand';
import type { Song, RankedSong } from '../types';

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
  
  setUnranked: (songs) => set({ unranked: songs }),
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
    // Re-index ranks
    newRanked.forEach((s, i) => { s.rank = i + 1; });
    
    const { rank, episodeNumber, timestamp, ...songData } = song;
    return {
      ranked: newRanked,
      unranked: [...state.unranked, songData as Song],
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
  
  shuffleUnranked: () => set((state) => ({
    unranked: [...state.unranked].sort(() => Math.random() - 0.5),
  })),
}));
