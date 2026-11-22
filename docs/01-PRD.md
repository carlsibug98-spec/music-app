# 01 — Product Requirements Document (PRD)

**Project:** Tugtugin (working title) — free music app
**Version:** 1.1 · **Date:** 2026-11-22 · **Owner:** carlsibug98-spec (solo builder)
**Status:** Approved for M0 · v1.1 = synced to the consolidated blueprint (FR-16..21, S-31..S-33, D-011 personalization)

---

## 1. Vision

A free, ad-free music app that anyone can open and use instantly — no account, no email, no password. Type your name once, and you are listening. It streams and lets you download songs for free, shows lyrics synchronized to playback (leading the audio by 0.5 seconds so you can sing along), and gets out of the way.

The UI already exists: `design/reference-mockup.html` is a 25-screen interactive mockup modeled on a Spotify-style layout, with an OPM-heavy catalog (IV OF SPADES, Tothapi, Dilaw, Ben&Ben). This PRD turns that mockup into buildable requirements for native iOS and Android apps plus a custom backend.

## 2. Product principles (fixed, non-negotiable)

| # | Principle | Consequence in product |
|---|-----------|------------------------|
| P1 | **No login. Ever.** | First-run asks for a display name only. A device ID + API key is created silently. Nothing else is collected. |
| P2 | **Free downloads** | Any song/playlist can be saved for offline playback at no cost. |
| P3 | **No ads, no tracking** | Zero ad SDKs, zero third-party trackers, no analytics that identify a person. |
| P4 | **Lyrics lead by 0.5 s** | Synced lyrics highlight each line 500 ms before the vocal lands (constant offset, configurable). |
| P5 | **Music sourced like OpenSpot / Musify** | Catalog and streams come from YouTube / YouTube Music through a server-side adapter, with an own-catalog fallback. (See doc 05 for the legal analysis and distribution strategy.) |

## 3. Personas

**3.1 "Kaaru" — the daily listener (primary).** 16–28, Philippines, commutes 1–2 h/day, mid-range Android phone, sometimes no signal. Wants to open an app and play a song in under 5 seconds. Uses lyrics to sing along to OPM tracks. Has no patience for sign-up walls or ads.

**3.2 "The builder" (that is you).** Solo, evenings and weekends, ~8–10 h/week. Needs small, demoable milestones, a plan that survives a skipped week, and zero reliance on teammates.

## 4. Scope cut-line

### 4.1 In scope — MVP (milestones M0–M6)

Onboarding (name only) · Home feed (chips, quick grid, sections) · Search (suggestions, typed results, type filter chips, browse genres) · Playback (queue, shuffle, repeat, background audio, lock-screen controls) · Now Playing with synced full-screen lyrics + tap-to-seek · Mini player · Likes (Liked Songs) · Playlists (create, rename, cover, add/remove/reorder, recommended songs) · Library (tabs, sort, grid/list) · Artist / Album / Single / Radio pages · Recents · Downloads & offline mode · Sleep timer · Share (system share sheet) · Settings (data saver, playback, storage, about) · Personalization (taste picker, adaptive home shelves, real Top 50 charts — D-011).

### 4.2 Out of scope — deferred to v2+ (explicitly not built in M0–M6)

| Deferred feature | Why deferred | Mockup reference |
|---|---|---|
| Friends / activity feed / messages | Needs real social accounts — conflicts with P1 no-login | Profile drawer, friends row |
| Blend / Jam / collaborative playlists | Multi-player coordination is a project of its own | Create sheet options |
| Podcasts & audiobooks | Catalog focus is music; chips stay hidden in UI | Home chips, Library tab |
| Pre-save / release countdown | Requires push infra + label relationships | Single page banner |
| Canvas (background video loops) | High bandwidth, low MVP value | Settings row |
| Listen-together, stats page ("Listening stats") | v2 social tier | Profile drawer |

