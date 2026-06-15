#!/usr/bin/env node
// Pass 4: Apply all known correct URLs from album lookups
// This is a direct data application, no more API calls needed

const fs = require('fs');
const path = require('path');

const SONG_LINKS_PATH = path.join(__dirname, '../data/song-links.json');

const songLinks = JSON.parse(fs.readFileSync(SONG_LINKS_PATH, 'utf8'));

function setLink(id, url) {
  if (!url) return false;
  if (!songLinks[id]) songLinks[id] = {};
  songLinks[id].appleMusicUrl = url;
  return true;
}

let applied = 0;
let alreadyHad = 0;
let total = 0;

function apply(id, url) {
  total++;
  if (songLinks[id]?.appleMusicUrl) { alreadyHad++; return; }
  if (setLink(id, url)) applied++;
}

// ============================================================
// Fix nin-15-05 Complications of the Flesh 
// Was wrongly mapped to "Complication" from The Fragile
// The song is on "We're in This Together" single - not streaming
// ============================================================
// Remove the wrong match
if (songLinks['nin-15-05']?.appleMusicUrl) {
  delete songLinks['nin-15-05'].appleMusicUrl;
  if (Object.keys(songLinks['nin-15-05']).length === 0) delete songLinks['nin-15-05'];
  console.log('Removed bad match: nin-15-05 (Complications of the Flesh → was Complication)');
}

// ============================================================
// Still (album ID: 1455396285)
// ============================================================
apply('nin-17b-01', 'https://music.apple.com/us/album/something-i-can-never-have/1455396285?i=1455396287');
apply('nin-17b-02', 'https://music.apple.com/us/album/adrift-at-peace/1455396285?i=1455396288');
apply('nin-17b-03', 'https://music.apple.com/us/album/the-fragile/1455396285?i=1455396289');
apply('nin-17b-04', 'https://music.apple.com/us/album/the-becoming/1455396285?i=1455396290');
apply('nin-17b-05', 'https://music.apple.com/us/album/gone-still/1455396285?i=1455396291');
apply('nin-17b-06', 'https://music.apple.com/us/album/the-day-the-world-went-away/1455396285?i=1455396445');
apply('nin-17b-07', 'https://music.apple.com/us/album/and-all-that-could-have-been/1455396285?i=1455396446');
apply('nin-17b-08', 'https://music.apple.com/us/album/the-persistence-of-loss/1455396285?i=1455396446');
apply('nin-17b-09', 'https://music.apple.com/us/album/leaving-hope/1455396285?i=1455396447');

// ============================================================
// Live: And All That Could Have Been (album ID: 1440844763)
// ============================================================
apply('nin-17-01', 'https://music.apple.com/us/album/terrible-lie-live/1440844763?i=1440844764');
apply('nin-17-02', 'https://music.apple.com/us/album/sin-live/1440844763?i=1440844777');
apply('nin-17-03', 'https://music.apple.com/us/album/march-of-the-pigs-live/1440844763?i=1440844778');
apply('nin-17-04', 'https://music.apple.com/us/album/piggy-live/1440844763?i=1440844780');
apply('nin-17-05', 'https://music.apple.com/us/album/the-frail-live/1440844763?i=1440845204');
apply('nin-17-06', 'https://music.apple.com/us/album/the-wretched-live/1440844763?i=1440845206');
apply('nin-17-07', 'https://music.apple.com/us/album/gave-up-live/1440844763?i=1440845208');
apply('nin-17-08', 'https://music.apple.com/us/album/the-great-below-live/1440844763?i=1440845211');
apply('nin-17-09', 'https://music.apple.com/us/album/the-mark-has-been-made-live/1440844763?i=1440845220');
apply('nin-17-10', 'https://music.apple.com/us/album/wish-live/1440844763?i=1440845221');
apply('nin-17-11', 'https://music.apple.com/us/album/suck-live/1440844763?i=1440845223');
apply('nin-17-12', 'https://music.apple.com/us/album/closer-live/1440844763?i=1440845226');
apply('nin-17-13', 'https://music.apple.com/us/album/head-like-a-hole-live/1440844763?i=1440845228');
apply('nin-17-14', 'https://music.apple.com/us/album/the-day-the-world-went-away-live/1440844763?i=1440845354');
apply('nin-17-15', 'https://music.apple.com/us/album/s-s-inc-live/1440844763?i=1440845355');
apply('nin-17-16', 'https://music.apple.com/us/album/hurt-live/1440844763?i=1440845360');

