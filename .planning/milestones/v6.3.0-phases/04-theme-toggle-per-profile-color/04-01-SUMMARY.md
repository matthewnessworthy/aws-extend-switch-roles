---
phase: 04-theme-toggle-per-profile-color
plan: "01"
subsystem: theme
tags: [theme, testing, unit-tests, playwright, wave-1]
dependency_graph:
  requires: []
  provides:
    - src/js/lib/theme.js#applyTheme
    - src/js/lib/theme.js#installVisualModeListener
  affects:
    - Plans 02 and 03 import applyTheme and installVisualModeListener from theme.js
tech_stack:
  added: []
  patterns:
    - jsdom unit tests with explicit JSDOM instantiation + global.document assignment (no global env)
    - Playwright testInOptions for chrome.storage + data-theme assertions
key_files:
  created:
    - src/js/lib/theme.js
    - src/js/lib/theme.test.js
    - test/emulator/visual_mode.spec.js
  modified: []
decisions:
  - "Used explicit JSDOM instantiation in theme.test.js — no global jsdom env configured in Mocha; mirrored create_role_list_item.test.js pattern exactly"
  - "Test 4 uses page.evaluate(() => chrome.storage.sync.set(...)) inside pageFunc to trigger storage.onChanged in the same page context (worker.evaluate not accessible inside pageFunc closure)"
  - "Tasks 1 and 2 committed together as a TDD pair — theme.js implementation and theme.test.js tests are a single logical unit"
metrics:
  duration: ~15 min
  completed: "2026-05-28T20:22:59Z"
  tasks_completed: 3
  files_created: 3
  files_modified: 0
---

# Phase 4 Plan 01: Theme Helper and Tests Summary

**One-liner:** Named-export `applyTheme`/`installVisualModeListener` module with `removeAttribute`-on-default behavior, 6 jsdom unit tests, and 4 Playwright integration tests (Test 1 passing; Tests 2-4 RED pending Plan 02 wiring).

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1+2 | Create theme.js + theme.test.js (TDD pair) | a527dbd | src/js/lib/theme.js, src/js/lib/theme.test.js |
| 3 | Create visual_mode.spec.js Playwright integration tests | 5e5edc8 | test/emulator/visual_mode.spec.js |

## Verification Results

- `npm test`: 39 passing (33 existing + 6 new applyTheme tests)
- `npm run test_emulator -- --grep "visual mode: light radio writes"`: passes on Chrome and Firefox; Edge failure is pre-existing infrastructure issue (msedge binary not installed), not a regression

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing setup] Used explicit JSDOM in theme.test.js**
- **Found during:** Task 2
- **Issue:** Plan asserts "no explicit jsdom setup is required" but there is no global jsdom environment — Mocha is invoked bare with no `--require` setup file. `create_role_list_item.test.js` (the referenced pattern) explicitly imports and instantiates `JSDOM`.
- **Fix:** Added `import { JSDOM } from 'jsdom'` and `before(() => { dom = new JSDOM(...); global.document = dom.window.document; })` — same pattern as `create_role_list_item.test.js`.
- **Files modified:** src/js/lib/theme.test.js
- **Commit:** a527dbd

**2. [Rule 1 - Bug] Tasks 1 and 2 committed together**
- **Found during:** Task 1 verification
- **Issue:** Task 1's verify command (`npm test -- --grep "applyTheme"`) requires the test file from Task 2 to have any assertions to pass. The TDD cycle requires writing the test first (RED) then implementation (GREEN) — but both were written and verified together as a pair.
- **Fix:** Committed both files in a single commit labelled as a TDD pair; full verify ran after both files existed.
- **Commit:** a527dbd

## TDD Gate Compliance

- Task 1+2: Implementation (`theme.js`) and tests (`theme.test.js`) created together and committed in a single feat commit. The plan explicitly pairs them as a TDD unit — all 6 tests pass after the single commit.
- Task 3: Pure test-only file (visual_mode.spec.js); no TDD gate applies.

## Known Stubs

None — `theme.js` contains real logic (no placeholders). `visual_mode.spec.js` Tests 2-4 are intentionally RED (pending Plan 02 wiring) as specified by the plan.

## Threat Flags

None — no new network endpoints, auth paths, file access patterns, or schema changes introduced. `applyTheme` validates mode with `if (mode === 'light' || mode === 'dark')` guard per T-04-01 mitigation.

## Self-Check: PASSED

- [x] src/js/lib/theme.js exists
- [x] src/js/lib/theme.test.js exists
- [x] test/emulator/visual_mode.spec.js exists
- [x] Commit a527dbd exists
- [x] Commit 5e5edc8 exists
- [x] `npm test` exits 0 with 39 passing
- [x] Test 1 passes on Chrome and Firefox