The mockup renders all of the above so the design language is complete; the MVP hides those entry points behind feature flags.

## 5. Screen inventory (from the mockup) and build priority

15 screen clusters cover all 25 mockup states. Priority = the milestone in which the cluster ships. Milestone mapping follows the v1.1 roadmap order (catalog & search → M1, playback → M2).

| # | Screen cluster | Key elements (from mockup) | Data / API | Priority |
|---|----------------|---------------------------|------------|----------|
| 1 | **Onboarding — name entry** (new, required by P1) | Single field, "What should we call you?", CTA | `POST /v1/devices` | M1 |
| 2 | **Home** | Avatar+chips header, 8-tile quick grid, "Your recent rotation", "Jump back in" carousel, mixes/stations/albums card rows, "Show all" links | `GET /v1/home`, recents | M1 |
| 3 | **Search — idle** | Recents list with remove, browse grid (5 feature cats + ~30 genres) | `GET /v1/recents`, `GET /v1/browse/genres` | M1 |
| 4 | **Search — typing** | Live suggestions (query + variants), clear button | `GET /v1/search/suggest` | M1 |
| 5 | **Search — results** | Type chips (Songs/Albums/Playlists/Artists/…), artist header card with Follow, result rows with download/check states | `GET /v1/search` | M1 |
| 6 | **Now Playing** | Full-screen art, progress scrubber, shuffle/prev/play/next/sleep, device/share/queue, lyrics preview card | Player engine, `GET /tracks/:id/lyrics` | M2 |
| 7 | **Full-screen lyrics** | 24px lines, active/past/future states, tap line to seek, "♪♪♪" instrumental rows, share pill | Lyrics sync engine (−500 ms) | M4 |
| 8 | **Queue sheet** | "Now playing" + next-up list, hold-to-reorder, swipe-left-to-remove | Player queue model | M2 (remove), M4 (reorder gestures) |
| 9 | **Track action sheet + Add-to-playlist** | Share, lyrics on/off, like, add to playlist (saved-in list + find + new playlist dialog) | Library APIs | M3 |
| 10 | **Playlist detail** | Gradient hero, owner, duration, action pills (Add/Edit/Name & details/Sort), track rows, Recommended songs + refresh | `GET/PATCH /v1/playlists` | M3 |
| 11 | **Playlist edit + Name & details** | Drag-handle rows, Select mode; cover with edit badge, name field, description, private toggle, delete | `PATCH/DELETE /v1/playlists/:id` | M3 |
| 12 | **Liked Songs + Add to Liked** | Hero, count, add-to-this-playlist row, most-played/songs tabs, search field | Like APIs | M3 |
| 13 | **Artist page** | Hero with verified badge, monthly listeners, Follow pill, Popular (5) with play counts, releases, credits, explore carousel | `GET /v1/artists/:id` | M1 |
| 14 | **Album / Single page** | Hero, tracks, save/download/share/shuffle/play, credits sheet, "More by artist" | `GET /v1/albums/:id` | M1 |
| 15 | **Library** | Tabs (Playlists/Albums/Artists), sub-chips (All/By you/Curated), sort+grid row, Liked Songs pinned, empty states, library search | `GET /v1/library` | M3 |
| 16 | **Radio / Browse genre pages** | Station hero + track list; genre page with card rows + editor stories | `GET /v1/stations`, browse | M1 (radio) |
| 17 | **Recents (grouped)** | Today / Yesterday / date sections with activity subtitles | `GET /v1/recents` | M3 |
| 18 | **Profile drawer** | User card, stats (v2), recents, settings, friends (v2) | Local profile | M3 |
| 19 | **Settings** | Data saver, private session (v2 backend), playback, storage & downloads, media quality, about; sleep-timer sheet (5/10/15/30/45/60 min, end of track) | Local prefs + playback | M4 |
| 20 | **Share sheet / Create dialog / Toasts** | System share targets; playlist-name dialog; transient confirmations | — | M3/M4 |

