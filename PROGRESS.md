# PROGRESS

Living status board — updated at every milestone gate and whenever a decision is made. Last updated: **2026-11-22**.

---

## Status board

| Workstream | Status | Notes |
|------------|--------|-------|
| UI mockup (25 screens) | **Done** | `design/reference-mockup.html` |
| Product requirements (PRD) | **Done (v1.0)** | `docs/01-PRD.md` — approved for M0 |
| System architecture | **Done (v1.0)** | `docs/02-ARCHITECTURE.md` |
| Design system | **Done (v1.0)** | `docs/03-DESIGN-SYSTEM.md` |
| Roadmap | **Done (v1.0)** | `docs/04-ROADMAP.md` — M0 starts wk of Nov 23, 2026 |
| Sourcing research + legal | **Done (v1.0)** | `docs/05-RESEARCH.md` |
| Risk register | **Done (v1.0)** | `docs/06-RISK-REGISTER.md` |
| Diagrams (architecture, ER, gantt) | **Done** | `docs/diagrams/` |
| Consolidated PDF blueprint | **Done (v1.0)** | `docs/blueprints/music-app-creation-blueprint.pdf` |
| M0 — Foundations | **Not started** | Next milestone (wks 1–2) |
| M1 — Playback core | Not started | wks 3–8 |
| M2 — Catalog/Search/Home | Not started | wks 9–13 |
| M3 — Library & playlists | Not started | wks 14–18 |
| M4 — Lyrics/downloads/settings | Not started | wks 19–23 |
| M5 — Beta & release prep | Not started | wks 24–26 |

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

## Changelog

- **2026-11-22** — Planning v1.0 complete: PRD, architecture, design system, roadmap, sourcing research, risk register, diagrams, and the consolidated PDF blueprint pushed to this repository. M0 checklist is the next action.
