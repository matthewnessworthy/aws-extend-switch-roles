---
phase: 01-design-system-foundation
plan: 04
subsystem: html-wiring
tags: [html, head-wiring, theme-init, css-chain, design-system, d02-audit]

requires:
  - 01-02-SUMMARY.md (theme-init.js path confirmed: js/theme-init.js)
  - 01-03-SUMMARY.md (base.css and components.css created; D-02 bleed scope confirmed)

provides:
  - src/popup.html — DOCTYPE + charset added; theme-init.js first in <head>; 3 CSS links; existing <style> preserved
  - src/options.html — theme-init.js as first <head> child (before module script); 3 CSS links added
  - src/supporters.html — theme-init.js + 3 CSS links added to <head>
  - src/credits.html — theme-init.js + 3 CSS links added to <head> (first time this page has a head script)
  - src/updated.html — theme-init.js + 3 CSS links added to <head> (first time this page has a head script)

affects:
  - 01-05-design-system-foundation (build pipeline must copy src/css/ and src/js/theme-init.js to dist/)
  - Phase 2 (popup surface styling; popup.html inline <style> preserved for cascade insulation)
  - Phase 3 (options/aux surfaces; existing <style> blocks in each page preserved until surface phases)

tech-stack:
  added: []
  patterns:
    - "Additive head wiring: theme-init.js + CSS chain inserted without removing existing <style> blocks"
    - "Source-order cascade insulation: existing inline <style> stays AFTER the CSS link chain (D-02 bleed prevention)"
    - "Pre-paint script placement: <script src='js/theme-init.js'> as first <head> child (no type attribute) prevents FOUC before CSS loads"

key-files:
  created: []
  modified:
    - src/popup.html
    - src/options.html
    - src/supporters.html
    - src/credits.html
    - src/updated.html
    - test/emulator/options.spec.js
    - test/emulator/supporters.spec.js

key-decisions:
  - "popup.html: existing inline <style> left in place AFTER the 3 CSS links — source-order cascade priority ensures inline styles win over base.css (D-02 insulation)"
  - "options.html: theme-init.js script inserted before <script type=module src=js/options.js> — pre-paint must run before module execution"
  - "credits.html and updated.html: first time these pages receive any head script (previously no script in <head>)"
  - "D-02 spec audit: neither options.spec.js nor supporters.spec.js contain body font/margin/box-sizing assertions — header comment only, no assertion changes needed"

metrics:
  duration: ~8min
  completed: 2026-05-28
  tasks: 2
  files: 7
---

# Phase 1 Plan 04: HTML Head Wiring and D-02 Spec Audit Summary

**Additive <head> wiring on all 5 production HTML pages: theme-init.js as first child + 3 CSS links in order; D-02 spec audit confirmed no sensitive assertions in existing specs**

## Performance

- **Duration:** ~8 min
- **Completed:** 2026-05-28
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

**Task 1 — HTML head wiring (5 files):**
- `src/popup.html`: Added `<!DOCTYPE html>` as first line (was missing), `<meta charset="UTF-8">` as first `<head>` child, then the 4-line theme-init + CSS block before the existing `<style>` tag. No existing content removed. Pre-existing structural quirk (`</head>` after `</body>`) left untouched per additive-wiring rule.
- `src/options.html`: Inserted 4-line block as first `<head>` children (after title), before the existing `<script type="module" src="js/options.js">`. theme-init.js at line 6, module script at line 10 — correct source order.
- `src/supporters.html`: Inserted 4-line block after `<title>` and before existing `<style>`. 2-space indent matched.
- `src/credits.html`: Inserted 4-line block after `<title>` and before existing `<style>`. Flush-left indent matched (no indent).
- `src/updated.html`: Inserted 4-line block after `<title>` and before existing `<style>`. 2-space indent matched.

All 5 pages: `<script src="js/theme-init.js"></script>` (no `type` attribute), `<link rel="stylesheet" href="css/tokens.css">`, `<link rel="stylesheet" href="css/base.css">`, `<link rel="stylesheet" href="css/components.css">` — in that order.

**Task 2 — D-02 spec audit (2 files):**
- `test/emulator/options.spec.js`: Scanned for body-font/margin/box-sizing/background-color assertions and `.darkMode` references. None found. Added `// D-02 audit (Phase 1): no body-font/margin/box-sizing assertions found — no changes needed` header.
- `test/emulator/supporters.spec.js`: Same scan. None found. Same header comment added.

## Task Commits

1. **Task 1: Wire `<head>` on all 5 HTML pages** — `5dfbc77` (feat)
2. **Task 2: D-02 spec audit** — `184ec44` (chore)

## Files Created/Modified

- `src/popup.html` — DOCTYPE + charset added; theme-init.js + 3 CSS links prepended before existing `<style>`
- `src/options.html` — theme-init.js + 3 CSS links inserted before module script
- `src/supporters.html` — theme-init.js + 3 CSS links inserted before existing `<style>`
- `src/credits.html` — theme-init.js + 3 CSS links inserted before existing `<style>` (first head script on this page)
- `src/updated.html` — theme-init.js + 3 CSS links inserted before existing `<style>` (first head script on this page)
- `test/emulator/options.spec.js` — D-02 audit header comment added; no assertion changes
- `test/emulator/supporters.spec.js` — D-02 audit header comment added; no assertion changes

## Decisions Made

- Source-order cascade insulation confirmed: existing inline `<style>` blocks stay AFTER the external CSS link chain. At equal specificity, the inline `<style>` rules win (popup.html `.darkMode` class rules, options.html `.pane` rules, etc.) — this is the D-02 bleed prevention mechanism.
- `theme-init.js` script tag has no `type` attribute throughout — required per UI-SPEC to avoid module deferral behavior. A non-module `<script src>` runs synchronously as the browser encounters it, which is required for the pre-paint FOUC prevention to work.
- Indent style matched per-file: popup.html (flush-left), options.html (flush-left), credits.html (flush-left), supporters.html (2-space), updated.html (2-space).

## Deviations from Plan

None — plan executed exactly as written. Indent style per-file matched observed file conventions (advisor confirmed options.html and credits.html are flush-left despite plan notes suggesting otherwise; file inspection took precedence).

## Known Stubs

None — this plan only modifies `<head>` wiring. All inserted tags reference files created in Plans 01-02 and 01-03. No placeholder text, no hardcoded values, no data sources.

## Threat Flags

None — purely additive `<head>` changes. No new network endpoints, no new permissions, no manifest changes. `theme-init.js` reads only from `localStorage` (same-origin); CSP remains valid (external script via `src=` attribute, not inline code).

## Self-Check: PASSED

### Files exist:
- FOUND: src/popup.html (modified)
- FOUND: src/options.html (modified)
- FOUND: src/supporters.html (modified)
- FOUND: src/credits.html (modified)
- FOUND: src/updated.html (modified)
- FOUND: test/emulator/options.spec.js (modified)
- FOUND: test/emulator/supporters.spec.js (modified)

### Commits exist:
- FOUND: 5dfbc77 (feat(01-04): wire theme-init.js and CSS chain in all 5 HTML pages)
- FOUND: 184ec44 (chore(01-04): D-02 audit — add header comments to options and supporters specs)

### Verification results:
- All 5 pages wired: PASSED
- popup.html DOCTYPE: PASSED (`<!DOCTYPE html>` is first line)
- options.html script order: PASSED (theme-init at line 6, module script at line 10)
- No type="module" on theme-init tags: PASSED
- D-02 audit markers in both specs: PASSED
