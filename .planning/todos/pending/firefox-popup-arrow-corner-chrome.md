---
id: firefox-popup-arrow-corner-chrome
type: todo
status: pending
priority: low
created: 2026-05-29
area: theming / cross-browser
related_phase: 04-theme-toggle-per-profile-color
surfaced_in: 05-02 cross-browser smoke
---

# Firefox popup arrow + corner color follow theme/OS chrome, not extension CSS

## Observation (Phase 5 cross-browser smoke, 2026-05-29)
On Firefox/macOS with a **custom Firefox theme** (pink/mauve toolbar), the popup's
panel **arrow** and outer **rounded corners** render in the browser/theme chrome color,
not the dark extension background — a visible mismatch against the dark popup body.

## Why it's not a simple extension-CSS fix
- Firefox extends the popup `<body>` background to the arrow since FF51 (bug 1293099),
  but an **active Firefox theme paints the panel chrome (arrow) ahead of that**, and
  **macOS draws the rounded-corner panel frame natively**. Both override extension CSS.
- Likely also interacts with first-paint theme sampling: the popup theme is applied via
  `theme-init.js` (sync, localStorage) + `popup.js` (async, chrome.storage). If first
  paint isn't dark, Firefox samples a light arrow/corner before the dark theme lands.
- Chrome/Edge popups have **no arrow** and rendered cleanly — this affects only
  Firefox-with-a-custom-theme, a small user slice.

## Decision (user, 2026-05-29)
Accepted as a **known cosmetic limitation** for the v1.0 release. NOT a release blocker.

## If revisited (Phase 4 theming territory)
- Verify whether guaranteeing a synchronous dark first-paint (localStorage always
  populated before popup open) makes Firefox sample the arrow correctly on the DEFAULT
  Firefox theme.
- Confirm the residual mismatch only persists under a custom Firefox theme (expected
  to be unfixable from extension CSS).
- Test matrix: Firefox default theme vs custom theme × OS-dark vs explicit-dark.
