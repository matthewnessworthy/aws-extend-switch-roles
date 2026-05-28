---
phase: 03-options-auxiliary-surfaces
plan: "02"
subsystem: options-page
tags: [options, css, html, js, dark-mode, alert, aesr-tokens]
dependency_graph:
  requires:
    - "03-01 — .aesr-alert--success and .aesr-alert--warning in components.css"
    - "03-01 — --color-bg-button-primary-hover in dark Layers 2 and 3a"
  provides:
    - "src/css/options.css — options-page surface CSS with all shell classes"
    - "src/options.html — inline <style> block removed, all form controls carry .aesr-* classes"
    - "src/js/options.js — updateMessage() injects .aesr-alert shells; .darkMode toggle removed"
  affects:
    - "03-03 — aux pages (supporters, credits, updated) build on same CSS authoring conventions"
    - "Phase 4 — will wire data-theme writeback to restore live Visual Mode repaint"
tech_stack:
  added: []
  patterns:
    - "Surface-specific CSS file (options.css) layered over components.css"
    - "createElement/className/textContent DOM construction (no innerHTML) for updateMessage()"
    - "replaceChildren() for idempotent container update"
    - "modifierMap lookup (success/warn → .aesr-alert modifier) with fallback to --error"
key_files:
  created:
    - src/css/options.css
  modified:
    - src/options.html
    - src/js/options.js
decisions:
  - "Inline style for <strong class=warn> replaced with span with style=color:var(--color-text-status-warning) per plan's executor-discretion provision"
  - "Both save-row and config-hub-button-row divs received class=aesr-save-row (same margin-top need)"
  - "Comment text in updateMessage() rephrased to avoid the word 'innerHTML' (which would trip the grep -c 'innerHTML' = 0 acceptance criterion)"
metrics:
  duration: "15 minutes"
  completed: "2026-05-28"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 3
---

# Phase 03 Plan 02: Options Page Styles and JS Refactor Summary

Options-page token-driven CSS authored, inline `<style>` block removed, all form controls carry `.aesr-*` classes, `updateMessage()` injects `.aesr-alert` shells via safe `textContent`, and `.darkMode` toggle removed from both JS locations.

## Tasks Completed

| Task | Commit | Files |
|------|--------|-------|
| 1: Author src/css/options.css | 88d83e8 | src/css/options.css |
| 2: Update options.html and options.js (atomic) | f896405 | src/options.html, src/js/options.js |

## Changes

### src/css/options.css (new file, 178 lines)

Ten sections covering all required shells:
- Body layout (`display: flex; flex-direction: row; background-color: var(--color-bg-input-disabled)`)
- `.aesr-options-pane` pane scaffold + `#settingPane` / `#howto` overrides
- `.aesr-section-head` vertical rhythm for `<h2>` section heads
- `.aesr-form-row` and `.aesr-form-row label` replacing `.formItem`
- `.aesr-settings-list` and `li` replacing `#settings ul` and `#settings ul li`
- `.aesr-storage-row` replacing `.radioGroup`
- `.aesr-color-pair` + `#colorPicker` + `#colorValue`
- `#awsConfigTextArea` overrides on top of `.aesr-textarea` base (`min-height: 320px`, `max-height: calc(100vh - 320px)`, `white-space: pre`, `resize: vertical`)
- `.aesr-options-pane code` and `.aesr-pre` (scoped to avoid popup bleed)
- Inline style migrations: `#msgSpan`, `#remoteMsgSpan`, `#switchConfigHubButton`, `#configHubDomain`, `#configHubClientId`, `#configSenderIdText`, `.aesr-save-row`

Zero hex values. Zero `outline` declarations. 35 `var(--token)` references.

### src/options.html

- `<link rel="stylesheet" href="css/options.css">` added after `components.css`
- Entire inline `<style>` block (130 lines, including all `.darkMode` rules) removed
- `.pane` → `.aesr-options-pane` on both `#settingPane` and `#howto`
- `.radioGroup` → `.aesr-storage-row` on storage selector
- `.formItem` → `.aesr-form-row` on all three Config Hub / Extension API form items
- `#saveButton` gets `class="aesr-btn aesr-btn--primary"` and text `Save Configuration`
- All Config Hub buttons get `class="aesr-btn aesr-btn--normal"`
- Text inputs (`#configHubDomain`, `#configHubClientId`, `#configSenderIdText`) get `class="aesr-input"`; width inline styles removed
- `#awsConfigTextArea` gets `class="aesr-textarea"`
- All checkboxes get `class="aesr-checkbox"`, all radios get `class="aesr-radio"`
- `#settings ul` gets `class="aesr-settings-list"`
- `<h1>Settings</h1>` → `<h2 class="aesr-section-head">Settings</h2>`
- `<h1>Extension API</h1>` → `<h2 class="aesr-section-head">Extension API</h2>`
- `<span id="msgSpan">` → `<div id="msgSpan">` (co-dep with updateMessage refactor)
- `<span id="remoteMsgSpan">` → `<div id="remoteMsgSpan">` (co-dep with updateMessage refactor)
- All `<pre>` blocks in `#howto` get `class="aesr-pre"`
- `<strong class="warn">` replaced with `<span style="color: var(--color-text-status-warning)">` (only `var()` reference; preserves CSP)
- All removed inline `style=` attributes: `margin-left:12px` on both spans, `margin-left: auto` on `#switchConfigHubButton`, `float:right` on the howto `<a>`, `margin-left: 6px` on `<b>#</b>`, `margin-top:12px` on save-row wrapper
- PRESERVED: `#configHubPanel style="display: none"`, all element IDs, `<h1>Configuration</h1>`, `<h1>How to configure</h1>`, `<s>` element around autoAssumeLastRole

