# Phase 4: Theme Toggle & Per-Profile Color — Pattern Map

**Mapped:** 2026-05-28
**Files analyzed:** 4 (3 new/modified source, 1 new test)
**Analogs found:** 3 / 4 (1 test partial — cross-context path has no full analog)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/js/lib/theme.js` | utility | event-driven | `src/js/lib/set_icon.js` | exact |
| `src/js/options.js` | entry-point UI | request-response | itself (lines 1-8, 191-219) | self-analog |
| `src/js/popup.js` | entry-point UI | request-response | itself (lines 1-8, 128-133) | self-analog |
| `test/emulator/visual_mode.spec.js` | test | event-driven | `test/emulator/options.spec.js` + `foundation.spec.js:39-47` | role-match (partial — see No Analog Found) |

---

## Pattern Assignments

### `src/js/lib/theme.js` (utility, event-driven) — NEW

**Analog:** `src/js/lib/set_icon.js`

**Rationale:** `set_icon.js` is the canonical single-purpose lib utility pattern: one file, two or fewer named exports, wraps a browser API, uses `const brw = chrome || browser` for Firefox compatibility. `theme.js` follows the same shape.

**Imports pattern** (`src/js/lib/set_icon.js` lines 1-4 — full file):
```javascript
export function setIcon(path) {
  const brw = chrome || browser;
  return brw.action.setIcon({ path });
}
```

**`const brw` pattern** — required on any function that calls a `chrome.*` API (`set_icon.js:2`, `options.js:14`, `popup.js:8`, `background.js:6`):
```javascript
const brw = chrome || browser;
```

**Core pattern for `theme.js`** — mirror `theme-init.js` logic exactly for `applyTheme`, then wrap the `storage.onChanged` listener:
```javascript
// src/js/lib/theme-init.js (lines 1-6) — the reference implementation to mirror:
var m = localStorage.getItem('visualMode');
if (m === 'light' || m === 'dark') {
  document.documentElement.setAttribute('data-theme', m);
} else {
  document.documentElement.removeAttribute('data-theme');
}
```

`'default'` MUST trigger `removeAttribute`, never `setAttribute('data-theme', 'default')`. The `tokens.css` 3-layer cascade guard is `:root:not([data-theme="light"]):not([data-theme="dark"])` — absent attribute activates the OS-dark `@media` layer.

**Named-export pattern** (from `src/js/lib/util.js` lines 1-3 and `src/js/lib/set_icon.js`):
```javascript
// Named exports only — no default exports in lib files
export function nowEpochSeconds() { ... }
export function setIcon(path) { ... }
```

---

### `src/js/options.js` (entry-point UI, request-response) — AUGMENT

**Analog:** itself

**Import block pattern** (`src/js/options.js` lines 1-8) — add one new import to this existing block:
```javascript
import { ConfigParser } from 'aesr-config';
import { nowEpochSeconds } from './lib/util.js';
import { loadConfigIni, saveConfigIni } from './lib/config_ini.js';
import { ColorPicker } from './lib/color_picker.js';
import { SessionMemory, StorageProvider } from './lib/storage_repository.js';
import { writeProfileSetToTable } from "./lib/profile_db.js";
import { remoteConnect, getRemoteConnectInfo, deleteRemoteConnectInfo } from './handlers/remote_connect.js';
import { reloadConfig } from './lib/reload-config.js';
// ADD:
// import { applyTheme, installVisualModeListener } from './lib/theme.js';
```

Note the mixed quote style in the existing block (single-quote dominant, one double-quote on line 6) — match the existing surrounding style.

**`installVisualModeListener()` placement** — call inside `window.onload`, immediately after `syncStorageRepo` is declared (line 18):
```javascript
window.onload = function() {
  const syncStorageRepo = StorageProvider.getSyncRepository();
  // ADD: installVisualModeListener();
  let configStorageArea = 'sync';
  ...
```

**Existing radio `onchange` pattern** (`src/js/options.js` lines 191-194) — augment with write-through:
```javascript
// EXISTING:
elById('defaultVisualRadioButton').onchange = elById('lightVisualRadioButton').onchange = elById('darkVisualRadioButton').onchange = function() {
  const visualMode = this.value;
  syncStorageRepo.set({ visualMode });
  // ADD:
  // localStorage.setItem('visualMode', visualMode);
  // applyTheme(visualMode);
}
```

**Event handler style** — `function` keyword (not arrow function) for `onchange` assignments; consistent with all other handlers in the file.

**Post-load reconcile site** (`src/js/options.js` lines 196-219) — augment inside the `.then(data => { ... })` callback, after line 214:
```javascript
syncStorageRepo.get(['configSenderId', 'configStorageArea', 'visualMode'].concat(booleanSettings))
.then(data => {
  ...
  const visualMode = data.visualMode || 'default'
  elById(visualMode + 'VisualRadioButton').checked = true;
  // ADD: reconcile localStorage cache with sync canonical:
  // if ((localStorage.getItem('visualMode') || 'default') !== visualMode) {
  //   localStorage.setItem('visualMode', visualMode);
  //   applyTheme(visualMode);
  // }
  ...
```

**Error handling pattern** (existing in file, lines 76-93) — `.catch(err => updateMessage(..., err.message, 'warn'))` for ops that surface errors to UI. No new error paths in the theme write-through (localStorage.setItem is synchronous and infallible; syncStorageRepo.set already has error handling on the existing radio handler).

**Indentation:** 2-space (not tabs) — matches `options.js` throughout.

---

### `src/js/popup.js` (entry-point UI, request-response) — AUGMENT

**Analog:** itself

**Import block pattern** (`src/js/popup.js` lines 1-6) — add one new import:
```javascript
import { createRoleListItem } from './lib/create_role_list_item.js';
import { CurrentContext } from './lib/current_context.js';
import { findTargetProfiles } from './lib/target_profiles.js';
import { SessionMemory, StorageProvider } from './lib/storage_repository.js';
import { remoteCallback } from './handlers/remote_connect.js';
import { writeProfileSetToTable } from './lib/profile_db.js';
// ADD:
// import { applyTheme, installVisualModeListener } from './lib/theme.js';
```

**`installVisualModeListener()` placement** — inside `window.onload`, immediately (lines 102-103):
```javascript
window.onload = function() {
  mainEl = document.getElementById('main');
  noMainEl = document.getElementById('noMain');
  // ADD: installVisualModeListener();
  ...
```

**Existing `storageRepo.get` pattern** (`src/js/popup.js` lines 128-133) — augment to include `'visualMode'` key and reconcile:
```javascript
// EXISTING:
const storageRepo = StorageProvider.getSyncRepository();
storageRepo.get(['autoTabGrouping']).then(({ autoTabGrouping }) => {
  if (autoTabGrouping) {
    brw.runtime.sendMessage({ action: 'listenTabGroupsRemove' });
  }
});
// AUGMENT: add 'visualMode' to keys and reconcile:
// storageRepo.get(['autoTabGrouping', 'visualMode']).then(({ autoTabGrouping, visualMode }) => {
//   if ((localStorage.getItem('visualMode') || 'default') !== (visualMode || 'default')) {
//     localStorage.setItem('visualMode', visualMode || 'default');
//     applyTheme(visualMode || 'default');
//   }
//   if (autoTabGrouping) {
//     brw.runtime.sendMessage({ action: 'listenTabGroupsRemove' });
//   }
// });
```

**Module-level `brw` singleton pattern** (`src/js/popup.js` line 8) — already present; do not redeclare inside `theme.js` functions that are called from popup context. `theme.js` declares its own local `const brw = chrome || browser` inside `installVisualModeListener()` (function scope, not module scope) to stay self-contained.

**Indentation:** 2-space (not tabs) — matches `popup.js` throughout.

---

### `test/emulator/visual_mode.spec.js` (test, event-driven) — NEW

**Analog:** `test/emulator/options.spec.js` (testInOptions pattern) + `test/emulator/foundation.spec.js` lines 39-47 (data-theme assertion idiom)

**Test fixture import pattern** (`test/emulator/options.spec.js` lines 1-2):
```javascript
import { testInOptions } from './fixtures.js';
```

**`testInOptions` call pattern** (`test/emulator/options.spec.js` lines 4-48) — three-callback form: `(message, beforeFunc, pageFunc, afterFunc)`:
```javascript
testInOptions("description",
  async () => {
    // beforeFunc: runs in worker context; set up chrome.storage state
    await chrome.storage.sync.set({ someKey: someValue });
  },
  async ({ page, expect }) => {
    // pageFunc: Playwright page interactions
    await page.locator('#someRadioButton').check();
  },
  async () => {
    // afterFunc: runs in worker context; assert chrome.storage state
    const data = await chrome.storage.sync.get(['someKey']);
    self.assert(data.someKey, expectedValue);
    await chrome.storage.sync.clear();
  }
);
```

**data-theme assertion idiom** (`test/emulator/foundation.spec.js` lines 40-47):
```javascript
// Read data-theme attribute from <html>:
const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
expect(theme).toBe('dark');

// Assert attribute is absent (for 'default' mode):
// expect(theme).toBeNull();

// Set localStorage and reload to test pre-paint:
await page.evaluate(() => localStorage.setItem('visualMode', 'dark'));
await page.reload();
await page.waitForLoadState('load');
```

**Cross-context live-update driver** — no full analog exists (see No Analog Found). Closest primitive: `worker.evaluate(fn)` already used in the `beforeFunc` callback of `testInOptions` and in `testInWorker`. To drive `storage.onChanged` in the options page context without a second Playwright `page`, call `worker.evaluate(() => chrome.storage.sync.set({ visualMode: 'dark' }))` as a step inside `pageFunc` (after `page.goto`) and then assert `data-theme` on the same page. This fires `storage.onChanged` in the options context.

---

## Shared Patterns

### `const brw = chrome || browser` — Firefox compatibility
**Source:** `src/js/lib/set_icon.js:2`, `src/js/options.js:14`, `src/js/popup.js:8`, `src/js/background.js:6`
**Apply to:** `src/js/lib/theme.js` (inside `installVisualModeListener()`)
```javascript
const brw = chrome || browser;
brw.storage.onChanged.addListener(function(changes, areaName) { ... });
```

### Named exports, no defaults
**Source:** Every lib file (`set_icon.js`, `util.js`, `storage_repository.js`, etc.)
**Apply to:** `src/js/lib/theme.js`
```javascript
export function applyTheme(mode) { ... }
export function installVisualModeListener() { ... }
// No: export default ...
```

### `function` keyword for event handler callbacks
**Source:** `src/js/options.js:191`, `src/js/popup.js:65`, `src/js/popup.js:108`
**Apply to:** `installVisualModeListener()` inner listener; `onchange` augmentation in `options.js`
```javascript
brw.storage.onChanged.addListener(function(changes, areaName) { ... });
// Not: brw.storage.onChanged.addListener((changes, areaName) => { ... });
```

### `.catch(err => console.error(err))` for fire-and-forget async
**Source:** `src/js/popup.js:13`, `src/js/background.js:23-25`
**Apply to:** Any new async calls in popup/options that don't surface errors to UI

### `localStorage` (Web Storage API) vs `chrome.storage.local`
**Source:** `src/js/theme-init.js:1` — `localStorage.getItem('visualMode')`
**Apply to:** All write-through calls in `options.js`, `popup.js`, and `theme.js` listener
```javascript
// CORRECT — Web Storage, synchronous, shared across extension pages, readable by theme-init.js:
localStorage.setItem('visualMode', mode);
// WRONG — async, not readable synchronously by theme-init.js:
// StorageProvider.getLocalRepository().set({ visualMode: mode });
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `test/emulator/visual_mode.spec.js` — cross-context THM-04 scenario | test | event-driven (cross-context) | No existing test opens two extension page contexts (options + popup) simultaneously and asserts that a `storage.onChanged` event propagates between them. Closest primitives: `worker.evaluate()` as the change driver (already used in `testInOptions` `beforeFunc`), `page.evaluate()` for data-theme assertion. Planner must design the multi-context scenario from these building blocks. |
| `src/css/*` | — | — | No CSS changes for Phase 4 (per-profile color already shipped in Phases 2/3; Phase 4 = verification only). No pattern assignment needed. |
| `src/js/theme-init.js` | utility | synchronous read | No change needed (locked by Phase 1). Listed for completeness. |

---

## Metadata

**Analog search scope:** `src/js/lib/`, `src/js/options.js`, `src/js/popup.js`, `src/js/background.js`, `src/js/theme-init.js`, `test/emulator/`
**Files read:** 11
**Pattern extraction date:** 2026-05-28
