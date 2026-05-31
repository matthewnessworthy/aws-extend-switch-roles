# Phase 5: Accessibility, Cross-Browser & Release Audit — Pattern Map

**Mapped:** 2026-05-29
**Files analyzed:** 7 source files to modify + 1 new file
**Analogs found:** 6 / 8 (2 have no codebase analog)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/css/tokens.css` | config | transform | self (in-file: Layer 2 line 109, Layer 3 line 148) | in-file |
| `src/popup.html` | component | request-response | `src/options.html` lines 20-21, 59-63 (labeled controls) | role-match |
| `src/options.html` | component | request-response | `src/options.html` lines 20-21, 41, 59-63 (existing labels in same file) | in-file |
| `src/supporters.html` | component | request-response | `src/options.html` lines 20-21 (label pattern) | role-match |
| `src/js/lib/create_role_list_item.js` | utility | transform | self (line 10 — hardcoded fill) | in-file |
| `src/js/lib/create_role_list_item.test.js` | test | transform | self (lines 41, 165 — innerHTML assertions) | in-file |
| `test/emulator/a11y.spec.js` | test | request-response | `test/emulator/visual_mode.spec.js`, `test/emulator/supporters.spec.js` (fixture pattern only) | partial |
| `BUILD.md` (AMO source zip) | config | — | None | no analog |

---

## Pattern Assignments

### `src/css/tokens.css` (config, transform)

**Analog:** in-file — both dark cascade blocks must be changed together.

**Current pattern — Layer 2 OS-dark @media block** (line 109):
```css
/* Layer 2: OS dark — only when user has NOT forced a theme */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]):not([data-theme="dark"]) {
    --color-border-input: #656871;   /* line 109 — FAILS 3:1 vs dropdown item bg */
  }
}
```

**Current pattern — Layer 3 explicit dark block** (line 148):
```css
/* Layer 3a: Explicit dark override (beats OS preference) */
:root[data-theme="dark"] {
  --color-border-input: #656871;   /* line 148 — same value, same fix needed */
}
```

**Fix to apply to BOTH lines** — change `#656871` to `#6e6e7a`:
- Line 109 (`@media (prefers-color-scheme: dark)` block)
- Line 148 (`[data-theme="dark"]` block)

Rationale: both lines are 2.85:1 against `--color-bg-dropdown-item: #1b232d`; target `#6e6e7a` yields 3.15:1 (WCAG 1.4.11 PASS). Missing either cascade layer means the fix applies to only one dark-theme activation path.

---

### `src/popup.html` (component, request-response)

**Analog:** `src/options.html` lines 20-21 (radio labels), lines 59-63 (checkbox labels) — attribute-only additions, no structural change.

**In-file pattern to follow for labeled form controls** (from options.html line 20-21):
```html
<label for="configStorageSyncRadioButton">
  <input type="radio" class="aesr-radio" name="configStorage" id="configStorageSyncRadioButton" value="sync">Sync
</label>
```

**Gap 1 — `#roleFilter` missing aria-label** (popup.html line 17):
```html
<!-- Current -->
<input id="roleFilter" class="aesr-input" type="text" placeholder="Filter">

<!-- Fix: add aria-label attribute only — no structural change -->
<input id="roleFilter" class="aesr-input" type="text" aria-label="Filter roles" placeholder="Filter">
```

**Gap 2 — `#roleList` missing region label** (popup.html line 19):
```html
<!-- Current -->
<ul id="roleList"></ul>

<!-- Fix: add aria-label attribute only -->
<ul id="roleList" aria-label="AWS roles"></ul>
```
Note: do NOT add `role="listbox"` — the existing `<ul>/<li>/<a>` implicit semantics are correct.

**Gap 3 — `#goldenkey` img missing alt** (popup.html line 42):
```html
<!-- Current -->
<img id="goldenkey" style="display: none" title="Thank you for your support." src="/icons/golden_icon.png" width="44" height="44">

<!-- Fix: add alt attribute (title alone is not sufficient) -->
<img id="goldenkey" style="display: none" alt="Thank you for your support." title="Thank you for your support." src="/icons/golden_icon.png" width="44" height="44">
```

**Constraint:** The `style="display: none"` on `#goldenkey` is a dynamic show/hide by `popup.js` — MUST remain unchanged.

---

### `src/options.html` (component, request-response)

**Analog:** in-file — options.html already contains labeled controls on lines 20-21, 41, 59-63. The three unlabeled controls (lines 25, 27-29) follow the same file and must be fixed to match the existing labeled pattern.

**Existing in-file label pattern** (lines 41-43):
```html
<div class="aesr-form-row">
  <label for="configHubDomain">Domain:</label>
  <input id="configHubDomain" type="text" class="aesr-input" maxlength="40">.aesr.dev
</div>
```

