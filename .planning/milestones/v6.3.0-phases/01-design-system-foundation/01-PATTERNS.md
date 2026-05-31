# Phase 1: Design System Foundation - Pattern Map

**Mapped:** 2026-05-27
**Files analyzed:** 13 new/modified files
**Analogs found:** 9 / 13 (4 greenfield with no codebase analog)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/css/tokens.css` | config | transform | none | no analog |
| `src/css/base.css` | config | transform | none | no analog |
| `src/css/components.css` | component | transform | none | no analog |
| `src/js/theme-init.js` | utility | request-response | none | no analog |
| `test/preview/index.html` | config | static | `src/credits.html` | structural skeleton |
| `test/emulator/foundation.spec.js` | test | event-driven | `test/emulator/supporters.spec.js` + `test/emulator/fixtures.js:87-94` | role-match |
| `src/popup.html` | config | static | `src/popup.html` (self) | head wiring delta |
| `src/options.html` | config | static | `src/options.html` (self) | head wiring delta |
| `src/credits.html` | config | static | `src/credits.html` (self) | head wiring delta |
| `src/updated.html` | config | static | `src/updated.html` (self) | head wiring delta |
| `src/supporters.html` | config | static | `src/supporters.html` (self) | head wiring delta |
| `bin/build.sh` | config | batch | `bin/build.sh` (self) | insertion point |
| `bin/build_test.sh` | config | batch | `bin/build_test.sh` (self) | insertion point |

---

## Pattern Assignments

### `test/preview/index.html` (config, static)

**Analog:** `src/credits.html` — simplest standalone HTML in the repo; no module script, no app logic.

**Current head structure of credits.html** (`src/credits.html` lines 1-5):
```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Credits</title>
```

**Pattern to copy:** Use the same DOCTYPE + charset + title structure. `test/preview/index.html` is an additive preview page in the test tree (Decision D-01) and needs the same `<head>` wiring as the extension pages (theme-init + 3 links) to validate all tokens render. It has no app script of its own.

**Constructed head for preview/index.html:**
```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Design System Preview</title>
<script src="../js/theme-init.js"></script>
<link rel="stylesheet" href="../css/tokens.css">
<link rel="stylesheet" href="../css/base.css">
<link rel="stylesheet" href="../css/components.css">
</head>
```

Note: paths are relative to `test/extension/preview/` pointing back up to `test/extension/js/` and `test/extension/css/`.

---

### `test/emulator/foundation.spec.js` (test, event-driven)

**Primary analog:** `test/emulator/fixtures.js` lines 87-94 (`testInSupporters` fixture) — uses plain `page.goto` with no worker setup, no before/after hooks. This is the exact pattern for SC1-SC3 checks which only need a loaded page, not a configured extension state.

**Fixture pattern** (`test/emulator/fixtures.js` lines 87-94):
```javascript
export const testInSupporters = (message, pageFunc) => {
  test(message, async ({ page, context, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/supporters.html`);
    const resultP = await pageFunc({ page, expect: test.expect });
    if (resultP !== undefined) console.log(resultP);
  });
};
```

**Secondary analog:** `test/emulator/supporters.spec.js` (complete file, 7 lines) — shortest spec in the repo, no storage setup:
```javascript
import { testInSupporters } from './fixtures.js';

testInSupporters('supporters page', async ({ page }) => {
  const area = page.locator('textarea');
  await area.fill('test');
  expect(await area.isVisible()).toBeTruthy();
});
```

**Pattern for foundation.spec.js:**

```javascript
import { testInSupporters } from './fixtures.js';
// Use testInSupporters as the model; create a parallel testInPreview
// by copy-adapting fixtures.js:87-94 for the preview page URL

// Imports — copy from supporters.spec.js:
import { test, expect } from './fixtures.js';

// Or define inline helper (if testInPreview not added to fixtures.js):
const testInPreview = (message, pageFunc) => {
  test(message, async ({ page, context, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/preview/index.html`);
    const resultP = await pageFunc({ page, expect: test.expect });
    if (resultP !== undefined) console.log(resultP);
  });
};

