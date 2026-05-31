---
phase: 03-options-auxiliary-surfaces
fixed_at: 2026-05-28T00:00:00Z
review_path: .planning/phases/03-options-auxiliary-surfaces/03-REVIEW.md
iteration: 1
findings_in_scope: 6
fixed: 6
skipped: 0
status: all_fixed
---

# Phase 03: Code Review Fix Report

**Fixed at:** 2026-05-28  
**Source review:** .planning/phases/03-options-auxiliary-surfaces/03-REVIEW.md  
**Iteration:** 1

**Summary:**
- Findings in scope: 6
- Fixed: 6
- Skipped: 0

## Fixed Issues

### WR-01: `.aesr-pre` block duplicated between `components.css` and `options.css`

**Files modified:** `src/css/options.css`  
**Commit:** ea1bb6f  
**Applied fix:** Removed the full `.aesr-pre` ruleset (lines 137-148) from `options.css`. The canonical definition already lives in `components.css`; the duplicate copy was already slightly diverged and posed a maintenance hazard.

---

### WR-02: `.buttons` class used in `supporters.html` with no CSS definition

**Files modified:** `src/supporters.html`  
**Commit:** e02a33f  
**Applied fix:** Renamed `class="buttons"` to `class="aesr-key-row"` on the sponsor button wrapper `<div>`. `aesr-key-row` is an existing layout class providing `display:flex; gap:var(--space-m)`, which satisfies the same intent.

---

### WR-03: Two `target="_blank"` links missing `rel="noopener noreferrer"` in `updated.html`

**Files modified:** `src/updated.html`  
**Commit:** 0b3e491  
**Applied fix:** Added `rel="noopener noreferrer"` to the AWS Management Console link (line 21) and the AESR Config Hub link (line 88), matching the pattern already used on all external links in `options.html`.

---

### WR-04: `alert()` calls in storage-switch error paths bypass redesigned status UI

**Files modified:** `src/js/options.js`  
**Commit:** 328b547  
**Applied fix:** Replaced both `alert(err.message)` calls (lines 177 and 185) with `updateMessage('msgSpan', err.message, 'warn')`, consistent with all other error display on the options page. The `e.preventDefault()` calls and radio-button rollback lines are preserved unchanged.

---

### WR-05: Inline `style` attribute violates phase convention in `options.html`

**Files modified:** `src/options.html`, `src/css/options.css`  
**Commit:** 5021af5  
**Applied fix:** Added `.aesr-warning-note { color: var(--color-text-status-warning); }` to the §10 inline-style-migrations section of `options.css`. Replaced the `style="color: var(--color-text-status-warning)"` attribute on the warning `<span>` in `options.html` with `class="aesr-warning-note"`. Note: the reviewer suggested `#api .aesr-warning-note` but the parent `<section>` has no `id` attribute, so the bare class selector `.aesr-warning-note` is used instead.

---

### WR-06: `focusConfigTextArea` can throw TypeError when error line number exceeds config line count

**Files modified:** `src/js/options.js`  
**Commit:** defcfd6  
**Applied fix:** Added `if (ln >= lines.length) return;` guard after `ln--` to prevent `undefined` access when the reported error line exceeds the actual line count. Also hardened the `ln === 1` branch to use `(lines[0] || '').length` in case of an empty textarea.  
**Status:** fixed: requires human verification (logic control-flow change)

---

## Skipped Issues

None — all findings were fixed.

---

_Fixed: 2026-05-28_  
_Fixer: Claude (gsd-code-fixer)_  
_Iteration: 1_
