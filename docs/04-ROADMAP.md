# 04 — Roadmap (Solo, Part-Time)

**Version:** 1.1 · **Date:** 2026-11-22 (synced to the consolidated blueprint v1.1)
**Assumption:** 1 builder, ~8–10 h/week (evenings + weekends). Every milestone ends with something **demoable**, not just "code written".
**Total:** 26 weeks · Nov 23, 2026 → May 23, 2027.
**v1.1 change:** the build order was resequenced — **catalog & search now land before playback** (M1/M2 swap), the taste picker joins M3, personalization + charts get dedicated M5, and deploy + friend rollout becomes M6. If a week is lost, scope moves out of the milestone — quality gates never move.

> Rule of the road: if a week is lost (exams, holidays, life), the plan does not reshuffle — scope moves out of the milestone, never quality gates.

Gantt: `docs/diagrams/roadmap-gantt.png` (regenerated for v1.1).

---

## Milestone map

| ID | Name | Weeks | Dates (2026–27) | Demo at the end |
|----|------|-------|-----------------|-----------------|
| M0 | Foundations | 1–4 | Nov 23 – Dec 20 | Empty apps hit a health endpoint; tokens render; CI green — **done Nov 22, ahead of schedule** |
| M1 | Catalog & search | 5–8 | Dec 21 – Jan 17 | Search "panata" → suggestions → results by type chip → artist page → popular list (own catalog first, YT adapter behind a flag) |
| M2 | Playback core | 9–13 | Jan 18 – Feb 21 | Play a song, background audio, lock-screen controls, mini player, queue basics (own-catalog tracks) |
| M3 | Library, playlists, taste picker | 14–17 | Feb 22 – Mar 21 | Full playlist CRUD + reorder, likes, library tabs, recents, taste picker at onboarding |
| M4 | Lyrics + offline | 18–21 | Mar 22 – Apr 18 | Synced lyrics (−0.5 s) with tap-to-seek; offline playback; sleep timer; settings |
| M5 | Personalization + charts | 22–24 | Apr 19 – May 9 | Adaptive home shelves from the nightly job, similar artists, rising picks, real Top 50 charts |
| M6 | Deploy + friend rollout | 25–26 | May 10 – May 23 | TestFlight/Play internal beta, crash-free ≥ 99.5 %, store-listing assets, first public APK |

---

## M0 — Foundations (wks 1–4) — complete

**Built:** monorepo scaffold (§3 of doc 02) · Express server with `GET /healthz` + `POST /v1/devices` (stub) · Prisma schema v1 + migration · Xcode/Gradle projects with token-generated theme (doc 03 §6) · GitHub Actions (lint+build Android, test server) · OpenAPI skeleton · test-track generator · demo-video ritual.

**Definition of done:** fresh clone → `docker compose up` → both apps build and show a Home screen mock section with real tokens; CI badge green; one Android APK artifact produced automatically. **Status: code complete + verified (D-012 pass, 2026-11-22); demo video is the remaining ritual item.**

## M1 — Catalog & search (wks 5–8)

**Build:** swap the in-memory device store for a Prisma store · catalog loader (seeds Artist/Album/Track/Lyrics from `local-media/manifest.json`) · `OwnCatalogProvider` + admin upload path · `YtmProvider` metadata + search behind a build flag (24 h cache + persisted rows) · suggest + search endpoints · browse genres · artist/album/single pages · radio station endpoint + page · Home endpoint (quick grid, card rows) · recents capture (`ListenEvent`).

**Demo script:** search "panata" → suggestions → results grouped by chip → artist page → popular list. (No audio yet — playback is M2; demo the catalog on the TECNO LJ6 against the dev API via `adb reverse`.)

**Quality gates:** suggest p95 < 300 ms; search results stable across 20 queries; adapter failures fall back to cached rows with a toast, never a crash.

**Risk checkpoint (end of wk 8):** if the adapter is unreliable (> 10 % stream resolution failures), M1 completes with own-catalog browsing and the adapter moves out of the milestone — the plan survives (R-01).

**Status: code complete — PR open.** Server catalog/search/home/genres/station/artist/album/track/recents/listen on Prisma (38/38 tests, OpenAPI 28 paths) and the Android M1 screens were verified end-to-end on the TECNO LJ6. The YTM resolver sidecar is out of M1 scope (D-014); iOS M1 UI is deferred because no macOS host is available (D-015). Final D-012 check on the pushed SHA pending.

