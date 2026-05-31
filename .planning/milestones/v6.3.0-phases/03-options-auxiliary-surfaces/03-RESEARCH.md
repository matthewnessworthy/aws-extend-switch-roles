# Phase 3: Options & Auxiliary Surfaces — Research

**Researched:** 2026-05-28
**Domain:** Browser-extension options page HTML/CSS/JS + auxiliary pages — token application, component authoring, DOM restructure, `.darkMode` removal
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from UI-SPEC — no CONTEXT.md for Phase 3)

No CONTEXT.md was produced for Phase 3. All decisions below are derived from upstream artifacts:
`03-UI-SPEC.md` (approved 2026-05-28), `REQUIREMENTS.md`, `ROADMAP.md`, Phase 2 locked decisions.

### Locked Decisions (from UI-SPEC §Component Inventory, §Layout & Sizing Contract, §Interaction States, §Copywriting Contract)

- **OPT-06 swatch rule:** Reuses Phase 2 D-01 (Option E) — `border: 1px solid var(--color-border-input)` on outer `<input type="color">` chrome. Same token, same rationale. Do NOT re-litigate.
- **Two new CSS files:** `src/css/options.css` (consumed by `options.html` only) and `src/css/pages.css` (consumed by `supporters.html`, `credits.html`, `updated.html`). Scoped to avoid leaking popup styles.
- **`.darkMode` removal:** All `.darkMode .X` CSS rules removed from inline `<style>` blocks in options/supporters/credits/updated. All inline `<style>` blocks replaced with `<link>` references. The `.darkMode` JS toggle in `options.js` (lines 191–198, 220–222) is removed; `syncStorageRepo.set({ visualMode })` write is preserved for Phase 4 wiring.
- **Phase 3 → Phase 4 transitional regression (ACCEPTED):** After stripping the `.darkMode` class toggle from `options.js`, clicking a Visual Mode radio writes to storage but produces NO immediate visual change — page must reload to apply. This is deliberate. Phase 4 restores live update via `data-theme` write + `storage.onChanged`. Planner MUST document this as a Known Limitation so reviewers do not flag it as a bug.
- **`#msgSpan` and `#remoteMsgSpan` tag change:** Both must be changed from `<span>` to `<div>` in `options.html` to allow `.aesr-alert` (block flex) to render correctly. IDs are the Playwright selector contract, not element tags — this change is safe.
- **`updateRemoteFieldsState()` inline-style toggles:** The `style.display` assignments on the 6 Config Hub elements MUST NOT be replaced with CSS class toggling (same contract as Phase 2). See Interaction States section.
- **Heading hierarchy fix:** `<h1>Settings</h1>` → `<h2>`, `<h1>Extension API</h1>` → `<h2>` in `options.html`. The `<h1>Configuration</h1>` (page title) and `<h1>How to configure</h1>` (howto pane) remain `<h1>`.
- **`updateMessage()` refactor:** Must be updated to inject `.aesr-alert` + modifier class instead of bare `<span class="cls">`. Mapping: `'success'` → `.aesr-alert.aesr-alert--success`; `'warn'` → `.aesr-alert.aesr-alert--warning`; error paths → `.aesr-alert.aesr-alert--error`. 2500ms auto-remove for success preserved.
- **Alert variants added to `components.css`:** `.aesr-alert--success` and `.aesr-alert--warning` are shared-file additions (not in `options.css`) because future surfaces may consume them.
- **Firefox tab-grouping control:** `autoTabGroupingCheckBox.disabled = true` and `parentElement.style.textDecoration = 'line-through'` remain in JS. No CSS class alternative for the strikethrough.
- **`supporters.html` script placement:** `<script type="module" src="js/supporters.js">` after `</body>` — preserve placement; do not move to `<head>`.
- **`credits.html` missing `</html>` closing tag:** Fix in Phase 3 as part of inline `<style>` removal (trivial).
- **`options.js` `saveConfiguration` storage-area switch error uses `alert(err.message)`:** Preserve; not a Phase 3 concern. No style token needed.

### Claude's Discretion

- Exact CSS class name for any new Phase 3 wrapper elements not specified in UI-SPEC (follow `aesr-` prefix convention)
- Whether `#howto pre` blocks in `options.html` use class-based `.aesr-pre` or a scoped descendant selector
- Tab vs. space indentation consistency within new CSS files (use tabs — matches Phase 1/2)
- Exact wave decomposition (CSS-only vs CSS+HTML vs CSS+HTML+JS plans)

### Deferred Ideas (OUT OF SCOPE)

- Theme-toggle placement and live update (Phase 4)
- Per-profile color × console-header interaction (out of scope for the whole milestone)
- A11y audit (Phase 5)
- v2 requirements (EDP-01/02, THP-01/02, POP-07/08/09)
- Line-number gutter on INI editor (EDP-01)
- Form-based profile editor, INI syntax highlighting, live per-keystroke INI validation
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| THM-01 | Every surface fully styled in both light and dark themes; no `.darkMode` class, no inline `<style>` palette remaining | Removes 5 inline `<style>` blocks (options, supporters, credits, updated, and the `.darkMode` JS toggle in options.js); verified all 4 HTML files have inline `<style>` blocks |
| OPT-01 | Options page restyled to Cloudscape containers/cards, header, two-pane layout | `options.css` + `options.html` structural changes; `.aesr-options-pane` on both panes |
| OPT-02 | All form controls (text inputs, radios, checkboxes, buttons, selects) restyled consistently | Apply Phase 1 component shells (`.aesr-btn`, `.aesr-input`, `.aesr-textarea`, `.aesr-checkbox`, `.aesr-radio`); `options.css` for layout context |
| OPT-03 | INI editor polished — monospace, framed as editor — retained as single source of truth | `options.css` overrides on `.aesr-textarea` for `#awsConfigTextArea`: `min-height: 320px`, `max-height: calc(100vh - 320px)`, `white-space: pre` |
| OPT-04 | Save/parse outcomes as Cloudscape-style alerts; parse errors include line number from parser | `options.js` `updateMessage()` refactor: inject `.aesr-alert` + modifier; `focusConfigTextArea()` preserved; `components.css` gets 2 new alert variants |
| OPT-05 | Storage-area selector restyled; "forced Local" warning preserved | `.aesr-storage-row` in `options.css`; warning kept as `.aesr-alert--warning` or styled `.warn`; `#configStorageSyncRadioButton`/`#configStorageLocalRadioButton` IDs unchanged |
| OPT-06 | Color picker restyled and theme-aware in both themes | `#colorPicker` CSS: `border: 1px solid var(--color-border-input)` (reuses D-01); `.aesr-color-pair` wrapper; `#colorValue` monospace; `ColorPicker` class is CSS-only change (no JS) |
| OPT-07 | Config Hub connect/disconnect controls and result messages restyled; PKCE flow untouched | `options.css` for Config Hub section layout; `updateMessage('remoteMsgSpan', ...)` routes through `.aesr-alert` variants; `updateRemoteFieldsState()` inline-style toggle contract preserved |
| AUX-01 | supporters, credits, updated pages restyled to token system in both themes | `pages.css` new file; `<link>` added to all 3 aux pages; inline `<style>` blocks removed |
</phase_requirements>