// SC1 — token computed-style check pattern (copy from options.spec.js assertion style):
testInPreview('SC1: tokens switch between light and dark theme', async ({ page, expect }) => {
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  const lightColor = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--color-text-primary').trim()
  );
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  const darkColor = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--color-text-primary').trim()
  );
  expect(lightColor).not.toBe(darkColor);
});
```

**2-space indentation** — matches `options.spec.js` and `supporters.spec.js`.

**Import path convention** — `.js` extension required on all relative imports:
```javascript
import { testInSupporters } from './fixtures.js';
```

---

### `src/popup.html` (config, head wiring delta)

**Current head** (`src/popup.html` lines 1-4):
```html
<html>
<head>
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' 'unsafe-inline'">
<style>
```
Note: line 1 has NO `<!DOCTYPE html>`, NO `<meta charset>`. The inline `<style>` block starts at line 4 and runs through line 128. The module script is in `<body>` (line 166).

**Phase 1 insertion — prepend to head before existing content:**
```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<script src="js/theme-init.js"></script>
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/components.css">
<meta http-equiv="Content-Security-Policy" ...>
<style>
  /* existing inline styles remain — source-order insulation (Decision D-02) */
  /* popup's existing inline <style> wins over base.css for popup-specific rules */
```

**Critical constraint (Decision D-02):** The 3 new `<link>` elements MUST come BEFORE the existing `<style>` block. Source order ensures the inline `<style>` overrides base.css for popup-specific rules. This insulates the popup from base.css reset bleed.

---

### `src/options.html` (config, head wiring delta)

**Current head** (`src/options.html` lines 1-6):
```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<script type="module" src="js/options.js"></script>
<style>
```
Note: `<script type="module">` is currently the FIRST head element after charset (line 5). `<style>` starts at line 6.

**Phase 1 insertion — insert theme-init BEFORE options.js script, then 3 links:**
```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<script src="js/theme-init.js"></script>
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/components.css">
<script type="module" src="js/options.js"></script>
<style>
  /* existing inline styles remain */
```

**Ordering constraint:** `theme-init.js` must fire synchronously before any paint. It must be first in head, before the module script and before the `<link>` elements (parser-blocking is acceptable; FOUC-prevention is mandatory).

---

### `src/credits.html` (config, head wiring delta)

**Current head** (`src/credits.html` lines 1-5):
```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Credits</title>
```
No existing head script. `<style>` starts at line 6.

**Phase 1 insertion — after charset, before title or style:**
```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Credits</title>
<script src="js/theme-init.js"></script>
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/components.css">
<style>
  /* existing inline styles remain */
```

---

### `src/updated.html` (config, head wiring delta)

**Current head** (`src/updated.html` lines 1-5):
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>AWS Extend Switch Roles - Updated</title>
```
Note: 4-space indented head content. No existing head script. `<style>` follows title.

**Phase 1 insertion — match existing 4-space indent:**
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>AWS Extend Switch Roles - Updated</title>
    <script src="js/theme-init.js"></script>
    <link rel="stylesheet" href="css/tokens.css">
    <link rel="stylesheet" href="css/base.css">
    <link rel="stylesheet" href="css/components.css">
    <style>
      /* existing inline styles remain */
```

---

### `src/supporters.html` (config, head wiring delta)

**Current head** (`src/supporters.html` lines 1-5):
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>AWS Extend Switch Roles - Supporters</title>
```
Note: 4-space indented head content (matches `updated.html`). No existing head script. `<style>` starts at line 6.

**Phase 1 insertion — match existing 4-space indent:**
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>AWS Extend Switch Roles - Supporters</title>
    <script src="js/theme-init.js"></script>
    <link rel="stylesheet" href="css/tokens.css">
    <link rel="stylesheet" href="css/base.css">
    <link rel="stylesheet" href="css/components.css">
    <style>
      /* existing inline styles remain */
