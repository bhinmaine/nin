export interface Song {
  id: string;
  name: string;
  album: string;
  releaseYear: number;
  haloNumber: number;
  coverArtUrl?: string | null;
  appleMusicUrl?: string | null;
  youtubeUrl?: string | null;
}

export interface RankedSong extends Song {
  rank: number;
  episodeNumber: number;
  timestamp: string; // ISO 8601
}

export interface AdminState {
  unranked: Song[];
  ranked: RankedSong[];
  loading: boolean;
  error: string | null;
}