---

## Summary

Phase 3 is a CSS + targeted-JS + HTML restructure. No new packages. All token infrastructure and base component shells exist from Phase 1. Phase 2 is complete and provides the `popup.css` pattern model to follow exactly.

The work falls into four groups: (1) Author `options.css` and `pages.css` consuming Phase 1 tokens for options-specific and aux-page layout; (2) Remove inline `<style>` blocks and `.darkMode` CSS/JS from all 4 HTML files and link the new CSS files; (3) Refactor `options.js` `updateMessage()` to emit `.aesr-alert` shells and remove the `.darkMode` class toggle; (4) Add `.aesr-alert--success` and `.aesr-alert--warning` modifier classes to the shared `components.css`. The build scripts already copy `src/css/` verbatim — adding `options.css` and `pages.css` there requires no build-script edits.

The critical complexity is the Phase 3 → Phase 4 transitional regression: removing the `.darkMode` JS toggle from `options.js` is correct, but it leaves the Visual Mode radios writing to storage without an immediate visual response until Phase 4 wires `data-theme`. This must be documented as a known/accepted limitation, not a bug.

The `#msgSpan` / `#remoteMsgSpan` `<span>` → `<div>` HTML change is load-bearing: the `.aesr-alert` shell is `display: flex` (block), and a `<span>` container cannot be a block-level flex container without an explicit override. Changing the tag is cleaner and safe — the Playwright selectors for both elements use IDs, not tag names.

**Primary recommendation:** Plan in three logical task groups: (1) CSS authoring (`options.css` + `pages.css` + `components.css` additions) with no regression risk; (2) HTML wiring (remove inline `<style>`, link new CSS, fix heading hierarchy, change `<span>` → `<div>` for alert containers); (3) `options.js` JS updates (`updateMessage()` refactor + `.darkMode` removal). Never split the JS refactor from the HTML tag change it depends on.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Token consumption (color, spacing, radius) | Browser / Client (CSS engine) | — | `var(--token)` resolved by CSS engine at paint time; no JS involved |
| FOUC / pre-paint theming | Browser / Client (parse stream) | — | `theme-init.js` already wired in all 5 pages (Phase 1); Phase 3 inherits |
| Options page layout (two-pane) | Browser / Client (CSS) | — | `options.css` + `options.html` class additions; no JS layout logic |
| INI editor styling | Browser / Client (CSS) | — | `options.css` overrides on `.aesr-textarea`; `options.js` textarea reference unchanged |
| Alert injection (save/parse outcomes) | Browser / Client (JS → DOM) | — | `options.js` `updateMessage()` builds DOM; CSS classes control visual style |
| `updateRemoteFieldsState()` panel toggles | Browser / Client (inline style toggle) | — | MUST remain `el.style.display = 'block'/'none'/'inline-block'`; 6 elements; Playwright contract |
| Color picker pair | Browser / Client (CSS + existing JS) | — | `options.css` styles the pair; `ColorPicker` class is event-driven only (no DOM build); CSS-only change |
| Aux page layout | Browser / Client (CSS) | — | `pages.css` + HTML wiring; no JS involvement |
| Build delivery of `options.css` / `pages.css` | Static / Build | — | `bin/build.sh:34` `\cp -r src/css dist/$brw/` covers all files in `src/css/`; no build-script edits needed |

---

## Standard Stack

### Core (inherited — no new packages)

| Asset | Version | Purpose | Source |
|-------|---------|---------|--------|
| `src/css/tokens.css` | Phase 1 output | All color/type/spacing tokens | `[VERIFIED: live codebase]` |
| `src/css/base.css` | Phase 1 output | Global reset, `:focus-visible` ring, system font stack, heading defaults | `[VERIFIED: live codebase]` |
| `src/css/components.css` | Phase 1 output | Button, input, textarea, select, checkbox/radio, pane, divider, empty-state, loading-state, error alert shells | `[VERIFIED: live codebase]` |

**No new runtime or dev packages are installed in Phase 3.** Zero. The zero-new-deps constraint (CLAUDE.md, REQUIREMENTS.md FND-02) applies to the entire milestone.

---

## Package Legitimacy Audit

No packages are installed in Phase 3. Zero new runtime or dev dependencies.

| Package | Disposition |
|---------|-------------|
| (none) | N/A |

---

## Architecture Patterns

### System Architecture Diagram

```
PHASE 1 FOUNDATION (inherited, unchanged)
  <html data-theme="light|dark">
    |
    v
  tokens.css → base.css → components.css
                               |
                               ├── [options.css NEW]   ← consumed by options.html only
                               └── [pages.css NEW]     ← consumed by supporters/credits/updated

PHASE 3 RUNTIME STATE FLOW — options.js

  window.onload
    │
    ├── remove: body.classList.add('darkMode') ← DELETE options.js lines 194–197, 220–222
    │          data-theme already set pre-paint by theme-init.js (Phase 1)
    │
    ├── updateMessage() calls
    │     OLD: create <span class="cls">, append to #msgSpan / #remoteMsgSpan
    │     NEW: create <div class="aesr-alert aesr-alert--[success|warning|error]">
    │          containing <p class="aesr-alert__body">, append to #msgSpan / #remoteMsgSpan
    │          (containers changed from <span> to <div> in options.html)
    │
    └── updateRemoteFieldsState()
          el.style.display = 'block' | 'none' | 'inline-block'
          on: #standalonePanel, #configHubPanel, #cancelConfigHubButton,
              #connectConfigHubButton, #disconnectConfigHubButton, #reloadConfigHubButton
          ← PRESERVED VERBATIM

CSS CHAIN IN options.html <head> (after Phase 3)
  <script src="js/theme-init.js">           ← Phase 1, first
  <link css/tokens.css>                      ← Phase 1
  <link css/base.css>                        ← Phase 1
  <link css/components.css>                 ← Phase 1
  <link css/options.css>                    ← Phase 3 NEW (after components)
  [inline <style> block REMOVED]            ← Phase 3 removes all 140 lines

CSS CHAIN IN supporters/credits/updated <head> (after Phase 3)
  <script src="js/theme-init.js">           ← Phase 1, already present
  <link css/tokens.css>                      ← Phase 1, already present
  <link css/base.css>                        ← Phase 1, already present
  <link css/components.css>                 ← Phase 1, already present
  <link css/pages.css>                      ← Phase 3 NEW
  [inline <style> block REMOVED]            ← Phase 3 removes existing <style>
```

### Recommended Project Structure

