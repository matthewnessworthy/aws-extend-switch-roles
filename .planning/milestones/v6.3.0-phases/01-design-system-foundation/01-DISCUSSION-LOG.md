# Phase 1: Design System Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-27
**Phase:** 1-design-system-foundation
**Areas discussed:** Foundation Verification & Demo Vehicle, Phase-1 Visible-Footprint Contract (reset bleed)

> Note: this phase was heavily pre-specced by an approved `01-UI-SPEC.md` (token values, cascade, `theme-init.js`, `color-scheme`, file layout, `<head>` wiring, build edits). Those were treated as LOCKED and not re-discussed. Only the two genuinely-open areas below were surfaced. Class-naming convention and component-shell completeness were deliberately NOT asked (planner/architecture territory).

---

## Foundation Verification & Demo Vehicle

Phase 1 has no real surface to apply tokens to (popup/options come in Phases 2–3), yet SC1–SC3 require proving tokens + shells render in both themes with no FOUC. What artifact demonstrates + verifies that?

| Option | Description | Selected |
|--------|-------------|----------|
| Preview page + Playwright | Committed preview/gallery page (in test tree, NOT src/, excluded from dist/) rendering every token + shell; doubles as the living visual contract for Phases 2–3 AND a Playwright fixture for automated per-theme computed-style + CSP/FOUC assertions. | ✓ |
| Automated fixture only | Minimal fixture built only by `build_test.sh` + Playwright spec asserting light vs dark computed styles and no CSP violations; no human-facing gallery. | |
| Manual devtools only | No committed artifact; toggle `data-theme` in devtools, eyeball both themes, watch console for CSP/FOUC. Lightest; no regression guard. | |

**User's choice:** Preview page + Playwright
**Notes:** Page lives in the test tree (not `src/`) so `build.sh`'s `src/*.html` copy never ships it; `build_test.sh` copies it into the test extension so Playwright can navigate to it at `chrome-extension://…`. Automated assertions cover SC1 (per-theme computed-style delta), SC2 (shells render in both themes), SC3 (zero CSP violations + pre-paint theme attribute set before paint). Playwright is Chrome-only → Firefox/Edge parity stays manual under Phase 5.

---

## Phase-1 Visible-Footprint Contract (reset bleed)

`base.css` ships a global reset and links into all 5 pages in Phase 1 while their old inline `<style>` stays until Phases 2–3. What's the visible-footprint contract on not-yet-restyled surfaces?

| Option | Description | Selected |
|--------|-------------|----------|
| Strict — focus-ring only | Scope `base.css`'s reset behind an opt-in hook so it can't touch a surface until that surface's phase; Phase 1 ships only globally-safe bits. Guarantees "no visible change except focus ring"; more plumbing; mildly deviates from UI-SPEC's literal "base.css = shared reset". | |
| Accept harmless bleed | Ship the global reset on all 5 pages now (UI-SPEC's literal design). popup unaffected; options/credits/updated get a minor body-font shift finalized in Phase 3. Simpler; a small visible delta beyond the focus ring; may trip existing specs. | ✓ |

**User's choice:** Accept harmless bleed
**Notes:** Verified empirically before asking — `popup.html` already declares `* {box-sizing}` (line 4) + `body {font-family}` (lines 6–10) and its inline `<style>` follows the new `<link>` chain in source order → inline wins → popup unaffected. `options.html` / `credits.html` / `updated.html` have no `body` font-family → system font bleeds onto their `body` in Phase 1; `supporters.html` already uses an `-apple-system,…` stack → effectively unchanged. **Consequence:** supersedes UI-SPEC §4's "no other visual change except focus ring" claim; planner must adjust the Phase-1 visible-delta verification note and check `options.spec.js` / `supporters.spec.js` (and any credits/updated coverage) for assertions that shift, updating specs in-PR.

---

## Claude's Discretion

- `components.css` class-naming convention (namespaced `.aesr-*` vs plain `.button` vs BEM) — planner picks; token custom-property names remain LOCKED by the UI-SPEC.
- Component shell completeness / granularity (polished vs skeletal) — planner judgment, informed by Phase 2/3 needs and the preview page.
- Exact preview-page directory + spec filename within the test tree (likely `test/emulator/…` to match existing convention).
- `--color-bg-button-primary-hover` (dark) — "(derived)" in the UI-SPEC, explicitly deferred to Phase 2.

## Deferred Ideas

None new — discussion stayed within phase scope. Already deferred elsewhere (out of Phase 1): ROADMAP "Open Design Decisions" #1 per-profile color × dark-mode [Phase 2/4], #2 theme-toggle placement [Phase 4], #3 3-state toggle shape [Phase 4] (Phase 1 only exposes token hooks); and the v2 `EDP-*` / `THP-*` / `POP-07..09` polish items.
