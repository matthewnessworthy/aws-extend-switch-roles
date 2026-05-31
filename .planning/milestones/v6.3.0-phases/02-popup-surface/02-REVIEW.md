---
phase: 02-popup-surface
reviewed: 2026-05-28T00:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - src/css/popup.css
  - src/popup.html
  - src/js/lib/create_role_list_item.js
  - src/js/lib/create_role_list_item.test.js
  - src/js/popup.js
findings:
  critical: 1
  warning: 5
  info: 4
  total: 10
status: issues_found
---

# Phase 02: Popup Surface — Code Review Report

**Reviewed:** 2026-05-28
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Reviewed all five files in the popup-surface redesign phase. The DOM restructuring in `create_role_list_item.js` is clean, the CSS token usage is consistent, and the new state-display functions in `popup.js` follow established patterns. One critical defect found: the three `-webkit-scrollbar` CSS rules use a descendant combinator that misses the `#roleList` element itself, making the scrollbar customisation entirely dead in Chrome and Edge. Five warnings cover a broken image URL encoding path, a miscounted test that masks a real crash path, an unhandled rejection that silently freezes the popup on switch failure, a structural HTML error, and an inline style that violates the project's CSS constraint. Four info items cover minor quality gaps including an ARIA labelling hole, a grammar error in a user-facing message, and a latent truncation bug.

---

## Critical Issues

### CR-01: `#roleList ::-webkit-scrollbar` descendant combinator — all three rules are dead code in Chrome/Edge

**File:** `src/css/popup.css:189-199`
**Issue:** All three `-webkit-scrollbar` rules use a descendant combinator (space before the pseudo-element):

```css
#roleList ::-webkit-scrollbar { … }        /* line 189 */
#roleList ::-webkit-scrollbar-track { … }  /* line 193 */
#roleList ::-webkit-scrollbar-thumb { … }  /* line 197 */
```

The space means "scrollbar pseudo-elements of elements _inside_ `#roleList`". `#roleList` itself is the scrollable container (`overflow-y: auto`; line 66) and has no scrollable descendants. All three rules match nothing and have zero effect in Chrome and Edge. The intended width, track colour, and thumb colour are never applied. Firefox is unaffected (uses `scrollbar-width: thin` from `base.css`).

**Fix:** Remove the descendant combinator — the pseudo-element attaches directly to the scrolling element:

```css
#roleList::-webkit-scrollbar {
    width: 10px;
}

#roleList::-webkit-scrollbar-track {
    background-color: var(--color-bg-container);
}

#roleList::-webkit-scrollbar-thumb {
    background-color: var(--color-border-divider);
}
```

---

## Warnings

### WR-01: `encodeURI(parsed.href)` double-encodes percent-encoded image paths — images fail silently

**File:** `src/js/lib/create_role_list_item.js:25`
**Issue:** After validating `item.image` through `new URL()`, the code applies `encodeURI()` to the already-normalised `parsed.href`:

```js
headSquare.style.backgroundImage = `url("${encodeURI(safeImageUrl)}")`;
```

`URL.href` already percent-encodes special characters (spaces → `%20`, brackets, etc.). Applying `encodeURI()` again encodes existing `%` signs to `%25`, turning `%20` into `%2520`. The browser then requests a URL with a literal `%20` in the path rather than the intended character — a different resource that returns 404. Any image URL in the user's config that contains percent-encoded characters will fail to render with no error.

Confirmed in Node.js:
```
new URL('https://example.com/my%20icon.png').href  →  'https://example.com/my%20icon.png'
encodeURI('https://example.com/my%20icon.png')     →  'https://example.com/my%2520icon.png'
```

**Fix:** Use `safeImageUrl` (which is already `parsed.href`) without any further encoding:

```js
if (safeImageUrl) {
  headSquare.style.backgroundImage = `url("${safeImageUrl}")`;
}
```

---

### WR-02: Test "profile has color" passes wrong argument count — `selectHandler` is `undefined`, `onclick` crash path hidden

**File:** `src/js/lib/create_role_list_item.test.js:65`
**Issue:** The function signature is `createRoleListItem(document, item, url, region, { hidesAccountId }, selectHandler)`. The "profile has color" test calls:

```js
const li = createRoleListItem(window.document, item, url, {}, (sender, data) => {});
//                                                     ^^^  ^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                                                  region  options (wrong slot)
//                                                          selectHandler = undefined
```

With only five arguments: `region = {}` (an object, not a string), `{ hidesAccountId }` is destructured from the arrow function yielding `undefined`, and `selectHandler` is `undefined`. Destructuring a function does not throw, so the test reaches its assertions — but `anchor.onclick` now contains a function that calls `undefined(this, data)`. If `a.click()` were invoked, it would throw `TypeError: selectHandler is not a function`. The test never clicks the anchor, so the crash is invisible.

The wrong `region` value also makes `createRedirectUri` receive `{}` as `curRegion`, but the condition `curRegion && destRegion` is falsy (the item has no `region` property), so the `redirecturi` assertion passes by coincidence rather than by correctness.

**Fix:** Insert the missing `region` argument:

```js
const li = createRoleListItem(window.document, item, url, '', {}, (sender, data) => {});
```

---

### WR-03: `sendSwitchRole` rejection is unhandled — popup silently freezes with the role link permanently disabled

**File:** `src/js/popup.js:218, 314-333`
**Issue:** `sendSwitchRole` is an `async` function called without `await` or `.catch()` at line 218:

```js
sender.style.fontWeight = 'bold';
sender.onclick = null;          // ← link disabled before the call
sendSwitchRole(tabId, data);    // ← no await, no .catch()
```

