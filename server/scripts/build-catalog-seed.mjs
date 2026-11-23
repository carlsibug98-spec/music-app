#!/usr/bin/env node
/**
 * Build the committed catalog seed from local-media/manifest.json.
 *
 *   npm run seed:catalog
 *
 * The audio itself stays in gitignored local-media/; this script snapshots
 * the metadata + LRC text so a fresh clone can seed Postgres and run the
 * catalog tests without downloading anything. IDs are deterministic UUIDv5
 * values derived from the manifest external id, so re-running is idempotent.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const mediaDir = join(repoRoot, 'local-media');
const outFile = join(repoRoot, 'server/src/catalog/catalog.seed.ts');
const manifestPath = join(mediaDir, 'manifest.json');

if (!existsSync(manifestPath)) {
  console.error(`manifest not found: ${manifestPath}`);
  console.error('Run `npm run test:tracks` first to generate local-media/.');
  process.exit(1);
}

const NAMESPACE = 'b7f6b9d2-3c1a-4e8a-9f0d-2d5f7a1c6e33';

function uuidv5(name) {
  const ns = Buffer.from(NAMESPACE.replace(/-/g, ''), 'hex');
  const hash = createHash('sha1').update(Buffer.concat([ns, Buffer.from(name)])).digest();
  hash[6] = ((hash[6] ?? 0) & 0x0f) | 0x50;
  hash[8] = ((hash[8] ?? 0) & 0x3f) | 0x80;
  const hex = hash.subarray(0, 16).toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const artistMeta = {
  Bakunawa: {
    bio: 'Bakunawa write slow-burning OPM about the things that swallow us whole.',
    genres: ['OPM', 'Hugot', 'Pinoy Rock'],
    verified: true,
  },
  'Diwata Drive': {
    bio: 'Diwata Drive make road-trip indie for the long way home.',
    genres: ['OPM', 'Indie', 'Chill'],
    verified: true,
  },
  'Neon Kapre': {
    bio: 'Neon Kapre build synth-pop from city noise and provincial midnight.',
    genres: ['OPM', 'Synth-Pop', 'Late Night'],
    verified: false,
  },
  'Sirena Club': {
    bio: 'Sirena Club are a dream-pop four-piece from the coast.',
    genres: ['OPM', 'Dream Pop', 'Chill'],
    verified: false,
  },
};

const trackGenres = {
  'test-track-01': ['OPM', 'Hugot', 'Pinoy Rock'],
  'test-track-02': ['OPM', 'Indie', 'Chill'],
  'test-track-03': ['OPM', 'Synth-Pop', 'Late Night'],
  'test-track-04': ['OPM', 'Hugot'],
  'test-track-05': ['OPM', 'Dream Pop', 'Chill'],
  'test-track-06': ['OPM', 'Chill'],
  'test-track-07': ['OPM', 'Synth-Pop', 'Late Night'],
  'test-track-08': ['OPM', 'Dream Pop', 'Late Night'],
  'test-track-09': ['OPM', 'Indie'],
  'test-track-10': ['OPM', 'Hugot'],
};

const playCounts = [2480, 1930, 1620, 2210, 1750, 1180, 890, 1310, 1420, 2040];

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

const artists = new Map();
const albums = new Map();
const tracks = [];

for (const [index, entry] of manifest.entries()) {
  const artistId = uuidv5(`artist:${entry.artist}`);
  const albumKey = `${entry.artist}:${entry.album}`;
  const albumId = uuidv5(`album:${albumKey}`);

  if (!artists.has(entry.artist)) {
    const meta = artistMeta[entry.artist] ?? {
      bio: null,
      genres: ['OPM'],
      verified: false,
    };
    artists.set(entry.artist, {
      id: artistId,
      name: entry.artist,
      bio: meta.bio,
      art_url: `/media/${entry.art}`,
      is_verified: meta.verified,
      genres: meta.genres,
      external_id: `artist-${entry.artist.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    });
  }

  if (!albums.has(albumKey)) {
    albums.set(albumKey, {
      id: albumId,
      title: entry.album,
      artist_id: artistId,
      type: 'album',
      release_date: `2026-${String(3 + (index % 8)).padStart(2, '0')}-${String(5 + (index % 9)).padStart(2, '0')}`,
      art_url: `/media/${entry.art}`,
      external_id: `album-${albumKey.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    });
  }

  const lyricsPath = entry.lyrics ? join(mediaDir, entry.lyrics) : null;
  const lrcText = lyricsPath && existsSync(lyricsPath) ? readFileSync(lyricsPath, 'utf8') : null;

  const albumTrackNumber =
    tracks.filter((t) => t.album_id === albumId).length + 1;

  tracks.push({
    id: uuidv5(`track:${entry.id}`),
    title: entry.title,
    artist_id: artistId,
    album_id: albumId,
    duration_ms: entry.duration_ms,
    track_number: albumTrackNumber,
    has_lyrics: Boolean(lrcText),
    play_count: playCounts[index] ?? 0,
    genres: trackGenres[entry.id] ?? ['OPM'],
    explicit: false,
    external_id: entry.id,
    art_url: `/media/${entry.art}`,
    lyrics: lrcText
      ? {
          lrc_text: lrcText,
          offset_ms: entry.lyrics_offset_ms ?? -500,
          synced: true,
        }
      : null,
  });
}

const payload = {
  version: 1,
  generated_from: 'local-media/manifest.json',
  generated_at: '2026-11-22',
  artists: [...artists.values()],
  albums: [...albums.values()],
  tracks,
};

mkdirSync(dirname(outFile), { recursive: true });
const source = `// GENERATED FILE — run \`npm run seed:catalog\` after editing local-media/manifest.json.
import type { CatalogSeed } from './seedTypes.js';

export const catalogSeed: CatalogSeed = ${JSON.stringify(payload, null, 2)};
`;
writeFileSync(outFile, source, 'utf8');

const withoutLyrics = tracks.filter((t) => !t.lyrics).length;
console.log(`✓ ${outFile}`);
console.log(
  `  ${artists.size} artists · ${albums.size} albums · ${tracks.length} tracks · ${withoutLyrics} without lyrics`,
);
