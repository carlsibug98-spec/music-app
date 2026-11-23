# Tugtugin

A **free, ad-free, no-login music app** for iOS and Android, built natively, with synced lyrics that lead the vocal by 0.5 seconds.

You open it, type your name once, and start listening. No account, no email, no ads, no premium tier. Songs stream (and download for free) through the same source OpenSpot and Musify use — YouTube / YouTube Music — behind a swappable server-side adapter, with an own-catalog fallback that is always store-safe.

> **Tugtugin** is Tagalog for "music / the playing of instruments." Final name per D-009; Resona stays the internal code identity until the M6 rename.

## Status

**Phase: M1 (Catalog & search) — code complete, verification in flight.** The server ships the catalog, search/suggest, home, genre, station, artist/album/track, recents and listen-event APIs on Prisma (38 tests). Android ships name-only onboarding plus Home, Search (idle/typing/results with type chips), Artist, Album, Single, Genre and Radio screens, verified end-to-end on the TECNO LJ6 against the live API. iOS M1 UI is deferred: there is no macOS host to build or verify from this Windows machine, so the shared API and design layers are ready but the SwiftUI screens stay unverified until a Mac is available. See `PROGRESS.md` and the M1 pull request for the exact verified SHA. Master plan: the v1.1 specs in `docs/01`–`docs/06` and the v1.1 PDF blueprint (26 weeks, M0–M6).

## Quick start

```bash
npm install                      # all workspaces
docker compose up -d             # Postgres 16 on :5432
cp server/.env.example server/.env
npm run prisma:generate -w @resona/server
npm run db:setup -w @resona/server   # migrate deploy + seed 4 artists / 4 albums / 10 tracks
npm run dev                      # API on :3000
curl localhost:3000/healthz

npm test -w @resona/server       # 38 tests
npm run lint -w @resona/server
npm run tokens                   # regenerate Kotlin+Swift tokens
npm run test:tracks              # 10 seed tracks -> local-media/ (ffmpeg)
```

Android: open `apps/android` in Android Studio, or build with Gradle. The API host is injected at build time:

```bash
adb reverse tcp:3000 tcp:3000            # physical device reaches the dev API
cd apps/android
gradle assembleDebug -Presona.apiBaseUrl=http://127.0.0.1:3000
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

The default host is `http://10.0.2.2:3000` (emulator loopback to the host). iOS: `cd apps/ios && xcodegen generate`, open `Resona.xcodeproj`.

## Repository map

| Path | What it is |
|------|------------|
| `design/reference-mockup.html` | The interactive UI mockup this whole project is built from (25 screens: Home, Search, Now Playing, lyrics, playlists, artist/album, Library, profile, settings) |
| `docs/01-PRD.md` | Product requirements: principles, scope cut-line, screen inventory, user stories, FR/NFRs |
| `docs/02-ARCHITECTURE.md` | System design: stack, adapter pattern, playback engines, 11 core + 5 derived tables, 29-endpoint API |
| `docs/03-DESIGN-SYSTEM.md` | Every token, component, and motion spec extracted from the mockup |
| `docs/04-ROADMAP.md` | Milestones M0–M6, week by week, solo part-time |
| `docs/05-RESEARCH.md` | How OpenSpot/Musify source music, and the honest legal/distribution analysis |
| `docs/06-RISK-REGISTER.md` | 14 scored risks with mitigations and triggers |
| `docs/diagrams/` | Architecture, data-model, personalization-pipeline, and roadmap diagrams |
| `docs/blueprints/` | v1.1 PDF blueprint + reproducible toolchain; markdown docs 01–06 are the living spec |
| `apps/ios` · `apps/android` | Native clients (SwiftUI · Compose) |
| `server/` | Node API: Express + Zod + Prisma, `openapi.yaml`; catalog/search adapters + routes live in `server/src/catalog` |
| `packages/` | `design-tokens` (JSON → Kotlin/Swift), `api-types` (shared DTOs) |
| `local-media/` | Regenerated test tracks (gitignored) |

## The six fixed principles

1. **No login, ever** — one-time display name, silent device registration
2. **Free downloads** — offline playback at no cost
3. **No ads, no tracking** — zero ad SDKs, zero third-party trackers
4. **Lyrics lead by 0.5 s** — every line highlights 500 ms before the vocal, tap any line to seek
5. **OpenSpot/Musify-style sourcing** — YouTube Music via a server-side adapter, own-catalog fallback
6. **Personal, not algorithmic** — rules-based recommendations over your own listening, explainable reasons, no ML service, taste reset any time

## Stack at a glance

- **iOS:** Swift + SwiftUI + AVFoundation
- **Android:** Kotlin + Jetpack Compose + Media3 ExoPlayer
- **Backend:** Node 20 + Express + Prisma + PostgreSQL 16 (custom API, per design decision)
- **Storage:** S3-compatible object storage (zero-egress)
- **Lyrics:** LRC format, client-side sync engine (−500 ms default lead)

## Working agreement

Solo builder + AI pairing, evenings and weekends. Progress is tracked in `PROGRESS.md` — every completed item, decision, and change lands there.

## License

MIT — see [`LICENSE`](LICENSE). No third-party media will ever be committed to this repository.
