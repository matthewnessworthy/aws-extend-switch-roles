# Phase 2: Popup Surface — Research

**Researched:** 2026-05-28
**Domain:** Browser-extension popup HTML/CSS/JS — token application, state injection, DOM refactor
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Option E confirmed — exact hex fill + 1px theme-aware contrast border on the swatch. Zero color math, zero data mutation. Stored hex value and console-header path are never touched. Shared rule with OPT-06 (Phase 3) — do not re-litigate.
- **D-01a (Claude's Discretion):** Border implementation details (which token, exact values) — planner picks from STACK.md token palette.
- **D-02:** Two-line layout. Role name on line 1 (bold), account ID on line 2 (smaller, muted). `create_role_list_item.js` gets a DOM update to wrap name and account in separate elements. `suffixAccountId` inline pattern replaced.
- **D-03:** Rounded-square swatch (~4px radius). No full circle; no hard square. `hidesAccountId` flag: second line simply absent.
- **D-04:** Keep two-column layout, reskin only. `mainPane` + sidebar flex structure unchanged. `.optionMenu` and its `<li>/<a>` DOM is unchanged — apply tokens only.
- **D-04a (Claude's Discretion):** Whether to add a subtle divider after "Configuration" — planner picks.
- **D-05:** "Not on AWS page" message: `"Navigate to the AWS console to switch roles."`
- **D-06:** "On AWS page, no matching roles": short preamble + "Open Configuration" CTA link reusing `#openOptionsLink` navigation path. Exact copy: planner writes.
- **D-07:** Loading state: CSS-only spinner (Phase 1 `components.css` spinner shell) + `"Loading roles…"` label. No skeleton rows.

### Claude's Discretion

- Exact contrast border token values / approach for the swatch (D-01a)
- Sidebar grouping/dividers (D-04a)
- Two-line item DOM structure (wrapper class names, element types) within `create_role_list_item.js`
- Exact loading state and empty state container structure (whether `#noMain` is reused with state classes, or split into separate elements)
- `popup.css` class naming convention (follow `aesr-` prefix convention from `components.css`)

### Deferred Ideas (OUT OF SCOPE)

- Theme-toggle placement and 3-state shape → Phase 4
- Per-profile `color` × console-header interaction → out of scope for the whole milestone
- A11y audit → Phase 5
- v2 popup polish items POP-07/08/09
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| POP-01 | Popup role list + chrome in Cloudscape-native treatment, light+dark themes, 600×600 cap, token-driven `popup.css` replacing inline `<style>` block | `popup.html:9–134` inline `<style>` removed; `popup.css` linked after `components.css` |
| POP-02 | Long role names / account IDs truncate gracefully; filter stays usable at minimum width | `createDisplayName()` in `create_role_list_item.js:72–94` already handles 64-char; two-line CSS adds `text-overflow: ellipsis` per line; UI-SPEC §Role List Item |
| POP-03 | Empty states (not-on-AWS-console vs no-matching-roles), loading state, error state | `showMessage()` at `popup.js:41–47` is the current single-`<p>` mutator; D-05/D-06/D-07 lock the content; `#noMain` is the target container |
| POP-04 | Loading state while roles resolve | Integration point: `popup.js:107` — currently awaits `loadInfo` with `#noMain` hidden; loading branch is new |
| POP-05 | Keyboard nav preserved (Ctrl+Shift+,, arrows, type-to-filter), focus-visible in both themes, brittle test selectors preserved | Show/hide via `el.style.display` MUST remain; `#roleFilter`, `#roleList li.selected`, `li[style*="block"]` must survive; `create_role_list_item.test.js` innerHTML assertions MUST be updated |
| POP-06 | Per-profile color swatch AA-contrast in both themes; stored value unchanged | D-01 (Option E) locked: `headSquare.style.backgroundColor` assignment unchanged; 1px border added via `var(--color-border-input)` in `popup.css` |
</phase_requirements>

---

## Summary

Phase 2 is a CSS + targeted-JS refactor. No new packages. The entire token system and component shells (spinner, empty-state, alert) are already delivered by Phase 1. This phase's work is: (1) author `popup.css` consuming Phase 1 tokens for popup-specific layout/color, (2) remove the 125-line inline `<style>` block and `.darkMode` rules from `popup.html`, (3) update `create_role_list_item.js` to produce the two-line DOM (D-02), (4) replace the `showMessage()` single-`<p>` pattern with typed-state renderers in `popup.js` (D-05/D-06/D-07), and (5) remove the `popup.js:79` `.darkMode` class-add. Build scripts already copy `src/css` into both builds (Phase 1 delivered this) — Phase 2 only adds `popup.css` to the copy scope.

The critical complexity is that the `create_role_list_item.test.js` unit tests assert exact `innerHTML` strings against the current flat DOM. Every test in that file will fail when D-02 lands. All five unit test `innerHTML` assertions must be updated in the same PR as the source change. This is POP-05's "or specs updated deliberately" clause — and it is guaranteed to trigger.

**Primary recommendation:** Plan in two logical task groups: (1) CSS authoring + HTML wiring (no JS regression risk), (2) JS updates (`create_role_list_item.js` + `popup.js` + test updates). Never split the `create_role_list_item.js` DOM change from its test update.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Token consumption (color, spacing, radius) | Browser / Client (CSS engine) | — | `var(--token)` resolved by CSS engine at paint time; no JS involved |
| FOUC / pre-paint theming | Browser / Client (parse stream) | — | `theme-init.js` already wired in Phase 1; Phase 2 inherits |
| Role list DOM / two-line layout | Browser / Client (DOM + CSS) | — | `create_role_list_item.js` builds DOM; `popup.css` styles it |
| State injection (empty/loading/error) | Browser / Client (JS → DOM) | — | `popup.js` sets `#noMain` innerHTML; CSS classes control visual style |
| `#noMain` show/hide | Browser / Client (inline style toggle) | — | MUST remain `el.style.display = 'block'/'none'`; drives brittle Playwright selectors |
| Color swatch fill | Browser / Client (inline style) | — | `headSquare.style.backgroundColor` set by JS from stored hex; CSS adds border only |
| Build delivery of `popup.css` | Static / Build | — | `\cp -r src/css` in `build.sh` already covers it; no new build-script edits needed unless `popup.css` needs to be singled out |

---

## Standard Stack

### Core (inherited — no new packages)

| Asset | Version | Purpose | Source |
|-------|---------|---------|--------|
| `src/css/tokens.css` | Phase 1 output | All color/type/spacing tokens | `[VERIFIED: live codebase]` |
| `src/css/components.css` | Phase 1 output | Spinner shell, empty-state shell, alert shell, `.aesr-input` | `[VERIFIED: live codebase]` |
| `src/css/base.css` | Phase 1 output | Global reset, `:focus-visible` ring, system font stack | `[VERIFIED: live codebase]` |

**No new runtime or dev packages are installed in Phase 2.** Zero. `build.sh` already copies `src/css/` into both browser dist directories (line 34: `\cp -r src/css dist/$brw/`). `build_test.sh` already copies `src/css/` to `test/extension/` (line 10: `cp -r src/css $destdir/`). Adding `popup.css` to `src/css/` means it's automatically included in both copy operations without script edits.

---

## Package Legitimacy Audit

**No packages are installed in Phase 2.** Zero new runtime or dev dependencies. The zero-new-deps constraint (CLAUDE.md, REQUIREMENTS.md FND-02) applies to the entire milestone.

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
  tokens.css → base.css → components.css → [popup.css NEW]
                                                  |
              CSS engine resolves var(--token)  <─┘
                     at paint time

PHASE 2 RUNTIME STATE FLOW

  window.onload
    │
    ├── remove: storageRepo.get(['visualMode']).then(body.classList.add('darkMode'))  ← DELETE popup.js:76–83
    │          data-theme already set pre-paint by theme-init.js (Phase 1)
    │
    ├── sessionMemory.get([...]) → show goldenkey/supportComment → main()
    │
    └── main()
          │
          ├── if !AWS URL → showState('not-on-aws')        ← D-05
          │                  render: aesr-state-empty with D-05 copy
          │
          ├── showState('loading')                          ← D-07 NEW
          │   render: aesr-state-loading (Phase 1 shell)
          │
          ├── executeAction('loadInfo')
          │     ├── success → hide #noMain, show #main, loadFormList()
          │     │    └── profiles found: render role list
          │     │    └── profiles empty: showState('no-roles')  ← D-06
          │     └── failure → showState('error')
          │                    render: aesr-alert--error shell
          │
          └── .aesr-open-options-link click handler
                wired at injection time (not window.onload)  ← PITFALL #3 below


CSS CHAIN IN popup.html <head>
  <script src="js/theme-init.js">         ← Phase 1, first
  <link css/tokens.css>                    ← Phase 1
  <link css/base.css>                      ← Phase 1
  <link css/components.css>               ← Phase 1
  <link css/popup.css>                    ← Phase 2 NEW (after components)
  [inline <style> REMOVED]                ← Phase 2 removes popup.html:9–134
```

### Recommended Project Structure

```
src/
├── css/
│   ├── tokens.css           # Phase 1 — unchanged
│   ├── base.css             # Phase 1 — unchanged
│   ├── components.css       # Phase 1 — unchanged
│   └── popup.css            # Phase 2 NEW — popup-specific styles only
├── js/
│   ├── popup.js             # Phase 2 MODIFIED — remove darkMode, add state renderers
│   └── lib/
│       ├── create_role_list_item.js       # Phase 2 MODIFIED — two-line DOM (D-02)
│       └── create_role_list_item.test.js  # Phase 2 MODIFIED — innerHTML assertions updated
└── popup.html               # Phase 2 MODIFIED — remove inline <style>, link popup.css
```

No new files outside `src/css/popup.css`. Build scripts do not need editing — `src/css/` is already copied verbatim by both scripts.

### Pattern 1: Phase 1 Component Shells Available to Phase 2

**All of these exist in `src/css/components.css` and can be used directly in popup.css / popup.js without authoring new CSS:**

| Shell / Class | Lines in components.css | Phase 2 use |
|---------------|-------------------------|-------------|
| `.aesr-state-empty` + `__body` | L180–202 | D-05, D-06 empty states inside `#noMain` |
| `.aesr-state-loading` + `__spinner` + `__body` | L208–235 | D-07 loading state inside `#noMain` |
| `.aesr-alert--error` + `__body` | L242–264 | Error state (runtime failure) inside `#noMain` |
| `.aesr-input` | L51–62 | Apply to `#roleFilter` via class addition on the element |
| `.aesr-divider` | L170–174 | D-04a sidebar divider between nav items (if chosen) |
| `.aesr-role-item__name` | L150–153 | Two-line item name span |
| `.aesr-role-item__account` | L145–148 | Two-line item account span |

**Note on `.aesr-role-item` (flex-direction: column shell):** UI-SPEC §Component Inventory explicitly documents that the popup's `<a>` anchor uses a row layout and must NOT use `.aesr-role-item` as the outer wrapper — it would require overriding `flex-direction`. Instead, `popup.css` styles `#roleList li a` directly with `display: flex; flex-direction: row`. The `__name` and `__account` children from `components.css` are reused as-is.

### Pattern 2: Token Resolutions for popup.css

All values verified against `src/css/tokens.css`:

| Resolved token | Light hex | Dark hex | Popup usage |
|----------------|-----------|----------|-------------|
| `--color-bg-layout` | `#ffffff` | `#161d26` | `body`, `#main`, `#noMain` background |
| `--color-bg-dropdown-item` | `#ffffff` | `#1b232d` | Role list rows |
| `--color-bg-dropdown-item-hover` | `#f3f3f7` | `#131920` | Role row hover |
| `--color-bg-item-selected` | `#f0fbff` | `#001129` | `#roleList li.selected` |
| `--color-border-divider` | `#c6c6cd` | `#424650` | `.mainPane` right border, `.optionMenu li` border |
| `--color-border-divider-secondary` | `#ebebf0` | `#232b37` | `.optionMenu li` border (secondary option) |
| `--color-border-input` | `#8c8c94` | `#656871` | Swatch border (D-01a); WCAG 3:1 UI verified: light 3.34:1, dark ~3.03:1 — PASS |
| `--color-text-body` | `#0f141a` | `#c6c6cd` | Role name, sidebar links |
| `--color-text-secondary` | `#424650` | `#c6c6cd` | Account ID (second line) |
| `--color-text-heading` | `#0f141a` | `#ebebf0` | "Role List" title |
| `--color-text-interactive-hover` | `#0f141a` | `#f9f9fa` | Nav link hover |
| `--color-text-accent` | `#006ce0` | `#42b4ff` | Spinner `border-top-color` |
| `--color-link` | `#006ce0` | `#42b4ff` | "Open Configuration" CTA |
| `--color-border-focus` | `#006ce0` | `#42b4ff` | `:focus-visible` ring (inherited from `base.css`) |
| `--radius-badge` | `4px` | — | Swatch border-radius (D-03 — `--radius-xs` does NOT exist in Phase 1 tokens; use `--radius-badge`) |

**Critical resolution:** CONTEXT.md D-03 references `var(--radius-xs)`. That token does not exist in `tokens.css`. The UI-SPEC (§Swatch, line ~207) explicitly resolves this to `var(--radius-badge)` (4px). Use `--radius-badge`. [VERIFIED: `src/css/tokens.css:74`]

### Pattern 3: popup.html `<head>` After Phase 2

```html
<head>
  <meta charset="UTF-8">
  <script src="js/theme-init.js"></script>   <!-- Phase 1, pre-paint -->
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/components.css">
  <link rel="stylesheet" href="css/popup.css">  <!-- Phase 2 NEW -->
  <!-- inline <style> block REMOVED (popup.html:9–134) -->
</head>
```

The Phase 1 inline `<style>` source-order insulation (D-02 from Phase 1) was needed because the old inline `<style>` sat after the `<link>` chain — it overrode tokens/base by specificity. Once the inline block is removed and replaced by `popup.css` (a linked sheet in the proper cascade position), no insulation dance is needed.

### Anti-Patterns to Avoid

- **Replacing `el.style.display = 'block'/'none'` with CSS classes for show/hide:** Breaks `li[style*="block"]` / `li:not([style*="none"])` Playwright selectors. Hard constraint.
- **Wiring `.aesr-open-options-link` click handler at `window.onload`:** The element doesn't exist at load time — it is injected into `#noMain` only when the "no matching roles" state is rendered. Handler must be attached at injection time.
- **Splitting D-02 DOM change from `create_role_list_item.test.js` updates:** The unit test `innerHTML` assertions are exact-string matches and will fail the moment `suffixAccountId` is renamed or the flat text node is wrapped. Must be one commit or one PR.
- **Keeping the `popup.js:79` `.darkMode` classList add after removing the `.darkMode` CSS rules:** Dead code with zero effect but creates confusion. Remove both in the same PR. The `storageRepo.get(['visualMode', ...])` block (popup.js:76–85) still needs to run for `autoTabGrouping` — only remove the `classList.add('darkMode')` call, not the entire block.
- **Using `--radius-xs`:** Undefined in tokens.css. Use `--radius-badge`.
- **Overriding `.aesr-role-item` flex-direction:** Don't add the `.aesr-role-item` class to the popup anchor. Style `#roleList li a` directly in `popup.css` with row flex.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSS-only spinner | Custom animation | `.aesr-state-loading__spinner` + `.aesr-state-loading__body` from `components.css` L208–235 | Already authored, themed, animation defined |
| Empty-state container | New div + custom CSS | `.aesr-state-empty` + `.aesr-state-empty__body` from `components.css` L180–202 | Already authored; centered flex layout |
| Error display | Inline `p.style.color = '#d11'` | `.aesr-alert--error` + `.aesr-alert__body` from `components.css` L242–264 | Token-driven, themed; the current `showMessage(..., 'error')` approach hardcodes `#d11` |
| Focus ring | New CSS on `#roleFilter` | Inherited `:focus-visible` rule from `base.css` | Global ring already covers `#roleFilter` and `.optionMenu a`; `popup.css` must not override it |
| Scrollbar theming (Firefox/Edge) | Custom `scrollbar-color` workaround | `color-scheme` on `:root` (Phase 1) | Already wired; native scrollbars follow theme automatically |
| Theme detection | Async `chrome.storage.sync.get` | `data-theme` attribute set by `theme-init.js` (Phase 1) | Pre-paint; no code needed in Phase 2 |

---

## Source File Map — Exact Change Points

### `src/popup.html`

| Change | Location | What |
|--------|----------|------|
| Remove inline `<style>` block | Lines 9–134 | All 125 lines including `.darkMode` rules, `.suffixAccountId`, scrollbar styles |
| Add `<link>` for `popup.css` | After `<link css/components.css>` (line 8) | `<link rel="stylesheet" href="css/popup.css">` |
| Add `class="aesr-input"` to `#roleFilter` | Line 143 | Applies `.aesr-input` shell; `popup.css` overrides `max-width: none; flex: 1` |
| Add `<hr class="aesr-divider">` (D-04a, if chosen) | Between "Configuration" and "Update Notice" `<li>` elements (lines 154–155) | Sidebar grouping (note: `<hr>` is not a valid child of `<ul>`; planner may use `border-top` on the next `<li>` instead) |

**Inline `style=` attribute triage (popup.html lines 137–168) — keep vs remove vs move:**

| Element | Line | Inline style | Disposition |
|---------|------|-------------|-------------|
| Top-level flex wrapper `<div>` | 137 | `display: flex` | Move to `popup.css` |
| `.mainPane` `<div>` | 138 | `min-width: 280px` | Move to `.mainPane` rule in `popup.css` (already in UI-SPEC §Main Pane Border) |
| `#main` `<div>` | 139 | `display: none` | **KEEP** — JS toggles this; Playwright contract |
| Filter-row wrapper `<div>` | 140 | `padding: 12px 6px 6px` | Move to `popup.css` |
| `#roleFilter` `<input>` | 143 | 6-property inline style (border, border-radius, font-size, margin-left, max-width, padding) | **REMOVE entirely** — replaced by `.aesr-input` class. If any inline style survives, it wins over the class rule and breaks the styled input |
| `#noMain` `<div>` | 148 | `display: none` | **KEEP** — JS toggles this; Playwright contract |
| `#supportComment` `<div>` | 164 | `display: none; margin: 6px` | `display: none` keep (JS toggles); margin move to `popup.css` |
| `#goldenkey` `<img>` | 168 | `display: none; margin: 6px 8px 6px auto` | `display: none` keep (JS toggles); margin move to `popup.css` |

### `src/js/popup.js`

| Change | Location | What |
|--------|----------|------|
| Remove `.darkMode` classList.add | Lines 78–80 | Delete `if (mode === 'dark' ...) { document.body.classList.add('darkMode') }` — keep the rest of the `storageRepo.get()` block for `autoTabGrouping` |
| Replace `showMessage()` | Lines 41–47 | Replace single-`<p>` mutator with typed state renderers (see State Injection below) |
| Add loading state before `executeAction('loadInfo')` | Line 107 | Show loading state while awaiting `loadInfo` |
| Add empty-profiles check in `loadFormList` | Line ~138 (after `findTargetProfiles()`) | `if (profiles.length === 0) { showNoRoles(); return }` — D-06; currently `popup.js` just renders an empty `<ul>` silently |
| Wire `.aesr-open-options-link` handler | At injection time in the "no-roles" state renderer | Must not be wired at `window.onload` |
| Update OAuth callback `showMessage` calls | Lines 118, 123 | Both flow through `showMessage()` which is being refactored; route through the new typed error/info renderer |

**State injection strategy (planner's choice — two options):**

Option A — Typed renderer functions: Replace `showMessage()` with `showNotOnAws()`, `showNoRoles()`, `showLoading()`, `showError(msg)`. Each function sets `noMainEl.innerHTML` to the appropriate HTML and wires its own handlers.

Option B — Sub-containers: Add three hidden child `<div>`s inside `#noMain` in `popup.html`; show/hide one at a time via `style.display`. Avoids innerHTML mutation. The `.aesr-open-options-link` still needs a handler wired at `window.onload` since the element exists in the DOM from the start.

Either is acceptable. Option A is simpler and keeps all state markup out of `popup.html`. Option B is safer for handlers but adds DOM complexity.

### `src/js/lib/create_role_list_item.js`

| Change | Location | What |
|--------|----------|------|
| Replace `document.createTextNode(item.name)` flat append | Line 40 | Wrap in `<span class="aesr-role-item__name">` |
| Replace `suffixAccountId` span + class | Lines 47–50 | Replace `class="suffixAccountId"` with `class="aesr-role-item__account"` |
| Wrap both spans in `.aesr-role-item-text` div | After headSquare append | `<div class="aesr-role-item-text">` containing name + account spans |
| Add border to headSquare | Line 5–6 area | `headSquare.style.border = '1px solid var(--color-border-input)'` — OR handle entirely in CSS by adding `border: 1px solid var(--color-border-input)` to `.headSquare` in `popup.css`; the CSS approach is cleaner |

**The swatch border:** CSS-only via `.headSquare { border: 1px solid var(--color-border-input) }` in `popup.css` is the recommended approach. No JS change needed for the border. The existing `headSquare.style.backgroundColor` (line 7) and `headSquare.style.backgroundImage` (line 25) assignments are preserved unchanged.

### `src/js/lib/create_role_list_item.test.js`

**CRITICAL: All `innerHTML` assertions must be updated.** Current assertions use exact-string match and will fail after D-02. [VERIFIED: `src/js/lib/create_role_list_item.test.js` lines 41–42, 77–78, 94–95, 112–113, 169]

| Test | Lines | Current assertion | What changes |
|------|-------|-------------------|--------------|
| minimum properties | 41–42 | `class="suffixAccountId"` + flat `profileA` text | → `class="aesr-role-item__name"` wrapper + `class="aesr-role-item__account"` span inside `.aesr-role-item-text` |
| profile has color | 77–78 | Same pattern | Same update |
| profile has image | 94–95 | `class="suffixAccountId"` present | Same update |
| profile has color and image | 112–113 | Same | Same update |
| hidesAccountId true | 169 | `ProfileC` flat text, no suffixAccountId span | → `<span class="aesr-role-item__name">ProfileC</span>` inside `.aesr-role-item-text`; no account span |

The `dataset.*` assertions (profile, rolename, account, displayname, color, redirecturi, search) do not change — those are on the `<a>` element, not in the inner DOM.

### Build scripts

**No changes required.** `bin/build.sh:34` already runs `\cp -r src/css dist/$brw/` and `bin/build_test.sh:10` already runs `cp -r src/css $destdir/`. Adding `popup.css` to `src/css/` automatically includes it in both copy operations. [VERIFIED: `bin/build.sh:34`, `bin/build_test.sh:10`]

---

## Common Pitfalls

### Pitfall 1: `create_role_list_item.test.js` innerHTML assertions will fail after D-02
**What goes wrong:** The 5 `innerHTML` assertions check exact strings. D-02 changes element structure and class names. `npm test` turns red.
**Why it happens:** Exact-string innerHTML comparison is the current pattern; the DOM contract change is deep.
**How to avoid:** Update all 5 assertions in the same commit as the source change. This is not optional — it is guaranteed to fail without it.
**Warning signs:** `npm test` red on `createRoleListItem` describe block after D-02 change.

### Pitfall 2: `.aesr-open-options-link` handler is inert
**What goes wrong:** The "Open Configuration" CTA link in the "no-roles" state appears but clicking it does nothing.
**Why it happens:** `window.onload` wires `#openOptionsLink` (sidebar) but the new `.aesr-open-options-link` is injected into `#noMain` dynamically — it doesn't exist at `onload` time.
**How to avoid:** Wire the click handler at the point of injection (in the state renderer function), not at `window.onload`.
**Warning signs:** Clicking "Open Configuration" in the empty state has no effect; no console error (silently inert).

### Pitfall 3: Removing `.darkMode` CSS without removing `.darkMode` JS in the same PR
**What goes wrong:** `popup.js:79` adds `document.body.classList.add('darkMode')` which references CSS rules that no longer exist after the inline `<style>` block is removed. Dead code; harmless now but confusing.
**How to avoid:** Remove both in the same PR. The `storageRepo.get` block still runs for `autoTabGrouping` (line 82); only excise the `classList.add('darkMode')` conditional.
**Warning signs:** `darkMode` class on `<body>` with no matching CSS rules in DevTools.

### Pitfall 4: Using `--radius-xs` (undefined token)
**What goes wrong:** `var(--radius-xs)` resolves to empty in all browsers; swatch loses border-radius entirely.
**How to avoid:** Use `var(--radius-badge)` (4px), as resolved in UI-SPEC §Swatch.
**Warning signs:** Perfectly square swatch corners; no CSS `border-radius` applied at runtime.

### Pitfall 5: Overriding or weakening the `:focus-visible` ring in `popup.css`
**What goes wrong:** `popup.css` adds `outline: none` or `border-radius: 0` to `#roleFilter` or `.optionMenu a`, removing the tokenized focus ring from `base.css`.
**How to avoid:** `popup.css` must not declare `outline` on any interactive element. The global `:focus-visible` rule in `base.css` covers `#roleFilter` and all `.optionMenu a` automatically.
**Warning signs:** No visible focus outline on filter input or nav links in either theme.

### Pitfall 6: Loading state never shown (async timing)
**What goes wrong:** The popup shows blank/white between page load and role list render because no loading indicator is set before `executeAction('loadInfo')` is awaited.
**Why it happens:** Current `popup.js:107` has no pre-await state set — `#main` and `#noMain` are both `display:none` until one succeeds. D-07 adds the loading state but only if the code sets it before the await.
**How to avoid:** Show the loading state (D-07) immediately before `executeAction(tab.id, 'loadInfo', {})` is called. Hide it (and show `#main`) when `loadInfo` resolves successfully.
**Warning signs:** Blank popup for perceivable time before roles appear; loading spinner never visible in testing.

### Pitfall 7: Inline style show/hide toggle replaced with CSS class
**What goes wrong:** `li.style.display = 'none'/'block'` replaced with `li.classList.toggle('hidden')`. Playwright selectors `li[style*="block"]` / `li:not([style*="none"])` immediately break.
**How to avoid:** Keep `el.style.display` toggling. Any refactor of visibility MUST preserve the inline style on `<li>` elements.
**Warning signs:** Playwright keyboard_navigation.spec.js and keyboard_edge_cases.spec.js selectors return 0 matches.

---

## Test Impact Map

### Unit Tests (Mocha + jsdom)

| File | Change Required | Why |
|------|----------------|-----|
| `src/js/lib/create_role_list_item.test.js` | Update 5 `innerHTML` assertions (lines 41–42, 77–78, 94–95, 112–113, 169) | D-02 DOM restructure changes innerHTML; dataset assertions unchanged |

### Playwright Emulator Tests — Brittle Selectors (MUST NOT CHANGE)

| Selector | Test file | Constraint |
|----------|-----------|------------|
| `#roleFilter` | `keyboard_navigation.spec.js`, `keyboard_edge_cases.spec.js` | Input ID unchanged |
| `#roleList li.selected` | `keyboard_navigation.spec.js`, `keyboard_edge_cases.spec.js` | Class name unchanged; `li.selected` still set by `popup.js:180/235` |
| `#roleList li[style*="block"], #roleList li:not([style*="none"])` | `keyboard_navigation.spec.js:130`, `keyboard_edge_cases.spec.js:37,79` | Inline style toggle MUST remain on `<li>` elements |
| `#awsConfigTextArea`, `#saveButton`, `#msgSpan` | `options.spec.js` | Not touched by Phase 2 |
| `#textareaKeyCode`, `#keyCodeInvalid`, `#keyCodeValid` | `supporters.spec.js` | Not touched by Phase 2 |

### Test Coverage Gaps (Known)

`test/emulator/popup_init.js` mocks `tabs.query` to always return an AWS URL and `loadInfo` to always return a successful user info object. The following states have **no automated Playwright coverage**:
- D-05 "not on AWS page" empty state
- D-06 "no matching roles" empty state
- D-07 loading state
- Error state (loadInfo failure)

These are acceptance gaps, not blockers for Phase 2. The planner should decide whether to extend `popup_init.js` mocking or add a new spec, or accept the gap.

`.suffixAccountId` is not referenced in any Playwright selector (confirmed: `keyboard_navigation.spec.js`, `keyboard_edge_cases.spec.js`). Safe to rename to `.aesr-role-item__account`.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Mocha 11.7.5 (unit) + Playwright 1.58.2 (emulator) |
| Config file | `playwright.config.ts` |
| Quick run command | `npm test` (unit) |
| Full suite command | `npm run test_emulator` (Playwright) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| POP-01 / POP-05 | Role list renders, filter works, keyboard nav preserved | integration (Playwright) | `npm run test_emulator -- test/emulator/keyboard_navigation.spec.js test/emulator/keyboard_edge_cases.spec.js` | ✅ exists |
| POP-02 | Long names/IDs truncate (createDisplayName preserves 64-char limit) | unit (Mocha) | `npm test` | ✅ exists — covered by `create_role_list_item.test.js` display name assertion |
| POP-05 (unit) | Two-line DOM structure is correct | unit (Mocha) | `npm test` | ✅ exists — `create_role_list_item.test.js` MUST BE UPDATED |
| POP-06 | Swatch renders with border; stored color unchanged | unit (Mocha) | `npm test` | ✅ exists — headSquare assertions in `create_role_list_item.test.js` MUST BE UPDATED |
| POP-03 / POP-04 | Empty states and loading state render correctly | manual or new spec | not automated | ❌ Wave 0 gap (optional) |

### Sampling Rate

- **Per task commit:** `npm test`
- **Per wave merge:** `npm run test_emulator` (full Playwright suite)
- **Phase gate:** `npm test` (33+ passing) + `npm run test_emulator` (19+ passing) before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `create_role_list_item.test.js` — 5 `innerHTML` assertions updated for two-line DOM (D-02). **Required; `npm test` will fail otherwise.**
- [ ] (Optional) New `popup_states.spec.js` or extended `popup_init.js` mock covering D-05/D-06/D-07. Not required for Phase 2 gate.

---

## Environment Availability

Phase 2 introduces no external dependencies. All tools used by Phase 2 are the same as Phase 1.

| Dependency | Required By | Available | Notes |
|------------|------------|-----------|-------|
| Node.js | Build + tests | ✓ | Same as Phase 1 |
| npm / Mocha / Playwright | Tests | ✓ | Same as Phase 1 |
| Chrome binary | Playwright emulator | ✓ | Same as Phase 1 |
| Firefox binary | Playwright emulator | ✓ | Same as Phase 1 |

---

## Security Domain

Phase 2 has no new attack surface. The only security-adjacent element — the `image` URL validation in `create_role_list_item.js:12–26` — is **unchanged** by Phase 2. The DOM update (D-02) touches only where existing strings are placed in the DOM, not how they are sanitized.

| ASVS Category | Applies | Control |
|---------------|---------|---------|
| V5 Input Validation | Pre-existing | `create_role_list_item.js:12–26` URL validation preserved unchanged; no new user input paths |
| All others | No | Phase 2 is CSS + minor DOM restructure; no auth, session, crypto, or new input paths |

---

## Open Questions (RESOLVED)

1. **State injection strategy: typed renderer functions vs sub-containers**
   - What we know: UI-SPEC §Copywriting specifies the exact HTML structure for each state. Either approach satisfies the spec.
   - What's unclear: Whether Option B (sub-containers pre-authored in `popup.html`) is preferred for testability or simplicity.
   - Recommendation: Option A (typed renderer functions in `popup.js`; no new HTML in `popup.html`). Keeps the HTML clean and avoids `#noMain` having visible sub-containers when the popup first opens.
   - RESOLVED: Option A — typed renderer functions (`showNotOnAws`, `showNoRoles`, `showLoading`, `showError`) in `popup.js`. No sub-containers added to `popup.html`.

2. **Error state copy (not locked)**
   - What we know: UI-SPEC §Copywriting notes `.aesr-alert--error` is available "for runtime failures; no locked copy."
   - What's unclear: Whether the Phase 2 plan should update the current `showMessage('...', 'error')` inline `p.style.color = '#d11'` to use the `.aesr-alert--error` shell, or simply remove the hardcoded `#d11` color and replace with `--color-text-status-error` token.
   - Recommendation: Use `.aesr-alert--error` shell for the error renderer — it's available from Phase 1 and handles theming correctly.
   - RESOLVED: `showError(msg)` uses `.aesr-alert.aesr-alert--error` shell with `p.aesr-alert__body` child; `body.textContent = msg` for XSS safety. Applied to all error paths (loadInfo failure, OAuth callback failure).

3. **`.aesr-open-options-link` handler wiring granularity**
   - What we know: `popup.js:55` already wires `document.getElementById('openOptionsLink').onclick = function() { openOptions() }`. The new CTA element needs the same `openOptions()` call.
   - What's unclear: Whether to use `document.querySelector('.aesr-open-options-link')` after injection, or pass the element directly to the renderer function to attach the handler.
   - Recommendation: Attach `onclick = function() { openOptions(); return false; }` directly on the element at construction time inside the renderer (cleaner than a querySelector after injection).
   - RESOLVED: Handler attached at element construction time inside `showNoRoles()` — `link.onclick = function() { openOptions(); return false; }`. No `document.querySelector` post-injection.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `build.sh:34` `\cp -r src/css dist/$brw/` includes all files in `src/css/` without naming them explicitly, so adding `popup.css` requires no build script edit | Build scripts section | If glob behavior differs, need to add explicit copy line — low effort to fix |
| A2 | No Playwright test targets `.suffixAccountId` class name | Test Impact Map | If found, that test assertion must also be updated |

All other claims verified against live codebase or cited from the locked UI-SPEC and CONTEXT.md.

---

## Sources

### Primary (HIGH confidence — live codebase verification)

- `src/popup.html` — inline `<style>` block lines 9–134; DOM structure verified
- `src/js/popup.js` — `showMessage()` lines 41–47; `darkMode` toggle lines 76–83; `loadInfo` call line 107; `openOptionsLink` wiring line 55
- `src/js/lib/create_role_list_item.js` — DOM build lines 1–62; swatch lines 5–26; suffixAccountId lines 47–50
- `src/js/lib/create_role_list_item.test.js` — all innerHTML assertions lines 41, 77, 94, 112, 169
- `src/css/tokens.css` — all token values verified; `--radius-xs` absence confirmed
- `src/css/components.css` — all shell classes verified: loading L208–235, empty L180–202, alert L242–264, input L51–62, divider L170–174
- `bin/build.sh:34` — `\cp -r src/css dist/$brw/` covers all css files
- `bin/build_test.sh:10` — `cp -r src/css $destdir/` covers all css files
- `test/emulator/keyboard_navigation.spec.js` — brittle selectors lines 130, 39, 143
- `test/emulator/keyboard_edge_cases.spec.js` — brittle selectors lines 37, 79
- `test/emulator/popup_init.js` — mock stubs; always returns AWS URL and loadInfo success

### Primary (HIGH confidence — locked planning artifacts)

- `.planning/phases/02-popup-surface/02-UI-SPEC.md` — all component specs, token resolutions, swatch contrast ratios, state HTML structures; LOCKED
- `.planning/phases/02-popup-surface/02-CONTEXT.md` — D-01 through D-07 decisions; LOCKED
- `.planning/phases/01-design-system-foundation/01-VERIFICATION.md` — Phase 1 outputs confirmed 5/5 SC; all artifacts present

---

## Metadata

**Confidence breakdown:**
- Source file change points: HIGH — verified against live codebase at exact line numbers
- Token resolutions: HIGH — verified against `src/css/tokens.css`
- Component shell availability: HIGH — verified against `src/css/components.css`
- Test impact: HIGH — verified by reading all relevant test files
- Architecture patterns: HIGH — locked by UI-SPEC

**Research date:** 2026-05-28
**Valid until:** Stable — locked by UI-SPEC and Phase 1 foundation. No expiry risk.
