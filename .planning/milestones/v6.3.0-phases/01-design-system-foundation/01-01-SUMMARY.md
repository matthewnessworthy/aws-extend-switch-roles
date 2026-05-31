---
phase: 01-design-system-foundation
plan: 01
subsystem: testing
tags: [playwright, fixtures, preview, design-system, foundation]

requires: []

provides:
  - test/preview/index.html — Playwright navigation target and visual contract for Phases 2-3
  - test/preview/preview.js — MV3 CSP-safe addEventListener-based theme toggle wiring
  - test/emulator/foundation.spec.js — SC1/SC2/SC3-CSP/SC3-FOUC/THM-05 Playwright spec (RED until Wave 1)
  - test/emulator/fixtures.js — testInPreview export (additive, no existing exports modified)

affects:
  - 01-02-design-system-foundation
  - 01-03-design-system-foundation
  - 01-04-design-system-foundation
  - 01-05-design-system-foundation

tech-stack:
  added: []
  patterns:
    - "testInPreview: minimal fixture pattern matching testInSupporters — navigate to chrome-extension URL, invoke pageFunc with { page, expect: test.expect }"
    - "Preview page head wiring: theme-init.js first, then tokens/base/components CSS links — exact order validated by spec"
    - "External addEventListener-based toggle: btn-light/btn-dark/btn-auto wired in preview.js at end of body (no DOMContentLoaded needed)"

key-files:
  created:
    - test/preview/index.html
    - test/preview/preview.js
    - test/emulator/foundation.spec.js
  modified:
    - test/emulator/fixtures.js

key-decisions:
  - "testInPreview follows the minimal testInSupporters pattern (no worker setup, no beforeFunc/afterFunc) — preview page requires no extension storage state"
  - "SC3-FOUC test uses localStorage.setItem + page.reload() as proxy for pre-paint check — data-theme present in parsed DOM proves theme-init.js ran synchronously before layout/paint"
  - "foundation.spec.js is intentionally RED at Wave 0 — turns green after Wave 1 (plans 02-04) delivers src/css/*.css and Wave 2 (plan 05) wires build_test.sh"
  - "inline style attribute on #token-probe (CSS vars) is MV3-compliant — MV3 CSP blocks inline <script> and on* handlers, not style attributes"

patterns-established:
  - "Preview page as living visual contract: component shells in test/preview/ serve as the reference Phases 2-3 build against"
  - "Wave 0 Nyquist rule: test scaffolds committed before implementation waves so executor gets immediate red/green feedback after each task commit"

requirements-completed:
  - FND-01
  - FND-03
  - THM-03
  - THM-05

duration: 12min
completed: 2026-05-28
---

# Phase 1 Plan 01: Wave 0 Test Scaffolds Summary

**Playwright preview page + MV3-compliant toggle wiring + 5-case foundation spec covering SC1/SC2/SC3-CSP/SC3-FOUC/THM-05 (RED until Wave 1 CSS lands)**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-05-28T07:03:00Z
- **Completed:** 2026-05-28T07:15:36Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Added `testInPreview` export to fixtures.js following the `testInSupporters` minimal pattern; existing exports unmodified
- Created `test/preview/index.html` with all ROADMAP SC2 component shells (buttons, inputs, select, checkbox/radio, role-list item, pane, divider, empty-state, loading-state, alert/error) plus `#token-probe` for SC1 computed-style assertion; no inline `onclick` handlers (MV3 CSP compliant); 106 lines
- Created `test/preview/preview.js` as a plain non-module script with `addEventListener`-based wiring for `btn-light`, `btn-dark`, `btn-auto` — no `DOMContentLoaded` guard needed because script loads at end of body
- Created `test/emulator/foundation.spec.js` with 5 test cases: SC1 (token computed-style flip), SC2 (shell visibility in both themes), SC3-CSP (zero CSP console violations after reload), SC3-FOUC (data-theme present in DOM after localStorage precondition + reload), THM-05 (color-scheme computed value matches active theme)

## Task Commits

1. **Task 1: Add testInPreview to fixtures.js** — `deebd32` (feat)
2. **Task 2: Create test/preview/index.html and test/preview/preview.js** — `1112860` (feat)
3. **Task 3: Create test/emulator/foundation.spec.js** — `bcd5832` (test)

## Files Created/Modified

- `test/emulator/fixtures.js` — `testInPreview` export appended after `testInSupporters`
- `test/preview/index.html` — Playwright navigation target; full component-shell set; head wiring order matches production; no inline handlers
- `test/preview/preview.js` — plain non-module toggle wiring; addEventListener-based; 3 handlers
- `test/emulator/foundation.spec.js` — 5-case Playwright spec; imports `testInPreview`; intentionally RED at Wave 0

## Decisions Made

- `testInPreview` uses minimal `testInSupporters` pattern (no worker setup) because the preview page needs no extension storage state
- SC3-FOUC test proxy: `localStorage.setItem('visualMode', 'dark')` → `page.reload()` → assert `data-theme='dark'` on `<html>`. This is the standard "set before first paint" proxy — if theme-init.js runs synchronously in head, the attribute is present in the parsed DOM.
- `#token-probe` uses an inline `style` attribute with CSS vars (`var(--color-bg-layout)`). This is MV3-compliant: MV3 CSP blocks inline `<script>` and `on*=` event handlers, not `style` attributes.
- foundation.spec.js is intentionally RED at Wave 0 per Nyquist rule — turns green after Wave 1 (plans 02-04) delivers `src/css/*.css` and Wave 2 (plan 05) wires `build_test.sh` to copy CSS into the test extension.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

The `node -e "import('./test/emulator/foundation.spec.js').catch(...)"` verification in the plan triggers Playwright's runtime guard ("Playwright Test did not expect test() to be called here") when the file is dynamically imported outside a Playwright context. This is not a syntax error — it is Playwright's own protection mechanism. Validated with `node --input-type=module --check < test/emulator/foundation.spec.js` instead, which confirms syntax is clean.

## Known Stubs

None — Wave 0 creates test scaffolds only. The spec tests are intentionally failing (RED) until CSS is delivered in Waves 1-2; this is by design, not a stub.

## Threat Flags

None — Wave 0 only adds test-tree files. No new network endpoints, no new extension permissions, no manifest changes, no auth paths. `test/preview/` is never copied to `dist/` (kept out of `src/` per D-01).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Wave 0 complete: all 4 files present and committed
- Plans 01-02 (tokens.css + base.css) and 01-03 (components.css + theme-init.js) can now commit CSS and the spec will begin turning green
- Plan 01-04 (head wiring on 5 HTML pages) and 01-05 (build pipeline) are unblocked
- The preview page path (`test/preview/index.html`) and fixture name (`testInPreview`) are locked — downstream specs must import from `./fixtures.js` and navigate via `chrome-extension://${extensionId}/preview/index.html`

---
*Phase: 01-design-system-foundation*
*Completed: 2026-05-28*
