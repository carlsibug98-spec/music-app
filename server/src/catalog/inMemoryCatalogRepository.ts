/**
 * In-memory CatalogRepository — used by tests and by the YTM cache tests.
 * Mirrors the Prisma implementation's behavior against the committed seed.
 */
import { randomUUID } from 'node:crypto';
import { catalogSeed } from './catalog.seed.js';
import type { CatalogSeed } from './seedTypes.js';
import { genreSlug, isFeaturedGenre } from './genres.js';
import { stableId } from './ids.js';
import { normalize } from './ranking.js';
import type {
  AlbumRow,
  ArtistRow,
  CatalogRepository,
  ExternalCatalog,
  GenreRow,
  ListenEventRecord,
  NewListenEvent,
  RecentListenRow,
  SavedExternalCatalog,
  TrackRow,
} from './types.js';

interface StoredListen {
  id: string;
  trackId: string;
  playedAt: Date;
  msPlayed: number;
  completed: boolean;
}

export class InMemoryCatalogRepository implements CatalogRepository {
  readonly artists: ArtistRow[] = [];
  readonly albums: AlbumRow[] = [];
  readonly tracks: TrackRow[] = [];

  #events = new Map<string, StoredListen[]>();
  #artistByExternal = new Map<string, string>();
  #albumByExternal = new Map<string, string>();

  constructor(seed: CatalogSeed = catalogSeed) {
    for (const a of seed.artists) {
      this.artists.push({
        id: a.id,
        name: a.name,
        bio: a.bio,
        artUrl: a.art_url,
        genres: a.genres,
        isVerified: a.is_verified,
      });
      this.#artistByExternal.set(a.external_id, a.id);
    }

    for (const al of seed.albums) {
      const artist = this.artists.find((a) => a.id === al.artist_id);
      this.albums.push({
        id: al.id,
        title: al.title,
        artistId: al.artist_id,
        artistName: artist?.name ?? 'Unknown artist',
        type: al.type,
        releaseDate: al.release_date,
        artUrl: al.art_url,
        trackCount: 0,
      });
      this.#albumByExternal.set(al.external_id, al.id);
    }

    for (const t of seed.tracks) {
      const artist = this.artists.find((a) => a.id === t.artist_id);
      const album = this.albums.find((a) => a.id === t.album_id);
      this.tracks.push({
        id: t.id,
        title: t.title,
        artistId: t.artist_id,
        artistName: artist?.name ?? 'Unknown artist',
        albumId: t.album_id,
        albumTitle: album?.title ?? null,
        durationMs: t.duration_ms,
        trackNumber: t.track_number,
        hasLyrics: t.has_lyrics,
        explicit: t.explicit,
        artUrl: t.art_url,
        playCount: t.play_count,
        genres: t.genres,
      });
    }

    this.#recountAlbums();
  }

