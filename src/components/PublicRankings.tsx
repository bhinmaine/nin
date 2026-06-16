import { useQuery } from '@tanstack/react-query';
import type { RankedSong } from '../types';
import { NINLogo } from './NINLogo';

const YT_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const TWITCH_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
  </svg>
);

function Subtitle() {
  return (
    <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
      From the opinions of Ben Hamilton
      <a href="https://www.youtube.com/@possiblyben" target="_blank" rel="noopener noreferrer"
         className="text-red-400 hover:text-red-300 transition" title="YouTube">
        {YT_ICON}
      </a>
      <a href="https://www.twitch.tv/possiblyben" target="_blank" rel="noopener noreferrer"
         className="text-purple-400 hover:text-purple-300 transition" title="Twitch">
        {TWITCH_ICON}
      </a>
    </p>
  );
}

export function PublicRankings() {
  const { data: ranked, isLoading, error } = useQuery<RankedSong[]>({
    queryKey: ['ranked-songs'],
    queryFn: async () => {
      const res = await fetch('/api/rankings');
      if (!res.ok) throw new Error('Failed to fetch rankings');
      return res.json();
    },
    refetchInterval: 5000,
    retry: 3,
  });

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <NINLogo className="w-48 mx-auto mb-4" />
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
          <NINLogo className="w-48 mx-auto mb-4" />
          <p className="text-gray-400">Loading rankings...</p>
        </div>
      </div>
    );
  }

  if (!ranked || ranked.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <NINLogo className="w-56 mx-auto mb-2 text-white" />
          <p className="text-gray-500 text-xs tracking-[0.3em] uppercase mb-3">Song Rankings</p>
          <Subtitle />
          <p className="text-gray-500 mt-4">No rankings yet. Check back during the stream!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center text-center mb-10">
          <NINLogo className="w-56 mb-2 text-white" />
          <p className="text-gray-500 text-xs tracking-[0.3em] uppercase mb-3">Song Rankings</p>
          <Subtitle />
        </div>

        <div className="space-y-4">
          {ranked.map((song) => (
            <div
              key={song.id}
              className="bg-gray-900 border border-gray-700 rounded-lg p-4 md:p-6 hover:border-gray-500 transition"
            >
              <div className="flex items-center gap-4">
                {song.coverArtUrl ? (
                  <img
                    src={song.coverArtUrl}
                    alt={song.album}
                    className="w-16 h-16 md:w-20 md:h-20 rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded bg-gray-800 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-2xl md:text-4xl font-bold text-red-600 mb-1">
                    #{song.rank}
                  </div>
                  <h2 className="text-lg md:text-2xl font-semibold truncate">{song.name}</h2>
                  <p className="text-gray-400 text-sm md:text-base truncate">
                    <span className="text-red-500 font-mono">halo {song.haloNumber}</span> · {song.album} ({song.releaseYear})
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    {song.appleMusicUrl && (
                      <a href={song.appleMusicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-pink-400 hover:text-pink-300 transition">
                        <span>♫</span> <span>Apple Music</span>
                      </a>
                    )}
                    {song.youtubeUrl && (
                      <a href={song.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition">
                        <span>▶</span> <span>YouTube</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="text-right text-xs md:text-sm text-gray-500 flex-shrink-0">
                  <div className="font-mono mb-1">Ep. {song.episodeNumber}</div>
                  <div className="flex flex-col gap-1 items-end">
                    {song.episodeYoutubeUrl && (
                      <a
                        href={song.episodeYoutubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-red-400 hover:text-red-300 transition"
                        title={`Watch episode ${song.episodeNumber} on YouTube`}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        <span className="hidden md:inline">YouTube</span>
                      </a>
                    )}
                    {song.episodeTwitchUrl && (
                      <a
                        href={song.episodeTwitchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition"
                        title={`Watch episode ${song.episodeNumber} on Twitch`}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>
                        <span className="hidden md:inline">Twitch</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-zinc-800 text-center">
          <p className="text-zinc-600 text-sm">
            Song data & history courtesy of{' '}
            <a
              href="https://www.nin.wiki"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white transition-colors underline underline-offset-2"
            >
              nin.wiki
            </a>
            {' '}— the community NIN encyclopedia
          </p>
        </footer>
      </div>
    </div>
  );
}
