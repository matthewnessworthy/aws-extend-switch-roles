---
phase: 05-accessibility-cross-browser-release-audit
reviewed: 2026-05-29T00:00:00Z
depth: standard
files_reviewed: 13
files_reviewed_list:
  - BUILD.md
  - package.json
  - src/css/base.css
  - src/css/options.css
  - src/css/pages.css
  - src/css/popup.css
  - src/css/tokens.css
  - src/js/lib/create_role_list_item.js
  - src/js/lib/create_role_list_item.test.js
  - src/options.html
  - src/popup.html
  - src/supporters.html
  - test/emulator/a11y.spec.js
findings:
  critical: 0
  warning: 2
  info: 2
  total: 4
status: issues_found
---

# Phase 5: Code Review Report

**Reviewed:** 2026-05-29
**Depth:** standard
**Files Reviewed:** 13
**Status:** issues_found

## Summary

Phase 5 is an accessibility / cross-browser / release-prep audit of a presentation-only UI
modernization milestone. The phase-5 diff (`75d54fc..HEAD`) is: ARIA-label/alt/`lang`/`title`
additions on HTML, WCAG contrast/spacing/line-height token+value changes in CSS, one JS swatch
fill-color literal (`#aaaaaa` → `#767676`), the matching unit-test assertion updates, a new
axe-core emulator spec, and `BUILD.md`.

I reviewed against the milestone constraints in `CLAUDE.md`: vanilla JS / hand-written CSS,
**zero new runtime dependencies**, no `@cloudscape-design/*` imports, MV3/CSP compliance, WCAG 2.1 AA.

**Constraint verdict — all clean:**

- **No new runtime dependency.** The only added package is `@axe-core/playwright` under
  `devDependencies` (`package.json:33`); it is test tooling and is never bundled into `dist/`.
- **No `@cloudscape-design/*` import** anywhere in the diff.
- **No CSP violation.** No manifest declares a custom `content_security_policy`, so the default
  MV3 policy (`script-src 'self'; object-src 'self'`) applies, which permits the pre-existing
  static `style="display:none"` attributes. No inline `<script>` or `javascript:` introduced.
- **No role-switch regression.** The swatch fill change is cosmetic-only: `headSquare.style.backgroundColor`
  is the popup affordance, while `anchor.dataset.color` (consumed by `content.js:169`
  `form.color.value = data.color` as the AWS console header color) is **unchanged** at `'aaaaaa'`.
  The behavior sent to the AWS console is identical; only the swatch pixel color changed. This
  divergence is intentional and is asserted by the updated test (`create_role_list_item.test.js:38,41`).

**Contrast math verified** (computed against WCAG 2.x relative-luminance formula):

| Change | Ratio | Threshold | Pass |
|---|---|---|---|
| light `--color-link`/`--color-text-accent` `#005ce6` on `#ffffff` | 5.72 (was 4.97) | 4.5 text | yes |
| light swatch `#767676` on `#ffffff` | 4.54 (was 2.32) | 3.0 non-text | yes |
| dark `--color-border-input` `#6e6e7a` on `#161d26` | 3.37 (was 3.05) | 3.0 non-text | yes |
| dark `--color-border-input` `#6e6e7a` on input-disabled `#1b232d` | 3.15 | 3.0 non-text | yes |

The contrast changes are correct and clear their thresholds. The new light link `#005ce6` even
holds 4.81:1 against the `#howto` pane disabled background — still AA for text.

No BLOCKER-class defects were found in this diff. The two warnings concern coverage gaps in the
phase's own a11y verification, not defects in shipped behavior.

## Warnings

### WR-01: Automated a11y scan never covers the populated role-list — the surface this phase changed

**File:** `test/emulator/a11y.spec.js:7-42` (in conjunction with `test/emulator/popup_init.js:9-12`)

**Issue:** The two `testInPopup` a11y scans run with `popup_init.js` stubbing
`chrome.storage.sync.get` to return `{}` unconditionally. With no stored config, `loadFormList`
(`popup.js:167`) populates `#roleList` with **zero `<li>` rows**, so axe scans only the filter
input, the "Role List" title, and the sidebar. The actual role rows produced by
`createRoleListItem` — the `.headSquare` swatch (whose contrast was *raised this very phase*),
the `.aesr-role-item__name` / `.aesr-role-item__account` spans, and the row anchors — are never
rendered during the scan. The spec's own comment ("Validates the Plan 01 ARIA-label/alt and
contrast fixes landed with zero violations") therefore overstates its coverage: the swatch
contrast fix is not exercised by any axe run.

