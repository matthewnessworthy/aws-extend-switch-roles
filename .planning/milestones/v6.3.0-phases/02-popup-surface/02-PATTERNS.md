# Phase 2: Popup Surface - Pattern Map

**Mapped:** 2026-05-28
**Files analyzed:** 5 new/modified files
**Analogs found:** 5 / 5 (all are self-analogs or Phase 1 CSS analogs)

> Build script note: CONTEXT.md lists `bin/build.sh` and `bin/build_test.sh` as deliverables.
> RESEARCH.md §Build scripts verified that both scripts already run `\cp -r src/css ...` /
> `cp -r src/css $destdir/`, so adding `popup.css` to `src/css/` requires **no build-script
> edits**. Those files are excluded from this pattern map.

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/css/popup.css` | component | transform | `src/css/components.css` | role-match (same Phase 1 CSS authoring conventions) |
| `src/popup.html` | config | static | `src/popup.html` (self) | self-delta (remove inline `<style>` lines 9–134; link `popup.css`; strip `#roleFilter` inline styles) |
| `src/js/popup.js` | utility | request-response | `src/js/popup.js` (self) | self-delta (remove `darkMode` toggle; replace `showMessage`; add loading state) |
| `src/js/lib/create_role_list_item.js` | utility | transform | `src/js/lib/create_role_list_item.js` (self) | self-delta (two-line DOM per D-02) |
| `src/js/lib/create_role_list_item.test.js` | test | transform | `src/js/lib/create_role_list_item.test.js` (self) | self-delta (5 `innerHTML` assertions updated) |

---

## Pattern Assignments

### `src/css/popup.css` (component, transform) — NEW FILE

**Analog:** `src/css/components.css`

**File-level header comment pattern** (components.css lines 1–5):
```css
/* components.css — Reusable component shells (ROADMAP SC2).
   All classes use the .aesr-* prefix (locked in Plan 01, Claude's Discretion decision).
   All color/size values use var(--token) — no hardcoded hex, no hardcoded px for
   dimensions that have a token. No @import, no !important, no color-mix(), no external
   font or icon URL. */
```
Copy this style for `popup.css`'s header, adapted to describe popup-specific styles.

**Section separator pattern** (components.css lines 7–9):
```css
/* ==========================================================================
   1. Button shells
   ========================================================================== */
```
Use the same `/* === N. Section === */` banner for each logical section in `popup.css`.

**Token-only property pattern** (components.css lines 51–62, `.aesr-input`):
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
Every color, size, spacing, and font value is `var(--token)`. No hex. No hardcoded px where a spacing token exists. Tab-indented. `popup.css` follows this rule identically.

**Hover state pattern** (components.css lines 141–143, `.aesr-role-item:hover`):
```css
.aesr-role-item:hover {
	background-color: var(--color-bg-dropdown-item-hover);
}
```
Hover rules are sibling selectors immediately after the base rule — no nesting.

**Keyframes naming convention** (components.css lines 231–235):
```css
@keyframes aesr-spin {
	to {
		transform: rotate(360deg);
	}
}
```
`popup.css` does NOT redefine `aesr-spin` — the spinner shell and its `@keyframes` live in `components.css` and are inherited. `popup.css` only needs to apply the `.aesr-state-loading` and `.aesr-state-loading__spinner` classes in JS-injected HTML; no new animation needed.

**BEM-style child class pattern** (components.css lines 145–153):
```css
.aesr-role-item__account {
	font-size: var(--font-size-body-s);
	color: var(--color-text-secondary);
}

.aesr-role-item__name {
	font-size: var(--font-size-body-m);
	color: var(--color-text-body);
}
```
`__name` and `__account` are already defined in `components.css`. `popup.css` applies **truncation only** to them:
```css
.aesr-role-item__name,
.aesr-role-item__account {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
```
Do not redeclare `font-size` or `color` on these classes in `popup.css` — those are already in `components.css` and any redeclaration would create a duplicate.

