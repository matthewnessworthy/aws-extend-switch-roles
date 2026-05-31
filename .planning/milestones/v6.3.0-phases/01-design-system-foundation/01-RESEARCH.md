# Phase 1: Design System Foundation — Research

**Researched:** 2026-05-27
**Domain:** CSS custom-properties token system, FOUC-free pre-paint theming, browser-extension build pipeline
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Design contract (LOCKED via 01-UI-SPEC.md):**
All light + dark semantic token values (color, type, spacing, radius, elevation), hand-resolved to hex and WCAG-verified — source of truth `.planning/research/STACK.md`.

The 3-layer cascade: `:root` (light + fallback) → `@media(prefers-color-scheme:dark) :root:not([data-theme="light"]):not([data-theme="dark"])` → `:root[data-theme]` override, with the `:not()` guard that makes "manual choice beats OS" correct.

`theme-init.js` = external, **non-module** pre-paint script, **first child of `<head>`**, synchronous `localStorage['visualMode']` read; no inline script, no CSP relaxation.

`color-scheme` set per theme on `:root` (THM-05); `data-theme` on `<html>` (replaces the `.darkMode` body class); single tokenized `:focus-visible` ring in `base.css`.

File layout (`src/css/{tokens,base,components}.css` shared by all 5 pages), `<head>` wiring order, and the exact `build.sh` / `build_test.sh` edits.

Phase 1 uses **no `color-mix()`** (keeps the FF-109 floor); **no** manifest / `rollup.config.js` / permission / host change.

**D-01 (Preview/gallery page):** Located in the test tree (e.g. `test/preview/`), NOT `src/`. Wired by `build_test.sh`. Automated Playwright spec covering SC1 (token computed-style flips), SC2 (shells render in both themes), SC3 CSP (zero violations on load), SC3 FOUC (resolved `data-theme` present before paint). Chrome-only; Firefox/Edge visual parity stays manual and is owned by Phase 5 SC4.

**D-02 (Reset bleed accepted):** `base.css` ships its full global reset and is linked on all 5 pages. No scoping/opt-in hook. Popup is insulated via source-order (its inline `<style>` is after the `<link>` chain → inline wins). The Phase-1 plan's verification notes MUST state the expected delta as **focus ring + body-font/reset normalization on options/credits/updated**. Check `test/emulator/options.spec.js`, `supporters.spec.js`, and any credits/updated coverage for assertions sensitive to body font/margin/box-sizing; update those specs in the same PR if they shift.

**Phase scope boundary:** Phase 1 is ADDITIVE only. Does NOT remove inline `<style>` blocks, `.darkMode` rules, or any existing surface styling. The two theming systems coexist until Phases 2–3 remove the old one per surface.

**Foundation rules locked at Phase 1:** no `@cloudscape-design/*` (incl. `design-tokens`), no framework, system font stack, CSS as copied static assets (not Rollup-bundled), external non-module pre-paint `theme-init.js`, `data-theme` on `<html>`, `color-scheme` per theme, no CSP relaxation.

### Claude's Discretion

- `components.css` class-naming convention (e.g. namespaced `.aesr-*` vs plain `.button` vs BEM). Token custom-property names are LOCKED by the UI-SPEC; component class names are the planner's call. Lean: a short namespaced prefix is reasonable. Planner picks and documents it in PLAN.md.
- Component shell completeness / granularity. SC2 lists the required shells; "how polished vs skeletal" is a planner judgment. The committed preview page (D-01) incentivizes reasonably-complete shells.
- Exact preview-page directory + spec filename within the test tree.
- `--color-bg-button-primary-hover` (dark) is "(derived)" and explicitly deferred to Phase 2 — not a Phase-1 deliverable.

### Deferred Ideas (OUT OF SCOPE)

