# Phase 3: Options & Auxiliary Surfaces - Pattern Map

**Mapped:** 2026-05-28
**Files analyzed:** 9 new/modified files
**Analogs found:** 9 / 9

> Build script note: `bin/build.sh:34` runs `\cp -r src/css dist/$brw/` and `bin/build_test.sh:10`
> runs `cp -r src/css $destdir/`. Adding `options.css` and `pages.css` to `src/css/` requires
> **no build-script edits**. Those files are excluded from this pattern map.

> HTML file location note: All HTML files live at the `src/` root — **not** in `src/html/`.
> Paths are `src/options.html`, `src/supporters.html`, `src/credits.html`, `src/updated.html`.

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/css/tokens.css` | config | static | `src/css/tokens.css` (self) | self-delta (add token to existing dark layers) |
| `src/css/options.css` | component | transform | `src/css/popup.css` | role-match (same: surface-specific CSS layered over components.css) |
| `src/css/pages.css` | component | transform | `src/css/popup.css` | role-match (same authoring conventions, document layout vs popup chrome) |
| `src/css/components.css` | component | static | `src/css/components.css` (self) | self-delta (add `.aesr-alert--success` and `.aesr-alert--warning` after L263) |
| `src/options.html` | config | static | `src/popup.html` | role-match (inline `<style>` removal + `<link>` add + `style=` attribute audit) |
| `src/supporters.html` | config | static | `src/popup.html` | role-match (same removal + link + class-addition pattern) |
| `src/credits.html` | config | static | `src/popup.html` | role-match (same removal + link + class-addition pattern) |
| `src/updated.html` | config | static | `src/popup.html` | role-match (same removal + link + class-addition pattern) |
| `src/js/options.js` | utility | request-response | `src/js/popup.js` | role-match (`updateMessage()` refactor mirrors `showMessage` → state renderer; `.darkMode` removal mirrors popup.js Phase 2 change) |

---

## Pattern Assignments

### `src/css/tokens.css` (config, static) — MODIFIED

**Analog:** `src/css/tokens.css` (self) — add one token to two existing dark layers

**Token gap (BLOCKING prerequisite):** `--color-bg-button-primary-hover` is defined only in Layer 1 (line 30). Layer 2 (lines 83–119) and Layer 3a (lines 122–156) omit it, so dark-mode primary button hover falls through to the light value `#004a9e`.

**Layer 1 (light) — existing reference** (tokens.css line 30):
```css
--color-bg-button-primary-hover: #004a9e;
```

**Layer 2 structure (OS dark media query)** (tokens.css lines 82–119):
```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]):not([data-theme="dark"]) {
    /* ... existing tokens ... */
    --color-bg-button-primary: #42b4ff;
    --color-bg-button-normal-hover: #1b232d;
    /* INSERT: --color-bg-button-primary-hover: #1a73e8; */
```

**Layer 3a structure (explicit dark override)** (tokens.css lines 121–156):
```css
:root[data-theme="dark"] {
    /* ... existing tokens ... */
    --color-bg-button-primary: #42b4ff;
    --color-bg-button-normal-hover: #1b232d;
    /* INSERT: --color-bg-button-primary-hover: #1a73e8; */
```

**Insertion rule:** Add `--color-bg-button-primary-hover: #1a73e8;` immediately after `--color-bg-button-primary: #42b4ff;` in both Layer 2 (line ~105) and Layer 3a (line ~143). This mirrors the sibling placement in Layer 1 (lines 29–30). The `#1a73e8` value (blue-700) is the Cloudscape dark hover recommendation from Phase 1 STACK.md; verify visually in devtools before shipping.

---

### `src/css/options.css` (component, transform) — NEW FILE

**Analog:** `src/css/popup.css`

**File-level header comment pattern** (popup.css lines 1–5):
```css
/* popup.css — Popup-surface styles for AESR (Phase 2).
   All classes use the .aesr-* prefix convention (locked in Phase 1).
   All color/size values use var(--token) — no hardcoded hex, no hardcoded px for
   dimensions that have a token. No @import, no !important, no color-mix(), no external
   font or icon URL. */
```
Copy this style for `options.css`, replacing "Popup-surface styles" and "(Phase 2)" with "Options-page styles (Phase 3)".

