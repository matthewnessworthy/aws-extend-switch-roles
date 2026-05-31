# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v6.3.0 — UI Modernization

**Shipped:** 2026-05-31
**Phases:** 5 | **Plans:** 17 | **Tasks:** 21

### What Was Built
- Cloudscape-derived hand-written CSS design system (6 files: `tokens.css`, `base.css`, `components.css`, `popup.css`, `options.css`, `pages.css`) with full light + dark themes — zero new runtime deps, no `@cloudscape-design/*`, no framework, system font stack.
- Pre-paint non-module `theme-init.js` that eliminates FOUC across all 5 pages via synchronous `localStorage` read + `data-theme` on `<html>`.
- Live theme toggle (3-state: default/light/dark) preserved on the existing `chrome.storage.sync['visualMode']` key with cross-tab live update via `storage.onChanged`.
- Per-profile color reconciled with dark mode via Option E (theme-aware contrast border around the stored hex fill — no color math, no data mutation).
- WCAG 2.1 AA pass across all surfaces in both themes, verified by axe-core Playwright spec + manual Firefox/Edge cross-browser smoke; cross-store release prep (Chrome/Firefox/Edge) + AMO reproducible-build source zip.

### What Worked
- **Horizontal-layer roadmap.** Foundation (tokens + theming engine + build) was the explicit gate every surface inherited; surfaces applied one-at-a-time after the foundation locked; theme toggle wiring + color reconciliation after surfaces existed; a11y/cross-browser as a final dedicated audit phase. Kept the design system *one* shared system rather than five almost-shared ones.
- **Cross-cutting visual rule decided once, shared by two phases.** Per-profile `color` × dark-mode (POP-06 + OPT-06) was deliberately decided in the UI-phase before Phase 2 planning. Option E (contrast border) had zero color math, zero data mutation, and dodged the Firefox-113 `color-mix()` floor that competing options needed.
- **axe-core devDep added late in Phase 5 caught 5 a11y issues that manual review missed.** Automating the audit beat human review on items where humans had already signed off.
- **Pre-paint `theme-init.js` as external non-module script** kept CSP intact, avoided permission/host diff, and eliminated the FOUC bug that informed the gate.

### What Was Inefficient
- **Per-phase verification "human_needed" sign-offs went unrecorded.** Phases 2 & 3 both scored 5/5 automated truths but the visual human-verify items were never marked done in their own VERIFICATION files. The Phase 5 audit re-verified them at the milestone level, which made the per-phase records moot — but the bookkeeping gap surfaced at milestone-close audit as 5 items that had to be acknowledged. Either clear per-phase human-verify items in-flight, or name the milestone-audit-as-source-of-truth pattern explicitly so close doesn't re-litigate them.
- **REQUIREMENTS.md traceability lagged through Phases 1 & 2.** 12 of 28 v1 requirements stayed marked "Pending" all the way to milestone close, even though the phases shipped. Marking them at phase-summary time would have removed the close-time reconciliation step.
- **Release artifacts built at 6.2.1 before milestone-close version bump.** Phase 5 produced dist/, store zips, and the AMO source zip before the v6.3.0 manifest bump. A real publish requires a rebuild. Bump first / build second would have avoided the rework.

### Patterns Established
- **3-layer token cascade**: `:root` (light) → `@media(prefers-color-scheme: dark) :root` (OS dark) → `:root[data-theme]` (manual override). Manual override wins; OS preference is the fallback when no manual choice.
- **Pre-paint, non-module init script as the first child of `<head>`** for any state that must be applied before first paint (theme, color-scheme).
- **`src/css/` shipped as static copy via `bin/build.sh` (not Rollup-bundled)** — keeps CSS out of the JS module graph, simplifies CSP, and matches how `theme-init.js` is shipped.
- **One shared swatch/border rule** for per-profile color across all surfaces, decided once in the UI-phase, applied uniformly. Beats per-surface re-litigation.

### Key Lessons
1. **Decide cross-cutting visual rules once, before the first dependent phase plans.** The per-profile color × dark-mode rule was shared by POP-06 and OPT-06; deciding it in the UI-phase prevented two phases from picking different rules.
2. **Visual subsumption should be named, not implicit.** If a milestone-level audit subsumes per-phase human-verify items, document the subsumption pattern explicitly so the milestone-close audit doesn't re-surface them as gaps.
3. **Live-state trumps memory for tooling assumptions.** Memory said `.planning/` was force-tracked behind a global gitignore and `STATE.md` was local-only; live `git ls-files`/`git check-ignore` showed `.planning/` fully tracked with no ignore in this repo. Always verify live state before choosing a commit method.
4. **Bump version before building release artifacts, not after.** Phase 5 built at 6.2.1; the v6.3.0 close means a rebuild is required for actual publish.

### Cost Observations
- Model mix: not tracked
- Date span: 2026-05-27 → 2026-05-31 (5 calendar days)
- Notable: Phase 1 (foundation, 5 plans) was the largest single phase; surface phases (2–4) were smaller because the foundation absorbed the design-system work upfront.

---

## Cross-Milestone Trends

*(First milestone — cross-milestone trends will populate after subsequent milestones.)*
