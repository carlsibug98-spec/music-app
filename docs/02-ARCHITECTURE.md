# 02 — System Architecture & Technical Design

**Version:** 1.1 · **Date:** 2026-11-22
**Companion diagrams:** `docs/diagrams/architecture.png`, `docs/diagrams/data-model.png`, `docs/diagrams/roadmap-gantt.png`, `docs/diagrams/personalization-pipeline.png`
**v1.1 = synced to the consolidated blueprint:** five derived personalization tables (§7), five personalization endpoints (§8). Core 11 tables / 24 endpoints unchanged.

---

## 1. System overview

Two native clients (iOS, Android) talk to one custom backend over HTTPS. The backend owns the catalog (via a swappable provider adapter), playlists, likes, recents and lyrics, and hands clients short-lived signed stream URLs. Clients are **local-first**: all user data (playlists, likes, downloads, queue) lives in an on-device database first and syncs to the server so the app keeps working offline.

```
┌─────────────┐   ┌─────────────┐
│  iOS app    │   │ Android app │        Native clients
│ Swift+SwiftUI│  │Kotlin+Compose│       (playback, local DB,
└──────┬──────┘   └──────┬──────┘        downloads, lyrics UI)
       │      HTTPS REST  │
       └───────┬──────────┘
        ┌──────▼───────┐
        │  API (Node)  │        Express + Zod, device-key auth,
        │  /v1/*       │        rate limiting
        └──────┬───────┘
   ┌───────────┼────────────┬──────────────┐
   ▼           ▼            ▼              ▼
Catalog svc  Library svc  Lyrics svc    Sync svc
(adapter)   (playlists,  (LRC fetch,   (delta since)
   │         likes, recents) cache)
   ▼
┌────────────────────────┐   ┌──────────────────────┐
│ PostgreSQL (Prisma)    │   │ YouTube / YT Music   │
│ Object storage (audio, │   │ LRCLIB (lyrics)      │
│ art, LRC for own cat.) │   │ (external providers) │
└────────────────────────┘   └──────────────────────┘
```

## 2. Technology choices and why

| Layer | Choice | Rationale (solo-friendly) |
|-------|--------|---------------------------|
| iOS | Swift 5.9+, SwiftUI, AVFoundation (`AVQueuePlayer`), `MPRemoteCommandCenter` | Modern declarative UI maps 1:1 to the mockup's component model; AVFoundation handles background audio + lock screen with minimal code |
| Android | Kotlin 2.x, Jetpack Compose, Media3 ExoPlayer + `MediaSessionService`, Room | Compose mirrors SwiftUI structurally (shared mental model); Media3 gives queue/shuffle/reorder + notification controls for free |
| Local DB (iOS / Android) | SwiftData (or GRDB) / Room | Mirrored schema; one sync layer each |
| Backend | Node 20 LTS, Express, Prisma ORM, PostgreSQL 16, Zod validation | One language for API + scripts; Prisma migrations are solo-maintainable |
| Storage | S3-compatible object storage (e.g. Cloudflare R2 — zero egress fees) | Own-catalog audio/art/LRC; R2's free egress keeps the app free to run |
| Lyrics | LRC format everywhere; LRCLIB lookup for community lyrics | LRC is trivial to parse on-device; LRCLIB is free (doc 05 §3) |
| Images | Artwork proxied/cached by clients (Kingfisher / Coil) | Offline covers |

**Explicitly rejected:** React Native/Flutter (user chose native); Firebase (user chose custom API); microservices (solo maintainer).

## 3. Repository layout (monorepo)

```
music-app/
├── apps/
│   ├── ios/            # SwiftUI app (Xcode project)
│   └── android/        # Compose app (Gradle)
├── server/             # Node API
│   ├── src/routes/     # /v1 endpoints
│   ├── src/adapters/   # CatalogProvider implementations
│   ├── prisma/schema.prisma
│   └── scripts/
├── packages/
│   ├── api-types/      # TypeScript DTOs (source of truth)
│   └── design-tokens/  # colors/type/motion JSON → generated Swift/Kotlin
├── design/
│   └── reference-mockup.html
└── docs/
```

