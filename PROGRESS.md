# PROGRESS

Living status board — updated at every milestone gate and whenever a decision is made. Last updated: **2026-11-22**.

---

## Status board

| Workstream | Status | Notes |
|------------|--------|-------|
| UI mockup (25 screens) | **Done** | `design/reference-mockup.html` |
| Product requirements (PRD) | **Done (v1.1)** | `docs/01-PRD.md` — v1.0; FR-18..21 (personalization) live in the PDF blueprint |
| System architecture | **Done (v1.0)** | `docs/02-ARCHITECTURE.md` |
| Design system | **Done (v1.0)** | `docs/03-DESIGN-SYSTEM.md` |
| Roadmap | **Done (v1.1)** | PDF blueprint is master: M0-M6, 26 weeks; markdown doc 04 pending sync |
| Sourcing research + legal | **Done (v1.0)** | `docs/05-RESEARCH.md` |
| Risk register | **Done (v1.1)** | PDF adds R-10/R-11; markdown doc 06 pending sync |
| Personalization engine spec | **Done (v1.1)** | Blueprint Ch. 8: states, signals, nightly job, shelves, charts |
| Diagrams (architecture, ER, pipeline, gantt) | **Done** | `download/assets/`, `docs/diagrams/` |
| Consolidated PDF blueprint | **Done (v1.1)** | `download/Resona_Music_App_Creation_Blueprint.pdf` — 38 pages, 13 chapters |
| M0 — Foundations | **Done (code)** | All checklist items; demo video ritual pending on you. CI verifies Android build on every push |
| M1 — Catalog + search | Not started | wks 5–8 |
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
- [x] OpenAPI 3.1 skeleton for the 24 endpoints (`server/openapi.yaml`)
- [x] 10 own-catalog test tracks prepared (audio + LRC + art + manifest) — `npm run test:tracks`, gitignored
- [ ] First 30-second demo video of the week (your ritual — record & post)

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
| D-009 | open | Final app name (working title "Tugtugin") | Pick before store listing (M5) |
| D-010 | open | Repository license | Recommend MIT for code; decide before public release |
| D-011 | 2026-11-22 | Personalization is first-class: onboarding taste picker (3+ artists), shelf-based adaptive home, similar artists, rising/viral, real Top 50 charts; rules-based SQL, no ML, $0 | User request; blueprint v1.1 Ch. 8, roadmap M5 |
| D-012 | 2026-11-22 | Every deliverable is re-verified before reporting done: local suite (lint, typecheck, tests, prisma validate), token-regen diff, git sync vs origin, CI run status for the exact pushed SHA, artifact presence | User rule "always recheck your work before sending" — CI caught 3 Kotlin bugs CI-only compile would have shipped |

## Changelog

- **2026-11-22 (verification pass)** — Full recheck after user rule D-012: CI runs 4–5 green (runs 1–3 had failed on 3 Kotlin bugs, fixed), 10 tests green, lint/typecheck/prisma clean, token regen byte-identical to commit, git in sync with origin, migration verified on PGlite (11 tables / 4 enums / 13 FKs / 24 indexes), APK artifact live (8.8 MB), no secrets tracked.
- **2026-11-22 (M0 code complete)** — Monorepo scaffolded and pushed: npm workspaces, docker-compose (Postgres 16), design-token pipeline (`tokens.json` → `GeneratedTokens.kt`/`.swift`), `@resona/api-types` DTOs, Express server core (healthz, POST /v1/devices, Zod, RFC 7807, 10 green tests), Prisma schema v1 (11 tables) + init migration SQL, native app skeletons (Compose + SwiftUI Home), GitHub Actions CI (server jobs + Android APK artifact), OpenAPI 3.1 skeleton (24 endpoints), 10 ffmpeg-generated test tracks (gitignored `local-media/`). Remaining: demo-video ritual, `docker compose up` + `prisma migrate deploy` on your machine, watch the first CI run.
- **2026-11-22 (v1.1)** — Blueprint updated with the full personalization engine: new Chapter 8 (listener states, taste picker, signal weights, nightly scoring, shelf registry, real charts), roadmap extended to 26 weeks with dedicated M5 + M6, 5 derived tables, 5 new endpoints, screens S-31..S-33, risks R-10/R-11, 4th diagram (personalization pipeline). Also fixed a v1.0 rendering bug that dropped 10 of 12 chapter headings. Markdown docs 01/02/04/06 pending sync to v1.1; the PDF is the master plan.
- **2026-11-22** — Planning v1.0 complete: PRD, architecture, design system, roadmap, sourcing research, risk register, diagrams, and the consolidated PDF blueprint pushed to this repository. M0 checklist is the next action.
