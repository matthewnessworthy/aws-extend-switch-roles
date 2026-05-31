# Phase 5: Accessibility, Cross-Browser & Release Audit — Research

**Researched:** 2026-05-29
**Domain:** WCAG 2.1 AA audit, browser extension store release prep, automated a11y testing
**Confidence:** HIGH

## Summary

Phase 5 is an audit-and-fix pass, not a pure verification pass. The success criteria are phrased as completion states ("is met," "passes," "verified"), meaning every identified gap must be resolved before the phase is done. This research identifies exactly what already passes, what needs a concrete code fix, what requires a manual smoke test, and what the release prep steps are.

The design system (tokens, base.css, components.css, popup.css, options.css, pages.css) shipped in Phases 1-4 establishes a solid a11y baseline: focus rings are tokenized in base.css (no surface CSS overrides `outline` — verified by grep), and contrast ratios for all token-to-token text pairs pass WCAG 2.1 AA in both themes. Seven specific gaps require code fixes across A11Y-01, A11Y-02, A11Y-03: (1) `#roleFilter` missing aria-label, (2) `#roleList` missing aria-label, (3) `#goldenkey <img>` missing alt, (4) `#awsConfigTextArea` unlabeled textarea, (5) `#colorPicker` unlabeled, (6) `#colorValue` unlabeled (placeholder `RRGGBB` is not a label), (7) `#textareaKeyCode` unlabeled. Two contrast fixes: dark `--color-border-input` #656871 → #6e6e7a (swatch border 2.85:1 → 3.15:1), default swatch gray `#aaaaaa` → `#767676` (2.32:1 → 4.54:1 in light). The `create_role_list_item.test.js` asserts the `#aaaaaa` value in both the `dataset.color` and `innerHTML` assertions — the unit test MUST be updated alongside the JS fix. The normal button border is 1.70:1 against white — this is acceptable because the text label provides affordance per WCAG 1.4.11 (text-identified components are exempt from boundary contrast).

Release prep: run `npm run build` (dist/ is stale — missing options.css and pages.css), run `npm run archive`, re-shoot store screenshots, prepare AMO source zip. The manifest has no diff vs the v6.2.1 baseline (verified: `git diff v6.2.1 -- manifest*.json` produces no output), preserving the fast-review path on all three stores.