**What `popup.css` must cover** (map to UI-SPEC §Component Inventory sections):
1. Body / popup chrome: `body { max-width: 600px; max-height: 600px }` + flex wrapper
2. `.mainPane` border + min-width
3. Filter row: `.aesr-popup-filter-row` layout; `#roleFilter.aesr-input` flex override
4. Role list: `#roleList` max-height, overflow, scrollbar; `#roleList li` reset
5. Role list anchor: `#roleList li a` row-flex layout (NOT `.aesr-role-item` — see below)
6. Text column: `.aesr-role-item-text` column-flex + `min-width: 0`
7. Truncation on `__name` and `__account` (additive to components.css definitions)
8. `.headSquare` swatch: border-radius, border, flex-shrink, background-size/repeat/position
9. Selected row: `#roleList li.selected` background-color
10. Sidebar nav: `.optionMenu`, `.optionMenu li`, `.optionMenu a`, `.optionMenu a:hover`, `#openOptionsLink`
11. Scrollbar: `#roleList` `scrollbar-width: thin`; `::-webkit-scrollbar` / `::-webkit-scrollbar-track` / `::-webkit-scrollbar-thumb` with token colors

**Critical: do NOT add `.aesr-role-item` to the popup `<a>` anchor.** `components.css` defines `.aesr-role-item` with `flex-direction: column`. The popup uses row layout. Style `#roleList li a` directly in `popup.css` with `display: flex; flex-direction: row`.

---

### `src/popup.html` (config, static) — MODIFIED

**Analog:** `src/popup.html` (self) — delta-only change

**Current head block** (popup.html lines 1–8 — this is the Phase 1 output already in place):
```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<script src="js/theme-init.js"></script>
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/components.css">
```
Phase 2 adds one more `<link>` immediately after `components.css`:
```html
<link rel="stylesheet" href="css/popup.css">
```
Then the inline `<style>` block (lines 9–134) is **removed entirely**.

**Inline `<style>` block to remove** (popup.html lines 9–134 — full extent):
```html
<style>
* { box-sizing: border-box }
html { padding: 0 }
body {
  background-color: #fff;
  ...
}
.darkMode { ... }
.darkMode a:hover { ... }
...
</style>
```
All 125 lines go. This removes the hardcoded hex colors, `.darkMode` class rules, and `.suffixAccountId` styles. After removal, `popup.css` becomes the sole popup stylesheet in the cascade.

**Inline `style=` attributes — keep vs remove** (popup.html lines 137–168):

| Element | Line | Current inline style | Phase 2 action |
|---------|------|---------------------|----------------|
| Top-level flex `<div>` | 137 | `display: flex` | Move to `popup.css` |
| `.mainPane` `<div>` | 138 | `min-width: 280px` | Move to `.mainPane` rule in `popup.css` |
| `#main` `<div>` | 139 | `display: none` | **KEEP** — JS toggles; Playwright contract |
| Filter-row `<div>` | 140 | `padding: 12px 6px 6px` | Move to `popup.css` (`.aesr-popup-filter-row`) |
| `#roleFilter` `<input>` | 143 | 6-property inline style | **REMOVE ENTIRELY** — replaced by `class="aesr-input"` addition |
| `#noMain` `<div>` | 148 | `display: none` | **KEEP** — JS toggles; Playwright contract |
| `#supportComment` `<div>` | 164 | `display: none; margin: 6px` | `display: none` KEEP; `margin` move to `popup.css` |
| `#goldenkey` `<img>` | 168 | `display: none; margin: 6px 8px 6px auto` | `display: none` KEEP; `margin` move to `popup.css` |

**`#roleFilter` class addition** (popup.html line 143):
```html
<!-- BEFORE -->
<input id="roleFilter" type="text" placeholder="Filter"
  style="border:1px solid #bbb;border-radius:3px;font-size:13px;margin-left:0.4em;max-width:30ex;padding:.8ex">

<!-- AFTER -->
<input id="roleFilter" class="aesr-input" type="text" placeholder="Filter">
```
The inline `style=` attribute is removed entirely. The `.aesr-input` class provides styling from `components.css`, and `popup.css` adds `flex: 1; max-width: none` override via `#roleFilter.aesr-input`.