**Section separator pattern** (popup.css lines 7–9):
```css
/* ==========================================================================
   1. Body / popup chrome
   ========================================================================== */
```
Use the same `/* === N. Section === */` banner for each logical section in `options.css`.

**Token-only property pattern** (components.css lines 51–62):
```css
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
Every color, size, spacing, font value is `var(--token)`. No hex. No hardcoded px where a spacing token exists. Tab-indented. `options.css` follows this rule identically.

**What `options.css` must cover** (from UI-SPEC §Layout & Sizing Contract, §Component Inventory):

1. `body` — `display: flex; flex-direction: row; background-color: var(--color-bg-input-disabled)`
2. `.aesr-options-pane` — common pane scaffold (used on `#settingPane` and `#howto`)
3. `#settingPane` — `max-width: 660px`, `min-width: 320px`, `border-right: 1px solid var(--color-border-divider)`
4. `#howto` — `flex: 1`, `min-width: 280px`, `background-color: var(--color-bg-input-disabled)`
5. `.aesr-section-head` — vertical rhythm for `<h2>` section heads
6. `.aesr-form-row` — replaces `.formItem` (`display: flex; align-items: center; gap: var(--space-xs)`)
7. `.aesr-settings-list` and `li` — replaces `#settings ul` and `#settings ul li`
8. `.aesr-storage-row` — replaces `.radioGroup` for storage selector area
9. `.aesr-color-pair` — inline flex container for `#colorPicker` + `#colorValue`
10. `#colorPicker` — `border: 1px solid var(--color-border-input)`, `height: 24px`, `width: 32px`
11. `#colorValue` — `font-family: var(--font-family-mono); width: 9ex`
12. `#awsConfigTextArea` — overrides on `.aesr-textarea`: `min-height: 320px`, `max-height: calc(100vh - 320px)`, `white-space: pre`, `margin: var(--space-xs) 0`, `resize: vertical`
13. `.aesr-options-pane code` — monospace, bold, heading color (scoped to options pane — NOT unscoped `code`)
14. `#howto pre` or `.aesr-pre` — code block background, border, monospace (scoped to howto pane)
15. Inline style removals moved to CSS: `#msgSpan`, `#remoteMsgSpan` margins; Config Hub input widths; save button row margin; `#switchConfigHubButton` margin

**Concrete component specs** (from UI-SPEC §Component Inventory — copy verbatim):
```css
/* === Pane scaffold === */
.aesr-options-pane {
  box-sizing: border-box;
  height: 100vh;
  overflow-y: auto;
  padding: var(--space-m) var(--space-xxl);
  background-color: var(--color-bg-layout);
}

#settingPane {
  max-width: 660px;
  width: 100%;
  min-width: 320px;
  border-right: 1px solid var(--color-border-divider);
}

#howto {
  flex: 1;
  min-width: 280px;
  background-color: var(--color-bg-input-disabled);
  padding-bottom: var(--space-xxl);
}

/* === Section head === */
.aesr-section-head {
  margin-block: var(--space-s) var(--space-xs);
}

/* === Form row === */
.aesr-form-row {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  min-height: 32px;
}

.aesr-form-row label {
  display: inline-block;
  min-width: 7em;
  color: var(--color-text-label);
  font-weight: var(--font-weight-normal);
}

/* === Settings list === */
.aesr-settings-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xxs);
}

.aesr-settings-list li {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  min-height: 26px;
  color: var(--color-text-body);
  font-size: var(--font-size-body-m);
}

/* === Storage row === */
.aesr-storage-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.aesr-storage-row label {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xxs);
}

/* === Color picker pair === */
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

/* === INI editor overrides (on top of .aesr-textarea base) === */
#awsConfigTextArea {
  min-height: 320px;
  max-height: calc(100vh - 320px);
  white-space: pre;
  margin: var(--space-xs) 0;
  resize: vertical;
}

/* === Scoped code/pre === */
.aesr-options-pane code {
  font-family: var(--font-family-mono);
  color: var(--color-text-heading);
  font-weight: var(--font-weight-bold);
}
```

**CRITICAL scoping rule:** `code { }` and `pre { }` MUST be scoped to `.aesr-options-pane` or `#howto`. Do NOT add unscoped `code`/`pre` rules — they would leak to popup. Mirror the scoping pattern from popup.css section separators.