- Per-profile `color` × dark-mode rendering rule — Phase 2 (POP-06) / Phase 3 (OPT-06) / Phase 4
- Theme-toggle placement and 3-state toggle shape — Phase 4
- v2 polish items: `EDP-*`, `THP-*`, `POP-07..09`
- `localStorage` write-through and live `storage.onChanged` update — Phase 4 (THM-02/THM-04)
- Surface restyle (popup/options/aux) — Phases 2–3
- Removing existing inline `<style>` blocks and `.darkMode` rules — Phases 2–3 per-surface
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FND-01 | A shared CSS design-token system (custom properties for color, type, spacing, radius, elevation) is consumed by every surface | 3-layer cascade on `:root` in `tokens.css`; `<head>` wiring on all 5 pages; verified in UI-SPEC §1 and §5 |
| FND-02 | Tokens are hand-derived from the AWS Cloudscape Visual Refresh palette (light + dark), with no `@cloudscape-design/*` and no JS/CSS framework | ~30 semantic tokens resolved to hex in STACK.md, WCAG-verified; zero new packages; verified in UI-SPEC §Color |
| FND-03 | CSS ships as static files copied into both Chrome and Firefox builds (`bin/build.sh` and `bin/build_test.sh` updated); not routed through Rollup | Exact `\cp -r src/css` and verbatim `theme-init.js` copy additions to both build scripts; verified in UI-SPEC §6 and against live build scripts |
| FND-04 | Typography uses a system font stack — no bundled webfont | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` in `base.css`; verified in UI-SPEC §Typography |
| THM-03 | No flash of the wrong theme on popup or options load (FOUC eliminated via a pre-paint, non-module `theme-init.js`) | External non-module script as first `<head>` child; synchronous `localStorage['visualMode']` read; exact logic LOCKED in UI-SPEC §2 |
| THM-05 | Native controls and scrollbars follow the active theme on Chrome, Firefox, and Edge (`color-scheme` set per theme) | `color-scheme: light/dark` on `:root` per theme layer; verified in UI-SPEC §3; closes the Firefox/Edge scrollbar gap left by the existing WebKit-only CSS |
</phase_requirements>

---

## Summary

Phase 1 is a pure infrastructure phase: it creates the shared CSS design-token system (`src/css/tokens.css`), the reset/typography/layout base (`src/css/base.css`), the reusable component shells (`src/css/components.css`), and the FOUC-free pre-paint theming engine (`src/js/theme-init.js`). It wires those into all 5 HTML entry points and updates both build scripts to copy the new CSS and JS verbatim (not through Rollup). No surface is restyled — Phase 1 is the gate that Phases 2–5 inherit from.

The key technical complexity is the 3-layer CSS cascade: `:root` holds light defaults, a guarded `@media(prefers-color-scheme:dark) :root:not([data-theme])` block handles OS-dark, and `:root[data-theme]` handles explicit overrides. The `:not()` guard on both attribute values is the single most-misimplemented detail in this pattern. The pre-paint script is a 4-line synchronous `localStorage` read that sets or removes `data-theme` on `document.documentElement` before any stylesheet-dependent paint — the only async-free data store available at that point in the parse stream. Everything that looks complex about dark-mode theming in browser extensions reduces to: "pick the right storage layer for pre-paint, put the script first, and guard both `:not()` arms."

Phase 1 is also the phase where the build scripts and HTML heads are brought up to standard. The visible footprint is intentionally minimal: the global `:focus-visible` ring plus body-font/reset normalization on options/credits/updated (the D-02 reset bleed, which is expected and documented). Both theming systems — the new `data-theme` engine and the existing `.darkMode`/inline-`<style>` code — coexist in the same deliverable, by design. That coexistence ends per-surface in Phases 2–3.

**Primary recommendation:** Implement in 4 task groups — (1) CSS authoring (`tokens.css` / `base.css` / `components.css`), (2) `theme-init.js`, (3) HTML `<head>` wiring on all 5 pages, (4) build-script edits + preview-page + Playwright spec. All decisions are locked; the planner's only discretionary choices are the `components.css` class-naming convention and the preview-page exact path within `test/`.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Token cascade (light/dark) | Browser / Client (CSS engine) | — | CSS custom properties resolved by the browser; no JS involved at render time |
| FOUC elimination | Browser / Client (parse stream) | — | Pre-paint script runs synchronously before first layout/paint; must be in `<head>` before `<link>` |
| `color-scheme` / native controls | Browser / Client (CSS engine) | — | `color-scheme` is a CSS property; browser honors it for native form controls and scrollbars |
| CSS asset delivery | Static / Build | — | Copied verbatim by `build.sh`/`build_test.sh` into `dist/`; no runtime serving |
| `theme-init.js` delivery | Static / Build | — | Copied verbatim (not Rollup-bundled); lives at `dist/<brw>/js/theme-init.js` |
| `localStorage` read (pre-paint) | Browser / Client (synchronous) | — | Only store readable synchronously at parse time; the write path is Phase 4 |
| `chrome.storage.sync` (canonical theme) | Browser Extension API | — | Cross-device truth; already exists; untouched in Phase 1 |
| Playwright validation (preview page) | Test harness / CI | — | Emulator spec in `test/emulator/`; runs against the test-extension build |

---

## Standard Stack

### Core

| Library/Asset | Version | Purpose | Why Standard |
|---------------|---------|---------|--------------|
| CSS custom properties (`:root`) | Native (all target browsers) | Token layer | Zero-dep, the standard mechanism for design tokens in vanilla CSS |
| `localStorage` (synchronous) | Native | Pre-paint theme cache | Only synchronous storage available at `<head>` parse time in a browser extension |
| `color-scheme` CSS property | Native (Chrome 81+, Firefox 67+, Edge 81+) | Native control / scrollbar theming | Standard cross-browser mechanism replacing `::-webkit-scrollbar` hacks |
| `:focus-visible` | Native (Chrome 86+, Firefox 85+, Edge 86+) | Accessible focus indicator | Standard (WCAG 2.1, Cloudscape); all target browsers support it above the extension floor |

### Supporting

| Library/Asset | Purpose | When to Use |
|---------------|---------|-------------|
| Playwright (`test/emulator/*.spec.js`) | Automated SC1–SC3 validation on preview page | Existing harness — reuse `fixtures.js`; add `test/emulator/foundation.spec.js` |
| Mocha + jsdom | Existing unit test runner | Only if a unit-testable JS helper is needed; Phase 1 JS is a single 4-line script — no unit tests needed |

**No new packages are installed in Phase 1.** Zero. The "zero new runtime dependencies" mandate is fully honored. All capability is achieved with native browser APIs.

### Alternatives Considered

| Standard Choice | Alternative | Why Not |
|----------------|-------------|---------|
| External non-module `theme-init.js` | Inline `<script>` | Blocked by MV3/MV2 default `script-src 'self'` CSP — no policy relaxation allowed |
| `localStorage` for pre-paint read | `chrome.storage.sync` | `chrome.storage` is async; cannot read synchronously before first paint |
| Static `\cp -r src/css` in build | Rollup-bundle CSS | Rollup is for ESM entry points; CSS bundling adds complexity with no benefit here; FND-03 locks the copy approach |
| Static hex token values | `color-mix()` for derived values | `color-mix()` is Firefox 113+; extension floor is Firefox 109; Phase 1 uses no `color-mix()` |

**Installation:** none — no new packages.

---

## Package Legitimacy Audit

**No packages are installed in Phase 1.** Zero new runtime or dev dependencies. The "zero new runtime dependencies" mandate (PROJECT.md, CLAUDE.md, FND-02) is the hard constraint for this entire milestone.

| Package | Disposition |
|---------|-------------|
| (none) | N/A |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

*slopcheck not run — no packages to audit.*

---

## Architecture Patterns

### System Architecture Diagram

```
                  PARSE TIME (pre-paint)
  <html>                      localStorage['visualMode']
    |                                   |
    v                                   v
<head> first child                sync read (4 lines)
src/js/theme-init.js   --------> set/remove data-theme
  (external, non-module)          on document.documentElement
    |
    v                             ← attribute set BEFORE
<link tokens.css>                   stylesheet-dependent paint
<link base.css>
<link components.css>
    |
    v
  CSS engine resolves cascade:

  :root { light defaults; color-scheme: light }   ← (1) always
      |
      ↓ if no [data-theme] AND OS is dark
  @media(dark) :root:not([data-theme="light"])
               :not([data-theme="dark"]) { dark }  ← (2) OS branch
      |
      ↓ if [data-theme] present
  :root[data-theme="dark"] { dark }               ← (3) explicit override
  :root[data-theme="light"] { color-scheme: light }

          ↓
    All surfaces inherit var(--token) values
    (popup / options / aux pages — Phases 2–3)

  BUILD PIPELINE
  src/css/*.css  ──\cp -r──>  dist/<brw>/css/
  src/js/theme-init.js ──\cp──> dist/<brw>/js/theme-init.js
  (NOT through Rollup)

  TEST BUILD
  src/css/*.css  ──cp -r──>  test/extension/css/
  src/js/theme-init.js ──cp──> test/extension/js/theme-init.js
  test/preview/index.html ──cp──> test/extension/preview/
  (theme-init.js SKIPPED in per-file Rollup loop; copied verbatim after loop)
```

### Recommended Project Structure

```
src/
├── css/                     # NEW — all 3 files are new; no existing CSS
│   ├── tokens.css           # :root token layer + 3-layer cascade
│   ├── base.css             # reset, system-font, :focus-visible ring
│   └── components.css       # reusable shells consuming var(--token)
├── js/
│   ├── theme-init.js        # NEW — external non-module pre-paint setter
│   └── [existing files unchanged]
└── [existing HTML files — <head> wiring added]

test/
├── preview/                 # NEW — D-01 preview/gallery page
│   └── index.html           # full component-shell set, both themes
├── emulator/
│   ├── fixtures.js          # existing — reuse for new spec
│   ├── foundation.spec.js   # NEW — SC1/SC2/SC3 Playwright spec
│   └── [existing specs unchanged]
└── extension/               # test build output (build_test.sh writes here)

bin/
├── build.sh                 # MODIFIED — 2 lines added inside brw loop
└── build_test.sh            # MODIFIED — CSS copy + skip/verbatim for theme-init.js + preview copy
```

### Pattern 1: 3-Layer Token Cascade

**What:** CSS custom properties on `:root` with two override layers — OS-media-query and explicit attribute.
**When to use:** Always. This is the single cascade; every surface inherits from it.

```css
/* tokens.css — SOURCE: UI-SPEC §1 (LOCKED) */

