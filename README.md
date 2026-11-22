# Tugtugin (working title)

A **free, ad-free, no-login music app** for iOS and Android, built natively, with synced lyrics that lead the vocal by 0.5 seconds.

You open it, type your name once, and start listening. No account, no email, no ads, no premium tier. Songs stream (and download for free) through the same source OpenSpot and Musify use — YouTube / YouTube Music — behind a swappable server-side adapter, with an own-catalog fallback that is always store-safe.

> **Tugtugin** is Tagalog for "music / the playing of instruments" — a working title; final name is decision D-009 (see `PROGRESS.md`).

## Status

**Phase: M0 (Foundations) — code complete.** Scaffold, design-token pipeline, server core, both app skeletons, CI, and OpenAPI are in. See `PROGRESS.md`. Master plan: `docs/blueprints/` (38-page PDF, 26 weeks, M0–M6).

## Quick start

```bash
npm install                      # all workspaces
docker compose up -d             # Postgres 16 on :5432
cp server/.env.example server/.env
npm run dev                      # API on :3000
curl localhost:3000/healthz

npm test -w @resona/server       # 10 tests
npm run tokens                   # regenerate Kotlin+Swift tokens
npm run test:tracks              # 10 seed tracks -> local-media/ (ffmpeg)
```

Android: open `apps/android` in Android Studio. iOS: `cd apps/ios && xcodegen generate`, open `Resona.xcodeproj`.

## Repository map

| Path | What it is |
|------|------------|
| `design/reference-mockup.html` | The interactive UI mockup this whole project is built from (25 screens: Home, Search, Now Playing, lyrics, playlists, artist/album, Library, profile, settings) |
| `docs/01-PRD.md` | Product requirements: principles, scope cut-line, screen inventory, user stories, FR/NFRs |
| `docs/02-ARCHITECTURE.md` | System design: stack, adapter pattern, playback engines, data model, 24-endpoint API |
| `docs/03-DESIGN-SYSTEM.md` | Every token, component, and motion spec extracted from the mockup |
| `docs/04-ROADMAP.md` | Milestones M0–M5, week by week, solo part-time |
| `docs/05-RESEARCH.md` | How OpenSpot/Musify source music, and the honest legal/distribution analysis |
| `docs/06-RISK-REGISTER.md` | 12 scored risks with mitigations and triggers |
| `docs/diagrams/` | Architecture, data-model, personalization-pipeline, and roadmap diagrams |
| `docs/blueprints/` | The consolidated PDF creation blueprint |
| `apps/ios` · `apps/android` | Native clients (SwiftUI · Compose) |
| `server/` | Node API: Express + Zod + Prisma, `openapi.yaml` |
| `packages/` | `design-tokens` (JSON → Kotlin/Swift), `api-types` (shared DTOs) |
| `local-media/` | Regenerated test tracks (gitignored) |

## The five fixed principles

1. **No login, ever** — one-time display name, silent device registration
2. **Free downloads** — offline playback at no cost
3. **No ads, no tracking** — zero ad SDKs, zero third-party trackers
4. **Lyrics lead by 0.5 s** — every line highlights 500 ms before the vocal, tap any line to seek
5. **OpenSpot/Musify-style sourcing** — YouTube Music via a server-side adapter, own-catalog fallback

## Stack at a glance

- **iOS:** Swift + SwiftUI + AVFoundation
- **Android:** Kotlin + Jetpack Compose + Media3 ExoPlayer
- **Backend:** Node 20 + Express + Prisma + PostgreSQL 16 (custom API, per design decision)
- **Storage:** S3-compatible object storage (zero-egress)
- **Lyrics:** LRC format, client-side sync engine (−500 ms default lead)

## Working agreement

Solo builder + AI pairing, evenings and weekends. Progress is tracked in `PROGRESS.md` — every completed item, decision, and change lands there.

## License

TBD (decision D-010). No third-party media will ever be committed to this repository.