**Gap 4 — `#awsConfigTextArea` missing label** (line 25):
```html
<!-- Current -->
<textarea id="awsConfigTextArea" class="aesr-textarea" spellcheck="false"></textarea>

<!-- Fix: add aria-label (no structural change needed) -->
<textarea id="awsConfigTextArea" class="aesr-textarea" spellcheck="false" aria-label="AWS config (INI format)"></textarea>
```

**Gap 5 — `#colorPicker` and `#colorValue` missing labels** (lines 27-29):

IMPORTANT: `.sr-only` does NOT exist in the codebase CSS (verified: `grep -rn "sr-only" src/css/` returns empty). Do NOT use `class="sr-only"` — it will render as a visible label. Use `aria-label` attributes only on both inputs:

```html
<!-- Current -->
<div class="aesr-color-pair">
  <input type="color" id="colorPicker">
  <b>#</b>
  <input type="text" class="aesr-input" id="colorValue" maxlength="6" placeholder="RRGGBB">
  ...

<!-- Fix: aria-label on both inputs; aria-hidden on decorative <b> -->
<div class="aesr-color-pair">
  <input type="color" id="colorPicker" aria-label="Profile color">
  <b aria-hidden="true">#</b>
  <input type="text" class="aesr-input" id="colorValue" maxlength="6" placeholder="RRGGBB" aria-label="Profile color hex value">
  ...
```

The `<label for>` + `sr-only` pattern from RESEARCH.md is not usable without first adding `.sr-only` to base.css. The `aria-label` only approach is simpler and equally valid.

**Constraint:** Options page Playwright tests use `page.locator('#awsConfigTextArea')`, `page.locator('#colorPicker')`, `page.locator('#colorValue')` — ID selectors are not affected by `aria-label` additions.

---

### `src/supporters.html` (component, request-response)

**Analog:** `src/options.html` lines 20-21 (label pattern) — attribute-only addition, no structural change.

**Gap 6 — `#textareaKeyCode` missing label** (supporters.html line 67):
```html
<!-- Current -->
<textarea id="textareaKeyCode" spellcheck="false"></textarea>

<!-- Fix: add aria-label attribute only -->
<textarea id="textareaKeyCode" spellcheck="false" aria-label="Supporter key code"></textarea>
```

**Constraint:** `supporters.spec.js` uses `page.locator('#textareaKeyCode')` — safe. The `style="display: none"` on `#keyCodeValid` (line 69) and `#keyCodeInvalid` (line 70) MUST NOT change — `supporters.spec.js` asserts `toBeHidden()`/`toBeVisible()` against these elements.

---

### `src/js/lib/create_role_list_item.js` (utility, transform)

**Analog:** in-file — line 10 is the hardcoded fallback swatch fill.

**Current pattern** (line 10):
```js
} else if (!item.image) {
  // set gray if both color and image are undefined
  headSquare.style.backgroundColor = '#aaaaaa';
}
```

**Fix — change fill hex only** (line 10):
```js
  headSquare.style.backgroundColor = '#767676';
```

Contrast impact: light theme `#767676` vs `#ffffff` = 4.54:1 PASS. Dark theme `#767676` vs `#1b232d` = 3.49:1 PASS.

**Constraint:** `anchor.dataset.color = item.color || 'aaaaaa'` on line 35 — do NOT change this value. `dataset.color` reflects the stored profile config default key, which flows into tab group color dispatch. Changing it would be a behavioral change out of scope for this phase.

---

### `src/js/lib/create_role_list_item.test.js` (test, transform)

**Analog:** in-file — the test asserts `innerHTML` containing the CSS fill value in two separate test cases.

**Current pattern — line 41** (`minimum properties` describe block):
```js
expect(a.innerHTML).to.eq(`<span class="headSquare" style="background-color: rgb(170, 170, 170);"> </span>...`);
```

**Current pattern — line 165** (`hidesAccountId is true` describe block):
```js
expect(a.innerHTML).to.eq(`<span class="headSquare" style="background-color: rgb(170, 170, 170);"> </span>...`);
```

**Fix both assertions** — replace `rgb(170, 170, 170)` with `rgb(118, 118, 118)` (which is `#767676`):
- Line 41: update innerHTML string
- Line 165: update innerHTML string

**MUST NOT change** — line 38 in the same file:
```js
expect(a.dataset.color).to.eq('aaaaaa');
```
This asserts the stored `dataset.color` default, not the CSS fill. It is NOT affected by the JS fill change — leave as-is.

---

### `test/emulator/a11y.spec.js` (test, request-response) — NEW FILE

**Analog:** `test/emulator/visual_mode.spec.js` and `test/emulator/supporters.spec.js` — fixture pattern only. There is NO existing axe-core integration in the codebase. The axe-core call sequence has no precedent.

**Fixture import pattern** (from visual_mode.spec.js lines 1-2, supporters.spec.js lines 1-2):
```js
import { testInOptions } from './fixtures.js';
// or
import { testInSupporters } from './fixtures.js';
// or
import { testInPopup } from './fixtures.js';
```