**Sidebar divider (D-04a)** — UI-SPEC recommends a visual break between "Configuration" and "Update Notice". The `<hr>` is not a valid `<ul>` child; apply `border-top` to the `<li>` containing "Update Notice" via a class on that element:

Add `class="aesr-nav-group-break"` to the `<li>` that wraps `#openUpdateNoticeLink` (popup.html line 155):
```html
<!-- BEFORE -->
<li><a href="#" id="openUpdateNoticeLink">Update Notice</a></li>

<!-- AFTER -->
<li class="aesr-nav-group-break"><a href="#" id="openUpdateNoticeLink">Update Notice</a></li>
```
Then in `popup.css`:
```css
.aesr-nav-group-break {
	border-top: 1px solid var(--color-border-divider);
	margin-top: var(--space-xxs);
	padding-top: var(--space-xxs);
}
```
This targets the `<li>` boundary correctly, not the inner `<a>`. Zero selector conflict with `.optionMenu li`'s existing `border-bottom`.

---

### `src/js/popup.js` (utility, request-response) — MODIFIED

**Analog:** `src/js/popup.js` (self) — targeted removals and additions

**darkMode removal** (popup.js lines 76–85):
```javascript
// CURRENT — lines 76–85
const storageRepo = StorageProvider.getSyncRepository();
storageRepo.get(['visualMode', 'autoTabGrouping']).then(({ visualMode, autoTabGrouping }) => {
  const mode = visualMode || 'default';
  if (mode === 'dark' || (mode === 'default' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('darkMode');   // ← DELETE this entire if-block (lines 78–80)
  }

  if (autoTabGrouping) {
    brw.runtime.sendMessage({ action: 'listenTabGroupsRemove' });
  }
});
```
Remove only the `if (mode === 'dark' ...)` conditional (3 lines). The `storageRepo.get()` call and the `autoTabGrouping` branch stay.

**`showMessage` replacement** (popup.js lines 41–47 — current implementation):
```javascript
function showMessage(msg, level = 'info') {
  const p = noMainEl.querySelector('p');
  p.textContent = msg;                     // ← safe: textContent, not innerHTML
  if (level === 'error') p.style.color = '#d11';
  noMainEl.style.display = 'block';
  mainEl.style.display = 'none';
}
```
Replace with four typed state renderer functions. **Follow the existing `p.textContent = msg` pattern** — use DOM API methods (`createElement`, `textContent`) throughout. Never concatenate user-controlled or server-influenced content into `innerHTML` strings.

The existing `showMessage` calls at lines 118 and 123 (OAuth callback) must be routed through the new renderers.

**State renderer pattern** — DOM-API-safe construction, derived from `p.textContent = msg` at popup.js:43:
```javascript
function showNotOnAws() {
  const container = document.createElement('div');
  container.className = 'aesr-state-empty';
  const body = document.createElement('p');
  body.className = 'aesr-state-empty__body';
  body.textContent = 'Navigate to the AWS console to switch roles.';
  container.appendChild(body);
  noMainEl.innerHTML = '';
  noMainEl.appendChild(container);
  noMainEl.style.display = 'block';
  mainEl.style.display = 'none';
}

function showNoRoles() {
  const container = document.createElement('div');
  container.className = 'aesr-state-empty';
  const body = document.createElement('p');
  body.className = 'aesr-state-empty__body';
  body.textContent = 'No roles match your current account.';
  container.appendChild(body);
  const link = document.createElement('a');
  link.className = 'aesr-open-options-link';
  link.href = '#';
  link.textContent = 'Open Configuration';
  link.onclick = function() { openOptions(); return false; };  // wire at construction, not onload
  container.appendChild(link);
  noMainEl.innerHTML = '';
  noMainEl.appendChild(container);
  noMainEl.style.display = 'block';
  mainEl.style.display = 'none';
}

function showLoading() {
  const container = document.createElement('div');
  container.className = 'aesr-state-loading';
  const spinner = document.createElement('div');
  spinner.className = 'aesr-state-loading__spinner';
  container.appendChild(spinner);
  const body = document.createElement('p');
  body.className = 'aesr-state-loading__body';
  body.textContent = 'Loading roles…';  // "Loading roles…"
  container.appendChild(body);
  noMainEl.innerHTML = '';
  noMainEl.appendChild(container);
  noMainEl.style.display = 'block';
  mainEl.style.display = 'none';
}

function showError(msg) {
  const alert = document.createElement('div');
  alert.className = 'aesr-alert aesr-alert--error';
  const body = document.createElement('p');
  body.className = 'aesr-alert__body';
  body.textContent = msg;                 // ← textContent, not innerHTML — msg may contain server-influenced content
  alert.appendChild(body);
  noMainEl.innerHTML = '';
  noMainEl.appendChild(alert);
  noMainEl.style.display = 'block';
  mainEl.style.display = 'none';
}
```
**Critical:** `.aesr-open-options-link` handler must be wired at construction time inside `showNoRoles()`, NOT at `window.onload`. The element does not exist in the DOM at `onload`.

