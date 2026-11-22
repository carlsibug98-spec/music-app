# 03 — Design System ("Midnight Leaf")

**Source of truth:** `design/reference-mockup.html` (all values below extracted from its CSS).
**Version:** 1.0 · **Date:** 2026-11-22

The app is dark-first, typography-led, with a single green accent. Every token below is copied from the mockup so the built app matches it pixel-for-pixel; tokens live in `packages/design-tokens/` as JSON and generate Swift/Kotlin constants (see §6).

---

## 1. Color tokens

### 1.1 Core palette

| Token | Value | Usage |
|-------|-------|-------|
| `bg` | `#121212` | App background |
| `black` | `#000000` | Nav bar, true-black layers |
| `card` | `#1F1F1F` | Cards, settings tiles |
| `card2` | `#282828` | Sheets, dialogs |
| `chip` | `#2A2A2A` | Chips, quick-grid tiles, icon buttons |
| `line` | `#2F2F2F` | Hairline dividers |
| `text` | `#FFFFFF` | Primary text |
| `sub` | `#B3B3B3` | Secondary text (mockup `--sub`) |
| `dim` | `#7F7F7F` | Tertiary/disabled — **flagged: raise to `#8F8F8F` for AA contrast on bg** |
| `green` | `#1ED760` | Accent: play buttons, active chips, progress, "now playing" |
| `red` | `#F15E6C` | Destructive (delete, swipe-to-remove) |
| `mini` | `#4A1F16` | Mini-player scrim (per-track tint in practice) |
| `blue` | `#3B8DFF` | Notification dot |

### 1.2 Art gradients (catalog art placeholders, `G` map)

`warm #C7743F→#4A2312` · `warm2 #8A4A2A→#2A140B` · `warm3 #B56A3C→#3B1D0E` · `dark #4D5A66→#171B20` · `blue #3AA7FF→#132A5C` · `gold #F5C96B→#7A4B12` · `green #2FBF8F→#0C4D3A` · `teal #22C1CF→#0B4F57` · `violet #9B72FF→#2B1657` · `sunset #FF8A4C→#7A1F3D` · `grey #A3A9B6→#3A3E49` · `liked #6F5CFF→#C6B8FF` (135°) · `spades #B06A2C→#3A1D0C→#121212`

Real artwork replaces gradients wherever art exists; gradients are the fallback system (deterministic pick from track id hash).

### 1.3 Dynamic tints (Now Playing / mini player)

Each track carries `tint` (gradient top) and `mini` (solid scrim) — Now Playing background is `linear-gradient(180°, tint → bg 62%)`. Mockup examples: Panata `#7A4220/#4A1F16`, Susundan `#1D5FA8/#12305E`. Derive `tint` from artwork's dominant color (client-side palette API) with gradient fallback.

## 2. Typography — Figtree

One family, weights 400–900, letter-spacing tightens as size grows (negative tracking on display sizes).

| Style | Size / weight | Tracking | Usage |
|-------|---------------|----------|-------|
| `hero` | 34–40 / 900 | −0.02em | Artist/playlist/radio heroes |
| `h1` | 26 / 800 | −0.02em | Screen titles |
| `h2` | 20–22 / 700 | −0.01em | Section headers |
| `big` | 22 / 700 | — | Now Playing title |
| `lyric` | 24 / 800 | −0.01em | Full-screen lyric lines |
| `body` | 16 / 500 | — | Track titles (`.t`) |
| `sub` | 14 / 400 | — | Artists, metadata |
| `chip` | 13–14 / 600 | — | Chips, pills, buttons |
| `label` | 12 / 400 | — | "Playing from", timestamps |
| `nav` | 11 / 600 | — | Tab labels |

Line clamps: titles 1 line ellipsis; quick-grid 2 lines (`-webkit-line-clamp: 2` equivalent: `lineLimit(2)` / `TextOverflow.Ellipsis`).

## 3. Spacing, size & radii

- **Base unit 4 px.** Screen horizontal padding 14. Gaps: 6 / 8 / 12 / 14 / 18. Section spacing 24.
- **Rows:** track row min-height 64 (compact 56–58); action sheet rows 50; settings rows ~48.
- **Grids:** quick grid 2 cols, gap 8, tile height 56 (art square 56); browse genres 2 cols, gap 12, tile height 72–86; card carousels 150 px cards, gap 14, edge-bleed padding (scroll content insets).
- **Radii:** art square 4–6 · card 8–10 · sheet 12 top · chip/pill 16 (full) · CTA pill 22 · circle 50 %.
- **Chrome:** status bar inset 44; bottom nav 64 + mini player 56 floating 8 above; device corner 46 (mockup only).

## 4. Motion (from mockup CSS)