```
src/
├── css/
│   ├── tokens.css           # Phase 1 — unchanged
│   ├── base.css             # Phase 1 — unchanged
│   ├── components.css       # Phase 1 — Phase 3 ADDS .aesr-alert--success and .aesr-alert--warning
│   ├── popup.css            # Phase 2 — unchanged
│   ├── options.css          # Phase 3 NEW — options page only
│   └── pages.css            # Phase 3 NEW — supporters/credits/updated only
├── js/
│   └── options.js           # Phase 3 MODIFIED — updateMessage() refactor, darkMode removal
├── options.html             # Phase 3 MODIFIED — inline <style> removed, heading hierarchy, <span>→<div>, classes added
├── supporters.html          # Phase 3 MODIFIED — inline <style> removed, classes added
├── credits.html             # Phase 3 MODIFIED — inline <style> removed, missing </html> fixed, classes added
└── updated.html             # Phase 3 MODIFIED — inline <style> removed, inline style attributes removed, classes added
```

No new JS files. Build scripts do not need editing.

---

## Component Inventory — Phase 3 Additions to `components.css`

### Alert Variants — New (SHARED, added to `components.css`)

These two modifier classes are added to `components.css` (not `options.css`) because they may be consumed by future surfaces.

```css
/* In components.css — Phase 3 addition */
.aesr-alert--success {
	border-left: 4px solid var(--color-text-status-success);
	background-color: var(--color-bg-container);
}

.aesr-alert--success .aesr-alert__body {
	color: var(--color-text-status-success);
}

.aesr-alert--warning {
	border-left: 4px solid var(--color-text-status-warning);
	background-color: var(--color-bg-container);
}

.aesr-alert--warning .aesr-alert__body {
	color: var(--color-text-status-warning);
}
```

The existing `.aesr-alert--error` (components.css lines 249–263) is already authored. The `.aesr-alert__body` rule (lines 260–263) currently sets `color: var(--color-text-status-error)`. The new modifier classes override this via specificity (`.aesr-alert--success .aesr-alert__body` beats `.aesr-alert__body`).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Text input styling | Custom input CSS | `.aesr-input` from `components.css` L51–62 | Already themed; includes disabled state |
| Textarea styling | Custom textarea CSS | `.aesr-textarea` from `components.css` L73–91 | Already themed; `options.css` overrides min-height/max-height/white-space only |
| Button styling | Custom button CSS | `.aesr-btn--primary` / `.aesr-btn--normal` from `components.css` L11–45 | Already themed; includes hover states |
| Checkbox/radio accent | Custom control styling | `.aesr-checkbox` / `.aesr-radio` from `components.css` L120–126 | `accent-color` token-driven; works natively |
| Select styling | Custom select CSS | `.aesr-select` from `components.css` L97–114 | Already themed |
| Success alert display | Custom green text span | `.aesr-alert.aesr-alert--success` | New modifier added to `components.css`; avoids hardcoded `#1c1cff` / `.success` class |
| Warning alert display | Custom red text span | `.aesr-alert.aesr-alert--warning` | New modifier added to `components.css`; avoids hardcoded `.warn { color: #de1010 }` |
| Error alert display | Custom error styling | `.aesr-alert.aesr-alert--error` from `components.css` L249–263 | Already authored in Phase 1 |
| Focus ring | New CSS on form controls | Inherited `:focus-visible` rule from `base.css` L97–101 | Global ring covers all form controls; `options.css` must not override it |
| Scrollbar theming | Custom `scrollbar-color` | `color-scheme` on `:root` (Phase 1 tokens.css L79) | Already wired; native scrollbars follow theme |
| Theme detection | Async `chrome.storage` read | `data-theme` attribute set by `theme-init.js` (Phase 1) | Pre-paint; no code needed in Phase 3 |
| Divider | Custom border hack | `.aesr-divider` from `components.css` L170–174 | Already authored |

---

## Source File Map — Exact Change Points

### `src/css/options.css` — NEW FILE

New file consuming Phase 1 tokens for options-page-specific layout. Shells to author:

| Shell | Class / Selector | Purpose |
|-------|-----------------|---------|
| Page pane | `.aesr-options-pane` | Common pane scaffold (both `#settingPane` and `#howto`) |
| Setting pane overrides | `#settingPane` | `max-width: 660px`, `min-width: 320px`, `border-right` divider |
| Howto pane overrides | `#howto` | `flex: 1`, `min-width: 280px`, `background-color: var(--color-bg-input-disabled)` |
| Section head | `.aesr-section-head` | Vertical rhythm for `<h2>` section heads |
| Form row | `.aesr-form-row` | Replaces `.formItem` (`display: flex; align-items: center; gap: var(--space-xs)`) |
| Settings list | `.aesr-settings-list` and `li` | Replaces `#settings ul` and `#settings ul li` |
| Storage row | `.aesr-storage-row` | Replaces `.radioGroup` for storage selector area |
| Color picker pair | `.aesr-color-pair` | Inline flex container for `#colorPicker` + `#colorValue` |
| Color picker input | `#colorPicker` | `border: 1px solid var(--color-border-input)`, `height: 24px`, `width: 32px` |
| Color value input | `#colorValue` | `font-family: var(--font-family-mono); width: 9ex` |
| INI editor override | overrides on `.aesr-textarea` for `#awsConfigTextArea` | `min-height: 320px`, `max-height: calc(100vh - 320px)`, `white-space: pre`, `margin: var(--space-xs) 0`, `resize: vertical` |
| Code inline | `.aesr-options-pane code` | Monospace, bold, heading color — scoped to options pane |
| Pre block | `.aesr-pre` or `#howto pre` | Code block background, border, monospace — scoped to howto pane |
| body layout | `body` | `display: flex; flex-direction: row; background-color: var(--color-bg-input-disabled)` |

**Header comment pattern** (match components.css lines 1–5 exactly, adapted for options.css).
**Section separators** (use `/* === N. Section === */` banner matching components.css pattern).
**Token-only values** — no hex, no hardcoded px where a token exists.

### `src/css/pages.css` — NEW FILE

New file consuming Phase 1 tokens for aux page document layout. Shells to author:

| Shell | Class / Selector | Purpose |
|-------|-----------------|---------|
| Article container | `.aesr-article` | Single-column document: `max-width: 720px`, `margin: 0 auto`, `line-height: 1.75` |
| Article section | `.aesr-article section` | `margin-block: var(--space-xxl) 0` |
| Article paragraphs/lists | `.aesr-article p, .aesr-article li` | `margin-block: var(--space-xxs) 0` |
| Code inline | `.aesr-article code` | Monospace, bold, heading color — scoped |
| Pre block | `.aesr-pre` (also used in options.css) | Shared shell: `background-color: var(--color-bg-input-disabled)`, border, monospace |
| Blockquote | `.aesr-article blockquote` | `border: 1px solid var(--color-border-divider)`, tokens — replaces `border: 1px solid #666` in updated.html |
| Accent heading | `.aesr-article .aesr-heading-accent` | `color: var(--color-text-accent)` — replaces `style="color:#0099f2"` on `<h2>` in updated.html |
| Golden Key textarea | `#textareaKeyCode` | `font-family: var(--font-family-mono)`, `border: 1px solid var(--color-border-input)`, etc. |

