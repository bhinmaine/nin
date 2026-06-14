export interface Song {
  id: string;
  name: string;
  album: string;
  releaseYear: number;
  haloNumber: number;
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