Inside `sendSwitchRole`, line 315 unconditionally destructures the response:

```js
const { prism, url, signinHost } = await executeAction(tabId, 'switch', data);
```

`brw.tabs.sendMessage` resolves to `undefined` if the content script does not respond (tab navigated away, content script not injected). Destructuring `undefined` throws `TypeError: Cannot destructure property 'prism' of undefined`. Because the promise is not handled at the call site, the error is swallowed silently. `sender.onclick` was already nulled, so the user cannot retry. The popup shows no error message.

**Fix:**

```js
// At call site — add .catch() to surface error and re-enable the link
sendSwitchRole(tabId, data).catch(err => {
  sender.style.fontWeight = '';
  sender.onclick = listItemOnSelect;
  showError(`Switch failed: ${err.message}`);
});

// In sendSwitchRole — guard the destructure
const response = await executeAction(tabId, 'switch', data);
if (!response) {
  throw new Error('No response from AWS console tab. Reload the tab and try again.');
}
const { prism, url, signinHost } = response;
```

---

### WR-04: Stray `</head>` closing tag after `</body>` — malformed HTML document

**File:** `src/popup.html:49`
**Issue:** The `<head>` is correctly closed at line 10. A second `</head>` tag appears at line 49, _after_ `</body>`:

```html
</body>
</head>   ← line 49
</html>
```

Browsers parse this leniently and the popup renders, but the document is structurally invalid. Any HTML tooling, linter, or future template processor will reject or mishandle it.

**Fix:** Delete line 49 (`</head>`).

---

### WR-05: Inline `style="text-decoration: none"` on `#openSupportMe` violates the project CSS constraint

**File:** `src/popup.html:40`
**Issue:** `CLAUDE.md` requires: "keep styles in bundled/static CSS files; no policy-violating inline-style injection." The `#openSupportMe` anchor carries a presentational inline style that belongs in `popup.css`:

```html
<a href="#" id="openSupportMe" style="text-decoration: none">support me</a>
```

The `display: none` attributes on `#main`, `#noMain`, `#supportComment`, and `#goldenkey` serve as JS-toggled initial state and are a common accepted exception; this one is purely decorative.

**Fix:** Remove the inline attribute and add a CSS rule:

```css
/* popup.css */
#openSupportMe {
    text-decoration: none;
}
#openSupportMe:hover {
    text-decoration: underline;
}
```

---

## Info

### IN-01: Custom listbox keyboard pattern has no ARIA — screen readers cannot track highlighted option

**File:** `src/js/popup.js:230-311`, `src/popup.html:18-21`
**Issue:** `setupRoleFilter` implements a custom combobox/listbox pattern (ArrowUp/Down to move highlight, Enter to activate). The input has no `role="combobox"`, the `#roleList` has no `role="listbox"`, list items have no `role="option"` or `aria-selected`, and the input has no `aria-activedescendant` pointing to the highlighted item. Screen readers receive no announcement when selection changes. `CLAUDE.md` requires WCAG 2.1 AA on new/changed UI surfaces; this is the primary redesigned surface. The pattern is pre-existing but the phase explicitly redesigns the popup.

**Suggested fix:**
- Add `role="combobox" aria-expanded="true" aria-haspopup="listbox" aria-autocomplete="list" aria-controls="roleList"` to `#roleFilter`.
- Add `role="listbox"` to `#roleList`.
- In `createRoleListItem`, add `role="option" aria-selected="false"` to the `<li>` and a stable `id` attribute (e.g. `aesr-role-<index>`).
- In `updateSelection`, set `aria-selected="true"` on the selected item and update `aria-activedescendant` on the input.

---

### IN-02: Error message grammar — incomplete clause and invisible newline in Config Hub error

**File:** `src/js/popup.js:181`
**Issue:** The error string ends with an incomplete subordinating clause and uses `\n` in a context where it renders as nothing (the `aesr-alert__body` element has no `white-space: pre-wrap`):

```js
showError(`Failed to connect to AESR Config Hub because.\n${err.message}`);
```

The rendered text is "Failed to connect to AESR Config Hub because. Some error" — no line break, dangling "because.".

**Fix:**

```js
showError(`Failed to connect to AESR Config Hub: ${err.message}`);
```

---

### IN-03: `createDisplayName` can produce negative `substring` index — silent empty profile name

**File:** `src/js/lib/create_role_list_item.js:94`
**Issue:** The truncation logic:

```js
displayName = displayName.substring(0,
  displayName.length - (totalLength - maxLength) - overflow.length) + overflow;
```

If `profile` is shorter than the characters that need to be removed (e.g. `profile = 'a'`, accountId = 60 chars: `totalLength = 66`, `trimTo = 1 - (66-64) - 1 = -2`), `String.prototype.substring` clamps negative indices to 0 and returns `''`. The display name becomes `"…  |  <60-char-id>"` — the profile name is silently erased. AWS account IDs are always 12 digits so this cannot occur with real data, but the logic has no guard.

**Fix:**

```js
if (totalLength > maxLength) {
  const trimTo = Math.max(0,
    displayName.length - (totalLength - maxLength) - overflow.length);
  displayName = displayName.substring(0, trimTo) + overflow;
}
```

---

### IN-04: `<html>` element has no `lang` attribute — WCAG 2.1 SC 3.1.1 (Level A)

**File:** `src/popup.html:2`
**Issue:** WCAG 2.1 SC 3.1.1 (Level A, required by AA) mandates a language declaration on the root element. Screen readers and browser translation tools use this to select the correct language profile. The `<html>` tag carries no `lang` attribute.

**Fix:**

```html
<html lang="en">
```

---

_Reviewed: 2026-05-28_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