/* (1) LIGHT defaults + universal fallback */
:root {
  --color-bg-layout: #ffffff;
  --color-bg-container: #ffffff;
  --color-text-body: #0f141a;
  --color-text-secondary: #424650;
  --color-text-heading: #0f141a;
  --color-border-divider: #c6c6cd;
  --color-border-focus: #006ce0;
  --color-bg-button-primary: #006ce0;
  /* ...all ~30 tokens at LIGHT values... */
  color-scheme: light;
}

/* (2) OS dark — ONLY when user has NOT forced a theme */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]):not([data-theme="dark"]) {
    --color-bg-layout: #161d26;
    --color-bg-container: #161d26;
    --color-text-body: #c6c6cd;
    --color-text-secondary: #c6c6cd;
    --color-text-heading: #ebebf0;
    --color-border-divider: #424650;
    --color-border-focus: #42b4ff;
    --color-bg-button-primary: #42b4ff;
    /* ...all dark overrides... */
    color-scheme: dark;
  }
}

/* (3) Explicit manual override — beats OS */
:root[data-theme="dark"] {
  /* same dark values as block (2) */
  color-scheme: dark;
}
:root[data-theme="light"] {
  /* No token redeclaration needed — :root already holds light values.
     MUST carry color-scheme: light so Light choice on a dark-OS device
     gets light native controls. */
  color-scheme: light;
}
```

### Pattern 2: FOUC-Free Pre-Paint Script

**What:** External non-module synchronous script that sets `data-theme` on `<html>` before any CSS-dependent paint.
**When to use:** On every HTML page, as first child of `<head>`.

```javascript
// src/js/theme-init.js — SOURCE: UI-SPEC §2 (LOCKED)
// Non-module. No imports. No IIFE wrapper required (top-level vars are fine for a 4-line script).
var m = localStorage.getItem('visualMode');
// 'light' / 'dark' → set explicit attribute (beats OS)
// anything else ('default', null) → remove so @media branch decides
if (m === 'light' || m === 'dark') {
  document.documentElement.setAttribute('data-theme', m);
} else {
  document.documentElement.removeAttribute('data-theme');
}
```

**Critical details:**
- `localStorage` key is `'visualMode'` — NOT `'aesr.visualMode'` (the ARCHITECTURE.md research predates the UI-SPEC; UI-SPEC §2 takes precedence)
- Does NOT resolve OS preference in JS (no `window.matchMedia` call) — the CSS `@media` branch handles OS
- Does NOT write to `localStorage` — that is Phase 4 (THM-02/THM-04)

### Pattern 3: `<head>` Wiring Order

**What:** The required wiring order for all 5 HTML pages.
**When to use:** Every HTML entry point.

```html
<!-- SOURCE: UI-SPEC §5 (LOCKED) -->
<head>
  <meta charset="UTF-8">
  <script src="js/theme-init.js"></script>     <!-- FIRST: pre-paint, non-module -->
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/components.css">
  <!-- per-surface sheet added in Phases 2–3 -->
  <!-- existing page module script (e.g. options.js) stays after the links -->
