---
phase: 05-accessibility-cross-browser-release-audit
plan: 01
subsystem: ui
tags: [accessibility, aria, wcag, contrast, css-tokens]

requires:
  - phase: 04-theme-toggle-per-profile-color
    provides: theme tokens and per-profile color swatch rendering this plan adjusts for contrast
provides:
  - 6 ARIA label/alt gaps closed across popup, options, supporters HTML (A11Y-02)
  - dark input-border contrast raised to WCAG 1.4.11 3:1 in both dark cascade paths (A11Y-03)
  - default role swatch fill raised to WCAG AA in light theme (A11Y-03)
affects: [05-02, 05-03]

tech-stack:
  added: []
  patterns:
    - "Attribute-only ARIA additions (aria-label/alt/aria-hidden) — no structural/semantic DOM changes"

key-files:
  created: []
  modified:
    - src/popup.html
    - src/options.html
    - src/supporters.html
    - src/css/tokens.css
    - src/js/lib/create_role_list_item.js
    - src/js/lib/create_role_list_item.test.js

key-decisions:
  - "DECISION (Task 3 checkpoint): option-yes — add @axe-core/playwright as a devDependency for automated WCAG verification in Plan 02. Plan 02 must run its blocking legitimacy checkpoint before installing."
  - "Token-specific verification used for the contrast fix instead of the plan's literal `grep -c '656871' -eq 0`, which is unsatisfiable without corrupting 3 out-of-scope tokens (plan-verify bug)."

patterns-established:
  - "ARIA gap closure is attribute-only; existing id/class/name/structure are never altered (preserves Playwright ID-selector locators)"

requirements-completed: [A11Y-02, A11Y-03]

duration: 5min
completed: 2026-05-29
---

# Phase 05 / Plan 01: Accessibility Code Fixes Summary

**Closed 6 ARIA label/alt gaps and raised two failing contrast values (dark input border `#656871`→`#6e6e7a`, default swatch fill `#aaaaaa`→`#767676`) to WCAG AA; unit suite green; chose to add axe-core devDep for Plan 02.**

## Performance

- **Duration:** ~5 min
- **Tasks:** 2 auto-tasks complete; stopped at Task 3 decision checkpoint (now resolved)
- **Files modified:** 6

## Accomplishments
- A11Y-02: aria-label on #roleFilter ("Filter roles"), #roleList ("AWS roles"); alt on #goldenkey; aria-label on #awsConfigTextArea, #colorPicker, #colorValue; aria-hidden on the decorative `<b>#</b>`; aria-label on #textareaKeyCode. `style="display: none"` preserved on #keyCodeValid/#keyCodeInvalid.
- A11Y-03: `--color-border-input` raised to `#6e6e7a` in BOTH dark activation paths (`@media (prefers-color-scheme: dark)` and `:root[data-theme="dark"]`); default swatch fill `#767676` in JS with matching `rgb(118, 118, 118)` unit-test assertions. The `|| 'aaaaaa'` dataset.color fallback and `dataset.color).to.eq('aaaaaa')` assertion were left intact (stored-config key, not a CSS fill).
- `npm test`: all 39 unit tests pass (exit 0).

## Task Commits

1. **Task 1: Add ARIA labels and alt to HTML gaps (A11Y-02)** — `bb61282` (fix)
2. **Task 2: Fix contrast failures — tokens.css and swatch default (A11Y-03)** — `7eb208c` (fix)

## Files Created/Modified
- `src/popup.html` — aria-label on #roleFilter and #roleList; alt on #goldenkey
- `src/options.html` — aria-label on #awsConfigTextArea/#colorPicker/#colorValue; aria-hidden on decorative `<b>`
- `src/supporters.html` — aria-label on #textareaKeyCode
- `src/css/tokens.css` — `--color-border-input: #6e6e7a` in both dark blocks
- `src/js/lib/create_role_list_item.js` — default swatch fill `#767676`
- `src/js/lib/create_role_list_item.test.js` — innerHTML assertions updated to `rgb(118, 118, 118)` (×2)

## Decisions Made
- **Axe-core devDep (Task 3 checkpoint): option-yes.** User approved adding `@axe-core/playwright` for automated WCAG 2.1 AA scanning in Plan 02. The package is tagged [ASSUMED] in research — Plan 02 includes a blocking-human legitimacy checkpoint (verify Deque authorship, no postinstall, >500K weekly downloads) before the install.

## Deviations from Plan

### Documented (not acted on) — Plan verify-step bug

**1. [Plan-verify defect] Task 2 `<verify>` criterion `grep -c '656871' src/css/tokens.css` expecting 0 is unsatisfiable**
- **Found during:** Task 2
- **Issue:** `src/css/tokens.css` contains 5 total occurrences of `#656871`. Only 2 are `--color-border-input` (lines 109, 148) — the authorized targets per 05-PATTERNS.md. The other 3 are out-of-scope tokens: `--color-text-form-secondary` (line 14, light theme) and `--color-text-disabled` (lines 91, 130, dark themes). Satisfying the literal `grep -c '656871' -eq 0` would require corrupting those 3 unrelated tokens.
- **Resolution:** Changed ONLY the two `--color-border-input` lines (verified: 0× `--color-border-input: #656871`, 2× `#6e6e7a`, 3× residual unrelated `#656871`). Used token-specific verification instead of the buggy literal grep. No scope expansion.
- **Verified by orchestrator:** Yes (grep counts confirmed post-commit).

### Follow-up noted (deferred — out of scope for this plan)
- The 3 residual `#656871` tokens were not evaluated for contrast in this plan (05-PATTERNS.md scoped the audit to the 2 border values). `--color-text-disabled` is WCAG-1.4.3-exempt (disabled controls); `--color-text-form-secondary` (#656871 ≈ rgb(101,104,113)) passes AA on light surfaces. No action taken; flagged for the phase verifier to confirm the A11Y-03 audit scope was complete.

## Issues Encountered
None during planned work.

## Next Phase Readiness
- All Plan 01 code changes committed. Plan 02 can run the full suite and proceed on the **option-yes** path (install axe-core after the legitimacy checkpoint, write `test/emulator/a11y.spec.js`).

---
*Phase: 05-accessibility-cross-browser-release-audit*
*Completed: 2026-05-29*