**Loading state insertion** (popup.js line 107 area, inside `main()`):
```javascript
// CURRENT — no loading state shown before executeAction
executeAction(tab.id, 'loadInfo', {}).then(userInfo => {
  ...
})

// AFTER — add showLoading() before the await
showLoading();
executeAction(tab.id, 'loadInfo', {}).then(userInfo => {
  if (userInfo) {
    mainEl.style.display = 'block';
    noMainEl.style.display = 'none';  // hide loading state
    return loadFormList(url, userInfo, tab.id);
  } else {
    showError('Failed to fetch user info from the AWS Management Console page');
  }
})
```

**Empty profiles check** (popup.js line ~138, inside `loadFormList`):
```javascript
// CURRENT — renders empty <ul> silently when no profiles
const profiles = await findTargetProfiles(curCtx);
renderRoleList(profiles, tabId, curURL, userInfo.prism, { hidesAccountId, autoTabGrouping, signinEndpointInHere });

// AFTER — guard before render
const profiles = await findTargetProfiles(curCtx);
if (profiles.length === 0) {
  showNoRoles();
  return;
}
renderRoleList(profiles, tabId, curURL, userInfo.prism, { hidesAccountId, autoTabGrouping, signinEndpointInHere });
```

**OAuth callback `showMessage` calls** (popup.js lines 118, 123):
```javascript
// Line 118 — success:
showMessage("Successfully connected to AESR Config Hub!");
// → replace with a DOM-safe info renderer using .aesr-state-empty__body pattern (planner writes copy)

// Line 123 — error:
showMessage(`Failed to connect to AESR Config Hub because.\n${err.message}`, 'error');
// → replace with showError(`Failed to connect to AESR Config Hub because.\n${err.message}`)
// Note: showError uses body.textContent = msg — safe for err.message which is server-influenced
```

---

### `src/js/lib/create_role_list_item.js` (utility, transform) — MODIFIED

**Analog:** `src/js/lib/create_role_list_item.js` (self) — surgical DOM restructure

**Current flat append** (create_role_list_item.js lines 39–51):
```javascript
anchor.appendChild(headSquare);
anchor.appendChild(document.createTextNode(item.name));  // ← line 40: flat text node

if (hidesAccountId) {
  anchor.dataset.displayname = createDisplayName(item.name);
} else {
  anchor.dataset.displayname = createDisplayName(item.name, item.aws_account_id);

  const accountIdSpan = document.createElement('span');
  accountIdSpan.className = 'suffixAccountId';            // ← line 48: old class name
  accountIdSpan.textContent = item.aws_account_id;
  anchor.appendChild(accountIdSpan);                      // ← line 50: flat append to anchor
}
```

**Replacement — two-line DOM (D-02):**
```javascript
anchor.appendChild(headSquare);

const textDiv = document.createElement('div');
textDiv.className = 'aesr-role-item-text';

const nameSpan = document.createElement('span');
nameSpan.className = 'aesr-role-item__name';
nameSpan.textContent = item.name;
textDiv.appendChild(nameSpan);

if (hidesAccountId) {
  anchor.dataset.displayname = createDisplayName(item.name);
} else {
  anchor.dataset.displayname = createDisplayName(item.name, item.aws_account_id);

  const accountIdSpan = document.createElement('span');
  accountIdSpan.className = 'aesr-role-item__account';   // renamed from suffixAccountId
  accountIdSpan.textContent = item.aws_account_id;
  textDiv.appendChild(accountIdSpan);
}

anchor.appendChild(textDiv);
```