</head>
```

**Per-page deltas (what changes in Phase 1):**

| Page | Current state | Phase 1 change |
|------|--------------|----------------|
| `popup.html` | No `<!DOCTYPE>`, no `<meta charset>`, no `<head>` script, inline `<style>` only | Add `<!DOCTYPE html>`, `<meta charset="UTF-8">`, theme-init first, then `<link>` chain; inline `<style>` remains (removed Phase 2) |
| `options.html` | Has DOCTYPE, charset; module script is first head child | Insert `theme-init.js` as first head child (before the existing module script and new links) |
| `supporters.html` | Has DOCTYPE, charset; no `<head>` script | Add theme-init first + `<link>` chain |
| `credits.html` | Has DOCTYPE, charset; no `<head>` script | Add theme-init first + `<link>` chain |
| `updated.html` | Has DOCTYPE, charset; no `<head>` script | Add theme-init first + `<link>` chain |

**Popup source-order insulation (D-02):** The popup's inline `<style>` sits AFTER the new `<link>` chain in source order. For equal-specificity rules, inline wins. This is what prevents the `base.css` reset from overriding the popup's existing `body { font-family: ... }` — verified by inspection of `popup.html` lines 1-30.

### Pattern 4: Build Script Edits

**What:** Exact changes to both build scripts to copy CSS and `theme-init.js` verbatim.

```bash
# bin/build.sh — SOURCE: UI-SPEC §6 (LOCKED)
# ADD these two lines inside the existing `for brw in ${browsers[@]}` loop,
# alongside the existing \cp commands:
  \cp -r src/css dist/$brw/
  \cp -f src/js/theme-init.js dist/$brw/js/theme-init.js
```

```bash
# bin/build_test.sh — SOURCE: UI-SPEC §6 (LOCKED)
# Change 1: add after existing `cp src/*.html $destdir/` line:
cp -r src/css $destdir/

# Change 2: modify the per-file Rollup loop to skip theme-init.js:
for file in src/js/*; do
  if [ -f "$file" ]; then
    fname="${file##*/}"
    if [ "$fname" = "theme-init.js" ]; then continue; fi   # ship verbatim, not bundled
    rollup -c ./rollup.config.js src/js/$fname --file $destdir/js/$fname
  fi
done
cp src/js/theme-init.js $destdir/js/theme-init.js   # verbatim copy after loop

