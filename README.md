# Tugtugin (working title)

A **free, ad-free, no-login music app** for iOS and Android, built natively, with synced lyrics that lead the vocal by 0.5 seconds.

You open it, type your name once, and start listening. No account, no email, no ads, no premium tier. Songs stream (and download for free) through the same source OpenSpot and Musify use — YouTube / YouTube Music — behind a swappable server-side adapter, with an own-catalog fallback that is always store-safe.

> **Tugtugin** is Tagalog for "music / the playing of instruments" — a working title; final name is decision D-009 (see `PROGRESS.md`).

## Status

**Phase: planning complete — M0 (Foundations) is the next milestone.** The plan turns the 25-screen interactive mockup in `design/reference-mockup.html` into a 28-week solo build. See `docs/04-ROADMAP.md`.

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
| `docs/diagrams/` | Architecture, data-model, and roadmap diagrams |
| `docs/blueprints/` | The consolidated PDF creation blueprint |

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
