---
phase: 1
slug: design-system-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-27
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from `01-RESEARCH.md` § Validation Architecture and ROADMAP Success Criteria SC1–SC5.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright 1.58.2 (emulator/integration) + Mocha 11.7.5 (unit) |
| **Config file** | `playwright.config.ts` |
| **Quick run command** | `npm run test_emulator -- test/emulator/foundation.spec.js` |
| **Full suite command** | `npm run test_emulator` |
| **Estimated runtime** | ~30–60 seconds (emulator suite) |

---

## Sampling Rate

- **After every task commit:** Run `npm run test_emulator -- test/emulator/foundation.spec.js`
- **After every plan wave:** Run `npm run test_emulator` (full emulator suite)
- **Before `/gsd-verify-work`:** Full emulator suite green + existing specs green (or updated in-PR per D-02)
- **Max feedback latency:** ~60 seconds

---

## Per-Task Verification Map

> Task IDs are assigned during planning. This row template is populated by the planner / `/gsd-validate-phase` once `*-PLAN.md` tasks exist. The requirement→behavior→command mapping below is locked from research.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | 0 | THM-03 | T-1-03 | `theme-init.js` external src only; no `'unsafe-inline'` added | integration | `npm run test_emulator -- test/emulator/foundation.spec.js` | ❌ W0 | ⬜ pending |
| TBD | TBD | — | FND-01 | — | N/A | integration | `npm run test_emulator -- test/emulator/foundation.spec.js` | ❌ W0 | ⬜ pending |
| TBD | TBD | — | FND-02 | — | No `@cloudscape-design/*` resolved at runtime | audit | `ls node_modules \| grep cloudscape` (zero results) | N/A | ⬜ pending |
| TBD | TBD | — | FND-03 | — | N/A | smoke | `ls dist/chrome/css dist/firefox/css dist/chrome/js/theme-init.js dist/firefox/js/theme-init.js` | ❌ W0 | ⬜ pending |
| TBD | TBD | — | FND-04 | — | No external webfont link/CDN | audit | grep `@font-face` / external font `<link>` in CSS output (zero) | N/A | ⬜ pending |
| TBD | TBD | — | THM-05 | — | N/A | integration | `npm run test_emulator -- test/emulator/foundation.spec.js` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

### Requirement → Behavior assertions (locked from research)

- **FND-01 (SC1):** Token computed-style differs between `data-theme="light"` and `data-theme="dark"` on `<html>`; component shells render correctly in both themes (computed-style, not pixel snapshot).
- **FND-02:** No `@cloudscape-design/*` package resolved in `node_modules`.
- **FND-03 (SC5):** Build emits `dist/<brw>/css/*.css` and `dist/<brw>/js/theme-init.js` in both browser dirs.
- **FND-04:** No webfont `@font-face` or `<link>` to an external font CDN (system font stack only).
- **THM-03 (SC3):** `data-theme` present on `<html>` before stylesheet-dependent paint (no FOUC); zero console CSP violations on page load (no inline script, no CSP relaxation).
- **THM-05 (SC4):** `color-scheme` computed value matches active theme on `:root`.

---

## Wave 0 Requirements

- [ ] `test/preview/index.html` — preview/gallery page with full component-shell set (both themes); Playwright navigation target for SC1/SC2/SC3
- [ ] `test/emulator/foundation.spec.js` — SC1 token flip, SC2 shell render, SC3 CSP/FOUC checks, THM-05 `color-scheme`; reuses existing `fixtures.js` patterns
- [ ] Audit existing `options.spec.js` / `supporters.spec.js` for body-font/margin assertions and update in-PR (per D-02 reset bleed — expected delta, not a regression)

*Playwright + Mocha already installed — no framework install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Firefox / Edge visual parity | THM-05 (cross-browser) | Phase 1 Playwright harness is Chrome-only; full cross-browser parity is owned by Phase 5 SC4 | Load all 5 pages in Firefox + Edge, toggle theme, confirm native controls/scrollbars follow theme and no FOUC |
| FND-02 / FND-04 source audits | FND-02, FND-04 | Absence-of-dependency / absence-of-webfont is an audit, not a behavior | `ls node_modules \| grep cloudscape` → empty; grep CSS output for `@font-face` and external font `<link>` → empty |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (`foundation.spec.js`, `test/preview/index.html`)
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