| Interaction | Spec |
|-------------|------|
| Screen enter | children rise 8 px + fade, 240 ms `cubic-bezier(.23,1,.32,1)`, staggered |
| Button press | scale 0.97, 160 ms |
| Bottom sheet | slide-up 320 ms `cubic-bezier(.32,.72,0,1)`, scrim fade 250 ms |
| Now Playing overlay | slide-up 380 ms `cubic-bezier(.32,.72,0,1)` |
| Profile drawer | slide-in 320 ms `cubic-bezier(.2,.8,.2,1)` |
| Dialog | scale 0.96→1 + fade, 250 ms |
| Toast | fade 300 ms, auto-dismiss 1.8 s |
| Toggle | thumb slide 200 ms |
| Lyric highlight | color 200 ms + centered scroll 200 ms |
| Queue drag | lift with shadow `0 10px 24px rgba(0,0,0,.5)`, haptic 15 ms on grab |

All motion honors `prefers-reduced-motion` / platform reduce-motion settings (mockup already does — keep it).

## 5. Component inventory (build these once, use everywhere)

| Component | Mockup class | Key spec |
|-----------|--------------|----------|
| TrackRow | `.trow` | 48 px art (circle for artists), title+subtitle, trailing states: green check (downloaded), plus-circle (add), more (…), equalizer bars when playing |
| Chip | `.chip` | 32 px (sm 28), on = green bg/black text, outline variant for filters |
| QuickCard | `.qcard` | 56 px square art + 2-line label, 2-col grid |
| JCard (carousel card) | `.jcard` | 150×150 art (round for artists), title + sub, RADIO badge variant |
| MiniPlayer | `.mini` | Floating 56 px, 2 px top progress, tinted per track, tap → Now Playing |
| NavBar | `.nav` | 64 px, 4 tabs (Home/Search/Library/Create), icon 24 + label 11, active white vs dim |
| NowPlayingControls | `.ctrl` | shuffle · prev · 64 px white play · next · sleep timer |
| ProgressBar | `.track` | 4 px, white fill on 22 % white track, times row 12 px |
| LyricsCard | `.lyr-card` | Preview: current line bold + next 60 %, "Show lyrics" pill |
| LyricsView | `.lyrics-full` | 24/800 lines, active=white, future=50 %, instrumental rows `♪ ♪ ♪` 14 px letter-spaced |
| Sheet | `.sheet` | Grab handle 40×4, max 84 % height, rows 50 px |
| Drawer | `.drawer` | 88 % width left slide |
| Dialog | `.dialog` | Centered card 10 radius, primary text field (green underline, 24/800 centered) |
| Toast | `.toast` | White bg/black text, bottom 132, 1.8 s |
| Toggle | `.toggle` | 44×26, green when on |
| SearchBar | `.top` input | 40 px field in `#242424`, radius 6, leading search icon, clear button |
| HeroHeader | `.hero`/`.artist-hero` | Gradient 300 px, back/more buttons, art 200–220, title, meta rows |
| SettingsTile/Row | `.stile`/`.srow` | 2-col tiles; icon+title+sub rows with chevron |
| QueueRow | `.qrow` | Swipe-left reveal red "Remove", hold-to-lift reorder |
| Avatar | `.avatar` | 32–50 px circle, gradient, initial letter |
| EqBars | `.eq` | 3 bars 3 px, heights 6/12/8, green, animated when playing |
| PillButton | `.pill` | 32 px outline; solid = white bg/black text; follow variant |
| PlayButton | `.play-g` | 56 px green circle, black icon |

**44 named icons** (24 px, 2 px stroke, round caps): home, search, library, plus, plus-circle, check, more, dots, back, down, x, share, queue, device, shuffle, prev, next, pause, play, heart, download, globe, verified, lyrics, settings, arrow-up, grid, sort, pencil, minus, drag, bell, timer, info, clock, chart, user, note, lock, speaker, megaphone, bars, cloud, devices, eye, mail, edit. Bundle as one SF Symbols/Material Icons-mapped set + custom SVGs where needed.

## 6. Platform token pipeline

```
packages/design-tokens/tokens.json
  ├── scripts/gen-swift.sh  → Color/Font/Spacing extensions (iOS)
  └── scripts/gen-kotlin.sh → Compose object (Android)
```

Fonts: bundle `Figtree-Regular/Medium/SemiBold/Bold/ExtraBold/Black.ttf` in both apps (OFL license); fallback SF Pro / Roboto. Dynamic Type / fontScale respected via relative sizing (mockup px ≈ dp/pt 1:1 at default scale).

## 7. Accessibility requirements

- Contrast: text ≥ 4.5:1 (fix `dim` token), green on black = 8.6:1 (ok), black-on-green buttons = ok.
- Touch targets ≥ 44×44 pt/dp (mockup's 36 px icon buttons get invisible 4 px hit insets — mockup already models this with `.ib::after`).
- Focus rings visible (mockup `:focus-visible` green outline — replicate).
- VoiceOver/TalkBack labels on every icon-only control (mockup `aria-label`s are the source list).
- Reduce-motion: disable all §4 transforms.

## 8. De-branding checklist (before any public build)

The mockup replicates Spotify's trade dress. Before shipping: replace the name/logo/wordmark; rename "By Spotify" filter chip → "Curated"; remove "Go Premium" row (P3: no tiers); rename "Spotify code" → "share code"; swap `green #1ED760` if desired (kept for now — green itself is not protected, but the overall trade dress must differ).
