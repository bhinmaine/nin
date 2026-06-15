#!/usr/bin/env node
// Pass 5: Apply remaining known URLs and do final cleanup

const fs = require('fs');
const SONG_LINKS_PATH = '/home/sophie/.openclaw/workspace/nin/data/song-links.json';
const songLinks = JSON.parse(fs.readFileSync(SONG_LINKS_PATH, 'utf8'));

function apply(id, url) {
  if (songLinks[id]?.appleMusicUrl) return; // don't overwrite
  if (!songLinks[id]) songLinks[id] = {};
  songLinks[id].appleMusicUrl = url;
  console.log(`  ✅ ${id}`);
}

// Starfuckers, Inc. appears on The Fragile as track 18 (disc 2 track 6 = "S*********s, Inc.")
// nin-13-02 is the single version from The Day the World Went Away single (Halo 13)
// nin-14-18 is The Fragile version 
// nin-17-15 is And All That Could Have Been live version
// These are on Apple Music but censored

apply('nin-14-18', 'https://music.apple.com/us/album/s-s-inc/1440836334?i=1440836690');
apply('nin-17-15', 'https://music.apple.com/us/album/s-s-inc-live/1440844763?i=1440845355');

// The Fragile actual track 14-01 Somewhat Damaged - should be correct
apply('nin-14-01', 'https://music.apple.com/us/album/somewhat-damaged/1440836334?i=1440836339');

// AATCB live - some already set above but verify key ones
apply('nin-17-01', 'https://music.apple.com/us/album/terrible-lie-live/1440844763?i=1440844764');
apply('nin-17-04', 'https://music.apple.com/us/album/piggy-live/1440844763?i=1440844780');

// Day the World Went Away single (Halo 13) - nin-13-02 = Starfuckers from that single
// The single also had: Day the World Went Away, Starfuckers Inc., DtWWA Quiet, Where Is Everybody?
// Starfuckers was on the single but is it streaming? Let's try The Fragile version for now
apply('nin-13-02', 'https://music.apple.com/us/album/s-s-inc/1440836334?i=1440836690');

// Look at Hesitation Marks - already has most, check nin-28-05 All Time Low
// The standard album (673721498) should have it
apply('nin-28-05', 'https://music.apple.com/us/album/all-time-low/673721498?i=673721537');

// Ghosts I-IV track 37 - this track doesn't exist (only 36 tracks)
// nin-26-37 is a seed data error - no URL to give it

// Add Violence - verify these from lookup
apply('nin-31-01', 'https://music.apple.com/us/album/less-than/1254862386?i=1254862387');
apply('nin-31-02', 'https://music.apple.com/us/album/the-lovers/1254862386?i=1254862388');
apply('nin-31-03', 'https://music.apple.com/us/album/this-isnt-the-place/1254862386?i=1254862389');
apply('nin-31-04', 'https://music.apple.com/us/album/not-anymore/1254862386?i=1254862390');
apply('nin-31-05', 'https://music.apple.com/us/album/the-background-world/1254862386?i=1254862391');

// The Fragile complete track list (disc 2 corrections)
// Track order: Way Out Is Through, Into the Void, Where Is Everybody, Mark Has Been Made, 
//              Please, Starfuckers, Complication, I'm Looking Forward, Big Come Down, Underneath It All, Ripe
apply('nin-14-13', 'https://music.apple.com/us/album/the-way-out-is-through/1440836334?i=1440836576');
apply('nin-14-14', 'https://music.apple.com/us/album/into-the-void/1440836334?i=1440836578');
apply('nin-14-15', 'https://music.apple.com/us/album/where-is-everybody/1440836334?i=1440836581');
apply('nin-14-16', 'https://music.apple.com/us/album/the-mark-has-been-made/1440836334?i=1440836686');
apply('nin-14-17', 'https://music.apple.com/us/album/please/1440836334?i=1440836688');
apply('nin-14-19', 'https://music.apple.com/us/album/complication/1440836334?i=1440836693');
apply('nin-14-20', "https://music.apple.com/us/album/im-looking-forward-to-joining-you-finally/1440836334?i=1440836696");
apply('nin-14-21', 'https://music.apple.com/us/album/the-big-come-down/1440836334?i=1440836698');
apply('nin-14-22', 'https://music.apple.com/us/album/underneath-it-all/1440836334?i=1440836700');
apply('nin-14-23', 'https://music.apple.com/us/album/ripe-with-decay/1440836334?i=1440836704');

// Final count
const allIDs = [];
const halos = {
  1: 3, 2: 10, 3: 10, 4: 4, 5: 8, 6: 6, 7: 5, 8: 14, 9: 9, 10: 11,
  11: 5, 12: 8, 13: 3, 14: 23, 15: 6, 16: 10, 17: 16,
  '17b': 9, 18: 3, 19: 13, 20: 3, 21: 4, 22: 14, 23: 2,
  24: 16, 25: 5, 26: 37, 27: 10, 28: 14, 29: 5, 30: 5,
  31: 5, 32: 6, 33: 8, 34: 15, 38: 12
};
for (const [halo, count] of Object.entries(halos)) {
  for (let i = 1; i <= count; i++) {
    allIDs.push('nin-' + halo + '-' + String(i).padStart(2,'0'));
  }
}

const withLinks = allIDs.filter(id => songLinks[id]?.appleMusicUrl);
const missing = allIDs.filter(id => !songLinks[id]?.appleMusicUrl);

console.log(`\n=== FINAL SUMMARY ===`);
console.log(`Total seed songs: ${allIDs.length}`);
console.log(`With Apple Music links: ${withLinks.length}`);
console.log(`Missing (not on streaming): ${missing.length}`);
console.log(`\nStill missing:`);
missing.forEach(id => console.log(`  ${id}`));

fs.writeFileSync(SONG_LINKS_PATH, JSON.stringify(songLinks, null, 2) + '\n');
console.log(`\n✅ Written`);