# Change 3: copy preview page into test output (for D-01 Playwright spec):
cp -r test/preview $destdir/preview   # (or equivalent path per planner's D-01 directory choice)
```

### Pattern 5: `:focus-visible` Ring

**What:** Single tokenized, theme-aware focus indicator in `base.css`.
**When to use:** Global — every interactive element inherits it; surface phases must not weaken it.

```css
/* base.css — SOURCE: UI-SPEC §4 (LOCKED) */
:focus-visible {
  outline: 2px solid var(--color-border-focus);   /* blue-600 light / blue-400 dark */
  outline-offset: 2px;
  border-radius: var(--radius-focus-ring);          /* 4px */
}
```

### Anti-Patterns to Avoid

- **Bundling `theme-init.js` through Rollup:** `build_test.sh`'s per-file loop catches all files in `src/js/`; `theme-init.js` must be explicitly skipped and copied verbatim. "Rollup passes it through unchanged" is not a safe assumption — the skip guard must be explicit.
- **`data-theme` on `<body>` instead of `<html>`:** The attribute must be on `document.documentElement` so it is set before `<body>` exists in the parse stream.
- **Omitting one `:not()` arm in the OS-dark guard:** Both `:not([data-theme="light"])` and `:not([data-theme="dark"])` are required. Omitting the `"light"` guard causes manual-Light to flash dark on dark-OS devices.
- **Using `window.matchMedia` in `theme-init.js`:** The simpler "set attribute or remove; let CSS handle `@media`" pattern is the LOCKED approach. The old ARCHITECTURE.md IIFE pattern that resolves `'default'` → OS in JS is superseded by UI-SPEC §2.
- **Using `'aesr.visualMode'` as the localStorage key:** The key is `'visualMode'`. The ARCHITECTURE.md research predates the UI-SPEC; UI-SPEC §2 is authoritative.
- **Putting the preview page in `src/`:** `build.sh` ships `\cp -r src/*.html dist/$brw/`; anything in `src/` lands in production builds. The preview page lives in `test/`, not `src/`.
- **Removing `.darkMode` rules or inline `<style>` blocks in Phase 1:** Those removals happen per-surface in Phases 2–3. Phase 1 is ADDITIVE.
- **Using `color-mix()` for any token value:** Firefox 113+ only; extension floor is Firefox 109. All token values in Phase 1 are static hex.
- **Using `:has()` selector:** Firefox 121+ only; must be avoided entirely in this phase.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cross-theme native scrollbars / form controls | Custom `::-webkit-scrollbar` + Firefox workaround | `color-scheme` CSS property on `:root` | Standard mechanism; one line per theme layer; covers Chrome/Firefox/Edge natively; PITFALLS #6 |
| Pre-paint theme application | Post-load async `chrome.storage` read | External non-module `localStorage` sync read in `<head>` | `chrome.storage` is async; cannot eliminate FOUC with it; the existing popup.js:76-79 / options.js:194/220 pattern is the FOUC source |
| Webfont loading | Bundle a custom font | System font stack via `font-family` on `body` in `base.css` | FND-04; zero-dep; no FOUT; matches AWS console on all platforms |
| Token cascade logic | JS theme-switching function | CSS cascade with `:not()` guard | CSS handles OS+manual without JS; JS only writes `data-theme` pre-paint |

**Key insight:** Every complex-looking problem in this phase has a simple CSS-native answer. The engineering challenge is getting the ordering right (script before link, link before body) — not building custom mechanisms.

---

## Common Pitfalls

### Pitfall 1: Inline Script CSP Block
**What goes wrong:** Placing theme-application logic in an inline `<script>` causes a CSP violation; the script silently does nothing; FOUC persists.
**Why it happens:** MV3/MV2 default `content_security_policy` is `script-src 'self'`; inline scripts are blocked without `'unsafe-inline'`.
**How to avoid:** `src/js/theme-init.js` is an external file with `src` attribute — always loads, never violates CSP. Do not add `content_security_policy` to any manifest.
**Warning signs:** CSP violation in the browser console on any extension page load.

### Pitfall 2: Missing One `:not()` Guard on OS-Dark Branch
**What goes wrong:** A user who manually selects "Light" while their OS is in dark mode gets dark colors anyway; manual choice silently loses.
**Why it happens:** If only `:root:not([data-theme="dark"])` is written, a user with `data-theme="light"` still matches the `@media` block.
**How to avoid:** Always write both: `:root:not([data-theme="light"]):not([data-theme="dark"])`. The checker verified this in UI-SPEC §1.
**Warning signs:** SC1 Playwright test passes for `data-theme="dark"` but fails for `data-theme="light"` on a machine with dark OS preference.

### Pitfall 3: `data-theme` on `<body>` Instead of `<html>`
**What goes wrong:** Setting `document.body.setAttribute(...)` fails if `<body>` doesn't exist yet when the script runs; FOUC on subsequent paints when body is added.
**Why it happens:** `theme-init.js` runs before the parser reaches `<body>`; `document.body` is null at that point.
**How to avoid:** Always `document.documentElement.setAttribute('data-theme', m)`.
**Warning signs:** `TypeError: Cannot read properties of null (reading 'setAttribute')` in console.

### Pitfall 4: `build_test.sh` Rollup-Processes `theme-init.js`
**What goes wrong:** `build_test.sh`'s `for file in src/js/*` loop catches `theme-init.js`; Rollup transforms it; the pre-paint contract is not guaranteed to hold in the test build.
**Why it happens:** The loop uses a glob; it has no exclusion by default.
**How to avoid:** Add `if [ "$fname" = "theme-init.js" ]; then continue; fi` inside the loop, then `cp src/js/theme-init.js $destdir/js/theme-init.js` after the loop.
**Warning signs:** SC3 FOUC check in Playwright passes on Chrome production build but fails on the test extension build.

### Pitfall 5: Preview Page Lands in Production Build
**What goes wrong:** Preview page appears in the submitted extension package; adds store-review surface and file bloat.
**Why it happens:** `build.sh` runs `\cp -r src/*.html dist/$brw/`; any `.html` in `src/` is picked up.
**How to avoid:** Preview page lives under `test/`, not `src/`. Only `build_test.sh` copies it into the test-extension output.
**Warning signs:** `dist/chrome/` or `dist/firefox/` contains a file named `preview.html` or similar.

### Pitfall 6: Reset Bleed Not Documented (Review Flag)
**What goes wrong:** A Phase 1 PR reviewer sees the `<link rel="stylesheet" href="css/base.css">` on options/credits/updated and flags it as "Phase 1 touched the options page."
**Why it happens:** The reset bleed is expected (D-02), but only if the plan documents it explicitly.
**How to avoid:** Phase 1 plan's verification notes must state: "Expected visible delta: `:focus-visible` ring change on all pages + body-font/reset normalization on options/credits/updated. This is the documented D-02 reset bleed, not a regression."
**Warning signs:** PR review comment asking "why does Phase 1 change the options page font?"

### Pitfall 7: `options.spec.js` Breaks on Body Font/Margin Assertions
**What goes wrong:** Existing `options.spec.js` or `supporters.spec.js` asserts a specific body `font-family` or `margin`; the `base.css` reset changes those values; CI fails.
**Why it happens:** D-02 reset bleed applies `system-font` to `body` on options and supporters.
**How to avoid:** Audit `test/emulator/options.spec.js` and `test/emulator/supporters.spec.js` for body/font/margin assertions before Phase 1 completes; update specs in the same PR.
**Warning signs:** Existing emulator test suite fails after the `base.css` `<link>` is added to the HTML pages.

---

## Code Examples

Verified patterns from UI-SPEC (authoritative source):

### Full Token Set — Text Tokens (tokens.css)
```css
/* SOURCE: UI-SPEC §Color — full semantic token set (LOCKED) */
/* Light values on :root; dark values in @media and [data-theme="dark"] blocks */

