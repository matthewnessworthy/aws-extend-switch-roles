# Requirements: AWS Extend Switch Roles — UI Modernization

**Defined:** 2026-05-27
**Core Value:** A modern, AWS-console-native extension UI with zero regression on any must-keep capability.

> **Scope:** Presentation-layer only. Every v1 requirement is about *presenting existing capabilities better* — no changes to the role-switch flow, storage schema, IndexedDB, OAuth/Config Hub flow, WAR/content scripts, or per-profile config-key semantics. The raw INI `<textarea>` is kept and polished, not replaced.

## v1 Requirements

Requirements for this milestone. Each maps to a roadmap phase.

### Foundation

- [ ] **FND-01**: A shared CSS design-token system (custom properties for color, type, spacing, radius, elevation) is consumed by every surface
- [ ] **FND-02**: Tokens are hand-derived from the AWS Cloudscape Visual Refresh palette (light + dark), with no `@cloudscape-design/*` package (including the CSS-only `design-tokens`) and no JS/CSS framework
- [ ] **FND-03**: CSS ships as static files copied into both Chrome and Firefox builds (`bin/build.sh` and `bin/build_test.sh` updated); not routed through Rollup
- [ ] **FND-04**: Typography uses a system font stack — no bundled webfont

### Theming

- [x] **THM-01**: Every surface is fully styled in both light and dark themes
- [ ] **THM-02**: The existing 3-state "Visual mode" (Browser default / Light / Dark) is preserved; a manual choice overrides the OS preference
- [ ] **THM-03**: No flash of the wrong theme on popup or options load (FOUC eliminated via a pre-paint, non-module `theme-init.js`)
- [ ] **THM-04**: Theme choice persists and follows the user across devices; already-open pages update live when it changes
- [ ] **THM-05**: Native controls and scrollbars follow the active theme on Chrome, Firefox, and Edge (`color-scheme` set per theme)

### Popup

- [ ] **POP-01**: The popup role list is restyled to the Cloudscape-native treatment within the 600×600 cap
- [ ] **POP-02**: Long role names / account IDs truncate gracefully; the filter stays usable at minimum width
- [ ] **POP-03**: The popup shows clear empty states, distinguishing "not on an AWS console page" from "on AWS page but no matching roles," with guidance
- [ ] **POP-04**: The popup shows a loading state while roles resolve
- [ ] **POP-05**: Existing keyboard navigation (`Ctrl+Shift+,`, arrow-key list nav, type-to-filter) is preserved and clearly focus-visible
- [ ] **POP-06**: The per-profile color swatch renders legibly in both themes (render-only; the stored value and console-header behavior are unchanged)

### Options

- [x] **OPT-01**: The options page is restyled to Cloudscape-native containers/cards, header, and layout
- [x] **OPT-02**: Form controls (text inputs, radios, checkboxes, buttons, selects) are restyled consistently
- [x] **OPT-03**: The INI editor is polished — monospace, framed as an editor — and retained as the single source of truth
- [x] **OPT-04**: Save/parse outcomes are shown as Cloudscape-style alerts; parse errors include the line number the parser already returns
- [x] **OPT-05**: The storage-area selector (Sync/Local) is restyled; the existing "forced Local when config received from a sender" warning is preserved
- [x] **OPT-06**: The color picker is restyled and theme-aware
- [x] **OPT-07**: Config Hub connect/disconnect controls and result messages are restyled (the PKCE flow itself is untouched)

### Auxiliary Pages

- [x] **AUX-01**: The supporters, credits, and updated pages are restyled to the token system in both themes

### Accessibility & Cross-Browser

- [ ] **A11Y-01**: Every interactive element has a visible focus indicator (`:focus-visible`) in both themes
- [ ] **A11Y-02**: All controls have accessible labels/roles/names (filter input, icon-only buttons, role list semantics, theme control)
- [ ] **A11Y-03**: WCAG 2.1 AA contrast is met in both themes, including the rendered per-profile color
- [ ] **A11Y-04**: No regression in the existing Playwright/jsdom tests — DOM selectors are preserved, or specs are updated in the same change
- [ ] **A11Y-05**: Visual parity is verified on Chrome, Firefox, and Edge in both themes

## v2 Requirements

Deferred polish. Tracked, not in this milestone's committed scope (pull up if budget allows).

