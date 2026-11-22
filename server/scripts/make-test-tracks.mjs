#!/usr/bin/env node
/**
 * make-test-tracks.mjs — generate the 10 own-catalog test tracks for M1.
 *
 * Output: local-media/ (gitignored — never committed, per M0 checklist)
 *   track-01.mp3 ... track-10.mp3   8–20 s tones, 128 kbps
 *   track-01.lrc ...                simple timed lyrics
 *   cover-01.png ...                300×300 solid covers (token palette)
 *   manifest.json                   seeding contract for M1
 *
 * Deterministic: same output every run. Requires ffmpeg on PATH.
 * Run from repo root: npm run test:tracks
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('../../local-media/', import.meta.url));
mkdirSync(OUT, { recursive: true });

// Tone per track: pentatonic ladder so consecutive tracks sound related.
const TRACKS = [
  { n: 1,  title: 'Panata',            artist: 'Bakunawa',     album: 'Panata',            dur: 16, freq: 261.63, color: '0xC7743F' },
  { n: 2,  title: 'Susundan',          artist: 'Diwata Drive', album: 'Southbound',        dur: 18, freq: 293.66, color: '0x3AA7FF' },
  { n: 3,  title: 'Gabing Nasa Bukid', artist: 'Neon Kapre',   album: 'Ulan',              dur: 14, freq: 329.63, color: '0x2FBF8F' },
  { n: 4,  title: 'Tala',              artist: 'Bakunawa',     album: 'Panata',            dur: 12, freq: 392.00, color: '0xF5C96B' },
  { n: 5,  title: 'Hilom',             artist: 'Sirena Club',  album: 'Hilom',             dur: 20, freq: 440.00, color: '0x9B72FF' },
  { n: 6,  title: 'Alon',              artist: 'Diwata Drive', album: 'Southbound',        dur: 15, freq: 523.25, color: '0x22C1CF' },
  { n: 7,  title: 'Dagitab',           artist: 'Neon Kapre',   album: 'Ulan',              dur: 10, freq: 587.33, color: '0xFF8A4C' },
  { n: 8,  title: 'Tahan',             artist: 'Sirena Club',  album: 'Hilom',             dur: 17, freq: 349.23, color: '0xA3A9B6' },
  { n: 9,  title: 'Silid',             artist: 'Bakunawa',     album: 'Panata',            dur: 13, freq: 233.08, color: '0x4D5A66' },
  { n: 10, title: 'Wakas',             artist: 'Diwata Drive', album: 'Southbound',        dur: 19, freq: 622.25, color: '0x8A4A2A' },
];

const LRC_LINES = [
  '[ti:{title}]',
  '[ar:{artist}]',
  '[al:{album}]',
  '[offset:-500]',
  '',
  ...Array.from({ length: 6 }, (_, i) => {
    const t = i * 3; // line every 3 s
    const mm = String(Math.floor(t / 60)).padStart(2, '0');
    const ss = String(t % 60).padStart(2, '0');
    const line = [
      'Static test lyric line, replace me',
      'This is the {title} test verse',
      'Synced lyrics lead by half a second',
      'Tap a line to seek there',
      'Highlight scrolls to the center',
      'End of test lyrics',
    ][i];
    return `[${mm}:${ss}.00]${line}`;
  }),
];

function run(args) {
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'pipe' });
}

const manifest = [];

for (const t of TRACKS) {
  const pad = String(t.n).padStart(2, '0');
  const mp3 = `track-${pad}.mp3`;
  const lrc = `track-${pad}.lrc`;
  const art = `cover-${pad}.png`;

  // Audio: sine tone with 0.5 s fades in/out.
  run([
    '-f', 'lavfi', '-i', `sine=frequency=${t.freq}:duration=${t.dur}`,
    '-af', `afade=t=in:d=0.5,afade=t=out:st=${t.dur - 0.5}:d=0.5`,
    '-codec:a', 'libmp3lame', '-b:a', '128k',
    join(OUT, mp3),
  ]);

  // Cover art: 300×300 solid color from the token palette.
  run([
    '-f', 'lavfi', '-i', `color=c=${t.color}:s=300x300`,
    '-frames:v', '1',
    join(OUT, art),
  ]);

  // LRC with the −500 ms offset baked in (P4).
  const lrcText = LRC_LINES.map((l) =>
    l.replaceAll('{title}', t.title).replaceAll('{artist}', t.artist).replaceAll('{album}', t.album),
  ).join('\n');
  writeFileSync(join(OUT, lrc), lrcText + '\n');

  manifest.push({
    id: `test-track-${pad}`,
    title: t.title,
    artist: t.artist,
    album: t.album,
    duration_ms: t.dur * 1000,
    file: mp3,
    lyrics: lrc,
    art,
    lyrics_offset_ms: -500,
    source: 'own',
  });
  console.log(`✓ ${mp3} (${t.dur}s, ${t.freq} Hz) + ${lrc} + ${art}`);
}

writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`\n✓ manifest.json — ${manifest.length} tracks in ${OUT}`);
