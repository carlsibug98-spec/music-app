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
| M0 — Foundations | **In progress** | Scaffold + tokens + server core committed; apps/CI/OpenAPI in flight |
| M1 — Catalog + search | Not started | wks 5–8 |
| M2 — Playback core | Not started | wks 9–13 |
| M3 — Library, playlists, taste picker | Not started | wks 14–17 |
| M4 — Lyrics + offline | Not started | wks 18–21 |
| M5 — Personalization + charts | Not started | wks 22–24 |
| M6 — Deploy + friend rollout | Not started | wks 25–26 |

## Next up (M0 checklist)

- [ ] Monorepo scaffold: `apps/ios`, `apps/android`, `server`, `packages/api-types`, `packages/design-tokens`
- [ ] Express server: `GET /healthz`, `POST /v1/devices` (stub), Zod validation, error envelope
- [ ] Prisma schema v1 (11 tables from doc 02 §7) + first migration + `docker compose up`
- [ ] Xcode + Gradle projects with token-generated theme (doc 03 §6), Home screen skeleton
- [ ] GitHub Actions: lint + build both apps + server tests; APK artifact on main
- [ ] OpenAPI 3.1 skeleton for the 24 endpoints
- [ ] 10 own-catalog test tracks prepared (audio + LRC + art) for M1 — *not committed to the repo*
- [ ] First 30-second demo video of the week (ritual starts here)

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

## Changelog

- **2026-11-22 (v1.1)** — Blueprint updated with the full personalization engine: new Chapter 8 (listener states, taste picker, signal weights, nightly scoring, shelf registry, real charts), roadmap extended to 26 weeks with dedicated M5 + M6, 5 derived tables, 5 new endpoints, screens S-31..S-33, risks R-10/R-11, 4th diagram (personalization pipeline). Also fixed a v1.0 rendering bug that dropped 10 of 12 chapter headings. Markdown docs 01/02/04/06 pending sync to v1.1; the PDF is the master plan.
- **2026-11-22** — Planning v1.0 complete: PRD, architecture, design system, roadmap, sourcing research, risk register, diagrams, and the consolidated PDF blueprint pushed to this repository. M0 checklist is the next action.
