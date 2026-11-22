# 04 — Roadmap (Solo, Part-Time)

**Version:** 1.0 · **Date:** 2026-11-22
**Assumption:** 1 builder, ~8–10 h/week (evenings + weekends). Every milestone ends with something **demoable**, not just "code written".
**Total:** 28 weeks including buffer · Nov 23, 2026 → ~Jun 6, 2027.

> Rule of the road: if a week is lost (exams, holidays, life), the plan does not reshuffle — the buffer absorbs it, and scope moves out of the milestone, never quality gates.

---

## Milestone map

| ID | Name | Weeks | Dates (2026–27) | Demo at the end |
|----|------|-------|------------------|-----------------|
| M0 | Foundations | 1–2 | Nov 23 – Dec 6 | Empty apps hit a health endpoint; tokens render; CI green |
| M1 | Playback core | 3–8 | Dec 7 – Jan 17 | Play a song, background audio, lock-screen controls, mini player, queue basics (own-catalog tracks) |
| M2 | Catalog, Search, Home | 9–13 | Jan 18 – Feb 21 | Search "panata" → results → play from the YT Music adapter; Home feed filled; artist/album pages |
| M3 | Library & playlists | 14–18 | Feb 22 – Mar 28 | Full playlist CRUD + reorder, likes, library tabs, recents, profile drawer |
| M4 | Lyrics, downloads, settings | 19–23 | Mar 29 – May 2 | Synced lyrics (−0.5 s) with tap-to-seek; offline playback; sleep timer; settings |
| M5 | Beta & release prep | 24–26 | May 3 – May 23 | TestFlight/Play internal beta, crash-free ≥ 99.5 %, store-listing assets, first public APK |
| — | Buffer | 27–28 | May 24 – Jun 6 | Absorbs slips; else v1.1 (autoplay radio, sort options) |

Gantt: `docs/diagrams/roadmap-gantt.png`

---

## M0 — Foundations (wks 1–2)

**Build:** monorepo scaffold (§3 of doc 02) · Express server with `GET /healthz` + `POST /v1/devices` (stub) · Prisma schema v1 + migration · Xcode/Gradle projects with token-generated theme · GitHub Actions (lint+build both apps, test server) · OpenAPI skeleton.

**Definition of done:** fresh clone → `docker compose up` → both apps build and show a Home screen mock section with real tokens; CI badge green; one Android APK artifact produced automatically.

## M1 — Playback core (wks 3–8)

**Build:** `OwnCatalogProvider` + admin upload script (10 test tracks with LRC) · `/v1/tracks/:id/stream` (own files, R2 presigned) · playback engine both platforms (queue model, shuffle/repeat) · MiniPlayer + Now Playing (no lyrics yet) · lock screen/notification controls · queue sheet with remove · basic equalizer animation.

**Demo script:** tap track → plays; lock screen → controls work; kill app → audio stops correctly; re-open → MiniPlayer state restored.

**Quality gates:** playback start < 300 ms cached; no audio glitch on screen-off (Android Doze test); `AVAudioSession` interruption (call) resumes correctly.

## M2 — Catalog, Search, Home (wks 9–13)

**Build:** `YtmProvider` (metadata + stream resolution server-side, with 24 h cache + persisted rows) · suggest + search endpoints · type chips UI · artist header card · Home endpoint (quick grid, card rows) · artist/album/single pages · radio station endpoint + page · recents capture (`ListenEvent`).

**Demo script:** search "panata" → suggestions → results grouped by chip → play → Now Playing tinted from artwork → artist page → popular list.

**Quality gates:** suggest p95 < 300 ms; search results stable across 20 queries; adapter failures fall back to cached rows with a toast, never a crash.

**Risk checkpoint (end of wk 10):** if the adapter is unreliable (> 10 % stream resolution failures), swap M2 scope to own-catalog browsing and move adapter work to buffer — the plan survives.

## M3 — Library & playlists (wks 14–18)

**Build:** playlists CRUD + `PATCH order` + drag-reorder UI · add-to-playlist sheet + find field + create dialog · likes (rows, mini player, Now Playing) + Liked Songs page (+ add-to-liked flow) · Library tabs/sub-chips/sort/grid · follows + saves · recents page grouped by day · profile drawer (name edit, settings, recents; social rows hidden).

**Demo script:** create "Panata" → add 3 tracks from search → hold-drag reorder → kill app → reopen → order persisted and synced (check via API).

## M4 — Lyrics, downloads, settings (wks 19–23)

**Build:** LRC pipeline (own + LRCLIB lookup + cache) · lyrics preview card + full-screen view with −500 ms lead + tap-to-seek + offset setting · download manager (own-catalog permanent + ytm time-limited cache) · offline library mode + offline replay of listen events · sleep timer · share sheet + deep links · settings (data saver, quality, storage, about) · queue hold-to-reorder gestures.

**Demo script:** F2 (sing-along) and F4 (airplane mode) from the PRD pass end-to-end.

**Quality gates:** lyric highlight within ±150 ms on 5 reference tracks; airplane-mode cold start < 2.5 s; downloads resume after kill.

## M5 — Beta & release prep (wks 24–26)

**Build:** polish pass on motion specs (doc 03 §4) · crash reporting + 2-week dogfood beta (you + 5 friends via TestFlight/Play internal) · performance pass against NFR table · store listing assets · de-branding checklist (doc 03 §8) · README quick-start · v1.0 tag + GitHub Release with APK.

**Definition of done:** all 10 PRD user stories pass on both platforms; crash-free ≥ 99.5 % over the beta window; a friend can install and play a song without help.

---

## If the timeline slips badly (honest fallback)

Building **two native apps solo is the schedule's biggest risk**. The de-risked alternative, if M1 runs > 2 weeks late: lead with **Android only** through M4, then port to iOS in a focused 6-week block (all API/design/algorithm work transfers; only UI + player glue is re-written). Decide at the M1 gate, not later.

## Weekly rhythm (suggested)

- 2 × weeknight 1.5 h — focused build on the current milestone's smallest task
- 1 × weekend 4–5 h — the week's main feature + demo-video-of-the-week (30 s, keeps morale + progress log)
- Sunday 15 min — update `PROGRESS.md`, pick next week's 3 tasks
