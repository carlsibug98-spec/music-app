# Token schema (informal)

`tokens.json` is the single source of truth for the Resona design system
("Midnight Leaf", docs/03-DESIGN-SYSTEM.md). Edit it, then regenerate the
platform constants — never edit the generated files by hand.

```
color    : named colors (hex). `dim` was raised to #8F8F8F for AA contrast.
gradient : 2–3 stop fallback art gradients (deterministic pick by track id hash).
type     : Figtree family; styles = size range / weight / tracking (em).
space    : 4px base grid; screen padding, row heights, chrome sizes.
radius   : corner radii (dp/pt 1:1 with mockup px).
motion   : durations in ms + cubic-bezier control points.
```

Run `npm run tokens` from the repo root. Outputs:

- `apps/android/app/src/main/java/com/resona/app/ui/theme/GeneratedTokens.kt`
- `apps/ios/Resona/Theme/GeneratedTokens.swift`