**Test wrapper pattern** (from visual_mode.spec.js lines 5-16):
```js
testInOptions('descriptive test name',
  async () => {
    // before: chrome.storage setup
  },
  async ({ page, expect }) => {
    // pageFunc: drive the page, make assertions
    await page.locator('#someElement').check();
    expect(await page.locator('#someElement').isChecked()).toBeTruthy();
  },
  async () => {
    // after: chrome.storage cleanup
    await chrome.storage.sync.clear();
  }
);
```

**Simpler wrapper for read-only checks** (from supporters.spec.js lines 4-8):
```js
testInSupporters("descriptive name", async ({ page, expect }) => {
  // no before/after needed — just page interaction + assertions
  await expect(page.locator('#someElement')).toBeHidden();
});
```

**Axe-core integration pattern** (no codebase analog — follow RESEARCH.md):
```js
import AxeBuilder from '@axe-core/playwright';

// inside a testInPopup or testInOptions pageFunc:
const accessibilityScanResults = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa'])
  .analyze();
expect(accessibilityScanResults.violations).toEqual([]);
```

**Theme switching pattern for dual-theme scan** (from visual_mode.spec.js lines 44-50):
```js
// Set theme via storage then reload — reliable theme state
await page.evaluate(() => chrome.storage.sync.set({ visualMode: 'dark' }));
await page.waitForTimeout(300);
const dataTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
expect(dataTheme).toBe('dark');
```

**Available fixtures for a11y spec:**
- `testInPopup(message, beforeFunc, pageFunc, afterFunc)` — for popup.html scans
- `testInOptions(message, beforeFunc, pageFunc, afterFunc)` — for options.html scans
- `testInSupporters(message, pageFunc)` — for supporters.html scans

---

## Shared Patterns

### Attribute-only HTML additions (no structural change)
**Apply to:** `src/popup.html`, `src/options.html`, `src/supporters.html`

All 6 ARIA gap fixes add attributes to existing elements. No element is moved, wrapped, or restructured. This preserves all existing Playwright ID-selector locators (`#roleFilter`, `#roleList`, `#awsConfigTextArea`, `#colorPicker`, `#colorValue`, `#textareaKeyCode`, `#keyCodeValid`, `#keyCodeInvalid`).

Pattern: add `aria-label="..."` directly on the element tag. Only `<img>` elements get `alt="..."` instead.

### Double dark-cascade rule
**Apply to:** `src/css/tokens.css`

Any token fix in the dark theme must be applied in BOTH dark blocks:
- Layer 2: `@media (prefers-color-scheme: dark)` with `:root:not([data-theme="light"]):not([data-theme="dark"])` selector
- Layer 3: `:root[data-theme="dark"]` selector

Missing either means the fix applies to only one of the two dark-activation paths (OS-auto vs explicit).

---

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `BUILD.md` (AMO source zip) | config | — | No existing build documentation files in the codebase |
| `test/emulator/a11y.spec.js` (axe call sequence) | test | request-response | No axe-core integration exists; fixture wrappers are the only structural analog |

---

## Release Operations (no file pattern needed)

These are command invocations, not file patterns. Listed here for planner awareness:

| Step | Command | Notes |
|---|---|---|
| Rebuild dist/ | `npm run build` | dist/ is stale — missing options.css and pages.css |
| Create store zips | `npm run archive` | Must run AFTER `npm run build` |
| Permission diff check | `git diff v6.2.1 -- manifest.json manifest_chrome.json manifest_firefox.json` | Already confirmed empty; verify again after build |
| Size sanity | `wc -c dist/chrome/*.zip dist/firefox/*.zip` | Expect ~112KB; well under 128MB limit |
| Firefox/Edge smoke | Manual | Playwright emulator is Chrome-only (`chromium.launchPersistentContext` in `fixtures.js:12`) |
| Store screenshots | Manual | 1280×800px — Chrome Web Store, Firefox AMO, Edge Add-ons |
| AMO source zip | Manual | `src/ + package.json + package-lock.json + rollup.config.js + bin/ + manifest*.json + BUILD.md` |

---

## Metadata

**Analog search scope:** `src/css/`, `src/js/lib/`, `src/popup.html`, `src/options.html`, `src/supporters.html`, `test/emulator/`
**Files scanned:** 10
**Pattern extraction date:** 2026-05-29

**Key verification findings:**
- `.sr-only` CSS class does NOT exist in `src/css/` — do not reference it in any fix; use `aria-label` only
- `rgb(170, 170, 170)` appears in `create_role_list_item.test.js` at lines 41 AND 165 — both must be updated to `rgb(118, 118, 118)` when JS fill changes to `#767676`
- `--color-border-input: #656871` appears at tokens.css line 109 AND line 148 — both must change to `#6e6e7a`
- `anchor.dataset.color = item.color || 'aaaaaa'` on line 35 of `create_role_list_item.js` — unchanged; only the CSS fill on line 10 changes