Design tokens as JSON that generates both platform constants keeps the two apps pixel-consistent (doc 03 §6).

## 4. Catalog provider adapter (the sourcing pattern)

The server never hard-codes where music comes from. Everything behind one interface:

```ts
interface CatalogProvider {
  search(q: string, type: 'song'|'album'|'artist'|'playlist', page: number): Promise<SearchPage>
  getTrack(id: string): Promise<TrackMeta>            // title, artist, duration, art
  getStreamUrl(id: string): Promise<string>           // short-lived playable URL
  getAlbum(id: string): Promise<AlbumMeta>
  getArtist(id: string): Promise<ArtistMeta>          // + top tracks, releases
  getStation(seed: string): Promise<TrackMeta[]>      // radio/autoplay
}
```

**Implementations, in build order:**

1. **`OwnCatalogProvider`** (M0–M1): admin-uploaded audio + LRC + art in object storage; rows in Postgres. Guaranteed to work, zero external risk. This is what the playback milestone is built and tested against.
2. **`YtmProvider`** (M2): metadata + streams resolved from YouTube / YouTube Music the same way OpenSpot and Musify do it (doc 05 documents the exact mechanism and risks). The **server** does the resolution; clients only ever see our API. Benefits: clients stay clean of extractor code, one place to patch when upstream changes, response caching, and catalog rows get persisted so playlists survive source churn.
3. *(later)* **`LicensedProvider`** — if direct artist/label deals ever happen, plug in without touching clients.

**Stream delivery:** `GET /v1/tracks/:id/stream` returns **302 → signed, ~4 h TTL URL** of the upstream stream (zero egress cost for us). A `?proxy=1` mode through our server exists for own-catalog files and for caching popular streams. Stream URLs are resolved lazily at play time and refreshed on 403.

## 5. Playback engines

### 5.1 Shared queue model (both platforms, identical semantics)

- `queue: [Track]`, `currentIndex`, `shuffle: bool`, `repeat: 'off'|'all'|'one'`
- Shuffle = Fisher–Yates permutation stored as `order: IntArray`, so "un-shuffle" restores original order and reorder gestures stay coherent.
- "Play next" inserts at `currentIndex + 1`; "Add to queue" appends.
- Sleep timer pauses with a 3 s fade-out; "end of track" arms a flag checked on track end.

### 5.2 iOS specifics

- `AVAudioSession` category `.playback`, mode `.default`, active on play.
- `AVQueuePlayer` preloads next items → near-gapless playback.
- `MPNowPlayingInfoCenter` + `MPRemoteCommandCenter` for lock screen; artwork via `MPMediaItemArtwork`.
- Progress reporting: `addPeriodicTimeObserver` at 250 ms → drives lyrics + progress bar.

### 5.3 Android specifics

- Media3 ExoPlayer: playlist API natively supports move/remove (queue sheet maps 1:1), `setHandleAudioBecomingNoisy(true)`, audio attributes `USAGE_MEDIA`.
- `MediaSessionService` (foreground) with `MediaSession` → system notification controls, Assistant/Android Auto compatibility for free.
- Progress: polling `currentPosition` at 200 ms via a coroutine ticker (lyrics driver).

## 6. Lyrics pipeline (the −0.5 s rule)

**Format:** standard LRC (`[mm:ss.xx] line text`), multiple timestamps per line allowed.

**Storage:** `lyrics.lrc_text` cached server-side and on-device next to the audio file. Resolution order when a track plays: own catalog LRC → LRCLIB match (artist + title + duration ±2 s) → plain text → none.

**Sync algorithm (client-side, identical on both platforms):**

