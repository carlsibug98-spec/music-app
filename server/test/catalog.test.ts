import { describe, it, expect } from 'vitest';
import request from 'supertest';
import type { YtmProvider } from '../src/adapters/ytmProvider.js';
import { makeTestApp, registerDevice } from './testApp.js';

async function authedApp(ytm?: YtmProvider) {
  const ctx = makeTestApp(ytm);
  const key = await registerDevice(ctx.app);
  return { ...ctx, key };
}

describe('device auth', () => {
  it('rejects catalog calls without a device key', async () => {
    const { app } = makeTestApp();
    const res = await request(app).get('/v1/home');
    expect(res.status).toBe(401);
    expect(res.body.type).toBe('https://resona.dev/problems/unauthorized');
  });

  it('rejects an unknown device key', async () => {
    const { app } = makeTestApp();
    const res = await request(app)
      .get('/v1/home')
      .set('X-Device-Key', 'not-a-real-key');
    expect(res.status).toBe(401);
  });

  it('accepts a registered device key', async () => {
    const { app, key } = await authedApp();
    const res = await request(app).get('/v1/home').set('X-Device-Key', key);
    expect(res.status).toBe(200);
  });
});

describe('GET /v1/search/suggest', () => {
  it('returns a submit row plus matching song, album and artist rows', async () => {
    const { app, key } = await authedApp();
    const res = await request(app)
      .get('/v1/search/suggest')
      .query({ q: 'panata' })
      .set('X-Device-Key', key);

    expect(res.status).toBe(200);
    expect(res.body.query).toBe('panata');
    const types = res.body.suggestions.map((s: { type: string }) => s.type);
    expect(types[0]).toBe('query');
    expect(types).toContain('song');
    expect(types).toContain('album');
    expect(res.body.suggestions.length).toBeLessThanOrEqual(8);
    expect(
      res.body.suggestions.find((s: { type: string }) => s.type === 'song')?.subtitle,
    ).toContain('Bakunawa');
  });

  it('puts the matching artist first for an artist query', async () => {
    const { app, key } = await authedApp();
    const res = await request(app)
      .get('/v1/search/suggest')
      .query({ q: 'bakunawa' })
      .set('X-Device-Key', key);

    expect(res.status).toBe(200);
    const first = res.body.suggestions[1];
    expect(first.type).toBe('artist');
    expect(first.text).toBe('Bakunawa');
  });

  it('is stable across repeated queries (cache path)', async () => {
    const { app, key } = await authedApp();
    const first = await request(app)
      .get('/v1/search/suggest')
      .query({ q: 'ulan' })
      .set('X-Device-Key', key);
    const second = await request(app)
      .get('/v1/search/suggest')
      .query({ q: 'ulan' })
      .set('X-Device-Key', key);

    expect(second.status).toBe(200);
    expect(second.body).toEqual(first.body);
  });

  it('rejects an empty query with a 422 problem', async () => {
    const { app, key } = await authedApp();
    const res = await request(app)
      .get('/v1/search/suggest')
      .query({ q: '   ' })
      .set('X-Device-Key', key);

    expect(res.status).toBe(422);
    expect(res.body.type).toBe('https://resona.dev/problems/validation');
  });
});

describe('GET /v1/search', () => {
  it('returns songs, albums and artists with a total', async () => {
    const { app, key } = await authedApp();
    const res = await request(app)
      .get('/v1/search')
      .query({ q: 'panata' })
      .set('X-Device-Key', key);

    expect(res.status).toBe(200);
    expect(res.body.degraded).toBe(false);
    expect(res.body.songs.length).toBeGreaterThan(0);
    expect(res.body.albums[0].title).toBe('Panata');
    expect(res.body.total).toBe(
      res.body.songs.length + res.body.albums.length + res.body.artists.length,
    );
  });

  it('filters by type=song', async () => {
    const { app, key } = await authedApp();
    const res = await request(app)
      .get('/v1/search')
      .query({ q: 'bakunawa', type: 'song' })
      .set('X-Device-Key', key);

    expect(res.status).toBe(200);
    expect(res.body.songs.length).toBe(3);
    expect(res.body.albums).toEqual([]);
    expect(res.body.artists).toEqual([]);
  });

  it('shows an artist header when the query names an artist', async () => {
    const { app, key } = await authedApp();
    const res = await request(app)
      .get('/v1/search')
      .query({ q: 'bakunawa' })
      .set('X-Device-Key', key);

    expect(res.status).toBe(200);
    expect(res.body.artist_header.name).toBe('Bakunawa');
    expect(res.body.artists[0].name).toBe('Bakunawa');
  });

  it('paginates each result group', async () => {
    const { app, key } = await authedApp();
    const res = await request(app)
      .get('/v1/search')
      .query({ q: 'a', limit: 1, offset: 1 })
      .set('X-Device-Key', key);

    expect(res.status).toBe(200);
    expect(res.body.limit).toBe(1);
    expect(res.body.offset).toBe(1);
    expect(res.body.songs.length).toBeLessThanOrEqual(1);
  });
});