**Primary recommendation:** Fix the 7 a11y gaps (labels + contrast tokens + JS), update the unit test, run the full suite, rebuild, and execute a manual smoke test on Firefox and Edge before releasing.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| A11Y-01 | Every interactive element has a visible `:focus-visible` indicator in both themes | `base.css:97` defines `2px solid var(--color-border-focus)` at outline-offset 2px. No surface CSS overrides `outline` (grep of all 5 CSS files confirms only the base.css definition). Token contrast: light 4.97:1, dark 7.44:1. Smoke-test needed to confirm no browser-specific suppression. |
| A11Y-02 | All controls have accessible labels/roles/names | 7 gaps identified and fixed in this phase: roleFilter, roleList, goldenkey alt, awsConfigTextArea, colorPicker, colorValue, textareaKeyCode. Options form controls (radios, checkboxes, Config Hub inputs, API input) already have `<label for>` associations. |
| A11Y-03 | WCAG 2.1 AA contrast in both themes including per-profile color | All token text pairs PASS (table below). Two extension-controlled gaps: dark `--color-border-input` 2.85:1 (fix: #6e6e7a), default swatch `#aaaaaa` 2.32:1 light (fix: #767676). User-stored hex fills are user-determined content (excluded per WCAG 1.4.11). |
| A11Y-04 | No regression in Playwright/jsdom tests | 39 unit tests passing. `create_role_list_item.test.js` asserts `#aaaaaa` inline; unit test must be updated when JS changes to `#767676`. 7 Playwright spec files cover existing behavior — HTML attribute additions are selector-safe. |
| A11Y-05 | Visual parity verified on Chrome, Firefox, and Edge in both themes | Playwright emulator is Chrome-only (`chromium.launchPersistentContext` in `fixtures.js:12`). Firefox and Edge verified by manual smoke test only. |
</phase_requirements>

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Focus indicator | CSS (base.css) | — | Global `:focus-visible` rule; no surface CSS overrides it |
| Accessible labels | HTML (src/*.html) + JS (create_role_list_item.js) | — | Labels live in markup and the DOM-building function |
| Contrast compliance | CSS (tokens.css) | JS (create_role_list_item.js) | Tokens own text/border contrast; swatch fallback color is hardcoded in JS |
| Cross-browser visual parity | Manual smoke | Playwright (Chrome-only) | Playwright covers Chrome only; Firefox/Edge require manual |
| Release packaging | bin/build.sh + bin/archive.sh | — | Build then archive produces store zips |
| Store screenshots | Manual (human) | — | No automated screenshot workflow |
| AMO source submission | Manual (human) | — | Requires source zip + build README |

---

## Standard Stack

No new runtime dependencies are introduced in this phase. The "zero new runtime deps" constraint holds. One optional devDependency may be added for automated a11y coverage.

### Automated A11Y Testing Option

`@axe-core/playwright` [ASSUMED — slopcheck unavailable; Deque provenance + 4yr registry age are strong signals] is the standard Playwright-native accessibility testing package from Deque (the axe authors).

- `npm view @axe-core/playwright version` → `4.11.3` [VERIFIED: npm registry]
- Published: 2021-06-02 [VERIFIED: npm registry]
- Source: `github.com/dequelabs/axe-core-npm` [VERIFIED: npm registry]
- No `postinstall` script [VERIFIED: npm registry]
- `peerDependency`: `playwright-core >= 1.0.0` — compatible with the existing `@playwright/test 1.60.0` [VERIFIED: npm registry]
- Playwright `page.evaluate()` works inside `chrome-extension://` URLs — the extension context is a real browsing context accessible from Playwright [ASSUMED: consistent with Playwright docs and the existing emulator test pattern]

The package is a devDep — it does NOT affect the extension bundle, store review, or runtime permissions.

**Decision for planner:** Add as devDep and write `test/emulator/a11y.spec.js` — fastest path to automated WCAG coverage and verification on record. Alternatively, a manual checklist is acceptable but undocumented.

### Package Legitimacy Audit

| Package | Registry | Age | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-------------|-----------|-------------|
| `@axe-core/playwright` | npm | ~4 yrs | github.com/dequelabs/axe-core-npm | Unavailable | [ASSUMED] — slopcheck not installed; planner should add `checkpoint:human-verify` before install if desired |

**Installation (if devDep chosen):**
```bash
npm install --save-dev @axe-core/playwright
```

---

## Concrete A11Y Gaps (Must Fix)

### Gap 1: #roleFilter — missing programmatic label (A11Y-02)

**File:** `src/popup.html:17`

```html
<!-- Current -->
<input id="roleFilter" class="aesr-input" type="text" placeholder="Filter">

<!-- Fix: add aria-label -->
<input id="roleFilter" class="aesr-input" type="text" aria-label="Filter roles" placeholder="Filter">
```

`placeholder` is not a persistent accessible label — it disappears on focus. The `aria-label` attribute does not affect the `#roleFilter` CSS/JS selector used in `keyboard_navigation.spec.js` and `keyboard_edge_cases.spec.js`.

### Gap 2: #roleList — missing region label (A11Y-02)

**File:** `src/popup.html:19`

```html
<!-- Current -->
<ul id="roleList"></ul>

<!-- Fix: add aria-label -->
<ul id="roleList" aria-label="AWS roles"></ul>
```

The `<ul>/<li>/<a>` structure already has correct implicit semantics (list + listitem + link). `role="listbox"` would be wrong — it implies `aria-selected` / `option` children and a different keyboard contract. Only the region label is missing. No existing test selector references `aria-label` on `#roleList`.

### Gap 3: #goldenkey img — missing alt attribute (A11Y-02)

**File:** `src/popup.html:42`

```html
<!-- Current -->
<img id="goldenkey" style="display: none" title="Thank you for your support." src="/icons/golden_icon.png" width="44" height="44">

<!-- Fix: add alt -->
<img id="goldenkey" style="display: none" alt="Thank you for your support." title="Thank you for your support." src="/icons/golden_icon.png" width="44" height="44">
```

`title` is not an adequate alt substitute. No test selector references this image.

### Gap 4: #awsConfigTextArea — missing label (A11Y-02)

**File:** `src/options.html:25`

```html
<!-- Current: no <label> associated -->
<textarea id="awsConfigTextArea" class="aesr-textarea" spellcheck="false"></textarea>

<!-- Fix: add aria-label (or prepend a visible <label for>) -->
<textarea id="awsConfigTextArea" class="aesr-textarea" spellcheck="false" aria-label="AWS config (INI format)"></textarea>
```

The textarea is the primary options editing surface and has no programmatic label. Existing test `options.spec.js` uses `page.locator('#awsConfigTextArea')` (ID selector) — adding `aria-label` is safe.

### Gap 5: #colorPicker — missing label (A11Y-02)

**File:** `src/options.html:27-29`

```html
<!-- Current -->
<div class="aesr-color-pair">
  <input type="color" id="colorPicker">
  <b>#</b>
  <input type="text" class="aesr-input" id="colorValue" maxlength="6" placeholder="RRGGBB">
  ...
```

`#colorPicker` has no label. `#colorValue` has only a placeholder ("RRGGBB" — not a label). These two inputs work as a pair.

```html
<!-- Fix -->
<div class="aesr-color-pair">
  <label for="colorPicker" class="sr-only">Profile color</label>
  <input type="color" id="colorPicker" aria-label="Profile color (pick)">
  <b aria-hidden="true">#</b>
  <input type="text" class="aesr-input" id="colorValue" maxlength="6" placeholder="RRGGBB" aria-label="Profile color hex value">
  ...
```

No Playwright test asserts these elements by label — ID selectors (`#colorPicker`, `#colorValue`) are used if at all.

### Gap 6: #textareaKeyCode in supporters.html — missing label (A11Y-02)

**File:** `src/supporters.html` (line with `<textarea id="textareaKeyCode">`)

```html
<!-- Current -->
<textarea id="textareaKeyCode" spellcheck="false"></textarea>

<!-- Fix -->
<textarea id="textareaKeyCode" spellcheck="false" aria-label="Supporter key code"></textarea>
```

`supporters.spec.js` uses `page.locator('#textareaKeyCode')` — adding `aria-label` is safe. The `style="display: none"` on `#keyCodeValid` and `#keyCodeInvalid` MUST remain unchanged (test asserts their visibility via `isHidden()`/`isVisible()`).

### Gap 7: dark theme --color-border-input fails 3:1 for swatch boundary (A11Y-03)

**Root cause:** The swatch (`.headSquare`) uses `border: 1px solid var(--color-border-input)`. In dark theme, `--color-border-input: #656871` vs dropdown item background `--color-bg-dropdown-item: #1b232d` = **2.85:1** — fails WCAG 1.4.11 Non-text Contrast (3:1).

**Why this matters:** The swatch border is extension-controlled and is the ONLY visual boundary between the swatch fill (user's arbitrary hex) and the surrounding item background. When the fill ≈ background (e.g., a black swatch in dark theme, or a white swatch in light), the border carries all boundary contrast. Open Design Decision #1 (Option E) explicitly names the contrast border as the legibility mechanism.

**Fix:** Bump `--color-border-input` in dark from `#656871` to `#6e6e7a`. This must be applied to **both** dark cascade layers in tokens.css (Layer 2 OS-dark `@media` block AND Layer 3 `[data-theme="dark"]` block — missing either means the fix applies to only half the dark-theme paths).

| Background | Old ratio | New ratio |
|-----------|-----------|-----------|
| `#1b232d` (dropdown item) | 2.85:1 **FAIL** | 3.15:1 PASS |
| `#161d26` (bg-layout / inputs) | 3.05:1 PASS | 3.37:1 PASS |
| `#131920` (dropdown hover) | 3.18:1 PASS | 3.51:1 PASS |

All other uses of `--color-border-input` (textarea, text inputs, color picker) benefit from the same bump — they become slightly more visible in dark, consistent with design intent.

**File:** `src/css/tokens.css` — two changes (Lines in the OS-dark `@media` block and the `[data-theme="dark"]` block).

### Gap 8: default swatch color #aaaaaa fails 3:1 in light (A11Y-03)

**File:** `src/js/lib/create_role_list_item.js:7-8`

```js
// Current (line ~8)
headSquare.style.backgroundColor = '#aaaaaa';
```

Light: `#aaaaaa` vs item-bg `#ffffff` = **2.32:1** — fails WCAG 1.4.11 3:1.

User-stored hex fills (non-default) are user-determined content — WCAG excludes user-chosen colors from the 3:1 requirement. Only the extension-controlled default must be fixed.

**Fix:**
```js
headSquare.style.backgroundColor = '#767676';
```

| Background | Old ratio | New ratio |
|-----------|-----------|-----------|
| `#ffffff` (light item-bg) | 2.32:1 **FAIL** | 4.54:1 PASS |
| `#1b232d` (dark item-bg) | 6.82:1 PASS | 3.49:1 PASS |

**IMPORTANT — unit test must be updated in the same change:**

`create_role_list_item.test.js` asserts `#aaaaaa` in two places [VERIFIED: codebase]:
1. `expect(a.dataset.color).to.eq('aaaaaa')` (line ~38) — this is `anchor.dataset.color` which is set from `item.color || 'aaaaaa'` in the JS. This assertion is testing the STORED config value, not the CSS fill. Changing the CSS fill does NOT affect this assertion. Leave as-is.
2. `expect(a.innerHTML).to.eq(`...style="background-color: rgb(170, 170, 170);"...`)` (line ~48) — this DOES assert the inline style background color. Must be updated to `rgb(118, 118, 118)` (which is `#767676`).

Note: `dataset.color` reflects the profile's stored `color` key value (or `'aaaaaa'` as the default stored key value). The default stored key value `'aaaaaa'` in `anchor.dataset.color = item.color || 'aaaaaa'` is separate from the CSS fill. Only the CSS fill changes; the dataset.color default can remain `'aaaaaa'` unless the project also wants to change the default stored color value (out of scope for this phase — that would be a behavioral change).

---

## What Already Passes (Do Not Break)

### Focus indicators (A11Y-01)

`base.css:97` defines:
```css
:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
  border-radius: var(--radius-focus-ring);
}
```

Grep of all 5 surface CSS files (popup.css, options.css, pages.css, components.css, base.css) for `outline` returns only the base.css definition — no surface file contains `outline: none` or `outline: 0`. [VERIFIED: grep]

Token contrast (both themes):
- Light: `--color-border-focus #006ce0` vs `--color-bg-layout #ffffff` = **4.97:1** PASS
- Dark: `--color-border-focus #42b4ff` vs `--color-bg-layout #161d26` = **7.44:1** PASS

### Token text contrast — all pairs (A11Y-03)

All computed token-to-token text pairs, both themes. Computed from token hex values in `src/css/tokens.css` using the WCAG relative luminance formula. [VERIFIED: computed]

| Pair | Light | Dark |
|------|-------|------|
| `--color-text-body` on `--color-bg-layout` | 18.50:1 | 9.99:1 |
| `--color-text-secondary` on `--color-bg-layout` | 9.44:1 | 9.99:1 |
| `--color-text-secondary` on `--color-bg-dropdown-item-hover` | 8.53:1 | — |
| `--color-text-status-success` on `--color-bg-container` | 5.09:1 | 6.27:1 |
| `--color-text-status-error` on `--color-bg-container` | 5.23:1 | 6.72:1 |
| `--color-text-status-warning` on `--color-bg-container` | 6.13:1 | 11.69:1 |
| Primary button text on `--color-bg-button-primary` | 4.97:1 | 7.44:1 |
| `--color-link` on `--color-bg-layout` | 4.97:1 | 7.44:1 |
| `--color-text-form-secondary` on `--color-bg-layout` | 5.57:1 | 6.86:1 |

All pass WCAG 2.1 AA (4.5:1 body text, 3:1 large/UI).

### Normal button border (informational — not a violation)

Light: `--color-border-divider #c6c6cd` vs `--color-bg-layout #ffffff` = 1.70:1. Dark: `--color-border-divider #424650` vs `--color-bg-layout #161d26` = 1.80:1.

This does NOT violate WCAG 1.4.11 because the `.aesr-btn--normal` button's text label (`--color-text-body #0f141a` vs white = 18.50:1) provides the component identification. Per WCAG 1.4.11 Understanding document: components where the visual presentation of text provides the identification of the component are not required to have a 3:1 boundary contrast. [ASSUMED — interpretation of WCAG 1.4.11 SC Understanding doc; Cloudscape uses the same pattern]

### Options page labels — what's covered (A11Y-02)

These form controls already have complete `<label for>` associations [VERIFIED: options.html grep]:
- `configStorageSyncRadioButton`, `configStorageLocalRadioButton` (lines 20-21)
- `configHubDomain`, `configHubClientId` (lines 41, 45) — these have `<label for>` wrapping
- `hidesAccountIdCheckBox`, `showOnlyMatchingRolesCheckBox`, `autoTabGroupingCheckBox`, `signinEndpointInHereCheckBox`, `autoAssumeLastRoleCheckBox` (lines 59-63)
- `defaultVisualRadioButton`, `lightVisualRadioButton`, `darkVisualRadioButton` (lines 66-68)
- `configSenderIdText` (line 75)

### Inline style= attributes — expected, non-violating [VERIFIED: HTML grep]

- `src/popup.html`: `display: none` on `#main`, `#noMain`, `#supportComment`, `#goldenkey`, `#sandbox` — dynamic show/hide by popup.js; static value, not injectable
- `src/options.html`: `display: none` on `#configHubPanel` — dynamic show/hide
- `src/supporters.html`: `display: none` on `#keyCodeValid`, `#keyCodeInvalid` — Playwright test asserts these via `isHidden()`/`isVisible()`; MUST NOT be removed

No `<style>` blocks remain in any HTML file.

### Manifest permissions — clean baseline [VERIFIED: git diff]

`git diff v6.2.1 -- manifest.json manifest_chrome.json manifest_firefox.json` produces no output.

- Chrome: `["activeTab", "storage"]` + optional `tabGroups` + optional host `https://*.aesr.dev/*`
- Firefox: `["activeTab", "storage"]` + optional host `https://*.aesr.dev/*`

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| WCAG contrast ratio calculation | Custom luminance math | Pre-computed values in this research | Formula is exact; all token pairs already computed |
| Accessibility tree inspection | Custom DOM walker | `@axe-core/playwright` + browser DevTools | axe catches ~50% of automated WCAG violations; DevTools covers the rest |
| Archive size check | Script | `wc -c dist/chrome/*.zip` | One command |
| Permission diff verification | Custom diff | `git diff v6.2.1 -- manifest*.json` | Already verified — empty output |

---

## Common Pitfalls

### Pitfall 1: Breaking Playwright test selectors during a11y markup changes

**What goes wrong:** Restructuring HTML hierarchy invalidates `page.locator('#roleFilter')`, `page.waitForSelector('#roleList li')`, `#configStorageSyncRadioButton`, `#textareaKeyCode`, `#keyCodeInvalid`, etc.

**How to avoid:** Only ADD attributes to existing elements — never restructure nesting. All 6 label gaps above (Gaps 1-6) add attributes to elements that already exist; no hierarchy change.

**Warning signs:** Any change to `<li>` nesting inside `#roleList`, or the `.aesr-color-pair` div structure.

### Pitfall 2: Chrome-only emulator treated as cross-browser verification

**What goes wrong:** `fixtures.js:12` uses `chromium.launchPersistentContext` — the emulator is Chrome-only despite `playwright.config.ts` declaring Firefox and Edge projects. Those projects are for non-extension Playwright tests; the extension emulator relies on Chrome's `--load-extension` flag.

**How to avoid:** Firefox and Edge require manual smoke. Never claim Playwright emulator green = cross-browser verified.

### Pitfall 3: Stale dist/ missing options.css and pages.css

**Current state:** `dist/chrome/css/` has only 4 files (tokens, base, components, popup). `options.css` and `pages.css` exist in `src/css/` and `test/extension/css/` but are not in dist/ — the dist was not rebuilt after Phase 3. Running `npm run archive` on the current dist/ produces a broken extension.

**How to avoid:** Always run `npm run build` before `npm run archive`.

### Pitfall 4: Updating the wrong cascade layer in tokens.css for the border fix

**What goes wrong:** tokens.css has a 3-layer cascade. Dark theme appears in BOTH Layer 2 (`@media prefers-color-scheme: dark`) and Layer 3 (`[data-theme="dark"]`). Changing only one layer means the fix applies to only half the dark paths (OS-auto vs explicit).

**How to avoid:** Update `--color-border-input` in both dark blocks. Search for `--color-border-input: #656871` — there are exactly 2 occurrences.

### Pitfall 5: Unit test assertion for swatch fill color

**What goes wrong:** `create_role_list_item.test.js` line ~48 asserts `innerHTML` containing `background-color: rgb(170, 170, 170)` (which is `#aaaaaa`). Changing the JS fill to `#767676` breaks this unit test silently if not updated.

**How to avoid:** Update the test assertion from `rgb(170, 170, 170)` to `rgb(118, 118, 118)` in the same commit that changes the JS. The `dataset.color: 'aaaaaa'` assertion at line ~38 tests the stored profile key default, not the CSS fill — leave that assertion unchanged.

### Pitfall 6: AMO source submission using the wrong file set

**What goes wrong:** The Firefox extension zip alone is not sufficient for AMO. Rollup generates bundled JS; even though it's not minified (rollup.config.js uses only `resolve()`, no terser), AMO 2025 policy requires source submission for any transpiled/bundled code.

**How to avoid:** Create a source zip of `src/ + package.json + package-lock.json + rollup.config.js + bin/ + manifest*.json` with a `BUILD.md` specifying Node >=20.19.0, `npm ci`, `npm run build`.

---

## Release Prep Checklist

### SC5 tasks for the planner

1. **Build** — `npm run build` — dist/ rebuilt with all 6 CSS files [automated]
2. **Archive** — `npm run archive` — produces Chrome and Firefox zips [automated]
3. **Permission diff** — `git diff v6.2.1 -- manifest.json manifest_chrome.json manifest_firefox.json` — confirms no new permissions [automated, already clean]
4. **Size sanity** — `wc -c dist/chrome/*.zip dist/firefox/*.zip` — current Chrome zip is 105,899 bytes (~103KB); expect ~112KB after adding 6.7KB CSS; well under 128MB store limit [automated]
5. **Store screenshots** — re-shoot in both themes for all 3 stores [manual — human required]
6. **AMO source package** — create source zip + `BUILD.md` [manual — human required]

### Store image dimension requirements

| Store | Screenshots | Promotional Tile |
|-------|------------|-----------------|
| Chrome Web Store | 1280×800 px (preferred) or 640×400 px; square corners, full bleed, up to 5 | Small tile: 440×280 px (required); Marquee: 1400×560 px (optional) |
| Firefox AMO | 1280×800 px (max display); 1.6:1 ratio recommended | 64×64 px icon (PNG or JPEG) |
| Microsoft Edge Add-ons | 1280×800 px | Follows Chrome Web Store format [ASSUMED] |

[CITED: developer.chrome.com/docs/webstore/images] [CITED: extensionworkshop.com/documentation/develop/create-an-appealing-listing/]

### AMO source submission

Per AMO policy (2025): any extension with Rollup-bundled JS must submit source code. [CITED: extensionworkshop.com/documentation/publish/source-code-submission/]

**Source zip contents:**
```
src/
package.json
package-lock.json
rollup.config.js
bin/
manifest.json
manifest_chrome.json
manifest_firefox.json
BUILD.md
```

**BUILD.md minimum content:**
```markdown
## Build Environment
- Node.js >= 20.19.0 (CI uses 24.x)
- npm

## Steps
npm ci
npm run build
# Output: dist/chrome/ and dist/firefox/

npm run archive
# Output: dist/chrome/aesr-chrome-6.2.1.zip, dist/firefox/aesr-firefox-6.2.1.zip
```

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Unit framework | Mocha 11.7.6 |
| Unit run | `npm test` |
| Emulator framework | Playwright 1.60.0 |
| Emulator build step | `npm run pretest` (runs `bin/build_test.sh`) |
| Emulator run | `npm run test_emulator` |
| Full suite | `npm test && npm run test_emulator` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Command | File Exists? |
|--------|----------|-----------|---------|-------------|
| A11Y-01 | Focus ring visible both themes | Automated (axe) + smoke | `npm run test_emulator` (if a11y.spec.js added) | Partial — foundation.spec.js checks tokens; no `:focus-visible` assertion |
| A11Y-02 | Labels/roles/names on all controls | Automated (axe) OR manual | `npm run test_emulator` (if a11y.spec.js added) | No dedicated a11y spec |
| A11Y-03 | WCAG 2.1 AA contrast | Computed (this doc) + axe scan | `npm run test_emulator` (if a11y.spec.js added) | No automated contrast spec |
| A11Y-04 | No regression in existing tests | Automated | `npm test && npm run test_emulator` | Yes — 39 unit tests, 7 spec files |
| A11Y-05 | Visual parity Chrome/Firefox/Edge | Manual only | — | No — manual smoke checklist |

### Wave 0 Gaps

If `@axe-core/playwright` is chosen:
- [ ] `npm install --save-dev @axe-core/playwright`
- [ ] `test/emulator/a11y.spec.js` — axe scan on popup.html and options.html in both themes; covers A11Y-01, A11Y-02, A11Y-03 with automated reporting

If manual-only:
- [ ] Manual a11y checklist in plan (no new file)
- [ ] Manual smoke checklist for Firefox and Edge

---

## Environment Availability

| Dependency | Required By | Available | Fallback |
|------------|------------|-----------|----------|
| Node.js >=20.19.0 | `npm run build` | Assumed present | — |
| npm | Build + test | Assumed present | — |
| Rollup (devDep) | `npm run build` | Already installed | — |
| Chrome | Playwright emulator | Playwright manages | — |
| Firefox | A11Y-05 manual smoke | Must be locally installed | Skip; document gap |
| Edge | A11Y-05 manual smoke | Must be locally installed | Skip; document gap |

---

## Architecture Patterns

### Phase Data Flow

```
[Source] src/ (6 CSS + HTML + JS)
         |
         v
[Fix]   tokens.css (border-input dark), create_role_list_item.js (swatch fill),
        *.html (aria-label / alt attributes), create_role_list_item.test.js (innerHTML assertion)
         |
         v
[Test]  npm test (unit: 39 tests) + npm run test_emulator (Chrome emulator: 7 specs)
         |
         v
[Smoke] Firefox + Edge manual (both themes)
         |
         v
[Build] npm run build → dist/chrome/ + dist/firefox/ (both with 6 CSS files)
         |
         v
[Release] npm run archive → store zips; source zip for AMO; screenshot re-shoot
```

### CSS Token Cascade (context for the border-input fix)

tokens.css has three layers. Dark theme values appear in TWO of them:

```css
/* Layer 1: Light defaults (:root) */
:root { --color-border-input: #8c8c94; }

/* Layer 2: OS dark (no manual override) */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]):not([data-theme="dark"]) {
    --color-border-input: #656871;  /* ← FIX BOTH OCCURRENCES */
  }
}

