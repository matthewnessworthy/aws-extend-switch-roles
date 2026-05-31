# Roadmap: AWS Extend Switch Roles — UI Modernization

## Overview

This is a presentation-layer-only milestone: a Cloudscape-native visual + interaction redesign of every UI surface (popup, options, supporters, credits, updated) with light/dark theming, hand-authored CSS, and **zero new runtime dependencies**. No role-switch flow, storage schema, IndexedDB, OAuth, WAR/content-script, or per-profile config-key (`color`/`image`/`region`) changes. The build follows **horizontal layers**: a shared design-token + theming foundation (the gate) first, then the system is applied surface-by-surface (popup, then options/aux), then the manual theme toggle is wired with per-profile color reconciliation, and finally a single accessibility + cross-browser + release-prep audit. Accessibility (visible focus, AA contrast, labels/roles) is baked into each surface as it is built; Phase 5 is the *audit and release pass*, not the first time a11y is considered. Core value: a modern, AWS-console-native extension UI with **zero regression** on any must-keep capability.

## Open Design Decisions

These are deferred to the UI-phase / planning of the relevant phase. Recommended leans come from research (SUMMARY.md "Gaps", PITFALLS.md Pitfall 4). None block roadmap approval.

1. **Per-profile `color` × dark-mode rendering strategy** (affects POP-06 in Phase 2 **and** OPT-06 in Phase 3 — it is a *shared rendering rule*, so it must be decided in the UI-phase **before Phase 2 planning**, not re-litigated in Phase 3). Lean: **Option E** — render the chip with the user's exact stored hex as the fill and a theme-aware 1px contrast border/outline (border owns contrast, zero color math, zero data mutation). Fall back to Option A (per-theme luminance adjust) only if a fill-only requirement rules out a border; never Option B (destroys grays). The stored value and the out-of-scope console-header path are never mutated.
2. **Theme-toggle placement** (Phase 4). Lean: authoritative control on the **options page**; the popup **reflects** the saved theme rather than adding a second control to the cramped 600×600 surface.
3. **Theme-toggle shape — 3-state preservation** (Phase 4). Lean: preserve the existing 3-state "Visual mode" semantics (Browser default / Light / Dark) as a polished segmented control; persist in the **existing `chrome.storage.sync['visualMode']` key** (do not split across keys/areas, do not silently drop OS-follow). If a luminance strategy is chosen for decision #1, note the `color-mix()` Firefox-113 floor vs the FF-109 manifest minimum; Option E sidesteps this.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Design System Foundation** - Token system, pre-paint theming engine, and build/plumbing — the gate everything inherits from (completed 2026-05-28)
- [x] **Phase 2: Popup Surface** - Apply the design system to the popup (role list, filter, states, swatch) within 600×600 (completed 2026-05-28)
- [x] **Phase 3: Options & Auxiliary Surfaces** - Apply the design system to options (editor, controls, color picker, Config Hub) and the supporters/credits/updated pages (completed 2026-05-28)
- [x] **Phase 4: Theme Toggle & Per-Profile Color** - Wire the persisted 3-state toggle with live update, and reconcile per-profile color with dark mode (completed 2026-05-28)
- [x] **Phase 5: Accessibility, Cross-Browser & Release Audit** - Final WCAG 2.1 AA audit, Firefox/Edge smoke, and store/release prep (completed 2026-05-29)

## Phase Details

### Phase 1: Design System Foundation

**Goal**: A shared, Cloudscape-derived CSS design-token system and a FOUC-free pre-paint theming engine exist and are wired into every surface and both builds — the gate that all surface work inherits from.
**Depends on**: Nothing (first phase)
**Requirements**: FND-01, FND-02, FND-03, FND-04, THM-03, THM-05
**Success Criteria** (what must be TRUE):

  1. `tokens.css` defines the full Cloudscape Visual Refresh palette (color, type, spacing, radius, elevation) for **both** light and dark via the `:root` → `@media(prefers-color-scheme:dark)` → `:root[data-theme]` cascade; no `@cloudscape-design/*` (incl. `design-tokens`), no framework, no bundled webfont (system font stack), and toggling `data-theme` on `<html>` in devtools visibly re-skins a test element in both themes.
  2. `base.css` + `components.css` provide reset/typography/layout primitives and reusable components (buttons, inputs, role-list item, panes, status/empty/loading/error states, tokenized `:focus-visible` ring), all consuming `var(--token)` only — a sample page rendered with base+components alone looks correct in both themes.
  3. The pre-paint theme setter is an **external, non-module** `theme-init.js` placed **first in `<head>`** that sets `data-theme` on `<html>` from a synchronous `localStorage` read before first paint — there is **no flash of the wrong theme** on any of the 5 pages on load (the existing FOUC bug is fixed), and zero CSP violations appear in the Chrome and Firefox console (no inline script, no CSP relaxation).
  4. `color-scheme` is set per theme on `:root` so native controls and scrollbars follow the active theme on Chrome, Firefox, and Edge; all 5 `<head>`s are wired (script + `<link>` chain; `credits.html`/`updated.html` gain a script).
  5. `bin/build.sh` (copy `src/css/` + `src/js/theme-init.js` verbatim in the `for brw` loop) and `bin/build_test.sh` (`cp -r src/css`) are updated so the build emits `dist/<brw>/css/*.css` and `dist/<brw>/js/theme-init.js`; no manifest, `rollup.config.js`, permission, or host change.

