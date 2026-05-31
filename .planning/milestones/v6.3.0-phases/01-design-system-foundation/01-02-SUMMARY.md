---
phase: 01-design-system-foundation
plan: 02
subsystem: design-system
tags: [css-tokens, theming, pre-paint, FOUC, cloudscape, dark-mode]

requires:
  - 01-01-SUMMARY.md

provides:
  - src/css/tokens.css — Full Cloudscape Visual Refresh semantic token set, 3-layer cascade
  - src/js/theme-init.js — Pre-paint synchronous theme setter (non-module)

affects:
  - 01-03-design-system-foundation (base.css + components.css consume these tokens)
  - 01-04-design-system-foundation (HTML head wiring links tokens.css + theme-init.js)
  - 01-05-design-system-foundation (build pipeline copies both files to dist/)

tech-stack:
  added: []
  patterns:
    - "3-layer CSS cascade: :root light defaults → @media OS dark with :not() guards → [data-theme] explicit override"
    - "color-scheme per theme on :root — native controls (checkboxes, radios, scrollbars) follow active theme on Chrome/Firefox/Edge"
    - "localStorage pre-paint cache: synchronous read of 'visualMode' in <head> before first paint to prevent FOUC"

key-files:
  created:
    - src/css/tokens.css
    - src/js/theme-init.js
  modified: []

key-decisions:
  - "OS dark @media block guarded by :not([data-theme='light']):not([data-theme='dark']) — manual choice always beats OS preference"
  - ":root[data-theme='light'] block contains only color-scheme: light — token values inherited from :root; no duplication"
  - "theme-init.js is top-level synchronous statements, no IIFE — pre-paint scripts need no module scoping or self-calling wrapper"
  - "--color-bg-button-primary-hover dark value deferred to Phase 2 per UI-SPEC; only light value (#004a9e) declared in :root"
  - "--color-border-control stays #8c8c94 in both themes (same value light and dark per UI-SPEC); not redeclared in dark blocks"

metrics:
  duration: 8min
  completed: 2026-05-28
---

# Phase 1 Plan 02: Token Layer and Pre-Paint Theming Engine Summary

**3-layer Cloudscape Visual Refresh token cascade in tokens.css + synchronous localStorage-based pre-paint theme setter in theme-init.js**

## Performance

- **Duration:** ~8 min
- **Completed:** 2026-05-28
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created `src/js/theme-init.js` as a plain non-module synchronous script: reads `localStorage.getItem('visualMode')`, allowlist-checks for `'light'` or `'dark'`, sets/removes `data-theme` on `document.documentElement`. Exactly 6 lines; no IIFE, no imports, no matchMedia, no event listeners. Fixes the FOUC bug (THM-03) where the previous theme application was deferred inside a post-load async chrome.storage callback.
- Created `src/css/tokens.css` with the full 3-layer Cloudscape Visual Refresh token cascade: Layer 1 `:root` with all ~30 semantic tokens at light values + `color-scheme: light`; Layer 2 `@media (prefers-color-scheme: dark)` with dual `:not()` guards; Layer 3a `:root[data-theme="dark"]` explicit dark override; Layer 3b `:root[data-theme="light"]` with `color-scheme: light` only. All typography, spacing, radius, and elevation tokens also declared. No `color-mix()`, no `@font-face`, no `@cloudscape-design/*`.

## Task Commits

1. **Task 1: Create src/js/theme-init.js** — `5dc73dd` (feat)
2. **Task 2: Create src/css/tokens.css** — `463cd32` (feat)

## Files Created/Modified

- `src/js/theme-init.js` — 6-line synchronous pre-paint theme setter; non-module; allowlist check prevents arbitrary localStorage values being set as data-theme
- `src/css/tokens.css` — 164 lines; 3-layer cascade; full semantic token set for light and dark; color-scheme declared at all 3 cascade positions (THM-05)

## Decisions Made

- OS dark `@media` block is guarded by `:root:not([data-theme="light"]):not([data-theme="dark"])` — the critical correctness detail that makes manual override beat OS preference
- `:root[data-theme="light"]` block carries only `color-scheme: light` — token values are already set in Layer 1 `:root`; redeclaring them would be redundant and create a maintenance surface
- `theme-init.js` uses top-level synchronous statements (no IIFE wrapper) — a pre-paint script that runs as the first `<head>` child needs no module scoping or invocation ceremony
- `--color-bg-button-primary-hover` dark value is explicitly omitted from dark overrides — UI-SPEC marks it "(derived)" and defers the hex to Phase 2 when the first primary button is placed
- `--color-border-control` not redeclared in dark blocks — it is `#8c8c94` in both themes per UI-SPEC; :root value is inherited unchanged

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None — this plan creates static CSS token definitions and a pre-paint script. No dynamic data sources, no placeholder text, no UI surfaces.

## Threat Flags

None — both files are static assets bundled with the extension. `theme-init.js` includes the allowlist check (T-1-02-01 mitigation: only 'light'/'dark' values result in setAttribute; all others hit removeAttribute). No external network access, no new permissions, no manifest changes.

## Self-Check: PASSED

### Files exist:
- FOUND: src/css/tokens.css
- FOUND: src/js/theme-init.js

### Commits exist:
- FOUND: 5dc73dd (feat(01-02): create theme-init.js pre-paint engine)
- FOUND: 463cd32 (feat(01-02): create tokens.css 3-layer Cloudscape token cascade)
