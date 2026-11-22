/**
 * CatalogService — the M1 read/write surface.
 *
 * Own-catalog is always authoritative. The YTM adapter (when enabled) adds
 * results, persists them, and can degrade to cached rows without failing the
 * request. Ranking lives in one place so both stores agree.
 */
import type {
  AlbumDetail,
  AlbumSummary,
  ArtistDetail,
  ArtistSummary,
  CatalogCard,
  GenreDetailResponse,
  GenresResponse,
  GenreSummary,
  HomeResponse,
  HomeRow,
  ListenEventInput,
  RecentGroup,
  RecentsResponse,
  SearchResponse,
  SearchSuggestion,
  SearchSuggestResponse,
  SearchType,
  StationResponse,
  TrackDetail,
  TrackSummary,
} from '@resona/api-types';
import type { YtmProvider } from '../adapters/ytmProvider.js';
import { ApiError } from '../lib/errors.js';
import { genreSlug } from './genres.js';
import { isUuid } from './ids.js';
import { normalize, rankByQuery, rankScore, textScore } from './ranking.js';
import type {
  AlbumRow,
  ArtistRow,
  CatalogRepository,
  GenreRow,
  TrackRow,
} from './types.js';

export interface SearchParams {
  q: string;
  type: SearchType | 'all';
  limit: number;
  offset: number;
}

export interface CatalogServiceOptions {
  repository: CatalogRepository;
  ytm?: YtmProvider;
  now?: () => Date;
  suggestCacheTtlMs?: number;
}

interface CachedSuggestions {
  expiresAt: number;
  value: SearchSuggestResponse;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export class CatalogService {
  readonly #repo: CatalogRepository;
  readonly #ytm: YtmProvider | undefined;
  readonly #now: () => Date;
  readonly #suggestTtlMs: number;
  readonly #suggestCache = new Map<string, CachedSuggestions>();

  constructor(options: CatalogServiceOptions) {
    this.#repo = options.repository;
    this.#ytm = options.ytm;
    this.#now = options.now ?? (() => new Date());
    this.#suggestTtlMs = options.suggestCacheTtlMs ?? 60_000;
  }

  /* ---------- Mapping ---------- */

  #track(t: TrackRow): TrackSummary {
    return {
      id: t.id,
      title: t.title,
      artist_id: t.artistId,
      artist_name: t.artistName,
      album_id: t.albumId,
      album_title: t.albumTitle,
      duration_ms: t.durationMs,
      has_lyrics: t.hasLyrics,
      explicit: t.explicit,
      art_url: t.artUrl,
      play_count: t.playCount,
      genres: t.genres,
    };
  }