/* Layer 3: Explicit dark */
:root[data-theme="dark"] {
  --color-border-input: #656871;  /* ← FIX BOTH OCCURRENCES */
}
```

Both must change to `#6e6e7a`. Search `tokens.css` for `--color-border-input: #656871` — it appears exactly twice.

---

## Security Domain

`security_enforcement` is enabled in `.planning/config.json`. ASVS Level 1 applies.

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | — |
| V5 Input Validation | No — no new input handling | — |
| V1 Architecture (CSP) | Yes | No new style= injections; static `display: none` values are not injectable |
| V14 Configuration | Yes | Manifest diff verified clean vs v6.2.1 baseline |

The only code changes are: token hex literal in CSS, color string literal in JS, and ARIA attribute additions in HTML. None introduce new attack surface.

---

## Open Questions (RESOLVED)

1. **Automated a11y via `@axe-core/playwright` — devDep or manual checklist?**
   Recommendation: devDep + `a11y.spec.js`. Provides documented, repeatable verification. If the project prefers to keep devDep count frozen, a manual checklist is acceptable — but findings should be noted in the plan.

2. **AMO source zip — scripted or manual one-time step?**
   Recommendation: manual one-time step with exact instructions. Not worth scripting for a single release submission.

3. **`anchor.dataset.color` default: keep `'aaaaaa'` or change to `'767676'`?**
   `dataset.color` is used by `popup.js renderRoleList` to set `data.color` when dispatching a switch. The value flows into the tab group color (`data.tabGroup = { title: data.profile, color: data.color }`). Changing the CSS fill alone is safe and in scope. Changing the stored/dispatched default color key would be a behavioral change — out of scope for this phase. Keep `item.color || 'aaaaaa'` in the dataset assignment.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Normal button border (1.70:1 light) is exempt per WCAG 1.4.11 because text provides identification | "What Already Passes" | Low risk — Cloudscape uses the same pattern; auditors consistently accept it |