/* Text */
--color-text-body: #0f141a;                   /* dark: #c6c6cd */
--color-text-secondary: #424650;              /* dark: #c6c6cd */
--color-text-heading: #0f141a;                /* dark: #ebebf0 */
--color-text-heading-secondary: #424650;      /* dark: #a4a4ad */
--color-text-label: #0f141a;                  /* dark: #dedee3 */
--color-text-form-secondary: #656871;         /* dark: #a4a4ad */
--color-text-disabled: #b4b4bb;               /* dark: #656871 */
--color-text-interactive: #424650;            /* dark: #dedee3 */
--color-text-interactive-hover: #0f141a;      /* dark: #f9f9fa */
--color-text-accent: #006ce0;                 /* dark: #42b4ff */
--color-link: #006ce0;                        /* dark: #42b4ff */
--color-link-hover: #002b66;                  /* dark: #75cfff */
```

### Full Token Set — Surface and Border Tokens (tokens.css)
```css
/* SOURCE: UI-SPEC §Color (LOCKED) */

/* Surfaces / backgrounds */
--color-bg-layout: #ffffff;                   /* dark: #161d26 */
--color-bg-container: #ffffff;                /* dark: #161d26 */
--color-bg-input: #ffffff;                    /* dark: #161d26 */
--color-bg-input-disabled: #ebebf0;           /* dark: #1b232d */
--color-bg-dropdown-item: #ffffff;            /* dark: #1b232d */
--color-bg-dropdown-item-hover: #f3f3f7;      /* dark: #131920 */
--color-bg-item-selected: #f0fbff;            /* dark: #001129 */
--color-bg-button-primary: #006ce0;           /* dark: #42b4ff */
--color-bg-button-primary-hover: #004a9e;     /* dark: (derived) — DEFERRED to Phase 2 */
--color-bg-button-normal-hover: #f0fbff;      /* dark: #1b232d */

/* Borders / controls */
--color-border-divider: #c6c6cd;              /* dark: #424650 */
--color-border-divider-secondary: #ebebf0;    /* dark: #232b37 */
--color-border-input: #8c8c94;                /* dark: #656871 */
--color-border-control: #8c8c94;              /* dark: #8c8c94 */
--color-border-focus: #006ce0;                /* dark: #42b4ff */
--color-control-checked: #006ce0;             /* dark: #42b4ff */

/* Status */
--color-text-status-success: #00802f;         /* dark: #2bb534 */
--color-text-status-error: #db0000;           /* dark: #ff7a7a */
--color-text-status-warning: #855900;         /* dark: #fbd332 */
--color-text-status-info: #006ce0;            /* dark: #42b4ff */
```

### Full Token Set — Spacing, Type, Radius, Shadow (tokens.css)
```css
/* SOURCE: UI-SPEC §Spacing Scale, §Typography, §Color/Radius+Elevation (LOCKED) */

/* Spacing */
--space-xxxs: 2px;
--space-xxs: 4px;
--space-xs: 8px;
--space-s: 12px;
--space-m: 16px;
--space-l: 20px;
--space-xl: 24px;
--space-xxl: 32px;
--space-xxxl: 40px;

/* Typography */
--font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-family-mono: Monaco, Menlo, Consolas, "Courier New", monospace;
--font-size-body-s: 12px;
--font-size-body-m: 14px;
--font-size-heading-s: 16px;
--font-size-heading-l: 20px;
--line-height-body-s: 16px;
--line-height-body-m: 20px;
--line-height-heading-s: 20px;
--line-height-heading-l: 24px;
--font-weight-normal: 400;
--font-weight-bold: 700;

/* Radius */
--radius-input: 8px;
--radius-item: 8px;
--radius-button: 20px;
--radius-container: 16px;
--radius-badge: 4px;
--radius-alert: 12px;
--radius-focus-ring: 4px;
```

### Shadow Tokens — Theme-Aware in tokens.css
```css
/* SOURCE: UI-SPEC §Color/Radius+Elevation (LOCKED) */
/* Light defaults on :root */
--shadow-container: 0 0 1px 1px #e9ebed, 0 1px 8px 2px rgba(0,7,22,.12);
--shadow-dropdown: 0 4px 20px 1px rgba(0,7,22,.10);

/* Dark overrides (in @media dark block AND [data-theme="dark"]) */
--shadow-container: 0 1px 8px 2px rgba(0,7,22,.6);
--shadow-dropdown: 0 4px 20px 1px rgba(0,4,12,1);
```

### base.css Structure
```css
/* SOURCE: UI-SPEC §Typography §4 */

/* Reset */
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--color-bg-layout);
  font-family: var(--font-family-base);
  font-size: var(--font-size-body-m);
  line-height: var(--line-height-body-m);
  color: var(--color-text-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* :focus-visible ring — the A11Y-01 contract */
:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
  border-radius: var(--radius-focus-ring);
}