**Preserved unchanged** — these lines must not be modified:
- Lines 6–7: `headSquare.style.backgroundColor = ...` (POP-06 / D-01 swatch fill contract)
- Lines 12–26: URL validation and `headSquare.style.backgroundImage = ...` (security constraint)
- Lines 29–37: all `anchor.dataset.*` assignments (Playwright + role-switch data contract)
- Lines 53–57: `anchor.onclick` handler (role-switch flow)
- Lines 64–94: `createRedirectUri` and `createDisplayName` (POP-02 truncation logic)

**Swatch border** — do NOT add `headSquare.style.border` in JS. Apply the border in `popup.css`:
```css
.headSquare {
	border: 1px solid var(--color-border-input);
}
```
This keeps the border token-driven and theme-reactive. The JS assignment for `backgroundColor` remains the sole JS-applied style on `headSquare`.

---

### `src/js/lib/create_role_list_item.test.js` (test, transform) — MODIFIED

**Analog:** `src/js/lib/create_role_list_item.test.js` (self) — 5 `innerHTML` assertion updates

**Current `innerHTML` assertion pattern** (lines 41–42 — minimum properties test):
```javascript
expect(a.innerHTML).to.eq(`<span class="headSquare" style="background-color: rgb(170, 170, 170);"> \
</span>profileA<span class="suffixAccountId">222233334444</span>`);
```

**New pattern** (two-line DOM with `.aesr-role-item-text` wrapper):
```javascript
expect(a.innerHTML).to.eq(`<span class="headSquare" style="background-color: rgb(170, 170, 170);"> \
</span><div class="aesr-role-item-text"><span class="aesr-role-item__name">profileA</span>\
<span class="aesr-role-item__account">222233334444</span></div>`);
```

**All 5 assertions and their new values:**

| Test | Lines | Change |
|------|-------|--------|
| minimum properties | 41–42 | `suffixAccountId` → `.aesr-role-item-text` wrapper + `.aesr-role-item__name` + `.aesr-role-item__account` |
| profile has color | 77–78 | Same structure; `background-color: rgb(255, 170, 153)` in headSquare |
| profile has image | 94–95 | Same structure; `background-image: url(...)` in headSquare, no `background-color` |
| profile has color and image | 112–113 | Same structure; both `background-color` and `background-image` in headSquare |
| hidesAccountId true | 169 | `<div class="aesr-role-item-text"><span class="aesr-role-item__name">ProfileC</span></div>` — NO `__account` span |

**`hidesAccountId` case** (line 169 — current):
```javascript
expect(a.innerHTML).to.eq(`<span class="headSquare" style="background-color: rgb(170, 170, 170);"> </span>ProfileC`);
```
New:
```javascript
expect(a.innerHTML).to.eq(`<span class="headSquare" style="background-color: rgb(170, 170, 170);"> \
</span><div class="aesr-role-item-text"><span class="aesr-role-item__name">ProfileC</span></div>`);
```
No `__account` span. The `textDiv` wrapper IS present even when `hidesAccountId` is true.

**Dataset assertions** (e.g., `a.dataset.profile`, `a.dataset.rolename`, etc.) are NOT changed. Those are on the `<a>` element, unaffected by inner DOM structure.

**`malicious image` test** (lines 117–131) does NOT use `innerHTML` exact-string comparison — it checks `headSquare.style.backgroundImage` and `li.querySelector('a').innerHTML.not.include(...)`. The `not.include` check survives the DOM change. No update needed for this test.

**`profile has region` test** (lines 134–148) only asserts `a.dataset.redirecturi`. No `innerHTML` assertion. No update needed.

---

## Shared Patterns

