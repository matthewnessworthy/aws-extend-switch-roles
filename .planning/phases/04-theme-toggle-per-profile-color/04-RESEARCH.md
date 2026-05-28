# Phase 4: Theme Toggle & Per-Profile Color — Research

**Researched:** 2026-05-28
**Domain:** Browser-extension storage write-through, `chrome.storage.onChanged` live update, pre-paint cache reconciliation
**Confidence:** HIGH

---

> No CONTEXT.md exists for Phase 4. Constraints are derived from `ROADMAP.md` Open Design Decisions,
> prior-phase locked decisions (`02-CONTEXT.md` D-01, `03-UI-SPEC.md` §441–443), and `REQUIREMENTS.md`.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| THM-02 | The existing 3-state "Visual mode" (Browser default / Light / Dark) is preserved; a manual choice overrides the OS preference | Radio IDs `#defaultVisualRadioButton` / `#lightVisualRadioButton` / `#darkVisualRadioButton` kept; `syncStorageRepo.set({ visualMode })` already exists in `options.js:192–193`; augment with `localStorage.setItem` + `applyTheme(mode)` |
| THM-04 | Theme choice persists and follows the user across devices; already-open pages update live when it changes | Write-through to both `chrome.storage.sync['visualMode']` (already done) and `localStorage['visualMode']`; `storage.onChanged` listener in options.js and popup.js; post-load reconcile reads sync canonical and applies if different from localStorage cache |
</phase_requirements>

---

## Summary

Phase 4 wires three pieces of plumbing into the already-built theme engine. No new packages. No HTML changes. The token cascade and pre-paint engine are complete from Phase 1; the visual mode radio controls and storage write already exist in `options.js`; the per-profile color swatch rule (Option E — hex fill + contrast border) shipped in Phases 2 and 3. What is missing is:

