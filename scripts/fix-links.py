import json

data = json.load(open('data/song-links.json'))

# Closure VHS — not on Apple Music, remove broken links
for sid in ['nin-12-02', 'nin-12-03', 'nin-12-04', 'nin-12-07']:
    if sid in data and 'appleMusicUrl' in data[sid]:
        del data[sid]['appleMusicUrl']
    if sid in data and not data[sid]:
        del data[sid]

# Survivalism_Tardusted — B-side remix not on Apple Music
if 'nin-23-02' in data and 'appleMusicUrl' in data['nin-23-02']:
    del data['nin-23-02']['appleMusicUrl']
if 'nin-23-02' in data and not data['nin-23-02']:
    del data['nin-23-02']

# Hesitation Marks — correct track IDs (album 655150305)
data['nin-28-03']['appleMusicUrl'] = 'https://music.apple.com/us/album/came-back-haunted/655150305?i=655150546&uo=4'
data['nin-28-05']['appleMusicUrl'] = 'https://music.apple.com/us/album/all-time-low/655150305?i=655150852&uo=4'

# Add Violence EP — moved to new album ID 1847481807
data['nin-31-01']['appleMusicUrl'] = 'https://music.apple.com/us/album/less-than/1847481807?i=1847481808&uo=4'
data['nin-31-03']['appleMusicUrl'] = 'https://music.apple.com/us/album/this-isnt-the-place/1847481807?i=1847481813&uo=4'

# As Alive as You Need Me to Be EP — correct album (Tron Ares OST, 1826198222)
data['nin-35-01']['appleMusicUrl'] = 'https://music.apple.com/us/album/as-alive-as-you-need-me-to-be/1826198222?i=1826198226&uo=4'
data['nin-35-02']['appleMusicUrl'] = 'https://music.apple.com/us/album/empathetic-response/1826198222?i=1826198696&uo=4'

with open('data/song-links.json', 'w') as fout:
    json.dump(data, fout, indent=2)

print("Done. Verifying fixes:")
for sid in ['nin-12-02','nin-12-03','nin-12-04','nin-12-07','nin-23-02','nin-28-03','nin-28-05','nin-31-01','nin-31-03','nin-35-01','nin-35-02']:
    print(f"  {sid}: {data.get(sid, '(entry removed - no links)')}")
