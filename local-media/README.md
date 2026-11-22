# local-media/ — own-catalog test tracks (gitignored)

The 10 seed tracks for M1 development. **Never committed** — audio files
don't belong in git; every contributor regenerates them locally.

```bash
npm run test:tracks   # from the repo root (needs ffmpeg)
```

Output: `track-XX.mp3` (8–20 s, 128 kbps), `track-XX.lrc` (timed, −500 ms
offset baked in), `cover-XX.png` (300×300, token palette), `manifest.json`
(seeding contract for the M1 catalog loader — ids, titles, artists, albums,
durations, file paths).

Deterministic: identical output on every machine.
