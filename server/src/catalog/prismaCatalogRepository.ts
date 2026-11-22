/**
 * Prisma CatalogRepository — the production store.
 *
 * Search fetches a bounded candidate set per type and lets the shared
 * ranking module order it, so in-memory tests and Postgres agree on
 * relevance. At hobby scale this is plenty; a trigram/FTS index is a
 * later optimization (M5).
 */
import type { Prisma, PrismaClient } from '@prisma/client';
import { genreSlug, isFeaturedGenre } from './genres.js';
import { stableId } from './ids.js';
import type {
  AlbumRow,
  ArtistRow,
  CatalogRepository,
  ExternalCatalog,
  GenreRow,
  ListenEventRecord,
  NewListenEvent,
  SavedExternalCatalog,
  TrackRow,
} from './types.js';

type TrackWithRelations = Prisma.TrackGetPayload<{
  include: { artist: true; album: true };
}>;

type AlbumWithRelations = Prisma.AlbumGetPayload<{
  include: { artist: true; _count: { select: { tracks: true } } };
}>;

function toTrack(row: TrackWithRelations): TrackRow {
  return {
    id: row.id,
    title: row.title,
    artistId: row.artistId,
    artistName: row.artist.name,
    albumId: row.albumId,
    albumTitle: row.album?.title ?? null,
    durationMs: row.durationMs,
    trackNumber: row.trackNumber,
    hasLyrics: row.hasLyrics,
    explicit: row.explicit,
    artUrl: row.artUrl ?? row.album?.artUrl ?? row.artist.artUrl,
    playCount: row.playCount,
    genres: row.genres,
  };
}

function toAlbum(row: AlbumWithRelations): AlbumRow {
  return {
    id: row.id,
    title: row.title,
    artistId: row.artistId,
    artistName: row.artist.name,
    type: row.type,
    releaseDate: row.releaseDate ? row.releaseDate.toISOString().slice(0, 10) : null,
    artUrl: row.artUrl,
    trackCount: row._count.tracks,
  };
}

function toArtist(row: {
  id: string;
  name: string;
  bio: string | null;
  artUrl: string | null;
  genres: string[];
  isVerified: boolean;
}): ArtistRow {
  return {
    id: row.id,
    name: row.name,
    bio: row.bio,
    artUrl: row.artUrl,
    genres: row.genres,
    isVerified: row.isVerified,
  };
}

const insensitive = (q: string) => ({ contains: q, mode: 'insensitive' as const });

function trackWhere(q: string): Prisma.TrackWhereInput {
  return {
    OR: [
      { title: insensitive(q) },
      { artist: { name: insensitive(q) } },
      { album: { title: insensitive(q) } },
    ],
  };
}

function albumWhere(q: string): Prisma.AlbumWhereInput {
  return {
    OR: [{ title: insensitive(q) }, { artist: { name: insensitive(q) } }],
  };
}

function artistWhere(q: string): Prisma.ArtistWhereInput {
  return { name: insensitive(q) };
}

const TRACK_INCLUDE = { artist: true, album: true } as const;
const ALBUM_INCLUDE = {
  artist: true,
  _count: { select: { tracks: true } },
} as const;

