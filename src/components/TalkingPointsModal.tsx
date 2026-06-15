// src/components/TalkingPointsModal.tsx
import { useState, useEffect, useCallback } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import type { Song, TalkingPoints } from '../types';

interface Props {
  song: Song;
  onClose: () => void;
  adminPassword: string;
}

const FIELDS: { key: keyof TalkingPoints; label: string; icon: string }[] = [
  { key: 'production', label: 'Production', icon: '🎛️' },
  { key: 'lyrics',     label: 'Lyrics / Themes', icon: '✍️' },
  { key: 'live',       label: 'Live History', icon: '🎤' },
  { key: 'cultural',   label: 'Cultural Context', icon: '🌍' },
  { key: 'personal',   label: 'My Notes', icon: '📝' },
];

const EMPTY: TalkingPoints = {
  production: '',
  lyrics: '',
  live: '',
  cultural: '',
  personal: '',
};

export function TalkingPointsModal({ song, onClose, adminPassword }: Props) {
  const [points, setPoints] = useState<TalkingPoints>(song.talkingPoints ?? EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<keyof TalkingPoints>('production');

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Sync if song changes
  useEffect(() => {
    setPoints(song.talkingPoints ?? EMPTY);
    setSaved(false);
  }, [song.id]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/talking-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-auth': adminPassword,
        },
        body: JSON.stringify({ id: song.id, talkingPoints: points }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        // Update the song object in place so the icon reflects saved state
        song.talkingPoints = { ...points };
      }
    } catch (e) {
      console.error('Failed to save talking points', e);
    } finally {
      setSaving(false);
    }
  }, [song, points, adminPassword]);

  const activeField = FIELDS.find(f => f.key === activeTab)!;
  const hasContent = Object.values(points).some(v => v.trim().length > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-2xl flex flex-col shadow-2xl"
           style={{ maxHeight: '85vh' }}>

        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-zinc-700 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {song.coverArtUrl && (
              <img src={song.coverArtUrl} alt={song.album}
                   className="w-10 h-10 rounded object-cover flex-shrink-0" />
            )}
            <div className="min-w-0">
              <h2 className="text-white font-semibold truncate">{song.name}</h2>
              <p className="text-zinc-400 text-sm truncate">
                {song.album} · Halo {song.haloNumber} · {song.releaseYear}
              </p>
            </div>
          </div>
          <button onClick={onClose}
                  className="text-zinc-400 hover:text-white flex-shrink-0 mt-0.5">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-700 overflow-x-auto">
          {FIELDS.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveTab(f.key)}
              className={`px-3 py-2.5 text-sm whitespace-nowrap flex items-center gap-1.5 border-b-2 transition-colors ${
                activeTab === f.key
                  ? 'border-red-500 text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
              {points[f.key]?.trim() && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <textarea
            value={points[activeTab]}
            onChange={e => setPoints(prev => ({ ...prev, [activeTab]: e.target.value }))}
            placeholder={
              activeTab === 'personal'
                ? 'Your personal notes, memories, or takes on this song...'
                : `${activeField.label} notes...`
            }
            className="w-full h-48 bg-zinc-800 text-zinc-100 border border-zinc-600 rounded-lg p-3 text-sm
                       resize-none focus:outline-none focus:border-zinc-400 placeholder-zinc-500 leading-relaxed"
          />
          {activeTab === 'personal' && (
            <p className="text-zinc-500 text-xs mt-1.5">
              This field is just for you — your personal take, memories, or anything you want to mention on stream.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-zinc-700 gap-3">
          <span className="text-zinc-500 text-xs">
            {hasContent ? 'Talking points saved to database' : 'No talking points yet'}
          </span>
          <div className="flex gap-2">
            <button onClick={onClose}
                    className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors">
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-50
                         text-white text-sm rounded-lg font-medium transition-colors"
            >
              {saving ? (
                <><Loader2 size={14} className="animate-spin" />Saving…</>
              ) : saved ? (
                <>✓ Saved</>
              ) : (
                <><Save size={14} />Save</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