### `src/css/components.css` — MODIFIED

| Change | Location | What |
|--------|----------|------|
| Add `.aesr-alert--success` modifier | After line 263 (end of `.aesr-alert--error` block) | New modifier + `.aesr-alert--success .aesr-alert__body` override |
| Add `.aesr-alert--warning` modifier | After `.aesr-alert--success` | New modifier + `.aesr-alert--warning .aesr-alert__body` override |

No other changes to `components.css`.

### `src/options.html` — MODIFIED

**HTML file location:** `src/options.html` (NOT `src/html/options.html` — file is at `src/` root)

| Change | Location | What |
|--------|----------|------|
| Remove inline `<style>` block | Lines 11–140 | All 130 lines including `.darkMode` rules, `.pane`, `.formItem`, `.radioGroup` |
| Add `<link>` for `options.css` | After `<link css/components.css>` (line 9) | `<link rel="stylesheet" href="css/options.css">` |
| `<h1>Settings</h1>` → `<h2>` | Line 187 (approx) | Demote to section head; add `class="aesr-section-head"` |
| `<h1>Extension API</h1>` → `<h2>` | Line 201 (approx) | Demote to section head; add `class="aesr-section-head"` |
| `<span id="msgSpan">` → `<div>` | Line 164 (approx) | Tag change; ID preserved; allows block-flex `.aesr-alert` |
| `<span id="remoteMsgSpan">` → `<div>` | Line 183 (approx) | Tag change; ID preserved |
| `class="pane"` → `class="aesr-options-pane"` | Lines 143, 209 | Both `#settingPane` and `#howto` |
| `.radioGroup` (storage selector) → `.aesr-storage-row` | Line 147 (approx) | Replaces old class on the storage radio group div |
| `.formItem` → `.aesr-form-row` | Lines 169, 173, 203 (approx) | Config Hub domain, clientId, and Extension API sender ID rows |
| Add `class="aesr-btn aesr-btn--primary"` to `#saveButton` | Line 163 (approx) | Primary CTA |
| Add `class="aesr-btn aesr-btn--normal"` to Config Hub buttons | Lines 178–181 (approx) | `#cancelConfigHubButton`, `#connectConfigHubButton`, `#disconnectConfigHubButton`, `#reloadConfigHubButton`, `#switchConfigHubButton` |
| Add `class="aesr-input"` to text inputs | Lines 171, 175, 205 (approx) | `#configHubDomain`, `#configHubClientId`, `#configSenderIdText` |
| Add `class="aesr-textarea"` to `#awsConfigTextArea` | Line 154 | Base class; `options.css` overrides height/white-space |
| Add `class="aesr-checkbox"` to all checkboxes | Lines 188–193 (approx) | All 5 checkboxes in `#settings ul` |
| Add `class="aesr-radio"` to all radios | Lines 149, 195–197 (approx) | Storage radios and Visual Mode radios |
| Add `class="aesr-settings-list"` to `#settings ul` | Line 187 (approx) | Replaces raw `ul` + `li` rules |
| Add `class="aesr-color-pair"` wrapper div around `#colorPicker` + `#colorValue` | Line 156 (approx) | New wrapper div |
| Remove `style="float:right"` from the "About ~/.aws/config" link | Line 159 (approx) | Move to `options.css` or simply remove (let document flow) |
| Remove `style="margin-left: 6px"` from `<b>#</b>` | Line 157 | Move to `options.css` |
| Remove `style="margin-top:12px"` from save button wrapper | Line 162 | Move to `options.css` |
| Remove `style="margin-left: auto"` from `#switchConfigHubButton` | Line 151 | Move to `options.css` or remove |
| Remove `style="margin-left:12px"` from `#msgSpan` | Line 164 (approx) | Move to `options.css` |
| Remove `style="margin-left:12px"` from `#remoteMsgSpan` | Line 183 (approx) | Move to `options.css` |
| Remove `style="width: 15ex"` and `style="width: 40ex"` from Config Hub inputs | Lines 171, 175 | Move widths to `options.css` scoped rules |
| Remove `style="width: 48ex"` from `#configSenderIdText` | Line 205 | Move to `options.css` |
| Add `class="aesr-pre"` to all `<pre>` blocks in `#howto` | Multiple | Apply shared pre class |
| Preserve: `#standalonePanel`, `#configHubPanel` element IDs | Lines 145, 167 | JS `updateRemoteFieldsState()` toggles these |
| Preserve: `#cancelConfigHubButton`, `#connectConfigHubButton`, `#disconnectConfigHubButton`, `#reloadConfigHubButton` element IDs | Lines 178–181 | JS `updateRemoteFieldsState()` toggles these |
| Preserve ALL existing IDs (complete list per SC5) | — | `#awsConfigTextArea`, `#saveButton`, `#msgSpan`, `#configStorageSyncRadioButton`, `#configStorageLocalRadioButton`, `#textareaKeyCode`, `#*VisualRadioButton`, `#colorPicker`, `#colorValue`, all `#configHub*` IDs |

**Inline style attribute audit (options.html — keep vs remove vs move):**

| Element | Inline style | Disposition |
|---------|-------------|-------------|
| `#standalonePanel` `display:none` initial state | None present — JS sets this | Keep JS toggle |
| `#configHubPanel` `style="display: none"` | `display: none` | **KEEP** — JS toggles; Playwright contract |
| `#switchConfigHubButton` `style="margin-left: auto"` | margin | Move to `options.css` |
| `#msgSpan` `style="margin-left:12px"` | margin | Move to `options.css` |
| `#remoteMsgSpan` `style="margin-left:12px"` | margin | Move to `options.css` |
| Config Hub inputs width `style="width: 15ex"` / `style="width: 40ex"` | width | Move to `options.css` |
| `#configSenderIdText` `style="width: 48ex"` | width | Move to `options.css` |
| `<div style="display: flex">` around color picker + link row | flex container | Replace with `.aesr-form-row` class |
| `<div style="margin-top:12px">` (save button row) | margin | Replace with class in `options.css` |

### `src/supporters.html` — MODIFIED

**HTML file location:** `src/supporters.html`

| Change | Location | What |
|--------|----------|------|
| Remove inline `<style>` block | Lines 10–49 | All 40 lines including `.sponsorButton`, `#textareaKeyCode` hardcoded styles |
| Add `<link>` for `pages.css` | After `<link css/components.css>` | `<link rel="stylesheet" href="css/pages.css">` |
| Add `class="aesr-article"` to `<body>` (or a wrapper div) | Line 51 | Document container |
| Apply `.aesr-btn.aesr-btn--normal` to `<a class="sponsorButton">` | Line 87 | Replaces hardcoded `.sponsorButton` styling |
| Move `<textarea id="textareaKeyCode">` inline width/height to CSS | Line 106 | Remove `style="width: 62ex; height: 27em"` — defined in `pages.css` |
| Remove `style="display: flex"` on key-code flex wrapper | Line 105 | Replace with class or `pages.css` rule |
| Remove `style="margin-left: 20px"` on status div | Line 107 | Move to `pages.css` |
| Preserve: `#textareaKeyCode`, `#keyCodeValid`, `#keyCodeInvalid` element IDs | Lines 106–109 | Playwright selectors contract |
| Preserve: `<script type="module" src="js/supporters.js">` after `</body>` | Line 113 | Behavior risk if moved |
| Remove `<span style="color:#a00; font-size: small; ...">` | Line 88 | Replace with token-styled approach (`var(--color-text-status-error)` + `var(--font-size-body-s)` via class in `pages.css`) |