// ============================================================
// Things Falling Apart (album ID: 1443503086)
// ============================================================
apply('nin-16-01', 'https://music.apple.com/us/album/slipping-away-remix/1443503086?i=1443503339');
apply('nin-16-02', 'https://music.apple.com/us/album/the-great-collapse-remix/1443503086?i=1443503462');
apply('nin-16-03', 'https://music.apple.com/us/album/the-wretched-remix/1443503086?i=1443503598');
apply('nin-16-04', 'https://music.apple.com/us/album/s-s-inc-remix-version-as/1443503086?i=1443503605');
apply('nin-16-05', 'https://music.apple.com/us/album/the-frail-remix/1443503086?i=1443503619');
apply('nin-16-06', 'https://music.apple.com/us/album/s-s-inc-remix-version-do/1443503086?i=1443503874');
apply('nin-16-07', 'https://music.apple.com/us/album/where-is-everybody-remix/1443503086?i=1443503881');
apply('nin-16-08', 'https://music.apple.com/us/album/metal-remix/1443503086?i=1443504019');
apply('nin-16-09', 'https://music.apple.com/us/album/10-miles-high-remix/1443503086?i=1443504026');
apply('nin-16-10', 'https://music.apple.com/us/album/s-s-inc-remix-version-cc/1443503086?i=1443504039');

// ============================================================
// The Fragile (album ID: 1440836334) - fix remaining
// ============================================================
apply('nin-14-01', 'https://music.apple.com/us/album/somewhat-damaged/1440836334?i=1440836339');
apply('nin-14-02', 'https://music.apple.com/us/album/the-day-the-world-went-away/1440836334?i=1440836343');
apply('nin-14-04', 'https://music.apple.com/us/album/the-wretched/1440836334?i=1440836348');
apply('nin-14-11', 'https://music.apple.com/us/album/la-mer/1440836334?i=1440836572');
apply('nin-14-12', 'https://music.apple.com/us/album/the-great-below/1440836334?i=1440836574');
apply('nin-14-13', 'https://music.apple.com/us/album/the-way-out-is-through/1440836334?i=1440836576');
apply('nin-14-15', 'https://music.apple.com/us/album/where-is-everybody/1440836334?i=1440836581');
apply('nin-14-16', 'https://music.apple.com/us/album/the-mark-has-been-made/1440836334?i=1440836686');
apply('nin-14-18', 'https://music.apple.com/us/album/s-s-inc/1440836334?i=1440836690');
apply('nin-14-19', 'https://music.apple.com/us/album/complication/1440836334?i=1440836693');
apply('nin-14-20', 'https://music.apple.com/us/album/im-looking-forward-to-joining-you-finally/1440836334?i=1440836696');
apply('nin-14-21', 'https://music.apple.com/us/album/the-big-come-down/1440836334?i=1440836698');
apply('nin-14-22', 'https://music.apple.com/us/album/underneath-it-all/1440836334?i=1440836700');

// ============================================================
// Not the Actual Events (album ID: 1847482288)
// ============================================================
apply('nin-29-01', 'https://music.apple.com/us/album/branches-bones/1847482288?i=1847482291');
apply('nin-29-02', 'https://music.apple.com/us/album/dear-world/1847482288?i=1847482292');
apply('nin-29-03', 'https://music.apple.com/us/album/shes-gone-away/1847482288?i=1847482293');
apply('nin-29-04', 'https://music.apple.com/us/album/the-idea-of-you/1847482288?i=1847482294');
apply('nin-29-05', 'https://music.apple.com/us/album/burning-bright-field-on-fire/1847482288?i=1847482295');