1. **Write-through:** When a radio changes, write `visualMode` to both `chrome.storage.sync` and `localStorage`, and immediately apply `data-theme` on `<html>` — making the toggle live on the options page itself (resolves the Phase 3 accepted regression).
2. **Live-update listener:** Register `chrome.storage.onChanged` in both `options.js` and `popup.js` so that toggling the theme in options live-repaints any already-open popup (and vice-versa if popup ever gains a control).
3. **Cross-device reconciliation:** On page load, after the sync `get(['visualMode'])` resolves, if the canonical value in `chrome.storage.sync` differs from `localStorage`, write through and repaint — at most one additional repaint after the pre-paint engine ran.
4. **Per-profile color verification (SC #4):** This is a **verification task only**. Option E shipped in Phase 2 (`.headSquare` border rule in `popup.css`) and Phase 3 (`#colorPicker` border rule in `options.css`). No new render implementation is needed; Phase 4 must confirm both render acceptably in both themes and that the stored hex is never mutated.

The critical implementation detail across all three pieces is `applyTheme(mode)`: the `'default'` value MUST call `document.documentElement.removeAttribute('data-theme')`, never `setAttribute('data-theme', 'default')`. The 3-layer CSS cascade in `tokens.css` relies on the attribute being absent (not set to an unrecognized string) for the OS-dark `@media` layer to activate. This mirrors exactly what `theme-init.js` already does.

**Primary recommendation:** Introduce a thin shared helper (`src/js/lib/theme.js`) exporting `applyTheme(mode)` and `installVisualModeListener()` — both `options.js` and `popup.js` import it, keeping the identical apply logic in one place without touching the non-module `theme-init.js`.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Pre-paint theme application | Browser / Client (parse stream, synchronous) | — | `theme-init.js` — runs before paint; no change needed; reads `localStorage` only |
| Write-through on toggle | Browser / Client (JS, options page) | — | `options.js` radio `onchange` handler; augment to write `localStorage` + call `applyTheme()` |
| Cross-device canonical store | Browser Extension API (`chrome.storage.sync`) | — | Existing `syncStorageRepo.set({ visualMode })` — already there; no change to the write target |
| Live-update pub-sub | Browser Extension API (`chrome.storage.onChanged`) | — | Fires in all registered extension contexts when sync storage changes; listener added in options.js + popup.js |
| Post-load reconciliation | Browser / Client (JS, async) | — | After `syncStorageRepo.get(['visualMode'])` resolves on page load, compare with `localStorage`; write-through if different; at most one repaint |
| Per-profile color render | Browser / Client (CSS + inline style) | — | Already implemented: `.headSquare` fill from JS (`create_role_list_item.js:8`) + border from `popup.css:127`; Phase 4 = verification only |
| `applyTheme()` helper | Browser / Client (JS shared module) | — | New `src/js/lib/theme.js`; imported by `options.js` and `popup.js`; separate from non-module `theme-init.js` |

---

## Standard Stack

### Core (inherited — no new packages)

Phase 4 introduces zero new packages. The entire tech stack is inherited.

| Asset | Purpose | Source |
|-------|---------|--------|
| `chrome.storage.sync` | Canonical cross-device theme store (key: `visualMode`) | Existing `StorageProvider.getSyncRepository()` |
| `chrome.storage.onChanged` | Cross-context live-update pub-sub | Browser extension API; no wrapper needed |
| `localStorage` | Pre-paint cache (key: `visualMode`) | Existing `theme-init.js` reads it; Phase 4 writes it |
| `data-theme` on `<html>` | CSS cascade switch | Existing `tokens.css` 3-layer cascade; `theme-init.js` already sets/removes |

**Package legitimacy audit:** N/A — no packages installed.

---

## Architecture Patterns

### Recommended File Changes

```
src/js/
├── lib/
│   └── theme.js            ← NEW: applyTheme(mode) + installVisualModeListener()
├── options.js              ← AUGMENT: radio onchange writes localStorage + calls applyTheme();
│                             installVisualModeListener() in window.onload;
│                             post-load reconcile after syncStorageRepo.get resolves
├── popup.js                ← AUGMENT: installVisualModeListener() in window.onload
└── theme-init.js           ← NO CHANGE (non-module; Phase 1 locked)
src/css/                    ← NO CHANGE (per-profile color swatch already done)
test/emulator/
└── options.spec.js         ← EXTEND: visual mode write-through + live-update + reconcile tests
```

### Pattern 1: `applyTheme(mode)` — the single apply function

```javascript
// src/js/lib/theme.js
// Source: Phase 1 locked — tokens.css 3-layer cascade contract;
//         ROADMAP "Open Design Decisions" #3 (3-state semantics)
export function applyTheme(mode) {
  if (mode === 'light' || mode === 'dark') {
    document.documentElement.setAttribute('data-theme', mode);
  } else {
    // 'default' — remove attribute so OS @media layer activates
    document.documentElement.removeAttribute('data-theme');
  }
}

export function installVisualModeListener() {
  (chrome || browser).storage.onChanged.addListener(function(changes, areaName) {
    if (areaName === 'sync' && changes.visualMode) {
      const mode = changes.visualMode.newValue || 'default';
      localStorage.setItem('visualMode', mode);
      applyTheme(mode);
    }
  });
}
```
[VERIFIED: tokens.css cascade behavior — confirmed from `src/css/tokens.css` in this repo]

### Pattern 2: Write-through in `options.js` radio `onchange`

The existing handler at `options.js:191–193`:

```javascript
// EXISTING (keep the syncStorageRepo.set)
elById('defaultVisualRadioButton').onchange =
elById('lightVisualRadioButton').onchange =
elById('darkVisualRadioButton').onchange = function() {
  const visualMode = this.value;
  syncStorageRepo.set({ visualMode });
  // ADD:
  localStorage.setItem('visualMode', visualMode);
  applyTheme(visualMode);
};
```
[VERIFIED: confirmed existing handler at `src/js/options.js:191–194`]

`storage.onChanged` will also fire from the `syncStorageRepo.set` call — the listener must not double-apply. This is safe because `applyTheme()` is idempotent (set/remove attribute to the same value is a no-op).

### Pattern 3: Post-load reconciliation in `options.js`

At `options.js:196–219`, after `syncStorageRepo.get(['configSenderId', 'configStorageArea', 'visualMode', ...])` resolves:

```javascript
// EXISTING (around line 213–214)
const visualMode = data.visualMode || 'default';
elById(visualMode + 'VisualRadioButton').checked = true;
// ADD: reconcile localStorage cache with sync canonical
const cached = localStorage.getItem('visualMode') || 'default';
if (cached !== visualMode) {
  localStorage.setItem('visualMode', visualMode);
  applyTheme(visualMode); // at most one repaint (pre-paint already ran)
}
```
[VERIFIED: confirmed `syncStorageRepo.get` call at `src/js/options.js:196`]

The popup performs the same reconcile: its existing `storageRepo.get(...)` at `popup.js:128` does not read `visualMode` today. Add `'visualMode'` to the keys list and reconcile in the callback.

### Pattern 4: `storage.onChanged` listener scope

`chrome.storage.onChanged` fires in:
- Options page context (where the user clicked — but `applyTheme` already ran from the radio handler, so listener fires redundantly — idempotent, safe)
- Popup page context (when open simultaneously — this is the live-update path)
- Service worker (`background.js`) — fires but irrelevant; no `document` to update

Firefox: `chrome.storage.onChanged` is available and behaviorally identical (the `brw = chrome || browser` fallback already covers this). [ASSUMED — standard Firefox extension behavior; MV2 background pages also register `storage.onChanged`.]

### Anti-Patterns to Avoid

- **Setting `data-theme="default"`:** The CSS cascade requires the attribute to be absent for the OS-dark `@media` layer to activate. `removeAttribute` is the correct behavior; `setAttribute('data-theme', 'default')` breaks dark-mode-by-OS-preference for users who haven't explicitly chosen a theme.
- **Adding `matchMedia('prefers-color-scheme:dark')` listener in JS:** The `@media` in `tokens.css` handles OS preference changes automatically when `data-theme` is absent. A JS listener adds redundant repaint risk and a race condition with `storage.onChanged`.
- **Modifying `theme-init.js`:** It is a non-module synchronous script locked by Phase 1. It reads `localStorage` only — it has no `chrome` reference and cannot read `chrome.storage.sync`. Do not add async logic or `import` statements.
- **Writing `visualMode` to `chrome.storage.local`:** The canonical key must stay in `chrome.storage.sync` only (SC #1). `localStorage` (the Web Storage API, not `chrome.storage.local`) is the pre-paint cache — these are two different storage mechanisms.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cross-context live update | Custom message bus, `BroadcastChannel` | `chrome.storage.onChanged` | Native extension API; works across popup/options/service worker; no extra permissions; fires in all registered extension contexts including service worker |
| Pre-paint synchronous read | Any async alternative | `localStorage.getItem` (already in `theme-init.js`) | Only synchronous store accessible during parse; any async alternative arrives after first paint, causing FOUC |
| Per-profile color dark-mode adjustment | Luminance calculation, CSS `color-mix()`, stored hex mutation | Option E — hex fill + border already implemented | Zero color math, zero data mutation, zero storage migration; shipped in Phases 2–3 |

**Key insight:** The entire Phase 4 mechanism is three lines of JS per listener call-site plus a single shared helper. The hard part was Phase 1 (3-layer cascade + pre-paint engine). Phase 4 connects existing pieces.

---

## Common Pitfalls

### Pitfall 1: `removeAttribute` vs `setAttribute('data-theme', 'default')`

**What goes wrong:** Setting `data-theme="default"` instead of removing the attribute. The OS-dark `@media` layer in `tokens.css` uses `:root:not([data-theme="light"]):not([data-theme="dark"])`. If `data-theme` is set to any string (including `"default"`), the `:not()` guards fail and dark-OS users with "Browser default" selection get a permanently-light interface.

**Why it happens:** "Default" feels like a state to set, not an absence.

**How to avoid:** The `applyTheme(mode)` helper centralizes this logic; once correct there, all callers are correct. Mirror the existing `theme-init.js` logic exactly:
```javascript
// theme-init.js (EXISTING, correct):
var m = localStorage.getItem('visualMode');
if (m === 'light' || m === 'dark') {
  document.documentElement.setAttribute('data-theme', m);
} else {
  document.documentElement.removeAttribute('data-theme');
}
```

**Warning signs:** Options page shows light theme for an OS-dark user after toggling to "Browser default."

### Pitfall 2: `localStorage` vs `chrome.storage.local` confusion

**What goes wrong:** Writing the pre-paint cache to `chrome.storage.local` instead of the Web `localStorage` API. The pre-paint script (`theme-init.js`) reads `localStorage.getItem('visualMode')` — the synchronous Web Storage API. `chrome.storage.local` is async-only and would be unavailable before paint.

**Why it happens:** "local storage" appears in two contexts in this codebase with different meanings.

**How to avoid:** The write is `localStorage.setItem('visualMode', mode)` (Web Storage) — the same API `theme-init.js` reads. Never `StorageProvider.getLocalRepository().set({ visualMode })` for the pre-paint cache.

**Warning signs:** `theme-init.js` reads back `null` after a toggle; FOUC on next popup open.

### Pitfall 3: Double-apply from radio handler + `storage.onChanged` listener

**What goes wrong:** `applyTheme()` runs twice in the options context — once from the radio `onchange` handler, once from the `storage.onChanged` callback that fires in response to `syncStorageRepo.set({ visualMode })`.

**Why it's not a real problem:** `applyTheme()` is idempotent — setting/removing an attribute to its current value is a DOM no-op. A second repaint does not occur.

**How to avoid:** Ensure `applyTheme()` is a pure setAttribute/removeAttribute operation with no side effects. Do not add flash-prevention logic that short-circuits on "same value" — the DOM already handles this.

### Pitfall 4: Popup-open detection gap

**What goes wrong:** The `storage.onChanged` listener in `popup.js` fires and calls `applyTheme()`, but the popup is already closed before the change propagates. This causes no harm — the next popup open will pre-paint from `localStorage` (which was written through by `installVisualModeListener` on the options side).

**Why it's not a real problem:** The listener is installed in `window.onload` inside the popup's page context — if the popup closes, the context is destroyed and the listener is removed. The localStorage write-through from the options side ensures the next popup open gets the right theme.

---

## Code Examples

### Full `theme.js` helper

```javascript
// src/js/lib/theme.js
// Source: derived from Phase 1 tokens.css contract (this repo) +
//         ROADMAP "Open Design Decisions" #3 (preserve 'default'/'light'/'dark')

/**
 * Apply visualMode to the document by setting/removing data-theme on <html>.
 * 'default' MUST remove the attribute — not set it to 'default' — so the
 * @media (prefers-color-scheme: dark) :root:not([data-theme="light"]):not([data-theme="dark"])
 * layer in tokens.css can activate for OS-dark users.
 *
 * @param {'default'|'light'|'dark'|string} mode
 */
export function applyTheme(mode) {
  if (mode === 'light' || mode === 'dark') {
    document.documentElement.setAttribute('data-theme', mode);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

/**
 * Register a chrome.storage.onChanged listener that live-updates data-theme
 * and refreshes the localStorage pre-paint cache whenever chrome.storage.sync
 * 'visualMode' changes in any context.
 *
 * Install once per page context in window.onload.
 */
export function installVisualModeListener() {
  const brw = chrome || browser;
  brw.storage.onChanged.addListener(function(changes, areaName) {
    if (areaName === 'sync' && changes.visualMode) {
      const mode = changes.visualMode.newValue || 'default';
      localStorage.setItem('visualMode', mode);
      applyTheme(mode);
    }
  });
}
```

### Additions to `options.js` window.onload

```javascript
// At top of options.js (with other imports):
import { applyTheme, installVisualModeListener } from './lib/theme.js';

// Inside window.onload, immediately after syncStorageRepo is declared:
installVisualModeListener();

// Replace the existing visual mode radio onchange (options.js:191–193):
elById('defaultVisualRadioButton').onchange =
elById('lightVisualRadioButton').onchange =
elById('darkVisualRadioButton').onchange = function() {
  const visualMode = this.value;
  syncStorageRepo.set({ visualMode });
  localStorage.setItem('visualMode', visualMode);
  applyTheme(visualMode);
};

// Inside the syncStorageRepo.get().then(data => { ... }) callback (after line 214):
const visualMode = data.visualMode || 'default';
elById(visualMode + 'VisualRadioButton').checked = true;
// Reconcile localStorage cache with sync canonical:
if ((localStorage.getItem('visualMode') || 'default') !== visualMode) {
  localStorage.setItem('visualMode', visualMode);
  applyTheme(visualMode);
}
```

### Additions to `popup.js` window.onload

```javascript
// At top of popup.js (with other imports):
import { applyTheme, installVisualModeListener } from './lib/theme.js';

// Inside window.onload, near top (before main()):
installVisualModeListener();

// Inside storageRepo.get (popup.js:129) — add 'visualMode' to the keys:
const storageRepo = StorageProvider.getSyncRepository();
storageRepo.get(['autoTabGrouping', 'visualMode']).then(({ autoTabGrouping, visualMode }) => {
  // Reconcile pre-paint cache with sync canonical:
  if ((localStorage.getItem('visualMode') || 'default') !== (visualMode || 'default')) {
    localStorage.setItem('visualMode', visualMode || 'default');
    applyTheme(visualMode || 'default');
  }
  if (autoTabGrouping) {
    brw.runtime.sendMessage({ action: 'listenTabGroupsRemove' });
  }
});
```

---

## Per-Profile Color × Dark Mode (SC #4) — Verification Only

**This is not a new implementation task.** Option E shipped:

- **Popup swatch:** `popup.css:121–131` — `.headSquare` has `border: 1px solid var(--color-border-input)`. The fill (`headSquare.style.backgroundColor`) is set from the stored hex verbatim in `create_role_list_item.js:8`. [VERIFIED: confirmed in `src/css/popup.css` lines 121–131 and `src/js/lib/create_role_list_item.js` lines 5–11]
- **Options color picker:** `options.css:105–111` — `#colorPicker` has `border: 1px solid var(--color-border-input)`. [VERIFIED: confirmed in `src/css/options.css` lines 105–111]
- **Console-header path:** Untouched. `data.color` is passed to the switch action in `popup.js:213–214` as-is; it flows through `content.js` and WAR scripts which are out of scope.
- **Stored hex:** Never mutated anywhere in the Phase 2/3/4 rendering path.

**Phase 4 verification task:** In both light and dark themes, confirm the swatch fills and borders render without visual regression. This is a smoke check, not a code change.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Firefox `chrome.storage.onChanged` fires in MV2 background pages and content-accessible pages (options, popup) identically to Chrome MV3 | Pattern 4 | Low — `brw = chrome \|\| browser` pattern already used throughout; Firefox extensions support `storage.onChanged` [ASSUMED from training knowledge; standard Firefox extension API] |
| A2 | `chrome.storage.onChanged` fires in the popup context while the popup is open | Pattern 4 | Low — well-established extension API behavior; if wrong, popup live-update degrades to "reopen popup" which is the baseline today |
| A3 | Setting `localStorage.setItem` in the options page is visible to the popup page on next open (same extension origin) | Pattern 2 | Low — extension pages share the same `localStorage` partition by origin in both Chrome and Firefox |

---

## Open Questions (RESOLVED)

1. **`'default'` value in localStorage — clear key, or set string `'default'`?**
   RESOLVED: Write the string `'default'`. The radio `onchange` handler reads `this.value` which is the HTML `value` attribute — `'default'`, `'light'`, or `'dark'` — so `localStorage.setItem('visualMode', 'default')` is what gets written. The reconcile logic normalizes both `null` (absent key) and the string `'default'` via `|| 'default'` before comparing, preventing a spurious repaint on first install. `theme-init.js`'s else-branch handles both correctly.

2. **Do aux pages (supporters/credits/updated) need a `storage.onChanged` live-update listener?**
   RESOLVED: Skip for Phase 4. Aux pages are rarely open simultaneously with an options toggle; they get the correct theme on next open via `theme-init.js` + localStorage cache. The addition is a 3-line change deferred to a future phase if ever desired.

3. **Toggle shape — keep 3 radio inputs or add segmented control?**
   RESOLVED: Keep 3 radios for Phase 4. The DOM IDs (`#defaultVisualRadioButton`, `#lightVisualRadioButton`, `#darkVisualRadioButton`) are the Playwright selector contract and must be preserved. Segmented-control polish is deferred to `THP-01`; the functional wiring is independent of the control shape.

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — pure JS/CSS code change, no CLI tools or services required).

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Playwright 1.58.2 (emulator) + Mocha 11.7.5 (unit) |
| Config file | `playwright.config.ts` |
| Quick run command | `npm test` (unit) |
| Full suite command | `npm run test_emulator` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| THM-02 | Visual mode radio writes `localStorage` + applies `data-theme` immediately | integration | `npm run test_emulator -- --grep "visual mode"` | ❌ Wave 0 |
| THM-02 | `'default'` radio removes `data-theme` attribute (not sets to `'default'`) | integration | `npm run test_emulator -- --grep "visual mode"` | ❌ Wave 0 |
| THM-04 | Toggling in options live-updates already-open pages via `storage.onChanged` | integration | `npm run test_emulator -- --grep "visual mode"` | ❌ Wave 0 |
| THM-04 | Post-load reconcile: sync canonical differs from localStorage cache → single repaint | integration | `npm run test_emulator -- --grep "visual mode reconcile"` | ❌ Wave 0 |
| THM-04 | `visualMode` persists cross-device via `chrome.storage.sync['visualMode']` key (not new key) | integration | `npm run test_emulator -- --grep "visual mode"` | ❌ Wave 0 |

**Note on `--grep` filter:** Use `npx playwright test --grep "visual mode"` if filtering individual specs is needed during development; the CI gate is the full suite.

### Sampling Rate

- **Per task commit:** `npm test` (unit suite — 33 tests, ~120ms)
- **Per wave merge:** `npm run test_emulator` (Chrome + Firefox; Edge failures are pre-existing infrastructure issues, not regression)
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `test/emulator/visual_mode.spec.js` — covers THM-02 (write-through, `removeAttribute` for default) and THM-04 (live-update, reconcile, sync key preserved)
  - Uses `testInOptions` fixture from `test/emulator/fixtures.js`
  - Must test: radio toggle writes `chrome.storage.sync['visualMode']` (not a new key); `localStorage['visualMode']` is set; `data-theme` is applied on `<html>` immediately
  - Must test: `'default'` radio → `data-theme` absent (not `="default"`)
  - Must test: `storage.onChanged` fires in second page context and updates `data-theme`

*(Foundation spec `foundation.spec.js` already covers FOUC / pre-paint behavior — no changes needed there)*

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | yes | `visualMode` value validated on read; default to `'default'` for any non-`'light'`/`'dark'` string |
| V6 Cryptography | no | — |

### Threat Patterns for This Phase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Malicious `visualMode` value in `chrome.storage.sync` (e.g., injected by a compromised sync account) | Tampering | `applyTheme()` validates via `if (mode === 'light' \|\| mode === 'dark')` — any other string falls to the `else` (removeAttribute) branch; no `innerHTML`, no `eval`, no CSS injection possible via this path |
| `localStorage['visualMode']` polluted by page content (cross-origin) | Spoofing | Extension pages share the extension origin's localStorage partition, isolated from web pages. No mitigation needed beyond the existing `theme-init.js` validate-on-read pattern |

**Note:** The `visualMode` value is consumed as a literal attribute string and a DOM `setAttribute`/`removeAttribute` call only — it never reaches `innerHTML`, `eval`, or a CSS `url()`. Injection surface is negligible.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `.darkMode` class toggle on `<body>` (Phase 3 regression) | `data-theme` attribute on `<html>` + `storage.onChanged` | Phase 4 (this phase) | Restores live update; enables cross-device and cross-context sync |
| `chrome.storage.sync`-only (write, no immediate visual change) | Write-through: `chrome.storage.sync` + `localStorage` + `applyTheme()` | Phase 4 | Eliminates the Phase 3→4 transitional regression |

---

## Sources

### Primary (HIGH confidence)

- `src/js/theme-init.js` — verified pre-paint `localStorage` read + `removeAttribute` for default
- `src/css/tokens.css` — verified 3-layer cascade, `:root:not([data-theme="light"]):not([data-theme="dark"])` guard
- `src/js/options.js:191–219` — verified existing radio handler + `syncStorageRepo.get` call
- `src/js/popup.js:128–133` — verified existing `storageRepo.get` call
- `src/css/popup.css:121–131` — verified `.headSquare` border rule (Option E, Phase 2)
- `src/css/options.css:105–111` — verified `#colorPicker` border rule (Option E, Phase 3)
- `.planning/phases/02-popup-surface/02-CONTEXT.md` D-01 — Option E locked decision
- `.planning/phases/03-options-auxiliary-surfaces/03-UI-SPEC.md` §441–443 — Phase 3→4 transitional regression and `syncStorageRepo.set` preservation

### Secondary (MEDIUM confidence)

- `ROADMAP.md` "Open Design Decisions" #2 + #3 — theme-toggle placement and 3-state semantics
- `test/emulator/foundation.spec.js` — confirmed existing FOUC/pre-paint spec coverage

### Tertiary (LOW confidence / ASSUMED)

- A1–A3 in Assumptions Log: `chrome.storage.onChanged` cross-context behavior in Firefox MV2 and localStorage cross-page visibility within extension origin

---

## Metadata

**Confidence breakdown:**
- Write-through mechanism: HIGH — source code confirmed; no ambiguity
- `storage.onChanged` live-update: HIGH — standard extension API; used elsewhere in codebase for tab groups
- Per-profile color SC #4: HIGH — Option E fully shipped in Phases 2/3; verification only
- Cross-device reconcile: HIGH — `syncStorageRepo.get` pattern already established
- Firefox behavior (assumptions A1–A3): MEDIUM — standard behavior but not locally verified in this session

**Research date:** 2026-05-28
