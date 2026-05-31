---
phase: 02-popup-surface
plan: "01"
subsystem: popup-css
tags: [css, popup, tokens, phase-2]
dependency_graph:
  requires:
    - 01-01 (tokens.css)
    - 01-02 (base.css, :focus-visible ring)
    - 01-03 (components.css — .aesr-input, .aesr-role-item__name/__account, spinner/empty/alert shells)
  provides:
    - src/css/popup.css — popup-specific layout, color, scrollbar, swatch styles via var(--token)
    - src/popup.html — inline <style> removed, popup.css linked, #roleFilter classed, sidebar grouping
  affects:
    - 02-02 (popup.js state renderers consume .aesr-open-options-link, .aesr-state-* shells)
    - 02-03 (create_role_list_item.js two-line DOM consumes .aesr-role-item-text, .headSquare from popup.css)
tech_stack:
  added: []
  patterns:
    - Token-only CSS discipline — all color/spacing/radius references via var(--token)
    - Section-banner format from components.css — 13 numbered sections in popup.css
    - body > div:first-of-type selector for classless flex wrapper
key_files:
  created:
    - src/css/popup.css
  modified:
    - src/popup.html
decisions:
  - "Target body > div:first-of-type for top-level flex wrapper (no class on element, popup.css owns display:flex)"
  - "Use var(--radius-badge) for .headSquare border-radius — --radius-xs is undefined in tokens.css"
  - "Use var(--color-border-input) for swatch border — passes WCAG 3:1 UI threshold in both light/dark"
metrics:
  duration: "~15 minutes"
  completed: "2026-05-28T13:48:35Z"
  tasks_completed: 2
  tasks_total: 2
  files_created: 1
  files_modified: 1
---

# Phase 02 Plan 01: Popup CSS Authoring and HTML Wiring Summary

Authored `src/css/popup.css` (224 lines, 13 sections, zero hardcoded hex) and updated `src/popup.html` to remove the 125-line inline `<style>` block, link popup.css in cascade position, and apply token-driven classes to interactive elements.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Author src/css/popup.css with all popup-specific styles | 3977e17 | src/css/popup.css (created, 224 lines) |
| 2 | Update popup.html — remove inline style block, link popup.css, strip filter inline style, add sidebar break | df93589 | src/popup.html (modified, -126 net lines) |

## Decisions Made

1. **Flex wrapper targeting** — The top-level `<div style="display:flex">` has no class. Rather than adding a class (which would require HTML + PATTERNS.md updates), used `body > div:first-of-type` selector in popup.css Section 1. The `<script>` and `#sandbox` elements are not flex siblings since they follow the closing `</div>`.

2. **`--radius-badge` for swatch** — CONTEXT.md D-03 references `var(--radius-xs)`, but that token is not declared in tokens.css. Resolved to `var(--radius-badge)` (4px) per UI-SPEC §Swatch explicit guidance. [RESEARCH.md verified, tokens.css confirmed]

3. **`var(--color-border-input)` for swatch border** — Selected per D-01a: light 3.34:1, dark ~3.03:1, both pass WCAG 3:1 UI criterion. `--color-border-divider` fails at its respective surfaces.

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

All acceptance criteria passed:

- `src/css/popup.css` exists with 224 lines (>=80 required)
- `var(--radius-badge)` present (count: 1)
- `radius-xs` absent (count: 0)
- `var(--color-border-input)` present (count: 1)
- `.aesr-role-item-text` present (count: 1)
- `.aesr-nav-group-break` present (count: 1)
- Zero hardcoded hex in popup.css
- `#roleList li a` with `flex-direction: row` present
- `#roleList li.selected` selector present
- No `outline` declarations in popup.css
- `.aesr-open-options-link` with `var(--color-link)` present

popup.html:
- `<style>` block count: 0
- `css/popup.css` link: present (after components.css, correct cascade order)
- `#roleFilter` has `class="aesr-input"`, no inline `style=`
- `aesr-nav-group-break` on Update Notice li: present
- `#main` retains `style="display: none"` (Playwright contract)
- `#noMain` retains `style="display: none;"` (Playwright contract)
- `darkMode` absent, `suffixAccountId` absent

Unit tests: 33/33 passing (npm test — no regression)

## Known Stubs

None — no placeholder text, hardcoded empty values, or unwired components.

## Threat Flags

No new threat surface introduced. The `.headSquare` fill via stored hex (`headSquare.style.backgroundColor`) is unchanged — existing path, accepted in plan threat register (T-02-01). No new network endpoints, auth paths, file access patterns, or schema changes.

## Self-Check: PASSED

- [x] `src/css/popup.css` exists: FOUND
- [x] `src/popup.html` modified: FOUND
- [x] Commit 3977e17 exists: VERIFIED
- [x] Commit df93589 exists: VERIFIED