**v1.1 additions (D-011 personalization, screen IDs from blueprint v1.1):** S-31 **Taste picker** — onboarding step 2, pick ≥ 3 loved artists, seeds the taste profile (ships M3) · S-32 **Adaptive home** — server-assembled shelves replace static rows per listener state (M5) · S-33 **Charts** — global + personal Top 50 from the daily snapshot (M5).

## 6. Key user flows (acceptance = the flow completes as scripted)

**F1 — First launch (target: name → music in < 30 s).**
Launch → name screen → type "kaaru" → tap Go → device registered silently → land on Home with quick grid filled → tap any tile → Mini player appears, track plays.

**F2 — Sing along.**
Search "panata" → suggestions appear instantly → tap top result → Now Playing opens → tap lyrics card → full-screen lyrics → each line highlights ~0.5 s before it is sung → tap a line → playback seeks to that line.

**F3 — Build a playlist.**
Create (+ in nav) → name dialog → "Panata" created → Add → search "malay ko" → toggle tracks in → open playlist → hold row → drag to reorder → swipe row left → remove.

**F4 — Commute offline.**
Playlist → Download → progress indicators per row → airplane mode → app opens straight to offline library → tracks play from local cache → lyrics still work (LRC cached with track).

**F5 — Sleep timer.** Now Playing → timer icon → "30 minutes" → confirmation toast → at 0:00 playback fades out and pauses.

**F6 — Personalized home (v1.1).** Complete the taste picker (3+ artists) → land on Home → shelves match the listener state → charts page shows a real Top 50 → nightly job refreshes both.

## 7. User stories with acceptance criteria (top 11)

1. **Name-only onboarding.** Given a fresh install, when the app first launches, then it asks only for a display name; on submit the app works immediately and never asks for email/password/phone.
2. **Instant search.** When I type ≥ 1 character, then suggestions render in < 300 ms (cached query prefix); on submit, results group by the active type chip.
3. **Reliable playback start.** When I tap a track on 4G, then audio starts in < 1.5 s; failure shows a retry toast, never a dead button.
4. **Background audio.** When I lock the screen or switch apps, then audio continues; lock screen shows art, title, artist, and play/pause/next/prev; scrubbing works.
5. **0.5 s-early lyrics.** When a track with synced lyrics plays, then the active line changes 500 ms before the vocal, verified by ear against 5 reference tracks; if lyrics are unsynced, show plain text without the highlight.
6. **Tap-to-seek lyrics.** When I tap any lyric line, then playback jumps to that line's timestamp + 100 ms and the line becomes active.
7. **Playlist CRUD + reorder.** I can create, rename, describe, and delete playlists; add/remove tracks; hold-drag to reorder persists after restart and syncs to the server.
8. **Free downloads.** When I tap download on any track/playlist (Wi-Fi default; cellular configurable), then files store locally, rows show the green check, and playback works in airplane mode.
9. **Queue editing.** "Play next" inserts after the current track; the queue sheet supports hold-to-move and swipe-to-remove with haptic feedback.
10. **Sleep timer.** Timer options 5–60 min / end-of-track; when it fires, playback pauses with fade-out; remaining time visible in Now Playing.
11. **Personalized home (v1.1).** Given I completed the taste picker with 3+ artists, when the nightly job runs, then Home shows shelves matching my listener state and the charts page shows a real Top 50.

## 8. Functional requirements

