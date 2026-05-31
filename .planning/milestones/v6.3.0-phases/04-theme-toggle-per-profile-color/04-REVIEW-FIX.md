---
phase: 04-theme-toggle-per-profile-color
fixed: 2026-05-28
source_review: 04-REVIEW.md
scope: critical+warning
findings_addressed:
  fixed: 2
  deferred: 1
  total: 3
status: fixed
---

# Phase 04: Code Review Fix Report

**Source review:** 04-REVIEW.md (2 warnings, 1 info)
**Fix scope:** Critical + Warning (default; `--all` not passed, so the Info finding was left out of scope)

## Resolved

### WR-01 — `self.assert` misused for string equality (FIXED)

**File:** `test/emulator/visual_mode.spec.js:14`

`self.assert` is a structural `deepEqual` (`test/extension/background.js:8`) that throws a
`TypeError` on a primitive/`undefined` actual rather than producing a clean assertion failure.
Replaced with `self.assertTrue(data.visualMode === 'light')`. Confirmed `self.assertTrue` exists
(`test/extension/background.js:22`) before applying, so the edit cannot introduce a `ReferenceError`.

```diff
- self.assert(data.visualMode, 'light');
+ self.assertTrue(data.visualMode === 'light');
```

### WR-02 — theme double-apply on same-page write (FIXED — deviated from proposed fix)

**File:** `src/js/lib/theme.js`

**Deviation (user-approved):** The review proposed guarding the `storage.onChanged` listener with
`localStorage.getItem('visualMode') === mode`. `options.html` and `popup.html` share one extension
origin and therefore **one `localStorage`**, so that guard would make a second open page (or a
second options tab) read the already-written value and skip — suppressing the cross-page live-update
the listener exists for (the generalized THM-04 behavior). Tests would still pass (THM-04 writes
`sync` directly, bypassing the `onchange`+localStorage preset), masking the regression.

Applied instead a **per-context guard**: a module-level `appliedMode` (each extension page has its
own module instance) records the mode this context last applied. The listener skips only when the
incoming value equals what *this* context already applied, so a same-page radio write no longer
double-applies, while a write originating from another same-origin page still propagates.

```diff
+ let appliedMode = null;

  export function applyTheme(mode) {
+   appliedMode = mode;
    ...
  }

  // listener:
    const mode = changes.visualMode.newValue || 'default';
+   if (mode === appliedMode) return;
    localStorage.setItem('visualMode', mode);
    applyTheme(mode);
```

## Deferred

### IN-01 — THM-02 first test asserts in afterFunc after a fixed sleep (NOT FIXED)

**File:** `test/emulator/visual_mode.spec.js:5-17`

Info severity — outside the default `--fix` scope (`--all` not passed). The 400ms-sleep pattern
matches existing `options.spec.js` practice; the WR-01 fix already removes the `TypeError`-on-absent
failure mode IN-01 was most concerned about. Left as-is.

## Verification

- `npm test` — 39 passing (incl. 6 `applyTheme` unit tests); `appliedMode` change does not alter attribute behavior
- `npm run test_emulator -- --project=chrome --project=firefox` (visual_mode.spec.js) — **8/8 passing**, including THM-04 (the listener test WR-02 touches)
- `keyboard_navigation.spec.js` failures observed in the run are **pre-existing/flaky** (tight 1000ms `#roleList li` `waitForSelector`); reproduced identically on a clean stash of the committed code — not caused by this fix
- Edge (`msedge` channel) not run — pre-existing local infra gap (binary not installed), per CLAUDE.md

## Commits

- WR-02: `src/js/lib/theme.js`
- WR-01: `test/emulator/visual_mode.spec.js`