```

---

### `bin/build.sh` (build, batch — insertion point)

**Insertion point** (`bin/build.sh` lines 27-35):
```bash
browsers=("chrome" "firefox")
for brw in ${browsers[@]}
do
  \cp src/js/content.js dist/$brw/js/
  \cp -r src/js/war dist/$brw/js/
  \cp -r src/*.html dist/$brw/
  \cp -r icons  dist/$brw/
done
echo "build done"
```

**2-space indentation** inside loop (lines 29-33). New lines use `\cp` (backslash-escaped, same as surrounding lines) and go before `done`:

```bash
browsers=("chrome" "firefox")
for brw in ${browsers[@]}
do
  \cp src/js/content.js dist/$brw/js/
  \cp -r src/js/war dist/$brw/js/
  \cp -r src/*.html dist/$brw/
  \cp -r icons  dist/$brw/
  \cp -r src/css dist/$brw/
  \cp -f src/js/theme-init.js dist/$brw/js/theme-init.js
done
echo "build done"
```

**Pattern rules from existing loop:**
- Use `\cp` (backslash prefix) — not bare `cp` — matches lines 20-33 of existing file
- `-r` for directories (`src/css` is a directory)
- `-f` for single files (force overwrite, matches line 20-23 pattern `\cp -f`)
- No quotes around `$brw` (consistent with existing lines 29-32)

---

### `bin/build_test.sh` (build, batch — insertion points)

**Three insertion points in existing file:**

**Insertion 1** — after line 9 (`cp src/*.html $destdir/`):
```bash
cp src/*.html $destdir/
cp -r src/css $destdir/       # ADD: copy CSS directory
```

**Insertion 2** — inside the Rollup loop (`build_test.sh` lines 12-17), add skip guard after `fname=` assignment:
```bash
for file in src/js/*; do
  if [ -f "$file" ]; then
    fname="${file##*/}"
    if [ "$fname" = "theme-init.js" ]; then continue; fi    # ADD: skip Rollup for theme-init.js
    rollup -c ./rollup.config.js src/js/$fname --file $destdir/js/$fname
  fi
done
```

**Rationale for skip guard:** `theme-init.js` is a plain (non-module) script. Running it through Rollup would add ESM wrapper boilerplate that breaks synchronous execution. It must be copied verbatim.

**Insertion 3** — after the Rollup loop ends (after line 17), before the `rollup ... profile_db.js` line:
```bash
done

cp src/js/theme-init.js $destdir/js/theme-init.js    # ADD: copy theme-init verbatim
cp -r test/preview $destdir/preview                   # ADD: copy preview page (Decision D-01)

rollup -c ./rollup.config.js src/js/lib/profile_db.js ...
```

**Indentation pattern:** `build_test.sh` uses 2-space indent inside loop body (lines 14-16). The skip guard and new lines after the loop use no indentation at the `for`/top level.

---

## Shared Patterns

### Head Wiring Order
**Applies to:** All 5 HTML files and `test/preview/index.html`

The canonical order for Phase 1 head wiring is locked in `01-UI-SPEC.md`. The ordering constraint is:
1. `<meta charset>` — always first
2. `<script src="js/theme-init.js">` — synchronous, parser-blocking, must fire before paint
3. `<link rel="stylesheet" href="css/tokens.css">` — token definitions
4. `<link rel="stylesheet" href="css/base.css">` — reset + base rules consuming tokens
5. `<link rel="stylesheet" href="css/components.css">` — component shells consuming tokens
6. Any existing `<script type="module">` or `<link>` elements (existing content follows)
7. Existing inline `<style>` blocks (must come AFTER the 3 links for source-order cascade)

**Source:** `01-UI-SPEC.md` locked `<head>` wiring section. Apply to every HTML file modified in Phase 1.

### 3-Layer CSS Cascade
**Applies to:** `src/css/tokens.css` (authored there), consumed by `base.css` and `components.css`

The locked cascade structure (from `01-RESEARCH.md` Pattern 1 and `01-UI-SPEC.md`):
```css
/* Layer 1: light defaults */
:root {
  --color-text-primary: #16191f;
  /* ... all ~30 semantic tokens ... */
}

/* Layer 2: system dark (auto-switches when no explicit user preference stored) */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]):not([data-theme="dark"]) {
    --color-text-primary: #d1d5db;
    /* ... dark overrides ... */
  }
}

