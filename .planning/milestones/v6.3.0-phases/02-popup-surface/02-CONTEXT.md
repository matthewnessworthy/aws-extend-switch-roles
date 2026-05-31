# Phase 2: Popup Surface - Context

**Gathered:** 2026-05-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Apply the Phase 1 token system to the popup — role list, filter, interaction states (loading / empty / error), and per-profile color swatch — within the 600×600 cap, in both light and dark themes. Replaces the inline `<style>` block and `.darkMode` class with `popup.css` consuming tokens. Zero regression on the role-switch flow, keyboard navigation, and brittle Playwright/jsdom test selectors. `create_role_list_item.js` gets a minor DOM update for the two-line item layout.

Delivers: `src/css/popup.css`, updates to `src/popup.html` (remove inline `<style>`, link `popup.css`), minor update to `src/js/lib/create_role_list_item.js` (two-line item DOM), updates to `src/js/popup.js` (state content), and `build.sh` / `build_test.sh` edits to copy `popup.css`.

</domain>

<decisions>
## Implementation Decisions

### Color Swatch Rule (POP-06 — shared with OPT-06 in Phase 3)

- **D-01: Option E confirmed — exact hex fill + 1px theme-aware contrast border.** Render the stored profile hex as-is for the swatch fill. Apply a 1px border using theme-aware token values to own the contrast. Zero color math, zero data mutation. The stored hex value and the out-of-scope console-header path are never touched. This rule is shared with OPT-06 (Phase 3 options page color picker) — Phase 3 MUST NOT re-litigate it.
- **D-01a (Claude's discretion):** Border implementation details (semi-transparent alpha tokens vs explicit hex per theme, exact values) — planner picks from `STACK.md` token palette; either approach is acceptable.

### Role List Item Anatomy

- **D-02: Two-line layout.** Role name on line 1 (bold / primary weight), account ID on line 2 (smaller, muted secondary color). `create_role_list_item.js` needs a minor DOM update to wrap the two pieces in separate elements so CSS can stack them. Current `suffixAccountId` inline pattern is replaced.
- **D-03: Rounded-square swatch (~4px radius).** Use `var(--radius-xs)` from the token system. No full circle; no hard square. `hidesAccountId` flag: second line is simply absent — no special state needed.

### Sidebar Nav Panel

- **D-04: Keep two-column layout, reskin only.** The `mainPane` + sidebar flex structure is unchanged. `.optionMenu` and its `<li>/<a>` DOM is unchanged — apply Cloudscape tokens (color, hover, focus, spacing) only. No new DOM structure.
- **D-04a (Claude's discretion):** Whether to add a subtle divider after "Configuration" or any other grouping — planner picks based on what reads as Cloudscape-native at that column width.

### Empty & Loading States

- **D-05: "Not on AWS page" message:** `"Navigate to the AWS console to switch roles."` Plain text, no outbound link.
- **D-06: "On AWS page, no matching roles" message:** A short message plus a CTA link to Configuration. The CTA reuses the `#openOptionsLink` navigation path already in `popup.js` — no new permission or flow required. Exact copy: planner writes; the requirement is that a clickable "Open Configuration" (or equivalent) link is present.
- **D-07: Loading state:** CSS-only spinner (from the Phase 1 `components.css` spinner shell) + `"Loading roles…"` label text. No skeleton rows.

### Claude's Discretion
- Exact contrast border token values / approach for the swatch (D-01a)
- Sidebar grouping/dividers (D-04a)
- Two-line item DOM structure (wrapper class names, element types) within the `create_role_list_item.js` update
- Exact loading state and empty state container structure (whether `#noMain` is reused with state classes, or split into separate elements)
- `popup.css` class naming convention (follow the `aesr-` prefix convention from `components.css`)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 1 design contract (read FIRST)
- `.planning/phases/01-design-system-foundation/01-UI-SPEC.md` — LOCKED token values, 3-layer cascade, `data-theme` mechanism, `color-scheme`, file layout, `<head>` wiring. Phase 2 `popup.css` links after `components.css`.

### Token source of truth
- `.planning/research/STACK.md` — primary source for all token hex values (Cloudscape Visual Refresh, light + dark, WCAG-verified); used by D-01a to pick swatch border values.

### Requirements & success criteria
- `.planning/ROADMAP.md` → "Phase 2: Popup Surface" — Goal + Success Criteria SC1–SC5; Open Design Decision #1 (swatch rule, now locked as D-01).
- `.planning/REQUIREMENTS.md` — **POP-01, POP-02, POP-03, POP-04, POP-05, POP-06** (the 6 requirements this phase delivers).
- `.planning/STATE.md` → "Accumulated Context → Decisions" — foundation rules from Phase 1.

### Phase 1 CONTEXT (prior decisions)
- `.planning/phases/01-design-system-foundation/01-CONTEXT.md` — D-01 (preview page/Playwright spec), D-02 (reset bleed + source-order insulation for popup), component shell set from SC2 (spinner shell available in Phase 2).

### Research / pitfalls
- `.planning/research/PITFALLS.md` — Pitfall #4 (per-profile color × dark mode — now resolved as D-01).

### Codebase maps
- `.planning/codebase/TESTING.md` — test infra; Playwright brittle selectors: `#roleList li[style*="block"]`, `li:not([style*="none"])`, `#roleFilter`, `#roleList li.selected` — **these must not change**.
- `.planning/codebase/CONVENTIONS.md` — naming/style conventions Phase 2 follows.

### Source files Phase 2 touches
- `src/popup.html` — remove inline `<style>` block and `.darkMode` rules; link `popup.css` after `components.css`.
- `src/css/popup.css` — new file; all popup-specific styles (role list, filter, swatch, sidebar, states).
- `src/js/lib/create_role_list_item.js` — DOM update for two-line item layout (D-02).
- `src/js/popup.js` — update state content strings (D-05, D-06, D-07) and remove `.darkMode` class mutations (`popup.js:79`, `options.js:195/197/221` — popup.js only; options.js is Phase 3).
- `bin/build.sh` — add `popup.css` to the copy loop (alongside `tokens.css`, `base.css`, `components.css`).
- `bin/build_test.sh` — same copy addition for the test build.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Phase 1 CSS spinner shell** (`components.css`) — Phase 1 D-01 commits a CSS-only spinner shell in `components.css`; Phase 2 composes it for the loading state (D-07). No new CSS required for the spinner itself.
- **`#openOptionsLink` navigation** — `popup.js` already wires this link to open the options page; the "no matching roles" CTA (D-06) reuses this exact path rather than adding a new one.
- **`create_role_list_item.js:createDisplayName()`** — the 64-char truncation logic already handles POP-02 (graceful truncation); the two-line DOM change (D-02) must not break this function's output.

### Established Patterns
- **Show/hide via inline `display` style** — `#main` and `#noMain` are toggled with `element.style.display = 'block'/'none'`; the Playwright brittle selectors (`li[style*="block"]`, `li:not([style*="none"])`) depend on this pattern remaining. Do not replace with CSS classes for show/hide.
- **`.darkMode` class removal** — `popup.js:79` adds `.darkMode` to `<body>` based on `chrome.storage.sync`; Phase 2 removes this mutation and relies on the `data-theme` on `<html>` set by `theme-init.js`. The `data-theme` path is already live from Phase 1.
- **Source-order insulation (D-02 from Phase 1)** — `popup.html` inline `<style>` currently sits AFTER the Phase 1 `<link>` chain and wins on equal specificity. When Phase 2 removes the inline block, `popup.css` becomes the sole popup stylesheet; no insulation dance needed.
- **WebKit scrollbar** — `popup.html:119–127` has webkit scrollbar styles; `scrollbar-width: thin` at line 52. Phase 2 moves these to `popup.css` and ensures `color-scheme` from Phase 1 handles Firefox/Edge.

### Integration Points
- `src/popup.html` — `<head>` wiring: `theme-init.js` → `tokens.css` → `base.css` → `components.css` → `popup.css` (new). Inline `<style>` block removed.
- `src/js/popup.js` — remove `.darkMode` toggle; update `#noMain`/`#main` state-setting code to set state-specific content (D-05/D-06/D-07).
- `src/js/lib/create_role_list_item.js` — DOM change for two-line layout; `headSquare` border added (D-01); must preserve `anchor.dataset.*` values and `anchor.onclick` handler (Playwright + role-switch flow depend on these).

</code_context>

<specifics>
## Specific Ideas

- **State copy locked:** "Navigate to the AWS console to switch roles." (not on AWS page); message + "Open Configuration" CTA link (on AWS, no matching roles); "Loading roles…" with spinner (loading).
- **Swatch treatment:** exact hex fill + 1px border; the border provides all contrast — no overlay, no opacity layer on the fill.
- **Two-line items:** role name is the primary identifier (bold); account ID is secondary. When `hidesAccountId` is true, the second line is simply omitted — no placeholder.
- **Brittle selectors are hard constraints:** `#roleFilter`, `#roleList li.selected`, `li[style*="block"]` / `li:not([style*="none"])` must survive unchanged. Any refactor of show/hide logic must keep the inline `style` toggle.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

(Already deferred elsewhere: theme-toggle placement and 3-state shape → Phase 4; per-profile `color` × console-header interaction → out of scope for the whole milestone; a11y audit → Phase 5; v2 popup polish items POP-07/08/09 from REQUIREMENTS.md.)

</deferred>

---

*Phase: 2-popup-surface*
*Context gathered: 2026-05-28*