**What NOT to redeclare:** Font-size, color, border, padding on `.aesr-input`, `.aesr-btn`, `.aesr-textarea`, `.aesr-checkbox`, `.aesr-radio` — those are in `components.css`. `options.css` only adds context/layout rules. Do not weaken or override the `:focus-visible` ring from `base.css`.

---

### `src/css/pages.css` (component, transform) — NEW FILE

**Analog:** `src/css/popup.css`

**Same authoring conventions as `options.css`** — same header comment format (adapted for "Aux-page styles (Phase 3)"), same section separators, same tab indentation, same token-only rule.

**What `pages.css` must cover** (from UI-SPEC §Component Inventory):

1. `.aesr-article` — single-column document container (used on `<body>` or a wrapper `<div>` in all three aux pages)
2. `.aesr-article section` — vertical rhythm
3. `.aesr-article p, .aesr-article li` — margin rhythm
4. `.aesr-article code` — scoped monospace (must not affect popup)
5. `.aesr-pre` — shared code block shell (used in aux pages and howto pane)
6. `.aesr-article blockquote` — tokenized (replaces hardcoded `border: 1px solid #666` in updated.html)
7. `.aesr-article .aesr-heading-accent` — `color: var(--color-text-accent)` (replaces `style="color:#0099f2"` in updated.html)
8. `#textareaKeyCode` — golden key textarea (replaces inline `style="width: 62ex; height: 27em"` in supporters.html)
9. Any supporters-page status label styling (replaces the `<span style="color:#a00">` on the warning in supporters.html)

**Concrete component specs** (from UI-SPEC §Component Inventory):
```css
/* === Article container === */
.aesr-article {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-m) var(--space-xxl);
  background-color: var(--color-bg-layout);
  color: var(--color-text-body);
  font-size: var(--font-size-body-m);
  line-height: 1.75;  /* intentional exception — document reading rhythm */
}

.aesr-article section {
  margin-block: var(--space-xxl) 0;
}

.aesr-article p,
.aesr-article li {
  margin-block: var(--space-xxs) 0;
}

/* === Scoped code/pre === */
.aesr-article code {
  font-family: var(--font-family-mono);
  color: var(--color-text-heading);
  font-weight: var(--font-weight-bold);
}

/* === Pre block (.aesr-pre shared) === */
.aesr-pre {
  box-sizing: border-box;
  background-color: var(--color-bg-input-disabled);
  border: 1px solid var(--color-border-divider);
  border-radius: var(--radius-input);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-body-m);
  line-height: var(--line-height-body-m);
  padding: var(--space-xs);
  overflow-x: auto;
  white-space: pre;
}

/* === Blockquote === */
.aesr-article blockquote {
  border: 1px solid var(--color-border-divider);
  border-radius: var(--radius-input);
  white-space: pre-line;
  width: 22em;
  padding: var(--space-xxs) var(--space-xs);
  margin: var(--space-m) var(--space-xxl);
}

/* === Accent heading === */
.aesr-article .aesr-heading-accent {
  color: var(--color-text-accent);
}

/* === Golden Key textarea === */
#textareaKeyCode {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-body-m);
  width: 62ex;
  height: 27em;
  border: 1px solid var(--color-border-input);
  border-radius: var(--radius-input);
  padding: var(--space-xs);
  background-color: var(--color-bg-input);
  color: var(--color-text-body);
  line-height: var(--line-height-body-m);
}
```

---

### `src/css/components.css` (component, static) — MODIFIED

**Analog:** `src/css/components.css` (self) — add two modifier classes after existing `.aesr-alert--error` block

**Existing alert base and error modifier** (components.css lines 241–263 — do not modify):
```css
.aesr-alert {
	display: flex;
	flex-direction: column;
	padding: var(--space-xs) var(--space-m);
	border-radius: var(--radius-alert);
	gap: var(--space-xxs);
}

.aesr-alert--error {
	border-left: 4px solid var(--color-text-status-error);
	background-color: var(--color-bg-container);
}

.aesr-alert__heading {
	font-size: var(--font-size-body-m);
	font-weight: var(--font-weight-bold);
	color: var(--color-text-heading);
}

.aesr-alert__body {
	font-size: var(--font-size-body-m);
	color: var(--color-text-status-error);
}
```

**Insertion point:** Immediately after line 263 (end of `.aesr-alert__body` block), before any next section.

