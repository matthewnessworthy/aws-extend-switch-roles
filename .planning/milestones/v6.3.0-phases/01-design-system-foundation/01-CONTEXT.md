# Phase 1: Design System Foundation - Context

**Gathered:** 2026-05-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the shared, Cloudscape-derived **CSS design-token system**, the **FOUC-free pre-paint theming engine**, the reset/typography/layout primitives + reusable component shells, and the **build-pipeline plumbing** — the gate that Phases 2–5 inherit. **No surface is restyled here**: popup → Phase 2, options/auxiliary → Phase 3, theme toggle + per-profile color → Phase 4, a11y/cross-browser/release audit → Phase 5. The only intended visual change to existing surfaces in Phase 1 is the global `:focus-visible` ring (plus the body-font/reset normalization accepted in D-02 below).

Delivers: `src/css/tokens.css`, `src/css/base.css`, `src/css/components.css`, `src/js/theme-init.js`, the `<head>` wiring on all 5 pages, and the `bin/build.sh` / `bin/build_test.sh` edits.
</domain>

<spec_lock>
## Design Contract (LOCKED via 01-UI-SPEC.md)

**The `01-UI-SPEC.md` design contract is approved and locks almost everything for this phase.** Requirements **FND-01, FND-02, FND-03, FND-04, THM-03, THM-05** are covered there. Downstream agents **MUST read `01-UI-SPEC.md` before planning or implementing** — its locked content is **not** duplicated here.

Locked by the UI-SPEC (do NOT re-litigate):
- All light + dark semantic token values (color, type, spacing, radius, elevation), hand-resolved to hex and WCAG-verified — source of truth `.planning/research/STACK.md`.
- The 3-layer cascade `:root` (light + fallback) → `@media(prefers-color-scheme:dark) :root:not([data-theme="light"]):not([data-theme="dark"])` → `:root[data-theme]` override, with the `:not()` guard that makes "manual choice beats OS" correct.
- `theme-init.js` = external, **non-module** pre-paint script, **first child of `<head>`**, synchronous `localStorage['visualMode']` read; no inline script, no CSP relaxation.
- `color-scheme` set per theme on `:root` (THM-05); `data-theme` on `<html>` (replaces the `.darkMode` body class); single tokenized `:focus-visible` ring in `base.css`.
- File layout (`src/css/{tokens,base,components}.css` shared by all 5 pages), `<head>` wiring order, and the exact `build.sh` (`cp -r src/css` + `cp theme-init.js`) / `build_test.sh` (`cp -r src/css` + skip `theme-init.js` in the Rollup loop, copy verbatim) edits.
- Phase 1 uses **no `color-mix()`** (keeps the FF-109 floor); **no** manifest / `rollup.config.js` / permission / host change.

**In scope (Phase 1):** the token system + theming engine + primitives/component shells + build plumbing, wired and proven in both themes.
**Out of scope (Phase 1):** any surface restyle (popup/options/aux), removing the existing inline `<style>` blocks or `.darkMode` rules (those happen per-surface in Phases 2–3), the theme toggle wiring + live update (Phase 4), and the per-profile color × dark-mode rule (Phase 2/4 — Phase 1 only exposes the token hooks).

> ⚠ **One UI-SPEC claim is superseded by this discussion:** UI-SPEC §4 states "No other visual change to those surfaces occurs in Phase 1 [except the focus ring]." **D-02 below overrides that** — see the Phase-1 visible-footprint contract.
</spec_lock>

<decisions>
## Implementation Decisions

### Foundation Verification & Demo Vehicle
- **D-01: Build a committed preview/gallery page + an automated Playwright spec.** Because Phase 1 has no real surface to apply tokens to, SC1–SC3 are proven against a dedicated preview page that renders the full token set + every component shell (buttons, inputs, select, checkbox/radio, role-list item, pane/container, divider, status/empty/loading/error state shells, `:focus-visible` ring) in both themes. It doubles as the **living visual contract** Phases 2–3 build against.
  - **Location:** the page lives in the **test tree** (e.g. `test/preview/` or `test/fixtures/`), **not** `src/`. Rationale: `build.sh` ships via `\cp -r src/*.html dist/$brw/`, so keeping it out of `src/` guarantees it **never lands in `dist/`** (no published-extension bloat, no extra store-review surface).
  - **Build wiring:** `bin/build_test.sh` copies the preview page (and links `theme-init.js` + the 3 CSS sheets into it) into the test-extension output so Playwright can navigate to it at `chrome-extension://${extensionId}/…`. This rides alongside the `cp -r src/css $destdir/` the UI-SPEC already requires.
  - **Automated checks (Playwright, `test/emulator/*.spec.js`, reusing `fixtures.js`):**
    - **SC1:** a token-driven element's computed style differs correctly between `data-theme="light"` and `data-theme="dark"` on `<html>`.
    - **SC2:** base + components render the shells correctly in both themes (computed-style assertions, not pixel snapshots — keep resilient).
    - **SC3 (CSP):** zero console CSP violations on load (validates the external non-module `theme-init.js`, no inline script).
    - **SC3 (FOUC):** the resolved theme attribute is present on `<html>` before stylesheet-dependent paint (validates the pre-paint script ordering).
  - Cross-browser note: Playwright here is Chrome-only; Firefox/Edge visual parity stays **manual** and is owned by Phase 5 SC4 — not a Phase-1 gap.

