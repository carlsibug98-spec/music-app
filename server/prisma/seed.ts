/**
 * Seed the own catalog from the committed snapshot.
 *
 *   npm run seed -w server
 *
 * The snapshot is generated from local-media/manifest.json by
 * `npm run seed:catalog`; audio files themselves stay gitignored.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { catalogSeed } from '../src/catalog/catalog.seed.js';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  for (const artist of catalogSeed.artists) {
    await prisma.artist.upsert({
      where: { id: artist.id },
      update: {
        name: artist.name,
        bio: artist.bio,
        artUrl: artist.art_url,
        genres: artist.genres,
        isVerified: artist.is_verified,
      },
      create: {
        id: artist.id,
        name: artist.name,
        bio: artist.bio,
        artUrl: artist.art_url,
        genres: artist.genres,
        isVerified: artist.is_verified,
        source: 'own',
        externalId: artist.external_id,
      },
    });
  }

  for (const album of catalogSeed.albums) {
    await prisma.album.upsert({
      where: { id: album.id },
      update: {
        title: album.title,
        artistId: album.artist_id,
        type: album.type,
        releaseDate: album.release_date ? new Date(album.release_date) : null,
        artUrl: album.art_url,
      },
      create: {
        id: album.id,
        title: album.title,
        artistId: album.artist_id,
        type: album.type,
        releaseDate: album.release_date ? new Date(album.release_date) : null,
        artUrl: album.art_url,
        source: 'own',
        externalId: album.external_id,
      },
    });
  }

  for (const track of catalogSeed.tracks) {
    await prisma.track.upsert({
      where: { id: track.id },
      update: {
        title: track.title,
        artistId: track.artist_id,
        albumId: track.album_id,
        durationMs: track.duration_ms,
        trackNumber: track.track_number,
        hasLyrics: track.has_lyrics,
        playCount: track.play_count,
        genres: track.genres,
        explicit: track.explicit,
        artUrl: track.art_url,
      },
      create: {
        id: track.id,
        title: track.title,
        artistId: track.artist_id,
        albumId: track.album_id,
        durationMs: track.duration_ms,
        trackNumber: track.track_number,
        hasLyrics: track.has_lyrics,
        playCount: track.play_count,
        genres: track.genres,
        explicit: track.explicit,
        artUrl: track.art_url,
        source: 'own',
        externalId: track.external_id,
      },
    });

    if (track.lyrics) {
      await prisma.lyrics.upsert({
        where: { trackId: track.id },
        update: {
          lrcText: track.lyrics.lrc_text,
          plainText: null,
          offsetMs: track.lyrics.offset_ms,
          synced: track.lyrics.synced,
          source: 'own',
        },
        create: {
          trackId: track.id,
          lrcText: track.lyrics.lrc_text,
          offsetMs: track.lyrics.offset_ms,
          synced: track.lyrics.synced,
          source: 'own',
        },
      });
    }
  }

  const [artists, albums, tracks] = await Promise.all([
    prisma.artist.count(),
    prisma.album.count(),
    prisma.track.count(),
  ]);
  console.log(`✓ seeded ${artists} artists · ${albums} albums · ${tracks} tracks`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
