# 06 — Risk Register

**Version:** 1.0 · **Date:** 2026-11-22 · **Review cadence:** at every milestone gate.

Scoring: Likelihood (1–5) × Impact (1–5) = Score. Score ≥ 12 needs an active mitigation in the current milestone; ≥ 16 needs a plan-B decision at the next gate.

| ID | Risk | L | I | Score | Mitigation (owner action) | Trigger / contingency |
|----|------|---|---|-------|---------------------------|------------------------|
| R-01 | YouTube stream resolution breaks (upstream change) | 4 | 4 | 16 | Server-side adapter isolation + catalog-row cache + failure monitoring (doc 05 §R1) | > 10 % resolution failures in a week → freeze features, patch adapter; own-catalog keeps app alive |
| R-02 | Store rejection (Community flavor) | 4 | 2 | 8 | Dual-flavor distribution (doc 05 §2): Catalog flavor for stores, Community via GitHub Releases | Rejection → ship Community APK immediately; no schedule impact |
| R-03 | Solo schedule slip / burnout | 3 | 4 | 12 | 8–10 h/wk cap, milestone demo-videos, 2-week buffer; smallest-task-first nights | M1 gate > 2 weeks late → switch to Android-first fallback (doc 04) |
| R-04 | Two-platform scope creep | 4 | 3 | 12 | MVP cut-line frozen in PRD §4; v2 list is written down, not discussed | New feature idea → goes to v2 backlog, never current milestone |
| R-05 | Data loss with no-login (device lost/reset) | 3 | 3 | 9 | Device key in Keychain/Keystore; server already holds playlists/likes; v1.1 sync-code pairing | User report → v1.1 "restore with code" gets promoted |
| R-06 | Legal notice to repository (DMCA) | 2 | 4 | 8 | No media in repo (CI guard); isolated adapter module; documented takedown response (doc 05 §R4) | Notice → remove flagged file, respond, consider moving adapter to separate repo |
| R-07 | Lyrics unavailable / unsynced for popular tracks | 3 | 2 | 6 | Own LRC for own catalog; LRCLIB fallback; graceful plain-text mode (PRD story 5) | Coverage < 70 % of top-100 test set → add a manual LRC import UI |
| R-08 | Background audio platform quirks (Doze, interruptions) | 3 | 3 | 9 | M1 quality gates include screen-off/Doze/call-interruption tests on real devices | Gate failure → dedicate the next week to audio only; push UI work |
| R-09 | Server/hosting costs creep | 2 | 2 | 4 | 302-redirect streaming (zero egress), R2 free tier, single $5–10 VM; cost alarm at $20/mo | Alarm → drop proxy cache mode, keep redirects |
| R-10 | API abuse (open proxy via our stream endpoint) | 2 | 3 | 6 | Device-key auth + rate limits + signed short-TTL URLs (doc 02 §11) | Abuse pattern → tighten per-device quotas |
| R-11 | Playback performance on low-end Android | 3 | 3 | 9 | Perf NFRs tested on a ₱5–7k class device from M1 onward | Cold start > 2.5 s → defer art animations, lazy-load carousels |
| R-12 | Figtree font or third-party dep licensing drift | 1 | 2 | 2 | Figtree is OFL; `npm audit` + license check in CI | License conflict → swap to Inter (also OFL), metrics-compatible |

**Standing decisions:** every gate review re-scores R-01, R-03, R-04 (the three that actually kill solo projects) before any new work is scheduled.