**New modifier classes to insert** (from UI-SPEC §Alert Variants):
```css
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

The specificity of `.aesr-alert--success .aesr-alert__body` (0,2,0) beats `.aesr-alert__body` (0,1,0), correctly overriding the error color from the base rule. No changes to any other existing block.

---

### `src/options.html` (config, static) — MODIFIED

**Analog:** `src/popup.html` — inline `<style>` removal + `<link>` add + `style=` attribute audit

**Current head block** (options.html lines 1–10 — Phase 1 output already in place):
```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>AWS Extend Switch Roles - Configuration</title>
<script src="js/theme-init.js"></script>
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/components.css">
<script type="module" src="js/options.js"></script>
```

**Phase 3 head after transformation** — add `<link>` for `options.css` after `components.css`; move `<script>` before `</head>` (it is already after the link block):
```html
<link rel="stylesheet" href="css/components.css">
<link rel="stylesheet" href="css/options.css">  <!-- Phase 3 NEW -->
<!-- inline <style> block REMOVED (options.html lines 11–140) -->
<script type="module" src="js/options.js"></script>
```

**Inline `<style>` block to remove** (options.html lines 11–140): The full 130-line block including `.darkMode` rules, `.pane`, `.formItem`, `.radioGroup`, `.success`, `.warn` — all 130 lines deleted. This mirrors exactly how popup.html's lines 9–134 were removed in Phase 2.

**Inline `style=` attribute audit** (must mirror popup.html Phase 2 pattern):

| Element | Current inline style (options.html) | Phase 3 action |
|---------|--------------------------------------|----------------|
| `#configHubPanel` | `style="display: none"` | **KEEP** — JS toggles; Playwright contract |
| `#switchConfigHubButton` | `style="margin-left: auto"` | Remove — move margin to `options.css` |
| `#msgSpan` | `style="margin-left:12px"` | Remove — move margin to `options.css` |
| `#remoteMsgSpan` | `style="margin-left:12px"` | Remove — move margin to `options.css` |
| `#colorPicker` `<b style="margin-left: 6px">` | margin on `<b>` | Remove — move to `options.css` |
| `<div style="float:right">` around link | float | Remove — let document flow or move to `options.css` |
| `<div style="margin-top:12px">` (save button row) | margin | Remove — replace with class in `options.css` |
| `#configHubDomain` `style="width: 15ex"` | width | Remove — move to `options.css` |
| `#configHubClientId` `style="width: 40ex"` | width | Remove — move to `options.css` |
| `#configSenderIdText` `style="width: 48ex"` | width | Remove — move to `options.css` |

**Class additions to HTML elements** (options.html):

| Element | Current class | Phase 3 class |
|---------|---------------|----------------|
| `#settingPane` div | `class="pane"` (line 143) | `class="aesr-options-pane"` |
| `#howto` div | `class="pane"` (line 209) | `class="aesr-options-pane"` |
| `.radioGroup` (storage) | `class="radioGroup"` (line 147) | `class="aesr-storage-row"` |
| `#saveButton` | (no class) | `class="aesr-btn aesr-btn--primary"`; also change text content from `&amp;nbsp; Save &amp;nbsp;` → `Save Configuration` (UI-SPEC §Copywriting) |
| Config Hub buttons (`#cancel*`, `#connect*`, `#disconnect*`, `#reload*`, `#switch*`) | (no class) | `class="aesr-btn aesr-btn--normal"` |
| `#configHubDomain`, `#configHubClientId`, `#configSenderIdText` | (no class) | `class="aesr-input"` |
| `#awsConfigTextArea` | (no class) | `class="aesr-textarea"` |
| All 5 checkboxes | (no class) | `class="aesr-checkbox"` |
| All radios (storage + visual mode) | (no class) | `class="aesr-radio"` |
| `#settings ul` | (no class) | `class="aesr-settings-list"` |
| `<h1>Settings</h1>` (line 186) | (no class) | `<h2 class="aesr-section-head">Settings</h2>` |
| `<h1>Extension API</h1>` (line 201) | (no class) | `<h2 class="aesr-section-head">Extension API</h2>` |
| All `.formItem` divs (lines 169, 173, 203) | `class="formItem"` | `class="aesr-form-row"` |
| Color picker + value row | `<div style="display: flex">` (implicit) | Wrap in `<div class="aesr-color-pair">` |
| `<span id="msgSpan">` (line 164) | `<span>` | `<div>` — tag change; ID preserved |
| `<span id="remoteMsgSpan">` (line 182) | `<span>` | `<div>` — tag change; ID preserved |
| All `<pre>` in `#howto` | (no class) | `class="aesr-pre"` |
| `<strong class="warn">` (options.html line 339, howto pane) | `class="warn"` | Replace with `class="aesr-alert aesr-alert--warning"` shell, or (planner discretion) wrap text in a `<span style="color: var(--color-text-status-warning)">` — the `.warn` CSS rule disappears with the inline `<style>` block; the element must not be left with a dangling unstyled class |

