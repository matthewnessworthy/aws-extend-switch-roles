---
phase: 03-options-auxiliary-surfaces
reviewed: 2026-05-28T00:00:00Z
depth: standard
files_reviewed: 9
files_reviewed_list:
  - src/credits.html
  - src/css/components.css
  - src/css/options.css
  - src/css/pages.css
  - src/css/tokens.css
  - src/js/options.js
  - src/options.html
  - src/supporters.html
  - src/updated.html
findings:
  critical: 0
  warning: 6
  info: 2
  total: 8
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-05-28  
**Depth:** standard  
**Files Reviewed:** 9  
**Status:** issues_found

## Summary

Nine files reviewed covering the options page redesign and auxiliary surfaces (credits, supporters, updated). The JS logic is sound — `updateMessage` uses `textContent` only, preventing XSS; promise chains are properly chained; no new runtime dependencies are introduced. Six warnings are present: one CSS DRY violation with concrete divergence risk, one broken layout class, two missing `rel` attributes on external links, one leftover inline style violating phase convention, two `alert()` calls that bypass the redesigned status UI, and one out-of-bounds path in `focusConfigTextArea`. No blocking bugs or security issues.

---

## Warnings

### WR-01: `.aesr-pre` block duplicated between `components.css` and `options.css`

**File:** `src/css/options.css:137-148`  
**Issue:** The full `.aesr-pre` ruleset is re-declared in `options.css`. `pages.css:41-43` explicitly documents that the shared shell lives in `components.css` with "no redeclaration here." The `options.css` copy is already slightly out of step — should they diverge further (e.g. a token rename), only the `components.css` copy would be updated, silently breaking the options page's `<pre>` blocks.  
**Fix:** Remove lines 137–148 from `src/css/options.css`. Both pages that load `components.css` already receive `.aesr-pre` from there. If options-specific overrides are ever needed, add a scoped rule (e.g. `.aesr-options-pane .aesr-pre { … }`) instead.

---

### WR-02: `.buttons` class used in `supporters.html` with no CSS definition

**File:** `src/supporters.html:47`  
**Issue:** `<div class="buttons">` wraps the GitHub Sponsor link and the error-label span but `.buttons` is not defined in any CSS file (`components.css`, `pages.css`, `options.css`, `tokens.css`). Without a flex or block rule, the button and warning span render as a plain in-flow block with no gap between them, losing the intended spatial separation.  
**Fix:** Either add a rule to `src/css/pages.css`:
```css
/* Section 7 addition */
.aesr-sponsor-row {
  display: flex;
  align-items: center;
  gap: var(--space-m);
  margin-block: var(--space-s) 0;
}
```
and rename the HTML to `class="aesr-sponsor-row"`, or rename to an existing layout class (e.g. `aesr-key-row` already provides `display:flex; gap:var(--space-m)`).

---

### WR-03: Two `target="_blank"` links missing `rel="noopener noreferrer"` in `updated.html`

**File:** `src/updated.html:21`, `src/updated.html:88`  
**Issue:** Both links open external sites in a new tab without `rel="noopener noreferrer"`. By contrast, identical external links in `options.html` (lines 30–31, 211) include the attribute correctly. The missing attribute allows the opened page to access `window.opener`.  
**Fix:**
```html
<!-- line 21 -->
<a href="https://aws.amazon.com/about-aws/whats-new/2025/01/..." target="_blank" rel="noopener noreferrer">The AWS Management Console now supports...</a>

<!-- line 88 -->
<a href="https://aesr.dev/" target="_blank" rel="noopener noreferrer"><b>AESR Config Hub</b></a>
```

---

### WR-04: `alert()` calls in storage-switch error paths bypass redesigned status UI