- **FR-01 Onboarding:** display name (1–40 chars, stored locally + on server), device registration, re-name in profile.
- **FR-02 Home:** quick grid (8 recents), chip filters (All / Music; Following & Podcasts hidden until v2), card rows from server, pull-to-refresh.
- **FR-03 Search:** prefix suggestions; type-filtered results; artist header card when the query matches an artist name; recents with remove and "Clear".
- **FR-04 Playback:** play/pause/next/prev, seek, shuffle (Fisher–Yates), repeat (off/all/one), gapless attempt, autoplay radio at queue end (v1.1).
- **FR-05 Queue:** play-next insertion, manual reorder, remove, current-track indicator with equalizer animation.
- **FR-06 Lyrics:** LRC fetch+cache, −500 ms default offset (user-adjustable −2 s to +2 s), active/past/future styling, tap-to-seek, instrumental rows, share.
- **FR-07 Likes:** one-tap like from rows, mini player, and Now Playing; Liked Songs auto-playlist with count.
- **FR-08 Playlists:** full CRUD, cover (picked or letter-tile), privacy (public flag), sort options (custom/recents added/alpha), recommended tracks (server).
- **FR-09 Library:** tabs + sub-chips, list/grid toggle, artist follows, saves for albums/playlists, empty states.
- **FR-10 Downloads:** per-track and per-playlist, storage picker on Android, data-saver guard on cellular, integrity check, storage usage in settings.
- **FR-11 Offline mode:** full app function for downloads + Liked + playlists; queued server writes replay on reconnect.
- **FR-12 Recents:** listening events grouped by day; feeds Home "recent rotation".
- **FR-13 Share:** system share sheet for track/album/artist/playlist deep links.
- **FR-14 Sleep timer:** as story 10.
- **FR-15 Settings:** data saver, streaming/download quality, private session toggle (local-only in MVP), clear cache, about/version.
- **FR-16 Artist & album pages:** artist hero (verified badge, monthly listeners, Follow), popular tracks with play counts, releases; album/single pages with credits and "More by artist".
- **FR-17 Browse & radio:** ~30 genre tiles with category pages, radio stations seeded by artist or genre; autoplay radio continues at queue end.
- **FR-18 Taste picker (D-011):** onboarding step after name entry — pick ≥ 3 artists you love from searchable, OPM-weighted suggestions; seeds `TasteProfile`; skippable with chart-driven defaults.
- **FR-19 Adaptive home:** server-assembled shelves (Recent rotation, Because you listened, Similar artists, Rising OPM, Your Top 50) replace static rows; selection follows the listener state; refreshed nightly and on app open.
- **FR-20 Listener states & signals:** rules-based SQL scoring of ListenEvents (plays, skips, completions, likes, recency — fixed weights, no ML, $0 infra) maintains state (new / casual / regular / super-fan) and per-artist affinity; state + signal summary exposed via `GET /v1/me/state`.
- **FR-21 Charts:** real global Top 50 from aggregated ListenEvents (daily `ChartSnapshot`) plus per-device "Your Top 50"; charts page and "Rising" shelf.

## 9. Non-functional requirements

| NFR | Target |
|-----|--------|
| Cold start | < 2.5 s to interactive (mid-range Android) |
| Playback start | < 1.5 s on 4G; < 300 ms from cache |
| Lyrics perceived sync | within ±150 ms after the −500 ms lead |
| Crash-free sessions | ≥ 99.5 % |
| Battery | ≤ 5 %/hour playback (screen off) |
| Offline | All FRs except search/browse/stream work offline |
| Privacy | No PII beyond display name; no third-party SDKs |
| Accessibility | Dynamic type; contrast ≥ 4.5:1 for body text (flag: mockup `dim #7f7f7f` on `#121212` = 4.2:1 — raise to `#8f8f8f` in dark mode) |
| Localization | Strings externalized from day 1; en + fil targets |

## 10. Dependencies and constraints

- Catalog/stream availability depends on the YouTube Music adapter staying healthy (doc 05); own-catalog upload is the guaranteed fallback.
- iOS background audio requires correct `UIBackgroundModes` (audio) + AVAudioSession config; Android requires a foreground `MediaSessionService`.
- Distribution: Android via GitHub Releases (APK) and Play (attempt), iOS via TestFlight (attempt) — see doc 05 §4.
- Solo, part-time: every milestone must be shippable and demoable on its own.