describe('browse, home and detail', () => {
  it('returns a personalized home with rows and no duplicates in the quick grid', async () => {
    const { app, key } = await authedApp();
    const res = await request(app).get('/v1/home').set('X-Device-Key', key);

    expect(res.status).toBe(200);
    expect(res.body.greeting).toContain('Test Device');
    expect(res.body.quick_grid.length).toBeGreaterThan(0);
    const ids = res.body.quick_grid.map((c: { id: string }) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(res.body.rows.map((r: { key: string }) => r.key)).toContain('made_for_you');
  });

  it('lists genres with featured categories first and OPM on top', async () => {
    const { app, key } = await authedApp();
    const res = await request(app).get('/v1/browse/genres').set('X-Device-Key', key);

    expect(res.status).toBe(200);
    const genres = res.body.genres as { id: string; featured: boolean }[];
    expect(genres[0].id).toBe('opm');
    expect(genres[0].featured).toBe(true);
    expect(genres.filter((g) => g.featured).length).toBe(5);
  });

  it('returns genre tracks and 404s an unknown genre', async () => {
    const { app, key } = await authedApp();
    const ok = await request(app)
      .get('/v1/browse/genres/hugot')
      .set('X-Device-Key', key);
    expect(ok.status).toBe(200);
    expect(ok.body.genre.name).toBe('Hugot');
    expect(ok.body.tracks.length).toBe(3);

    const missing = await request(app)
      .get('/v1/browse/genres/not-a-genre')
      .set('X-Device-Key', key);
    expect(missing.status).toBe(404);
  });

  it('returns an artist with top tracks and releases', async () => {
    const { app, key } = await authedApp();
    const list = await request(app)
      .get('/v1/search')
      .query({ q: 'bakunawa', type: 'artist' })
      .set('X-Device-Key', key);
    const id = list.body.artists[0].id;

    const res = await request(app).get(`/v1/artists/${id}`).set('X-Device-Key', key);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Bakunawa');
    expect(res.body.top_tracks[0].title).toBe('Panata');
    expect(res.body.releases[0].title).toBe('Panata');
    expect(res.body.monthly_listeners).toBe(0);
  });

  it('returns an album with tracks in order', async () => {
    const { app, key } = await authedApp();
    const list = await request(app)
      .get('/v1/search')
      .query({ q: 'panata', type: 'album' })
      .set('X-Device-Key', key);
    const id = list.body.albums[0].id;

    const res = await request(app).get(`/v1/albums/${id}`).set('X-Device-Key', key);
    expect(res.status).toBe(200);
    expect(res.body.tracks.map((t: { title: string }) => t.title)).toEqual([
      'Panata',
      'Tala',
      'Silid',
    ]);
    expect(res.body.more_by_artist).toEqual([]);
  });

  it('builds a station from an artist seed', async () => {
    const { app, key } = await authedApp();
    const list = await request(app)
      .get('/v1/search')
      .query({ q: 'neon kapre', type: 'artist' })
      .set('X-Device-Key', key);
    const id = list.body.artists[0].id;

    const res = await request(app).get(`/v1/stations/${id}`).set('X-Device-Key', key);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Neon Kapre Radio');
    expect(res.body.tracks.length).toBeGreaterThanOrEqual(2);
    expect(new Set(res.body.tracks.map((t: { id: string }) => t.id)).size).toBe(
      res.body.tracks.length,
    );
  });

  it('builds a genre station from a slug', async () => {
    const { app, key } = await authedApp();
    const res = await request(app).get('/v1/stations/chill').set('X-Device-Key', key);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Chill Radio');
    expect(res.body.tracks.length).toBe(3);
  });

  it('404s unknown detail ids', async () => {
    const { app, key } = await authedApp();
    const id = '00000000-0000-4000-8000-000000000000';
    for (const path of [`/v1/artists/${id}`, `/v1/albums/${id}`, `/v1/tracks/${id}`]) {
      const res = await request(app).get(path).set('X-Device-Key', key);
      expect(res.status).toBe(404);
      expect(res.body.type).toBe('https://resona.dev/problems/not-found');
    }
  });

  it('404s non-UUID ids instead of failing the store', async () => {
    const { app, key } = await authedApp();
    const res = await request(app)
      .get('/v1/artists/not-a-uuid')
      .set('X-Device-Key', key);
    expect(res.status).toBe(404);
  });
});

describe('listen events and recents', () => {
  it('records events once and groups recents under today', async () => {
    const { app, key } = await authedApp();
    const search = await request(app)
      .get('/v1/search')
      .query({ q: 'susundan' })
      .set('X-Device-Key', key);
    const track = search.body.songs[0];

    const post = await request(app)
      .post('/v1/events/listen')
      .set('X-Device-Key', key)
      .send({
        events: [
          { track_id: track.id, ms_played: 12_000, completed: false },
          { track_id: track.id, ms_played: 42_000, completed: true },
        ],
      });
    expect(post.status).toBe(202);
    expect(post.body.accepted).toBe(2);

    const recents = await request(app).get('/v1/recents').set('X-Device-Key', key);
    expect(recents.status).toBe(200);
    expect(recents.body.groups[0].day).toBe('today');
    expect(recents.body.groups[0].items[0].track.title).toBe('Susundan');

    // The just-played track leads the home recent row.
    const home = await request(app).get('/v1/home').set('X-Device-Key', key);
    expect(home.body.rows[0].key).toBe('recent_rotation');
  });

  it('rejects unknown track ids with a 422 problem', async () => {
    const { app, key } = await authedApp();
    const res = await request(app)
      .post('/v1/events/listen')
      .set('X-Device-Key', key)
      .send({
        events: [
          {
            track_id: '00000000-0000-4000-8000-000000000000',
            ms_played: 1000,
            completed: false,
          },
        ],
      });
    expect(res.status).toBe(422);
    expect(res.body.errors?.[0]?.path).toBe('events.track_id');
  });

  it('validates the event payload', async () => {
    const { app, key } = await authedApp();
    const res = await request(app)
      .post('/v1/events/listen')
      .set('X-Device-Key', key)
      .send({ events: [] });
    expect(res.status).toBe(422);
  });

  it('keeps recents per device', async () => {
    const ctx = makeTestApp();
    const keyA = await registerDevice(ctx.app, 'A');
    const keyB = await registerDevice(ctx.app, 'B');
    const search = await request(ctx.app)
      .get('/v1/search')
      .query({ q: 'alon' })
      .set('X-Device-Key', keyA);
    await request(ctx.app)
      .post('/v1/events/listen')
      .set('X-Device-Key', keyA)
      .send({
        events: [
          { track_id: search.body.songs[0].id, ms_played: 1000, completed: false },
        ],
      });

    const other = await request(ctx.app).get('/v1/recents').set('X-Device-Key', keyB);
    expect(other.status).toBe(200);
    expect(other.body.groups).toEqual([]);
  });
});

describe('YTM adapter', () => {
  it('serves own rows and flags degraded when the adapter fails', async () => {
    const failing: YtmProvider = {
      isAvailable: () => true,
      search: async () => {
        throw new Error('resolver down');
      },
    };
    const { app, key } = await authedApp(failing);
    const res = await request(app)
      .get('/v1/search')
      .query({ q: 'panata' })
      .set('X-Device-Key', key);

    expect(res.status).toBe(200);
    expect(res.body.degraded).toBe(true);
    expect(res.body.songs.length).toBeGreaterThan(0);
  });

  it('merges and persists external results when the adapter works', async () => {
    const working: YtmProvider = {
      isAvailable: () => true,
      search: async () => ({
        artists: [
          { externalId: 'ytm-artist-luna', name: 'Luna Reyes', genres: ['OPM'] },
        ],
        albums: [
          {
            externalId: 'ytm-album-luna',
            title: 'Luna',
            artistExternalId: 'ytm-artist-luna',
            type: 'album',
          },
        ],
        tracks: [
          {
            externalId: 'ytm-track-luna',
            title: 'Luna',
            artistExternalId: 'ytm-artist-luna',
            albumExternalId: 'ytm-album-luna',
            durationMs: 180_000,
          },
        ],
      }),
    };
    const ctx = makeTestApp(working);
    const key = await registerDevice(ctx.app);

    const res = await request(ctx.app)
      .get('/v1/search')
      .query({ q: 'luna' })
      .set('X-Device-Key', key);

    expect(res.status).toBe(200);
    expect(res.body.degraded).toBe(false);
    expect(res.body.artists[0].name).toBe('Luna Reyes');
    expect(res.body.songs[0].title).toBe('Luna');
    expect(res.body.albums[0].title).toBe('Luna');
    expect(ctx.repository.tracks.some((t) => t.title === 'Luna')).toBe(true);
  });

  it('does not call the adapter for playlist-only searches', async () => {
    let called = 0;
    const provider: YtmProvider = {
      isAvailable: () => true,
      search: async () => {
        called += 1;
        return { artists: [], albums: [], tracks: [] };
      },
    };
    const { app, key } = await authedApp(provider);
    const res = await request(app)
      .get('/v1/search')
      .query({ q: 'panata', type: 'playlist' })
      .set('X-Device-Key', key);
    expect(res.status).toBe(200);
    expect(called).toBe(0);
    expect(res.body.playlists).toEqual([]);
  });
});