## M2 — Playback core (wks 9–13)

**Build:** `/v1/tracks/:id/stream` (own files, R2 presigned) · playback engine both platforms (queue model, shuffle/repeat) · MiniPlayer + Now Playing (no lyrics yet) · lock screen/notification controls · queue sheet with remove · basic equalizer animation.

**Demo script:** tap track → plays; lock screen → controls work; kill app → audio stops correctly; re-open → MiniPlayer state restored.

**Quality gates:** playback start < 300 ms cached; no audio glitch on screen-off (Android Doze test); `AVAudioSession` interruption (call) resumes correctly.

**Honest fallback:** if M2 runs > 2 weeks late, lead with **Android only** through M4, then port to iOS in a focused 6-week block (all API/design/algorithm work transfers; only UI + player glue is re-written). Decide at the M2 gate, not later.

## M3 — Library, playlists, taste picker (wks 14–17)

**Build:** playlists CRUD + `PATCH order` + drag-reorder UI · add-to-playlist sheet + find field + create dialog · likes (rows, mini player, Now Playing) + Liked Songs page (+ add-to-liked flow) · Library tabs/sub-chips/sort/grid · follows + saves · recents page grouped by day · profile drawer (name edit, settings, recents; social rows hidden) · **onboarding taste picker (S-31, FR-18): 3+ artists seed `TasteProfile`**.

**Demo script:** create "Panata" → add 3 tracks from search → hold-drag reorder → kill app → reopen → order persisted and synced (check via API); fresh install → taste picker → home reflects the seeds.

## M4 — Lyrics + offline (wks 18–21)

**Build:** LRC pipeline (own + LRCLIB lookup + cache) · lyrics preview card + full-screen view with −500 ms lead + tap-to-seek + offset setting · download manager (own-catalog permanent + ytm time-limited cache) · offline library mode + offline replay of listen events · sleep timer · share sheet + deep links · settings (data saver, quality, storage, about) · queue hold-to-reorder gestures.

**Demo script:** F2 (sing-along) and F4 (airplane mode) from the PRD pass end-to-end.

**Quality gates:** lyric highlight within ±150 ms on 5 reference tracks; airplane-mode cold start < 2.5 s; downloads resume after kill.

## M5 — Personalization + charts (wks 22–24)

**Build:** five derived tables land in Prisma (`TasteProfile`, `ListenerState`, `DailyListenStat`, `ShelfSnapshot`, `ChartSnapshot` — doc 02 §7) · five personalization endpoints (doc 02 §8) · nightly scoring job (rules-based SQL, fixed signal weights, no ML) · shelf registry + adaptive home (S-32, FR-19) · listener states (FR-20) · similar artists + rising/viral picks · real global Top 50 + Your Top 50 charts page (S-33, FR-21).

**Demo script:** F6 from the PRD passes end-to-end — taste-picked device gets shelves matching its state, charts page shows a real Top 50 that moved after a day of listening.

**Quality gates:** shelf build < 200 ms server-side; nightly job completes < 5 min at hobby scale; empty-state fallbacks for brand-new devices (R-13).

## M6 — Deploy + friend rollout (wks 25–26)

**Build:** polish pass on motion specs (doc 03 §4) · crash reporting + 2-week dogfood beta (you + 5 friends via TestFlight/Play internal) · performance pass against NFR table · store-listing assets · de-branding checklist (doc 03 §8) · README quick-start · v1.0 tag + GitHub Release with APK.

**Definition of done:** all PRD user stories pass on both platforms; crash-free ≥ 99.5 % over the beta window; a friend can install and play a song without help. Name (D-009, **Tugtugin**) and license (D-010, **MIT**) are decided; trademark/store-name clearance remains a pre-upload check.

---

## Weekly rhythm (unchanged)

- 2 × weeknight 1.5 h — focused build on the current milestone's smallest task
- 1 × weekend 4–5 h — the week's main feature + demo-video-of-the-week (30 s, keeps morale + progress log)
- Sunday 15 min — update `PROGRESS.md`, pick next week's 3 tasks
