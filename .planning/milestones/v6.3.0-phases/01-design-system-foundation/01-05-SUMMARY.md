---
phase: 01-design-system-foundation
plan: 05
subsystem: build-pipeline
tags: [build, css, theme-init, preview, rollup-skip, FND-03]

requires:
  - 01-02-SUMMARY.md (src/css/tokens.css + src/js/theme-init.js)
  - 01-03-SUMMARY.md (src/css/base.css + src/css/components.css)

provides:
  - bin/build.sh — production build copies src/css/ and theme-init.js into dist/chrome/ and dist/firefox/
  - bin/build_test.sh — test build copies src/css/ + theme-init.js verbatim + test/preview/ into test/extension/

affects:
  - dist/chrome/css/ — tokens.css, base.css, components.css
  - dist/firefox/css/ — tokens.css, base.css, components.css
  - dist/chrome/js/theme-init.js
  - dist/firefox/js/theme-init.js
  - test/extension/css/ — tokens.css, base.css, components.css
  - test/extension/js/theme-init.js
  - test/extension/preview/ — index.html, preview.js

tech-stack:
  added: []
  patterns:
    - "\\cp -r src/css dist/$brw/ inside for-brw loop — copies all 3 CSS files to both browser dist dirs"
    - "theme-init.js verbatim copy via \\cp -f in build.sh; skip guard + post-loop cp in build_test.sh"
    - "Rollup skip guard: if [ \"$fname\" = \"theme-init.js\" ]; then continue; fi — prevents Rollup from module-wrapping a pre-paint synchronous script"
    - "cp -r test/preview $destdir/preview — makes preview page available at chrome-extension://.../preview/index.html"

key-files:
  created: []
  modified:
    - bin/build.sh
    - bin/build_test.sh

key-decisions:
  - "CHANGE 3 inserted after profile_db.js rollup line but before mkdir -p $destdir/tests — preserves test runner pipeline ordering"
  - "theme-init.js skip guard is required (not optional) — Rollup wraps the output even for simple scripts; verbatim delivery is a correctness requirement per UI-SPEC §6"
  - "\\cp -r src/css (not src/css/) — copies the css/ directory itself into dist/$brw/, creating dist/$brw/css/; this is the correct macOS/Linux BSD cp behavior"

metrics:
  duration: 8min
  completed: 2026-05-28
---

# Phase 1 Plan 05: Build Pipeline — CSS + Theme-Init Emission Summary

**Production and test builds now emit src/css/ and theme-init.js (verbatim) to dist/ and test/extension/ respectively, with test/preview/ served via chrome-extension:// for Playwright**

## Performance

- **Duration:** ~8 min
- **Completed:** 2026-05-28T07:31:52Z
- **Tasks:** 3 (2 code, 1 verification)
- **Files modified:** 2

## Accomplishments

- Updated `bin/build.sh`: added `\cp -r src/css dist/$brw/` and `\cp -f src/js/theme-init.js dist/$brw/js/theme-init.js` inside the for-brw loop. Production builds now emit all 3 CSS files (`tokens.css`, `base.css`, `components.css`) and the verbatim pre-paint script into `dist/chrome/` and `dist/firefox/`.

- Updated `bin/build_test.sh` with 3 changes: (1) `cp -r src/css $destdir/` after the HTML copy so Playwright extension context serves CSS; (2) skip guard `if [ "$fname" = "theme-init.js" ]; then continue; fi` in the Rollup loop so the pre-paint script is never module-bundled; (3) `cp src/js/theme-init.js $destdir/js/theme-init.js` and `cp -r test/preview $destdir/preview` after the loop so verbatim delivery and the preview page are available for `foundation.spec.js`.

- Smoke-verified: `npm run build` produced all 8 required files; `bin/build_test.sh` with worktree paths produced all 8 test extension outputs; `head -3 test/extension/js/theme-init.js` confirmed verbatim (raw `var m = localStorage.getItem('visualMode')` first line, no Rollup preamble).

## Task Commits

1. **Task 1: Update bin/build.sh** — `46078ab` (feat)
2. **Task 2: Update bin/build_test.sh** — `52a2871` (feat)
3. **Task 3: Smoke-test** — no commit (verification only)

## Files Created/Modified

- `bin/build.sh` — +2 lines inside for-brw loop; copies css/ dir and theme-init.js to both browser dist dirs
- `bin/build_test.sh` — +4 lines (cp css, skip guard, verbatim theme-init.js cp, preview cp)

## Decisions Made

- CHANGE 3 in build_test.sh inserted after `profile_db.js` rollup line but before `mkdir -p $destdir/tests` — matches plan's literal instruction "after the for loop and lib/profile_db.js rollup line"
- theme-init.js Rollup skip guard is a correctness requirement, not a precaution — Rollup adds module boilerplate even to scripts with no imports
- `\cp -r src/css dist/$brw/` uses backslash-prefix convention matching existing build.sh pattern for war/ and icons/

## Deviations from Plan

**None — plan executed exactly as written.**

The one structural difference from the plan's described "26 lines": `bin/build_test.sh` had an additional test-runner loop (`for file in src/tests/*`) after the lib/profile_db.js line. CHANGE 3 was inserted before that block as specified by the plan's literal "after profile_db.js rollup line" instruction. This is functionally equivalent to the plan's intent.

## Known Stubs

None — this plan modifies build scripts only. No UI surfaces, no placeholder text, no dynamic data.

## Threat Flags

None — changes to build scripts only. No new network endpoints, no new permissions, no manifest modifications. T-1-05-02 mitigation (preview page CSP compliance via external script ref) and T-1-05-03 mitigation (theme-init.js verbatim skip guard) are both implemented as designed.

## Self-Check: PASSED

### Files exist:
- FOUND: bin/build.sh (modified)
- FOUND: bin/build_test.sh (modified)
- FOUND: dist/chrome/css/tokens.css
- FOUND: dist/chrome/js/theme-init.js
- FOUND: dist/firefox/css/tokens.css
- FOUND: dist/firefox/js/theme-init.js
- FOUND: test/extension/css/tokens.css
- FOUND: test/extension/js/theme-init.js
- FOUND: test/extension/preview/index.html
- FOUND: test/extension/preview/preview.js

### Commits exist:
- FOUND: 46078ab (feat(01-05): add CSS + theme-init.js to production build)
- FOUND: 52a2871 (feat(01-05): update test build — CSS + theme-init verbatim + preview dir)

### Additional verifications:
- FND-02 PASS: no @cloudscape-design/* in node_modules
- FND-04 PASS: no @font-face or external font refs in src/css/
- theme-init.js verbatim: head -3 shows raw localStorage.getItem line (no Rollup preamble)
- No manifest or rollup.config changes
