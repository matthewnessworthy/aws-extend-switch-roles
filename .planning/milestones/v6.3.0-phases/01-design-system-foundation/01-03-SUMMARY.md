---
phase: 01-design-system-foundation
plan: 03
subsystem: css-primitives
tags: [css, reset, base, components, tokens, design-system, a11y, focus-ring]

requires:
  - 01-01 (preview page + test spec that validates .aesr-* class names)

provides:
  - src/css/base.css — global reset, system font stack, :focus-visible ring (2px/2px/4px tokenized)
  - src/css/components.css — 11 reusable component shells (.aesr-*) all consuming var(--token)

affects:
  - 01-02-design-system-foundation (tokens.css must be linked before base.css in <head>)
  - 01-04-design-system-foundation (head wiring links these files on all 5 HTML pages)
  - 01-05-design-system-foundation (build pipeline copies src/css/ to dist/)
  - Phase 2 (popup surface builds on these shells)
  - Phase 3 (options/aux surfaces build on these shells)

tech-stack:
  added: []
  patterns:
    - "Token-only component shells: all color/size/spacing via var(--token), zero hardcoded hex"
    - "CSS-only spinner: border + border-top-color + @keyframes aesr-spin, no JS/asset dep"
    - ":focus-visible global ring in base.css as the Phase-1 a11y contract (T-1-03-02)"
    - "scrollbar-width: thin on * for Firefox/Edge + reliance on color-scheme for native theming"

key-files:
  created:
    - src/css/base.css
    - src/css/components.css
  modified: []

key-decisions:
  - "D-02 reset bleed accepted: base.css ships full global reset, popup insulated by source-order (inline <style> wins at equal specificity)"
  - "All component shells use .aesr-* prefix (locked in Plan 01 Claude's Discretion decision)"
  - ":focus-visible ring declared in base.css as an inviolable a11y contract — surface phases must not override with outline:none without equivalent replacement (T-1-03-02)"
  - "aesr-btn--primary text color uses var(--color-bg-layout) which inverts with theme — white on light, dark-bg on dark"
  - "CSS-only spinner uses border + border-top-color + @keyframes (no asset, no dependency)"

metrics:
  duration: ~2 min
  completed: 2026-05-28
  tasks: 2
  files: 2
---

# Phase 1 Plan 03: Base CSS Primitives and Component Shells Summary

**Global reset + tokenized :focus-visible ring in base.css; 11 .aesr-* component shells consuming only var(--token) in components.css**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-05-28T07:19:23Z
- **Completed:** 2026-05-28T07:21:56Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created `src/css/base.css` (110 lines): universal box-sizing reset, html `-webkit-text-size-adjust`, body reset with system-font typography tokens, h1-h6 heading defaults, paragraph/list resets, link base, tokenized `:focus-visible` ring (2px solid var(--color-border-focus), 2px offset, var(--radius-focus-ring)), scrollbar-width: thin. Includes D-02 comment block. No @font-face, no hardcoded hex.
- Created `src/css/components.css` (263 lines): all 11 ROADMAP SC2 shell categories — button (base + primary + normal with hover states), input (with disabled), textarea (monospace, resize: vertical), select, checkbox/radio (accent-color), role-list item (with __account/__name sub-elements), pane/container (border-radius + shadow), divider, empty-state (centered stack, __heading/__body slots, white-space: pre-wrap), loading-state (CSS-only aesr-spin spinner, __body slot), alert/error (Cloudscape flashbar shell, --error modifier with left border). Zero hardcoded hex; 40 var(--color-*) references.

## Task Commits

1. **Task 1: Create src/css/base.css** — `fff8236` (feat)
2. **Task 2: Create src/css/components.css** — `e3267bb` (feat)

## Files Created/Modified

- `src/css/base.css` — 110 lines; reset, typography, link, :focus-visible, scrollbar
- `src/css/components.css` — 263 lines; 11 shell categories, 40 color token refs, CSS-only spinner

## Decisions Made

- `:focus-visible` ring authored in base.css as the Phase-1 a11y contract; surface phases must not weaken it (T-1-03-02 mitigation)
- `aesr-btn--primary` text color uses `var(--color-bg-layout)` rather than a dedicated "white" token — this auto-inverts to the dark background in dark theme, achieving the correct contrast in both themes with one rule
- CSS-only spinner in `.aesr-state-loading__spinner` uses `border` + `border-top-color` + `@keyframes aesr-spin` — no asset, no dependency, MV3-safe
- D-02 comment block at top of base.css explains the reset bleed scope and the source-order insulation for popup

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — both files are complete component shells. All 11 SC2 shell categories are present with correct token-only styling. No placeholder text, no hardcoded values. The component shells are intentionally unstyled beyond their structural/semantic purpose (surface-specific styling lands in Phases 2-3).

## Threat Flags

None — both files are static CSS in the extension bundle. No new network endpoints, no external fetches, no new permissions. The `:focus-visible` ring in base.css actively mitigates T-1-03-02 (focus-ring removal threat).

## Self-Check

- [x] src/css/base.css exists: FOUND
- [x] src/css/components.css exists: FOUND
- [x] Commit fff8236 exists: FOUND
- [x] Commit e3267bb exists: FOUND
- [x] :focus-visible in base.css: 3 occurrences (selector, outline, border-radius rules)
- [x] var(--color-border-focus) in base.css: FOUND
- [x] No @font-face in either file: CONFIRMED (0 matches)
- [x] .aesr-btn in components.css: FOUND
- [x] .aesr-pane in components.css: FOUND
- [x] .aesr-alert--error in components.css: FOUND
- [x] .aesr-state-empty in components.css: FOUND
- [x] .aesr-role-item in components.css: FOUND
- [x] No hardcoded hex in components.css: CONFIRMED (0 matches)
- [x] 14 aesr-* pattern matches in components.css

## Self-Check: PASSED

## User Setup Required

None.

## Next Phase Readiness

- Plan 01-02 (tokens.css + theme-init.js) and Plan 01-03 (base.css + components.css) complete the Wave 1 CSS deliverables
- Plan 01-04 can now wire the `<head>` of all 5 HTML pages (adding the `<link>` chain and `<script src="theme-init.js">` first child)
- Plan 01-05 can wire the build pipeline (copy src/css/ to dist/ in build.sh; same + theme-init.js verbatim-copy skip in build_test.sh)
- `test/emulator/foundation.spec.js` SC2 test (shell visibility in both themes) will turn green after Plans 01-04 + 01-05 wire the HTML pages and build pipeline

---
*Phase: 01-design-system-foundation*
*Completed: 2026-05-28*