**Preserved unchanged — must not be modified:**
- All element IDs: `#awsConfigTextArea`, `#saveButton`, `#msgSpan`, `#configStorageSyncRadioButton`, `#configStorageLocalRadioButton`, `#colorPicker`, `#colorValue`, `#standalonePanel`, `#configHubPanel`, `#cancelConfigHubButton`, `#connectConfigHubButton`, `#disconnectConfigHubButton`, `#reloadConfigHubButton`, `#switchConfigHubButton`, `#remoteMsgSpan`, `#configHubDomain`, `#configHubClientId`, `#configSenderIdText`, all `#*VisualRadioButton`, all `#hidesAccountId*`, `#showOnlyMatchingRoles*`, etc.
- `#configHubPanel` `style="display: none"` attribute — JS toggles this; Playwright contract
- `<h1>Configuration</h1>` — stays as `<h1>` (page title)
- `<h1>How to configure</h1>` — stays as `<h1>` (howto pane title)
- `<s>` element around the disabled `autoAssumeLastRole` setting

---

### `src/supporters.html` (config, static) — MODIFIED

**Analog:** `src/popup.html` — same inline `<style>` removal + `<link>` add pattern

**Current head block** (supporters.html lines 1–9):
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Supporters Program | AWS Extend Switch Roles</title>
  <script src="js/theme-init.js"></script>
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/components.css">
```

**Phase 3 head after transformation:**
```html
  <link rel="stylesheet" href="css/components.css">
  <link rel="stylesheet" href="css/pages.css">  <!-- Phase 3 NEW -->
  <!-- inline <style> block REMOVED (supporters.html lines 10–49) -->
```

**Inline `<style>` block to remove** (supporters.html lines 10–49): All 40 lines including `.sponsorButton`, `#textareaKeyCode`, hardcoded `background-color: #fafafa`, `color: #2d2d2d`.

**Changes to body/elements:**
- Add `class="aesr-article"` to `<body>` (line 51) or a wrapper `<div>`
- `<a class="sponsorButton">` → `class="aesr-btn aesr-btn--normal"` (replaces `.sponsorButton` styling)
- Remove `style="width: 62ex; height: 27em"` from `<textarea id="textareaKeyCode">` (line 106) — defined in `pages.css`
- Remove `style="display: flex"` on key-code flex wrapper (line 105) — move to `pages.css`
- Remove `style="margin-left: 20px"` on status div (line 107) — move to `pages.css`
- Replace `<span style="color:#a00; font-size: small; ...">` (line 88) — use `var(--color-text-status-error)` + `var(--font-size-body-s)` via class in `pages.css`

**Preserved unchanged — must not be modified:**
- `#textareaKeyCode` element ID
- `#keyCodeValid` element ID — with its `style="display: none"` attribute (**KEEP** — JS visibility contract; Playwright `toBeHidden()` test)
- `#keyCodeInvalid` element ID — with its `style="display: none"` attribute (**KEEP**)
- `<script type="module" src="js/supporters.js">` placement after `</body>` — do NOT move to `<head>`

---

### `src/credits.html` (config, static) — MODIFIED

**Analog:** `src/popup.html` — same inline `<style>` removal + `<link>` add pattern

**Current head block** (credits.html lines 1–9):
```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>AWS Extend Switch Roles - Credits</title>
<script src="js/theme-init.js"></script>
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/components.css">
```

**Phase 3 head after transformation:**
```html
<link rel="stylesheet" href="css/components.css">
<link rel="stylesheet" href="css/pages.css">  <!-- Phase 3 NEW -->
<!-- inline <style> block REMOVED (credits.html lines 10–44) -->
```

