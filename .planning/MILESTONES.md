# Milestones

## v6.3.0 UI Modernization (Shipped: 2026-05-31)

**Phases completed:** 5 phases, 17 plans, 21 tasks

**Known deferred items at close:** 5 (see STATE.md Deferred Items) — all bookkeeping artifacts (stale per-phase visual sign-offs re-verified by Phase 5, one missing SUMMARY.md on a complete quick task, one non-fixable Zen Browser chrome todo).

**Key accomplishments:**

- Playwright preview page + MV3-compliant toggle wiring + 5-case foundation spec covering SC1/SC2/SC3-CSP/SC3-FOUC/THM-05 (RED until Wave 1 CSS lands)
- 3-layer Cloudscape Visual Refresh token cascade in tokens.css + synchronous localStorage-based pre-paint theme setter in theme-init.js
- Additive <head> wiring on all 5 production HTML pages: theme-init.js as first child + 3 CSS links in order; D-02 spec audit confirmed no sensitive assertions in existing specs
- Production and test builds now emit src/css/ and theme-init.js (verbatim) to dist/ and test/extension/ respectively, with test/preview/ served via chrome-extension:// for Playwright
- DOM restructure replacing flat text node + suffixAccountId span with .aesr-role-item-text wrapper containing .aesr-role-item__name and .aesr-role-item__account spans; 5 innerHTML assertions updated; 33/33 unit tests passing
- Named-export `applyTheme`/`installVisualModeListener` module with `removeAttribute`-on-default behavior, 6 jsdom unit tests, and 4 Playwright integration tests (Test 1 passing; Tests 2-4 RED pending Plan 02 wiring).
- Three-line write-through (localStorage + applyTheme) in the radio onchange handler plus a post-load reconcile block and storage.onChanged listener registration in options.js — makes the theme toggle live without reload.
- popup.js wired with `installVisualModeListener()` and post-load reconcile of localStorage cache vs `chrome.storage.sync['visualMode']`; per-profile color swatches verified in both themes.
- Closed 6 ARIA label/alt gaps and raised two failing contrast values (dark input border `#656871`→`#6e6e7a`, default swatch fill `#aaaaaa`→`#767676`) to WCAG AA; unit suite green; chose to add axe-core devDep for Plan 02.
- Added an automated axe-core WCAG 2.1 AA emulator spec that caught 5 a11y gaps the manual audit missed (all fixed); confirmed cross-browser parity on Chrome/Edge/Firefox with 4 smoke-driven polish fixes.
- Rebuilt dist/ with all 6 CSS files in both targets, produced size-checked store zips, verified the manifest is byte-identical to v6.2.1 (zero permission/host diff), and prepared BUILD.md + the AMO source zip; user gave release sign-off.

---
