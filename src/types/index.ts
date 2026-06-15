export interface TalkingPoints {
  production: string;
  lyrics: string;
  live: string;
  cultural: string;
  personal: string;
}

export interface Song {
  id: string;
  name: string;
  album: string;
  releaseYear: number;
  haloNumber: number;
  coverArtUrl?: string | null;
  appleMusicUrl?: string | null;
  youtubeUrl?: string | null;
  hidden?: boolean;
  talkingPoints?: TalkingPoints | null;
}

export interface Episode {
  episodeNumber: number;
  youtubeUrl: string;
  twitchUrl: string;
}

export interface RankedSong extends Song {
  rank: number;
  episodeNumber: number;
  timestamp: string; // ISO 8601
  episodeYoutubeUrl?: string | null;
  episodeTwitchUrl?: string | null;
}

export interface AdminState {
  unranked: Song[];
  ranked: RankedSong[];
  loading: boolean;
  error: string | null;
}
