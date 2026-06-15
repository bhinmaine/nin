#!/usr/bin/env node
// check-links.mjs — Check all YouTube and Apple Music URLs in song-links.json
// Reports broken (non-2xx/3xx), wrong redirects, and suspicious patterns
// Usage: node scripts/check-links.mjs [--concurrency 10]

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const linksPath = path.join(__dirname, '../data/song-links.json');
const data = JSON.parse(readFileSync(linksPath, 'utf8'));

const CONCURRENCY = parseInt(process.argv[2] || '8');
const TIMEOUT_MS = 12000;

// Collect all links to check
const toCheck = [];
for (const [id, { appleMusicUrl, youtubeUrl }] of Object.entries(data)) {
  if (appleMusicUrl) toCheck.push({ id, type: 'apple', url: appleMusicUrl });
  if (youtubeUrl)    toCheck.push({ id, type: 'youtube', url: youtubeUrl });
}

console.log(`Checking ${toCheck.length} links (${CONCURRENCY} concurrent)...\n`);

const results = { broken: [], suspicious: [], ok: 0, errors: [] };

async function checkUrl({ id, type, url }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; link-checker/1.0)',
      },
    });
    clearTimeout(timer);

    const finalUrl = res.url;
    const status = res.status;

    // YouTube: redirects to youtube.com/watch?v=... but 404 page returns 200
    // Check if it redirected to an error page
    if (type === 'youtube') {
      if (status === 404) {
        results.broken.push({ id, type, url, status, note: 'YouTube 404' });
        return;
      }
      // YouTube returns 200 even for deleted videos but URL changes
      // e.g. redirects to youtube.com/watch?v=... vs /error
      if (finalUrl.includes('youtube.com/watch') && !finalUrl.includes('v=')) {
        results.suspicious.push({ id, type, url, status, finalUrl, note: 'YouTube redirect missing video ID' });
        return;
      }
      // Check if redirected away from original video
      const origV = new URL(url).searchParams.get('v');
      const finalV = finalUrl.includes('?') ? new URL(finalUrl).searchParams.get('v') : null;
      if (origV && finalV && origV !== finalV) {
        results.suspicious.push({ id, type, url, status, finalUrl, note: `YouTube video ID changed: ${origV} → ${finalV}` });
        return;
      }
      // Unavailable video pages still return 200; check for redirect to homepage
      if (finalUrl === 'https://www.youtube.com/' || finalUrl === 'https://youtube.com/') {
        results.broken.push({ id, type, url, status, finalUrl, note: 'YouTube redirected to homepage (deleted/unavailable)' });
        return;
      }
    }

    // Apple Music: check for redirect to wrong album
    if (type === 'apple') {
      if (status === 404) {
        results.broken.push({ id, type, url, status, note: 'Apple Music 404' });
        return;
      }
      if (status >= 400) {
        results.broken.push({ id, type, url, status, note: `HTTP ${status}` });
        return;
      }
      // Apple Music redirects within music.apple.com are usually album/song pivots
      // If final URL is totally different album, flag it
      const origAlbumMatch = url.match(/\/album\/[^/]+\/(\d+)/);
      const finalAlbumMatch = finalUrl.match(/\/album\/[^/]+\/(\d+)/);
      if (origAlbumMatch && finalAlbumMatch && origAlbumMatch[1] !== finalAlbumMatch[1]) {
        results.suspicious.push({ id, type, url, status, finalUrl, note: `Apple Music album ID changed: ${origAlbumMatch[1]} → ${finalAlbumMatch[1]}` });
        return;
      }
    }

    if (status >= 400) {
      results.broken.push({ id, type, url, status, note: `HTTP ${status}` });
    } else {
      results.ok++;
    }
  } catch (e) {
    clearTimeout(timer);
    const errMsg = e.name === 'AbortError' ? 'TIMEOUT' : e.message;
    results.errors.push({ id, type, url, error: errMsg });
  }
}

// Run with limited concurrency
async function runAll() {
  let i = 0;
  let done = 0;
  const total = toCheck.length;

  async function worker() {
    while (i < total) {
      const task = toCheck[i++];
      await checkUrl(task);
      done++;
      if (done % 50 === 0) process.stdout.write(`  ${done}/${total} checked...\n`);
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, worker);
  await Promise.all(workers);
}

await runAll();

// Report
console.log('\n========================================');
console.log(`✅ OK:          ${results.ok}`);
console.log(`❌ Broken:      ${results.broken.length}`);
console.log(`⚠️  Suspicious:  ${results.suspicious.length}`);
console.log(`💥 Errors:      ${results.errors.length}`);
console.log('========================================\n');

if (results.broken.length) {
  console.log('❌ BROKEN LINKS:');
  for (const r of results.broken) {
    console.log(`  [${r.id}] (${r.type}) ${r.note}`);
    console.log(`    ${r.url}`);
    if (r.finalUrl) console.log(`    → ${r.finalUrl}`);
  }
  console.log();
}

if (results.suspicious.length) {
  console.log('⚠️  SUSPICIOUS LINKS (redirected to different target):');
  for (const r of results.suspicious) {
    console.log(`  [${r.id}] (${r.type}) ${r.note}`);
    console.log(`    ${r.url}`);
    if (r.finalUrl) console.log(`    → ${r.finalUrl}`);
  }
  console.log();
}

if (results.errors.length) {
  console.log('💥 FETCH ERRORS (timeout or network):');
  for (const r of results.errors) {
    console.log(`  [${r.id}] (${r.type}) ${r.error}`);
    console.log(`    ${r.url}`);
  }
  console.log();
}

// Save full results to file
const outPath = path.join(__dirname, '../data/link-check-results.json');
writeFileSync(outPath, JSON.stringify({ broken: results.broken, suspicious: results.suspicious, errors: results.errors, okCount: results.ok }, null, 2));
console.log(`Full results saved to data/link-check-results.json`);