/* Layer 3: explicit user choice (highest specificity, set by theme-init.js) */
:root[data-theme="dark"] {
  --color-text-primary: #d1d5db;
  /* ... */
}
:root[data-theme="light"] {
  --color-text-primary: #16191f;
  /* ... */
}
```

**No existing codebase analog** — this is greenfield. Use `01-UI-SPEC.md` token table as the source of truth for token names and values.

### theme-init.js Script Pattern
**Applies to:** `src/js/theme-init.js` (sole implementation), referenced by all 6 HTML files

Locked body from `01-UI-SPEC.md` (4 lines, verbatim):
```javascript
(function() {
  var m = localStorage.getItem('visualMode');
  if (m) document.documentElement.setAttribute('data-theme', m);
})();
```

**Constraints:**
- NOT an ES module — no `type="module"`, no `import`/`export`
- IIFE wrapper — no global variable pollution
- Synchronous — runs before CSS paint, preventing FOUC
- Uses `var` not `let`/`const` — compatible with any browser that supports extensions
- Reads `localStorage['visualMode']` — this is the key the existing options page writes
- Sets `data-theme` on `document.documentElement` (`<html>` element), NOT `<body>`
- No fallback needed if key absent — absence means "follow system" (Layer 2 handles it)
- Must be loaded with plain `<script src="...">` — no `defer`, no `async`, no `type="module"`

### Build Script Copy Conventions
**Applies to:** `bin/build.sh` and `bin/build_test.sh`

From reading both scripts:
- `build.sh` uses `\cp` (backslash-escaped) throughout — use `\cp` for new additions
- `build_test.sh` uses bare `cp` (lines 9, 21, 24) — use bare `cp` for new additions
- Directory copies use `-r` flag in both scripts
- Single-file force-overwrites use `-f` in `build.sh`; `build_test.sh` omits `-f` for file copies
- `set -euo pipefail` is present in both — any new `cp` failure will halt the build (correct behavior)

### Playwright Test Fixture Pattern
**Applies to:** `test/emulator/foundation.spec.js`

From `test/emulator/fixtures.js`:
- Extension context setup uses `chromium.launchPersistentContext` with `extensionPath = '../extension'`
- `extensionId` is extracted from the service worker URL
- `page` is the default blank page from the persistent context
- Custom test fixtures (`testInOptions`, `testInPopup`, `testInSupporters`) all follow the same wrapper: `(message, pageFunc) => { test(message, async ({ page, context, extensionId }) => { ... }) }`
- `pageFunc` receives `{ page, expect: test.expect }` (destructured in spec body)
- Return value of `pageFunc` is console.log'd if not undefined (diagnostic pattern)

The `foundation.spec.js` needs a `testInPreview` fixture that follows the same wrapper. Either:
1. Add `testInPreview` to `fixtures.js` (preferred — keeps fixture pattern DRY)
2. Define inline in `foundation.spec.js` if the planner scopes fixtures.js changes out

**Import convention** (from all spec files):
```javascript
import { testInSupporters } from './fixtures.js';
```
Always `.js` extension, always single quotes.

---

## No Analog Found

Files that are greenfield — no existing codebase match. Planner must use `01-UI-SPEC.md` and `01-RESEARCH.md` as the source of truth.

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/css/tokens.css` | config | transform | No CSS files exist in `src/css/`; all current styling is inline `<style>` per HTML page |
| `src/css/base.css` | config | transform | Same — no external CSS exists anywhere in the source tree |
| `src/css/components.css` | component | transform | Same — the inline `<style>` blocks are the legacy pattern being superseded, not a copy source |
| `src/js/theme-init.js` | utility | request-response | Every other `src/js/*.js` is an ES module; this is deliberately a non-module plain IIFE script |

**For these 4 files:** Use `01-UI-SPEC.md` for token names/values, CSS structure, and the locked `theme-init.js` body. Use `01-RESEARCH.md` Pattern 1 (3-layer cascade) and Pattern 3 (component shells) for structural guidance.

**Do NOT copy from existing inline `<style>` blocks** — those are the legacy `.darkMode` class-based system that Phases 2-3 will remove. Phase 1 CSS is additive and must not reference `.darkMode`.

---

## Metadata

**Analog search scope:** `src/`, `test/emulator/`, `bin/`
**Files scanned:** 13 (5 HTML, 2 build scripts, 4 Playwright test files, 2 fixtures files)
**Pattern extraction date:** 2026-05-27
**Key constraint:** Phase 1 is ADDITIVE only. Existing `.darkMode` CSS in inline `<style>` blocks is NOT touched. Two theming systems coexist until Phases 2-3. New `data-theme` tokens must not conflict with any existing selectors.