**`#keyCodeValid` and `#keyCodeInvalid` display state:** Both elements have `style="display: none"` inline. These are toggled by `src/js/supporters.js`. **KEEP** the inline `style="display: none"` attributes — JS sets/removes these.

### `src/credits.html` — MODIFIED

**HTML file location:** `src/credits.html`

| Change | Location | What |
|--------|----------|------|
| Remove inline `<style>` block | Lines 10–44 | All 35 lines including `.pane` hardcoded background |
| Add `<link>` for `pages.css` | After `<link css/components.css>` | `<link rel="stylesheet" href="css/pages.css">` |
| Fix missing `</html>` closing tag | End of file (line 76) | Add `</html>` |
| Remove `<div class="pane" id="credits">` wrapper — or apply `class="aesr-article"` to it | Line 47 | Use `.aesr-article` container |
| Add `class="aesr-pre"` to `<pre>` block | Line 51 | License pre block |

### `src/updated.html` — MODIFIED

**HTML file location:** `src/updated.html`

| Change | Location | What |
|--------|----------|------|
| Remove inline `<style>` block | Lines 10–39 | All 30 lines including `blockquote`, `code`, and `section p` hardcoded styles |
| Add `<link>` for `pages.css` | After `<link css/components.css>` | `<link rel="stylesheet" href="css/pages.css">` |
| Add `class="aesr-article"` to `<body>` (or wrapper) | Line 41 | Document container |
| Remove `<h1 style="margin:0">` inline style | Line 42 | `base.css` already sets `h1 { margin: 0 }` — redundant; remove |
| Remove `<h2 style="color:#0099f2">` inline style | Line 45 | Replace with `class="aesr-heading-accent"` |
| Tokenize `<blockquote>` | Lines 79+ | Currently `border: 1px solid #666; width: 22em; padding: .4em .7em; margin: 1em 4em` → apply `.aesr-article blockquote` rule from `pages.css` |
| Tokenize version heading inline colors | Lines 81, 84 | `<h2>6.1.0 <span style="color:rgb(221, 63, 0)">New version!</span></h2>` — replace span color with token class; `<hr style="margin:18px 0">` → `class="aesr-divider"` |

### `src/js/options.js` — MODIFIED

| Change | Location | What |
|--------|----------|------|
| Remove `.darkMode` class add on Visual Mode radio change | Lines 194–197 | Delete `if (visualMode === 'dark' ...) { document.body.classList.add('darkMode') } else { document.body.classList.remove('darkMode') }` inside the radio `onchange` handler — keep `syncStorageRepo.set({ visualMode })` |
| Remove `.darkMode` class add on initial load | Lines 220–222 | Delete `if (visualMode === 'dark' ...) { document.body.classList.add('darkMode') }` inside `syncStorageRepo.get().then()` — keep the rest of the block |
| Refactor `updateMessage(elId, msg, cls)` | Lines 247–264 | Replace `<span class="cls">` injection with `.aesr-alert` + modifier class injection; change `msgSpan` and `remoteMsgSpan` from `firstChild` span mutation to full `aesr-alert` div injection |
| (implicit deletion) | options.html inline `<style>` | The old `<span class="success">` / `<span class="warn">` injection is replaced wholesale; the corresponding `.success` / `.warn` CSS rules in the inline `<style>` block disappear with it. No equivalent classes need to be ported to `options.css`. |

**`updateMessage()` new pattern:**

```javascript
// Source: UI-SPEC §Alert Variants, options.js lines 247–264
function updateMessage(elId, msg, cls = 'success') {
  const el = elById(elId);
  const alertDiv = document.createElement('div');
  const modifierMap = { success: 'aesr-alert--success', warn: 'aesr-alert--warning' };
  const modifier = modifierMap[cls] || 'aesr-alert--error';
  alertDiv.className = `aesr-alert ${modifier}`;
  const body = document.createElement('p');
  body.className = 'aesr-alert__body';
  body.textContent = msg;         // textContent, not innerHTML — msg may contain error content
  alertDiv.appendChild(body);
  el.replaceChildren(alertDiv);   // or: el.innerHTML = ''; el.appendChild(alertDiv)

  if (cls === 'success') {
    setTimeout(() => {
      alertDiv.remove();
    }, 2500);
  }
}
```

**Preserved unchanged** — must not be modified:
- Lines 22–56: All button `onclick` handlers (`switchConfigHubButton`, `cancelConfigHubButton`, etc.)
- Lines 58–74: `textArea.onselect` handler (color picker integration)
- Lines 76–93: `saveButton.onclick` handler including `focusConfigTextArea(lastError.line)` call
- Lines 95–153: Boolean settings, tab-grouping disable, remote connect info, Golden Key logic
- Lines 154–189: `configSenderIdText.onchange` and storage area radio change handlers
- Lines 191–199: Visual Mode `onchange` handler — ONLY delete the `.darkMode` class add/remove lines; keep `syncStorageRepo.set({ visualMode })`
- Lines 230–245: `saveConfiguration()` async function — untouched
- Lines 266–289: `updateRemoteFieldsState()` — untouched (`style.display` toggle contract)
- Lines 291–305: `focusConfigTextArea()` — untouched

**`updateRemoteFieldsState()` inline-style toggle contract (PRESERVED VERBATIM):**

| Element ID | Toggle values | Used in |
|------------|--------------|---------|
| `#standalonePanel` | `'block'` / `'none'` | options.spec.js |
| `#configHubPanel` | `'block'` / `'none'` | options.spec.js |
| `#cancelConfigHubButton` | `'inline-block'` / `'none'` | — |
| `#connectConfigHubButton` | `'inline-block'` / `'none'` | — |
| `#disconnectConfigHubButton` | `'inline-block'` / `'none'` | — |
| `#reloadConfigHubButton` | `'inline-block'` / `'none'` | — |

These MUST remain `el.style.display = '...'`. No CSS class toggle replacement.

### Build scripts

**No changes required.** `bin/build.sh:34` already runs `\cp -r src/css dist/$brw/` and `bin/build_test.sh:10` already runs `cp -r src/css $destdir/`. Adding `options.css` and `pages.css` to `src/css/` automatically includes them in both copy operations. [VERIFIED: `bin/build.sh:34`, `bin/build_test.sh:10`]

---

