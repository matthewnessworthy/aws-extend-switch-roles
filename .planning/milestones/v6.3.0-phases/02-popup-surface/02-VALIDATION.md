---
phase: 2
slug: popup-surface
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-28
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Mocha 11.7.5 (unit) + Playwright 1.58.2 (emulator) |
| **Config file** | `playwright.config.ts` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm run test_emulator` |
| **Estimated runtime** | ~10s (unit) / ~60s (emulator) |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm run test_emulator`
- **Before `/gsd-verify-work`:** Both suites must be green (33+ unit, 19+ emulator)
- **Max feedback latency:** ~10 seconds (unit)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-?-01 | TBD | 1 | POP-05 | — | N/A | unit | `npm test` | ✅ (update required) | ⬜ pending |
| 02-?-02 | TBD | 1 | POP-01 | — | N/A | unit | `npm test` | ✅ (update required) | ⬜ pending |
| 02-?-03 | TBD | 2 | POP-01/POP-03 | — | N/A | integration | `npm run test_emulator` | ✅ exists | ⬜ pending |
| 02-?-04 | TBD | 2 | POP-02/POP-04 | — | N/A | manual | see Manual Verifications | ❌ Wave 0 gap | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/js/lib/create_role_list_item.test.js` — update 5 `innerHTML` assertions for two-line DOM structure (D-02). **Required; `npm test` fails otherwise.**
- [ ] (Optional) `test/emulator/popup_states.spec.js` — new spec for empty/loading/error states (D-05/D-06/D-07). Not required for Phase 2 gate.

*Existing infrastructure covers all other phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Empty state: "not on AWS console page" renders with guidance | POP-02 | No automated popup HTML rendering outside extension | Open popup from non-AWS tab; verify `.aesr-empty-state` with correct copy |
| Empty state: "on AWS page but no matching roles" renders | POP-02 | No automated popup HTML rendering outside extension | Open popup on AWS page with no configured roles; verify no-match state |
| Loading state renders while roles resolve | POP-02 | Async timing hard to test in jsdom | Open popup on AWS page; observe spinner before role list appears |
| Color swatch AA contrast in light theme | POP-04 | Requires visual inspection | Open popup in light mode; verify swatch color passes WCAG AA (4.5:1) |
| Color swatch AA contrast in dark theme | POP-04 | Requires visual inspection | Open popup in dark mode; verify swatch color passes WCAG AA |
| Focus-visible indicators in dark theme | POP-03 | Playwright emulator may not cover dark mode | Tab through popup in dark mode; verify `:focus-visible` ring is visible |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (`create_role_list_item.test.js` updated)
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s (unit suite)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