This is the central a11y verification artifact for the phase, and it has a blind spot over the
primary interactive popup surface.

**Fix:** Seed at least one profile before the popup scan so `#roleList` renders real rows. Either
have `popup_init.js` return a minimal config for the `loadInfo`/profile path, or add a dedicated
scan that injects a role row, e.g.:

```js
async ({ page, expect }) => {
  await page.waitForSelector('#main', { state: 'visible' });
  // ensure at least one role row exists before scanning
  await page.evaluate(() => {
    const list = document.getElementById('roleList');
    if (list && list.children.length === 0) {
      // inject a representative row, or drive loadFormList with a seeded config
    }
  });
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations).toEqual([]);
}
```

### WR-02: WCAG 3.1.1 `lang` fix is incomplete — `credits.html` and `updated.html` still bare `<html>`; a11y spec does not scope them

**File:** `test/emulator/a11y.spec.js` (scope: popup + options only)

**Issue:** This phase added `lang="en"` to `popup.html`, `options.html`, and `supporters.html`
(WCAG 3.1.1 Language of Page, Level A). The other two redesigned pages in the same milestone
surface set, `src/credits.html:2` and `src/updated.html:2`, still declare a bare `<html>` with no
`lang`. They are reachable from the popup sidebar (`popup.html:30,33` — "Update Notice", "Credits")
and are full extension pages, so they carry the same Level-A obligation that the three patched
pages just satisfied. The a11y spec only scopes `testInPopup` and `testInOptions`, so neither the
gap nor a future regression on these pages is caught by automation.

(`credits.html`/`updated.html` are outside the explicit review file list, but the gap is rooted in
a reviewed file: the a11y spec under review is the verification net, and it leaves two of the five
redesigned pages both unfixed and unscanned.)

**Fix:** Add `lang="en"` to `<html>` in `src/credits.html` and `src/updated.html` to match the
other three pages, and extend `a11y.spec.js` with a `testInSupporters`-style scan (a fixture for
credits/updated already follows the same pattern) so all five redesigned surfaces are covered:

```html
<!-- src/credits.html and src/updated.html -->
<html lang="en">
```

## Info

### IN-01: Popup a11y `chrome.storage.sync.clear()` setup/teardown is a no-op for what the popup sees

**File:** `test/emulator/a11y.spec.js:9,18,24,40` (both `testInPopup` blocks)

**Issue:** The `beforeFunc`/`afterFunc` for the popup scans call `chrome.storage.sync.clear()` via
`worker.evaluate`, which clears the real service-worker storage. But the popup page runs under the
`popup_init.js` mock, which intercepts `window.chrome.storage.sync.get` and always returns `{}`
regardless of real storage. So these `clear()` calls have no effect on the state the popup actually
renders — they imply a "start from clean config" intent that is not wired through to the page. This
is harmless today but is misleading for anyone extending these tests (and is part of why WR-01's
blind spot is easy to miss).

**Fix:** Either drop the `clear()` calls from the popup blocks (the mock already guarantees empty
config) or, preferably as part of WR-01, make the popup read from a real/seeded store so the
setup intent is genuine.

### IN-02: Options dark-theme a11y scan is timer-coupled, not state-coupled

**File:** `test/emulator/a11y.spec.js:64-66`

**Issue:** The options dark scan sets `visualMode: 'dark'` then `await page.waitForTimeout(300)`
before asserting `data-theme === 'dark'`. A fixed 300 ms sleep is fragile — it can flake on a
slow/loaded CI machine if the storage-change listener has not applied the attribute yet, and it
needlessly slows the suite when the listener is fast.

**Fix:** Wait on the observable state instead of a fixed delay:

```js
await page.evaluate(() => chrome.storage.sync.set({ visualMode: 'dark' }));
await page.waitForFunction(() =>
  document.documentElement.getAttribute('data-theme') === 'dark'
);
```

---

_Reviewed: 2026-05-29_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
