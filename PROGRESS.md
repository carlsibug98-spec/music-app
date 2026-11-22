# PROGRESS

Living status board — updated at every milestone gate and whenever a decision is made. Last updated: **2026-11-22**.

---

## Status board

| Workstream | Status | Notes |
|------------|--------|-------|
| UI mockup (25 screens) | **Done** | `design/reference-mockup.html` |
| Product requirements (PRD) | **Done (v1.1)** | `docs/01-PRD.md` — v1.1: FR-16..21 + S-31..S-33 now in the markdown (D-011 personalization) |
| System architecture | **Done (v1.1)** | `docs/02-ARCHITECTURE.md` — v1.1: 5 derived tables, nightly pipeline, 29 endpoint contracts |
| Design system | **Done (v1.0)** | `docs/03-DESIGN-SYSTEM.md` |
| Roadmap | **Done (v1.1)** | PDF blueprint is master: M0-M6, 26 weeks; markdown doc 04 synced to v1.1 |
| Sourcing research + legal | **Done (v1.0)** | `docs/05-RESEARCH.md` |
| Risk register | **Done (v1.1)** | doc 06 synced: R-10/R-11 present, R-13/R-14 added for personalization |
| Personalization engine spec | **Done (v1.1)** | Blueprint Ch. 4.2 + doc 01 FR-18..21 + doc 02 §7/§8: states, signals, nightly job, shelves, charts |
| Diagrams (architecture, ER, pipeline, gantt) | **Done** | `docs/diagrams/` — roadmap gantt regenerated to the 26-week v1.1 plan |
| Consolidated PDF blueprint | **Done (v1.1)** | `docs/blueprints/music-app-creation-blueprint.pdf` — v1.1 committed in-repo (18 pages, A4); toolchain in `docs/blueprints/toolchain/` is the build source |
| M0 — Foundations | **Done** | All checklist items including the demo video; CI verifies Android build on every push |
| M1 — Catalog + search | **Code complete — PR open** | Server catalog/search/home/genres/station/recents/listen on Prisma (38 tests) + Android onboarding/Home/Search/Artist/Album/Single/Genre/Radio, smoke-verified on the TECNO LJ6. iOS M1 screens deferred (D-015); final D-012 CI/artifact check pending |
| M2 — Playback core | Not started | wks 9–13 |
| M3 — Library, playlists, taste picker | Not started | wks 14–17 |
| M4 — Lyrics + offline | Not started | wks 18–21 |
| M5 — Personalization + charts | Not started | wks 22–24 |
| M6 — Deploy + friend rollout | Not started | wks 25–26 |

## M0 checklist — complete