### `aesr-` Prefix for All New Classes
**Source:** `src/css/components.css` (entire file) — locked in Phase 1
**Apply to:** All new class names in `popup.css` and new element classes in `create_role_list_item.js`
```css
/* Pattern: every class authored in Phase 1+ CSS files uses aesr- prefix */
.aesr-popup-filter-row { ... }
.aesr-role-item-text { ... }
```
Exception: existing class names `headSquare`, `mainPane`, `optionMenu`, `roleListTitle` are retained (already in DOM; changing them would require HTML + JS + test updates).

### Token-Only Color Discipline
**Source:** `src/css/components.css` lines 51–62 (`.aesr-input`), lines 26–30 (`.aesr-btn--primary`)
**Apply to:** All rules in `popup.css`
No hex values in CSS. No `rgb()`. All color references must be `var(--color-*)`. All spacing references must be `var(--space-*)`. All radius references must be `var(--radius-*)`.

### Tab Indentation
**Source:** `src/css/components.css` (verified: all declarations are tab-indented), `src/css/base.css` (same)
**Apply to:** `src/css/popup.css`
Tab character (`\t`) for all CSS property declarations. No spaces. Matches Phase 1 CSS files exactly.

### Inline `style="display:..."` Toggle Contract
**Source:** `src/js/popup.js` lines 45–46, 109
**Apply to:** All show/hide logic in `popup.js` state renderers
```javascript
noMainEl.style.display = 'block';   // show
mainEl.style.display = 'none';      // hide
// and the reverse for showing #main
```
This MUST use `el.style.display` — never `el.classList.add('hidden')` or similar. The Playwright selectors `li[style*="block"]` and `li:not([style*="none"])` depend on inline style presence. The `#main`/`#noMain` toggle specifically is checked by `popup.js`-dependent Playwright tests.

### DOM-API Construction (No innerHTML Concatenation)
**Source:** `src/js/popup.js` line 43: `p.textContent = msg` (existing safe pattern)
**Apply to:** All state renderer functions in `popup.js`
```javascript
// Safe pattern — textContent for user-visible strings, createElement for structure
const el = document.createElement('p');
el.className = 'aesr-state-empty__body';
el.textContent = msg;   // never: el.innerHTML = '<p>' + msg + '</p>'
```
`err.message` at popup.js:123 is server-influenced content; `showError` uses `body.textContent = msg`, which prevents XSS. The existing `p.textContent = msg` at popup.js:43 is the codebase precedent for this pattern.

### Swatch Fill JS Assignment (Unchanged — POP-06 Contract)
**Source:** `src/js/lib/create_role_list_item.js` lines 6–7
**Apply to:** Phase 2 modification of `create_role_list_item.js`
```javascript
if (item.color) {
  headSquare.style.backgroundColor = `#${item.color}`;
} else if (!item.image) {
  headSquare.style.backgroundColor = '#aaaaaa';
}
```
These two lines are preserved verbatim. D-01 (Option E): stored hex is applied as-is to `backgroundColor`; the 1px border is added by CSS only. No JS color math, no mutation of stored hex.

### Handler Wiring at Injection Time
**Source:** `src/js/popup.js` lines 55–58 (existing `#openOptionsLink` wiring)
```javascript
document.getElementById('openOptionsLink').onclick = function(e) {
  openOptions();
  return false;
}
```
**Apply to:** `.aesr-open-options-link` element created inside `showNoRoles()`
The new CTA element does not exist at `window.onload`. Wire its `onclick` at element construction time inside the renderer function — same pattern as the sidebar link, but at injection time rather than page load.

---

## No Analog Found

All 5 Phase 2 files have clear analogs (self or Phase 1 CSS). No greenfield entries.

---

## Metadata

**Analog search scope:** `src/css/`, `src/js/`, `src/popup.html`, `.planning/phases/01-design-system-foundation/`
**Files scanned:** 7 (4 source files, 1 test file, 2 Phase 1 CSS analogs)
**Pattern extraction date:** 2026-05-28
**Key constraint:** The `create_role_list_item.js` DOM change and its `create_role_list_item.test.js` test update MUST be in the same commit. The 5 `innerHTML` assertions are exact-string matches and will fail on `npm test` the moment D-02 lands without the corresponding test update.