## Common Pitfalls

### Pitfall 1: Transitional visual regression on Visual Mode radios flagged as a bug
**What goes wrong:** After removing `.darkMode` class toggle, a reviewer (or test runner) sees the Visual Mode radios do nothing visually when clicked. They flag it as a regression.
**Why it happens:** The Phase 4 live-update wiring (`data-theme` writeback + `storage.onChanged`) is intentionally deferred. Phase 3 deliberately creates this one-phase regression.
**How to avoid:** Document explicitly in the Phase 3 plan's Notes / Known Limitations section. The wording should be: "After Phase 3, clicking a Visual Mode radio writes to `chrome.storage.sync` but does not immediately repaint — page reload is required to apply the new theme. This is a deliberate accepted regression; Phase 4 restores live repaint via `data-theme` write + `storage.onChanged`."
**Warning signs:** Manual test: click "Dark" radio → no repaint. Expected in Phase 3. Bug in Phase 4 if still present.

### Pitfall 2: `#msgSpan` / `#remoteMsgSpan` block-flex alert in a `<span>` container
**What goes wrong:** `.aesr-alert` uses `display: flex; flex-direction: column`. A `<span>` is inline by default. The alert renders as inline-flex (or collapses), breaking the visual layout.
**Why it happens:** If the HTML tag change (`<span>` → `<div>`) is separated from the `updateMessage()` refactor into different commits, one commit leaves the system in a broken state.
**How to avoid:** The HTML tag change AND the `updateMessage()` refactor MUST land in the same commit. They are co-dependent.
**Warning signs:** Alert renders inline, wraps oddly, or collapses to zero height inside the span container.

### Pitfall 3: `updateRemoteFieldsState()` show/hide toggle replaced with CSS classes
**What goes wrong:** `el.style.display = 'block'/'none'/'inline-block'` replaced with `el.classList.toggle('hidden')`. Playwright `options.spec.js` relies on `page.locator('#configStorageSyncRadioButton')` and `#configStorageLocalRadioButton` visibility — and the Config Hub panel show/hide may be tested.
**Why it happens:** The inline-style toggle pattern feels inconsistent with the CSS-class approach used elsewhere.
**How to avoid:** Keep `el.style.display` toggling in `updateRemoteFieldsState()` verbatim. Same constraint as Phase 2's `#main`/`#noMain` toggle.
**Warning signs:** `options.spec.js` failures on storage area radio state tests.

### Pitfall 4: `--color-bg-button-primary-hover` absent from dark theme tokens
**What goes wrong:** The "Save Configuration" and "Connect Config Hub" primary buttons have a hover state (`background-color: var(--color-bg-button-primary-hover)`). In dark mode, this token falls through to the light value `#004a9e` (deep navy) — which may look wrong against the dark `#42b4ff` primary button background.
**Why it happens:** `tokens.css` Layer 1 (light) defines `--color-bg-button-primary-hover: #004a9e` (line 30). Layer 2 (OS dark) and Layer 3a (explicit dark) do NOT redefine it. Verified by grep: only one declaration exists.
**How to avoid:** Wave 0 of the Phase 3 plan MUST add the dark-mode value for `--color-bg-button-primary-hover` to both dark layers in `tokens.css`. Cloudscape dark suggestion: `#1a73e8` (blue-700, from STACK.md reference in Phase 1). Planner must confirm the hex before shipping the plan — this is a prerequisite, not a nice-to-have.
**Warning signs:** Dark mode primary button hover looks navy-on-dark background (contrast issue visible in devtools with `data-theme="dark"`).

### Pitfall 5: Overriding or weakening the `:focus-visible` ring in `options.css`
**What goes wrong:** `options.css` adds `outline: none` on form controls or inputs, removing the tokenized focus ring from `base.css`.
**Why it happens:** Old CSS targeting `input, button` in the inline `<style>` block may suggest individual element styling.
**How to avoid:** `options.css` must not declare `outline` on any interactive element. The global `:focus-visible` rule in `base.css:97–101` covers all form controls automatically.
**Warning signs:** No visible focus outline on any interactive element in either theme.

### Pitfall 6: Scoping `code` and `pre` styles to the wrong surface file
**What goes wrong:** `code { ... }` or `pre { ... }` rules added to `options.css` without scoping leak to all pages that load `options.css` — or if accidentally added to the shared `components.css`, leak to the popup.
**Why it happens:** Inline `<style>` in options.html currently has unscoped `code { }` and `pre { }`. Direct migration produces unscoped rules.
**How to avoid:** Scope to pane: `.aesr-options-pane code { ... }` and `#howto pre { ... }` (or `.aesr-pre` class). Scope aux page rules to `.aesr-article code { ... }`. Never add unscoped `code`/`pre` rules to shared CSS files.
**Warning signs:** `<code>` in popup renders unexpectedly bold/colored; `<pre>` in popup gets a border.

### Pitfall 7: Splitting the `options.css` / `pages.css` link from inline `<style>` removal across commits
**What goes wrong:** A commit removes the inline `<style>` block from options.html before `options.css` is linked — or links `options.css` before it is authored. The options page renders unstyled.
**Why it happens:** Natural desire to separate HTML changes from CSS authoring.
**How to avoid:** For each surface, author the CSS file AND link it AND remove the inline `<style>` in the same commit. The three changes are atomic.
**Warning signs:** Options page renders as browser-default unstyled page (no color, no layout, no fonts) after the HTML commit.

### Pitfall 8: `#textareaKeyCode` and `#keyCodeValid`/`#keyCodeInvalid` Playwright selectors broken
**What goes wrong:** Renaming or removing the `style="display: none"` attributes on `#keyCodeValid` / `#keyCodeInvalid` breaks `supporters.spec.js` which checks `toBeHidden()` / `toBeVisible()`.
**Why it happens:** The inline `style="display: none"` attribute on those elements is the Playwright visibility contract.
**How to avoid:** Keep `style="display: none"` on `#keyCodeValid` and `#keyCodeInvalid` in `supporters.html`. `supporters.js` clears these; do not interfere.
**Warning signs:** `supporters.spec.js` "input invalid key code" test fails with wrong element visibility state.

---

## Code Examples — Verified Patterns

### Token-Only CSS Rule Pattern (from `components.css` — reuse in `options.css` / `pages.css`)

```css
/* Source: src/css/components.css lines 51–62 */
.aesr-input {
	display: block;
	width: 100%;
	padding: var(--space-xxs) var(--space-xs);
	background-color: var(--color-bg-input);
	color: var(--color-text-body);
	border: 1px solid var(--color-border-input);
	border-radius: var(--radius-input);
	font-family: var(--font-family-base);
	font-size: var(--font-size-body-m);
	line-height: var(--line-height-body-m);
}
```

Every color, size, spacing, font value is `var(--token)`. No hex. No hardcoded px where a token exists. Tab-indented.

### INI Editor Override Pattern (`options.css`)

