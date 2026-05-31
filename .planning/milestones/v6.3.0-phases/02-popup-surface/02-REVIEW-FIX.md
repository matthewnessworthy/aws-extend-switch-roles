---
phase: 02-popup-surface
fixed_at: 2026-05-28T00:00:00Z
review_path: .planning/phases/02-popup-surface/02-REVIEW.md
iteration: 1
findings_in_scope: 6
fixed: 6
skipped: 0
status: all_fixed
---

# Phase 02: Code Review Fix Report

**Fixed at:** 2026-05-28
**Source review:** .planning/phases/02-popup-surface/02-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 6
- Fixed: 6
- Skipped: 0

## Fixed Issues

### CR-01: `#roleList::-webkit-scrollbar` descendant combinator — dead code in Chrome/Edge

**Files modified:** `src/css/popup.css`
**Commit:** 7ad7b28
**Applied fix:** Removed the space before `::-webkit-scrollbar`, `::-webkit-scrollbar-track`, and `::-webkit-scrollbar-thumb` in all three rules so the pseudo-elements attach directly to `#roleList` rather than to its descendants.

---

### WR-01: `encodeURI(parsed.href)` double-encodes image paths

**Files modified:** `src/js/lib/create_role_list_item.js`
**Commit:** c532be8
**Applied fix:** Replaced `encodeURI(safeImageUrl)` with `safeImageUrl` directly. `URL.href` already percent-encodes special characters; the extra `encodeURI` call was double-encoding `%` signs and breaking any image URL containing percent-encoded characters.

---

### WR-02: Test "profile has color" passes wrong argument count

**Files modified:** `src/js/lib/create_role_list_item.test.js`
**Commit:** cd61756
**Applied fix:** Inserted the missing `''` (empty string for `region`) as the fourth argument to `createRoleListItem` on line 65, so `{ hidesAccountId }` is destructured from the correct fifth-slot options object and `selectHandler` receives the arrow function in the sixth slot.

---

### WR-03: `sendSwitchRole` rejection is unhandled — popup silently freezes

**Files modified:** `src/js/popup.js`
**Commit:** 943261e
**Applied fix (requires human verification):** Two changes applied:
1. In `sendSwitchRole`, added a null-check on the response before destructuring: if `executeAction` resolves to `undefined` (no content-script response), a descriptive `Error` is thrown rather than a `TypeError` on destructure.
2. At the call site in `listItemOnSelect`, added a `.catch()` handler that restores `sender.style.fontWeight` and `sender.onclick` and calls `showError` so the user sees the failure and can retry.

Note: this fix affects a failure-path runtime behaviour that syntax checks cannot verify. Manual smoke-test of a role-switch with no responding content script recommended.

---

### WR-04: Stray `</head>` closing tag after `</body>`

**Files modified:** `src/popup.html`
**Commit:** fa6a3bc
**Applied fix:** Deleted the stray `</head>` line (line 49 of the pre-fix file) that appeared after `</body>`, restoring the document to structurally valid HTML.

---

### WR-05: Inline `style="text-decoration: none"` on `#openSupportMe`

**Files modified:** `src/popup.html`, `src/css/popup.css`
**Commit:** e3d27c5
**Applied fix:** Removed the `style="text-decoration: none"` attribute from the `#openSupportMe` anchor in `popup.html`. Added two rules to the support section of `popup.css`: `#openSupportMe { text-decoration: none; }` and `#openSupportMe:hover { text-decoration: underline; }`, matching the established pattern used for `.aesr-open-options-link`.

---

_Fixed: 2026-05-28_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