### Editor Polish

- **EDP-01**: Line-number gutter on the INI editor (pure-CSS `counter()` sibling, scroll-synced; read-only)
- **EDP-02**: Save-affordance polish — disabled-until-dirty Save, transient "Saved ✓" confirmation

### Theming Polish

- **THP-01**: Theme control presented as a header sun/moon (or segmented) control with iconography
- **THP-02**: Reduced-motion-aware transitions on theme switch / hover / expand (`prefers-reduced-motion`)

### Popup Polish

- **POP-07**: Role-count / result badge in the popup
- **POP-08**: Empty-state with an actionable CTA (e.g. "Open Configuration")
- **POP-09**: Copy-to-clipboard on the config `<pre>` examples

## Out of Scope

Explicitly excluded. Documented to prevent scope creep (anti-features from research).

| Feature | Reason |
|---------|--------|
| Form-based profile editor / INI⇄form conversion | User chose to keep + polish INI; structured editor is a separate deferred milestone; changes the config-editing model, not just presentation |
| INI syntax highlighting | Requires an overlay/contenteditable hack or a 3rd-party lib — both pull toward replacing the textarea / a new dep |
| Live per-keystroke INI validation | Jank risk on large configs; changes the save-time parse contract |
| Changes to role-switch flow / storage schema / IndexedDB / OAuth-Config Hub flow / WAR & content scripts | Presentation-layer-only mandate; risk-sensitive; existing data must keep working |
| Changes to per-profile config-key semantics (`color`/`image`/`region`) | Backward compatibility required; changing semantics breaks saved configs |
| New switching capabilities / new config keys | This is a redesign, not a feature milestone |
| `@cloudscape-design/*` packages (incl. `design-tokens`), any JS/CSS framework, bundled webfont | Zero-new-deps / minimal-footprint ethos; store-review and CSP friction |
| Styling or extending dead code (`lib/content.js`, `lib/auto_assume_last_role.js`) | Legacy/unreferenced; reference undefined globals |

## Traceability

Which phases cover which requirements. Populated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FND-01 | Phase 1 | Pending |
| FND-02 | Phase 1 | Pending |
| FND-03 | Phase 1 | Pending |
| FND-04 | Phase 1 | Pending |
| THM-03 | Phase 1 | Pending |
| THM-05 | Phase 1 | Pending |
| POP-01 | Phase 2 | Pending |
| POP-02 | Phase 2 | Pending |
| POP-03 | Phase 2 | Pending |
| POP-04 | Phase 2 | Pending |
| POP-05 | Phase 2 | Pending |
| POP-06 | Phase 2 | Pending |
| THM-01 | Phase 3 | Complete |
| OPT-01 | Phase 3 | Complete |
| OPT-02 | Phase 3 | Complete |
| OPT-03 | Phase 3 | Complete |
| OPT-04 | Phase 3 | Complete |
| OPT-05 | Phase 3 | Complete |
| OPT-06 | Phase 3 | Complete |
| OPT-07 | Phase 3 | Complete |
| AUX-01 | Phase 3 | Complete |
| THM-02 | Phase 4 | Pending |
| THM-04 | Phase 4 | Pending |
| A11Y-01 | Phase 5 | Pending |
| A11Y-02 | Phase 5 | Pending |
| A11Y-03 | Phase 5 | Pending |
| A11Y-04 | Phase 5 | Pending |
| A11Y-05 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 28 total (recount: FND 4 + THM 5 + POP 6 + OPT 7 + AUX 1 + A11Y 5 = 28; the prior "27" was a miscount)
- Mapped to phases: 28 / 28 ✓
- Unmapped: 0

**Phase distribution:** Phase 1 (6) · Phase 2 (6) · Phase 3 (9) · Phase 4 (2) · Phase 5 (5)

> **Cross-cutting note:** Accessibility is *built into each surface as it is built* — visible focus, AA contrast, and preserved labels/roles appear as success criteria of Phases 1–4. The A11Y-* requirements themselves are project-wide, audit-level claims that only become verifiable once all surfaces and the per-profile color derivation (Phase 4) exist, so they map to the Phase 5 audit. Phase 5 is the audit, not the first time a11y is considered.

---
*Requirements defined: 2026-05-27*
*Last updated: 2026-05-27 after roadmap creation (traceability populated, 28/28 mapped)*