```css
/* Source: UI-SPEC §INI Editor [CITED: .planning/phases/03-options-auxiliary-surfaces/03-UI-SPEC.md] */
/* Adds options-specific overrides on top of .aesr-textarea from components.css */
#awsConfigTextArea {
	min-height: 320px;
	max-height: calc(100vh - 320px);
	white-space: pre;
	margin: var(--space-xs) 0;
	resize: vertical;
}
```

Note: `spellcheck="false"` and `white-space: pre` are both preserved — `spellcheck` is an HTML attribute on the element; `white-space: pre` is the CSS rule.

### `updateMessage()` Refactored Pattern (`options.js`)

```javascript
// Source: UI-SPEC §Alert Variants + options.js lines 247–264 [CITED: 03-UI-SPEC.md]
function updateMessage(elId, msg, cls = 'success') {
  const el = elById(elId);
  const modifierMap = { success: 'aesr-alert--success', warn: 'aesr-alert--warning' };
  const modifier = modifierMap[cls] || 'aesr-alert--error';
  const alertDiv = document.createElement('div');
  alertDiv.className = `aesr-alert ${modifier}`;
  const body = document.createElement('p');
  body.className = 'aesr-alert__body';
  body.textContent = msg;   // textContent, not innerHTML
  alertDiv.appendChild(body);
  el.replaceChildren(alertDiv);

  if (cls === 'success') {
    setTimeout(() => { alertDiv.remove(); }, 2500);
  }
}
```

The `2500ms` auto-remove for success messages is preserved. `textContent` is used (not `innerHTML`) — `msg` may contain error text from server-influenced sources.

### Color Picker Pair Pattern (`options.css`)

```css
/* Source: UI-SPEC §Color Picker Pair [CITED: 03-UI-SPEC.md] */
.aesr-color-pair {
	display: inline-flex;
	align-items: center;
	gap: var(--space-xs);
}

#colorPicker {
	border: 1px solid var(--color-border-input);
	border-radius: var(--radius-badge);
	cursor: pointer;
	padding: 0;
	height: 24px;
	width: 32px;
}

#colorValue {
	font-family: var(--font-family-mono);
	width: 9ex;
}
```

The `#colorPicker` inner swatch chip is browser-native and not independently styleable in all browsers. The `border` on the outer `<input>` provides WCAG 1.4.11 (3:1 UI component contrast) compliance at the control boundary. `ColorPicker` class in `src/js/lib/color_picker.js` requires no JS changes — it only listens to `oninput`/`onkeypress` events and does not build any DOM.

### `options.html` `<head>` After Phase 3

```html
<head>
  <meta charset="UTF-8">
  <title>AWS Extend Switch Roles - Configuration</title>
  <script src="js/theme-init.js"></script>
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/components.css">
  <link rel="stylesheet" href="css/options.css">  <!-- Phase 3 NEW -->
  <!-- inline <style> block REMOVED (options.html lines 11–140) -->
  <script type="module" src="js/options.js"></script>
</head>
```

### Aux Page `<head>` After Phase 3 (e.g. supporters.html)

```html
<head>
  <meta charset="UTF-8">
  <title>Supporters Program | AWS Extend Switch Roles</title>
  <script src="js/theme-init.js"></script>
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/components.css">
  <link rel="stylesheet" href="css/pages.css">  <!-- Phase 3 NEW -->
  <!-- inline <style> block REMOVED -->
</head>
```

---

## Test Impact Map

### Unit Tests (Mocha + jsdom)

**No unit test changes required for Phase 3.** Phase 3 touches `options.js`, `options.html`, `supporters.html`, `credits.html`, `updated.html`, and CSS files. There are no co-located `.test.js` files for any of these. The Mocha unit test suite (`npm test`) should pass without modification.

### Playwright Emulator Tests — Brittle Selectors (MUST NOT CHANGE)

**`test/emulator/options.spec.js`** — uses `testInOptions()` which navigates to `chrome-extension://${extensionId}/options.html`. Selectors:

| Selector | Lines | Constraint |
|----------|-------|------------|
| `#awsConfigTextArea` | options.spec.js:10 | ID preserved; element unchanged |
| `#saveButton` | options.spec.js:34 | ID preserved; tag preserved (`<button>`) |
| `#configStorageSyncRadioButton` | options.spec.js:59, 95 | ID preserved; `.isChecked()` relies on radio behavior |
| `#configStorageLocalRadioButton` | options.spec.js:60, 96 | ID preserved |
| `.check()` / `.isChecked()` on radios | options.spec.js:61, 97 | Radio behavior unchanged |

**No Playwright selector depends on:** element tag names (`span` vs `div`), CSS class names from old inline `<style>` (`.formItem`, `.radioGroup`, `.pane`), or the `.darkMode` class. The `options.spec.js` tests are behavioral (fill textarea, click save, check radio) — they survive all Phase 3 HTML structural changes.

**`test/emulator/supporters.spec.js`** — uses `testInSupporters()` which navigates to `supporters.html`. Selectors:

| Selector | Lines | Constraint |
|----------|-------|------------|
| `#keyCodeInvalid` | supporters.spec.js:5, 7 | ID preserved; `style="display: none"` on element MUST remain |
| `#textareaKeyCode` | supporters.spec.js:6 | ID preserved |
| `.toBeHidden()` / `.toBeVisible()` | supporters.spec.js:5, 7 | Relies on `display: none` inline style toggle by `supporters.js` |

**`test/emulator/foundation.spec.js`** — tests `test/preview/index.html` (Phase 1 smoke). Unaffected by Phase 3.

### Test Coverage Gaps (Known)

`options.spec.js` tests behavioral flow (fill → save → verify storage). It does NOT test:
- Visual appearance of alerts (`#msgSpan` content after save)
- Config Hub panel show/hide state
- Color picker interaction

These are acceptance gaps, not blockers for Phase 3. No new spec is required by Phase 3 SC5.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Mocha 11.7.5 (unit) + Playwright 1.58.2 (emulator) |
| Config file | `playwright.config.ts` |
| Quick run command | `npm test` |
| Full suite command | `npm run test_emulator` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| THM-01 | All surfaces styled in both themes; no `.darkMode` class remaining | manual visual | devtools: set `data-theme="dark"` on all 5 pages | N/A — manual |
| OPT-01–OPT-07 | Options page controls and layout render correctly | integration (Playwright) | `npm run test_emulator -- test/emulator/options.spec.js` | ✅ exists |
| OPT-04 | Save/parse outcomes show alerts; line number for parse errors | integration (Playwright) | `npm run test_emulator -- test/emulator/options.spec.js` | ✅ exists — "change and save configuration" test exercises save path |
| OPT-05 | Storage selector toggle works | integration (Playwright) | `npm run test_emulator -- test/emulator/options.spec.js` | ✅ exists — 2 storage toggle tests |
| AUX-01 | Supporters page key code flow works | integration (Playwright) | `npm run test_emulator -- test/emulator/supporters.spec.js` | ✅ exists |

### Sampling Rate

