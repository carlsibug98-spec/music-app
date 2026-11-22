/**
 * YTM adapter (M1) — behind CATALOG_YTM_ENABLED.
 *
 * The resolver itself is a separate sidecar (the mechanism is documented in
 * doc 05 and is deliberately not part of the API process). This provider owns
 * the 24 h cache and the failure contract: a resolver error returns the last
 * cached payload when one exists, otherwise it throws so the catalog service
 * can serve own rows and flag the response as degraded (R-01 fallback).
 */
import { z } from 'zod';
import type { SearchType } from '@resona/api-types';
import type { ExternalCatalog } from '../catalog/types.js';

const artistSchema = z.object({
  external_id: z.string().min(1),
  name: z.string().min(1),
  art_url: z.string().nullish(),
  genres: z.array(z.string()).optional(),
});

const albumSchema = z.object({
  external_id: z.string().min(1),
  title: z.string().min(1),
  artist_external_id: z.string().min(1),
  type: z.enum(['album', 'single', 'ep']).default('album'),
  release_date: z.string().nullish(),
  art_url: z.string().nullish(),
});

const trackSchema = z.object({
  external_id: z.string().min(1),
  title: z.string().min(1),
  artist_external_id: z.string().min(1),
  album_external_id: z.string().nullish(),
  duration_ms: z.number().int().nonnegative(),
  art_url: z.string().nullish(),
  genres: z.array(z.string()).optional(),
});

const payloadSchema = z.object({
  artists: z.array(artistSchema).default([]),
  albums: z.array(albumSchema).default([]),
  tracks: z.array(trackSchema).default([]),
});

export class YtmUnavailableError extends Error {
  constructor(message = 'YTM resolver is not configured') {
    super(message);
    this.name = 'YtmUnavailableError';
  }
}

export interface YtmProvider {
  isAvailable(): boolean;
  search(q: string, type: SearchType | 'all', limit: number): Promise<ExternalCatalog>;
}

interface CacheEntry {
  expiresAt: number;
  payload: ExternalCatalog;
}

export interface YtmProviderOptions {
  enabled: boolean;
  resolverUrl?: string;
  ttlMs?: number;
  fetchImpl?: typeof fetch;
  now?: () => number;
  maxEntries?: number;
}

export class HttpYtmProvider implements YtmProvider {
  readonly #enabled: boolean;
  readonly #resolverUrl: string | undefined;
  readonly #ttlMs: number;
  readonly #fetch: typeof fetch;
  readonly #now: () => number;
  readonly #maxEntries: number;
  readonly #cache = new Map<string, CacheEntry>();

  constructor(options: YtmProviderOptions) {
    this.#enabled = options.enabled;
    this.#resolverUrl = options.resolverUrl?.replace(/\/+$/, '');
    this.#ttlMs = options.ttlMs ?? 24 * 60 * 60 * 1000;
    this.#fetch = options.fetchImpl ?? fetch;
    this.#now = options.now ?? Date.now;
    this.#maxEntries = options.maxEntries ?? 500;
  }

  isAvailable(): boolean {
    return this.#enabled && Boolean(this.#resolverUrl);
  }

  async search(q: string, type: SearchType | 'all', limit: number): Promise<ExternalCatalog> {
    if (!this.isAvailable() || !this.#resolverUrl) throw new YtmUnavailableError();

    const key = `${type}:${q.trim().toLowerCase()}:${limit}`;
    const cached = this.#cache.get(key);

    try {
      const url = new URL(`${this.#resolverUrl}/search`);
      url.searchParams.set('q', q);
      url.searchParams.set('type', type);
      url.searchParams.set('limit', String(limit));

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      let response: Response;
      try {
        response = await this.#fetch(url, {
          signal: controller.signal,
          headers: { accept: 'application/json' },
        });
      } finally {
        clearTimeout(timer);
      }

      if (!response.ok) {
        throw new Error(`YTM resolver returned ${response.status}`);
      }

      const parsed = payloadSchema.parse(await response.json());
      const payload: ExternalCatalog = {
        artists: parsed.artists.map((a) => ({
          externalId: a.external_id,
          name: a.name,
          artUrl: a.art_url ?? null,
          genres: a.genres ?? [],
        })),
        albums: parsed.albums.map((a) => ({
          externalId: a.external_id,
          title: a.title,
          artistExternalId: a.artist_external_id,
          type: a.type,
          releaseDate: a.release_date ?? null,
          artUrl: a.art_url ?? null,
        })),
        tracks: parsed.tracks.map((t) => ({
          externalId: t.external_id,
          title: t.title,
          artistExternalId: t.artist_external_id,
          albumExternalId: t.album_external_id ?? null,
          durationMs: t.duration_ms,
          artUrl: t.art_url ?? null,
          genres: t.genres ?? [],
        })),
      };

      this.#remember(key, payload);
      return payload;
    } catch (err) {
      // Stale cache beats an empty screen: the adapter's contract is "never crash".
      if (cached) {
        console.warn(`[ytm] resolver failed, serving cached payload for "${q}":`, err);
        return cached.payload;
      }
      throw err;
    }
  }

  #remember(key: string, payload: ExternalCatalog): void {
    if (this.#cache.size >= this.#maxEntries) {
      const oldest = this.#cache.keys().next().value;
      if (oldest) this.#cache.delete(oldest);
    }
    this.#cache.set(key, { expiresAt: this.#now() + this.#ttlMs, payload });
    const now = this.#now();
    for (const [k, entry] of this.#cache) {
      if (entry.expiresAt <= now) this.#cache.delete(k);
    }
  }
}
