import json, re

data = json.load(open('data/song-links.json'))
seed = open('scripts/seed-songs.ts').read()

def get_song(sid):
    m = re.search(r"id: '" + re.escape(sid) + r"', name: '([^']+)', album: '([^']+)', releaseYear: \d+, haloNumber: (\d+)", seed)
    if m:\n        return m.group(1), m.group(2), int(m.group(3))\n    return sid, '', 0\n\ndef search_url(name):
    q = "Nine Inch Nails " + name
    enc = q.replace(' ', '+').replace('(', '%28').replace(')', '%29').replace("'", '%27')
    return "https://www.youtube.com/results?search_query=" + enc

OFFICIAL = {
    'nin-8-05':  'o8F_KaILW6g',
    'nin-17-12': 'o8F_KaILW6g',
    'nin-19-08': 'wwvLlEtxX3o',
    'nin-20-01': 'wwvLlEtxX3o',
    'nin-23-01': 'qSsRt_1l740',
    'nin-23-02': 'qSsRt_1l740',
    'nin-28-03': 'TgwrxcO48N8',
    'nin-29-03': 'cvyywDE67tY',
    'nin-31-01': 'gDV-dOvqKzQ',
    'nin-31-03': '_g8nAqDu3gI',
    'nin-32-04': 'eeJ_DzRJUI4',
    'nin-35-01': 'SnMyroAH0rg',
    'nin-38-12': 'SnMyroAH0rg',
}

TRON = {
    'Init':                          'f9D8gHY2OPE',
    'Forked Reality':                'DmZFlt8J3hk',
    'As Alive as You Need Me to Be': 'SnMyroAH0rg',
    'Echoes':                        'kZ0cqf8xnGA',
    'This Changes Everything':       'FVZRhy_feno',
    'In the Image Of':               'HaduUOPLRHE',
    'I Know You Can Feel It':        '8rebzJGhnog',
    'Permanence':                    '5n6OQkCyYgU',
    'Infiltrator':                   'ysMcbw35-s8',
    '100% Expendable':               'gU0cjp7chKs',
    'Still Remains':                 'kLHgojefHjU',
    'Who Wants to Live Forever?':    'ExIp--YRB9E',
    'Building Better Worlds':        'jB80bqs81YQ',
    'Target Identified':             'ZZ9Ecb0skIE',
    'Daemonize':                     'XRVQKihyACM',
    'Empathetic Response':           'seg00cjjYsQ',
    'What Have You Done?':           'uNNGwyq0OYw',
    'A Question of Trust':           'FBcz9VrA4zg',
    'Ghost in the Machine':          'ZLfFi7YA0Ms',
    'No Going Back':                 'wA2Kh-2XQF0',
    'Nemesis':                       'JwqPZxzPEfs',
    'New Directive':                 'NWmlEbRaUao',
    'Out in the World':              'd889j0UTkak',
    'Shadow over Me':                '_XGN5WtacjY',
}

# Auto-populate Tron Ares songs (halos 35/36/37)
for sid in list(data.keys()):
    name, album, halo = get_song(sid)
    if halo in (35, 36, 37) and name in TRON:
        OFFICIAL[sid] = TRON[name]

changed_official = []
changed_search = []

for sid, entry in data.items():
    if 'youtubeUrl' not in entry:
        continue
    current = entry['youtubeUrl']
    if 'youtube.com/results' in current:
        continue
    name, album, halo = get_song(sid)
    if sid in OFFICIAL:
        new_url = "https://www.youtube.com/watch?v=" + OFFICIAL[sid]
        if current != new_url:
            changed_official.append((sid, name, current, new_url))
            entry['youtubeUrl'] = new_url
    else:
        new_url = search_url(name)
        changed_search.append((sid, name, current, new_url))
        entry['youtubeUrl'] = new_url

print("Official video fixes (%d):" % len(changed_official))
for sid, name, old, new in changed_official:
    print("  [%s] %s" % (sid, name))
    print("    %s" % old)
    print("    -> %s" % new)

print()
print("Replaced with search URLs (%d):" % len(changed_search))
for sid, name, old, new in changed_search:
    print("  [%s] %s -> %s" % (sid, name, new))

with open('data/song-links.json', 'w') as f:\n    json.dump(data, f, indent=2)\n\nprint()\nprint("Done. %d official, %d search URLs." % (len(changed_official), len(changed_search)))