**File:** `src/js/options.js:177`, `src/js/options.js:185`  
**Issue:** When the config-storage radio switch fails, the handler falls back to `alert(err.message)` (lines 177 and 185). The rest of the page uses `updateMessage()` with the Cloudscape-aligned `aesr-alert` component — these two paths are the only callers using the native browser dialog. This is visually jarring and inconsistent with the milestone's redesign goal.  
**Fix:** Replace both `alert()` calls with `updateMessage`:
```js
// line 176-179 (local-to-sync catch)
.catch(err => {
  e.preventDefault();
  updateMessage('msgSpan', err.message, 'warn');
  elById('configStorageLocalRadioButton').checked = true;
});

// line 183-186 (sync-to-local catch)
.catch(err => {
  e.preventDefault();
  updateMessage('msgSpan', err.message, 'warn');
  elById('configStorageSyncRadioButton').checked = true;
});
```

---

### WR-05: Inline `style` attribute violates phase convention in `options.html`

**File:** `src/options.html:210`  
**Issue:** `<span style="color: var(--color-text-status-warning)">` remains as an inline style. The previous phase commit (`e3d27c5`) explicitly migrated inline styles to CSS files per the project constraint ("keep styles in bundled/static CSS files"). `options.css` already defines a migration section (§10) for exactly this type of move.  
**Fix:** Add to `src/css/options.css` (§10 Inline style migrations):
```css
#api .aesr-warning-note {
  color: var(--color-text-status-warning);
}
```
Then in `options.html:210`, change:
```html
<span class="aesr-warning-note">'Configuration storage' forcibly becomes 'Local'...</span>
```

---

### WR-06: `focusConfigTextArea` can throw TypeError when error line number exceeds config line count

**File:** `src/js/options.js:292`  
**Issue:** If `ConfigParser.parseIni` reports an error with a `line` number greater than the number of lines in `textArea.value`, then `lines[ln]` (after `ln--` on line 290) is `undefined`. Calling `.length` on `undefined` throws a TypeError. `updateMessage` runs on line 87 before `focusConfigTextArea` is called on line 88, so the error message does appear — but the TypeError fires immediately after, leaving the textarea unfocused and emitting an uncaught error to the console.

Reproduction: save a config where a parse error at the very last line produces a line number equal to `lines.length + 1`.  
**Fix:**
```js
function focusConfigTextArea(ln) {
  const ta = elById('awsConfigTextArea');
  ta.scrollTop = ln < 10 ? 0 : 16 * (ln - 10);
  const lines = ta.value.split('\n');
  if (ln === 1) {
    ta.setSelectionRange(0, (lines[0] || '').length + 1);
    ta.focus();
    return;
  }
  ln--;
  if (ln >= lines.length) return; // guard out-of-bounds
  const start = lines.slice(0, ln).join('\n').length + 1;
  const end = start + lines[ln].length;
  ta.setSelectionRange(start, end);
  ta.focus();
}
```

---

## Info

### IN-01: `--color-border-control` token defined but never used

**File:** `src/css/tokens.css:36`  
**Issue:** `--color-border-control: #8c8c94` is declared in all three theme layers (`:root`, OS-dark `@media`, explicit `[data-theme="dark"]`) but is not referenced in any CSS or JS file. It is a dead token that adds maintenance burden — future refactors must keep it in sync with `--color-border-input` even though it has no effect.  
**Fix:** Remove the token from all three layers in `tokens.css`, or delete and let `--color-border-input` serve both purposes.

---

### IN-02: `e.preventDefault()` in radio `onchange` catch blocks is a no-op

**File:** `src/js/options.js:176`, `src/js/options.js:184`  
**Issue:** `change` events are not cancelable — `e.preventDefault()` has no effect on a radio button `onchange` handler. The intent appears to be preventing the radio from toggling, but that is already handled on the next line by manually re-checking the opposite button. The `e.preventDefault()` calls are dead code that signals incorrect intent.  
**Fix:** Remove both `e.preventDefault()` calls. The manual `elById(…).checked = true` lines on 178 and 185 are the correct rollback mechanism.

---

_Reviewed: 2026-05-28_  
_Reviewer: Claude (gsd-code-reviewer)_  
_Depth: standard_
