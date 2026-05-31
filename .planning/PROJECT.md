# AWS Extend Switch Roles

## What This Is

A browser extension (Chrome MV3, Firefox MV2, Edge) that extends AWS IAM role switching beyond the console's built-in 5-role history. Users configure a list of switchable roles in INI format (mirroring `~/.aws/config`) and switch via a popup menu. **v6.3.0 modernized the look and feel** — a Cloudscape-derived visual + interaction redesign of every UI surface with light/dark theming — without changing any underlying behavior.

## Core Value

A modern, AWS-console-native extension UI with **zero regression** on any must-keep capability.

## Requirements

### Validated

<!-- Existing must-keep capabilities plus v6.3.0 deliveries. These are locked — changing them requires explicit discussion. -->

- ✓ Standard IAM role switching (popup → content script → AWS console switchrole form) — existing
- ✓ Prism / IAM Identity Center (multi-session) role switching — existing
- ✓ INI-format profile configuration (mirrors `~/.aws/config`), validated by the `aesr-config` parser — existing
- ✓ Per-profile `color` and `image` theming of the AWS console header after switch — existing
- ✓ Per-profile `region` override applied on switch — existing
- ✓ Popup role list with text filter, keyboard navigation, and `Ctrl+Shift+,` shortcut — existing
- ✓ Config persistence across `sync` (LZ-compressed, chunked across 8 keys) and `local` storage areas — existing
- ✓ IndexedDB profile cache as primary lookup path, with LZText storage fallback — existing
- ✓ AESR Config Hub remote config via OAuth2 PKCE (golden-key gated) — existing
- ✓ Auto tab-grouping of switched roles (Chrome only, golden-key gated) — existing
- ✓ Cross-browser support: Chrome MV3 service worker, Firefox MV2 background scripts, Edge — existing
- ✓ Color picker widget on the options page — existing
- ✓ Popup redesigned to AWS-console-native (Cloudscape) aesthetic with clear empty/loading/error states — v6.3.0 (Phase 2)
- ✓ Options page redesigned (Cloudscape containers/cards, form controls, INI editor framed, alerts, storage selector, color picker theme-aware, Config Hub controls) — v6.3.0 (Phase 3)
- ✓ Auxiliary pages (supporters, credits, updated) restyled to the shared token system in both themes — v6.3.0 (Phase 3)
- ✓ Shared hand-written CSS design system: 6 files (tokens, base, components, popup, options, pages) consuming `var(--token)` only — v6.3.0 (Phase 1)
- ✓ Light and dark themes with a manual, persisted 3-state toggle (`default`/`light`/`dark`) on the existing `chrome.storage.sync['visualMode']` key, cross-tab live update via `storage.onChanged` — v6.3.0 (Phase 4)
- ✓ Modernized INI config editor (monospace, framed) retained as single source of truth — v6.3.0 (Phase 3)
- ✓ Improved interaction states (empty, loading, error, focus-visible) across all surfaces — v6.3.0 (Phases 2–3)
- ✓ Accessibility baseline: WCAG 2.1 AA contrast, visible focus, labels/roles — v6.3.0 (Phase 5, axe-core spec + manual smoke)
- ✓ Per-profile `color` reconciled with the dark theme via Option E (theme-aware contrast border around stored hex; stored value never mutated) — v6.3.0 (Phase 4, AA-confirmed Phase 5)
- ✓ FOUC-free theming via external pre-paint `theme-init.js` (synchronous `localStorage` read + `data-theme` on `<html>`) — v6.3.0 (Phase 1)
- ✓ Build pipeline ships `src/css/*.css` + `src/js/theme-init.js` as static copy to both Chrome and Firefox dist; no manifest, permission, or host diff — v6.3.0 (Phase 1)

### Active

<!-- Empty — next milestone goals will land here via /gsd-new-milestone. -->

(None — awaiting next milestone goals)

### Out of Scope

<!-- Explicit boundaries with reasoning, to prevent re-adding. -->

- **Form-based profile editor** replacing the INI textarea — user chose to keep + polish INI; a structured editor is deferred
- **Any JS/CSS framework or `@cloudscape-design/*` packages** (including the CSS-only `design-tokens` package) — violates the zero-new-runtime-deps / minimal-footprint ethos
- **Changes to the role-switch flow, storage schema, IndexedDB structure, OAuth flow, or WAR scripts** — v6.3.0 was presentation-only; same constraint applies going forward unless explicitly opened
- **Changes to per-profile config semantics** (`color` / `image` / `region` keys) — backward compatibility required
- **Zen Browser popup-corner overlay** — browser-chrome rendering, not extension-fixable (verified Phase 5; documented in `.planning/todos/pending/firefox-popup-arrow-corner-chrome.md`)

