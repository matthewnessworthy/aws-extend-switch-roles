---
phase: 3
slug: options-auxiliary-surfaces
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-28
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Mocha 11.7.5 (unit) + Playwright 1.58.2 (emulator) |
| **Config file** | `playwright.config.ts` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm run test_emulator` |
| **Estimated runtime** | ~30s (unit) / ~120s (emulator) |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm run test_emulator`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | THM-01 | — | N/A | manual + unit | `npm test` | ✅ W0 token fix | ⬜ pending |
| 03-02-01 | 02 | 2 | OPT-01, OPT-02, OPT-03 | — | N/A | integration | `npm run test_emulator -- test/emulator/options.spec.js` | ✅ exists | ⬜ pending |
| 03-02-02 | 02 | 2 | OPT-04 | — | N/A | integration | `npm run test_emulator -- test/emulator/options.spec.js` | ✅ exists | ⬜ pending |
| 03-02-03 | 02 | 2 | OPT-05 | — | N/A | integration | `npm run test_emulator -- test/emulator/options.spec.js` | ✅ exists | ⬜ pending |
| 03-02-04 | 02 | 2 | OPT-06, OPT-07 | — | N/A | integration | `npm run test_emulator -- test/emulator/options.spec.js` | ✅ exists | ⬜ pending |
| 03-03-01 | 03 | 2 | AUX-01 | — | N/A | integration | `npm run test_emulator -- test/emulator/supporters.spec.js` | ✅ exists | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/css/tokens.css` — add `--color-bg-button-primary-hover` to Layer 2 and Layer 3a dark blocks (suggested value: `#1a73e8`); required before any primary button CSS lands in this phase

*All other test infrastructure already exists from Phase 1/2.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| All 5 pages render correctly in both themes | THM-01 | Playwright is Chrome-only; no visual regression tool | Open each page in devtools, toggle `data-theme="dark"` on `<html>`, verify correct token-driven appearance |
| `#msgSpan` / `#remoteMsgSpan` alert styling | OPT-04 | Alert display state varies; automated tests check IDs not visual presentation | Trigger a save error and a successful save; verify alert renders as Cloudscape-style block with icon |
| Color picker theme-awareness | OPT-06 | Visual swatch rendering; no automated color contrast assertion | Open options in dark theme, open color picker; verify swatch border/fill is legible |
| Firefox tab-grouping control disabled | OPT-07 | FF emulation not in Playwright suite | Open options in Firefox; verify tab-grouping section is disabled/hidden |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
