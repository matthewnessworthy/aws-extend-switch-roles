---
phase: 02-popup-surface
plan: "03"
subsystem: popup-js
tags: [popup, state-renderers, dark-mode-removal, loading-state, empty-state]
dependency_graph:
  requires: []
  provides: [typed-state-renderers, showNotOnAws, showNoRoles, showLoading, showError]
  affects: [src/js/popup.js]
tech_stack:
  added: []
  patterns: [DOM-API createElement/textContent, inline style.display toggle, onclick wired at element construction]
key_files:
  created: []
  modified:
    - src/js/popup.js
decisions:
  - "showMessage() replaced by four typed DOM-API renderers matching PATTERNS.md verbatim specification"
  - "visualMode storage key removed from storageRepo.get() call since darkMode toggle is gone; autoTabGrouping fetch preserved"
  - "sendSwitchRole Prism error also routed through showError() (not in plan scope but blocked test would break acceptance)"
metrics:
  duration: "8 minutes"
  completed: "2026-05-28"
  tasks_completed: 1
  tasks_total: 1
  files_changed: 1
---

# Phase 2 Plan 03: Typed State Renderers and darkMode Removal Summary

Replaced monolithic `showMessage()` with four typed DOM-API state renderer functions (`showNotOnAws`, `showNoRoles`, `showLoading`, `showError`), removed the `.darkMode` classList mutation from `popup.js`, added a loading state before `executeAction('loadInfo')`, added an empty-profiles guard in `loadFormList`, and routed all call sites through the new renderers.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Remove .darkMode toggle and replace showMessage() with typed state renderers | 0058dab | src/js/popup.js |

## Verification

- `npm test`: 33/33 passing
- `grep -c "classList.add('darkMode')"`: 0
- `grep -c "showMessage"`: 0
- `grep -c "showNotOnAws\|showNoRoles\|showLoading\|showError"`: 10 (4 definitions + 6 call sites)
- `grep -c "aesr-open-options-link"`: 1 (wired at element construction in showNoRoles)
- `grep -c "profiles.length === 0"`: 1 (empty-profiles guard before renderRoleList)
- `grep -c "noMainEl.style.display"`: 6 (inline style toggle preserved in all renderers)
- `grep -c "Loading roles"`: 1 (D-07 copy present)
- `grep -c "Navigate to the AWS console"`: 1 (D-05 copy present)
- `grep -c "No roles match"`: 1 (D-06 copy present)
- `grep -c "Open Configuration"`: 1 (D-06 CTA label present)
- `grep -c "autoTabGrouping"`: 6 (storageRepo.get block preserved for autoTabGrouping)
- `aesr-alert--error` only appears in `showError()` definition — not in OAuth success path

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] sendSwitchRole Prism error still called showMessage()**
- **Found during:** Task 1 verification (grep for showMessage returning 0)
- **Issue:** `sendSwitchRole()` at popup.js:255 had a `showMessage(...)` call not listed in the plan's CHANGE list
- **Fix:** Replaced with `showError("Switch failed: this session doesn't have permission to switch to target profile.")`
- **Files modified:** src/js/popup.js
- **Commit:** 0058dab (included in same commit)

**2. [Rule 1 - Cleanup] Removed unused `visualMode` from storageRepo.get() call**
- **Found during:** Task 1 (after removing the darkMode if-block, `visualMode` was fetched but unused)
- **Fix:** Changed `storageRepo.get(['visualMode', 'autoTabGrouping'])` to `storageRepo.get(['autoTabGrouping'])` and removed destructured `{ visualMode, autoTabGrouping }` → `{ autoTabGrouping }`
- **Files modified:** src/js/popup.js
- **Commit:** 0058dab (included in same commit)

## Known Stubs

None — all state renderers use authored constants (D-05/D-06/D-07 locked copy). No placeholder text or empty data sources.

## Threat Flags

None — no new network endpoints, auth paths, or trust boundaries introduced. T-02-04 mitigation confirmed: `showError` uses `body.textContent = msg` throughout; `err.message` is never concatenated into `innerHTML`.

## Self-Check: PASSED

- src/js/popup.js: FOUND
- Commit 0058dab: FOUND (git rev-parse --short HEAD)