### Phase-1 Visible-Footprint Contract (reset bleed)
- **D-02: Accept harmless reset bleed.** `base.css` ships its **full global reset** (`* { box-sizing: border-box }`, system-font `body`, margin/padding reset, font-smoothing) and is linked on all 5 pages in Phase 1 — the UI-SPEC's literal "base.css = shared reset" design. **No scoping / opt-in hook** is added.
  - **Verified insulation (popup is unaffected):** `src/popup.html`'s inline `<style>` already declares `* { box-sizing: border-box }` (line 4) and `body { font-family: "Segoe UI", Arial, Meiryo, sans-serif }` (lines 6–10), and it sits **after** the new `<link>` chain in source order → inline wins → popup renders identically (except the new focus ring).
  - **Verified bleed surface (minor, transient):** `src/options.html` (`body` sets background/font-size/margin but **no `font-family`**), `src/credits.html`, and `src/updated.html` have no `body` font-family → the system-font stack applies to their `body` in Phase 1. `src/supporters.html` already uses an `-apple-system,…` stack, so it is effectively unchanged. These surfaces are fully finalized when restyled in Phase 3.
  - **Consequence — planner MUST act:** this **supersedes UI-SPEC §4's "no other visual change" claim**. The Phase-1 plan's verification notes must state the expected delta as **focus ring + body-font/reset normalization on options/credits/updated**, so a reviewer does not flag it as "Phase 1 touched options."
  - **Test impact:** check `test/emulator/options.spec.js`, `supporters.spec.js`, and any credits/updated coverage for assertions sensitive to body font / margin / box-sizing; **update those specs in the same PR** if they shift (per the per-phase exit gate "tests green or specs updated in-PR").

### Claude's Discretion (deliberately NOT asked — planner/architecture territory)
- **`components.css` class-naming convention** (e.g. namespaced `.aesr-*` vs plain `.button` vs BEM). The token *custom-property* names are LOCKED by the UI-SPEC; the component *class* names are the planner's call. Lean: a short namespaced prefix is reasonable since these classes become the contract Phases 2–3 consume — but no hard constraint. Planner picks and documents it in PLAN.md.
- **Component shell completeness / granularity.** SC2 lists the required shells; "how polished vs skeletal" is a planner judgment informed by Phase 2/3 needs. The committed preview page (D-01) incentivizes reasonably-complete shells, since they must render legibly to serve as the visual contract.
- **Exact preview-page directory + spec filename** within the test tree.
- **`--color-bg-button-primary-hover` (dark)** is "(derived)" in the UI-SPEC and explicitly **deferred to Phase 2** (resolve when the first primary button is placed) — not a Phase-1 deliverable.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 1 design contract (read FIRST)
- `.planning/phases/01-design-system-foundation/01-UI-SPEC.md` — **LOCKED** authoritative spec for every Phase-1 token value, the 3-layer cascade, `theme-init.js`, `color-scheme`, file layout, `<head>` wiring, and the exact `build.sh`/`build_test.sh` edits. (Its §4 "no visible change except focus ring" claim is **superseded by D-02**.)

### Token source of truth
- `.planning/research/STACK.md` — primary source for all token hex values (Cloudscape Visual Refresh → resolved light+dark hex, WCAG-verified); the `color-mix()` FF-113-vs-FF-109 floor note (Phase 1 uses none).