### src/js/options.js

- **Location 1** (line ~193): Removed the `if (visualMode === 'dark' || ...) { classList.add('darkMode') } else { classList.remove('darkMode') }` block from the Visual Mode `onchange` handler; `syncStorageRepo.set({ visualMode })` preserved
- **Location 2** (line ~219): Removed the `if (visualMode === 'dark' || ...) { classList.add('darkMode') }` block from the `syncStorageRepo.get` initial load; `elById(visualMode + 'VisualRadioButton').checked = true` preserved; `loadConfigIni` call preserved
- **`updateMessage()`**: Replaced entirely with `.aesr-alert` pattern — `createElement('div')` with `aesr-alert ${modifier}`, inner `createElement('p')` with `aesr-alert__body`, `body.textContent = msg` (not innerHTML), `el.replaceChildren(alertDiv)`, 2500ms success timeout preserved; `modifierMap` maps `'success'` → `aesr-alert--success`, `'warn'` → `aesr-alert--warning`, fallback → `aesr-alert--error`
- `updateRemoteFieldsState()` preserved verbatim (14 `style.display` toggle calls)

## Verification Results

1. `grep -c '<style>' src/options.html` → **0**
2. `grep -c 'css/options.css' src/options.html` → **1**
3. `grep -c 'darkMode' src/options.html` → **0**
4. `grep -c 'darkMode' src/js/options.js` → **0**
5. `grep -c 'innerHTML' src/js/options.js` → **0**
6. `grep -c 'aesr-alert--success' src/js/options.js` → **1**
7. `grep -c 'style.display' src/js/options.js` → **14** (>= 6 required)
8. `grep -c 'var(--' src/css/options.css` → **35** (>= 30 required)
9. `grep -cE '#[0-9a-fA-F]{3}' src/css/options.css` → **0**
10. `npm test` → **33 passing, 0 failing**
11. `npm run test_emulator` → **38 passing** (Chrome 19 + Firefox 19); Microsoft Edge 19 skipped (not installed on this machine — pre-existing infrastructure gap, not caused by these changes)

## Deviations from Plan

### Minor Implementation Choices (Planner Discretion Exercised)

**1. [Rule 2 - Choice] Comment text rephrased to avoid grep false positive**
- **Found during:** Task 2, verification
- **Issue:** Comment `// textContent, not innerHTML — msg may contain error content` contained the word "innerHTML", which caused `grep -c 'innerHTML' src/js/options.js` to return 1 (failing the 0 requirement)
- **Fix:** Rephrased to `// textContent only — msg may contain parser error text or server-influenced content`
- **Files modified:** src/js/options.js

**2. [Planner Discretion] Both button-row divs received `class="aesr-save-row"`**
- The plan specified `aesr-save-row` for the save-button row. The Config Hub button row (containing `#cancelConfigHubButton` etc. plus `#remoteMsgSpan`) has identical margin-top need. Applied the same class to both.

**3. [Planner Discretion] `<strong class="warn">` treatment**
- Plan allowed either a full `.aesr-alert.aesr-alert--warning` wrapper or a `<span style="color: var(--color-text-status-warning)">`. Chose the span approach as it's less structurally disruptive to the howto paragraph flow, and uses only a `var()` reference (CSP-safe).

## Known Phase 3 → Phase 4 Transitional Regression (ACCEPTED)

After removing `.darkMode` toggle from `options.js`, clicking a Visual Mode radio writes to `chrome.storage.sync` but produces no immediate visual change — the page must reload. This is deliberate. Phase 1's `theme-init.js` ensures the page loads in the correct theme. Phase 4 restores live repaint via `data-theme` writeback.

## Known Stubs

None. All form controls are wired to their existing JS handlers. The `updateMessage()` refactor preserves all existing call sites and their message strings.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: xss-mitigation | src/js/options.js | updateMessage() uses textContent (not innerHTML) — T-03-02 mitigated as planned |

No new trust boundaries introduced. The `style="color: var(--color-text-status-warning)"` on the `<span>` in options.html is a static `var()` token reference, not a dynamic injection — T-03-03 compliance maintained.

## Self-Check: PASSED

- src/css/options.css: FOUND (git log 88d83e8)
- src/options.html: FOUND (git log f896405)
- src/js/options.js: FOUND (git log f896405)
- All commits verified: 88d83e8, f896405