| A2 | User-stored swatch fill colors are excluded from WCAG 1.4.11 as user-determined content | Gap 8 | If wrong, every possible user hex must pass 3:1 — impossible to guarantee; the correct mitigant is the border (Option E), not constraining user colors |
| A3 | Microsoft Edge Add-ons screenshot dimensions follow Chrome Web Store spec (1280×800) | Store image dimensions | Low risk — Edge Add-ons follows Chrome Web Store patterns; re-crop if needed |
| A4 | `@axe-core/playwright` page.evaluate() injection works inside chrome-extension:// URLs | Standard Stack | If wrong, a11y.spec.js tests cannot run against the extension pages — fall back to manual checklist |
| A5 | AMO may not enforce source submission for human-readable Rollup output | AMO prep | If reviewers do require it, source zip preparation is straightforward per the instructions above |

---

## Sources

### Primary (HIGH confidence — verified in this session)
- `src/css/tokens.css` — all token hex values [VERIFIED: codebase read]
- `src/css/base.css:97` — `:focus-visible` ring definition [VERIFIED: codebase read]
- `src/css/*.css` grep for `outline` — no overrides in surface CSS [VERIFIED: bash grep]
- `src/popup.html`, `src/options.html`, `src/supporters.html`, `src/credits.html`, `src/updated.html` — ARIA gaps identified by codebase grep [VERIFIED: codebase]
- `src/js/lib/create_role_list_item.js` — swatch fallback `#aaaaaa` at line ~8 [VERIFIED: codebase read]
- `src/js/lib/create_role_list_item.test.js` — `#aaaaaa` assertions at lines ~38 and ~48 [VERIFIED: bash grep]
- `test/emulator/fixtures.js:12` — `chromium.launchPersistentContext` (Chrome-only emulator) [VERIFIED: codebase read]
- `playwright.config.ts` — declares Chrome/Firefox/Edge but emulator is Chrome-only [VERIFIED: codebase read]
- `git diff v6.2.1 -- manifest*.json` → no output [VERIFIED: git command]
- WCAG contrast ratios — computed from token hex values using WCAG relative luminance formula [VERIFIED: computed in-session]

