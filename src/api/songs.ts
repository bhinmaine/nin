// This would connect to your Vercel KV backend
// For now, this is a placeholder for the API layer

export async function fetchSongs() {
  const res = await fetch('/api/songs');
  if (!res.ok) throw new Error('Failed to fetch songs');
  return res.json();
}

export async function saveSongs(data: any) {
  const res = await fetch('/api/songs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to save songs');
  return res.json();
}