- [x] Monorepo scaffold: `apps/ios`, `apps/android`, `server`, `packages/api-types`, `packages/design-tokens`
- [x] Express server: `GET /healthz`, `POST /v1/devices` (in-memory stub, M1 swaps in Prisma), Zod validation, RFC 7807 error envelope — 10 tests green
- [x] Prisma schema v1 (11 tables from doc 02 §7) + init migration SQL + `docker compose up`
- [x] Xcode (XcodeGen `project.yml`) + Gradle projects with token-generated theme (doc 03 §6), Home screen skeletons — Android compiled by CI on push
- [x] GitHub Actions: lint + typecheck + tests + prisma validate; APK artifact on main (iOS job intentionally omitted — macOS runners aren't free on private repos)
- [x] OpenAPI 3.1 skeleton for the 29 endpoint contracts (`server/openapi.yaml`)
- [x] 10 own-catalog test tracks prepared (audio + LRC + art + manifest) — `npm run test:tracks`, gitignored; verified 10/10 on 2026-11-22
- [x] MIT license added (`LICENSE`, all `package.json` files) — closes D-010
- [x] First 30-second demo video of the week — `docs/demo-scripts/2026-11-22-m0.mp4` (real phone, real CI run, real test output)

## M1 checklist — code complete (verification in flight)

**Server (Postgres + Prisma):**
- [x] Device store swapped to Prisma; `X-Device-Key` required on all catalog routes; 401 RFC 7807 envelope; keys hashed at rest
- [x] Catalog seed: 4 artists / 4 albums / 10 tracks with LRC lyrics, generated into `server/src/catalog/catalog.seed.ts` by `server/scripts/build-catalog-seed.mjs`; `npm run seed -w server` applies it
- [x] Schema M1: `Artists.genres`, `Track.genres`, `Track.track_number`, `Track.art_url`, `Album.source`/`external_id`; no Genre table — genre tiles derive from these arrays
- [x] Search ranking lives in one module (`server/src/catalog/ranking.ts`) shared by in-memory tests and Prisma
- [x] Endpoints: `GET /v1/home`, `GET /v1/search/suggest`, `GET /v1/search` (artist header, type chips), `GET /v1/browse/genres[/:id]`, `GET /v1/stations/:seed`, `GET /v1/artists/:id`, `GET /v1/albums/:id`, `GET /v1/tracks/:id`, `GET /v1/recents`, `POST /v1/events/listen`
- [x] YTM provider behind `CATALOG_YTM_ENABLED=false`, 24 h cache, own-catalog fallback flagged `degraded`; resolver sidecar deferred (D-014)
- [x] OpenAPI 28 paths / 27 schemas; RFC 7807 problems throughout
- [x] Checks: `npm run lint|typecheck|build|prisma:validate` clean; `npm test -w server` 38/38
- [x] Live smoke on Postgres: register 201, home 4 rows, suggest ≈20 ms, search total 4, artist/album/genre/station 200, listen 202, recents grouped, `/media/cover-01.png` served, non-UUID ids 404 (not 500)

**Android (Compose, package `com.resona.app`):**
- [x] Name-only onboarding → device registration; device key in SharedPreferences; 401 returns to onboarding
- [x] App shell: Home/Search bottom nav, back handling, per-destination saveable state
- [x] Home (quick grid + server rows), Search idle (recents + genres), typing (debounced suggestions), results (All/Songs/Albums/Artists chips), Artist, Album, Single, Genre, Radio
- [x] Search bar lives on Search only — Home stays the feed (mockup §2)
- [x] Artwork via Coil; debug-only "Log a 30 s listen" exercises `POST /v1/events/listen` on device
- [x] Builds with `gradle assembleDebug -Presona.apiBaseUrl=http://127.0.0.1:3000`; verified end-to-end on the TECNO LJ6 (search → album → artist → radio → listen → recents)

**Deferred / pending:**
- [ ] iOS M1 UI — D-015: no macOS host on this machine, so it cannot be built or verified; SwiftUI layer stays M0 skeleton until a Mac is available
- [ ] M1 demo video ritual (screenshots captured; video not yet recorded)
- [ ] Final D-012 check on the pushed SHA: CI green + APK artifact present

## Decision log

| ID | Date | Decision | Rationale |
|----|------|----------|-----------|
| D-001 | 2026-11-21 | Native iOS (Swift) + Android (Kotlin), two codebases | User choice; deepest background-audio and lock-screen behavior |
| D-002 | 2026-11-21 | No login — display name only, silent device registration | Principle P1 |
| D-003 | 2026-11-21 | Free downloads, no ads, no premium tier | Principles P2/P3 |
| D-004 | 2026-11-21 | Synced lyrics lead audio by 0.5 s (client-side, adjustable) | Principle P4 |
| D-005 | 2026-11-21 | Songs sourced like OpenSpot/Musify: YouTube Music via server-side adapter; own catalog as first-class fallback | Principle P5 + legal mitigation (doc 05) |
| D-006 | 2026-11-21 | Custom API: Node 20 + Express + Prisma + PostgreSQL | User choice over Firebase/Supabase |
| D-007 | 2026-11-21 | Solo, part-time (~8–10 h/wk), 28-week plan with buffer | User choice; roadmap doc 04 |
| D-008 | 2026-11-21 | Deep PDF creation blueprint as the master plan document | User choice; lives in `docs/blueprints/` |
| D-009 | 2026-11-22 | Final app name: **Tugtugin** | User-approved. Resona remains the internal code identity (`com.resona.app`, iOS module, `@resona/*`) until the M6 public rename; store listing and user-facing brand use Tugtugin. Trademark/store-name clearance stays on the M6 pre-upload checklist |
| D-010 | 2026-11-22 | Repository license: **MIT** | User-approved; permissive, simple, compatible with the OFL fonts and open toolchain |
| D-011 | 2026-11-22 | Personalization is first-class: onboarding taste picker (3+ artists), shelf-based adaptive home, similar artists, rising/viral, real Top 50 charts; rules-based SQL, no ML, $0 | User request; blueprint v1.1 Ch. 4.2, roadmap M5 |
| D-012 | 2026-11-22 | Every deliverable is re-verified before reporting done: local suite (lint, typecheck, tests, prisma validate), token-regen diff, git sync vs origin, CI run status for the exact pushed SHA, artifact presence | User rule "always recheck your work before sending" — CI caught 3 Kotlin bugs CI-only compile would have shipped |
| D-013 | 2026-11-22 | Blueprint v1.1 reconstructed and committed in-repo: the previously claimed master (`download/Resona_Music_App_Creation_Blueprint.pdf`, 38 pp / 13 ch) was never committed — the repo PDF was the 17-page v1.0. The v1.1 PDF was rebuilt from the committed toolchain (cover v1.1, 26-week gantt, personalization Ch. 4.2, R-13/R-14, S-31..S-33), and markdown docs 01/02/04/06 synced. Personalization specifics (5 derived tables, 5 endpoints, FR-18..21 wording) authored per D-011 as the new authoritative spec | D-012 verification exposed the gap; the repo must be self-consistent before M1 |
| D-014 | 2026-11-22 | YTM adapter ships as a flag-gated provider (`CATALOG_YTM_ENABLED=false`) with 24 h cache, persistence hooks, and degraded fallback; the extraction sidecar is out of M1 scope | Keeps M1 own-catalog-safe (R-01) and keeps the legal/ToS mechanism out of the API repo until the risk checkpoint |
| D-015 | 2026-11-22 | M1 Android UI ships now; iOS M1 UI is deferred | The Windows build machine has no macOS host, so iOS M1 cannot be built or verified here. API, DTOs, and design tokens are shared; SwiftUI work resumes on a Mac |

## Changelog

- **2026-11-22 (M1 catalog & search — code complete)** — Server: Prisma device store + `X-Device-Key` auth, seeded own catalog (4 artists / 4 albums / 10 tracks, LRC lyrics), single ranking module, suggest/search/home/genres/station/artist/album/track/recents/listen endpoints, flag-gated YTM provider with 24 h cache + degraded fallback, OpenAPI 28 paths, 38/38 tests. Android: name-only onboarding, Home/Search/Artist/Album/Single/Genre/Radio screens, device key storage, Coil artwork, debounced suggestions, type chips, debug listen capture; verified end-to-end on the TECNO LJ6. The Home search entry was removed after review — search lives on the Search tab only (the mockup's Home is a feed, not a search surface).
- **2026-11-22 (D-009 closed — Tugtugin)** — Final app name is **Tugtugin** (Tagalog for "music / the playing of instruments"). Resona stays the internal code identity for now (`com.resona.app`, iOS module, `@resona/*`, API title); the public brand and store listing use Tugtugin. The v1.1 PDF already uses Tugtugin but still labels it a working title, so it remains a pre-decision snapshot. Trademark/store-name clearance stays on the M6 checklist.
- **2026-11-22 (M0 demo + license + API stubs)** — Recorded and committed the 30-second M0 demo: `docs/demo-scripts/2026-11-22-m0.mp4` (1920×1080, 30 fps, 30.0 s), built from the real TECNO LJ6 screenshot, real `npm test` output, and the green CI run 45011244488 (`be032f9`, 52 s, 8.64 MB APK artifact). Also closed D-010 with MIT (`LICENSE` + all `package.json` files), added the 5 personalization/chart OpenAPI stubs and matching `@resona/api-types` DTOs, and fixed the Windows path bug in `make-test-tracks.mjs` (10/10 tracks verified). M0 is now fully complete; M1 is next.
- **2026-11-22 (v1.1 doc sync)** — Blueprint v1.1 reconstructed in-repo and markdown docs synced (D-013): `docs/blueprints/music-app-creation-blueprint.pdf` rebuilt via the toolchain (v1.1 cover, §4.2 personalization engine with 5 derived tables, 29-endpoint API, 26-week M0–M6 roadmap + regenerated gantt, 14 risks incl. new R-13/R-14, S-31..S-33 in Table 2-2 and Appendix A); `docs/01-PRD.md` v1.1 (FR-16..21, F6, story 11, S-31..S-33, milestone remap); `docs/02-ARCHITECTURE.md` v1.1 (5 derived tables in §7, 29 endpoints in §8); `docs/04-ROADMAP.md` v1.1 (26-week M0–M6: M1 catalog & search, M2 playback, M3 + taste picker, M5 personalization + charts, M6 deploy + rollout); `docs/06-RISK-REGISTER.md` v1.1 (R-13/R-14, M1→M2 gate references). Toolchain scripts made path-relative so the PDF is reproducible: `python3 build_blueprint.py && python3 render_cover.py && python3 merge_blueprint.py` from `docs/blueprints/toolchain/`.
- **2026-11-22 (verification pass)** — Full recheck after user rule D-012: CI runs 4–5 green (runs 1–3 had failed on 3 Kotlin bugs, fixed), 10 tests green, lint/typecheck/prisma clean, token regen byte-identical to commit, git in sync with origin, migration verified on PGlite (11 tables / 4 enums / 13 FKs / 24 indexes), APK artifact live (8.8 MB), no secrets tracked.
- **2026-11-22 (M0 code complete)** — Monorepo scaffolded and pushed: npm workspaces, docker-compose (Postgres 16), design-token pipeline (`tokens.json` → `GeneratedTokens.kt`/`.swift`), `@resona/api-types` DTOs, Express server core (healthz, POST /v1/devices, Zod, RFC 7807, 10 green tests), Prisma schema v1 (11 tables) + init migration SQL, native app skeletons (Compose + SwiftUI Home), GitHub Actions CI (server jobs + Android APK artifact), OpenAPI 3.1 skeleton (24 endpoints), 10 ffmpeg-generated test tracks (gitignored `local-media/`). Remaining: demo-video ritual, `docker compose up` + `prisma migrate deploy` on your machine, watch the first CI run.
- **2026-11-22 (v1.1)** — Blueprint updated with the full personalization engine: new Chapter 8 (listener states, taste picker, signal weights, nightly scoring, shelf registry, real charts), roadmap extended to 26 weeks with dedicated M5 + M6, 5 derived tables, 5 new endpoints, screens S-31..S-33, risks R-10/R-11, 4th diagram (personalization pipeline). Also fixed a v1.0 rendering bug that dropped 10 of 12 chapter headings. Markdown docs 01/02/04/06 pending sync to v1.1; the PDF is the master plan.
- **2026-11-22** — Planning v1.0 complete: PRD, architecture, design system, roadmap, sourcing research, risk register, diagrams, and the consolidated PDF blueprint pushed to this repository. M0 checklist is the next action.