### Secondary (MEDIUM confidence)
- [developer.chrome.com/docs/webstore/images](https://developer.chrome.com/docs/webstore/images) — Chrome Web Store: screenshots 1280×800 or 640×400; small tile 440×280 [CITED]
- [extensionworkshop.com/documentation/publish/source-code-submission/](https://extensionworkshop.com/documentation/publish/source-code-submission/) — AMO source code submission policy 2025 [CITED]
- [@axe-core/playwright on npm](https://www.npmjs.com/package/@axe-core/playwright) — v4.11.3, Deque, published 2021-06-02, no postinstall script [VERIFIED: npm registry]

### Tertiary (LOW confidence — ASSUMED)
- Microsoft Edge Add-ons screenshot dimensions — assumed to follow Chrome Web Store convention
- WCAG 1.4.11 text-identification exemption for normal button border — interpretation; not confirmed against WCAG 2.1 PDF errata

---

## Metadata

**Confidence breakdown:**
- Contrast analysis: HIGH — computed from actual token hex values
- A11Y gaps: HIGH — found by direct codebase inspection; all gaps cite exact file:line
- Outline override check: HIGH — verified by grep of all 5 CSS files
- Unit test impact: HIGH — verified by grep of test file
- AMO requirements: MEDIUM — from official Extension Workshop docs
- Chrome Web Store dimensions: HIGH — from official developer.chrome.com docs
- Edge store dimensions: LOW — assumed

**Research date:** 2026-05-29
**Valid until:** 2026-08-29 (stable — store requirements change rarely)
