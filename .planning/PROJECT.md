# AWS Extend Switch Roles

## What This Is

A browser extension (Chrome MV3, Firefox MV2, Edge) that extends AWS IAM role switching beyond the console's built-in 5-role history. Users configure a list of switchable roles in INI format (mirroring `~/.aws/config`) and switch via a popup menu. **This milestone modernizes the look and feel** — a visual and interaction redesign of every UI surface, aligned to AWS's current console (Cloudscape) design language, with light/dark theming — without changing any underlying behavior.

## Core Value

A modern, AWS-console-native extension UI with **zero regression** on any must-keep capability.

## Requirements

### Validated

<!-- Existing, shipped capabilities inferred from the codebase. This is the "must keep working" contract. -->

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

### Active

<!-- The UI modernization milestone. All hypotheses until shipped. -->

- [ ] Popup redesigned to AWS-console-native aesthetic (role list, filter, states)
- [ ] Options page redesigned (config editor, storage-area selection, color picker, Config Hub controls)
- [ ] Auxiliary pages redesigned (supporters, credits, updated)
- [ ] Shared hand-written CSS design system (tokens: color, type, spacing, radius, elevation)
- [ ] Light and dark themes with a manual, persisted toggle
- [ ] Modernized INI config editor — styling, validation feedback, surrounding layout (textarea retained)
- [ ] Improved interaction states across surfaces: empty, loading, error, focus
- [ ] Accessibility baseline for new/changed UI: WCAG 2.1 AA contrast, visible focus, labels/roles
- [ ] Per-profile `color` rendering reconciled with the dark theme (no broken contrast)

### Out of Scope

<!-- Explicit boundaries with reasoning, to prevent re-adding. -->

- **Form-based profile editor** replacing the INI textarea — user chose to keep + polish INI; a structured editor is deferred to a later milestone
- **Any JS/CSS framework or `@cloudscape-design/*` packages** (including the CSS-only `design-tokens` package) — violates the zero-new-runtime-deps / minimal-footprint ethos
- **Changes to the role-switch flow, storage schema, IndexedDB structure, OAuth flow, or WAR scripts** — this is a presentation-layer milestone only
- **New features / new switching capabilities** — this is a redesign, not a feature milestone
- **Changes to per-profile config semantics** (`color` / `image` / `region` keys) — backward compatibility required

## Context

- **Brownfield, mature extension.** Vanilla JS ESM bundled per-entry by Rollup; no UI framework. Full codebase map lives in `.planning/codebase/`.
- **Existing user base across three stores** (Chrome Web Store, Firefox Add-ons, Edge Add-ons) with configs stored in sync/local storage + IndexedDB. The redesign must not force any reconfiguration.
- **Emergent tension — per-profile `color` × dark mode:** users' stored `color` hex values were chosen against the *light* AWS console header; under a dark theme they may have poor contrast or look wrong. Resolution (auto-adjust luminance / treat the value as hue and re-derive lightness per theme / document-and-accept) is to be decided during research and the UI-phase.
- **Theme toggle (proposed default):** lives on the options page, persisted in `chrome.storage.sync` so the preference follows the user across devices like other prefs. The UI-phase confirms final placement.
- **Color picker** (`src/js/lib/color_picker.js`) is an options-page UI element in scope under the options redesign; it intersects the color × dark-mode tension above.
- **Dead code present:** `src/js/lib/content.js` and `src/js/lib/auto_assume_last_role.js` are legacy/unreferenced. Ignore them — do not extend or style anything routed through them.

## Constraints

- **Tech stack**: Stay vanilla — hand-written CSS + minimal JS, **zero new runtime dependencies**. Preserves minimal footprint, simpler store review, and the low-permission ethos stated in the README.
- **No design-framework packages**: Emulate the Cloudscape design *language* by hand; do **not** import `@cloudscape-design/*` (including the CSS-only `design-tokens`).
- **Backward compatibility**: No regression in role-switch flow, saved configs, popup keyboard nav, or per-profile color/image. Existing stored data must keep working without reconfiguration.
- **MV3 / CSP**: Hand-written CSS must comply with extension CSP — keep styles in bundled/static CSS files; no policy-violating inline-style injection.
- **Cross-browser**: Must render correctly on Chrome (MV3), Firefox (MV2), and Edge.
- **Accessibility**: New/changed UI meets WCAG 2.1 AA contrast, provides visible focus indicators, and preserves keyboard operability.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Emulate Cloudscape design language in hand-written CSS (no `@cloudscape-design/*`, incl. `design-tokens`) | Zero-new-deps / minimal-footprint ethos; smaller bundle; simpler store review | — Pending |
| Presentation-layer milestone only — no data model, storage, OAuth, WAR, or core-flow changes | Pins scope, protects backward compatibility, keeps risk low | — Pending |
| Keep the raw INI editor, polish only (no form-based replacement) | User chose the lowest-risk config-UX option; preserves the power-user paste workflow | — Pending |
| Light + dark themes via a manual, persisted toggle | User-selected; the AWS console ships both | — Pending |
| Theme preference persisted in `chrome.storage.sync`, toggle on the options page | Follows the user across devices like other prefs (proposed; UI-phase confirms) | — Pending |
| Accessibility target WCAG 2.1 AA for new/changed UI | "Modern" in 2026 implies it; keyboard nav is already a must-keep | — Pending |

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
*Last updated: 2026-05-28 — Phase 4 complete (theme toggle write-through + live-update wired; per-profile color swatches verified in both themes; THM-02, THM-04 validated)*