export class PrismaCatalogRepository implements CatalogRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async searchArtists(q: string, limit: number): Promise<ArtistRow[]> {
    const rows = await this.prisma.artist.findMany({
      where: artistWhere(q),
      orderBy: { name: 'asc' },
      take: limit,
    });
    return rows.map(toArtist);
  }

  async countArtists(q: string): Promise<number> {
    return this.prisma.artist.count({ where: artistWhere(q) });
  }

  async searchAlbums(q: string, limit: number): Promise<AlbumRow[]> {
    const rows = await this.prisma.album.findMany({
      where: albumWhere(q),
      include: ALBUM_INCLUDE,
      orderBy: [{ releaseDate: 'desc' }, { title: 'asc' }],
      take: limit,
    });
    return rows.map(toAlbum);
  }

  async countAlbums(q: string): Promise<number> {
    return this.prisma.album.count({ where: albumWhere(q) });
  }

  async searchTracks(q: string, limit: number): Promise<TrackRow[]> {
    const rows = await this.prisma.track.findMany({
      where: trackWhere(q),
      include: TRACK_INCLUDE,
      orderBy: { playCount: 'desc' },
      take: limit,
    });
    return rows.map(toTrack);
  }

  async countTracks(q: string): Promise<number> {
    return this.prisma.track.count({ where: trackWhere(q) });
  }

  async getArtist(id: string): Promise<ArtistRow | null> {
    const row = await this.prisma.artist.findUnique({ where: { id } });
    return row ? toArtist(row) : null;
  }

  async getArtistTopTracks(artistId: string, limit: number): Promise<TrackRow[]> {
    const rows = await this.prisma.track.findMany({
      where: { artistId },
      include: TRACK_INCLUDE,
      orderBy: { playCount: 'desc' },
      take: limit,
    });
    return rows.map(toTrack);
  }

  async getArtistReleases(artistId: string): Promise<AlbumRow[]> {
    const rows = await this.prisma.album.findMany({
      where: { artistId },
      include: ALBUM_INCLUDE,
      orderBy: [{ releaseDate: 'desc' }, { title: 'asc' }],
    });
    return rows.map(toAlbum);
  }

  async getArtistListenerCount(artistId: string, since: Date): Promise<number> {
    const rows = await this.prisma.listenEvent.findMany({
      where: { playedAt: { gte: since }, track: { artistId } },
      select: { deviceId: true },
      distinct: ['deviceId'],
    });
    return rows.length;
  }

  async getAlbum(id: string): Promise<AlbumRow | null> {
    const row = await this.prisma.album.findUnique({
      where: { id },
      include: ALBUM_INCLUDE,
    });
    return row ? toAlbum(row) : null;
  }

  async getAlbumTracks(albumId: string): Promise<TrackRow[]> {
    const rows = await this.prisma.track.findMany({
      where: { albumId },
      include: TRACK_INCLUDE,
      orderBy: [{ trackNumber: 'asc' }, { title: 'asc' }],
    });
    return rows.map(toTrack);
  }

  async getAlbumsByArtist(artistId: string, limit: number): Promise<AlbumRow[]> {
    const rows = await this.prisma.album.findMany({
      where: { artistId },
      include: ALBUM_INCLUDE,
      orderBy: [{ releaseDate: 'desc' }, { title: 'asc' }],
      take: limit,
    });
    return rows.map(toAlbum);
  }

  async getTrack(id: string): Promise<TrackRow | null> {
    const row = await this.prisma.track.findUnique({
      where: { id },
      include: TRACK_INCLUDE,
    });
    return row ? toTrack(row) : null;
  }

  async getTopTracks(limit: number): Promise<TrackRow[]> {
    const rows = await this.prisma.track.findMany({
      include: TRACK_INCLUDE,
      orderBy: { playCount: 'desc' },
      take: limit,
    });
    return rows.map(toTrack);
  }

  async getNewAlbums(limit: number): Promise<AlbumRow[]> {
    const rows = await this.prisma.album.findMany({
      include: ALBUM_INCLUDE,
      orderBy: [{ releaseDate: 'desc' }, { title: 'asc' }],
      take: limit,
    });
    return rows.map(toAlbum);
  }

  async getArtists(limit: number): Promise<ArtistRow[]> {
    const rows = await this.prisma.artist.findMany({
      orderBy: { name: 'asc' },
      take: limit,
    });
    return rows.map(toArtist);
  }

  async getTracksByGenres(
    genres: string[],
    limit: number,
    excludeTrackId?: string,
  ): Promise<TrackRow[]> {
    const rows = await this.prisma.track.findMany({
      where: {
        genres: { hasSome: genres },
        ...(excludeTrackId ? { id: { not: excludeTrackId } } : {}),
      },
      include: TRACK_INCLUDE,
      orderBy: { playCount: 'desc' },
      take: limit,
    });
    return rows.map(toTrack);
  }

  async listGenres(): Promise<GenreRow[]> {
    const rows = await this.prisma.track.findMany({ select: { genres: true, artUrl: true } });
    const bySlug = new Map<string, { name: string; count: number; artUrl: string | null }>();
    for (const row of rows) {
      for (const name of row.genres) {
        const id = genreSlug(name);
        if (!id) continue;
        const existing = bySlug.get(id);
        if (existing) {
          existing.count += 1;
          existing.artUrl ??= row.artUrl;
        } else {
          bySlug.set(id, { name, count: 1, artUrl: row.artUrl });
        }
      }
    }
    return [...bySlug.entries()]
      .map(([id, g]) => ({
        id,
        name: g.name,
        featured: isFeaturedGenre(g.name),
        trackCount: g.count,
        artUrl: g.artUrl,
      }))
      .sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        if (a.name === 'OPM') return -1;
        if (b.name === 'OPM') return 1;
        return b.trackCount - a.trackCount || a.name.localeCompare(b.name);
      });
  }

  async getGenreTracks(genreId: string, limit: number): Promise<TrackRow[]> {
    const genres = await this.listGenres();
    const genre = genres.find((g) => g.id === genreId);
    if (!genre) return [];
    const rows = await this.prisma.track.findMany({
      where: { genres: { has: genre.name } },
      include: TRACK_INCLUDE,
      orderBy: { playCount: 'desc' },
      take: limit,
    });
    return rows.map(toTrack);
  }

  async getRecentTracks(deviceId: string, limit: number): Promise<TrackRow[]> {
    const events = await this.prisma.listenEvent.findMany({
      where: { deviceId },
      select: { trackId: true },
      orderBy: { playedAt: 'desc' },
      take: Math.max(limit * 4, 40),
    });
    const ids: string[] = [];
    for (const event of events) {
      if (!ids.includes(event.trackId)) ids.push(event.trackId);
      if (ids.length >= limit) break;
    }
    if (ids.length === 0) return [];
    const rows = await this.prisma.track.findMany({
      where: { id: { in: ids } },
      include: TRACK_INCLUDE,
    });
    const byId = new Map(rows.map((row) => [row.id, toTrack(row)]));
    return ids.flatMap((id) => {
      const track = byId.get(id);
      return track ? [track] : [];
    });
  }

  async addListenEvents(deviceId: string, events: NewListenEvent[]): Promise<number> {
    if (events.length === 0) return 0;
    const result = await this.prisma.listenEvent.createMany({
      data: events.map((event) => ({
        deviceId,
        trackId: event.trackId,
        playedAt: event.playedAt,
        msPlayed: event.msPlayed,
        completed: event.completed,
      })),
    });
    return result.count;
  }

  async getListenEvents(deviceId: string, since: Date): Promise<ListenEventRecord[]> {
    const rows = await this.prisma.listenEvent.findMany({
      where: { deviceId, playedAt: { gte: since } },
      include: { track: { include: TRACK_INCLUDE } },
      orderBy: { playedAt: 'desc' },
      take: 200,
    });
    return rows.map((row) => ({
      id: row.id,
      trackId: row.trackId,
      playedAt: row.playedAt,
      msPlayed: row.msPlayed,
      completed: row.completed,
      track: toTrack(row.track),
    }));
  }

  async saveExternalCatalog(
    input: ExternalCatalog,
    source: 'ytm',
  ): Promise<SavedExternalCatalog> {
    const savedArtists: ArtistRow[] = [];
    const artistIdByExternal = new Map<string, string>();

    for (const a of input.artists) {
      const row = await this.prisma.artist.upsert({
        where: { source_externalId: { source, externalId: a.externalId } },
        update: { name: a.name, ...(a.artUrl ? { artUrl: a.artUrl } : {}) },
        create: {
          id: stableId('artist', a.externalId),
          name: a.name,
          artUrl: a.artUrl ?? null,
          genres: a.genres ?? [],
          source,
          externalId: a.externalId,
        },
      });
      artistIdByExternal.set(a.externalId, row.id);
      savedArtists.push(toArtist(row));
    }

    const savedAlbums: AlbumRow[] = [];
    const albumIdByExternal = new Map<string, string>();
    for (const al of input.albums) {
      const artistId = artistIdByExternal.get(al.artistExternalId);
      if (!artistId) continue;
      const row = await this.prisma.album.upsert({
        where: { source_externalId: { source, externalId: al.externalId } },
        update: { title: al.title },
        create: {
          id: stableId('album', al.externalId),
          title: al.title,
          artistId,
          type: al.type,
          releaseDate: al.releaseDate ? new Date(al.releaseDate) : null,
          artUrl: al.artUrl ?? null,
          source,
          externalId: al.externalId,
        },
        include: ALBUM_INCLUDE,
      });
      albumIdByExternal.set(al.externalId, row.id);
      savedAlbums.push(toAlbum(row));
    }

    const savedTracks: TrackRow[] = [];
    for (const t of input.tracks) {
      const artistId = artistIdByExternal.get(t.artistExternalId);
      if (!artistId) continue;
      const albumId = t.albumExternalId
        ? albumIdByExternal.get(t.albumExternalId) ?? null
        : null;
      const row = await this.prisma.track.upsert({
        where: { source_externalId: { source, externalId: t.externalId } },
        update: { title: t.title, durationMs: t.durationMs },
        create: {
          id: stableId('track', t.externalId),
          title: t.title,
          artistId,
          albumId,
          durationMs: t.durationMs,
          artUrl: t.artUrl ?? null,
          genres: t.genres ?? [],
          source,
          externalId: t.externalId,
        },
        include: TRACK_INCLUDE,
      });
      savedTracks.push(toTrack(row));
    }

    return { artists: savedArtists, albums: savedAlbums, tracks: savedTracks };
  }
}