- **Per task commit:** `npm test`
- **Per wave merge:** `npm run test_emulator` (full Playwright suite)
- **Phase gate:** `npm test` (all passing) + `npm run test_emulator` (all passing) before `/gsd-verify-work`

### Wave 0 Gaps

**Token gap (blocking):**
- [ ] `tokens.css` — add `--color-bg-button-primary-hover` to Layer 2 and Layer 3a dark blocks. Suggested value: `#1a73e8`. Required before any primary button CSS lands in this phase.

**Test infrastructure gaps:** None — existing test infrastructure covers all Phase 3 behavioral requirements. `npm test` and `npm run test_emulator` pass without modification as long as the selector/ID contracts listed above are preserved.

---

## Environment Availability

Phase 3 introduces no external dependencies. All tools are the same as Phases 1 and 2. Build, test, and CSS copy mechanisms are unchanged.

---

## Security Domain

Phase 3 has no new attack surface. The `updateMessage()` refactor uses `body.textContent = msg` (not `innerHTML`) — `msg` may contain error text from storage or server-influenced sources; `textContent` prevents injection. All other changes are CSS + HTML structural.

| ASVS Category | Applies | Control |
|---------------|---------|---------|
| V5 Input Validation | Pre-existing | `options.js` `focusConfigTextArea()` uses line numbers from the parser, not user input; `saveConfiguration()` passes text to `ConfigParser.parseIni()` — unchanged; no new input paths |
| All others | No | Phase 3 is CSS + minor DOM restructure + HTML wiring; no auth, session, crypto, or new input paths |

---

## Open Questions (RESOLVED)

1. **`--color-bg-button-primary-hover` dark value**
   - What we know: Token is defined ONLY in Layer 1 (light: `#004a9e`). Layer 2 and Layer 3a dark blocks do not define it. [VERIFIED: `src/css/tokens.css:30` — only occurrence]
   - What's unclear: Whether `#1a73e8` (blue-700, referenced in Phase 1 STACK.md) is the correct dark hover value, or whether the Cloudscape dark palette uses a different lightening approach.
   - RESOLVED: Use #1a73e8 — implemented in Plan 01 Task 1.

2. **`updated.html` version heading inline colors**
   - What we know: `<h2>6.1.0 <span style="color:rgb(221, 63, 0)">New version!</span></h2>` and `<span style="margin-left:0.75em; color:rgb(221, 63, 0)">` use a hardcoded "new version" orange/red color not in the token palette.
   - What's unclear: Whether to (a) tokenize using `--color-text-status-error` (closest match), (b) add a new `--color-text-status-new` token, or (c) leave as inline style (out of scope for token cleanup).
   - RESOLVED: Replace with class='aesr-heading-accent' (--color-text-status-error token) — implemented in Plan 03 Task 2.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `bin/build.sh:34` `\cp -r src/css dist/$brw/` includes all files in `src/css/` without naming them explicitly, so adding `options.css` and `pages.css` requires no build script edit | Build scripts | If glob behavior differs, need to add explicit copy lines — low effort to fix |
| A2 | No Playwright test targets element tag names (`span`, `div`) in `options.spec.js` or `supporters.spec.js` | Test Impact Map | If found, the `<span>→<div>` change for `#msgSpan`/`#remoteMsgSpan` would require test updates |
| A3 | `#keyCodeValid` / `#keyCodeInvalid` `style="display: none"` attributes are toggled by `supporters.js` (not read by extension API) and will continue to function as the Playwright visibility signal after Phase 3 | Test Impact Map | If `supporters.js` is changed elsewhere, behavior could differ — but Phase 3 does not touch `supporters.js` |

All other claims are verified against the live codebase at exact line numbers or cited from locked planning artifacts.

---

## Sources

### Primary (HIGH confidence — live codebase verification)

- `src/options.html` — inline `<style>` block lines 11–140; DOM structure; all element IDs verified
- `src/supporters.html` — inline `<style>` block lines 10–49; `#textareaKeyCode`, `#keyCodeValid`, `#keyCodeInvalid` IDs verified
- `src/credits.html` — inline `<style>` block lines 10–44; missing `</html>` confirmed
- `src/updated.html` — inline `<style>` block lines 10–39; hardcoded inline styles verified
- `src/js/options.js` — `updateMessage()` lines 247–264; `.darkMode` toggle lines 191–198, 220–222; `updateRemoteFieldsState()` lines 266–289; `focusConfigTextArea()` lines 291–305
- `src/js/lib/color_picker.js` — DOM event listener only; no DOM build; CSS-only OPT-06 change confirmed
- `src/css/tokens.css` — all token values verified; `--color-bg-button-primary-hover` dark-mode absence confirmed (single occurrence at line 30)
- `src/css/components.css` — all shell classes verified; `.aesr-alert--error` at L249–263; no `.aesr-alert--success` or `.aesr-alert--warning` present (confirmed by reading)
- `src/css/base.css` — `:focus-visible` ring L97–101; `h1 { margin: 0 }` confirmed
- `src/css/popup.css` — Phase 2 output; confirms CSS authoring conventions (tab indent, token-only, section banners)
- `bin/build.sh:34` — `\cp -r src/css dist/$brw/` covers all css files
- `bin/build_test.sh:10` — `cp -r src/css $destdir/` covers all css files
- `test/emulator/options.spec.js` — all selectors verified: `#awsConfigTextArea`, `#saveButton`, `#configStorageSyncRadioButton`, `#configStorageLocalRadioButton`
- `test/emulator/supporters.spec.js` — all selectors verified: `#keyCodeInvalid`, `#textareaKeyCode`
- `test/emulator/fixtures.js` — `testInOptions` navigates to `options.html`; `testInSupporters` navigates to `supporters.html`

### Primary (HIGH confidence — locked planning artifacts)

- `.planning/phases/03-options-auxiliary-surfaces/03-UI-SPEC.md` — all component specs, layout contract, copywriting contract, interaction states, open issues; APPROVED 2026-05-28
- `.planning/REQUIREMENTS.md` — THM-01, OPT-01 through OPT-07, AUX-01 requirements text
- `.planning/ROADMAP.md` — Phase 3 success criteria, Phase 3 → Phase 4 sequencing
- `.planning/phases/02-popup-surface/02-RESEARCH.md` — Phase 2 patterns and conventions; CSS authoring conventions confirmed as carry-forward

---

## Metadata

**Confidence breakdown:**
- Source file change points: HIGH — verified against live codebase at exact locations
- Token resolutions: HIGH — verified against `src/css/tokens.css`
- Component shell availability: HIGH — verified against `src/css/components.css`
- Test impact: HIGH — verified by reading all relevant test files
- Architecture patterns: HIGH — locked by UI-SPEC
- `--color-bg-button-primary-hover` dark gap: HIGH — verified by grep; single occurrence confirmed

**Research date:** 2026-05-28
**Valid until:** Stable — locked by UI-SPEC and Phase 1 foundation. No expiry risk.
