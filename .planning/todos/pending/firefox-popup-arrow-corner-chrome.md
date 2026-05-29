---
id: zen-browser-popup-corner-overlay
type: todo
status: wont-fix-extension-side
priority: low
created: 2026-05-29
updated: 2026-05-29
area: cross-browser / browser-chrome
related_phase: 05-accessibility-cross-browser-release-audit
surfaced_in: 05-02 cross-browser smoke
---

# Popup arrow/corner "broken" look is Zen Browser chrome, NOT extension-fixable

## Final diagnosis (corrected 2026-05-29)
The reporter is on **Zen Browser** (a Firefox fork), **default Zen theme** — NOT a custom
Firefox theme (an earlier guess, now disproven). Zen applies its own **rounded-corner
overlay** to the browser viewport and panels, including extension popups. The popup's
arrow + corner mismatch is Zen's overlay drawn OVER the panel, in browser chrome that
extension CSS cannot reach.

Evidence:
- Reproduced on Zen's DEFAULT theme (rules out a user theme).
- Two extension-side CSS attempts had ZERO effect: (1) `html,body { background }` fill,
  (2) `html,body { border:0; border-radius:0 }`. Both reverted.
- Zen's own issue tracker documents this corner-overlay behavior:
  zen-browser/desktop #497 (Corners CSS overlay), #2512 (Annoying border radius effect),
  #1404 (Remove the corners of the browser).
- Firefox bugs 1280128/1293099 (popup bg → corners/arrow) are FIXED on stock Firefox;
  Chrome/Edge popups have no arrow. Renders clean on all mainstream browsers.

## Why it is not extension-fixable
The popup HTML renders INSIDE a browser panel. The panel arrow/corner/border is browser
chrome (Zen's overlay). Extension CSS styles only the content inside the panel; it cannot
set the browser-chrome corner variables. There is no WebExtension API for the popup panel.

## Decision (user, 2026-05-29)
Accepted as a **Zen-specific cosmetic limitation** for the v1.0 release. NOT a release
blocker. Affects only Zen Browser users.

## The only lever (browser-side, NOT shippable)
Zen users can adjust corner radius via Zen settings / Zen Mods / `userChrome.css`
(overriding Zen's `--zen-*` corner radius variables). This is the user's browser config,
not something the extension can ship.
