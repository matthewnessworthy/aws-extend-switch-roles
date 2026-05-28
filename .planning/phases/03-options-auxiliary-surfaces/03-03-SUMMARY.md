---
phase: 03-options-auxiliary-surfaces
plan: "03"
subsystem: aux-pages
tags:
  - css
  - pages.css
  - supporters
  - credits
  - updated
  - theming
dependency_graph:
  requires:
    - "03-01 (components.css — .aesr-pre and .aesr-divider shells used here)"
    - "Phase 1 tokens.css (all var(--token) values)"
  provides:
    - "src/css/pages.css — aux-page document layout, article container, golden key textarea, accent heading"
    - "supporters.html, credits.html, updated.html — inline <style> blocks removed, pages.css linked, .aesr-article applied"
  affects: []
tech_stack:
  added: []
  patterns:
    - "pages.css authoring: same conventions as popup.css (token-only, tab-indented, .aesr-* prefix, scoped code/blockquote)"
    - ".aesr-article applied to <body> (supporters, updated) and wrapper <div> (credits)"
    - "#keyCodeValid / #keyCodeInvalid style='display: none' preserved verbatim (JS visibility contract)"
key_files:
  created:
    - src/css/pages.css
  modified:
    - src/supporters.html
    - src/credits.html
    - src/updated.html
decisions:
  - "Applied .aesr-article to <body> for supporters and updated (body is the natural single-column article root); applied to inner <div id='credits'> for credits to preserve the existing page wrapper ID"
  - "Removed .aesr-pre redeclaration from pages.css — .aesr-pre already exists in components.css (Plan 01 Task 2) and is linked via existing <link>; apply class on HTML elements only"
  - "span style='color:rgb(221, 63, 0)' on version heading in updated.html replaced with class='aesr-heading-accent' — uses --color-text-accent as closest semantic token"
metrics:
  duration: "~15 minutes"
  completed: "2026-05-28T18:26:00Z"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 4
---

# Phase 03 Plan 03: Aux-Page Styling (pages.css + HTML Wire-Up) Summary

Author `src/css/pages.css` with all required shells and wire it into the three auxiliary pages, removing all inline `<style>` blocks and replacing hardcoded inline style attributes with token-driven CSS classes.

## What Was Built

**Task 1 — src/css/pages.css (commit ada462e):**
New CSS file providing all aux-page styling shells. Follows the same authoring conventions as popup.css and options.css:
- `.aesr-article` — single-column document container, max-width 720px, token-based spacing, 1.75 line-height (documented exception for document reading rhythm)
- `.aesr-article section/p/li` — vertical rhythm margins
- `.aesr-article code` — scoped monospace (not bare `code` which would leak to popup)
- `.aesr-article blockquote` — tokenized border/radius/spacing, replaces hardcoded `border: 1px solid #666` in updated.html
- `.aesr-article .aesr-heading-accent` — accent color for version headings
- `#textareaKeyCode` — golden key textarea sizing/styling, replaces inline `style="width: 62ex; height: 27em"` in supporters.html
- `.aesr-key-row`, `.aesr-key-status`, `.aesr-label-error` — supporters page layout helpers

Zero hex values. All token-based. Tab-indented. 103 lines.

**Task 2 — HTML wire-up (commit 16d74e8):**

`src/supporters.html`:
- 40-line inline `<style>` block removed (hardcoded `#fafafa`, `#2d2d2d`, `#bbb`, `#222`, `#111` palette)
- `<link rel="stylesheet" href="css/pages.css">` added after components.css
- `<body class="aesr-article">` applied
- `.sponsorButton` → `class="aesr-btn aesr-btn--normal"`
- Error span inline style → `class="aesr-label-error"`
- Key-code flex wrapper → `class="aesr-key-row"`
- `#textareaKeyCode` inline `style="width: 62ex; height: 27em"` removed (handled by pages.css)
- Status div margin → `class="aesr-key-status"`
- PRESERVED: `#keyCodeValid` and `#keyCodeInvalid` `style="display: none"` (Playwright contract)
- PRESERVED: `<script type="module" src="js/supporters.js">` placement after `</body>`

`src/credits.html`:
- 35-line inline `<style>` block removed (hardcoded `#666`, `#eee` palette, bare `pre`/`h1`/`h2` rules)
- `<link rel="stylesheet" href="css/pages.css">` added after components.css
- `<div class="pane" id="credits">` → `class="aesr-article"` (ID preserved)
- `<pre>` MIT license block → `class="aesr-pre"`
- `</html>` was already present (confirmed, no change needed)

`src/updated.html`:
- 30-line inline `<style>` block removed (hardcoded blockquote, code, body palette)
- `<link rel="stylesheet" href="css/pages.css">` added after components.css
- `<body class="aesr-article">` applied
- `<h1 style="margin:0">` → style attribute removed (base.css handles this)
- `<h2 style="color:#0099f2">` → `class="aesr-heading-accent"` (inline style removed)
- `<hr style="margin:18px 0">` → `class="aesr-divider"` (tokenized divider from components.css)
- `<span style="color:rgb(221, 63, 0)">` on version heading → `class="aesr-heading-accent"`
- `<blockquote>` unchanged — `.aesr-article blockquote` descendant selector applies automatically

## Deviations from Plan

None — plan executed exactly as written.

## Test Results

- `npm test` (Mocha unit tests): 33/33 passing
- `npm run test_emulator` (Playwright): 38/57 passing — all 19 failures are [Microsoft Edge] browser not installed on this machine (`/Applications/Microsoft Edge.app not found`). This is a pre-existing environment constraint, not caused by this plan. Chrome and Firefox pass 38/38.
- Key supporter test: `input invalid key code` passes on Chrome and Firefox — confirms `#keyCodeValid`/`#keyCodeInvalid` `style="display: none"` preservation is intact.

## Known Stubs

None.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes. All changes are static HTML restructuring and CSS authoring. T-03-05 (CSP: no inline style blocks remain) and T-03-06 (Playwright regression: `style="display: none"` preserved) mitigations confirmed implemented.

## Self-Check: PASSED

- `src/css/pages.css` exists: confirmed (ada462e)
- `src/supporters.html`, `src/credits.html`, `src/updated.html` modified: confirmed (16d74e8)
- Zero hex values in pages.css: `grep -cE '#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?' src/css/pages.css` = 0
- `<style>` blocks removed from all 3 HTML files: 0 each
- pages.css linked in all 3: 1 each
- `style="display: none"` count in supporters.html: 2 (preserved)
- `</html>` in credits.html: 1