**Plans**: 5 plans
**Wave 1**

- [x] 01-01-PLAN.md — Wave 0: Test scaffolds (test/preview/index.html, foundation.spec.js, testInPreview fixture)
- [x] 01-02-PLAN.md — Wave 1: Token layer + pre-paint engine (src/css/tokens.css, src/js/theme-init.js)
- [x] 01-03-PLAN.md — Wave 1: Base reset + component shells (src/css/base.css, src/css/components.css)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-04-PLAN.md — Wave 2: HTML <head> wiring on all 5 pages + D-02 spec audit
- [x] 01-05-PLAN.md — Wave 2: Build pipeline (bin/build.sh, bin/build_test.sh) + smoke test

**UI hint**: yes

### Phase 2: Popup Surface

**Goal**: The popup is fully restyled to the Cloudscape-native treatment in both themes within its 600×600 cap, with clear interaction states and preserved keyboard navigation — with zero regression to the brittle test selectors or the role-switch flow.
**Depends on**: Phase 1
**Requirements**: POP-01, POP-02, POP-03, POP-04, POP-05, POP-06
**Success Criteria** (what must be TRUE):

  1. The popup role list, filter, and chrome render in the Cloudscape-native treatment in **both** light and dark themes within the 600×600 cap, with long role names / account IDs truncating gracefully and the filter usable at minimum width; the popup's inline `<style>` block is replaced by `popup.css` consuming tokens (no `.darkMode` class, no per-page palette).
  2. The popup shows distinct **empty states** ("not on an AWS console page" vs "on an AWS page but no matching roles," each with guidance), a **loading state** while roles resolve, and an error state.
  3. Existing keyboard navigation (`Ctrl+Shift+,`, arrow-key list nav, type-to-filter) is preserved and clearly **focus-visible** (`:focus-visible`) in both themes; the role-list show/hide still uses the inline `display` toggle so `#roleList li[style*="block"]` / `li:not([style*="none"])` selectors and IDs (`#roleFilter`, `#roleList li.selected`) still match.
  4. The per-profile color swatch renders **legibly and AA-contrasted in both themes** (render-only via the chosen swatch rule — see Open Design Decision #1; stored value and console-header behavior unchanged), and AA contrast is met across popup text/UI in both themes.
  5. `npm test` (jsdom) **and** `npm run test_emulator` (Playwright) pass — or the relevant specs are updated deliberately in the same PR; nothing is imported, styled, or routed through `lib/content.js` / `lib/auto_assume_last_role.js`.

**Plans**: 3 plans
**Wave 1** *(all parallel — no file overlap)*

- [x] 02-01-PLAN.md — Wave 1: popup.css (new) + popup.html update (remove inline style block, link popup.css, strip filter inline style, add sidebar break)
- [x] 02-02-PLAN.md — Wave 1: create_role_list_item.js two-line DOM (D-02) + test assertions updated
- [x] 02-03-PLAN.md — Wave 1: popup.js typed state renderers (D-05/D-06/D-07) + darkMode removal + loading state

**UI hint**: yes

### Phase 3: Options & Auxiliary Surfaces

**Goal**: The options page (containers/cards, form controls, INI editor, alerts, storage selector, color picker, Config Hub controls) and the supporters/credits/updated pages are fully restyled to the token system in both themes — completing "every surface styled in both themes" with the role-switch/config flows untouched.
**Depends on**: Phase 2
**Requirements**: THM-01, OPT-01, OPT-02, OPT-03, OPT-04, OPT-05, OPT-06, OPT-07, AUX-01
**Success Criteria** (what must be TRUE):

  1. The options page is restyled to Cloudscape-native containers/cards, header, and layout; all form controls (text inputs, radios, checkboxes, buttons, selects) are restyled consistently; the supporters, credits, and updated pages are restyled to the token system. After this phase, **every** surface is fully styled in both themes (THM-01) — setting `data-theme` via devtools renders all 5 pages correctly in light and dark, with no `.darkMode` class or inline `<style>` palette remaining.
  2. The INI editor is polished (monospace, framed as an editor) and **retained as the single source of truth**; save/parse outcomes show as Cloudscape-style alerts and parse errors include the line number the parser already returns.
  3. The Sync/Local storage-area selector is restyled with the existing "forced Local when config received from a sender" warning preserved; the color picker is restyled and **theme-aware in both themes** (same swatch rule as Open Design Decision #1); Config Hub connect/disconnect controls and result messages are restyled (PKCE flow untouched).
  4. All `<label for>` associations and ARIA roles/names are preserved, every interactive element is **focus-visible** in both themes, AA contrast is met in both themes, and the Firefox-unsupported tab-grouping control remains disabled (not rendered as enabled).
  5. `npm test` + `npm run test_emulator` pass — or the relevant specs (`options.spec.js`, `supporters.spec.js`, IDs like `#awsConfigTextArea`/`#saveButton`/`#msgSpan`/`#configStorage*RadioButton`/`#textareaKeyCode`) are updated deliberately in the same PR; nothing routes through `lib/content.js` / `lib/auto_assume_last_role.js`.

**Plans**: 3 plans
**Wave 1**

- [x] 03-01-PLAN.md — Wave 1: Token gap fix (--color-bg-button-primary-hover dark layers) + components.css alert variants

**Wave 2** *(blocked on Wave 1 completion; Plans 02 and 03 run in parallel)*

- [x] 03-02-PLAN.md — Wave 2: options.css (new) + options.html wiring + options.js updateMessage()/darkMode refactor
- [x] 03-03-PLAN.md — Wave 2: pages.css (new) + supporters/credits/updated HTML wiring

**UI hint**: yes

### Phase 4: Theme Toggle & Per-Profile Color

**Goal**: The existing "Visual mode" radios drive a persisted, write-through, live-updating theme toggle, and per-profile `color` is reconciled with the dark theme at render time — with zero stored-data migration.
**Depends on**: Phase 3
**Requirements**: THM-02, THM-04
**Success Criteria** (what must be TRUE):

  1. The 3-state "Visual mode" semantics (Browser default / Light / Dark) are **preserved**; a manual choice overrides the OS preference, persisted in the **existing `chrome.storage.sync['visualMode']` key** (not split across keys/areas).
  2. Toggling the theme on the options page writes through to both `chrome.storage.sync` (canonical, cross-device) and `localStorage` (pre-paint cache) and applies `data-theme` on `<html>` immediately; an already-open popup/page **live-updates** via `storage.onChanged` (no reload).
  3. Theme choice follows the user across devices; on load, cross-device drift between the sync canonical value and the `localStorage` cache **reconciles with at most one repaint**.
  4. The per-profile `color` × dark-mode rendering rule (Open Design Decision #1) is implemented **at render only** — the stored hex is never mutated and the console-header path is never touched; the swatch/preview renders acceptably in both themes (verified AA in Phase 5).

**Plans**: 3 plans
**Wave 1**

- [x] 04-01-PLAN.md — Wave 1: src/js/lib/theme.js helper + unit tests + Playwright visual_mode.spec.js

**Wave 2** *(blocked on Wave 1 completion; Plans 02 and 03 run in parallel)*

- [x] 04-02-PLAN.md — Wave 2: options.js write-through + post-load reconcile + listener
- [x] 04-03-PLAN.md — Wave 2: popup.js post-load reconcile + listener + SC#4 human verify

**UI hint**: yes

### Phase 5: Accessibility, Cross-Browser & Release Audit

**Goal**: A final audit confirming WCAG 2.1 AA across all surfaces and the derived per-profile color variants, cross-browser visual parity, and store/release readiness — the checks that can only run once all surfaces and the color derivation (Phase 4) exist.
**Depends on**: Phase 4
**Requirements**: A11Y-01, A11Y-02, A11Y-03, A11Y-04, A11Y-05
**Success Criteria** (what must be TRUE):

  1. Every interactive element has a visible `:focus-visible` indicator in **both** themes, and all controls have accessible labels/roles/names (filter input, icon-only buttons, role-list semantics, theme control) — verified across all surfaces.
  2. WCAG 2.1 AA contrast is met in **both** themes across all tokens **and** the rendered/derived per-profile `color` variants (4.5:1 body text, 3:1 large/UI).
  3. The full `npm test` + `npm run test_emulator` suite is green (DOM selectors preserved, or specs updated in the same change), confirming no keyboard-nav or behavior regression.
  4. Visual parity is verified by **manual smoke test on Chrome, Firefox, and Edge in both themes** (native scrollbars/checkboxes/textarea included), since the Playwright emulator is Chrome-only.
  5. Release prep is complete: store screenshots/tiles re-shot for all **three** stores (light + dark), AMO reproducible-build source + pinned build steps prepared, packaged archive size sanity-checked, and **no permission or host diff** vs the existing manifest (keeps the fast review path).

**Plans**: 3 plans
**Wave 1**

- [x] 05-01-PLAN.md — Wave 1: ARIA label gaps (popup.html, options.html, supporters.html) + contrast fixes (tokens.css, create_role_list_item.js + test) + axe-core decision

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 05-02-PLAN.md — Wave 2: Full test suite run + axe spec (if chosen) + Firefox/Edge manual smoke

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 05-03-PLAN.md — Wave 3: Build + archive + manifest diff + size check + store screenshots + AMO source zip

**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Design System Foundation | 5/5 | Complete   | 2026-05-28 |
| 2. Popup Surface | 3/3 | Complete   | 2026-05-28 |
| 3. Options & Auxiliary Surfaces | 3/3 | Complete    | 2026-05-28 |
| 4. Theme Toggle & Per-Profile Color | 3/3 | Complete    | 2026-05-28 |
| 5. Accessibility, Cross-Browser & Release Audit | 3/3 | Complete    | 2026-05-29 |