```
LEAD_MS = -500                      // P4: highlight 0.5 s early
onPositionUpdate(pos):
    t = pos + LEAD_MS               // "effective" lyric clock
    active = last line where line.time <= t
    if active != prevActive:
        render(active)              // white 24px/800
        style past lines → white, future → 50 % opacity
        scroll active to vertical center (animated 200 ms)
onLineTapped(i):
    seek(line[i].time - LEAD_MS + 100ms)   // land just after the line start
```

Offset is user-adjustable in Settings (−2 s … +2 s, default −500 ms). Long-press a lyric line copies it; share pill exports a track link.

## 7. Data model (PostgreSQL via Prisma; client DBs mirror their slice)

| Table | Key columns | Notes |
|-------|-------------|-------|
| `Device` | id (uuid, pk), display_name, platform, api_key_hash, created_at, last_seen_at | The "user". No email, no password |
| `Artist` | id, name, bio, art_url, is_verified, source, external_id | `source` = own \| ytm |
| `Album` | id, title, artist_id →, type (album/single/ep), release_date, art_url | |
| `Track` | id, title, artist_id →, album_id →?, duration_ms, has_lyrics, play_count, source, external_id, explicit | Unique on (source, external_id) |
| `Lyrics` | track_id → (pk), lrc_text, plain_text, offset_ms (default −500), synced (bool), source | |
| `Playlist` | id, device_id →, name, description, cover_url, is_public, sort_order, created_at, updated_at | |
| `PlaylistTrack` | (playlist_id, position) pk, track_id →, added_at | position gaps of 10 for cheap reorder |
| `Like` | (device_id, track_id) pk, liked_at | |
| `LibraryItem` | (device_id, item_type, item_id) pk, saved_at | follows + album/playlist saves |
| `ListenEvent` | id, device_id →, track_id →, played_at, ms_played | recents + home feed |
| `RecentSearch` | id, device_id →, query, submitted_at, result_type | search history |
| `TasteProfile` | (device_id, artist_id) pk, plays, skips, likes, last_played_at, affinity | **derived, lands M5** — seeded by taste picker (D-011) |
| `ListenerState` | device_id (pk), state, signals (json), entered_at | **derived, lands M5** — new / casual / regular / super-fan |
| `DailyListenStat` | (device_id, day) pk, plays, minutes | **derived, lands M5** — nightly rollup of ListenEvent |
| `ShelfSnapshot` | (device_id, shelf_id, rank) pk, payload (json), built_at | **derived, lands M5** — adaptive home output |
| `ChartSnapshot` | (scope, window_start, rank) pk, track_id →, plays | **derived, lands M5** — global + personal Top 50 |

ER diagram: `docs/diagrams/data-model.png` (core tables; the five derived personalization tables are specified in blueprint v1.1 Ch. 4 and land in the Prisma schema at M5).

## 8. API surface (v1) — 29 endpoints (24 core + 5 personalization)

All requests carry `X-Device-Key` (issued once at registration). Errors use RFC 7807 JSON. Everything is versioned `/v1`.

