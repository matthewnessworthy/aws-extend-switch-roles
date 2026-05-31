---
phase: 02-popup-surface
plan: "02"
subsystem: ui
tags: [browser-extension, dom, css-classes, jsdom, mocha]

requires:
  - phase: 01-design-system-foundation
    provides: CSS shells .aesr-role-item__name and .aesr-role-item__account in components.css

provides:
  - Two-line DOM structure in create_role_list_item.js (.aesr-role-item-text wrapping __name + __account spans)
  - Updated unit test assertions matching new JSDOM-serialized innerHTML structure

affects:
  - 02-01-popup-css (popup.css must style .aesr-role-item-text, .aesr-role-item__name, .aesr-role-item__account)
  - 02-03-popup-js-states (popup.js; no direct dependency on this plan's DOM change)

tech-stack:
  added: []
  patterns:
    - "Two-line role item DOM: .aesr-role-item-text flex column wrapping __name (line 1) and __account (line 2)"
    - "textContent throughout for XSS safety — no innerHTML string concatenation"
    - "Test assertions derived from actual JSDOM serialization output, not hand-written"

key-files:
  created: []
  modified:
    - src/js/lib/create_role_list_item.js
    - src/js/lib/create_role_list_item.test.js

key-decisions:
  - "Both files updated atomically in one commit — innerHTML assertions fail the moment the source changes without corresponding test updates"
  - "suffixAccountId class replaced by aesr-role-item__account; swatch border handled in CSS only (no JS border assignment)"
  - "Test assertion strings derived from actual JSDOM output to guarantee serialization accuracy"

patterns-established:
  - "D-02 two-line layout: name span on top (bold via CSS), account span below (muted via CSS), wrapped in .aesr-role-item-text div"
  - "hidesAccountId: true omits .aesr-role-item__account entirely from .aesr-role-item-text — CSS layout handles the single-line case without special rules"

requirements-completed:
  - POP-02
  - POP-05
  - POP-06

duration: 8min
completed: 2026-05-28
---

# Phase 02 Plan 02: Two-line Role Item DOM (D-02) Summary

**DOM restructure replacing flat text node + suffixAccountId span with .aesr-role-item-text wrapper containing .aesr-role-item__name and .aesr-role-item__account spans; 5 innerHTML assertions updated; 33/33 unit tests passing**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-05-28T00:00:00Z
- **Completed:** 2026-05-28T00:08:00Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments

- Replaced flat `document.createTextNode(item.name)` + `class="suffixAccountId"` span with two-line DOM structure (D-02)
- `hidesAccountId: true` now produces `.aesr-role-item-text` with only `.aesr-role-item__name` — no account span
- All preserved lines verified: `headSquare.style.backgroundColor` (lines 6–10), URL validation `parsed.protocol` block (lines 12–26), all `anchor.dataset.*` assignments, `anchor.onclick` handler
- All 5 `innerHTML` assertions in `create_role_list_item.test.js` updated to match actual JSDOM serialization; 33/33 unit tests pass

## Task Commits

1. **Task 1: Two-line DOM in create_role_list_item.js + update all 5 innerHTML assertions** - `115af57` (feat)

**Plan metadata:** (docs commit follows via SUMMARY commit)

## Files Created/Modified

- `src/js/lib/create_role_list_item.js` — DOM build restructured: headSquare appended, then `div.aesr-role-item-text` containing `span.aesr-role-item__name` (always) and `span.aesr-role-item__account` (when !hidesAccountId)
- `src/js/lib/create_role_list_item.test.js` — 5 `innerHTML` assertions updated to new structure; no other assertions changed

## Decisions Made

- Both files committed atomically — the test's exact-string innerHTML assertions break the moment the source DOM changes; splitting them would cause test failure on any intermediate state.
- Swatch border not added in JS — plan explicitly states CSS-only via `.headSquare { border: 1px solid var(--color-border-input) }` in popup.css (plan 02-01's scope).
- Test assertions derived from actual JSDOM output (ran `npm test` with source change but old assertions, copied "actual" from failure output) — eliminates risk of serialization mismatches from hand-written strings.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None. The RED/GREEN cycle confirmed the DOM structure matches the JSDOM serialization exactly, eliminating any assertion-format guessing.

## Known Stubs

None — DOM structure is fully wired; CSS styling is handled by plan 02-01 (sibling wave-1 plan).

## Threat Flags

None. `nameSpan.textContent` and `accountIdSpan.textContent` (not `innerHTML`) confirmed — T-02-02 disposition satisfied. URL validation block (lines 12–26) unchanged — T-02-03 mitigation preserved.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `create_role_list_item.js` now emits class names `.aesr-role-item-text`, `.aesr-role-item__name`, `.aesr-role-item__account` — plan 02-01 (popup.css) must style these
- No blockers for plans 02-01 or 02-03

## Self-Check

- [x] `src/js/lib/create_role_list_item.js` modified — confirmed
- [x] `src/js/lib/create_role_list_item.test.js` modified — confirmed
- [x] Commit `115af57` exists — confirmed
- [x] `npm test` 33/33 — confirmed
- [x] `grep -c "suffixAccountId" create_role_list_item.js` = 0 — confirmed
- [x] `grep -c "aesr-role-item-text" create_role_list_item.js` = 1 — confirmed
- [x] `grep -c "aesr-role-item__name" create_role_list_item.test.js` = 5 — confirmed
- [x] `grep -c "suffixAccountId" create_role_list_item.test.js` = 0 — confirmed
- [x] `grep -c "headSquare.style.backgroundColor" create_role_list_item.js` = 2 — confirmed
- [x] `grep -c "parsed.protocol" create_role_list_item.js` = 1 — confirmed

## Self-Check: PASSED

---
*Phase: 02-popup-surface*
*Completed: 2026-05-28*