  #album(a: AlbumRow): AlbumSummary {
    return {
      id: a.id,
      title: a.title,
      artist_id: a.artistId,
      artist_name: a.artistName,
      type: a.type,
      release_date: a.releaseDate,
      art_url: a.artUrl,
      track_count: a.trackCount,
    };
  }

  #artist(a: ArtistRow): ArtistSummary {
    return {
      id: a.id,
      name: a.name,
      art_url: a.artUrl,
      is_verified: a.isVerified,
      genres: a.genres,
    };
  }

  #trackCard(t: TrackRow): CatalogCard {
    return {
      kind: 'track',
      id: t.id,
      title: t.title,
      subtitle: t.artistName,
      art_url: t.artUrl,
    };
  }

  #albumCard(a: AlbumRow): CatalogCard {
    return {
      kind: 'album',
      id: a.id,
      title: a.title,
      subtitle: a.artistName,
      art_url: a.artUrl,
    };
  }

  #artistCard(a: ArtistRow): CatalogCard {
    return {
      kind: 'artist',
      id: a.id,
      title: a.name,
      subtitle: a.genres.slice(0, 2).join(' · '),
      art_url: a.artUrl,
    };
  }

  #genre(g: GenreRow): GenreSummary {
    return {
      id: g.id,
      name: g.name,
      featured: g.featured,
      track_count: g.trackCount,
      art_url: g.artUrl,
    };
  }

  #genreCard(g: GenreRow): CatalogCard {
    return {
      kind: 'genre',
      id: g.id,
      title: g.name,
      subtitle: `${g.trackCount} ${g.trackCount === 1 ? 'track' : 'tracks'}`,
      art_url: g.artUrl,
    };
  }

  /* ---------- Search ---------- */

  async suggest(rawQuery: string): Promise<SearchSuggestResponse> {
    const query = rawQuery.trim();
    if (!query) return { query, suggestions: [] };

    const key = normalize(query);
    const cached = this.#suggestCache.get(key);
    if (cached && cached.expiresAt > this.#now().getTime()) return cached.value;

    const [artists, tracks, albums] = await Promise.all([
      this.#repo.searchArtists(query, 5),
      this.#repo.searchTracks(query, 8),
      this.#repo.searchAlbums(query, 5),
    ]);

    const suggestions: SearchSuggestion[] = [{ type: 'query', text: query }];

    const rankedArtists = artists
      .map((a) => ({ a, score: textScore(query, a.name) }))
      .filter((x) => x.score > 0)
      .sort((x, y) => y.score - x.score || x.a.name.localeCompare(y.a.name));
    for (const { a } of rankedArtists) {
      suggestions.push({
        type: 'artist',
        text: a.name,
        subtitle: a.isVerified ? 'Artist · Verified' : 'Artist',
        id: a.id,
      });
    }

    for (const t of rankByQuery(query, tracks)) {
      suggestions.push({
        type: 'song',
        text: t.title,
        subtitle: `Song · ${t.artistName}`,
        id: t.id,
      });
    }

    for (const a of albums) {
      suggestions.push({
        type: 'album',
        text: a.title,
        subtitle: `Album · ${a.artistName}`,
        id: a.id,
      });
    }

    const seen = new Set<string>();
    const value: SearchSuggestResponse = {
      query,
      suggestions: suggestions
        .filter((s) => {
          const dedupe = s.type === 'query' ? 'query' : `${s.type}:${s.id}`;
          if (seen.has(dedupe)) return false;
          seen.add(dedupe);
          return true;
        })
        .slice(0, 8),
    };

    if (this.#suggestCache.size > 500) {
      const oldest = this.#suggestCache.keys().next().value;
      if (oldest) this.#suggestCache.delete(oldest);
    }
    this.#suggestCache.set(key, {
      expiresAt: this.#now().getTime() + this.#suggestTtlMs,
      value,
    });
    return value;
  }

  async search(params: SearchParams): Promise<SearchResponse> {
    const { q, type, limit, offset } = params;
    const wants = (t: SearchType) => type === 'all' || type === t;

    const [ownArtists, ownAlbums, ownTracks, artistCount, albumCount, trackCount] =
      await Promise.all([
        wants('artist') ? this.#repo.searchArtists(q, 100) : Promise.resolve([]),
        wants('album') ? this.#repo.searchAlbums(q, 100) : Promise.resolve([]),
        wants('song') ? this.#repo.searchTracks(q, 200) : Promise.resolve([]),
        wants('artist') ? this.#repo.countArtists(q) : Promise.resolve(0),
        wants('album') ? this.#repo.countAlbums(q) : Promise.resolve(0),
        wants('song') ? this.#repo.countTracks(q) : Promise.resolve(0),
      ]);

    let artists = ownArtists;
    let albums = ownAlbums;
    let tracks = ownTracks;
    let total = artistCount + albumCount + trackCount;
    let degraded = false;

    if (this.#ytm?.isAvailable() && type !== 'playlist') {
      try {
        const external = await this.#ytm.search(q, type, 50);
        const saved = await this.#repo.saveExternalCatalog(external, 'ytm');
        if (wants('artist')) {
          artists = mergeById(artists, saved.artists);
          total += saved.artists.length;
        }
        if (wants('album')) {
          albums = mergeById(albums, saved.albums);
          total += saved.albums.length;
        }
        if (wants('song')) {
          tracks = mergeById(tracks, saved.tracks);
          total += saved.tracks.length;
        }
      } catch (err) {
        degraded = true;
        console.warn('[catalog] YTM adapter failed; serving own/cached rows:', err);
      }
    }

    const rankedTracks = rankByQuery(q, tracks);
    const rankedArtists = [...artists].sort(
      (a, b) =>
        textScore(q, b.name) - textScore(q, a.name) || a.name.localeCompare(b.name),
    );
    const rankedAlbums = [...albums].sort(
      (a, b) =>
        textScore(q, b.title) * 2 +
        textScore(q, b.artistName) -
        (textScore(q, a.title) * 2 + textScore(q, a.artistName)) ||
        (b.releaseDate ?? '').localeCompare(a.releaseDate ?? ''),
    );

    // Count what can actually be paginated after merging own + external rows.
    total = artists.length + albums.length + tracks.length;

    const artistHeader =
      rankScore(q, { title: rankedArtists[0]?.name ?? '', artistName: '' }) > 0
        ? this.#artist(rankedArtists[0]!)
        : null;

    return {
      query: q,
      type,
      limit,
      offset,
      total,
      degraded,
      artist_header: artistHeader,
      songs: rankedTracks.slice(offset, offset + limit).map((t) => this.#track(t)),
      albums: rankedAlbums.slice(offset, offset + limit).map((a) => this.#album(a)),
      artists: rankedArtists.slice(offset, offset + limit).map((a) => this.#artist(a)),
      playlists: [],
    };
  }

  /* ---------- Browse ---------- */

  async home(deviceId: string, displayName: string): Promise<HomeResponse> {
    const [recents, topTracks, newAlbums, artists, genres] = await Promise.all([
      this.#repo.getRecentTracks(deviceId, 8),
      this.#repo.getTopTracks(8),
      this.#repo.getNewAlbums(6),
      this.#repo.getArtists(6),
      this.#repo.listGenres(),
    ]);

    const quick: TrackRow[] = [];
    const seen = new Set<string>();
    for (const track of [...recents, ...topTracks]) {
      if (seen.has(track.id)) continue;
      seen.add(track.id);
      quick.push(track);
      if (quick.length >= 8) break;
    }

    const rows: HomeRow[] = [];
    if (recents.length > 0) {
      rows.push({
        key: 'recent_rotation',
        title: 'Your recent rotation',
        items: recents.map((t) => this.#trackCard(t)),
      });
    }
    rows.push(
      {
        key: 'made_for_you',
        title: 'Made for you',
        items: topTracks.map((t) => this.#trackCard(t)),
      },
      {
        key: 'new_releases',
        title: 'New releases',
        items: newAlbums.map((a) => this.#albumCard(a)),
      },
      {
        key: 'artists_to_know',
        title: 'Artists to know',
        items: artists.map((a) => this.#artistCard(a)),
      },
      {
        key: 'browse_genres',
        title: 'Browse genres',
        items: genres.slice(0, 6).map((g) => this.#genreCard(g)),
      },
    );

    return {
      greeting: `Good to see you, ${displayName}`,
      quick_grid: quick.map((t) => this.#trackCard(t)),
      rows: rows.filter((row) => row.items.length > 0),
    };
  }

  async genres(): Promise<GenresResponse> {
    return { genres: (await this.#repo.listGenres()).map((g) => this.#genre(g)) };
  }

  async genre(id: string): Promise<GenreDetailResponse> {
    const genres = await this.#repo.listGenres();
    const genre = genres.find((g) => g.id === id);
    if (!genre) throw notFound('Genre');
    return {
      genre: this.#genre(genre),
      tracks: (await this.#repo.getGenreTracks(id, 50)).map((t) => this.#track(t)),
    };
  }

  async station(rawSeed: string): Promise<StationResponse> {
    let seed = rawSeed;
    try {
      seed = decodeURIComponent(rawSeed);
    } catch {
      // Malformed %-encoding: treat the literal path segment as the seed.
    }

    const seedIsUuid = isUuid(seed);
    const [artist, track, genres] = await Promise.all([
      seedIsUuid ? this.#repo.getArtist(seed) : Promise.resolve(null),
      seedIsUuid ? this.#repo.getTrack(seed) : Promise.resolve(null),
      this.#repo.listGenres(),
    ]);

    if (artist) {
      const [top, related] = await Promise.all([
        this.#repo.getArtistTopTracks(artist.id, 10),
        this.#repo.getTracksByGenres(artist.genres, 30),
      ]);
      return {
        seed,
        title: `${artist.name} Radio`,
        description: `Songs from ${artist.name} and artists in the same lane.`,
        tracks: dedupeTracks([...top, ...related], 20).map((t) => this.#track(t)),
      };
    }

    if (track) {
      const [top, related] = await Promise.all([
        this.#repo.getArtistTopTracks(track.artistId, 10),
        this.#repo.getTracksByGenres(track.genres, 30, track.id),
      ]);
      return {
        seed,
        title: `${track.title} Radio`,
        description: `Built from ${track.artistName} and the ${track.genres[0] ?? 'same'} lane.`,
        tracks: dedupeTracks([track, ...top, ...related], 20).map((t) => this.#track(t)),
      };
    }

    const genre = genres.find((g) => g.id === genreSlug(seed));
    if (genre) {
      const tracks = await this.#repo.getGenreTracks(genre.id, 50);
      return {
        seed,
        title: `${genre.name} Radio`,
        description: `A continuous ${genre.name} station.`,
        tracks: dedupeTracks(tracks, 20).map((t) => this.#track(t)),
      };
    }

    const results = rankByQuery(seed, await this.#repo.searchTracks(seed, 50));
    if (results.length === 0) throw notFound('Station');
    return {
      seed,
      title: `${results[0]!.title} Radio`,
      description: 'Based on your search.',
      tracks: dedupeTracks(results, 20).map((t) => this.#track(t)),
    };
  }

  /* ---------- Detail ---------- */

  async artist(id: string): Promise<ArtistDetail> {
    if (!isUuid(id)) throw notFound('Artist');
    const artist = await this.#repo.getArtist(id);
    if (!artist) throw notFound('Artist');
    const [top, releases, listeners] = await Promise.all([
      this.#repo.getArtistTopTracks(id, 5),
      this.#repo.getArtistReleases(id),
      this.#repo.getArtistListenerCount(id, new Date(this.#now().getTime() - 28 * DAY_MS)),
    ]);
    return {
      ...this.#artist(artist),
      bio: artist.bio,
      monthly_listeners: listeners,
      top_tracks: top.map((t) => this.#track(t)),
      releases: releases.map((a) => this.#album(a)),
    };
  }

  async album(id: string): Promise<AlbumDetail> {
    if (!isUuid(id)) throw notFound('Album');
    const album = await this.#repo.getAlbum(id);
    if (!album) throw notFound('Album');
    const [tracks, more] = await Promise.all([
      this.#repo.getAlbumTracks(id),
      this.#repo.getAlbumsByArtist(album.artistId, 6),
    ]);
    return {
      ...this.#album(album),
      tracks: tracks.map((t) => this.#track(t)),
      more_by_artist: more.filter((a) => a.id !== id).slice(0, 4).map((a) => this.#album(a)),
    };
  }

  async track(id: string): Promise<TrackDetail> {
    if (!isUuid(id)) throw notFound('Track');
    const track = await this.#repo.getTrack(id);
    if (!track) throw notFound('Track');
    return { ...this.#track(track), lyrics_available: track.hasLyrics };
  }

  /* ---------- Signals ---------- */

  async recordListen(deviceId: string, events: ListenEventInput[]): Promise<number> {
    const uniqueIds = [...new Set(events.map((e) => e.track_id))];
    const found = await Promise.all(uniqueIds.map((id) => this.#repo.getTrack(id)));
    const missing = uniqueIds.filter((id, index) => found[index] === null);
    if (missing.length > 0) {
      throw new ApiError(
        422,
        'https://resona.dev/problems/validation',
        'Validation failed',
        `Unknown track ids: ${missing.join(', ')}`,
        missing.map((id) => ({ path: 'events.track_id', message: `Unknown track: ${id}` })),
      );
    }

    const now = this.#now();
    return this.#repo.addListenEvents(
      deviceId,
      events.map((e) => ({
        trackId: e.track_id,
        playedAt: e.played_at ? new Date(e.played_at) : now,
        msPlayed: e.ms_played,
        completed: e.completed,
      })),
    );
  }

  async recents(deviceId: string): Promise<RecentsResponse> {
    const since = new Date(this.#now().getTime() - 14 * DAY_MS);
    const events = await this.#repo.getListenEvents(deviceId, since);
    const groups = new Map<string, RecentGroup>();

    for (const event of events) {
      const day = dayKey(event.playedAt, this.#now());
      const group = groups.get(day) ?? { day, items: [] };
      group.items.push({
        track: this.#track(event.track),
        played_at: event.playedAt.toISOString(),
        ms_played: event.msPlayed,
        completed: event.completed,
      });
      groups.set(day, group);
    }

    return { groups: [...groups.values()] };
  }
}

function mergeById<T extends { id: string }>(base: T[], extra: T[]): T[] {
  const map = new Map(base.map((item) => [item.id, item]));
  for (const item of extra) map.set(item.id, item);
  return [...map.values()];
}

function dedupeTracks(tracks: TrackRow[], limit: number): TrackRow[] {
  const seen = new Set<string>();
  const result: TrackRow[] = [];
  for (const track of tracks) {
    if (seen.has(track.id)) continue;
    seen.add(track.id);
    result.push(track);
    if (result.length >= limit) break;
  }
  return result;
}

function dayKey(date: Date, now: Date): string {
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const today = startOf(now);
  const day = startOf(date);
  if (day === today) return 'today';
  if (day === today - DAY_MS) return 'yesterday';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

function notFound(resource: string): ApiError {
  return new ApiError(
    404,
    'https://resona.dev/problems/not-found',
    'Not found',
    `${resource} does not exist.`,
  );
}