**Changes to body/elements:**
- Remove `<div class="pane" id="credits">` wrapper OR apply `class="aesr-article"` to it (credits.html line 47)
- Add `class="aesr-pre"` to the `<pre>` block (credits.html line 51) — MIT license block
- Fix missing `</html>` closing tag at end of file (trivial; do it as part of this pass)

**Inline `<style>` block to remove** (credits.html lines 10–44): All 35 lines including `.pane` hardcoded `background-color: #eee`.

---

### `src/updated.html` (config, static) — MODIFIED

**Analog:** `src/popup.html` — same inline `<style>` removal + `<link>` add pattern

**Current head block** (updated.html lines 1–9):
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Update Notice | AWS Extend Switch Roles</title>
  <script src="js/theme-init.js"></script>
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/components.css">
```

**Phase 3 head after transformation:**
```html
  <link rel="stylesheet" href="css/components.css">
  <link rel="stylesheet" href="css/pages.css">  <!-- Phase 3 NEW -->
  <!-- inline <style> block REMOVED (updated.html lines 10–39) -->
```

**Inline `<style>` block to remove** (updated.html lines 10–39): All 30 lines including `blockquote`, `code`, and `section p` hardcoded styles.

**Changes to body/elements:**
- Add `class="aesr-article"` to `<body>` (line 41) or a wrapper `<div>`
- Remove `<h1 style="margin:0">` inline style (line 42) — `base.css` already sets `h1 { margin: 0 }`; redundant
- `<h2 style="color:#0099f2">` → `<h2 class="aesr-heading-accent">` (line 45) — remove inline style, add class
- `<blockquote>` tokens handled by `.aesr-article blockquote` rule in `pages.css` — no class needed on the element
- `<hr style="margin:18px 0">` → `<hr class="aesr-divider">` — replace inline style with token-driven class
- `<h2>6.1.0 <span style="color:rgb(221, 63, 0)">New version!</span></h2>` — replace `style="color:..."` on the `<span>` with `class="aesr-heading-accent"` (uses `--color-text-accent`) or leave as-is (planner discretion — it is a content-specific decorative color, not a UI semantic color; research §Open Questions item 2 notes both approaches are acceptable)

---

### `src/js/options.js` (utility, request-response) — MODIFIED

**Analog:** `src/js/popup.js` — Phase 2's `showMessage` → typed state renderers mirrors the `updateMessage()` refactor here; Phase 2's `.darkMode` removal mirrors the same removal in options.js

**Current `updateMessage()` implementation** (options.js lines 247–264):
```javascript
function updateMessage(elId, msg, cls = 'success') {
  const el = elById(elId);
  const span = document.createElement('span');
  span.className = cls;
  span.textContent = msg;
  const child = el.firstChild;
  if (child) {
    el.replaceChild(span, child);
  } else {
    el.appendChild(span);
  }

  if (cls === 'success') {
    setTimeout(() => {
      span.remove();
    }, 2500);
  }
}
```

**Replacement — `updateMessage()` refactored pattern** (from RESEARCH.md §Code Examples, mirroring popup.js `showError()` at lines 89–100):
```javascript
function updateMessage(elId, msg, cls = 'success') {
  const el = elById(elId);
  const modifierMap = { success: 'aesr-alert--success', warn: 'aesr-alert--warning' };
  const modifier = modifierMap[cls] || 'aesr-alert--error';
  const alertDiv = document.createElement('div');
  alertDiv.className = `aesr-alert ${modifier}`;
  const body = document.createElement('p');
  body.className = 'aesr-alert__body';
  body.textContent = msg;   // textContent, not innerHTML — msg may contain error content
  alertDiv.appendChild(body);
  el.replaceChildren(alertDiv);

  if (cls === 'success') {
    setTimeout(() => { alertDiv.remove(); }, 2500);
  }
}
```

**Key differences from current:** `<span>` → `<div>` shell; `class="cls"` → `class="aesr-alert aesr-alert--[modifier]"`; inner `<p class="aesr-alert__body">`; `replaceChild` → `replaceChildren` (cleaner); 2500ms success timeout preserved. `textContent` NOT `innerHTML` — same pattern as popup.js line 94 (`body.textContent = msg`).

**DOM-API construction pattern analog** (popup.js lines 89–100):
```javascript
function showError(msg) {
  const alert = document.createElement('div');
  alert.className = 'aesr-alert aesr-alert--error';
  const body = document.createElement('p');
  body.className = 'aesr-alert__body';
  body.textContent = msg;
  alert.appendChild(body);
  noMainEl.innerHTML = '';
  noMainEl.appendChild(alert);
  noMainEl.style.display = 'block';
  mainEl.style.display = 'none';
}
```
`updateMessage()` uses the same `createElement` → `className` → `textContent` construction pattern.

**`.darkMode` removal — two locations:**

Location 1 — `onchange` handler (options.js lines 191–199). Delete lines 194–198; keep lines 191–193 and 199:
```javascript
// KEEP (lines 191–193):
elById('defaultVisualRadioButton').onchange = elById('lightVisualRadioButton').onchange = elById('darkVisualRadioButton').onchange = function() {
  const visualMode = this.value;
  syncStorageRepo.set({ visualMode });
// DELETE lines 194–198:
//   if (visualMode === 'dark' || (visualMode === 'default' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
//     document.body.classList.add('darkMode');
//   } else {
//     document.body.classList.remove('darkMode');
//   }
// KEEP (line 199):
}
```

Location 2 — initial load (options.js lines 218–222). Delete lines 220–222; keep line 219 and the block that follows:
```javascript
// KEEP (line 219):
elById(visualMode + 'VisualRadioButton').checked = true;
// DELETE lines 220–222:
//   if (visualMode === 'dark' || (visualMode === 'default' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
//     document.body.classList.add('darkMode');
//   }
// KEEP (line 224):
loadConfigIni(StorageProvider.getRepositoryByKind(configStorageArea)).then(cfgText => {
```

**Parallel analog** (popup.js Phase 2 `.darkMode` removal — these exact lines were removed):
```javascript
// REMOVED from popup.js in Phase 2:
if (mode === 'dark' || (mode === 'default' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.body.classList.add('darkMode');
}
```

**Preserved unchanged — must not be modified:**
- Lines 1–8: Import block
- Lines 10–16: `elById`, `brw`, `sessionMemory`
- Lines 22–56: All button `onclick` handlers (Config Hub buttons)
- Lines 58–74: `textArea.onselect` handler (color picker integration)
- Lines 76–93: `saveButton.onclick` handler including `focusConfigTextArea(lastError.line)` call
- Lines 95–153: Boolean settings, tab-grouping disable, remote connect info, Golden Key logic
- Lines 154–189: `configSenderIdText.onchange` and storage area radio change handlers
- Lines 191–193, 199: Visual Mode `onchange` — keep `syncStorageRepo.set({ visualMode })`; delete only the `.darkMode` lines
- Lines 201–227: `syncStorageRepo.get()` block — keep entirely except the 3 `.darkMode` lines at 220–222
- Lines 230–245: `saveConfiguration()` async function
- Lines 266–289: `updateRemoteFieldsState()` — untouched; inline `style.display` toggle contract (see Shared Patterns)
- Lines 291–305: `focusConfigTextArea()`

---

## Shared Patterns

### `aesr-` Prefix for All New Classes
**Source:** `src/css/components.css` (entire file) — locked in Phase 1
**Apply to:** All new class names in `options.css` and `pages.css`
```css
/* Pattern: every authored class uses aesr- prefix */
.aesr-options-pane { ... }
.aesr-form-row { ... }
.aesr-article { ... }
```
Exception: existing classes `pane`, `formItem`, `radioGroup` in `options.html` are renamed to their `aesr-*` equivalents. Classes that do not exist in CSS files (e.g., `mainPane`, `headSquare`) follow the same no-change rule as in Phase 2.

### Token-Only Color Discipline
**Source:** `src/css/components.css` lines 51–62 (`.aesr-input`), `src/css/popup.css` (entire file)
**Apply to:** All rules in `options.css` and `pages.css`
No hex values in CSS. All color references must be `var(--color-*)`. All spacing references must be `var(--space-*)`. All radius references must be `var(--radius-*)`.

### Tab Indentation
**Source:** `src/css/components.css` (verified: all declarations are tab-indented), `src/css/popup.css` (same)
**Apply to:** `src/css/options.css`, `src/css/pages.css`, additions to `src/css/components.css`
Tab character (`\t`) for all CSS property declarations. No spaces.

### Inline `style="display:..."` Toggle Contract
**Source:** `src/js/options.js` lines 266–289 (`updateRemoteFieldsState()`)
**Apply to:** ALL show/hide logic in `options.js` — no changes to this function; no CSS class toggle replacement
```javascript
// PRESERVED VERBATIM — from options.js lines 266–289:
function updateRemoteFieldsState(state) {
  if (state === 'connected') {
    elById('configHubPanel').style.display = 'block';
    elById('standalonePanel').style.display = 'none';
    // ...
    elById('disconnectConfigHubButton').style.display = 'inline-block';
    elById('reloadConfigHubButton').style.display = 'inline-block';
  } else if (state === 'disconnected') {
    elById('configHubPanel').style.display = 'block';
    elById('standalonePanel').style.display = 'none';
    elById('cancelConfigHubButton').style.display = 'inline-block';
    elById('connectConfigHubButton').style.display = 'inline-block';
    elById('disconnectConfigHubButton').style.display = 'none';
    elById('reloadConfigHubButton').style.display = 'none';
  } else { // not shown
    elById('standalonePanel').style.display = 'block';
    elById('configHubPanel').style.display = 'none';
  }
}
```
This is the Phase 3 analog of Phase 2's `#main`/`#noMain` toggle contract. `el.style.display` MUST NOT be replaced with `el.classList.toggle('hidden')` or similar.

### DOM-API Construction (No innerHTML Concatenation)
**Source:** `src/js/popup.js` lines 89–100 (`showError`) + lines 41–51 (`showNotOnAws`)
**Apply to:** `updateMessage()` refactor in `options.js`
```javascript
// Safe pattern — textContent for user-visible strings, createElement for structure
const body = document.createElement('p');
body.className = 'aesr-alert__body';
body.textContent = msg;   // never: body.innerHTML = '<p>' + msg + '</p>'
```
`msg` in `updateMessage()` may contain parser error text or server-influenced error messages; `textContent` prevents injection.

### Inline `<style>` Removal + `<link>` Add = Atomic Commit per Surface
**Source:** Phase 2 `popup.html` pattern (remove lines 9–134, add `<link>` line 9)
**Apply to:** All 4 HTML files (`options.html`, `supporters.html`, `credits.html`, `updated.html`)
For each surface: author the CSS file AND add the `<link>` AND remove the inline `<style>` in the same commit. Splitting across commits leaves the page unstyled. This is the same atomicity constraint as Phase 2 popup.html.

### `<span>` → `<div>` + `updateMessage()` = Must Land in Same Commit
**Source:** RESEARCH.md §Pitfall 2
**Apply to:** `src/options.html` + `src/js/options.js`
The `<span id="msgSpan">` → `<div>` and `<span id="remoteMsgSpan">` → `<div>` HTML tag changes are co-dependent with the `updateMessage()` refactor. `.aesr-alert` is `display: flex` (block); a `<span>` container renders as inline-flex, breaking the alert layout. These two changes MUST land in the same commit.

---

## No Analog Found

All 9 Phase 3 files have clear analogs (self or Phase 2 CSS/JS/HTML). No greenfield entries without a pattern source.

---

## Known Limitation (Planner Must Document)

**Phase 3 → Phase 4 transitional regression (ACCEPTED):** After removing the `.darkMode` class toggle from `options.js` (lines 194–198, 220–222), clicking a Visual Mode radio writes to `chrome.storage.sync` but produces **no immediate visual change** — the page must reload to apply the new theme. This is a deliberate, one-phase regression. Phase 4 restores live repaint via `data-theme` write + `storage.onChanged`. Planner MUST call this out in the Phase 3 plan's Notes / Known Limitations section so reviewers do not flag it as a bug.

---

## Metadata

**Analog search scope:** `src/css/`, `src/js/`, `src/options.html`, `src/popup.html`, `src/supporters.html`, `src/credits.html`, `src/updated.html`, `.planning/phases/02-popup-surface/02-PATTERNS.md`
**Files scanned:** 11 (7 source files, 2 CSS files, 1 Phase 2 PATTERNS, 1 research doc)
**Pattern extraction date:** 2026-05-28
**Key constraint:** The `<span>` → `<div>` tag change for `#msgSpan`/`#remoteMsgSpan` and the `updateMessage()` refactor MUST be in the same commit. Similarly, each surface's CSS authoring + `<link>` + inline `<style>` removal is atomic per surface.