// ============================================================
// The Downward Spiral (album ID: 1440837096) - apply correct URLs
// ============================================================
apply('nin-8-06', 'https://music.apple.com/us/album/ruiner/1440837096?i=1440837536');
apply('nin-8-07', 'https://music.apple.com/us/album/the-becoming/1440837096?i=1440837813');
apply('nin-8-08', 'https://music.apple.com/us/album/i-do-not-want-this/1440837096?i=1440837815');
apply('nin-8-09', 'https://music.apple.com/us/album/big-man-with-a-gun/1440837096?i=1440837817');
apply('nin-8-10', 'https://music.apple.com/us/album/a-warm-place/1440837096?i=1440837820');
apply('nin-8-13', 'https://music.apple.com/us/album/the-downward-spiral/1440837096?i=1440838109');

// ============================================================
// Further Down the Spiral (album ID: 1545212135)
// ============================================================
apply('nin-10-04', 'https://music.apple.com/us/album/the-downward-spiral-the-bottom/1545212135?i=1545212142');
apply('nin-10-05', 'https://music.apple.com/us/album/hurt-quiet/1545212135?i=1545212143');

// ============================================================
// Pretty Hate Machine - remastered (1440940694) has more tracks
// ============================================================
apply('nin-2-05', 'https://music.apple.com/us/album/something-i-can-never-have/1440940694?i=1440941071');
apply('nin-2-09', 'https://music.apple.com/us/album/the-only-time/1440940694?i=1440941373');

// ============================================================
// Hesitation Marks (album ID: 673721498 or 655150306 deluxe)
// From the deluxe: All Time Low is track 5
// ============================================================
apply('nin-28-05', 'https://music.apple.com/us/album/all-time-low/673721498?i=673721536');

// ============================================================
// Head Like a Hole EP (1443892991) - Halo 3 tracks
// ============================================================
apply('nin-3-04', 'https://music.apple.com/us/album/head-like-a-hole-copper/1443892991?i=1443892997');
apply('nin-3-06', 'https://music.apple.com/us/album/head-like-a-hole-soil/1443892991?i=1443892999');

// ============================================================
// Down in It single (1443644320) - Halo 1 tracks
// ============================================================
apply('nin-1-01', 'https://music.apple.com/us/album/down-in-it-skin/1443644320?i=1443644321');
apply('nin-1-02', 'https://music.apple.com/us/album/down-in-it-shred/1443644320?i=1443644322');
apply('nin-1-03', 'https://music.apple.com/us/album/down-in-it-singe/1443644320?i=1443644323');

// ============================================================
// Halo 3 - Head Like a Hole EP (1443892991)
// Tracks: 1=Slate, 2=Clay, 3=Sympathetic Mix(Terrible Lie), 4=Copper, 5=You Know Who You Are, 
//         6=Soil, 7=Empathetic Mix(Terrible Lie), 8=Shred, 9=Singe, 10=Demo
// ============================================================
apply('nin-3-08', 'https://music.apple.com/us/album/down-in-it-shred/1443892991?i=1443893002');
apply('nin-3-09', 'https://music.apple.com/us/album/down-in-it-singe/1443892991?i=1443893003');
apply('nin-3-10', 'https://music.apple.com/us/album/down-in-it-demo/1443892991?i=1443893004');

// ============================================================
// Fix nin-17-09 Mark Has Been Made - was coming from The Fragile
// The AATCB live version URL
// ============================================================
// Already applied above via the AATCB album