a {
  color: var(--color-link);
  text-decoration: underline;
}
a:hover {
  color: var(--color-link-hover);
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact for Phase 1 |
|---|---|---|
| Post-load async `chrome.storage.sync.get` for theme | Pre-paint synchronous `localStorage` read | Phase 1 introduces the correct approach; old approach (popup.js:76-79, options.js:194/220) remains until Phases 2–3 remove per-surface inline styles |
| `.darkMode` class on `<body>` | `data-theme` attribute on `<html>` | Two systems coexist in Phase 1; `.darkMode` removal is per-surface Phases 2–3 |
| `::-webkit-scrollbar` (Chrome-only) | `color-scheme` CSS property | Cross-browser; closes Firefox/Edge gap; Phase 1 introduces `color-scheme` in the cascade |
| Per-page inline `<style>` with hardcoded hex | CSS custom properties on `:root` consumed via `var()` | Phase 1 creates the token layer; surfaces consume it Phases 2–3 |

**Deprecated/outdated (exists in codebase, not changed in Phase 1):**
- `popup.js:76-79` — async `chrome.storage` read applying `.darkMode` class post-load → Phase 2 removes
- `options.js:194/220` — same pattern → Phase 3 removes
- `popup.html:119-127` — `::-webkit-scrollbar` custom styling → Phase 2 evaluates; `color-scheme` in Phase 1 closes the Firefox gap regardless

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `test/emulator/fixtures.js` `testInOptions` / `testInPopup` / `testInWorker` are sufficient as the Playwright harness base for the new foundation spec | Validation Architecture | If the preview page requires a different navigation pattern (e.g. direct `page.goto` to the preview URL rather than the options-page helper), the foundation spec must implement its own navigation helper — low effort |
| A2 | `options.spec.js` / `supporters.spec.js` may have body-font or margin assertions that will shift with D-02 reset bleed | Common Pitfalls | If no such assertions exist, that audit step is a no-op — harmless over-caution |

**All other claims in this research are VERIFIED against the live codebase or CITED from the LOCKED UI-SPEC.**

---

## Open Questions (RESOLVED)

1. **`components.css` class-naming convention**
   - What we know: Token custom-property names are LOCKED. Component class names are Claude's Discretion.
   - What's unclear: Whether `.aesr-button`, `.button`, or BEM (`.aesr-button--primary`) reads better as the Phases 2–3 integration contract.
   - Recommendation: Planner picks and documents in PLAN.md. Lean toward `.aesr-*` prefix to avoid any future collision with browser defaults or third-party CSS.
   - RESOLVED: `.aesr-*` BEM prefix chosen per Plan 01-03 (component shells plan); class names documented there (e.g. `.aesr-btn`, `.aesr-btn--primary`, `.aesr-pane`, etc.).

2. **Exact preview-page path within `test/`**
   - What we know: Must be under `test/`, not `src/`. D-01 is decided; directory name is Claude's Discretion.
   - What's unclear: `test/preview/`, `test/fixtures/preview/`, or `test/emulator/preview/`.
   - Recommendation: `test/preview/` — cleanest separation; `test/emulator/` is for specs, not static HTML.
   - RESOLVED: `test/preview/` chosen per D-01/Plan 01-01; wired by `build_test.sh` into `test/extension/preview/`.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | build scripts, Playwright | Assumed available (CI target Node 24) | — | — |
| npm | package management | Assumed available | — | — |
| Playwright + Chrome binaries | SC1–SC3 foundation spec (D-01) | Present in `test/emulator/` (existing specs run) | 1.58.2 (package.json) | None — tests require it |
| Rollup | `build_test.sh` ESM bundling | Present (`rollup.config.js` exists) | 4.59.0 (package.json) | — |
| Bash | build scripts | Present (macOS/Linux) | — | — |

**Missing dependencies with no fallback:** None identified.
**Missing dependencies with fallback:** None identified.

*Step 2.6 note: This phase introduces no new external tool dependencies. All tools are already in use by the project.*

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Playwright 1.58.2 (emulator) + Mocha 11.7.5 (unit) |
| Config file | `playwright.config.ts` |
| Quick run command | `npm run test_emulator -- test/emulator/foundation.spec.js` |
| Full suite command | `npm run test_emulator` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FND-01 (SC1) | Token computed-style differs between `data-theme="light"` and `data-theme="dark"` on `<html>` | integration (Playwright) | `npm run test_emulator -- test/emulator/foundation.spec.js` | ❌ Wave 0 |
| FND-01 (SC2) | Component shells render correctly in both themes (computed-style, not pixel snapshot) | integration (Playwright) | `npm run test_emulator -- test/emulator/foundation.spec.js` | ❌ Wave 0 |
| FND-03 (SC5) | Build output `dist/<brw>/css/*.css` and `dist/<brw>/js/theme-init.js` exist in both browser dirs | smoke (shell assertion) | `ls dist/chrome/css dist/firefox/css dist/chrome/js/theme-init.js dist/firefox/js/theme-init.js` | ❌ Wave 0 (optional CI step) |
| THM-03 (SC3 FOUC) | `data-theme` attribute present on `<html>` before stylesheet-dependent paint | integration (Playwright) | `npm run test_emulator -- test/emulator/foundation.spec.js` | ❌ Wave 0 |
| THM-03 (SC3 CSP) | Zero console CSP violations on preview page load | integration (Playwright) | `npm run test_emulator -- test/emulator/foundation.spec.js` | ❌ Wave 0 |
| THM-05 | `color-scheme` computed value matches active theme on `:root` | integration (Playwright) | `npm run test_emulator -- test/emulator/foundation.spec.js` | ❌ Wave 0 |
| FND-02 | No `@cloudscape-design/*` package in `node_modules` | manual audit / CI | `ls node_modules | grep cloudscape` (zero results expected) | N/A (audit) |
| FND-04 | No webfont `@font-face` or `<link>` to external font CDN | manual audit | grep in CSS output | N/A (audit) |

**Manual-only items (not automatable in Phase 1):**
- Firefox/Edge visual parity — owned by Phase 5 SC4; Chrome-only Playwright covers Phase 1
- Per-profile color × dark-mode (deferred to Phase 2/4)

### Sampling Rate
- **Per task commit:** `npm run test_emulator -- test/emulator/foundation.spec.js`
- **Per wave merge:** `npm run test_emulator` (full emulator suite)
- **Phase gate:** Full emulator suite green + existing specs green (or updated in-PR) before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `test/preview/index.html` — preview/gallery page with full component-shell set (both themes); required for SC1/SC2/SC3 Playwright navigation target
- [ ] `test/emulator/foundation.spec.js` — SC1 token flip, SC2 shell render, SC3 CSP/FOUC checks; reuses `fixtures.js` patterns
- [ ] Run `npm run test_emulator` AFTER `base.css` is linked in the HTML pages; update any failing `options.spec.js` or `supporters.spec.js` body-font/margin assertions in-PR (per D-02). Gate: full emulator suite green before phase mark-complete.

---

## Security Domain

### Applicable ASVS Categories (Level 1)

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Phase 1 introduces no auth mechanism |
| V3 Session Management | No | No session state introduced |
| V4 Access Control | No | No access control in CSS token phase |
| V5 Input Validation | Partial | `localStorage.getItem('visualMode')` return is validated: only `'light'` or `'dark'` trigger `setAttribute`; any other value (including attacker-controlled) falls through to `removeAttribute` — no injection vector |
| V6 Cryptography | No | No crypto in this phase |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| CSS injection via token overrides | Tampering | All token values are static hex in source; no user-controlled CSS; `tokens.css` is a bundled static asset — no runtime string interpolation |
| `data-theme` attribute injection | Tampering | `theme-init.js` only sets `'light'` or `'dark'`; no other string value can set the attribute via this script; the attribute controls CSS class selection only, not security boundaries |
| Inline script CSP bypass | Elevation | Prevented by design: `theme-init.js` is an external `src`-loaded script; no `'unsafe-inline'` added to any manifest; checked via SC3 CSP Playwright assertion |

**Security assessment:** Phase 1 introduces no new attack surface beyond what the extension already has. The `localStorage` read is input-validated (allowlist of two values). No new permissions, no new hosts, no new network requests, no user-supplied values flow into any DOM-modifying call in this phase.

---

## Sources

### Primary (HIGH confidence — LOCKED UI-SPEC)
- `.planning/phases/01-design-system-foundation/01-UI-SPEC.md` — all token values, cascade structure, `theme-init.js` logic, `<head>` wiring order, build-script edits (approved 2026-05-27)
- `.planning/phases/01-design-system-foundation/01-CONTEXT.md` — D-01/D-02 decisions, scope boundary, canonical refs
- `.planning/REQUIREMENTS.md` — FND-01..04, THM-03, THM-05 requirement text
- `.planning/research/STACK.md` — token hex values (source of truth, WCAG-verified)
- `.planning/research/PITFALLS.md` — pitfall catalog (inline-script CSP, webfont, scrollbars, focus-visible, etc.)

### Secondary (HIGH confidence — live codebase verification)
- `bin/build.sh` — verified exact current loop structure (no `src/css` copy present; addition points confirmed)
- `bin/build_test.sh` — verified exact current per-file Rollup loop structure (no skip/verbatim for `theme-init.js`; addition points confirmed)
- `src/popup.html` — verified: no `<!DOCTYPE>`, no `<meta charset>`, inline `<style>` after body (well, in `<head>` but confirmed source-order insulation applies)
- `src/options.html` — verified: has DOCTYPE, charset, module script first in head
- `src/credits.html`, `src/updated.html`, `src/supporters.html` — verified: have DOCTYPE/charset, no `<head>` scripts
- `.planning/config.json` — `workflow.nyquist_validation: true`, `workflow.security_enforcement: true`, `security_asvs_level: 1`, `commit_docs: false`

### Tertiary (ASSUMED — not re-verified this session)
- `.planning/research/ARCHITECTURE.md` — older pre-paint patterns; **superseded by UI-SPEC §2 for `theme-init.js` logic and localStorage key name**
- `.planning/codebase/TESTING.md` — Playwright harness fixture shape (assumed current; verified by existing spec filenames in `test/emulator/`)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all capability is native browser APIs; zero new packages
- Architecture (cascade + build): HIGH — locked in UI-SPEC, verified against live build scripts and HTML files
- Pitfalls: HIGH — derived from LOCKED UI-SPEC annotations and live codebase inspection
- Validation architecture: HIGH — based on existing Playwright harness + ROADMAP SC1–SC5 success criteria

**Research date:** 2026-05-27
**Valid until:** Stable — locked foundation; no expiry risk. Token hex values and cascade structure are LOCKED by the approved UI-SPEC. Build-script patterns are verified against live code. Re-research only needed if the UI-SPEC is revised or the Firefox floor changes.

**Key disambiguation logged (planner: read this):**
1. `localStorage` key: `'visualMode'` (UI-SPEC §2) — NOT `'aesr.visualMode'` (ARCHITECTURE.md is superseded)
2. `theme-init.js` logic: simple set/remove only (UI-SPEC §2) — NOT an IIFE resolving OS preference in JS (ARCHITECTURE.md is superseded)
3. `build_test.sh` `theme-init.js` handling: skip in loop + verbatim copy after (UI-SPEC §6) — NOT "Rollup pass-through is fine" (ARCHITECTURE.md gap note is superseded)
4. Phase 1 scope: ADDITIVE only — two theming systems coexist; `.darkMode` removal is Phases 2–3