## Context

- **Brownfield, mature extension.** Vanilla JS ESM bundled per-entry by Rollup; CSS shipped as static copy (not Rollup-bundled). Full codebase map lives in `.planning/codebase/`.
- **Existing user base across three stores** (Chrome Web Store, Firefox Add-ons, Edge Add-ons). v6.3.0 ships with zero stored-data migration — existing configs work unchanged.
- **Current product version: 6.3.0** (`manifest.json` / `package.json` / `package-lock.json`). Last published build artifacts were produced at 6.2.1 during Phase 5; actual store publish requires a v6.3.0 rebuild.
- **Pre-paint theme cascade:** `:root` (light) → `@media(prefers-color-scheme: dark) :root` (OS dark) → `:root[data-theme]` (manual override wins). `theme-init.js` is external non-module, first child of `<head>`.
- **Dead code present (do not extend or style):** `src/js/lib/content.js` and `src/js/lib/auto_assume_last_role.js` are legacy/unreferenced.

## Constraints

- **Tech stack**: Stay vanilla — hand-written CSS + minimal JS, **zero new runtime dependencies**.
- **No design-framework packages**: Emulate the Cloudscape design *language* by hand; do **not** import `@cloudscape-design/*` (including the CSS-only `design-tokens`).
- **Backward compatibility**: No regression in role-switch flow, saved configs, popup keyboard nav, or per-profile color/image. Existing stored data must keep working without reconfiguration.
- **MV3 / CSP**: Hand-written CSS must comply with extension CSP — keep styles in bundled/static CSS files; no policy-violating inline-style injection.
- **Cross-browser**: Must render correctly on Chrome (MV3), Firefox (MV2), and Edge.
- **Accessibility**: New/changed UI meets WCAG 2.1 AA contrast, provides visible focus indicators, and preserves keyboard operability.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Emulate Cloudscape design language in hand-written CSS (no `@cloudscape-design/*`, incl. `design-tokens`) | Zero-new-deps / minimal-footprint ethos; smaller bundle; simpler store review | ✓ Good — shipped with 6 hand-written CSS files; no new runtime deps |
| Presentation-layer milestone only — no data model, storage, OAuth, WAR, or core-flow changes | Pins scope, protects backward compatibility, keeps risk low | ✓ Good — zero stored-data migration; existing users unaffected |
| Keep the raw INI editor, polish only (no form-based replacement) | User chose the lowest-risk config-UX option; preserves the power-user paste workflow | ✓ Good — INI editor framed as monospace, retained as single source of truth |
| Light + dark themes via a manual, persisted 3-state toggle (default/light/dark) on existing `chrome.storage.sync['visualMode']` key | User-selected; the AWS console ships both; preserves existing 3-state semantics with no key/area splitting | ✓ Good — write-through to localStorage + sync, cross-tab live update via `storage.onChanged` |
| Per-profile `color` × dark-mode rendering: Option E (theme-aware contrast border around stored hex fill) | Border owns contrast; zero color math; zero data mutation; sidesteps Firefox-113 `color-mix()` floor | ✓ Good — POP-06 and OPT-06 share the rule; AA-verified Phase 5 |
| Pre-paint `theme-init.js` as external non-module first child of `<head>` | Synchronous `localStorage` read before paint eliminates FOUC; no inline script keeps CSP intact; no permission/host diff | ✓ Good — FOUC eliminated across all 5 pages |
| `src/css/` shipped as static copy via `bin/build.sh` (not Rollup-bundled) | Keeps CSS out of the JS module graph; simpler CSP; matches `theme-init.js` shipping model | ✓ Good — Phase 1 build pipeline change held through v6.3.0 |
| Accessibility target WCAG 2.1 AA for new/changed UI | "Modern" in 2026 implies it; keyboard nav is already a must-keep | ✓ Good — axe-core Playwright spec caught 5 items manual review missed; all fixed |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-31 after v6.3.0 UI Modernization milestone closed. 28/28 v1 requirements validated; all milestone decisions marked ✓ Good. Source version bumped to 6.3.0; release artifacts pending rebuild for actual store publish.*