// ============================================================
// Apply known Hesitation Marks full album URLs 
// ============================================================
apply('nin-28-01', 'https://music.apple.com/us/album/the-eater-of-dreams/673721498?i=673721529');
apply('nin-28-02', 'https://music.apple.com/us/album/copy-of-a/673721498?i=673721530');
apply('nin-28-03', 'https://music.apple.com/us/album/came-back-haunted/673721498?i=673721535');
apply('nin-28-04', 'https://music.apple.com/us/album/find-my-way/673721498?i=673721536');
apply('nin-28-06', 'https://music.apple.com/us/album/disappointed/673721498?i=673721538');
apply('nin-28-07', 'https://music.apple.com/us/album/everything/673721498?i=673721540');
apply('nin-28-08', 'https://music.apple.com/us/album/satellite/673721498?i=673721541');
apply('nin-28-09', 'https://music.apple.com/us/album/various-methods-of-escape/673721498?i=673721543');
apply('nin-28-10', 'https://music.apple.com/us/album/running/673721498?i=673721545');
apply('nin-28-11', 'https://music.apple.com/us/album/i-would-for-you/673721498?i=673721547');
apply('nin-28-12', 'https://music.apple.com/us/album/in-two/673721498?i=673721548');
apply('nin-28-13', 'https://music.apple.com/us/album/while-im-still-here/673721498?i=673721549');
apply('nin-28-14', 'https://music.apple.com/us/album/black-noise/673721498?i=673721551');

// ============================================================
// Add Violence (album ID: 1254862386) - from existing data we know IDs
// ============================================================
apply('nin-31-01', 'https://music.apple.com/us/album/less-than/1254862386?i=1254862387');
apply('nin-31-02', 'https://music.apple.com/us/album/the-lovers/1254862386?i=1254862388');
apply('nin-31-03', 'https://music.apple.com/us/album/this-isnt-the-place/1254862386?i=1254862389');
apply('nin-31-04', 'https://music.apple.com/us/album/not-anymore/1254862386?i=1254862390');
apply('nin-31-05', 'https://music.apple.com/us/album/the-background-world/1254862386?i=1254862391');

// Bad Witch (album ID: 1847482590) - track order from iTunes
apply('nin-32-01', 'https://music.apple.com/us/album/shit-mirror/1847482590?i=1847482591');
apply('nin-32-02', 'https://music.apple.com/us/album/ahead-of-ourselves/1847482590?i=1847482592');
apply('nin-32-03', 'https://music.apple.com/us/album/play-the-goddamned-part/1847482590?i=1847482593');
// nin-32-04 (God Break Down the Door) already has link
apply('nin-32-05', 'https://music.apple.com/us/album/im-not-from-this-world/1847482590?i=1847482595');
apply('nin-32-06', 'https://music.apple.com/us/album/over-and-out/1847482590?i=1847482597');

// ============================================================
// The Slip (album ID: 285284658)
// ============================================================
apply('nin-27-01', 'https://music.apple.com/us/album/999999/285284658?i=285284711');
apply('nin-27-02', 'https://music.apple.com/us/album/1000000/285284658?i=285284713');
apply('nin-27-03', 'https://music.apple.com/us/album/letting-you/285284658?i=285284714');
apply('nin-27-04', 'https://music.apple.com/us/album/discipline/285284658?i=285284715');
apply('nin-27-05', 'https://music.apple.com/us/album/echoplex/285284658?i=285284718');
apply('nin-27-06', 'https://music.apple.com/us/album/head-down/285284658?i=285284720');
apply('nin-27-07', 'https://music.apple.com/us/album/lights-in-the-sky/285284658?i=285284730');
apply('nin-27-08', 'https://music.apple.com/us/album/corona-radiata/285284658?i=285284773');
apply('nin-27-09', 'https://music.apple.com/us/album/the-four-of-us-are-dying/285284658?i=285284784');
apply('nin-27-10', 'https://music.apple.com/us/album/demon-seed/285284658?i=285284785');

// ============================================================
// TRON: Ares soundtrack (album ID: 1826198222) - NIN tracks
// ============================================================
apply('nin-38-12', 'https://music.apple.com/us/album/as-alive-as-you-need-me-to-be/1826198222?i=1826198452');

// ============================================================
// Report final state
// ============================================================
console.log(`Applied: ${applied} new URLs`);
console.log(`Already had: ${alreadyHad}`);

