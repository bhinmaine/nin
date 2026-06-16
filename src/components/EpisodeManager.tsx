// src/components/EpisodeManager.tsx
import { useState, useEffect, useCallback } from 'react';
import { Youtube, Tv2, Save, Trash2, Plus, Loader2 } from 'lucide-react';
import type { Episode } from '../types';

interface Props {
  adminPassword: string;
}

export function EpisodeManager({ adminPassword }: Props) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, { youtubeUrl: string; twitchUrl: string }>>({});
  const [newEp, setNewEp] = useState({ episodeNumber: '', youtubeUrl: '', twitchUrl: '' });
  const [addingSaving, setAddingSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState<number | null>(null);

  const headers = { 'Content-Type': 'application/json', 'x-admin-auth': adminPassword };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/episodes', { headers: { 'x-admin-auth': adminPassword } });
      if (res.ok) {
        const data: Episode[] = await res.json();
        setEpisodes(data);
        const d: Record<number, { youtubeUrl: string; twitchUrl: string }> = {};
        data.forEach(e => { d[e.episodeNumber] = { youtubeUrl: e.youtubeUrl, twitchUrl: e.twitchUrl }; });
        setDrafts(d);
        // Default new episode number to max + 1
        if (data.length > 0) {
          const maxEp = Math.max(...data.map(e => e.episodeNumber));
          setNewEp(prev => ({ ...prev, episodeNumber: String(maxEp + 1) }));
        }
      }
    } finally {
      setLoading(false);
    }
  }, [adminPassword]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (episodeNumber: number) => {
    setSaving(episodeNumber);
    try {
      const draft = drafts[episodeNumber] ?? { youtubeUrl: '', twitchUrl: '' };
      const res = await fetch('/api/admin/episodes', {
        method: 'POST',
        headers,
        body: JSON.stringify({ episodeNumber, ...draft }),
      });
      if (res.ok) {
        setSavedFlash(episodeNumber);
        setTimeout(() => setSavedFlash(null), 2000);
        await load();
      }
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (episodeNumber: number) => {
    if (!confirm(`Delete episode ${episodeNumber}? This won't affect ranked songs.`)) return;
    setDeleting(episodeNumber);
    try {
      await fetch(`/api/admin/episodes?n=${episodeNumber}`, { method: 'DELETE', headers });
      await load();
    } finally {
      setDeleting(null);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const epNum = parseInt(newEp.episodeNumber);
    if (!epNum) return;
    setAddingSaving(true);
    try {
      const res = await fetch('/api/admin/episodes', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          episodeNumber: epNum,
          youtubeUrl: newEp.youtubeUrl.trim(),
          twitchUrl: newEp.twitchUrl.trim(),
        }),
      });
      if (res.ok) {
        setNewEp({ episodeNumber: String(epNum + 1), youtubeUrl: '', twitchUrl: '' });
        await load();
      }
    } finally {
      setAddingSaving(false);
    }
  };

  const setDraft = (epNum: number, field: 'youtubeUrl' | 'twitchUrl', value: string) => {
    setDrafts(prev => ({ ...prev, [epNum]: { ...(prev[epNum] ?? { youtubeUrl: '', twitchUrl: '' }), [field]: value } }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-zinc-400">
        <Loader2 size={20} className="animate-spin mr-2" /> Loading episodes…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Episode Links</h2>

      {/* Add new episode */}
      <form onSubmit={handleAdd} className="bg-zinc-800 border border-zinc-600 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
          <Plus size={14} /> Add Episode
        </h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-400">Episode #</label>
            <input
              type="number"
              min="1"
              value={newEp.episodeNumber}
              onChange={e => setNewEp(p => ({ ...p, episodeNumber: e.target.value }))}
              placeholder="1"
              className="w-24 px-3 py-1.5 bg-zinc-900 border border-zinc-600 rounded text-white text-sm focus:outline-none focus:border-zinc-400"
              required
            />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-48">
            <label className="text-xs text-zinc-400 flex items-center gap-1"><Youtube size={11} className="text-red-400" /> YouTube URL</label>
            <input
              type="url"
              value={newEp.youtubeUrl}
              onChange={e => setNewEp(p => ({ ...p, youtubeUrl: e.target.value }))}
              placeholder="https://youtube.com/watch?v=..."
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-600 rounded text-white text-sm focus:outline-none focus:border-zinc-400"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-48">
            <label className="text-xs text-zinc-400 flex items-center gap-1"><Tv2 size={11} className="text-purple-400" /> Twitch URL</label>
            <input
              type="url"
              value={newEp.twitchUrl}
              onChange={e => setNewEp(p => ({ ...p, twitchUrl: e.target.value }))}
              placeholder="https://twitch.tv/videos/..."
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-600 rounded text-white text-sm focus:outline-none focus:border-zinc-400"
            />
          </div>
          <button
            type="submit"
            disabled={addingSaving}
            className="flex items-center gap-2 px-4 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm rounded font-medium transition-colors"
          >
            {addingSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add
          </button>
        </div>
      </form>

      {/* Existing episodes */}
      {episodes.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-8">No episodes yet. Add one above.</p>
      ) : (
        <div className="space-y-2">
          {episodes.map(ep => {
            const draft = drafts[ep.episodeNumber] ?? { youtubeUrl: ep.youtubeUrl, twitchUrl: ep.twitchUrl };
            const isDirty = draft.youtubeUrl !== ep.youtubeUrl || draft.twitchUrl !== ep.twitchUrl;
            return (
              <div key={ep.episodeNumber} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="flex items-center">
                    <span className="text-red-500 font-bold font-mono w-16">Ep. {ep.episodeNumber}</span>
                  </div>
                  <div className="flex flex-col gap-1 flex-1 min-w-48">
                    <label className="text-xs text-zinc-400 flex items-center gap-1"><Youtube size={11} className="text-red-400" /> YouTube</label>
                    <input
                      type="url"
                      value={draft.youtubeUrl}
                      onChange={e => setDraft(ep.episodeNumber, 'youtubeUrl', e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="px-3 py-1.5 bg-zinc-900 border border-zinc-600 rounded text-white text-sm focus:outline-none focus:border-zinc-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1 flex-1 min-w-48">
                    <label className="text-xs text-zinc-400 flex items-center gap-1"><Tv2 size={11} className="text-purple-400" /> Twitch</label>
                    <input
                      type="url"
                      value={draft.twitchUrl}
                      onChange={e => setDraft(ep.episodeNumber, 'twitchUrl', e.target.value)}
                      placeholder="https://twitch.tv/videos/..."
                      className="px-3 py-1.5 bg-zinc-900 border border-zinc-600 rounded text-white text-sm focus:outline-none focus:border-zinc-400"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(ep.episodeNumber)}
                      disabled={saving === ep.episodeNumber || !isDirty}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded font-medium transition-colors ${
                        savedFlash === ep.episodeNumber
                          ? 'bg-green-600 text-white'
                          : isDirty
                          ? 'bg-red-600 hover:bg-red-500 text-white'
                          : 'bg-zinc-700 text-zinc-500 cursor-default'
                      } disabled:opacity-50`}
                    >
                      {saving === ep.episodeNumber ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : savedFlash === ep.episodeNumber ? (
                        '✓'
                      ) : (
                        <Save size={13} />
                      )}
                      {savedFlash === ep.episodeNumber ? 'Saved' : 'Save'}
                    </button>
                    <button
                      onClick={() => handleDelete(ep.episodeNumber)}
                      disabled={deleting === ep.episodeNumber}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded text-zinc-400 hover:text-red-400 hover:bg-zinc-700 transition-colors disabled:opacity-50"
                    >
                      {deleting === ep.episodeNumber ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