  #recountAlbums(): void {
    for (const album of this.albums) {
      album.trackCount = this.tracks.filter((t) => t.albumId === album.id).length;
    }
  }

  #matches(query: string, ...fields: (string | null | undefined)[]): boolean {
    const q = normalize(query);
    return fields.some((f) => f != null && normalize(f).includes(q));
  }

  async searchArtists(q: string, limit: number): Promise<ArtistRow[]> {
    return this.artists
      .filter((a) => this.#matches(q, a.name))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, limit);
  }

  async countArtists(q: string): Promise<number> {
    return this.artists.filter((a) => this.#matches(q, a.name)).length;
  }

  async searchAlbums(q: string, limit: number): Promise<AlbumRow[]> {
    return this.albums
      .filter((a) => this.#matches(q, a.title, a.artistName))
      .sort((a, b) => (b.releaseDate ?? '').localeCompare(a.releaseDate ?? ''))
      .slice(0, limit);
  }

  async countAlbums(q: string): Promise<number> {
    return this.albums.filter((a) => this.#matches(q, a.title, a.artistName)).length;
  }

  async searchTracks(q: string, limit: number): Promise<TrackRow[]> {
    return this.tracks
      .filter((t) => this.#matches(q, t.title, t.artistName, t.albumTitle))
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit);
  }

  async countTracks(q: string): Promise<number> {
    return this.tracks.filter((t) => this.#matches(q, t.title, t.artistName, t.albumTitle)).length;
  }

  async getArtist(id: string): Promise<ArtistRow | null> {
    return this.artists.find((a) => a.id === id) ?? null;
  }

  async getArtistTopTracks(artistId: string, limit: number): Promise<TrackRow[]> {
    return this.tracks
      .filter((t) => t.artistId === artistId)
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit);
  }

  async getArtistReleases(artistId: string): Promise<AlbumRow[]> {
    return this.albums
      .filter((a) => a.artistId === artistId)
      .sort((a, b) => (b.releaseDate ?? '').localeCompare(a.releaseDate ?? ''));
  }

  async getArtistListenerCount(artistId: string, since: Date): Promise<number> {
    const artistTrackIds = new Set(
      this.tracks.filter((t) => t.artistId === artistId).map((t) => t.id),
    );
    const devices = new Set<string>();
    for (const [deviceId, events] of this.#events) {
      if (events.some((e) => e.playedAt >= since && artistTrackIds.has(e.trackId))) {
        devices.add(deviceId);
      }
    }
    return devices.size;
  }

  async getAlbum(id: string): Promise<AlbumRow | null> {
    return this.albums.find((a) => a.id === id) ?? null;
  }

  async getAlbumTracks(albumId: string): Promise<TrackRow[]> {
    return this.tracks
      .filter((t) => t.albumId === albumId)
      .sort((a, b) => a.trackNumber - b.trackNumber);
  }

  async getAlbumsByArtist(artistId: string, limit: number): Promise<AlbumRow[]> {
    return this.albums
      .filter((a) => a.artistId === artistId)
      .sort((a, b) => (b.releaseDate ?? '').localeCompare(a.releaseDate ?? ''))
      .slice(0, limit);
  }

  async getTrack(id: string): Promise<TrackRow | null> {
    return this.tracks.find((t) => t.id === id) ?? null;
  }

  async getTopTracks(limit: number): Promise<TrackRow[]> {
    return [...this.tracks].sort((a, b) => b.playCount - a.playCount).slice(0, limit);
  }

  async getNewAlbums(limit: number): Promise<AlbumRow[]> {
    return [...this.albums]
      .sort((a, b) => (b.releaseDate ?? '').localeCompare(a.releaseDate ?? ''))
      .slice(0, limit);
  }

  async getArtists(limit: number): Promise<ArtistRow[]> {
    return [...this.artists]
      .sort((a, b) => {
        const playsA = this.tracks
          .filter((t) => t.artistId === a.id)
          .reduce((n, t) => n + t.playCount, 0);
        const playsB = this.tracks
          .filter((t) => t.artistId === b.id)
          .reduce((n, t) => n + t.playCount, 0);
        return playsB - playsA;
      })
      .slice(0, limit);
  }

  async getTracksByGenres(
    genres: string[],
    limit: number,
    excludeTrackId?: string,
  ): Promise<TrackRow[]> {
    const wanted = new Set(genres.map(normalize));
    return this.tracks
      .filter(
        (t) =>
          t.id !== excludeTrackId && t.genres.some((g) => wanted.has(normalize(g))),
      )
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit);
  }

  async listGenres(): Promise<GenreRow[]> {
    const bySlug = new Map<string, { name: string; count: number; artUrl: string | null }>();
    for (const track of this.tracks) {
      for (const name of track.genres) {
        const id = genreSlug(name);
        if (!id) continue;
        const existing = bySlug.get(id);
        if (existing) {
          existing.count += 1;
          existing.artUrl ??= track.artUrl;
        } else {
          bySlug.set(id, { name, count: 1, artUrl: track.artUrl });
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
    return [...this.tracks]
      .filter((t) => t.genres.some((g) => genreSlug(g) === genreId))
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit);
  }

  async getRecentTracks(deviceId: string, limit: number): Promise<TrackRow[]> {
    const events = [...(this.#events.get(deviceId) ?? [])].sort(
      (a, b) => b.playedAt.getTime() - a.playedAt.getTime(),
    );
    const seen = new Set<string>();
    const result: TrackRow[] = [];
    for (const event of events) {
      if (seen.has(event.trackId)) continue;
      const track = this.tracks.find((t) => t.id === event.trackId);
      if (!track) continue;
      seen.add(event.trackId);
      result.push(track);
      if (result.length >= limit) break;
    }
    return result;
  }

  async addListenEvents(deviceId: string, events: NewListenEvent[]): Promise<number> {
    const list = this.#events.get(deviceId) ?? [];
    for (const event of events) {
      list.push({ id: randomUUID(), ...event });
    }
    this.#events.set(deviceId, list);
    return events.length;
  }

  async getListenEvents(deviceId: string, since: Date): Promise<ListenEventRecord[]> {
    return (this.#events.get(deviceId) ?? [])
      .filter((e) => e.playedAt >= since)
      .sort((a, b) => b.playedAt.getTime() - a.playedAt.getTime())
      .flatMap((e) => {
        const track = this.tracks.find((t) => t.id === e.trackId);
        if (!track) return [];
        const row: RecentListenRow & { track: TrackRow } = { ...e, track };
        return [row];
      });
  }

  async saveExternalCatalog(
    input: ExternalCatalog,
    source: 'ytm',
  ): Promise<SavedExternalCatalog> {
    void source;
    const savedArtists: ArtistRow[] = [];
    for (const a of input.artists) {
      const id = this.#artistByExternal.get(a.externalId) ?? stableId('artist', a.externalId);
      let row = this.artists.find((x) => x.id === id);
      if (!row) {
        row = {
          id,
          name: a.name,
          bio: null,
          artUrl: a.artUrl ?? null,
          genres: a.genres ?? [],
          isVerified: false,
        };
        this.artists.push(row);
      } else {
        row.name = a.name;
        row.artUrl = a.artUrl ?? row.artUrl;
        if (a.genres?.length) row.genres = a.genres;
      }
      this.#artistByExternal.set(a.externalId, id);
      savedArtists.push(row);
    }

    const savedAlbums: AlbumRow[] = [];
    for (const al of input.albums) {
      const artistId = this.#artistByExternal.get(al.artistExternalId);
      if (!artistId) continue;
      const artist = this.artists.find((x) => x.id === artistId);
      const id = this.#albumByExternal.get(al.externalId) ?? stableId('album', al.externalId);
      let row = this.albums.find((x) => x.id === id);
      if (!row) {
        row = {
          id,
          title: al.title,
          artistId,
          artistName: artist?.name ?? 'Unknown artist',
          type: al.type,
          releaseDate: al.releaseDate ?? null,
          artUrl: al.artUrl ?? null,
          trackCount: 0,
        };
        this.albums.push(row);
      } else {
        row.title = al.title;
        row.artUrl = al.artUrl ?? row.artUrl;
      }
      this.#albumByExternal.set(al.externalId, id);
      savedAlbums.push(row);
    }

    const savedTracks: TrackRow[] = [];
    for (const t of input.tracks) {
      const artistId = this.#artistByExternal.get(t.artistExternalId);
      if (!artistId) continue;
      const artist = this.artists.find((x) => x.id === artistId);
      const albumId = t.albumExternalId ? this.#albumByExternal.get(t.albumExternalId) ?? null : null;
      const album = albumId ? this.albums.find((x) => x.id === albumId) : null;
      const id = stableId('track', t.externalId);
      let row = this.tracks.find((x) => x.id === id);
      if (!row) {
        row = {
          id,
          title: t.title,
          artistId,
          artistName: artist?.name ?? 'Unknown artist',
          albumId,
          albumTitle: album?.title ?? null,
          durationMs: t.durationMs,
          trackNumber: 0,
          hasLyrics: false,
          explicit: false,
          artUrl: t.artUrl ?? null,
          playCount: 0,
          genres: t.genres ?? [],
        };
        this.tracks.push(row);
      } else {
        row.title = t.title;
        row.durationMs = t.durationMs;
        row.artUrl = t.artUrl ?? row.artUrl;
      }
      savedTracks.push(row);
    }

    this.#recountAlbums();
    return { artists: savedArtists, albums: savedAlbums, tracks: savedTracks };
  }
}