// Count current state
const NIN_IDS = [
  ...Array.from({length:3}, (_,i) => `nin-1-0${i+1}`),
  ...Array.from({length:10}, (_,i) => `nin-2-0${i+1}`),
  ...Array.from({length:10}, (_,i) => `nin-3-0${i+1}`),
  ...Array.from({length:4}, (_,i) => `nin-4-0${i+1}`),
  ...Array.from({length:8}, (_,i) => `nin-5-0${i+1}`),
  ...Array.from({length:6}, (_,i) => `nin-6-0${i+1}`),
  ...Array.from({length:5}, (_,i) => `nin-7-0${i+1}`),
  ...Array.from({length:14}, (_,i) => `nin-8-0${i < 9 ? '0'+(i+1) : (i+1)}`).map((id,i) => `nin-8-${String(i+1).padStart(2,'0')}`),
  ...Array.from({length:9}, (_,i) => `nin-9-0${i+1}`),
  ...Array.from({length:11}, (_,i) => `nin-10-${String(i+1).padStart(2,'0')}`),
  ...Array.from({length:5}, (_,i) => `nin-11-0${i+1}`),
  ...Array.from({length:8}, (_,i) => `nin-12-0${i+1}`),
  ...Array.from({length:4}, (_,i) => `nin-13-0${i+1}`),  // actually 3 from seed
  ...Array.from({length:23}, (_,i) => `nin-14-${String(i+1).padStart(2,'0')}`),
  ...Array.from({length:6}, (_,i) => `nin-15-0${i+1}`),
  ...Array.from({length:10}, (_,i) => `nin-16-${String(i+1).padStart(2,'0')}`),
  ...Array.from({length:16}, (_,i) => `nin-17-${String(i+1).padStart(2,'0')}`),
  ...Array.from({length:9}, (_,i) => `nin-17b-0${i+1}`),
  ...Array.from({length:3}, (_,i) => `nin-18-0${i+1}`),
  ...Array.from({length:13}, (_,i) => `nin-19-${String(i+1).padStart(2,'0')}`),
  ...Array.from({length:3}, (_,i) => `nin-20-0${i+1}`),
  ...Array.from({length:4}, (_,i) => `nin-21-0${i+1}`),
  ...Array.from({length:14}, (_,i) => `nin-22-${String(i+1).padStart(2,'0')}`),
  ...Array.from({length:2}, (_,i) => `nin-23-0${i+1}`),
  ...Array.from({length:16}, (_,i) => `nin-24-${String(i+1).padStart(2,'0')}`),
  ...Array.from({length:5}, (_,i) => `nin-25-0${i+1}`),
  ...Array.from({length:37}, (_,i) => `nin-26-${String(i+1).padStart(2,'0')}`),
  ...Array.from({length:10}, (_,i) => `nin-27-0${i < 9 ? '0'+(i+1) : (i+1)}`).map((_,i) => `nin-27-${String(i+1).padStart(2,'0')}`),
  ...Array.from({length:14}, (_,i) => `nin-28-${String(i+1).padStart(2,'0')}`),
  ...Array.from({length:5}, (_,i) => `nin-29-0${i+1}`),
  ...Array.from({length:5}, (_,i) => `nin-30-0${i+1}`),
  ...Array.from({length:5}, (_,i) => `nin-31-0${i+1}`),
  ...Array.from({length:6}, (_,i) => `nin-32-0${i+1}`),
  ...Array.from({length:8}, (_,i) => `nin-33-0${i+1}`),
  ...Array.from({length:15}, (_,i) => `nin-34-${String(i+1).padStart(2,'0')}`),
  ...Array.from({length:12}, (_,i) => `nin-38-${String(i+1).padStart(2,'0')}`),
];

const withLinks = NIN_IDS.filter(id => songLinks[id]?.appleMusicUrl);
const withoutLinks = NIN_IDS.filter(id => !songLinks[id]?.appleMusicUrl);

console.log(`\n=== FINAL STATE ===`);
console.log(`Total seed IDs tracked: ${NIN_IDS.length}`);
console.log(`With Apple Music link: ${withLinks.length}`);
console.log(`Without Apple Music link: ${withoutLinks.length}`);
console.log(`\nMissing:`);
withoutLinks.forEach(id => console.log(`  ${id}`));

fs.writeFileSync(SONG_LINKS_PATH, JSON.stringify(songLinks, null, 2) + '\n');
console.log(`\n✅ Written to ${SONG_LINKS_PATH}`);
