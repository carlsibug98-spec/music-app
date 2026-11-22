# 05 — Music Sourcing Research & Legal Analysis

**Version:** 1.0 · **Date:** 2026-11-22
**Question this doc answers:** "The songs come from what OpenSpot and Musify use" — what exactly is that, how does it work, and what does it mean for this project?

---

## 1. What OpenSpot and Musify actually use

Both apps are **open-source music players whose catalog and audio come from YouTube / YouTube Music**. Neither hosts or licenses any music.

| App | What we verified | Source |
|-----|------------------|--------|
| **OpenSpot** (BlackHatDevX) | Free, open-source, ad-free streaming + downloads; imports playlists from any public Spotify playlist URL; trending charts sourced from Spotify (75+ countries); streams via "YouTube API — more reliable streaming" (their README's words); desktop + mobile targets | github.com/BlackHatDevX/openspot-music-app, blackhatdevx.github.io/openspot-music-app, r/reactnative announcement ("completely open-source and ad-free — focused on performance") |
| **Musify** (gokadzev) | Open-source Android app; streaming + offline listening from YouTube Music; free, ad-free, synced-lyrics support, custom playlists; distributed via F-Droid builds | gokadzev.github.io/Musify |
| **The wider ecosystem** | Curated list of open-source Spotify/YT Music alternatives (topics: `yt-dlp`, `yt-music`, `foss`) — ViMusic ("FOSS, ad-free, pulls songs from YouTube Music, no login"), RiMusic ("all the music from YouTube Music", ~1.3 M downloads), SimpMusic (cross-platform YT Music client) | github.com/chayotic/Open-Source-Music-Streaming-Apps, privacyguides.org forum, F-Droid catalog coverage |

**The common pattern (what we replicate through our adapter, doc 02 §4):**

1. **Metadata** (title, artist, album, duration, artwork) resolved from YouTube Music's catalog.
2. **Audio** resolved at play time from YouTube's player endpoints — the same mechanism `yt-dlp` uses. This is the "YouTube API" OpenSpot's README refers to; it is the *internal* player API, not the official YouTube Data API (see §3).
3. **Search** is a proxied YouTube Music search.
4. **No content is stored** by the app authors; streams are played (and optionally cached client-side for offline).

## 2. The honest risk picture

This section states plainly what the ecosystem's experience shows. **None of this is legal advice** — it is engineering risk assessment from public evidence.

**R1 — Upstream breakage (operational, near-certain).** The internal player endpoints are unmetered and unversioned. Community reports are consistent: "like other open-source apps relying on YouTube Music's API, [SimpMusic's] performance is inconsistent" (user trial write-up, Nov 2026). ViMusic itself went through maintenance gaps for the same reason. **Mitigation:** server-side adapter with persisted catalog rows + aggressive caching (doc 02 §4); own-catalog fallback that always works; stream-failure budget monitored per release.

**R2 — YouTube Terms of Service (legal, certain as a matter of ToS text).** YouTube's ToS prohibit accessing content other than through the official player and downloading except where explicitly allowed. Every app in §1 operates against this. **Mitigation:** we never redistribute audio (no permanent server copies of upstream streams; time-limited client cache only); adapter is one swappable module; catalog rows are metadata only.

**R3 — Store distribution (business, variable).** The Play Store has accepted some apps in this category (e.g. Spotube) and removed others; Apple review is stricter and TestFlight follows the same rules. **Mitigation (dual-flavor strategy):**
- **"Catalog" flavor** — own-catalog provider only, official YouTube Data API for metadata enrichment where allowed. Store-safe. This is the flavor submitted to Play/TestFlight.
- **"Community" flavor** — full YtmProvider. Distributed as signed APK from GitHub Releases (and F-Droid if accepted), exactly how Musify/ViMusic/RiMusic distribute. iOS: personal Xcode signing / small TestFlight with the understanding it can be pulled.

**R4 — Takedowns on the repo (legal, possible).** Rights holders can DMCA the repository host. **Mitigation:** no copyrighted media ever committed (`.gitignore` + CI check); adapter code isolated in `server/src/adapters/ytm/`; a documented takedown-response process in `PROGRESS.md`.

**R5 — Jurisdiction (note).** The Philippines' IP Code (RA 8293) is broadly similar to other Berne jurisdictions; personal, non-commercial, no-ads distribution (P3) is the fact pattern the whole ecosystem operates under. If this ever becomes commercial (paid tiers, donations tied to premium features), get actual counsel first.

## 3. What the official YouTube Data API does and does not give

The **official** YouTube Data API v3 provides search, metadata, and the embedded video player — it does **not** provide standalone full-track audio streams. So there is no "fully official" way to build a Spotify-like audio-only streamer of YouTube's catalog; every app in §1 uses the internal endpoints instead. Our design keeps this fact contained behind the `CatalogProvider` interface so a future licensed or indie-catalog provider can replace it without touching the apps (doc 02 §4).

## 4. Lyrics sourcing

| Source | What | Fit |
|--------|------|-----|
| **Own LRC files** (uploaded with own catalog) | Full control, perfectly synced | Primary; every own-catalog track ships with LRC |
| **LRCLIB** (lrclib.net) | Free, community-driven synced-lyrics database with an open API; the standard source used by open-source players | Secondary lookup for YtmProvider tracks (match by artist/title/duration) |
| **Musixmatch etc.** | Licensed, excellent coverage | Paid B2B licensing — out of scope for a free app |

The −0.5 s lead (P4) is applied client-side regardless of source, and is user-adjustable (doc 02 §6).

## 5. Recommendation (what we build, in order)

1. **M0–M1:** `OwnCatalogProvider` only — the app is fully functional as a player for music you have rights to (your own recordings, CC-licensed tracks, indie artists who opt in).
2. **M2:** `YtmProvider` behind a build flag — Community flavor. This delivers the product the user asked for: the OpenSpot/Musify experience.
3. **Ship both flavors** (§2 R3): Catalog flavor to stores; Community flavor via GitHub Releases.
4. **Keep the adapter honest:** no server-side media retention, per-user cache limits, stream-failure monitoring, and a public "how it works" page — the same transparency the reference projects use.

## 6. Sources

- OpenSpot repository and site — github.com/BlackHatDevX/openspot-music-app · blackhatdevx.github.io/openspot-music-app
- OpenSpot 2.0 announcement thread — reddit.com/r/reactnative (Nov 2026)
- Musify — gokadzev.github.io/Musify
- Curated ecosystem list — github.com/chayotic/Open-Source-Music-Streaming-Apps
- ViMusic recommendation — privacyguides.org discussion forum (2024)
- SimpMusic two-week trial write-up (performance inconsistency quote) — Nov 2026 press coverage
- RiMusic listing — F-Droid catalog coverage
