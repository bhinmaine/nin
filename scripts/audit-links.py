import json, re

with open('scripts/seed-songs.ts') as f:\n    content = f.read()\n\npattern = r"\{ id: '(nin-[^']+)', name: '([^']+)'"
songs = re.findall(pattern, content)
id_to_name = {s[0]: s[1] for s in songs}
print(f'Total songs in seed: {len(id_to_name)}')

data = json.load(open('data/song-links.json'))
print(f'Song IDs with links: {len(data)}')
print()
print('Songs with links (actual names):')
for k in sorted(data.keys()):
    name = id_to_name.get(k, 'UNKNOWN')
    v = data[k]
    yt = v.get('youtubeUrl', '')
    am = v.get('appleMusicUrl', '')
    yt_status = 'YT:OK' if yt else 'YT:MISS'
    am_status = 'AM:OK' if am else 'AM:MISS'
    print(f'  {k} | {name} | {yt_status} | {am_status}')
    if yt:
        print(f'    YT: {yt}')
    if am:
        print(f'    AM: {am}')
