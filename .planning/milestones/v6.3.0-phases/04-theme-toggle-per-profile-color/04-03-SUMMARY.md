---
phase: 04-theme-toggle-per-profile-color
plan: "03"
subsystem: popup
tags: [theme, popup, live-update, reconcile, wave-2]
dependency_graph:
  requires:
    - 04-01 (src/js/lib/theme.js#applyTheme, src/js/lib/theme.js#installVisualModeListener)
  provides:
    - src/js/popup.js#installVisualModeListener (call-site)
    - src/js/popup.js#reconcile (visualMode cache vs sync)
  affects:
    - Theme live-update in popup context when options page toggles visualMode
tech_stack:
  added: []
  patterns:
    - storageRepo.get augmented with 'visualMode' key for post-load reconcile
    - installVisualModeListener() registered in window.onload for live storage.onChanged updates
key_files:
  created: []
  modified:
    - src/js/popup.js
decisions:
  - "installVisualModeListener() placed immediately after noMainEl assignment, before MANY_SWITCH_COUNT declaration — satisfies acceptance criterion ordering"
  - "|| 'default' normalization on both sides of reconcile comparison prevents spurious repaint on clean install (undefined sync value vs localStorage 'default')"
metrics:
  duration: ~10 min (Task 1 complete)
  completed: "2026-05-28"
  tasks_completed: 2
  tasks_pending: 0
  files_created: 0
  files_modified: 1
---

# Phase 4 Plan 03: Popup Theme Wiring Summary

**One-liner:** popup.js wired with `installVisualModeListener()` and post-load reconcile of localStorage cache vs `chrome.storage.sync['visualMode']`; per-profile color swatches verified in both themes.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add import, installVisualModeListener, and post-load reconcile to popup.js | c2fea9a | src/js/popup.js |
| 2 | Verify per-profile color swatches render in both themes (SC #4) | (human-verified) | — |

## Human Verification Result (Task 2)

**Status:** Approved
Per-profile color swatches (hex fill + 1px `var(--color-border-input)` border) render correctly in both light and dark themes. Popup live-repaints `data-theme` when options page toggles theme without reload. Stored hex values unchanged.

## Verification Results (Task 1)

- `npm test`: 39 passing (unchanged from Plan 01 baseline — no regressions)

## Deviations from Plan

None — plan executed exactly as written for Task 1.

## Known Stubs

None — all three changes in popup.js are real wiring to `theme.js` exports.

## Threat Flags

None — changes touch only localStorage read/write and chrome.storage.sync get callback. No new network endpoints, auth paths, or schema changes.

## Self-Check: PASSED

- [x] src/js/popup.js import block contains `import { applyTheme, installVisualModeListener } from './lib/theme.js'`
- [x] src/js/popup.js window.onload body contains `installVisualModeListener();` before `const MANY_SWITCH_COUNT`
- [x] src/js/popup.js storageRepo.get call uses keys `['autoTabGrouping', 'visualMode']`
- [x] Reconcile block present: `const cachedMode = localStorage.getItem('visualMode') || 'default';` + applyTheme call
- [x] Existing `if (autoTabGrouping)` block present and unmodified
- [x] Commit c2fea9a exists
- [x] `npm test` exits 0 with 39 passing
- [x] Per-profile swatches approved by human verify (light + dark themes)