### Requirements & success criteria
- `.planning/ROADMAP.md` → "Phase 1: Design System Foundation" — Goal + Success Criteria **SC1–SC5**; and "Open Design Decisions" (#1 per-profile color [Phase 2/4], #2 toggle placement [Phase 4], #3 3-state shape [Phase 4] — all out of scope for Phase 1).
- `.planning/REQUIREMENTS.md` — **FND-01, FND-02, FND-03, FND-04, THM-03, THM-05** (the 6 requirements Phase 1 delivers).
- `.planning/STATE.md` → "Accumulated Context → Decisions" — locked foundation rules.

### Research / pitfalls
- `.planning/research/PITFALLS.md` — UI-SPEC-cited pitfalls: **#1** (inline-script CSP → external `theme-init.js`), **#5** (no bundled webfont), **#6** (cross-browser scrollbars / `color-scheme`), **#7** (`:focus-visible`), **#8** (no manifest/permission change → fast store review), **#10** (no new icon deps).
- `.planning/research/SUMMARY.md` — research synthesis ("Gaps").

### Codebase maps
- `.planning/codebase/STRUCTURE.md` — repo layout (`src/`, `bin/`, `test/`; `src/css/` is new).
- `.planning/codebase/TESTING.md` — test infra: Mocha unit (`src/js/**/*.test.js`) + Playwright emulator (`test/emulator/*.spec.js`, Chrome-only); `bin/build_test.sh` builds the test extension; `test/emulator/fixtures.js` exposes `testInOptions` / `testInPopup` / `testInWorker`.
- `.planning/codebase/CONVENTIONS.md` — naming/style (no existing CSS convention — greenfield).

### Source files Phase 1 touches
- `bin/build.sh` — add `\cp -r src/css dist/$brw/` + `\cp -f src/js/theme-init.js dist/$brw/js/theme-init.js` inside the `for brw in chrome firefox` loop.
- `bin/build_test.sh` — add `cp -r src/css $destdir/`; **skip `theme-init.js` in the per-file Rollup loop and copy it verbatim**; also copy the new preview page into the test output (D-01).
- `src/popup.html`, `src/options.html`, `src/credits.html`, `src/supporters.html`, `src/updated.html` — `<head>` wiring (script-first + `<link>` chain). Inline `<style>` / `.darkMode` removal is **Phases 2–3, not here**.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **No existing CSS files** — all current styling is inline `<style>` per HTML page; `src/css/{tokens,base,components}.css` is greenfield (no CSS naming convention to match).
- **Playwright emulator harness** (`test/emulator/fixtures.js`: `testInOptions`, `testInPopup`, `testInWorker`; persistent Chrome extension context) — reuse for the new foundation preview spec (D-01). Existing specs: `options.spec.js`, `keyboard_navigation.spec.js`, `keyboard_edge_cases.spec.js`, `supporters.spec.js`, `worker.spec.js`.
- **`bin/build_test.sh` per-file Rollup loop** — the place the UI-SPEC flagged for the `theme-init.js` verbatim-copy skip; same area where the preview page + CSS copy land for the test build.

### Established Patterns
- **Static-copy build path** — `content.js`, `*.html`, `icons/` are copied verbatim in `build.sh`'s `for brw in chrome firefox` loop; Rollup bundles only ESM entry points. CSS + `theme-init.js` follow this exact path (FND-03).
- **Existing FOUC bug the engine replaces** — theme applied post-`window.onload` inside an async `chrome.storage` `.then()`: `popup.js:76–79`, `options.js:194/220`; `.darkMode` class on `<body>`: `popup.js:79`, `options.js:195/197/221`. Phase 1 introduces the pre-paint `data-theme`-on-`<html>` path; removing `.darkMode` / inline styles is per-surface in Phases 2–3.
- **WebKit-only scrollbar styling** — `::-webkit-scrollbar` at `popup.html:119–127`; `scrollbar-width: thin` at `popup.html:52`. `color-scheme` per theme (THM-05) closes the Firefox/Edge gap; UI-SPEC foundation default is to rely on `color-scheme` and keep `scrollbar-width: thin`.
- **Source-order insulation (verified)** — an inline `<style>` placed after the `<link>` chain wins for equal specificity; this is the mechanism that protects popup from reset bleed (D-02).

### Integration Points
- `<head>` of all 5 HTML pages — `theme-init.js` first, then `tokens.css` → `base.css` → `components.css` (per-surface sheets added Phases 2–3). `credits.html` / `updated.html` currently have no `<head>` script and **gain** one. `popup.html` also gains `<!DOCTYPE html>` + `<meta charset>`.
- `bin/build.sh` + `bin/build_test.sh` — emit `dist/<brw>/css/*.css`, `dist/<brw>/js/theme-init.js`, and (test build only) the preview page.
- No manifest / `rollup.config.js` / permission / host changes (PITFALLS #8 — fast store review).
</code_context>

<specifics>
## Specific Ideas

- The preview page should render the **full component-shell set** (per SC2's list), so it functions as the visual contract Phases 2–3 build against — not a token-only swatch sheet.
- Keep Playwright assertions on **computed styles / attribute presence** (theme-driven), **not pixel snapshots**, to avoid brittleness against the still-evolving surfaces.
</specifics>

<deferred>
## Deferred Ideas

None new from this discussion — it stayed within phase scope. (Already deferred elsewhere and explicitly out of Phase 1: ROADMAP "Open Design Decisions" #1 per-profile color × dark-mode [Phase 2/4], #2 theme-toggle placement [Phase 4], #3 3-state toggle shape [Phase 4] — Phase 1 only exposes the token hooks, makes no decision; and the v2 `EDP-*` / `THP-*` / `POP-07..09` polish items.)
</deferred>

---

*Phase: 1-design-system-foundation*
*Context gathered: 2026-05-27*