| Method & path | Purpose |
|---------------|---------|
| `POST /v1/devices` | Register: {display_name, platform} → {device_id, device_key} |
| `GET /v1/home` | Personalized sections (quick grid, card rows) |
| `GET /v1/search/suggest?q=` | Prefix suggestions (< 300 ms, cached) |
| `GET /v1/search?q=&type=&limit=&offset=` | Typed results |
| `GET /v1/browse/genres` | Genre/category tiles |
| `GET /v1/browse/genres/:id` | Playlists for a genre |
| `GET /v1/stations/:seed` | Radio track list |
| `GET /v1/tracks/:id` | Track metadata |
| `GET /v1/tracks/:id/stream` | 302 → signed stream URL |
| `GET /v1/tracks/:id/lyrics` | LRC + offset |
| `GET /v1/artists/:id` | Artist + top tracks + releases |
| `GET /v1/albums/:id` | Album + tracks |
| `GET /v1/playlists` | My playlists |
| `POST /v1/playlists` | Create |
| `PATCH /v1/playlists/:id` | Rename / description / cover / privacy / sort |
| `DELETE /v1/playlists/:id` | Delete |
| `POST /v1/playlists/:id/tracks` | Add tracks {track_ids[], position?} |
| `DELETE /v1/playlists/:id/tracks/:trackId` | Remove track |
| `PATCH /v1/playlists/:id/order` | Persist new order {track_id, position}[] |
| `PUT /v1/likes/:trackId` · `DELETE /v1/likes/:trackId` | Like / unlike |
| `GET /v1/library?include=` | Playlists, followed artists, saved albums |
| `PUT /v1/library/:type/:id` · `DELETE …` | Follow / save / unfollow / unsave |
| `POST /v1/events/listen` | Batched listen events (offline replay) |
| `GET /v1/recents` | Grouped recents feed |
| `POST /v1/me/taste` | Taste picker submit {artist_ids[]} (≥ 3) — seeds TasteProfile (M5) |
| `GET /v1/home/shelves` | Adaptive home: shelves + payloads for the listener state (M5) |
| `GET /v1/charts?scope=&window=` | Global or personal Top 50 snapshot (M5) |
| `GET /v1/artists/:id/similar` | Similar artists (taste-space neighbors) (M5) |
| `GET /v1/me/state` | Current listener state + signal summary (M5) |

OpenAPI 3.1 spec is an M0 deliverable (single source of truth for `packages/api-types`). All 29 contracts are declared now; the five personalization endpoints are implemented in M5 together with the nightly scoring job (D-011), while the core 24 ship in M0.

## 9. Sync strategy (no-login, local-first)

1. Every mutation writes locally **first**, tagged with `synced=false`, then POSTs to the server.
2. Failed writes retry with exponential backoff (max 24 h), then queue on disk.
3. `GET /v1/sync?since=<iso>` (v1.1) returns server-side changes for multi-device — MVP is single-device, so sync exists but is not user-visible.
4. Conflict rule: **last-write-wins** on playlists (simple, predictable); likes are set-union.

## 10. Downloads & offline

- Download manager writes to app-sandboxed storage (Android: user-pickable via SAF on first download).
- Each download = audio + LRC + artwork, stored as track-keyed files plus a Room/SwiftData row with state (`queued/downloading/done/failed`), so lyrics and covers work offline.
- Own-catalog: permanent file download. YtmProvider: time-limited encrypted cache (refreshed when online) — the honest middle ground between "free downloads" (P2) and source ToS (doc 05 §2); expiry default 30 days, configurable.
- Storage usage + "clear downloads" in Settings; download over cellular gated by data-saver setting.

## 11. Security & privacy

- Device key generated server-side (32-byte random), stored in Keychain / EncryptedSharedPreferences, sent as `X-Device-Key`; hashed at rest.
- Rate limit: 60 req/min/device, 10 stream resolutions/min (abuse guard).
- No PII beyond display name; logs strip names; no third-party SDKs (P3).
- Stream URLs signed (HMAC, 4 h TTL) so our API is never an open proxy.
- Dependency audit in CI (`npm audit`, `gradle dependencyCheck`) — solo projects rot; automate the boring guardrails.

## 12. Deployment & operations (solo-realistic)

- API: one small VM or container (Fly.io/Railway ~$5–10/mo, or free tier to start) + managed Postgres (Neon/Supabase-pg) + R2.
- CI: GitHub Actions — lint+test+build on PR; Android APK artifact on main; server Docker image on tag.
- Crash reporting: self-hosted-able (e.g. GlitchTip/Sentry self-host) or none in MVP; crash-free target enforced in M5.
- Uptime: it's a hobby scale — one health endpoint, GitHub Actions cron ping every 30 min, email on fail.
